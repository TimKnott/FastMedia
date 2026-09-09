import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Send, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Copy, X, HelpCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface LogRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface SuppressionRow {
  id: string;
  email: string;
  reason: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const DEFAULT_RECIPIENT = 'support@fastmedia.pro';
const PROBE_TEMPLATE = 'deliverability-test';
const FAILURE_STATUSES = ['failed', 'dlq', 'bounced', 'complained', 'suppressed'];
const TERMINAL_STATUSES = ['sent', ...FAILURE_STATUSES];

type Badge3 = 'PASS' | 'FAIL' | 'PENDING';

const badgeForStatus = (status: string): Badge3 => {
  if (status === 'sent') return 'PASS';
  if (FAILURE_STATUSES.includes(status)) return 'FAIL';
  return 'PENDING';
};

const badgeLabel = (b: Badge3) => (b === 'PENDING' ? 'PENDING / UNKNOWN' : b);

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === 'sent') return 'default';
  if (status === 'pending') return 'secondary';
  if (status === 'suppressed') return 'outline';
  return 'destructive';
};

/** Group a raw DSN/error string into a stable, readable reason bucket. */
const dsnReason = (error: string | null): string => {
  if (!error) return 'Unspecified error';
  const code = error.match(/\b([45]\d{2})\b/)?.[1];
  const lower = error.toLowerCase();
  if (lower.includes('relay access denied')) return `${code ?? '554'} Relay access denied (inbound routing)`;
  if (lower.includes('mailbox') && lower.includes('unavailable')) return `${code ?? '550'} Mailbox unavailable`;
  if (lower.includes('user unknown') || lower.includes('no such user')) return `${code ?? '550'} Recipient unknown`;
  if (lower.includes('spam') || lower.includes('blocked')) return `${code ?? '550'} Blocked as spam`;
  if (lower.includes('rate') || lower.includes('too many')) return `${code ?? '421'} Rate limited`;
  if (lower.includes('timeout') || lower.includes('timed out')) return 'Timeout';
  if (lower.includes('suppress')) return 'Suppressed recipient';
  if (code) return `SMTP ${code}`;
  return error.slice(0, 60);
};

