import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFlowluLeads, FlowluLeadCard, priorityClass, invoke, type FlowluLead } from './AdminFlowluLeads';

const STAGES = [
  { id: 'scored', label: 'Scored' },
  { id: 'drafted', label: 'Sequence drafted' },
  { id: 'sent', label: 'Sent' },
  { id: 'replied', label: 'Replied' },
  { id: 'no_reply', label: 'No reply' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
] as const;

interface Step { flowlu_lead_id: number; step: number; status: string; due_at: string }

function nextAction(l: FlowluLead, steps: Step[]): { text: string; due?: Date; overdue: boolean } {
  const stage = l.pipeline_stage ?? 'scored';
  if (stage === 'won' || stage === 'lost') return { text: 'Closed', overdue: false };
  if (stage === 'replied') return { text: 'Reply to their message', overdue: true };
  const pending = steps.filter((s) => s.status === 'draft' || s.status === 'approved').sort((a, b) => a.step - b.step)[0];
  if (pending) {
    const due = new Date(pending.due_at);
    if (pending.status === 'draft') return { text: `Approve step ${pending.step}`, due, overdue: due.getTime() < Date.now() };
    return { text: `Step ${pending.step} sends automatically`, due, overdue: false };
  }
  if (stage === 'no_reply') return { text: 'Call or mark lost', overdue: false };
  if (!l.contact_email) return { text: 'Find an email address', overdue: false };
  if (stage === 'scored') return { text: 'Draft a sequence', overdue: false };
  return { text: 'Wait for reply', overdue: false };
}

export default function AdminPipeline() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useFlowluLeads();
  const { data: steps = [] } = useQuery({
    queryKey: ['flowlu_seq_all'],
    queryFn: async () => ((await supabase.from('flowlu_lead_sequences' as never).select('flowlu_lead_id,step,status,due_at')).data ?? []) as unknown as Step[],
    refetchInterval: 60_000,
  });
  const [prio, setPrio] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<FlowluLead | null>(null);
  const [showAllScored, setShowAllScored] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [drafting, setDrafting] = useState(false);
  const togglePick = (id: number) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const draftPicked = async () => {
    const ids = [...picked];
    setDrafting(true);
    let ok = 0, bad = 0;
    try {
      for (let i = 0; i < ids.length; i += 10) {
        const r = await invoke({ action: 'draft_many', lead_ids: ids.slice(i, i + 10) });
        (r.results ?? []).forEach((x: { ok: boolean }) => (x.ok ? ok++ : bad++));
      }
      toast({ title: `Drafted ${ok} sequence(s)${bad ? `, ${bad} failed` : ''}`, description: 'Open each lead to review, test and approve.' });
      setPicked(new Set());
      qc.invalidateQueries({ queryKey: ['flowlu_leads_db'] }); qc.invalidateQueries({ queryKey: ['flowlu_seq_all'] });
    } catch (e) { toast({ title: 'Drafting failed', description: (e as Error).message, variant: 'destructive' }); }
    finally { setDrafting(false); }
  };

  const byLead = useMemo(() => {
    const m = new Map<number, Step[]>();
    steps.forEach((s) => m.set(s.flowlu_lead_id, [...(m.get(s.flowlu_lead_id) ?? []), s]));
    return m;
  }, [steps]);

  const items = useMemo(() => leads.map((l) => ({ l, next: nextAction(l, byLead.get(l.id) ?? []) })).filter(({ l, next }) =>
    (prio === 'all' || l.priority === prio) && (!overdueOnly || next.overdue) &&
    (!q || `${l.name} ${l.contact_company} ${l.contact_email}`.toLowerCase().includes(q.toLowerCase()))), [leads, byLead, prio, overdueOnly, q]);

  const setStage = async (id: number, stage: string) => {
    try { await invoke({ action: 'set_stage', lead_id: id, stage }); qc.invalidateQueries({ queryKey: ['flowlu_leads_db'] }); toast({ title: 'Stage updated', description: 'Also noted on the lead in Flowlu.' }); }
    catch (e) { toast({ title: 'Could not update', description: (e as Error).message, variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground text-sm">Every Flowlu lead by stage, with emails sent and your next action. Click a lead to draft, approve or reply.</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Input className="max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        {['all', 'high', 'medium', 'low'].map((p) => <Button key={p} size="sm" variant={prio === p ? 'default' : 'outline'} className="capitalize" onClick={() => setPrio(p)}>{p}</Button>)}
        <Button size="sm" variant={overdueOnly ? 'default' : 'outline'} onClick={() => setOverdueOnly(!overdueOnly)}>Needs action now</Button>
        {picked.size > 0 && <Button size="sm" onClick={draftPicked} disabled={drafting}>{drafting ? 'Drafting…' : `Draft sequences for ${picked.size} selected`}</Button>}
      </div>
      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((st) => {
          const col = items.filter(({ l }) => (l.pipeline_stage ?? 'scored') === st.id);
          const shown = st.id === 'scored' && !showAllScored ? col.slice(0, 40) : col;
          return (
            <div key={st.id} className="min-w-[270px] w-[270px] shrink-0 space-y-2">
              <div className="flex items-center justify-between px-1"><h2 className="font-display font-semibold text-sm">{st.label}</h2><Badge variant="secondary">{col.length}</Badge></div>
              {shown.map(({ l, next }) => (
                <Card key={l.id} className="shadow-card cursor-pointer hover:bg-muted/40" onClick={() => setOpen(l)}>
                  <CardContent className="p-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" aria-label="Select lead" className="accent-primary" checked={picked.has(l.id)} onClick={(e) => e.stopPropagation()} onChange={() => togglePick(l.id)} />
                      <Badge className={priorityClass(l.priority)}>{l.priority} · {l.score}</Badge><span className="text-xs text-muted-foreground">#{l.id}</span>
                    </div>
                    <div className="font-medium text-foreground truncate">{l.contact_company || l.name || `Lead #${l.id}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.emails_sent ?? 0} sent{l.last_contact_at ? ` · last ${new Date(l.last_contact_at).toLocaleDateString('en-GB')}` : ''}{l.last_reply_at ? ` · replied ${new Date(l.last_reply_at).toLocaleDateString('en-GB')}` : ''}
                    </div>
                    <div className={`text-xs font-medium ${next.overdue ? 'text-destructive' : 'text-primary'}`}>
                      Next: {next.text}{next.due ? ` — ${next.due.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}` : ''}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select value={l.pipeline_stage ?? 'scored'} onValueChange={(v) => setStage(l.id, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {st.id === 'scored' && col.length > 40 && !showAllScored && <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAllScored(true)}>Show all {col.length}</Button>}
            </div>
          );
        })}
      </div>
      <FlowluLeadCard lead={open} onClose={() => { setOpen(null); qc.invalidateQueries({ queryKey: ['flowlu_seq_all'] }); }} />
    </div>
  );
}
