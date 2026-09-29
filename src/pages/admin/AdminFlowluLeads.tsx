import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, RefreshCw, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const FLOWLU_BASE = 'https://fastmedia.flowlu.com/crm/lead/view/';
type Lead = Record<string, any> & { id: number | string; name?: string };

async function raw(path: string, params: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke('flowlu-admin', { body: { action: 'raw_get', path, params } });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data as any;
}

async function fetchAllLeads(): Promise<Lead[]> {
  const out: Lead[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await raw('module/crm/lead/list', { page: String(page), limit: '100', sort_field: 'id', sort_order: 'DESC' });
    const items: Lead[] = r?.items ?? [];
    out.push(...items);
    const total = Number(r?.total ?? 0);
    if (items.length < 100 || (total && out.length >= total)) break;
  }
  return out;
}

const label = (k: string) => k.replace(/^cf_/, 'Custom: ').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const isEmpty = (v: unknown) => v === null || v === undefined || v === '' || v === '0000-00-00 00:00:00' || (Array.isArray(v) && v.length === 0);

function LeadCard({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['flowlu_lead', id],
    enabled: !!id,
    queryFn: async () => (await raw(`module/crm/lead/get/${id}`)) as Lead,
  });
  const entries = data ? Object.entries(data).filter(([, v]) => !isEmpty(v)) : [];
  const long = entries.filter(([, v]) => typeof v === 'string' && v.length > 120);
  const short = entries.filter(([, v]) => !(typeof v === 'string' && v.length > 120));
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {data?.name ?? `Flowlu lead #${id}`}
            <Badge variant="secondary">#{id}</Badge>
          </DialogTitle>
        </DialogHeader>
        {isLoading && <p className="text-muted-foreground">Loading from Flowlu…</p>}
        {error && <p className="text-destructive">{(error as Error).message}</p>}
        {data && (
          <div className="space-y-5">
            <Button asChild size="sm" variant="outline">
              <a href={FLOWLU_BASE + id} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Open in Flowlu</a>
            </Button>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {short.map(([k, v]) => (
                <div key={k} className="border-b border-border/50 pb-1">
                  <dt className="text-xs text-muted-foreground">{label(k)}</dt>
                  <dd className="text-foreground break-words">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                </div>
              ))}
            </dl>
            {long.map(([k, v]) => (
              <div key={k}>
                <h3 className="text-sm font-semibold mb-1">{label(k)}</h3>
                <div className="whitespace-pre-wrap text-sm rounded-md bg-muted/40 p-3">{String(v).replace(/<[^>]+>/g, '')}</div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFlowluLeads() {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({ queryKey: ['flowlu_leads'], queryFn: fetchAllLeads, staleTime: 60_000 });

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return !s ? data : data.filter((l) =>
      [l.id, l.name, l.contact_name, l.contact_email, l.contact_company, l.contact_phone].join(' ').toLowerCase().includes(s));
  }, [data, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Flowlu leads</h1>
          <p className="text-muted-foreground text-sm">Every opportunity in your Flowlu CRM. Click any row to open its full card.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name, contact, email, #id…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}

      <Card className="shadow-card"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b border-border">
            <tr><th className="p-3">#</th><th className="p-3">Lead</th><th className="p-3">Contact</th><th className="p-3">Budget</th><th className="p-3">Created</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading from Flowlu…</td></tr>}
            {filtered.map((l) => (
              <tr key={l.id} onClick={() => setOpenId(String(l.id))} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer">
                <td className="p-3 text-muted-foreground">{l.id}</td>
                <td className="p-3 font-medium text-foreground">{l.name || '—'}</td>
                <td className="p-3">
                  <div>{l.contact_name || l.contact_company || '—'}</div>
                  <div className="text-xs text-muted-foreground">{l.contact_email || l.contact_phone || ''}</div>
                </td>
                <td className="p-3">{Number(l.budget) ? Number(l.budget).toLocaleString('en-GB') : '—'}</td>
                <td className="p-3 text-muted-foreground">{l.created_date ? new Date(String(l.created_date).replace(' ', 'T')).toLocaleDateString('en-GB') : '—'}</td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No Flowlu leads match.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      <p className="text-xs text-muted-foreground">{data.length} leads loaded from Flowlu.</p>

      <LeadCard id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
