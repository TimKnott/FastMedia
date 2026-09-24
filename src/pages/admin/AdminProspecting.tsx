import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  OutreachMessage,
  Prospect,
  prospectsTable,
  outreachSettingsTable,
  visitorSignalsTable,
  useOutreachEvents,
  useOutreachMessages,
  useOutreachSettings,
  useProspects,
  useVisitorSignals,
} from '@/hooks/useProspects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import {
  ArrowDown,
  ArrowUp,
  BanIcon,
  CalendarClock,
  FlaskConical,
  History,
  Linkedin,
  Loader2,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';

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
  suppressed: 'bg-destructive/15 text-destructive',
};

const EVENT_LABEL: Record<string, string> = {
  researched: 'researched',
  drafted: 'drafted the sequence',
  queued_for_approval: 'queued for approval',
  approved: 'approved',
  edited: 'edited the copy',
  rejected: 'rejected',
  cancelled: 'cancelled',
  sent: 'sent',
  send_failed: 'send failed',
  skipped_suppressed: 'skipped (suppressed)',
  suppressed: 'suppressed the prospect',
  replied: 'reply detected',
  unsubscribed: 'unsubscribe detected',
  simulated_visitor: 'simulated a visitor',
  form_recovery_sent: 'sent a form recovery email',
  discovered: 'ran a lead search',
};

type SortKey = 'company' | 'source' | 'fit_score' | 'status' | 'created_at';

const callAgent = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('outreach-agent', { body });
  if (error) {
    const details = (error as any)?.context ? await (error as any).context.text() : error.message;
    throw new Error(details || error.message);
  }
  if ((data as any)?.error) throw new Error(String((data as any).error));
  return data as Record<string, unknown>;
};

/** Keeps one row per email so a single upsert batch never hits the same email twice. */
const uniqueByEmail = <T extends { email: string }>(rows: T[]): T[] => {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const key = row.email.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, { ...row, email: key });
  }
  return [...seen.values()];
};

