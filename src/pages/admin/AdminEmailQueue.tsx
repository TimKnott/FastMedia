import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, Inbox, Zap } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

type QueueRow = { msg_id: number; read_ct: number; enqueued_at: string; vt: string; message: Record<string, unknown> };
type Status = {
  generated_at: string;
  queues: {
    auth: { depth: number | null; dlq_depth: number | null; inflight: QueueRow[]; dlq_sample: QueueRow[] };
    transactional: { depth: number | null; dlq_depth: number | null; inflight: QueueRow[]; dlq_sample: QueueRow[] };
  };
  cron: { active: boolean; schedule?: string; jobname?: string };
  state: {
    batch_size?: number | null;
    send_delay_ms?: number | null;
    retry_after_until?: string | null;
    auth_ttl_seconds?: number | null;
    transactional_ttl_seconds?: number | null;
  } | null;
  recent_dispatch_calls: Array<{ id: number; status_code: number | null; created: string; error_msg: string | null; content: string | null }>;
};

const AdminEmailQueue = () => {
  const statusQuery = useQuery({
    queryKey: ['admin-email-queue-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<Status>('admin-email-queue-status');
      if (error) throw error;
      return data!;
    },
    refetchInterval: 15_000,
  });

  const failuresQuery = useQuery({
    queryKey: ['admin-email-queue-failures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log')
        .select('id, message_id, template_name, recipient_email, status, error_message, created_at, metadata')
        .in('status', ['dlq', 'failed', 'bounced'])
        .gte('created_at', new Date(Date.now() - 7 * 86_400_000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });

  const activityQuery = useQuery({
    queryKey: ['admin-email-queue-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log')
        .select('id, message_id, template_name, recipient_email, status, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 15_000,
  });

  const status = statusQuery.data;
  const backoffActive = status?.state?.retry_after_until && new Date(status.state.retry_after_until) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Email Queue Health
          </h1>
          <p className="text-sm text-muted-foreground">
            Live view of <code>email_queue_dispatch</code> and <code>email_queue_wake</code> activity, retry state, and dead-letter queues.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            statusQuery.refetch();
            failuresQuery.refetch();
            activityQuery.refetch();
          }}
          disabled={statusQuery.isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${statusQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Auth queue depth"
          value={status?.queues.auth.depth ?? '—'}
          hint={`DLQ: ${status?.queues.auth.dlq_depth ?? '—'}`}
          tone={((status?.queues.auth.depth ?? 0) > 20) ? 'warn' : 'ok'}
        />
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Transactional queue depth"
          value={status?.queues.transactional.depth ?? '—'}
          hint={`DLQ: ${status?.queues.transactional.dlq_depth ?? '—'}`}
          tone={((status?.queues.transactional.depth ?? 0) > 20) ? 'warn' : 'ok'}
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Dispatch cron"
          value={status?.cron.active ? 'Active' : (status?.cron.jobname ? 'Paused' : 'Idle')}
          hint={status?.cron.schedule ?? 'Scheduled on demand'}
          tone={status?.cron.active ? 'ok' : ((status?.queues.auth.depth ?? 0) + (status?.queues.transactional.depth ?? 0) > 0 ? 'warn' : 'muted')}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Rate-limit backoff"
          value={backoffActive ? 'Holding' : 'Clear'}
          hint={backoffActive
            ? `Until ${format(new Date(status!.state!.retry_after_until!), 'HH:mm:ss')}`
            : `Batch ${status?.state?.batch_size ?? '—'} · delay ${status?.state?.send_delay_ms ?? '—'}ms`}
          tone={backoffActive ? 'warn' : 'ok'}
        />
      </div>

      <Tabs defaultValue="failures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="failures">Failures & DLQ</TabsTrigger>
          <TabsTrigger value="inflight">Retrying now</TabsTrigger>
          <TabsTrigger value="activity">Recent activity</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch calls</TabsTrigger>
        </TabsList>

        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Failed sends (last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {failuresQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : failuresQuery.data && failuresQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failuresQuery.data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.template_name}</TableCell>
                        <TableCell className="text-xs">{row.recipient_email}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-[10px] uppercase">{row.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate text-xs text-muted-foreground" title={row.error_message ?? ''}>
                          {row.error_message ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyOK label="No failures recorded in the last 7 days." />
              )}
            </CardContent>
          </Card>

          {status && ((status.queues.auth.dlq_sample.length + status.queues.transactional.dlq_sample.length) > 0) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Dead-letter queue payloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DlqList title="Auth DLQ" rows={status.queues.auth.dlq_sample} />
                <DlqList title="Transactional DLQ" rows={status.queues.transactional.dlq_sample} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inflight">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages currently retrying</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InflightList title="Auth queue" rows={status?.queues.auth.inflight ?? []} />
              <InflightList title="Transactional queue" rows={status?.queues.transactional.inflight ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest send log entries</CardTitle>
            </CardHeader>
            <CardContent>
              {activityQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityQuery.data?.map((row) => {
                      const attempt = (row.metadata as { attempt?: number } | null)?.attempt;
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.template_name}</TableCell>
                          <TableCell className="text-xs">{row.recipient_email}</TableCell>
                          <TableCell>
                            <StatusBadge status={row.status} />
                          </TableCell>
                          <TableCell className="text-xs">{attempt ?? '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent net.http_post responses</CardTitle>
              <p className="text-xs text-muted-foreground">
                Outbound calls made by <code>email_queue_dispatch</code> and <code>email_queue_wake</code> to the queue worker.
              </p>
            </CardHeader>
            <CardContent>
              {status?.recent_dispatch_calls?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>HTTP status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status.recent_dispatch_calls.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(row.created), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.status_code && row.status_code < 400 ? 'secondary' : 'destructive'}>
                            {row.status_code ?? 'no-response'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate text-xs text-muted-foreground" title={row.error_msg ?? ''}>
                          {row.error_msg ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Dispatch call history is unavailable (the <code>net</code> schema is not exposed). Queue health is still tracked above.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {status && (
        <p className="text-xs text-muted-foreground text-right">
          Last refreshed {format(new Date(status.generated_at), 'PPpp')}
        </p>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone: 'ok' | 'warn' | 'muted';
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground flex items-center gap-2">{icon}{label}</p>
        {tone === 'warn'
          ? <AlertTriangle className="h-4 w-4 text-yellow-500" />
          : tone === 'ok'
            ? <CheckCircle className="h-4 w-4 text-green-500" />
            : null}
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dlq: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    bounced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    suppressed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };
  return <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium uppercase rounded ${map[status] ?? 'bg-muted text-muted-foreground'}`}>{status}</span>;
};

const InflightList = ({ title, rows }: { title: string; rows: QueueRow[] }) => (
  <div>
    <h4 className="text-sm font-medium mb-2">{title}</h4>
    {rows.length === 0 ? (
      <EmptyOK label="No messages currently being retried." />
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Msg</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Enqueued</TableHead>
            <TableHead>Visible again</TableHead>
            <TableHead>Recipient</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const recipient = (r.message as { recipient_email?: string; email?: string })?.recipient_email
              ?? (r.message as { recipient_email?: string; email?: string })?.email
              ?? '—';
            return (
              <TableRow key={r.msg_id}>
                <TableCell className="font-mono text-xs">#{r.msg_id}</TableCell>
                <TableCell>
                  <Badge variant={r.read_ct >= 3 ? 'destructive' : 'secondary'}>{r.read_ct}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.enqueued_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.vt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-xs">{recipient}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </div>
);

const DlqList = ({ title, rows }: { title: string; rows: QueueRow[] }) => (
  <div>
    <h4 className="text-sm font-medium mb-2">{title} ({rows.length})</h4>
    {rows.length === 0 ? (
      <EmptyOK label="Empty." />
    ) : (
      <div className="space-y-2">
        {rows.map((r) => {
          const msg = r.message as { template_name?: string; recipient_email?: string; email?: string };
          return (
            <div key={r.msg_id} className="border rounded-md p-3 text-xs bg-muted/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono">#{r.msg_id} · {msg.template_name ?? 'unknown'}</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(r.enqueued_at), { addSuffix: true })} · {r.read_ct} attempts
                </span>
              </div>
              <div className="text-muted-foreground">To: {msg.recipient_email ?? msg.email ?? '—'}</div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const EmptyOK = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
    <CheckCircle className="h-4 w-4 text-green-500" />
    {label}
  </div>
);

export default AdminEmailQueue;
