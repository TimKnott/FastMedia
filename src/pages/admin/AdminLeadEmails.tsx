import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, Mail, CheckCircle2, XCircle, Clock, AlertTriangle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  queued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  dlq: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suppressed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  bounced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  complained: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusIcon = (status: string) => {
  if (status === 'sent') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (['pending', 'queued'].includes(status)) return <Clock className="w-3.5 h-3.5" />;
  if (['suppressed'].includes(status)) return <AlertTriangle className="w-3.5 h-3.5" />;
  return <XCircle className="w-3.5 h-3.5" />;
};

const SCORE_LEAD_TEMPLATES = ['lead-notification', 'intake-received', 'admin-newsletter-notification'];

const AdminLeadEmails = () => {
  const [recipientQ, setRecipientQ] = useState('');
  const [keyQ, setKeyQ] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('score-lead');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: rawLogs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['lead-emails', recipientQ, keyQ, templateFilter, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('email_send_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (templateFilter === 'score-lead') {
        q = q.in('template_name', SCORE_LEAD_TEMPLATES);
      } else if (templateFilter !== 'all') {
        q = q.eq('template_name', templateFilter);
      }
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (recipientQ.trim()) q = q.ilike('recipient_email', `%${recipientQ.trim()}%`);
      if (keyQ.trim()) q = q.ilike('message_id', `%${keyQ.trim()}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Group by message_id (idempotency key) — show latest plus full status trail
  const grouped = useMemo(() => {
    const map = new Map<string, typeof rawLogs>();
    for (const row of rawLogs) {
      const key = row.message_id ?? row.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return Array.from(map.entries()).map(([key, rows]) => {
      const sorted = [...rows].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      return { key, latest: sorted[0], history: sorted };
    });
  }, [rawLogs]);

  const stats = useMemo(() => {
    const latest = grouped.map(g => g.latest);
    return {
      total: latest.length,
      sent: latest.filter(l => l.status === 'sent').length,
      pending: latest.filter(l => ['pending', 'queued'].includes(l.status)).length,
      failed: latest.filter(l => ['dlq', 'failed', 'bounced'].includes(l.status)).length,
    };
  }, [grouped]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lead Email Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search score-lead dispatches and inspect their queued/sent/failed status by idempotency key or recipient.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Recipient email…"
              value={recipientQ}
              onChange={(e) => setRecipientQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Idempotency key / message_id…"
              value={keyQ}
              onChange={(e) => setKeyQ(e.target.value)}
              className="pl-9 font-mono text-xs"
            />
          </div>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score-lead">Score-lead emails</SelectItem>
              <SelectItem value="lead-notification">lead-notification</SelectItem>
              <SelectItem value="intake-received">intake-received</SelectItem>
              <SelectItem value="admin-newsletter-notification">admin-newsletter-notification</SelectItem>
              <SelectItem value="all">All templates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="dlq">Failed (DLQ)</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" />Unique emails</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" />Sent</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{stats.sent}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" />Queued/Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-600">{stats.pending}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><XCircle className="w-4 h-4 text-red-600" />Failed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">{stats.failed}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idempotency Key</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Latest Status</TableHead>
                  <TableHead>History</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-muted-foreground" /><span className="text-muted-foreground">Loading…</span></TableCell></TableRow>
                ) : grouped.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No emails match your filters.</TableCell></TableRow>
                ) : grouped.map(({ key, latest, history }) => (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-xs max-w-[220px]">
                      <button onClick={() => copy(key)} className="flex items-center gap-1 hover:text-primary truncate w-full text-left" title={key}>
                        <Copy className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{key}</span>
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{latest.template_name}</TableCell>
                    <TableCell className="text-sm">{latest.recipient_email}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[latest.status] ?? 'bg-muted text-muted-foreground'} variant="secondary">
                        <span className="flex items-center gap-1">{statusIcon(latest.status)}{latest.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {history.slice().reverse().map(h => (
                          <span key={h.id} title={`${h.status} @ ${format(new Date(h.created_at), 'HH:mm:ss')}`} className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[h.status] ?? 'bg-muted'}`}>
                            {h.status}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(latest.created_at), 'dd.MM.yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-xs text-destructive max-w-[240px] truncate" title={latest.error_message ?? ''}>
                      {latest.error_message ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeadEmails;
