import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Mail, CheckCircle, XCircle, AlertTriangle, Clock, ChevronLeft, ChevronRight, BarChart3, Inbox, Send } from 'lucide-react';
import { format, subDays, subHours, startOfDay, startOfHour, eachDayOfInterval, eachHourOfInterval } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminInbox from './AdminInbox';
import SendTestEmail from '@/components/admin/SendTestEmail';

type TimeRange = '24h' | '7d' | '30d';
type ChartGranularity = 'daily' | 'hourly';

const PAGE_SIZE = 50;

const statusColors: Record<string, string> = {
  sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  dlq: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suppressed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  bounced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  complained: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const AdminEmails = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chartGranularity, setChartGranularity] = useState<ChartGranularity>('daily');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<(typeof rawLogs extends (infer T)[] ? T : never) | null>(null);

  const rangeStart = useMemo(() => {
    const now = new Date();
    if (timeRange === '24h') return subHours(now, 24).toISOString();
    if (timeRange === '7d') return subDays(now, 7).toISOString();
    return subDays(now, 30).toISOString();
  }, [timeRange]);

  const { data: rawLogs = [], isLoading } = useQuery({
    queryKey: ['email-logs', rangeStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log')
        .select('*')
        .gte('created_at', rangeStart)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const dedupLogs = useMemo(() => {
    const map = new Map<string, typeof rawLogs[0]>();
    for (const row of rawLogs) {
      const key = row.message_id ?? row.id;
      if (!map.has(key)) map.set(key, row);
    }
    return Array.from(map.values());
  }, [rawLogs]);

  const templates = useMemo(() => {
    const set = new Set(dedupLogs.map(l => l.template_name));
    return Array.from(set).sort();
  }, [dedupLogs]);

  const filtered = useMemo(() => {
    return dedupLogs.filter(l => {
      if (templateFilter !== 'all' && l.template_name !== templateFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      return true;
    });
  }, [dedupLogs, templateFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const sent = filtered.filter(l => l.status === 'sent').length;
    const failed = filtered.filter(l => ['dlq', 'failed'].includes(l.status)).length;
    const suppressed = filtered.filter(l => l.status === 'suppressed').length;
    return { total, sent, failed, suppressed };
  }, [filtered]);

  const chartData = useMemo(() => {
    const now = new Date();
    const start = new Date(rangeStart);
    const isHourly = chartGranularity === 'hourly';

    const buckets = isHourly
      ? eachHourOfInterval({ start, end: now })
      : eachDayOfInterval({ start, end: now });

    const bucketMap = new Map<string, { sent: number; failed: number; suppressed: number }>();
    for (const b of buckets) {
      const key = isHourly ? format(b, 'MM/dd HH:00') : format(b, 'MM/dd');
      bucketMap.set(key, { sent: 0, failed: 0, suppressed: 0 });
    }

    for (const log of filtered) {
      const d = new Date(log.created_at);
      const key = isHourly
        ? format(startOfHour(d), 'MM/dd HH:00')
        : format(startOfDay(d), 'MM/dd');
      const bucket = bucketMap.get(key);
      if (!bucket) continue;
      if (log.status === 'sent') bucket.sent++;
      else if (['dlq', 'failed'].includes(log.status)) bucket.failed++;
      else if (log.status === 'suppressed') bucket.suppressed++;
    }

    return Array.from(bucketMap.entries()).map(([label, counts]) => ({
      label,
      ...counts,
    }));
  }, [filtered, rangeStart, chartGranularity]);

  const chartConfig = {
    sent: { label: t('emails.sent'), color: 'hsl(142, 71%, 45%)' },
    failed: { label: t('emails.failed'), color: 'hsl(0, 84%, 60%)' },
    suppressed: { label: t('emails.suppressed'), color: 'hsl(25, 95%, 53%)' },
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const timeLabels: Record<TimeRange, string> = {
    '24h': t('emails.24h'),
    '7d': t('emails.7d'),
    '30d': t('emails.30d'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('emails.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('emails.subtitle')}</p>
        </div>
        <SendTestEmail />
      </div>

      <Tabs defaultValue="outbound" className="w-full">
        <TabsList>
          <TabsTrigger value="outbound" className="gap-2"><Send className="w-4 h-4" /> Outbound</TabsTrigger>
          <TabsTrigger value="inbound" className="gap-2"><Inbox className="w-4 h-4" /> Inbox</TabsTrigger>
        </TabsList>
        <TabsContent value="inbound" className="mt-4">
          <AdminInbox />
        </TabsContent>
        <TabsContent value="outbound" className="mt-4 space-y-6">

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {(['24h', '7d', '30d'] as TimeRange[]).map(r => (
            <Button
              key={r}
              size="sm"
              variant={timeRange === r ? 'default' : 'outline'}
              onClick={() => { setTimeRange(r); setChartGranularity(r === '24h' ? 'hourly' : 'daily'); setPage(0); }}
            >
              {timeLabels[r]}
            </Button>
          ))}
        </div>
        <Select value={templateFilter} onValueChange={v => { setTemplateFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('emails.all_templates')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('emails.all_templates')}</SelectItem>
            {templates.map(tpl => <SelectItem key={tpl} value={tpl}>{tpl}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('emails.all_statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('emails.all_statuses')}</SelectItem>
            <SelectItem value="sent">{t('emails.sent')}</SelectItem>
            <SelectItem value="dlq">{t('emails.failed')}</SelectItem>
            <SelectItem value="suppressed">{t('emails.suppressed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> {t('emails.total')}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" /> {t('emails.sent')}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.sent}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" /> {t('emails.failed')}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{stats.failed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" /> {t('emails.suppressed')}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{stats.suppressed}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Email Volume
          </CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant={chartGranularity === 'daily' ? 'default' : 'outline'} onClick={() => setChartGranularity('daily')}>Daily</Button>
            <Button size="sm" variant={chartGranularity === 'hourly' ? 'default' : 'outline'} onClick={() => setChartGranularity('hourly')}>Hourly</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sent" stackId="a" fill="var(--color-sent)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="suppressed" stackId="a" fill="var(--color-suppressed)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('emails.template')}</TableHead>
                  <TableHead>{t('emails.recipient')}</TableHead>
                  <TableHead>{t('emails.status')}</TableHead>
                  <TableHead>{t('emails.timestamp')}</TableHead>
                  <TableHead>{t('emails.error')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('emails.loading')}</span>
                    </TableCell>
                  </TableRow>
                ) : paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('emails.none')}
                    </TableCell>
                  </TableRow>
                ) : paged.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.template_name}</TableCell>
                    <TableCell className="text-sm">{log.recipient_email}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[log.status] ?? 'bg-muted text-muted-foreground'} variant="secondary">
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                      {log.error_message ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">
                {t('emails.page')} {page + 1} {t('emails.of')} {totalPages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmails;
