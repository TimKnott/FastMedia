import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Activity, AlertCircle, CheckCircle2, EyeOff, PlayCircle, RefreshCw } from 'lucide-react';

interface AuditRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  urls_checked: number;
  issues_found: number;
  health_score: number | null;
  triggered_by: string;
}

interface Finding {
  id: string;
  url: string;
  check_id: string;
  severity: 'high' | 'medium' | 'low';
  current_value: string | null;
  expected_value: string | null;
  message: string | null;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  ignored_at: string | null;
  ignored_reason: string | null;
}

const severityBadge = (sev: Finding['severity']) => {
  const variants: Record<string, string> = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-muted text-muted-foreground',
  };
  return <Badge className={variants[sev]}>{sev}</Badge>;
};

const AdminSEOHealth = () => {
  const [runs, setRuns] = useState<AuditRun[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState('');
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: runRows }, { data: findRows }] = await Promise.all([
      supabase.from('seo_audit_runs').select('*').order('started_at', { ascending: false }).limit(30),
      supabase
        .from('seo_audit_findings')
        .select('*')
        .is('resolved_at', null)
        .is('ignored_at', null)
        .order('severity', { ascending: true })
        .order('last_seen_at', { ascending: false })
        .limit(500),
    ]);
    setRuns((runRows ?? []) as AuditRun[]);
    setFindings((findRows ?? []) as Finding[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke('seo-daily-audit', {
        body: { triggered_by: 'manual' },
      });
      if (error) throw error;
      toast.success('Audit completed — refreshing results.');
      await load();
    } catch (err) {
      toast.error(`Audit failed: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const markFixed = async (f: Finding) => {
    const { error } = await supabase
      .from('seo_audit_findings')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', f.id);
    if (error) return toast.error(error.message);
    toast.success('Marked as fixed. Next audit will re-verify.');
    setFindings((prev) => prev.filter((p) => p.id !== f.id));
  };

  const ignore = async (f: Finding, reason: string) => {
    const { error } = await supabase
      .from('seo_audit_findings')
      .update({ ignored_at: new Date().toISOString(), ignored_reason: reason })
      .eq('id', f.id);
    if (error) return toast.error(error.message);
    toast.success('Finding ignored.');
    setFindings((prev) => prev.filter((p) => p.id !== f.id));
  };

  const latest = runs[0];
  const grouped = findings.reduce<Record<string, Finding[]>>((acc, f) => {
    (acc[f.check_id] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> SEO Health Monitor
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily site-wide crawl that replicates the checks an external tool like SiteGuru performs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={runNow} disabled={running}>
            <PlayCircle className="w-4 h-4 mr-1" /> {running ? 'Running…' : 'Run audit now'}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Health score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{latest?.health_score ?? '—'}</div>
            <div className="text-xs text-muted-foreground">
              {latest ? `Last run ${new Date(latest.started_at).toLocaleString()}` : 'No runs yet'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">URLs checked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{latest?.urls_checked ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">Open findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{findings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">High severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">
              {findings.filter((f) => f.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="findings">
        <TabsList>
          <TabsTrigger value="findings">Findings ({findings.length})</TabsTrigger>
          <TabsTrigger value="history">Run history ({runs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4">
          {Object.keys(grouped).length === 0 && !loading && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-primary" />
                No open findings. Site is healthy.
              </CardContent>
            </Card>
          )}
          {Object.entries(grouped).map(([checkId, rows]) => (
            <Card key={checkId}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    {checkId}
                  </span>
                  <Badge variant="outline">{rows.length} page{rows.length === 1 ? '' : 's'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-xs">
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {f.url.replace('https://www.fastmedia.pro', '') || '/'}
                          </a>
                        </TableCell>
                        <TableCell>{severityBadge(f.severity)}</TableCell>
                        <TableCell className="text-xs">{f.current_value ?? '—'}</TableCell>
                        <TableCell className="text-xs">{f.expected_value ?? '—'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => markFixed(f)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fixed
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setActiveFinding(f)}>
                                <EyeOff className="w-3.5 h-3.5 mr-1" /> Ignore
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ignore this finding</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Suppress {checkId} on {f.url}. Please give a reason for the audit trail.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Why are you ignoring this?"
                                value={ignoreReason}
                                onChange={(e) => setIgnoreReason(e.target.value)}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIgnoreReason('')}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    if (!activeFinding || !ignoreReason.trim()) return;
                                    await ignore(activeFinding, ignoreReason.trim());
                                    setIgnoreReason('');
                                    setActiveFinding(null);
                                  }}
                                >
                                  Ignore
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>URLs</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{new Date(r.started_at).toLocaleString()}</TableCell>
                      <TableCell>{r.urls_checked}</TableCell>
                      <TableCell>{r.issues_found}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.health_score ?? '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.triggered_by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEOHealth;
