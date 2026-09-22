import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Prospect,
  prospectsTable,
  outreachTable,
  visitorSignalsTable,
  useOutreachMessages,
  useProspects,
  useVisitorSignals,
} from '@/hooks/useProspects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, Send, Sparkles, Trash2, Users, Zap } from 'lucide-react';

const STATUS_TONE: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  researching: 'bg-primary/10 text-primary',
  researched: 'bg-primary/10 text-primary',
  drafted: 'bg-accent/15 text-accent',
  approved: 'bg-accent/15 text-accent',
  sequencing: 'bg-accent/20 text-accent',
  replied: 'bg-primary/20 text-primary',
  won: 'bg-primary/20 text-primary',
  lost: 'bg-destructive/10 text-destructive',
  unsubscribed: 'bg-destructive/10 text-destructive',
};

const callAgent = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('outreach-agent', { body });
  if (error) {
    const details = (error as any)?.context ? await (error as any).context.text() : error.message;
    throw new Error(details || error.message);
  }
  if ((data as any)?.error) throw new Error(String((data as any).error));
  return data as Record<string, unknown>;
};

const AdminProspecting = () => {
  const queryClient = useQueryClient();
  const { data: prospects = [], isLoading } = useProspects();
  const { data: messages = [] } = useOutreachMessages();
  const { data: signals = [] } = useVisitorSignals();

  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', website: '', region: '', notes: '' });
  const [bulk, setBulk] = useState('');
  const [reviewing, setReviewing] = useState<Prospect | null>(null);
  const [draftEdits, setDraftEdits] = useState<Record<string, { subject: string; body: string }>>({});

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['prospects'] });
    queryClient.invalidateQueries({ queryKey: ['outreach-messages'] });
    queryClient.invalidateQueries({ queryKey: ['visitor-signals'] });
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return prospects;
    return prospects.filter((p) =>
      [p.company, p.contact_name, p.email, p.region, p.trade].filter(Boolean).join(' ').toLowerCase().includes(term),
    );
  }, [prospects, search]);

  const messagesFor = (prospectId: string) => messages.filter((m) => m.prospect_id === prospectId).sort((a, b) => a.step - b.step);

  const awaitingApproval = prospects.filter((p) => p.status === 'drafted');
  const running = prospects.filter((p) => ['sequencing', 'approved'].includes(p.status));

  const addProspect = async () => {
    if (!form.company.trim() || !form.email.trim()) {
      toast({ title: 'Company and email are required', variant: 'destructive' });
      return;
    }
    setBusy('add');
    const { error } = await prospectsTable().insert({
      company: form.company.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim().toLowerCase(),
      website: form.website.trim() || null,
      region: form.region.trim() || null,
      notes: form.notes.trim() || null,
      source: 'manual',
    });
    setBusy(null);
    if (error) {
      toast({ title: 'Could not add prospect', description: error.message, variant: 'destructive' });
      return;
    }
    setForm({ company: '', contact_name: '', email: '', website: '', region: '', notes: '' });
    setAddOpen(false);
    refresh();
    toast({ title: 'Prospect added' });
  };

  const importBulk = async () => {
    const rows = bulk
      .split('\n')
      .map((line) => line.split(/[,;\t]/).map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 2 && cells[0] && cells[1]);
    if (rows.length === 0) {
      toast({ title: 'Nothing to import', description: 'One company per line: company, email, website', variant: 'destructive' });
      return;
    }
    setBusy('bulk');
    const { error } = await prospectsTable().upsert(
      rows.map((cells) => ({
        company: cells[0],
        email: cells[1].toLowerCase(),
        website: cells[2] || null,
        contact_name: cells[3] || null,
        source: 'import',
      })),
      { onConflict: 'email' },
    );
    setBusy(null);
    if (error) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
      return;
    }
    setBulk('');
    refresh();
    toast({ title: `Imported ${rows.length} prospects` });
  };

  const importFromEnquiries = async () => {
    setBusy('enquiries');
    const { data } = await (supabase as unknown as { from: (t: string) => any })
      .from('contact_enquiries')
      .select('id, name, email, company, message, details')
      .order('created_at', { ascending: false })
      .limit(100);
    const rows = (data ?? [])
      .filter((row: any) => row.email && !row.email.includes('placeholder'))
      .map((row: any) => ({
        company: row.company || row.name || row.email,
        contact_name: row.name || null,
        email: String(row.email).toLowerCase(),
        notes: (row.message || '').slice(0, 500) || null,
        source: 'enquiry',
        source_id: row.id,
      }));
    if (rows.length === 0) {
      setBusy(null);
      toast({ title: 'No enquiries to import' });
      return;
    }
    const { error } = await prospectsTable().upsert(rows, { onConflict: 'email', ignoreDuplicates: true });
    setBusy(null);
    if (error) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
      return;
    }
    refresh();
    toast({ title: `Pulled in ${rows.length} contacts from your enquiries` });
  };

  const run = async (action: 'research' | 'draft', prospect: Prospect) => {
    setBusy(`${action}-${prospect.id}`);
    try {
      await callAgent({ action, prospect_id: prospect.id });
      refresh();
      toast({ title: action === 'research' ? 'Research complete' : 'Draft sequence ready for your approval' });
    } catch (error) {
      toast({ title: 'The agent could not finish', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const saveDraft = async (messageId: string) => {
    const edit = draftEdits[messageId];
    if (!edit) return;
    const { error } = await outreachTable().update({ subject: edit.subject, body: edit.body }).eq('id', messageId);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    refresh();
    toast({ title: 'Saved' });
  };

  const approveAndSend = async (prospect: Prospect) => {
    setBusy(`approve-${prospect.id}`);
    try {
      const { data: session } = await supabase.auth.getUser();
      const result = await callAgent({
        action: 'approve',
        prospect_id: prospect.id,
        approved_by: session?.user?.id ?? null,
      });
      refresh();
      setReviewing(null);
      toast({
        title: result.opener_sent ? 'Opener sent' : 'Approved, but the opener did not go out',
        description: result.opener_sent
          ? `Follow-ups scheduled: ${result.scheduled}`
          : String(result.reason ?? 'Check the connected mailbox'),
        variant: result.opener_sent ? undefined : 'destructive',
      });
    } catch (error) {
      toast({ title: 'Approval failed', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const runTick = async () => {
    setBusy('tick');
    try {
      const result = await callAgent({ action: 'tick' });
      refresh();
      toast({
        title: 'Agent run complete',
        description: `Replies found: ${result.replies} · Follow-ups sent: ${result.follow_ups_sent} · Forms recovered: ${result.forms_recovered}`,
      });
    } catch (error) {
      toast({ title: 'Agent run failed', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (prospect: Prospect, status: string) => {
    await prospectsTable().update({ status }).eq('id', prospect.id);
    refresh();
  };

  const removeProspect = async (prospect: Prospect) => {
    await prospectsTable().delete().eq('id', prospect.id);
    refresh();
  };

  const markSignal = async (id: string, recovery_status: string) => {
    await visitorSignalsTable().update({ recovery_status }).eq('id', id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Prospecting desk</h1>
          <p className="text-sm text-muted-foreground">
            Research companies, approve the first email yourself, then let the agent chase politely.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={importFromEnquiries} disabled={busy === 'enquiries'}>
            {busy === 'enquiries' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Pull in enquiries
          </Button>
          <Button variant="outline" onClick={runTick} disabled={busy === 'tick'}>
            {busy === 'tick' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Run agent now
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add prospect
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Prospects', value: prospects.length },
          { label: 'Awaiting your approval', value: awaitingApproval.length },
          { label: 'Sequences running', value: running.length },
          { label: 'Replies', value: prospects.filter((p) => p.status === 'replied').length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="prospects">
        <TabsList>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="approval">Approval queue ({awaitingApproval.length})</TabsTrigger>
          <TabsTrigger value="visitors">Visitor safeguards ({signals.length})</TabsTrigger>
          <TabsTrigger value="import">Paste a list</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search company, contact, email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prospects yet — add one, or pull in your enquiries.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((prospect) => {
                const steps = messagesFor(prospect.id);
                return (
                  <Card key={prospect.id}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{prospect.company}</h3>
                            <Badge className={STATUS_TONE[prospect.status] ?? ''}>{prospect.status.replace('_', ' ')}</Badge>
                            {prospect.fit_score > 0 && <Badge variant="outline">Fit {prospect.fit_score}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">
                            {prospect.contact_name ? `${prospect.contact_name} · ` : ''}
                            {prospect.email}
                            {prospect.website ? ` · ${prospect.website}` : ''}
                          </p>
                          {prospect.research?.summary && (
                            <p className="text-sm text-muted-foreground mt-2">{prospect.research.summary}</p>
                          )}
                          {!!prospect.research?.hooks?.length && (
                            <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                              {prospect.research.hooks.slice(0, 3).map((hook) => (
                                <li key={hook}>{hook}</li>
                              ))}
                            </ul>
                          )}
                          {steps.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {steps
                                .map((s) => `Step ${s.step}: ${s.status}${s.scheduled_at && s.status === 'scheduled' ? ` (${new Date(s.scheduled_at).toLocaleDateString()})` : ''}`)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => run('research', prospect)} disabled={busy === `research-${prospect.id}`}>
                            {busy === `research-${prospect.id}` ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                            Research
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => run('draft', prospect)} disabled={busy === `draft-${prospect.id}`}>
                            {busy === `draft-${prospect.id}` ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Draft emails
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setReviewing(prospect);
                              setDraftEdits(
                                Object.fromEntries(messagesFor(prospect.id).map((m) => [m.id, { subject: m.subject, body: m.body }])),
                              );
                            }}
                            disabled={steps.length === 0}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Review &amp; approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setStatus(prospect, 'lost')}>
                            Not a fit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeProspect(prospect)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approval" className="space-y-3">
          {awaitingApproval.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting. Drafted sequences appear here before anything is sent.</p>
          ) : (
            awaitingApproval.map((prospect) => (
              <Card key={prospect.id}>
                <CardHeader>
                  <CardTitle className="text-base">{prospect.company}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {messagesFor(prospect.id).map((message) => (
                    <div key={message.id} className="rounded border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {message.step}</p>
                      <p className="font-medium text-foreground">{message.subject}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{message.body}</p>
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      setReviewing(prospect);
                      setDraftEdits(Object.fromEntries(messagesFor(prospect.id).map((m) => [m.id, { subject: m.subject, body: m.body }])));
                    }}
                  >
                    Open and approve
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="visitors" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            People who moved to leave the site or left a form part-filled. Anyone who left an email address gets one polite
            recovery message about 45 minutes later.
          </p>
          {signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitor signals recorded yet.</p>
          ) : (
            signals.map((signal) => (
              <Card key={signal.id}>
                <CardContent className="pt-6 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{signal.kind.replace('_', ' ')}</Badge>
                      <Badge className={signal.recovery_status === 'emailed' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}>
                        {signal.recovery_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(signal.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 break-words">
                      {signal.page_path}
                      {signal.form_id ? ` · ${signal.form_id}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground break-words">
                      {signal.name ?? '—'} · {signal.email ?? 'no email left'} · {signal.phone ?? '—'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {signal.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await prospectsTable().upsert(
                            {
                              company: signal.name || signal.email,
                              contact_name: signal.name,
                              email: signal.email!.toLowerCase(),
                              phone: signal.phone,
                              source: 'visitor',
                              source_id: signal.id,
                              notes: `Left ${signal.kind.replace('_', ' ')} on ${signal.page_path}`,
                            },
                            { onConflict: 'email', ignoreDuplicates: true },
                          );
                          refresh();
                          toast({ title: 'Added to prospects' });
                        }}
                      >
                        Add as prospect
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => markSignal(signal.id, 'converted')}>
                      Converted
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => markSignal(signal.id, 'skipped')}>
                      Ignore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-3">
          <p className="text-sm text-muted-foreground">One company per line: company, email, website, contact name.</p>
          <Textarea rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="Instalatérství Novák, info@novak.cz, novak.cz, Jan Novák" />
          <Button onClick={importBulk} disabled={busy === 'bulk'}>
            {busy === 'bulk' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Import list
          </Button>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a prospect</DialogTitle>
            <DialogDescription>The agent researches their website before writing anything.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <Input placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <Input placeholder="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={addProspect} disabled={busy === 'add'}>
              {busy === 'add' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reviewing?.company}</DialogTitle>
            <DialogDescription>
              Edit anything you like. Approving sends the first email now and schedules the follow-ups for 4 and 9 days later —
              they stop automatically if the person replies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewing &&
              messagesFor(reviewing.id).map((message) => (
                <div key={message.id} className="space-y-2 rounded border border-border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Step {message.step} · {message.status}
                  </p>
                  <Input
                    value={draftEdits[message.id]?.subject ?? message.subject}
                    onChange={(e) =>
                      setDraftEdits({
                        ...draftEdits,
                        [message.id]: { subject: e.target.value, body: draftEdits[message.id]?.body ?? message.body },
                      })
                    }
                  />
                  <Textarea
                    rows={8}
                    value={draftEdits[message.id]?.body ?? message.body}
                    onChange={(e) =>
                      setDraftEdits({
                        ...draftEdits,
                        [message.id]: { subject: draftEdits[message.id]?.subject ?? message.subject, body: e.target.value },
                      })
                    }
                  />
                  <Button size="sm" variant="outline" onClick={() => saveDraft(message.id)}>
                    Save changes
                  </Button>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button onClick={() => reviewing && approveAndSend(reviewing)} disabled={!reviewing || busy === `approve-${reviewing?.id}`}>
              {busy === `approve-${reviewing?.id}` ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Approve and send opener
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProspecting;