const AdminEmailDeliverability = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedMessageId = searchParams.get('message_id');

  const [recipient, setRecipient] = useState(DEFAULT_RECIPIENT);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRow[]>([]);
  const [history, setHistory] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [logRes, supRes, histRes] = await Promise.all([
        supabase
          .from('email_send_log')
          .select('*')
          .eq('recipient_email', email.trim().toLowerCase())
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('suppressed_emails')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('email_send_log')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(2000),
      ]);
      if (logRes.error) throw logRes.error;
      if (supRes.error) throw supRes.error;
      if (histRes.error) throw histRes.error;
      setRows((logRes.data ?? []) as LogRow[]);
      setSuppressions((supRes.data ?? []) as SuppressionRow[]);
      setHistory((histRes.data ?? []) as LogRow[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to load logs: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(DEFAULT_RECIPIENT);
  }, [load]);

  // Near-real-time refresh when new log rows arrive
  useEffect(() => {
    const channel = supabase
      .channel('deliverability-log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'email_send_log' }, () => {
        load(recipient);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, recipient]);

  const sendProbe = async () => {
    const email = recipient.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setSending(true);
    const probeId = `probe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const triggeredBy = userData.user?.email ?? 'unknown';
      const { data, error } = await supabase.functions.invoke('send-app-email', {
        body: {
          templateName: PROBE_TEMPLATE,
          recipientEmail: email,
          idempotencyKey: probeId,
          templateData: {
            probeId,
            triggeredBy,
            triggeredAt: new Date().toISOString(),
            note: note.trim() || undefined,
          },
        },
      });
      if (error) throw error;
      toast.success(`Probe queued (${probeId})`);
      setTimeout(() => load(email), 1500);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Send failed: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const failedRows = useMemo(
    () => rows.filter((r) => FAILURE_STATUSES.includes(r.status)),
    [rows],
  );

  const lastSent = useMemo(() => rows.find((r) => r.status === 'sent'), [rows]);
  const lastFailure = failedRows[0];

  /** One deduplicated result per probe message_id (latest row wins). */
  const probeResults = useMemo(() => {
    const byMessage = new Map<string, LogRow>();
    for (const r of history) {
      if (r.template_name !== PROBE_TEMPLATE || !r.message_id) continue;
      const existing = byMessage.get(r.message_id);
      if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
        byMessage.set(r.message_id, r);
      }
    }
    return [...byMessage.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [history]);

  const probeCounts = useMemo(() => {
    const counts = { PASS: 0, FAIL: 0, PENDING: 0 };
    for (const r of probeResults) {
      counts[TERMINAL_STATUSES.includes(r.status) ? badgeForStatus(r.status) : 'PENDING'] += 1;
    }
    return counts;
  }, [probeResults]);

  /** DSN failure breakdown across all templates in the last 30 days. */
  const dsnBreakdown = useMemo(() => {
    const byMessage = new Map<string, LogRow>();
    for (const r of history) {
      const key = r.message_id ?? r.id;
      const existing = byMessage.get(key);
      if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
        byMessage.set(key, r);
      }
    }
    const buckets = new Map<string, { count: number; sample: string | null; latest: string }>();
    for (const r of byMessage.values()) {
      if (!FAILURE_STATUSES.includes(r.status)) continue;
      const reason = dsnReason(r.error_message);
      const b = buckets.get(reason);
      if (b) {
        b.count += 1;
        if (new Date(r.created_at) > new Date(b.latest)) b.latest = r.created_at;
      } else {
        buckets.set(reason, { count: 1, sample: r.error_message, latest: r.created_at });
      }
    }
    return [...buckets.entries()]
      .map(([reason, v]) => ({ reason, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [history]);

  const focusedRows = useMemo(
    () =>
      focusedMessageId ? history.filter((r) => r.message_id === focusedMessageId) : [],
    [history, focusedMessageId],
  );

  const focusedOutcome = useMemo(() => {
    const terminal = focusedRows.filter((r) => TERMINAL_STATUSES.includes(r.status));
    if (terminal.length === 0) return null;
    return terminal.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [focusedRows]);

  const copyId = (id: string | null) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success('Copied');
  };

  const focusMessage = (id: string | null) => {
    if (!id) return;
    setSearchParams({ message_id: id });
  };

  const clearFocus = () => setSearchParams({});

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Email deliverability</h1>
        <p className="text-muted-foreground text-sm">
          Send a probe email through the FastMedia outbound pipeline (notify.fastmedia.pro) and
          inspect the last delivery attempts, DSN failures, and suppression records for any recipient.
        </p>
      </div>

      {focusedMessageId && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Evidence for a single message</CardTitle>
                <CardDescription className="break-all">
                  Showing only rows whose message ID is exactly{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{focusedMessageId}</code>
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFocus}>
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {focusedRows.length === 0 ? (
              <p className="text-muted-foreground">
                No log entry with this message ID in the last 30 days.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant={focusedOutcome ? statusVariant(focusedOutcome.status) : 'secondary'}>
                    {focusedOutcome ? badgeLabel(badgeForStatus(focusedOutcome.status)) : 'PENDING / UNKNOWN'}
                  </Badge>
                  {focusedOutcome && (
                    <span className="text-muted-foreground">
                      {format(new Date(focusedOutcome.created_at), 'd MMM yyyy HH:mm')}
                    </span>
                  )}
                </div>
                {focusedRows.map((r) => (
                  <div key={r.id} className="border rounded p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {r.template_name} · {r.recipient_email} ·{' '}
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {r.error_message && (
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                        {r.error_message}
                      </pre>
                    )}
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-4 h-4" /> Run a deliverability probe
          </CardTitle>
          <CardDescription>
            Enqueues the <code>deliverability-test</code> template and returns the probe ID so you can
            trace it in the log below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="support@fastmedia.pro"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => load(recipient)}
                disabled={loading}
                title="Reload log for this recipient"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={sendProbe} disabled={sending}>
                <Send className="w-4 h-4 mr-1" />
                {sending ? 'Sending…' : 'Send probe'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Testing after DMARC change"
            />
          </div>

          {recipient.trim().toLowerCase() === DEFAULT_RECIPIENT && (
            <Alert>
              <ShieldAlert className="w-4 h-4" />
              <AlertTitle>Heads up: support@fastmedia.pro is inbound-only</AlertTitle>
              <AlertDescription>
                Inbound mail for this address is handled by the Namecheap email forwarding servers
                listed in the domain&rsquo;s MX records. A probe only lands in your private inbox once a
                forwarding rule for <code>support@</code> exists there; without one the servers reply
                &ldquo;554 Relay access denied&rdquo;.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Probe history — last 30 days</CardTitle>
          <CardDescription>
            One result per probe, matched strictly on its own message ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="w-4 h-4" /> PASS
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{probeCounts.PASS}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <HelpCircle className="w-4 h-4" /> PENDING / UNKNOWN
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{probeCounts.PENDING}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" /> FAIL
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{probeCounts.FAIL}</p>
            </div>
          </div>

          {probeResults.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No probes recorded in the last 30 days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Result</th>
                    <th className="py-2 pr-3">Recipient</th>
                    <th className="py-2 pr-3">Message</th>
                    <th className="py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {probeResults.slice(0, 50).map((r) => (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                        {format(new Date(r.created_at), 'd MMM HH:mm')}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant={statusVariant(r.status)}>
                          {badgeLabel(badgeForStatus(r.status))}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">{r.recipient_email}</td>
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => focusMessage(r.message_id)}
                          className="text-primary hover:underline text-xs"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-2 text-destructive text-xs max-w-sm whitespace-pre-wrap break-words">
                        {r.error_message ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">DSN failure breakdown — last 30 days</CardTitle>
          <CardDescription>
            All outbound templates, deduplicated by message ID and grouped by failure reason.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dsnBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">No delivery failures in the last 30 days. 🎉</p>
          ) : (
            <div className="space-y-2">
              {dsnBreakdown.map((b) => (
                <div key={b.reason} className="border rounded p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground text-sm">{b.reason}</span>
                    <Badge variant="destructive">{b.count}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last seen {formatDistanceToNow(new Date(b.latest), { addSuffix: true })}
                  </p>
                  {b.sample && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {b.sample}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Last successful delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {lastSent ? (
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Template:</span> {lastSent.template_name}</div>
                <div><span className="text-muted-foreground">When:</span> {formatDistanceToNow(new Date(lastSent.created_at), { addSuffix: true })}</div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Message ID:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">{lastSent.message_id ?? '—'}</code>
                  {lastSent.message_id && (
                    <button onClick={() => copyId(lastSent.message_id)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No successful sends recorded for this recipient.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> Last failure / DSN
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {lastFailure ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(lastFailure.status)}>{lastFailure.status}</Badge>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(lastFailure.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div><span className="text-muted-foreground">Template:</span> {lastFailure.template_name}</div>
                {lastFailure.error_message && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                    {lastFailure.error_message}
                  </pre>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No failures recorded for this recipient. 🎉</p>
            )}
          </CardContent>
        </Card>
      </div>

      {suppressions.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-4 h-4" /> Suppression list ({suppressions.length})
            </CardTitle>
            <CardDescription>
              This recipient is currently blocked from receiving mail. New sends will be skipped until removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {suppressions.map((s) => (
              <div key={s.id} className="border rounded p-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{s.reason}</Badge>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                  </span>
                </div>
                {s.metadata && (
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(s.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent send log for {recipient || '—'}</CardTitle>
          <CardDescription>Latest 50 rows, most recent first.</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No entries yet for this recipient.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Template</th>
                    <th className="py-2 pr-3">Message ID</th>
                    <th className="py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="py-2 pr-3">{r.template_name}</td>
                      <td className="py-2 pr-3">
                        {r.message_id ? (
                          <button
                            onClick={() => focusMessage(r.message_id)}
                            className="text-xs bg-muted px-1 py-0.5 rounded hover:underline"
                          >
                            {r.message_id.slice(0, 24)}
                          </button>
                        ) : (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">—</code>
                        )}
                      </td>
                      <td className="py-2 text-destructive text-xs max-w-md whitespace-pre-wrap break-words">
                        {r.error_message ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmailDeliverability;
