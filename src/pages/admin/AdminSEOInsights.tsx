import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RefreshCw, Loader2, AlertTriangle, CheckCircle2, Plus, Trash2, Shield, TrendingUp, AlertCircle, Info, Download } from 'lucide-react';

interface Property { id: string; site_url: string; display_name: string; is_active: boolean; last_synced_at: string | null; last_eat_audit_at: string | null; }
interface Snapshot { id: string; property_id: string; week_start: string; dimension: string; metrics: any[]; }
interface Issue { id: string; severity: 'critical'|'warning'|'info'; category: string; title: string; detail: string | null; suggested_fix: string | null; url: string | null; status: string; created_at: string; }
interface EatAudit { id: string; overall_score: number; expertise_score: number; authority_score: number; trust_score: number; signals: Record<string, { pass: boolean; score: number; detail: string }>; run_at: string; }

const sevIcon = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const sevColor = { critical: 'text-destructive', warning: 'text-yellow-500', info: 'text-blue-500' };

function downloadCsv(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const AdminSEOInsights = () => {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>('');
  const [newUrl, setNewUrl] = useState(''); const [newName, setNewName] = useState('');

  const { data: properties = [] } = useQuery({
    queryKey: ['seo-properties'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_properties').select('*').order('display_name');
      if (error) throw error; return data as Property[];
    },
  });

  const activeId = selectedId || properties[0]?.id || '';
  const activeProp = properties.find(p => p.id === activeId);

  const { data: snapshots = [] } = useQuery({
    queryKey: ['seo-snapshots', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_snapshots').select('*').eq('property_id', activeId).order('week_start', { ascending: false }).limit(20);
      if (error) throw error; return data as Snapshot[];
    },
  });

  const { data: sitemaps = [] } = useQuery({
    queryKey: ['seo-sitemaps', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_sitemaps').select('*').eq('property_id', activeId);
      if (error) throw error; return data as any[];
    },
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['seo-issues', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_issues').select('*').eq('property_id', activeId).eq('status', 'open').order('severity').order('created_at', { ascending: false });
      if (error) throw error; return data as Issue[];
    },
  });

  const { data: freshness = [] } = useQuery({
    queryKey: ['seo-freshness', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_content_freshness').select('*').eq('property_id', activeId).order('days_since_update', { ascending: false }).limit(100);
      if (error) throw error; return data as any[];
    },
  });

  const { data: schemaAudits = [] } = useQuery({
    queryKey: ['seo-schema', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_schema_audits').select('*').eq('property_id', activeId).order('audited_at', { ascending: false }).limit(200);
      if (error) throw error; return data as any[];
    },
  });

  const { data: voiceQueries = [] } = useQuery({
    queryKey: ['seo-voice', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_voice_queries').select('*').eq('property_id', activeId).order('impressions', { ascending: false }).limit(50);
      if (error) throw error; return data as any[];
    },
  });

  const { data: keywordGaps = [] } = useQuery({
    queryKey: ['seo-gaps', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_keyword_gaps').select('*').eq('property_id', activeId).order('volume', { ascending: false }).limit(50);
      if (error) throw error; return data as any[];
    },
  });

  const { data: latestAudit } = useQuery({
    queryKey: ['seo-eat', activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase.from('eat_audits').select('*').eq('property_id', activeId).order('run_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error; return data as unknown as EatAudit | null;
    },
  });

  const addProperty = useMutation({
    mutationFn: async () => {
      const url = newUrl.endsWith('/') ? newUrl : newUrl + '/';
      const { error } = await supabase.from('seo_properties').insert({ site_url: url, display_name: newName || url });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Property added'); setNewUrl(''); setNewName(''); qc.invalidateQueries({ queryKey: ['seo-properties'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProp = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('seo_properties').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries({ queryKey: ['seo-properties'] }); },
  });

  const runJob = useMutation({
    mutationFn: async (job: 'sync' | 'eat') => {
      const { data, error } = await supabase.functions.invoke('seo-run-now', { body: { job, propertyId: activeId } });
      if (error) throw error; return data;
    },
    onSuccess: (_, job) => {
      toast.success(`${job === 'eat' ? 'E-A-T audit' : 'Search Console sync'} completed`);
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resolveIssue = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('seo_issues').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seo-issues', activeId] }),
  });

  const daily = (snapshots.find(s => s.dimension === 'daily')?.metrics ?? []).map((r: any) => ({
    date: r.keys?.[0], clicks: r.clicks ?? 0, impressions: r.impressions ?? 0,
  })).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  const keywords = (snapshots.find(s => s.dimension === 'keyword')?.metrics ?? []) as any[];
  const pages = (snapshots.find(s => s.dimension === 'page')?.metrics ?? []) as any[];
  const devices = (snapshots.find(s => s.dimension === 'device')?.metrics ?? []) as any[];
  const countries = (snapshots.find(s => s.dimension === 'country')?.metrics ?? []) as any[];

  const totalClicks = daily.reduce((a, r) => a + r.clicks, 0);
  const totalImpr = daily.reduce((a, r) => a + r.impressions, 0);

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2"><TrendingUp className="w-7 h-7 text-primary" /> SEO Insights</h1>
          <p className="text-muted-foreground mt-1">Search Console performance, index coverage, and E-A-T health for your properties.</p>
        </div>
        <div className="flex gap-2 items-center">
          {properties.length > 0 && (
            <Select value={activeId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => runJob.mutate('sync')} disabled={!activeId || runJob.isPending} variant="outline">
            {runJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync GSC
          </Button>
          <Button onClick={() => runJob.mutate('eat')} disabled={!activeId || runJob.isPending}>
            {runJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Run E-A-T
          </Button>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardHeader><CardTitle>No properties yet</CardTitle><CardDescription>Add a Google Search Console property to begin.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Site URL</Label><Input placeholder="https://www.fastmedia.pro/" value={newUrl} onChange={e => setNewUrl(e.target.value)} /></div>
              <div><Label>Display name</Label><Input placeholder="FastMedia.pro" value={newName} onChange={e => setNewName(e.target.value)} /></div>
            </div>
            <Button onClick={() => addProperty.mutate()} disabled={!newUrl}><Plus className="w-4 h-4 mr-1" /> Add property</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="eat">E-A-T</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="issues">Issues {issues.length > 0 && <Badge variant="destructive" className="ml-2">{issues.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardDescription>28-day Clicks</CardDescription><CardTitle className="text-3xl">{totalClicks.toLocaleString()}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardDescription>Impressions</CardDescription><CardTitle className="text-3xl">{totalImpr.toLocaleString()}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardDescription>E-A-T Score</CardDescription><CardTitle className="text-3xl">{latestAudit?.overall_score ?? '—'}<span className="text-base text-muted-foreground">/100</span></CardTitle></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardDescription>Open Issues</CardDescription><CardTitle className="text-3xl">{issues.length}</CardTitle></CardHeader></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Clicks & impressions (last 28 days)</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                {daily.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={daily}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line yAxisId="l" type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      <Line yAxisId="r" type="monotone" dataKey="impressions" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm">No data yet. Click "Sync GSC" to fetch.</p>}
              </CardContent>
            </Card>
            {issues.slice(0, 5).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Top issues</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {issues.slice(0, 5).map(i => {
                    const Icon = sevIcon[i.severity];
                    return (
                      <div key={i.id} className="flex items-start gap-2 text-sm">
                        <Icon className={`w-4 h-4 mt-0.5 ${sevColor[i.severity]}`} />
                        <div><span className="font-medium">{i.title}</span>{i.detail && <span className="text-muted-foreground"> — {i.detail}</span>}</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top keywords</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => downloadCsv(keywords.map((r: any) => ({ keyword: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: (r.ctr * 100).toFixed(2), position: r.position?.toFixed(1) })), 'keywords.csv')}><Download className="w-4 h-4 mr-1" />CSV</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Keyword</TableHead><TableHead className="text-right">Clicks</TableHead><TableHead className="text-right">Impr.</TableHead><TableHead className="text-right">CTR</TableHead><TableHead className="text-right">Pos.</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {keywords.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center">No data — run a sync.</TableCell></TableRow>}
                    {keywords.slice(0, 50).map((r: any, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.keys?.[0]}</TableCell>
                        <TableCell className="text-right">{r.clicks}</TableCell>
                        <TableCell className="text-right">{r.impressions}</TableCell>
                        <TableCell className="text-right">{(r.ctr * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{r.position?.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Top pages</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Page</TableHead><TableHead className="text-right">Clicks</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {pages.slice(0, 15).map((r: any, i) => (
                        <TableRow key={i}><TableCell className="truncate max-w-xs">{r.keys?.[0]}</TableCell><TableCell className="text-right">{r.clicks}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Devices & countries</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Devices</h4>
                    {devices.map((r: any, i) => <div key={i} className="flex justify-between text-sm"><span className="capitalize">{r.keys?.[0].toLowerCase()}</span><span>{r.clicks} clicks</span></div>)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Top countries</h4>
                    {countries.slice(0, 5).map((r: any, i) => <div key={i} className="flex justify-between text-sm"><span className="uppercase">{r.keys?.[0]}</span><span>{r.clicks} clicks</span></div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Sitemaps</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Last downloaded</TableHead><TableHead>Errors</TableHead><TableHead>Warnings</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {sitemaps.length === 0 && <TableRow><TableCell colSpan={4} className="text-muted-foreground text-center">No sitemaps tracked yet.</TableCell></TableRow>}
                    {sitemaps.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="truncate max-w-md">{s.sitemap_url}</TableCell>
                        <TableCell>{s.last_downloaded ? new Date(s.last_downloaded).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{s.errors > 0 ? <Badge variant="destructive">{s.errors}</Badge> : s.errors}</TableCell>
                        <TableCell>{s.warnings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eat" className="space-y-4">
            {!latestAudit ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No audit yet. Click "Run E-A-T" above.</CardContent></Card>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card><CardHeader className="pb-2"><CardDescription>Overall</CardDescription><CardTitle className="text-3xl">{latestAudit.overall_score}</CardTitle></CardHeader></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>Expertise</CardDescription><CardTitle className="text-3xl">{latestAudit.expertise_score}</CardTitle></CardHeader></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>Authority</CardDescription><CardTitle className="text-3xl">{latestAudit.authority_score}</CardTitle></CardHeader></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>Trust</CardDescription><CardTitle className="text-3xl">{latestAudit.trust_score}</CardTitle></CardHeader></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Signal breakdown</CardTitle><CardDescription>Last run {new Date(latestAudit.run_at).toLocaleString()}</CardDescription></CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(latestAudit.signals).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-3 text-sm border-b pb-2 last:border-0">
                        {v.pass ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                        <div className="flex-1"><span className="font-medium capitalize">{k.replace(/_/g, ' ')}</span> <span className="text-muted-foreground">— {v.detail}</span></div>
                        <Badge variant="outline">{v.score} pts</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => runJob.mutate('freshness' as any)} disabled={runJob.isPending}>
                <RefreshCw className="w-4 h-4 mr-1" />Refresh freshness
              </Button>
              <Button size="sm" variant="outline" onClick={() => runJob.mutate('schema' as any)} disabled={runJob.isPending}>
                <Shield className="w-4 h-4 mr-1" />Validate schema
              </Button>
              <Button size="sm" variant="ghost" onClick={() => downloadCsv(freshness, 'content-freshness.csv')}>
                <Download className="w-4 h-4 mr-1" />Export CSV
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Blog & vlog content freshness</CardTitle>
                <CardDescription>Posts older than 90 days or with declining traffic are flagged for refresh.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Age (days)</TableHead>
                    <TableHead className="text-right">Clicks 28d</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {freshness.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground text-center">No freshness data yet — run "Refresh freshness".</TableCell></TableRow>}
                    {freshness.slice(0, 50).map((r) => {
                      const stale = (r.days_since_update ?? 0) > 90;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="truncate max-w-xs text-sm"><a href={r.url} target="_blank" rel="noreferrer" className="hover:underline">{r.url.replace(/^https?:\/\/[^/]+/, '')}</a></TableCell>
                          <TableCell className="text-right">{stale ? <Badge variant="destructive">{r.days_since_update}</Badge> : (r.days_since_update ?? '—')}</TableCell>
                          <TableCell className="text-right">{r.clicks_28d ?? 0}</TableCell>
                          <TableCell className="text-right">{r.impressions_28d ?? 0}</TableCell>
                          <TableCell><Badge variant={r.trend === 'declining' ? 'destructive' : r.trend === 'rising' ? 'default' : 'outline'}>{r.trend ?? '—'}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.recommendation ?? '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Structured data (FAQ / HowTo / Article)</CardTitle>
                <CardDescription>Schema markup discovered per page. Errors block rich results in Google.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>URL</TableHead><TableHead>Schemas found</TableHead><TableHead>Errors</TableHead><TableHead>Warnings</TableHead><TableHead>Suggested fix</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {schemaAudits.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground text-center">No audits yet — run "Validate schema".</TableCell></TableRow>}
                    {schemaAudits.slice(0, 50).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="truncate max-w-xs text-sm">{r.url.replace(/^https?:\/\/[^/]+/, '')}</TableCell>
                        <TableCell className="text-sm">{Array.isArray(r.schemas_found) && r.schemas_found.length ? r.schemas_found.map((s: string) => <Badge key={s} variant="outline" className="mr-1">{s}</Badge>) : <span className="text-muted-foreground">none</span>}</TableCell>
                        <TableCell>{Array.isArray(r.errors) && r.errors.length > 0 ? <Badge variant="destructive">{r.errors.length}</Badge> : <CheckCircle2 className="w-4 h-4 text-green-500" />}</TableCell>
                        <TableCell>{Array.isArray(r.warnings) && r.warnings.length > 0 ? <Badge variant="outline">{r.warnings.length}</Badge> : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.recommendation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Featured snippet opportunities</CardTitle>
                  <CardDescription>Question-style queries with impressions — strong candidates for FAQ blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Query</TableHead><TableHead className="text-right">Impr.</TableHead><TableHead className="text-right">Pos.</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {voiceQueries.length === 0 && <TableRow><TableCell colSpan={3} className="text-muted-foreground text-center text-sm">Run a GSC sync to populate.</TableCell></TableRow>}
                      {voiceQueries.slice(0, 20).map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="text-sm">{q.query}</TableCell>
                          <TableCell className="text-right">{q.impressions}</TableCell>
                          <TableCell className="text-right">{q.position?.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitor keyword gaps</CardTitle>
                  <CardDescription>Keywords competitors rank for but you don't — prime blog/vlog topics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Keyword</TableHead><TableHead className="text-right">Volume</TableHead><TableHead className="text-right">Competitor</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {keywordGaps.length === 0 && <TableRow><TableCell colSpan={3} className="text-muted-foreground text-center text-sm">Run Semrush sync to populate.</TableCell></TableRow>}
                      {keywordGaps.slice(0, 20).map((g) => (
                        <TableRow key={g.id}>
                          <TableCell className="text-sm">{g.keyword}</TableCell>
                          <TableCell className="text-right">{g.volume ?? '—'}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{g.competitor_domain ?? '—'} #{g.competitor_position ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-2">
            {issues.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2"><CheckCircle2 className="w-8 h-8 text-green-500" />No open issues.</CardContent></Card>
            ) : issues.map(i => {
              const Icon = sevIcon[i.severity];
              return (
                <Card key={i.id}>
                  <CardContent className="pt-4 flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${sevColor[i.severity]}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2"><span className="font-medium">{i.title}</span><Badge variant="outline" className="text-xs">{i.category}</Badge></div>
                      {i.detail && <p className="text-sm text-muted-foreground">{i.detail}</p>}
                      {i.suggested_fix && <p className="text-sm"><span className="font-medium">Fix:</span> {i.suggested_fix}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => resolveIssue.mutate(i.id)}>Resolve</Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Add property</CardTitle><CardDescription>Use the exact site URL as registered in Google Search Console (with trailing slash).</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Site URL</Label><Input placeholder="https://www.fastmedia.pro/" value={newUrl} onChange={e => setNewUrl(e.target.value)} /></div>
                  <div><Label>Display name</Label><Input placeholder="FastMedia.pro" value={newName} onChange={e => setNewName(e.target.value)} /></div>
                </div>
                <Button onClick={() => addProperty.mutate()} disabled={!newUrl}><Plus className="w-4 h-4 mr-1" />Add</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Connected properties</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>URL</TableHead><TableHead>Active</TableHead><TableHead>Last sync</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {properties.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.display_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.site_url}</TableCell>
                        <TableCell><Switch checked={p.is_active} onCheckedChange={async (v) => { await supabase.from('seo_properties').update({ is_active: v }).eq('id', p.id); qc.invalidateQueries({ queryKey: ['seo-properties'] }); }} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.last_synced_at ? new Date(p.last_synced_at).toLocaleString() : 'Never'}</TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => deleteProp.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {activeProp && <p className="text-xs text-muted-foreground">Automatic schedule: GSC sync runs weekly (Mon 06:00 UTC), E-A-T audit monthly (1st 06:00 UTC). Use the buttons above to run on demand.</p>}
    </div>
  );
};

export default AdminSEOInsights;
