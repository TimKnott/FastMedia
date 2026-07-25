import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Send, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === 'sent') return 'default';
  if (status === 'pending') return 'secondary';
  if (status === 'suppressed') return 'outline';
  return 'destructive';
};

const AdminEmailDeliverability = () => {
  const [recipient, setRecipient] = useState(DEFAULT_RECIPIENT);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (email: string) => {
    setLoading(true);
    try {
      const [logRes, supRes] = await Promise.all([
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
      ]);
      if (logRes.error) throw logRes.error;
      if (supRes.error) throw supRes.error;
      setRows((logRes.data ?? []) as LogRow[]);
      setSuppressions((supRes.data ?? []) as SuppressionRow[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to load logs: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(DEFAULT_RECIPIENT);
  }, []);

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
      const { data, error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'deliverability-test',
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
      // Give the queue a moment to flush, then refresh
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
    () => rows.filter((r) => ['failed', 'dlq', 'bounced', 'complained', 'suppressed'].includes(r.status)),
    [rows],
  );

  const lastSent = useMemo(() => rows.find((r) => r.status === 'sent'), [rows]);
  const lastFailure = failedRows[0];

  const copyId = (id: string | null) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success('Copied');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Email deliverability</h1>
        <p className="text-muted-foreground text-sm">
          Send a probe email through the FastMedia outbound pipeline (notify.fastmedia.pro) and
          inspect the last delivery attempts, DSN failures, and suppression records for any recipient.
        </p>
      </div>

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
                Outbound probes to this address land in the Cloudflare Email Routing forwarder, which
                delivers to your Gmail. If the probe arrives in Gmail, both outbound (notify.fastmedia.pro)
                and inbound routing are healthy. If it doesn't, check the "Last failure" panel and DNS.
              </AlertDescription>
            </Alert>
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
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {r.message_id ? r.message_id.slice(0, 24) : '—'}
                        </code>
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
