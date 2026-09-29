import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Search, Send, Target, Inbox, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useFlowluLeads, FlowluLeadCard, priorityClass, isNewLead, type FlowluLead } from './AdminFlowluLeads';

interface Row {
  id: string;
  kind: 'discovered' | 'enquiry';
  name: string;
  email: string | null;
  website: string | null;
  source: string;
  status: string;
  score: number | null;
  created_at: string;
  flowluId: string | null;
}

const FLOWLU_BASE = 'https://fastmedia.flowlu.com/crm/lead/view/';

const AdminLeadsHub = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const { data: fl = [] } = useFlowluLeads();
  const [openFl, setOpenFl] = useState<FlowluLead | null>(null);
  const [filter, setFilter] = useState<'all' | 'discovered' | 'enquiry'>('all');

  useEffect(() => {
    (async () => {
      const [pRes, lRes, fRes] = await Promise.all([
        supabase.from('prospects').select('id,company,email,website,source,status,fit_score,created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('flowlu_sync_log').select('entity_id,flowlu_id,status').eq('entity_type', 'prospect').eq('status', 'synced'),
      ]);
      const fmap = new Map<string, string>();
      (fRes.data ?? []).forEach((f: any) => f.flowlu_id && fmap.set(f.entity_id, String(f.flowlu_id)));
      const prospects: Row[] = (pRes.data ?? []).map((p: any) => ({
        id: p.id, kind: 'discovered', name: p.company, email: p.email, website: p.website,
        source: p.source, status: p.status, score: p.fit_score, created_at: p.created_at, flowluId: fmap.get(p.id) ?? null,
      }));
      const leads: Row[] = (lRes.data ?? []).map((l: any) => ({
        id: l.id, kind: 'enquiry', name: l.name || l.company || l.email || 'Website enquiry', email: l.email ?? null,
        website: null, source: l.source || 'website', status: l.classification || l.status || 'new',
        score: l.score ?? l.lead_score ?? null, created_at: l.created_at, flowluId: null,
      }));
      setRows([...prospects, ...leads].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter(r =>
    (filter === 'all' || r.kind === filter) &&
    (!q || `${r.name} ${r.email ?? ''} ${r.website ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, q, filter]);

  const discovered = rows.filter(r => r.kind === 'discovered');
  const stats = [
    { label: 'Discovered leads', value: discovered.length, icon: Target },
    { label: 'Sent to Flowlu', value: discovered.filter(r => r.flowluId).length, icon: CheckCircle2 },
    { label: 'Awaiting approval', value: discovered.filter(r => !['approved', 'sent', 'replied', 'suppressed'].includes(r.status)).length, icon: Clock },
    { label: 'Website enquiries', value: rows.length - discovered.length, icon: Inbox },
    { label: 'New Flowlu leads (7 days)', value: fl.filter(isNewLead).length, icon: Target },
    { label: 'High-priority Flowlu leads', value: fl.filter(l => l.priority === 'high').length, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leads hub</h1>
          <p className="text-muted-foreground text-sm">Every lead in one place — discovered businesses and website enquiries.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/admin/flowlu-leads"><ExternalLink className="w-4 h-4 mr-2" />All Flowlu leads</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/prospecting"><Send className="w-4 h-4 mr-2" />Prospecting desk</Link></Button>
          <Button asChild><Link to="/admin/prospecting?find=1"><Search className="w-4 h-4 mr-2" />Find more leads</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="shadow-card"><CardContent className="p-5 flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-3xl font-display font-bold">{loading ? '…' : s.value}</p></div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon className="w-5 h-5 text-primary" /></div>
          </CardContent></Card>
        ))}
      </div>

      <Card className="shadow-card"><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Top Flowlu leads</h2><Link to="/admin/flowlu-leads" className="text-sm text-primary hover:underline">See all {fl.length}</Link></div>
        <div className="grid gap-2 md:grid-cols-2">
          {fl.slice(0, 8).map(l => (
            <button key={l.id} onClick={() => setOpenFl(l)} className="text-left rounded-md border border-border p-3 hover:bg-muted/40 flex items-center gap-3">
              <Badge className={priorityClass(l.priority)}>{l.priority} · {l.score}</Badge>
              <span className="flex-1 truncate font-medium">{l.contact_company || l.name}</span>
              <span className="text-xs text-muted-foreground">#{l.id}</span>
            </button>
          ))}
        </div>
      </CardContent></Card>
      <FlowluLeadCard lead={openFl} onClose={() => setOpenFl(null)} />

      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search name, email or website…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
        {(['all', 'discovered', 'enquiry'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'discovered' ? 'Discovered' : 'Website enquiries'}
          </Button>
        ))}
      </div>

      <Card className="shadow-card"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b border-border">
            <tr><th className="p-3">Lead</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Score</th><th className="p-3">Added</th><th className="p-3">CRM</th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.kind + r.id} className="border-b border-border/50 hover:bg-muted/40">
                <td className="p-3">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                  {r.website && <a href={r.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{r.website}</a>}
                </td>
                <td className="p-3"><Badge variant={r.kind === 'discovered' ? 'default' : 'secondary'}>{r.kind === 'discovered' ? 'Discovered' : 'Enquiry'}</Badge></td>
                <td className="p-3 capitalize">{r.status.replace(/_/g, ' ')}</td>
                <td className="p-3">{r.score ?? '—'}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                <td className="p-3">
                  {r.flowluId ? (
                    <a href={FLOWLU_BASE + r.flowluId} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">#{r.flowluId}<ExternalLink className="w-3 h-3" /></a>
                  ) : (
                    <Link to={r.kind === 'discovered' ? '/admin/prospecting' : '/admin/leads'} className="text-muted-foreground hover:text-foreground">Open</Link>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No leads match.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
};

export default AdminLeadsHub;