/** Shows the full GetSales webhook address (with secret) on demand, with a copy button. */
const WebhookAddress = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reveal = async () => {
    setLoading(true);
    try {
      const data = await callGetSales({ action: 'webhook_url' });
      setUrl(((data as { url?: string } | null)?.url) ?? null);
    } catch (e: any) {
      toast({ title: 'Could not load the webhook address', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  if (!url) {
    return (
      <Button size="sm" variant="outline" className="mt-2" onClick={reveal} disabled={loading}>
        {loading ? 'Loading…' : 'Show webhook address'}
      </Button>
    );
  }
  return (
    <div className="mt-2 flex items-start gap-2">
      <code className="block flex-1 break-all rounded-md bg-muted px-3 py-2 text-xs">{url}</code>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(url);
          toast({ title: 'Webhook address copied' });
        }}
      >
        Copy
      </Button>
    </div>
  );
};

/** Calls the GetSales bridge (LinkedIn sequences) and surfaces its plain-language errors. */
const callGetSales = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('getsales-push', { body });
  if (error) {
    const details = (error as any)?.context ? await (error as any).context.text() : error.message;
    let message = details || error.message;
    try {
      const parsed = JSON.parse(details);
      if (parsed?.error) message = parsed.error;
    } catch {
      /* keep the raw text */
    }
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error(String((data as any).error));
  return data as Record<string, unknown>;
};

const toLocalInput = (iso: string | null) => {
  const date = iso ? new Date(iso) : new Date(Date.now() + 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AdminProspecting = () => {
  const queryClient = useQueryClient();
  const { data: prospects = [], isLoading } = useProspects();
  const { data: messages = [] } = useOutreachMessages();
  const { data: signals = [] } = useVisitorSignals();
  const { data: events = [] } = useOutreachEvents();
  const { data: settings } = useOutreachSettings();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fit_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', website: '', region: '', notes: '' });
  const [bulk, setBulk] = useState('');
  const [reviewing, setReviewing] = useState<Prospect | null>(null);
  const [draftEdits, setDraftEdits] = useState<Record<string, { subject: string; body: string; when: string }>>({});
  const [gsStatus, setGsStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [gsLists, setGsLists] = useState<{ id: string; name: string }[]>([]);
  const [gsMap, setGsMap] = useState<{
    mapped: { ours: string; theirs: string; note?: string }[];
    unmapped: { ours: string; why: string }[];
  } | null>(null);
  const [gsLinkedIn, setGsLinkedIn] = useState<Record<string, string>>({});
  const [findOpen, setFindOpen] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('find') === '1',
  );
  const [findForm, setFindForm] = useState({ trade: '', region: '' });
  const [findResult, setFindResult] = useState<string | null>(null);

  const refresh = () => {
    ['prospects', 'outreach-messages', 'visitor-signals', 'outreach-events', 'outreach-settings'].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] }),
    );
  };

  const testMode = !!settings?.test_mode;

  const sorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? prospects.filter((p) =>
          [p.company, p.contact_name, p.email, p.region, p.trade, p.source]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term),
        )
      : [...prospects];
    const value = (p: Prospect) => {
      if (sortKey === 'fit_score') return p.fit_score;
      if (sortKey === 'created_at') return new Date(p.created_at).getTime();
      return String(p[sortKey] ?? '').toLowerCase();
    };
    return list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (sortAsc ? 1 : -1);
    });
  }, [prospects, search, sortKey, sortAsc]);

  const messagesFor = (prospectId: string) =>
    messages.filter((m) => m.prospect_id === prospectId).sort((a, b) => a.step - b.step);

  const prospectById = (id: string | null) => prospects.find((p) => p.id === id);

  const pendingMessages = messages
    .filter((m) => ['draft', 'pending_approval'].includes(m.status))
    .sort((a, b) => (a.proposed_at ?? a.created_at).localeCompare(b.proposed_at ?? b.created_at));

  const running = prospects.filter((p) => ['sequencing', 'approved'].includes(p.status));

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === 'company' || key === 'source' || key === 'status');
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
    >
      {label}
      {sortKey === field && (sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
    </button>
  );

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
      toast({
        title: 'Nothing to import',
        description: 'One company per line: company, email, website',
        variant: 'destructive',
      });
      return;
    }
    setBusy('bulk');
    const { error } = await prospectsTable().upsert(
      uniqueByEmail(
        rows.map((cells) => ({
          company: cells[0],
          email: cells[1].trim().toLowerCase(),
          website: cells[2] || null,
          contact_name: cells[3] || null,
          source: 'import',
        })),
      ),
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
    const { error } = await prospectsTable().upsert(uniqueByEmail(rows), { onConflict: 'email', ignoreDuplicates: true });
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

  const openReview = (prospect: Prospect) => {
    setReviewing(prospect);
    setDraftEdits(
      Object.fromEntries(
        messagesFor(prospect.id).map((m) => [m.id, { subject: m.subject, body: m.body, when: toLocalInput(m.proposed_at) }]),
      ),
    );
  };

  const approveOpener = async (prospect: Prospect) => {
    setBusy(`approve-${prospect.id}`);
    try {
      const opener = messagesFor(prospect.id).find((m) => m.step === 1);
      if (opener) {
        const edit = draftEdits[opener.id];
        if (edit && (edit.subject !== opener.subject || edit.body !== opener.body)) {
          await callAgent({
            action: 'approve_message',
            message_id: opener.id,
            subject: edit.subject,
            body: edit.body,
            send_now: true,
          });
          refresh();
          setReviewing(null);
          toast({ title: 'Opener approved and sent' });
          return;
        }
      }
      const result = await callAgent({ action: 'approve', prospect_id: prospect.id });
      refresh();
      setReviewing(null);
      toast({
        title: result.opener_sent ? 'Opener sent' : 'Approved, but the opener did not go out',
        description: result.opener_sent
          ? `Follow-ups waiting for your approval: ${result.awaiting_approval}`
          : String(result.reason ?? 'Check the connected mailbox'),
        variant: result.opener_sent ? undefined : 'destructive',
      });
    } catch (error) {
      toast({ title: 'Approval failed', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const decideMessage = async (
    message: OutreachMessage,
    decision: 'schedule' | 'send' | 'reject' | 'cancel',
    edit?: { subject: string; body: string; when: string },
  ) => {
    setBusy(`${decision}-${message.id}`);
    try {
      if (decision === 'reject') {
        await callAgent({ action: 'reject_message', message_id: message.id, reason: 'Rejected in the review queue' });
        toast({ title: 'Message rejected — it will never send' });
      } else if (decision === 'cancel') {
        await callAgent({ action: 'cancel_message', message_id: message.id });
        toast({ title: 'Message cancelled' });
      } else {
        const result = await callAgent({
          action: 'approve_message',
          message_id: message.id,
          subject: edit?.subject,
          body: edit?.body,
          scheduled_at: edit?.when ? new Date(edit.when).toISOString() : null,
          send_now: decision === 'send',
        });
        toast({
          title: decision === 'send' ? (result.sent ? 'Sent' : 'Approved, but it did not go out') : 'Approved and scheduled',
          description:
            decision === 'send'
              ? String(result.reason ?? '')
              : `Sends ${new Date(String(result.scheduled_at)).toLocaleString()}`,
          variant: decision === 'send' && !result.sent ? 'destructive' : undefined,
        });
      }
      refresh();
    } catch (error) {
      toast({ title: 'That did not work', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const suppress = async (prospect: Prospect) => {
    setBusy(`suppress-${prospect.id}`);
    try {
      await callAgent({ action: 'suppress', prospect_id: prospect.id, reason: 'Suppressed from the review queue' });
      refresh();
      toast({ title: 'Suppressed', description: 'Nothing further will be sent to this address.' });
    } catch (error) {
      toast({ title: 'Could not suppress', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const findLeads = async () => {
    if (!findForm.trade.trim() || !findForm.region.trim()) {
      toast({ title: 'Enter a trade and a region', variant: 'destructive' });
      return;
    }
    setBusy('discover');
    setFindResult(null);
    try {
      const result = await callAgent({ action: 'discover', trade: findForm.trade.trim(), region: findForm.region.trim() });
      refresh();
      setFindResult(
        `Found ${result.candidates} businesses, verified published contact details for ${result.verified} — ${result.inserted} new in your queue, ${result.duplicates} already known.`,
      );
    } catch (error) {
      toast({ title: 'The search did not finish', description: String(error).slice(0, 220), variant: 'destructive' });
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
        description: `Replies found: ${result.replies} · Approved follow-ups sent: ${result.follow_ups_sent} · Forms recovered: ${result.forms_recovered}`,
      });
    } catch (error) {
      toast({ title: 'Agent run failed', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = async (patch: Record<string, unknown>) => {
    const { error } = await outreachSettingsTable().update(patch).eq('id', 1);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    refresh();
    toast({ title: 'Saved' });
  };

  // ---- GetSales (LinkedIn) ----
  const checkGetSales = async () => {
    setBusy('gs-ping');
    try {
      const result = await callGetSales({ action: 'ping' });
      setGsStatus({ connected: !!result.connected, message: String(result.message ?? '') });
      if (result.connected) {
        const lists = await callGetSales({ action: 'lists' });
        setGsLists((lists.lists as { id: string; name: string }[]) ?? []);
      }
    } catch (error) {
      setGsStatus({ connected: false, message: String(error).replace('Error: ', '').slice(0, 260) });
    } finally {
      setBusy(null);
    }
  };

  const loadFieldMap = async () => {
    setBusy('gs-map');
    try {
      const result = await callGetSales({ action: 'field_map' });
      setGsMap(result as any);
    } catch (error) {
      toast({ title: 'Could not load the field list', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const pushToLinkedIn = async (prospect: Prospect, dryRun = false) => {
    setBusy(`gs-${prospect.id}`);
    try {
      const result = await callGetSales({
        action: 'push',
        prospect_id: prospect.id,
        dry_run: dryRun,
        linkedin_url: gsLinkedIn[prospect.id] || undefined,
      });
      refresh();
      const unmapped = (result.unmapped as string[]) ?? [];
      toast({
        title: dryRun ? 'Preview only — nothing was sent' : 'Sent to GetSales',
        description: unmapped.length ? `Worth knowing: ${unmapped.join(' · ')}`.slice(0, 300) : 'The contact is in your GetSales list.',
      });
    } catch (error) {
      toast({
        title: 'GetSales sync failed',
        description: String(error).replace('Error: ', '').slice(0, 260),
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  const retryFailedSyncs = async () => {
    setBusy('gs-retry');
    try {
      const result = await callGetSales({ action: 'retry_failed' });
      refresh();
      const stillFailing = (result.still_failing as unknown[]) ?? [];
      toast({
        title: `Retried ${result.attempted} lead${result.attempted === 1 ? '' : 's'}`,
        description: `${result.recovered} now synced${stillFailing.length ? `, ${stillFailing.length} still failing` : ''}.`,
      });
    } catch (error) {
      toast({ title: 'Retry failed', description: String(error).slice(0, 220), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const simulateVisitor = async (kind: string) => {
    setBusy(`sim-${kind}`);
    try {
      await callAgent({ action: 'simulate_visitor', kind, page_path: '/calculator', language: 'en' });
      refresh();
      toast({ title: 'Practice visitor created', description: 'No contact details were stored.' });
    } catch (error) {
      toast({ title: 'Simulation failed', description: String(error).slice(0, 220), variant: 'destructive' });
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
            Research companies, then approve every single email — opener and follow-ups — before it can leave.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {testMode && (
            <Badge className="bg-accent/20 text-accent self-center">
              Test mode → {settings?.test_inbox ?? 'test inbox'}
            </Badge>
          )}
          <Button variant="outline" onClick={() => setFindOpen(true)}>
            <Search className="w-4 h-4 mr-2" />
            Find leads
          </Button>
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

      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: 'Prospects', value: prospects.length },
          {
            label: 'Found this week',
            value: prospects.filter(
              (p) => p.source === 'discovery' && new Date(p.created_at).getTime() > Date.now() - 7 * 86400000,
            ).length,
          },
          { label: 'Messages awaiting approval', value: pendingMessages.length },
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

      <Tabs defaultValue="queue">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="queue">Lead review queue</TabsTrigger>
          <TabsTrigger value="approval">Message approvals ({pendingMessages.length})</TabsTrigger>
          <TabsTrigger value="visitors">Visitor safeguards ({signals.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit trail</TabsTrigger>
          <TabsTrigger value="test">Test mode</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn (GetSales)</TabsTrigger>
          <TabsTrigger value="import">Paste a list</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search company, contact, email, source"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hidden lg:grid grid-cols-12 gap-3 px-4">
            <div className="col-span-3">
              <SortHeader label="Company" field="company" />
            </div>
            <div className="col-span-2">
              <SortHeader label="Source" field="source" />
            </div>
            <div className="col-span-1">
              <SortHeader label="Fit" field="fit_score" />
            </div>
            <div className="col-span-3 text-xs uppercase tracking-wide text-muted-foreground">
              Fit signals &amp; personalisation
            </div>
            <div className="col-span-2">
              <SortHeader label="Approval status" field="status" />
            </div>
            <div className="col-span-1">
              <SortHeader label="Added" field="created_at" />
            </div>
          </div>

          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prospects yet — add one, or pull in your enquiries.</p>
          ) : (
            <div className="space-y-3">
              {sorted.map((prospect) => {
                const steps = messagesFor(prospect.id);
                const pending = steps.filter((s) => ['draft', 'pending_approval'].includes(s.status)).length;
                return (
                  <Card key={prospect.id}>
                    <CardContent className="pt-6 grid gap-3 lg:grid-cols-12">
                      <div className="lg:col-span-3 min-w-0">
                        <h3 className="font-semibold text-foreground break-words">{prospect.company}</h3>
                        <p className="text-sm text-muted-foreground break-words">
                          {prospect.contact_name ? `${prospect.contact_name} · ` : ''}
                          {prospect.email}
                        </p>
                        {prospect.website && (
                          <p className="text-xs text-muted-foreground break-words">{prospect.website}</p>
                        )}
                      </div>
                      <div className="lg:col-span-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{prospect.source}</Badge>
                        {prospect.region && <p className="mt-1 text-xs">{prospect.region}</p>}
                      </div>
                      <div className="lg:col-span-1">
                        <span className="text-lg font-semibold text-foreground">{prospect.fit_score}</span>
                      </div>
                      <div className="lg:col-span-3 text-sm text-muted-foreground min-w-0">
                        {prospect.research?.summary ? (
                          <p className="break-words">{prospect.research.summary}</p>
                        ) : (
                          <p className="italic">Not researched yet.</p>
                        )}
                        {!!prospect.research?.hooks?.length && (
                          <ul className="mt-1 list-disc pl-5 text-xs">
                            {prospect.research.hooks.slice(0, 2).map((hook) => (
                              <li key={hook}>{hook}</li>
                            ))}
                          </ul>
                        )}
                        {prospect.notes && <p className="mt-1 text-xs italic break-words">Note: {prospect.notes}</p>}
                        <Input
                          className="mt-2 h-8 text-xs"
                          placeholder="LinkedIn profile address (optional)"
                          defaultValue={prospect.linkedin_url ?? ''}
                          onChange={(e) => setGsLinkedIn((prev) => ({ ...prev, [prospect.id]: e.target.value.trim() }))}
                        />
                        {prospect.getsales_sync_status === 'synced' && (
                          <p className="mt-1 text-xs text-emerald-500">
                            In GetSales
                            {prospect.getsales_synced_at
                              ? ` since ${new Date(prospect.getsales_synced_at).toLocaleDateString()}`
                              : ''}
                          </p>
                        )}
                        {prospect.getsales_sync_status === 'failed' && (
                          <p className="mt-1 text-xs text-destructive break-words">
                            GetSales sync failed ({prospect.getsales_sync_attempts ?? 1} attempt
                            {(prospect.getsales_sync_attempts ?? 1) === 1 ? '' : 's'}): {prospect.getsales_sync_error}
                          </p>
                        )}
                      </div>
                      <div className="lg:col-span-2 space-y-1">
                        <Badge className={STATUS_TONE[prospect.status] ?? ''}>{prospect.status.replace('_', ' ')}</Badge>
                        {pending > 0 && (
                          <p className="text-xs text-accent">
                            {pending} message{pending === 1 ? '' : 's'} awaiting approval
                          </p>
                        )}
                        {steps.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {steps.map((s) => `#${s.step} ${s.status}`).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="lg:col-span-1 text-xs text-muted-foreground">
                        {new Date(prospect.created_at).toLocaleDateString()}
                      </div>

                      <div className="lg:col-span-12 flex flex-wrap gap-2 border-t border-border pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => run('research', prospect)}
                          disabled={busy === `research-${prospect.id}`}
                        >
                          {busy === `research-${prospect.id}` ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4 mr-2" />
                          )}
                          Research
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => run('draft', prospect)}
                          disabled={busy === `draft-${prospect.id}`}
                        >
                          {busy === `draft-${prospect.id}` ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Draft emails
                        </Button>
                        <Button size="sm" onClick={() => openReview(prospect)} disabled={steps.length === 0}>
                          <Send className="w-4 h-4 mr-2" />
                          Review &amp; approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pushToLinkedIn(prospect)}
                          disabled={
                            busy === `gs-${prospect.id}` ||
                            !settings?.getsales_enabled ||
                            ['replied', 'won', 'lost', 'unsubscribed', 'suppressed'].includes(prospect.status)
                          }
                          title={
                            !settings?.getsales_enabled
                              ? 'Switch GetSales on in the LinkedIn tab first'
                              : ['replied', 'won', 'lost', 'unsubscribed', 'suppressed'].includes(prospect.status)
                                ? `This lead is marked "${prospect.status.replace('_', ' ')}" — clear that status first if you really want to push it again`
                                : 'Add this contact to your GetSales list so the LinkedIn sequence picks them up'
                          }
                        >
                          {busy === `gs-${prospect.id}` ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Linkedin className="w-4 h-4 mr-2" />
                          )}
                          {prospect.getsales_lead_id ? 'Re-send to LinkedIn' : 'Send to LinkedIn sequence'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setStatus(prospect, 'lost')}>
                          Not a fit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => suppress(prospect)}
                          disabled={busy === `suppress-${prospect.id}` || prospect.status === 'suppressed'}
                        >
                          <BanIcon className="w-4 h-4 mr-2" />
                          Suppress
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeProspect(prospect)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approval" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Every email waits here — openers and follow-ups alike. Change the wording and the send time, then approve, or
            reject it so it never sends.
          </p>
          {pendingMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting for approval.</p>
          ) : (
            pendingMessages.map((message) => {
              const prospect = prospectById(message.prospect_id);
              const edit =
                draftEdits[message.id] ?? {
                  subject: message.subject,
                  body: message.body,
                  when: toLocalInput(message.proposed_at),
                };
              return (
                <Card key={message.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex flex-wrap items-center gap-2">
                      {prospect?.company ?? 'Prospect'}
                      <Badge variant="outline">Step {message.step}</Badge>
                      <Badge className="bg-muted text-muted-foreground">{message.status.replace('_', ' ')}</Badge>
                      {prospect && <span className="text-xs text-muted-foreground">{prospect.email}</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={edit.subject}
                      onChange={(e) => setDraftEdits({ ...draftEdits, [message.id]: { ...edit, subject: e.target.value } })}
                    />
                    <Textarea
                      rows={8}
                      value={edit.body}
                      onChange={(e) => setDraftEdits({ ...draftEdits, [message.id]: { ...edit, body: e.target.value } })}
                    />
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Send at</Label>
                        <Input
                          type="datetime-local"
                          value={edit.when}
                          onChange={(e) => setDraftEdits({ ...draftEdits, [message.id]: { ...edit, when: e.target.value } })}
                        />
                      </div>
                      <Button
                        onClick={() => decideMessage(message, 'schedule', edit)}
                        disabled={busy === `schedule-${message.id}`}
                      >
                        {busy === `schedule-${message.id}` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CalendarClock className="w-4 h-4 mr-2" />
                        )}
                        Approve for this time
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => decideMessage(message, 'send', edit)}
                        disabled={busy === `send-${message.id}`}
                      >
                        {busy === `send-${message.id}` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send now
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => decideMessage(message, 'reject')}
                        disabled={busy === `reject-${message.id}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Approved and waiting to send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {messages.filter((m) => m.status === 'scheduled').length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                messages
                  .filter((m) => m.status === 'scheduled')
                  .map((message) => (
                    <div key={message.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground break-words">
                          {prospectById(message.prospect_id)?.company ?? 'Prospect'} · step {message.step}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sends {message.scheduled_at ? new Date(message.scheduled_at).toLocaleString() : '—'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => decideMessage(message, 'cancel')}
                        disabled={busy === `cancel-${message.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            People who moved to leave the site or left a form part-filled. Anyone who left an email address gets one polite
            recovery message about 45 minutes later. Practice records are marked and never emailed.
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
                      <Badge
                        className={
                          signal.recovery_status === 'emailed'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {signal.recovery_status}
                      </Badge>
                      {signal.simulated && <Badge className="bg-accent/15 text-accent">practice</Badge>}
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

        <TabsContent value="audit" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Everything that happened to an outbound message: who approved, edited, rejected or cancelled it, and when.
          </p>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex flex-wrap items-start justify-between gap-2 rounded border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground break-words">
                      <span className="font-medium">{event.actor_label ?? 'automation'}</span>{' '}
                      {EVENT_LABEL[event.action] ?? event.action.replace(/_/g, ' ')}
                      {event.step ? ` · step ${event.step}` : ''}
                      {event.prospect_id ? ` · ${prospectById(event.prospect_id)?.company ?? 'prospect removed'}` : ''}
                    </p>
                    {Object.keys(event.details ?? {}).length > 0 && (
                      <p className="text-xs text-muted-foreground break-words">{JSON.stringify(event.details)}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    <History className="inline w-3 h-3 mr-1" />
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                Test mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Route approved emails to a test inbox</p>
                  <p className="text-sm text-muted-foreground">
                    While this is on, every approved email goes to the address below instead of the prospect, with the real
                    recipient shown in the subject line.
                  </p>
                </div>
                <Switch checked={testMode} onCheckedChange={(v) => saveSettings({ test_mode: v })} />
              </div>
              <div className="max-w-sm space-y-1">
                <Label className="text-xs text-muted-foreground">Test inbox</Label>
                <Input
                  defaultValue={settings?.test_inbox ?? ''}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && value !== settings?.test_inbox) saveSettings({ test_inbox: value.toLowerCase() });
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="font-medium text-foreground">Simulate visitor qualification</p>
                  <p className="text-sm text-muted-foreground">
                    Visitor safeguards keep working, but names, emails and phone numbers are not stored and no recovery
                    emails are sent.
                  </p>
                </div>
                <Switch
                  checked={!!settings?.simulate_visitors}
                  onCheckedChange={(v) => saveSettings({ simulate_visitors: v })}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => simulateVisitor('form_abandoned')} disabled={busy === 'sim-form_abandoned'}>
                  Create a practice abandoned form
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateVisitor('high_value')} disabled={busy === 'sim-high_value'}>
                  Create a practice qualified visitor
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Suggested gap before follow-up 1 (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    defaultValue={settings?.follow_up_days_step2 ?? 4}
                    onBlur={(e) => saveSettings({ follow_up_days_step2: Math.max(1, Number(e.target.value) || 4) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Suggested gap before follow-up 2 (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    defaultValue={settings?.follow_up_days_step3 ?? 9}
                    onBlur={(e) => saveSettings({ follow_up_days_step3: Math.max(1, Number(e.target.value) || 9) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4" />
                Automatic lead discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Weekly lead search</p>
                  <p className="text-sm text-muted-foreground">
                    Every Monday the agent searches the next trade and region pair from the lists below and adds new
                    businesses to your review queue. It never emails anyone by itself.
                  </p>
                </div>
                <Switch
                  checked={settings?.discovery_enabled !== false}
                  onCheckedChange={(v) => saveSettings({ discovery_enabled: v })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Trades to search (one per line)</Label>
                  <Textarea
                    rows={6}
                    defaultValue={(settings?.discovery_trades ?? []).join('\n')}
                    onBlur={(e) => {
                      const list = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 50);
                      if (list.length) saveSettings({ discovery_trades: list });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Regions to search (one per line)</Label>
                  <Textarea
                    rows={6}
                    defaultValue={(settings?.discovery_regions ?? []).join('\n')}
                    onBlur={(e) => {
                      const list = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 50);
                      if (list.length) saveSettings({ discovery_regions: list });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                GetSales LinkedIn sequences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Approved leads can be added to a GetSales list. Whichever LinkedIn sequence watches that list picks them up
                automatically, and their replies come back into your lead review queue.
              </p>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Use GetSales for LinkedIn</p>
                  <p className="text-sm text-muted-foreground">Turn this off to hide the LinkedIn buttons on your leads.</p>
                </div>
                <Switch
                  checked={!!settings?.getsales_enabled}
                  onCheckedChange={(v) => saveSettings({ getsales_enabled: v })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Your GetSales address</Label>
                  <Input
                    defaultValue={settings?.getsales_base_url ?? ''}
                    placeholder="https://yourteam.getsales.io"
                    onBlur={(e) => {
                      const value = e.target.value.trim().replace(/\/+$/, '');
                      if (value && value !== settings?.getsales_base_url) saveSettings({ getsales_base_url: value });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">List that feeds your sequence</Label>
                  {gsLists.length > 0 ? (
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      defaultValue={settings?.getsales_list_id ?? ''}
                      onChange={(e) => saveSettings({ getsales_list_id: e.target.value })}
                    >
                      <option value="">Choose a list…</option>
                      {gsLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      defaultValue={settings?.getsales_list_id ?? ''}
                      placeholder="Press Check connection to load your lists"
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && value !== settings?.getsales_list_id) saveSettings({ getsales_list_id: value });
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={checkGetSales} disabled={busy === 'gs-ping'}>
                  {busy === 'gs-ping' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Check connection
                </Button>
                <Button variant="outline" size="sm" onClick={loadFieldMap} disabled={busy === 'gs-map'}>
                  Show what gets sent
                </Button>
                <Button variant="outline" size="sm" onClick={retryFailedSyncs} disabled={busy === 'gs-retry'}>
                  {busy === 'gs-retry' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Retry failed leads
                </Button>
              </div>

              {gsStatus && (
                <p className={`text-sm ${gsStatus.connected ? 'text-emerald-500' : 'text-destructive'}`}>
                  {gsStatus.connected ? 'Connected' : 'Not connected'} — {gsStatus.message}
                </p>
              )}

              {gsMap && (
                <div className="border-t border-border pt-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Sent to GetSales</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {gsMap.mapped.map((row) => (
                        <li key={row.ours}>
                          {row.ours} → {row.theirs}
                          {row.note ? ` (${row.note})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {gsMap.unmapped.length > 0 && (
                    <div>
                      <p className="font-medium text-foreground">Stays here only</p>
                      <ul className="mt-1 space-y-1 text-muted-foreground">
                        {gsMap.unmapped.map((row) => (
                          <li key={row.ours}>
                            {row.ours} — {row.why}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4">
                <p className="font-medium text-foreground text-sm">Replies and new contacts</p>
                <p className="text-sm text-muted-foreground">
                  In GetSales, under Settings → Webhooks, point “Contact replied”, “Contact exported” and “Email bounced”
                  at the address below. Replies stop any pending follow-ups automatically and new GetSales contacts appear
                  in your lead review queue.
                </p>
                <WebhookAddress />
                <p className="mt-1 text-xs text-muted-foreground">
                  This address contains your private webhook secret — only paste it into GetSales.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-3">
          <p className="text-sm text-muted-foreground">One company per line: company, email, website, contact name.</p>
          <Textarea
            rows={8}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="Instalatérství Novák, info@novak.cz, novak.cz, Jan Novák"
          />
          <Button onClick={importBulk} disabled={busy === 'bulk'}>
            {busy === 'bulk' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Import list
          </Button>
        </TabsContent>
      </Tabs>

      <Dialog open={findOpen} onOpenChange={setFindOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find new leads</DialogTitle>
            <DialogDescription>
              The agent searches the public web for real businesses matching a trade and region, reads their websites for
              published contact details, and drops the new ones into your review queue. Nothing is emailed — you approve
              every message yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Trade or business type</Label>
              <Input
                placeholder="e.g. plumber, hair salon, dental clinic"
                value={findForm.trade}
                onChange={(e) => setFindForm({ ...findForm, trade: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Region or town</Label>
              <Input
                placeholder="e.g. Ústí nad Labem, Praha, Brno"
                value={findForm.region}
                onChange={(e) => setFindForm({ ...findForm, region: e.target.value })}
              />
            </div>
            {findResult && <p className="text-sm text-muted-foreground">{findResult}</p>}
          </div>
          <DialogFooter>
            <Button onClick={findLeads} disabled={busy === 'discover'}>
              {busy === 'discover' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              {busy === 'discover' ? 'Searching — this takes a minute…' : 'Search for leads'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Approving sends the opener now. The follow-ups then wait in Message approvals, where you set their wording and
              timing before each one can send.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewing &&
              messagesFor(reviewing.id).map((message) => {
                const edit =
                  draftEdits[message.id] ?? {
                    subject: message.subject,
                    body: message.body,
                    when: toLocalInput(message.proposed_at),
                  };
                return (
                  <div key={message.id} className="space-y-2 rounded border border-border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Step {message.step} · {message.status.replace('_', ' ')}
                    </p>
                    <Input
                      value={edit.subject}
                      onChange={(e) => setDraftEdits({ ...draftEdits, [message.id]: { ...edit, subject: e.target.value } })}
                    />
                    <Textarea
                      rows={8}
                      value={edit.body}
                      onChange={(e) => setDraftEdits({ ...draftEdits, [message.id]: { ...edit, body: e.target.value } })}
                    />
                    {message.step > 1 && (
                      <div className="flex flex-wrap items-end gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Send at</Label>
                          <Input
                            type="datetime-local"
                            value={edit.when}
                            onChange={(e) =>
                              setDraftEdits({ ...draftEdits, [message.id]: { ...edit, when: e.target.value } })
                            }
                          />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => decideMessage(message, 'schedule', edit)}>
                          Approve this follow-up
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => decideMessage(message, 'reject')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => reviewing && approveOpener(reviewing)}
              disabled={!reviewing || busy === `approve-${reviewing?.id}`}
            >
              {busy === `approve-${reviewing?.id}` ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Approve and send opener
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProspecting;
