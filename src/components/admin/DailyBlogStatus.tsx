import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Clock, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogRow {
  id: string;
  triggered_at: string;
  completed_at: string | null;
  status: string;
  topic: string | null;
  keyword: string | null;
  post_id: string | null;
  model: string | null;
  notes: string | null;
  error: string | null;
}

const DailyBlogStatus = () => {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_generation_log')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(10);
    setRows((data as LogRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const last = rows[0];
  const lastSuccess = rows.find((r) => r.status === 'success');
  const recentFailures = rows.filter((r) => r.status !== 'success' && r.status !== 'running');

  const statusBadge = (status: string) => {
    if (status === 'success')
      return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
    if (status === 'running')
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Running</Badge>;
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Daily Blog Status
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !last ? (
          <p className="text-sm text-muted-foreground">No blog generation runs recorded yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Last run</p>
                <div className="flex items-center gap-2">
                  {statusBadge(last.status)}
                  <span className="text-sm">{formatDistanceToNow(new Date(last.triggered_at), { addSuffix: true })}</span>
                </div>
                {last.topic && <p className="text-xs text-muted-foreground mt-2 truncate">Topic: {last.topic}</p>}
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Last successful run</p>
                {lastSuccess ? (
                  <>
                    <p className="text-sm font-medium">{formatDistanceToNow(new Date(lastSuccess.triggered_at), { addSuffix: true })}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{lastSuccess.topic || lastSuccess.keyword || '—'}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">None yet</p>
                )}
              </div>
            </div>

            {recentFailures.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Recent failures ({recentFailures.length})
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentFailures.slice(0, 5).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        {statusBadge(r.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.triggered_at), { addSuffix: true })}
                        </span>
                      </div>
                      {r.error && (
                        <p className="text-xs text-destructive font-mono whitespace-pre-wrap break-words mt-1">
                          {r.error.length > 400 ? r.error.slice(0, 400) + '…' : r.error}
                        </p>
                      )}
                      {r.notes && !r.error && (
                        <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Recent runs ({rows.length})
              </summary>
              <div className="mt-2 space-y-1">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {statusBadge(r.status)}
                      <span className="truncate text-muted-foreground">{r.topic || r.keyword || '—'}</span>
                    </div>
                    <span className="text-muted-foreground flex-shrink-0">
                      {new Date(r.triggered_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyBlogStatus;
