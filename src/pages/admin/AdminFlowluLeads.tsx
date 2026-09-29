import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, RefreshCw, Search, Send, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export const FLOWLU_BASE = 'https://fastmedia.flowlu.com/crm/lead/view/';

export interface FlowluLead {
  id: number; name: string | null; contact_name: string | null; contact_email: string | null;
  contact_phone: string | null; contact_company: string | null; budget: number | null;
  flowlu_created_at: string | null; first_seen_at: string; score: number; priority: string;
  score_reasons: string[]; raw: Record<string, any>;
}

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('flowlu-admin', { body });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data as any;
}

export const priorityClass = (p: string) =>
  p === 'high' ? 'bg-destructive/15 text-destructive' : p === 'medium' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground';

export const isNewLead = (l: Pick<FlowluLead, 'flowlu_created_at' | 'first_seen_at'>) =>
  Date.now() - new Date(l.flowlu_created_at ?? l.first_seen_at).getTime() < 7 * 86400000;

export function useFlowluLeads() {
  return useQuery({
    queryKey: ['flowlu_leads_db'],
    queryFn: async () => {
      const out: FlowluLead[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from('flowlu_leads' as never).select('*').order('score', { ascending: false }).order('id', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        out.push(...((data ?? []) as unknown as FlowluLead[]));
        if (!data || data.length < 1000) break;
      }
      return out;
    },
    refetchInterval: 60_000,
  });
}

const label = (k: string) => k.replace(/^cf_/, 'Custom: ').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const isEmpty = (v: unknown) => v === null || v === undefined || v === '' || v === '0' || String(v).startsWith('0000-00-00') || (Array.isArray(v) && v.length === 0);

function ReplyEditor({ lead }: { lead: FlowluLead }) {
  const { toast } = useToast();
  const [to, setTo] = useState(lead.contact_email ?? '');
  const [subject, setSubject] = useState(`Re: ${lead.contact_company || lead.name || 'your website'}`);
  const [body, setBody] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: history = [], refetch } = useQuery({
    queryKey: ['flowlu_replies', lead.id],
    queryFn: async () => ((await supabase.from('flowlu_lead_replies' as never).select('*').eq('flowlu_lead_id', lead.id).order('created_at', { ascending: false })).data ?? []) as any[],
  });

  useEffect(() => {
    const d = history.find((h) => h.status === 'draft');
    if (d && !draftId) { setDraftId(d.id); setTo(d.to_email); setSubject(d.subject); setBody(d.body); }
  }, [history, draftId]);

  const saveDraft = async () => {
    const row = { flowlu_lead_id: lead.id, to_email: to, subject, body, status: 'draft' };
    const res = draftId
      ? await supabase.from('flowlu_lead_replies' as never).update(row as never).eq('id', draftId).select('id').single()
      : await supabase.from('flowlu_lead_replies' as never).insert(row as never).select('id').single();
    if (res.error) return toast({ title: 'Could not save draft', description: res.error.message, variant: 'destructive' });
    setDraftId((res.data as any).id); refetch(); toast({ title: 'Draft saved' });
  };

  const send = async () => {
    if (!confirm(`Send this email to ${to}?`)) return;
    setBusy(true);
    try {
      const r = await invoke({ action: 'send_reply', lead_id: lead.id, to, subject, body, reply_id: draftId });
      toast({ title: 'Email sent', description: r.flowlu_logged ? 'A copy was added to this lead in Flowlu.' : `Sent, but not logged in Flowlu: ${r.error ?? ''}` });
      setDraftId(null); setBody(''); refetch();
    } catch (e) {
      toast({ title: 'Email not sent', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="font-semibold">Write a reply</h3>
      <Input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} />
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea rows={8} placeholder="Your message…" value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={saveDraft} disabled={!body}><Save className="w-4 h-4 mr-2" />Save draft</Button>
        <Button onClick={send} disabled={busy || !body || !to || !subject}><Send className="w-4 h-4 mr-2" />{busy ? 'Sending…' : 'Send from timknott@fastmedia.pro'}</Button>
      </div>
      <p className="text-xs text-muted-foreground">Sent from your Google Workspace mailbox. A copy of every sent email is added to this lead's description in Flowlu.</p>
      {history.filter((h) => h.status !== 'draft').map((h) => (
        <div key={h.id} className="text-sm border-t border-border pt-2">
          <Badge className={h.status === 'sent' ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive'}>{h.status}</Badge>
          <span className="ml-2 font-medium">{h.subject}</span>
          <span className="ml-2 text-muted-foreground">→ {h.to_email} · {new Date(h.sent_at ?? h.created_at).toLocaleString('en-GB')}{h.flowlu_logged ? ' · logged in Flowlu' : ''}</span>
          {h.error && <div className="text-xs text-destructive">{h.error}</div>}
        </div>
      ))}
    </div>
  );
}

export function FlowluLeadCard({ lead, onClose }: { lead: FlowluLead | null; onClose: () => void }) {
  const entries = lead ? Object.entries(lead.raw ?? {}).filter(([, v]) => !isEmpty(v) && typeof v !== 'object') : [];
  const long = entries.filter(([, v]) => String(v).length > 120);
  const short = entries.filter(([, v]) => String(v).length <= 120);
  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        {lead && <>
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {lead.name ?? `Flowlu lead #${lead.id}`}
              <Badge variant="secondary">#{lead.id}</Badge>
              <Badge className={priorityClass(lead.priority)}>{lead.priority} · {lead.score}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <Button asChild size="sm" variant="outline">
              <a href={FLOWLU_BASE + lead.id} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Open in Flowlu</a>
            </Button>
            {lead.score_reasons?.length > 0 && (
              <div className="text-sm"><span className="font-semibold">Why this score: </span>{lead.score_reasons.join(' · ')}</div>
            )}
            <ReplyEditor lead={lead} />
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {short.map(([k, v]) => (
                <div key={k} className="border-b border-border/50 pb-1">
                  <dt className="text-xs text-muted-foreground">{label(k)}</dt>
                  <dd className="text-foreground break-words">{String(v)}</dd>
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
        </>}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFlowluLeads() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [prio, setPrio] = useState<'all' | 'high' | 'medium' | 'low' | 'new'>('all');
  const [open, setOpen] = useState<FlowluLead | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { data = [], isLoading, error } = useFlowluLeads();

  const newCount = data.filter(isNewLead).length;
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter((l) =>
      (prio === 'all' || (prio === 'new' ? isNewLead(l) : l.priority === prio)) &&
      (!s || [l.id, l.name, l.contact_name, l.contact_email, l.contact_company, l.contact_phone].join(' ').toLowerCase().includes(s)));
  }, [data, q, prio]);

  const sync = async () => {
    setSyncing(true);
    try {
      const r = await invoke({ action: 'pull_leads' });
      toast({ title: 'Flowlu synced', description: `${r.total} leads, ${r.new} new` });
      qc.invalidateQueries({ queryKey: ['flowlu_leads_db'] });
    } catch (e) { toast({ title: 'Sync failed', description: (e as Error).message, variant: 'destructive' }); }
    finally { setSyncing(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Flowlu leads</h1>
          <p className="text-muted-foreground text-sm">Every opportunity in Flowlu, synced each morning. Best leads first — click a row to open its card and reply.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/15 text-primary text-sm">{newCount} new this week</Badge>
          <Button variant="outline" onClick={sync} disabled={syncing}><RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />Sync now</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, contact, email, #id…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {(['all', 'new', 'high', 'medium', 'low'] as const).map((p) => (
          <Button key={p} size="sm" variant={prio === p ? 'default' : 'outline'} onClick={() => setPrio(p)} className="capitalize">{p === 'new' ? 'New this week' : p}</Button>
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}

      <Card className="shadow-card"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground border-b border-border">
            <tr><th className="p-3">Priority</th><th className="p-3">#</th><th className="p-3">Lead</th><th className="p-3">Contact</th><th className="p-3">Budget</th><th className="p-3">Created</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {filtered.slice(0, 300).map((l) => (
              <tr key={l.id} onClick={() => setOpen(l)} className="border-b border-border/50 hover:bg-muted/40 cursor-pointer">
                <td className="p-3"><Badge className={priorityClass(l.priority)}>{l.priority} · {l.score}</Badge></td>
                <td className="p-3 text-muted-foreground">{l.id}{isNewLead(l) && <Badge variant="secondary" className="ml-2">new</Badge>}</td>
                <td className="p-3 font-medium text-foreground">{l.name || '—'}</td>
                <td className="p-3"><div>{l.contact_name || l.contact_company || '—'}</div><div className="text-xs text-muted-foreground">{l.contact_email || l.contact_phone || ''}</div></td>
                <td className="p-3">{l.budget ? Number(l.budget).toLocaleString('en-GB') : '—'}</td>
                <td className="p-3 text-muted-foreground">{l.flowlu_created_at ? new Date(l.flowlu_created_at).toLocaleDateString('en-GB') : '—'}</td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No Flowlu leads match.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      <p className="text-xs text-muted-foreground">Showing {Math.min(300, filtered.length)} of {filtered.length} ({data.length} in total).</p>

      <FlowluLeadCard lead={open} onClose={() => setOpen(null)} />
    </div>
  );
}
