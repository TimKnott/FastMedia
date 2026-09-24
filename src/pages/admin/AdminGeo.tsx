import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, Download, Loader2, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { download, itemToHtml, itemToMarkdown, toCsv, type ExportItem } from '@/lib/geoExport';

// Loosely typed table access — these tables are new and admin-only.
const t = (name: string) => (supabase as unknown as { from: (n: string) => any }).from(name);

type Issue = { severity: 'high' | 'medium' | 'low'; code: string; message: string };
interface PageAudit {
  id: string; run_id: string; url: string; path: string; http_status: number; title: string; description: string;
  h1: string | null; word_count: number; scores: Record<string, boolean>; issues: Issue[]; schema_types: string[];
  headings: { level: number; text: string }[]; internal_links: number; text_excerpt: string; created_at: string;
}
interface Fact { id: string; fact_key: string; label: string; value: string; source: string; verified: boolean; verified_at: string | null }
interface Claim { id: string; path: string; claim: string; claim_type: string; status: string; note: string | null }
interface Plan { id: string; page_type: string; search_intent: string; audience: string; primary_question: string; title: string; url: string; h1: string; outline: string[]; internal_links: string[]; required_facts: string[]; schema_types: string[]; needs_approval: boolean; status: string }
interface Competitor { id: string; name: string | null; url: string; report: any; analysed_at: string | null }
interface Item extends ExportItem { id: string; language: string; before_content: string | null; history: { at: string; action: string; by?: string }[]; created_at: string }
interface SchemaBlock { id: string; page_path: string; schema_type: string; json_ld: unknown; validated: boolean; validation_notes: string | null; status: string }
interface Observation { id: string; observed_on: string; platform: string; query: string; country: string; language: string; device: string; source_url: string | null; cited: boolean; mentioned: boolean; quote: string | null }

const sevColour: Record<string, 'destructive' | 'secondary' | 'outline'> = { high: 'destructive', medium: 'secondary', low: 'outline' };
const invoke = async (fn: string, body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    const ctx = (error as any)?.context;
    let msg = error.message;
    try { const j = JSON.parse(await ctx.text()); msg = typeof j.error === 'string' ? j.error : JSON.stringify(j.error); } catch { /* keep */ }
    throw new Error(msg);
  }
  return data;
};
const useRows = <T,>(key: string, q: () => Promise<{ data: T[] | null }>) =>
  useQuery({ queryKey: ['geo', key], queryFn: async () => (await q()).data ?? [] });

const SCHEMA_REQUIRED: Record<string, string[]> = {
  Organization: ['name', 'url'], LocalBusiness: ['name', 'address'], WebSite: ['name', 'url'], Service: ['name', 'provider'],
  FAQPage: ['mainEntity'], Article: ['headline', 'datePublished', 'author'], BreadcrumbList: ['itemListElement'], Review: ['author', 'reviewBody', 'itemReviewed'],
};
const validateSchema = (type: string, raw: string): { ok: boolean; notes: string; value?: unknown } => {
  let v: any;
  try { v = JSON.parse(raw); } catch (e) { return { ok: false, notes: `Not valid JSON: ${(e as Error).message}` }; }
  const problems: string[] = [];
  if (v['@context'] !== 'https://schema.org') problems.push('@context should be "https://schema.org".');
  if (v['@type'] !== type) problems.push(`@type should be "${type}".`);
  for (const k of SCHEMA_REQUIRED[type] ?? []) if (v[k] == null || v[k] === '') problems.push(`Missing required property "${k}".`);
  const str = JSON.stringify(v).toLowerCase();
  if (/aggregaterating|ratingvalue/.test(str) && type !== 'Review') problems.push('Ratings found — only add ratings from genuine, permitted reviews.');
  if (/\b(award|iso ?\d+|accredit)/.test(str)) problems.push('Contains award/credential wording — confirm it is documented.');
  return { ok: problems.length === 0, notes: problems.join(' ') || 'Looks valid.', value: v };
};

export default function AdminGeo() {
  const qc = useQueryClient();
  const refresh = (k?: string) => qc.invalidateQueries({ queryKey: k ? ['geo', k] : ['geo'] });
  const [busy, setBusy] = useState<string | null>(null);

  const runs = useRows<any>('runs', () => t('geo_audit_runs').select('*').order('started_at', { ascending: false }).limit(10));
  const latestRun = runs.data?.find((r: any) => r.status === 'done');
  const pages = useQuery({
    queryKey: ['geo', 'pages', latestRun?.id],
    enabled: !!latestRun?.id,
    queryFn: async () => ((await t('geo_page_audits').select('*').eq('run_id', latestRun.id).order('path')).data ?? []) as PageAudit[],
  });
  const facts = useRows<Fact>('facts', () => t('geo_business_facts').select('*').order('sort_order'));
  const locked = useRows<{ id: string; path: string; reason: string | null }>('locked', () => t('geo_locked_pages').select('*').order('path'));
  const claims = useRows<Claim>('claims', () => t('geo_claims').select('*').order('path').limit(1000));
  const plan = useRows<Plan>('plan', () => t('geo_content_plan').select('*').order('created_at', { ascending: false }));
  const comps = useRows<Competitor>('comps', () => t('geo_competitors').select('*').order('created_at'));
  const items = useRows<Item>('items', () => t('geo_generated_items').select('*').order('created_at', { ascending: false }).limit(300));
  const schemas = useRows<SchemaBlock>('schemas', () => t('geo_schema_blocks').select('*').order('page_path'));
  const obs = useRows<Observation>('obs', () => t('geo_ai_observations').select('*').order('observed_on', { ascending: false }));
  const gsc = useRows<any>('gsc', () => t('seo_snapshots').select('dimension, metrics, week_start').order('week_start', { ascending: false }).limit(20));
  const backlinks = useRows<any>('backlinks', () => t('seo_backlinks').select('referring_domains, total_backlinks, snapshot_at').order('snapshot_at', { ascending: false }).limit(1));
  const enquiries = useRows<any>('enq', () => t('contact_enquiries').select('kind, details, created_at').gte('created_at', new Date(Date.now() - 90 * 864e5).toISOString()).limit(1000));

  const unverifiedCount = (facts.data ?? []).filter((f) => f.value && !f.verified).length;
  const lockedSet = new Set((locked.data ?? []).map((l) => l.path));

  const runAudit = async () => {
    setBusy('audit');
    try {
      const r = await invoke('geo-audit', {});
      toast({ title: `Audit finished — ${r.summary.pages} pages checked` });
      refresh();
    } catch (e: any) { toast({ title: 'Audit failed', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };

  const logItem = async (it: Item, status: string, action: string, extra: Record<string, unknown> = {}) => {
    const { data: u } = await supabase.auth.getUser();
    const history = [...(it.history ?? []), { at: new Date().toISOString(), action, by: u.user?.email }];
    const { error } = await t('geo_generated_items').update({ status, history, ...extra }).eq('id', it.id);
    if (error) toast({ title: 'Could not update', description: error.message, variant: 'destructive' });
    refresh('items');
  };

  // ---------- Overview ----------
  const summary = useMemo(() => {
    const p = pages.data ?? [];
    const sev = { high: 0, medium: 0, low: 0 };
    p.forEach((x) => x.issues.forEach((i) => sev[i.severity]++));
    const signalMiss: Record<string, number> = {};
    p.forEach((x) => Object.entries(x.scores).forEach(([k, v]) => { if (!v) signalMiss[k] = (signalMiss[k] ?? 0) + 1; }));
    return {
      pages: p.length, sev,
      schema: p.filter((x) => x.schema_types.length).length,
      thin: p.filter((x) => x.word_count < 250).length,
      orphan: p.filter((x) => x.issues.some((i) => i.code === 'orphan' || i.code === 'links_few')).length,
      noQuestions: p.filter((x) => x.issues.some((i) => i.code === 'no_questions')).length,
      signalMiss,
    };
  }, [pages.data]);

  const landingConv = useMemo(() => {
    const m = new Map<string, number>();
    (enquiries.data ?? []).forEach((e: any) => {
      const src = e.details?.Source || e.details?.source || e.details?.page || e.kind || 'unknown';
      m.set(String(src), (m.get(String(src)) ?? 0) + 1);
    });
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [enquiries.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">AI Search Visibility</h1>
          <p className="text-sm text-muted-foreground">Audit, plan and approve content for Google AI Overviews, ChatGPT Search, Perplexity, Copilot and Gemini. Nothing goes live without approval.</p>
        </div>
        <Button onClick={runAudit} disabled={busy === 'audit'}>
          {busy === 'audit' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          {busy === 'audit' ? 'Crawling site…' : 'Run site audit'}
        </Button>
      </div>

      {unverifiedCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span><strong>{unverifiedCount} business facts are not confirmed yet.</strong> Everything generated will be marked "unverified" until you confirm them in the Facts tab.</span>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap">
          {['overview', 'facts', 'audit', 'claims', 'plan', 'competitors', 'generator', 'schema', 'checklist', 'approvals', 'tracker', 'exports'].map((k) => (
            <TabsTrigger key={k} value={k} className="capitalize">{k === 'tracker' ? 'AI tracker' : k}</TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          {!latestRun && <p className="text-sm text-muted-foreground">No audit yet — press "Run site audit".</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pages audited" value={summary.pages} hint={latestRun ? `Last run ${new Date(latestRun.finished_at).toLocaleString('en-GB')}` : ''} />
            <Stat label="Issues (high / med / low)" value={`${summary.sev.high} / ${summary.sev.medium} / ${summary.sev.low}`} />
            <Stat label="Schema coverage" value={`${summary.schema} / ${summary.pages}`} />
            <Stat label="Thin pages" value={summary.thin} />
            <Stat label="Link opportunities" value={summary.orphan} hint="pages with few links in or out" />
            <Stat label="Pages with no questions/FAQ" value={summary.noQuestions} />
            <Stat label="Claims to review" value={(claims.data ?? []).filter((c) => c.status === 'needs_review').length} />
            <Stat label="Content plan ideas" value={(plan.data ?? []).length} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Missing explanations (pages that don't say…)</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
              {Object.entries({ offers: 'what you offer', audience: 'who you serve', problems: 'which problems you solve', location: 'where you operate', why: 'why choose you', difference: 'how you differ' }).map(([k, l]) => (
                <div key={k} className="flex justify-between rounded-md bg-muted px-3 py-2"><span>{l}</span><strong>{summary.signalMiss[k] ?? 0}</strong></div>
              ))}
            </CardContent>
          </Card>
          <div className="grid gap-3 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-base">Google Search Console</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {(gsc.data ?? []).length === 0 ? <p className="text-muted-foreground">No Search Console data synced yet.</p> :
                  (gsc.data ?? []).slice(0, 4).map((s: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-border py-1"><span>{s.week_start} · {s.dimension}</span><span>{s.metrics?.clicks ?? '—'} clicks · {s.metrics?.impressions ?? '—'} impr.</span></div>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Referring domains (Semrush)</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {backlinks.data?.[0] ? <p><strong className="text-2xl">{backlinks.data[0].referring_domains}</strong> domains · {backlinks.data[0].total_backlinks} links<br /><span className="text-xs text-muted-foreground">{new Date(backlinks.data[0].snapshot_at).toLocaleDateString('en-GB')}</span></p> : <p className="text-muted-foreground">No backlink snapshot yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Enquiries by source (90 days)</CardTitle></CardHeader>
              <CardContent className="text-sm">
                {landingConv.length === 0 ? <p className="text-muted-foreground">No enquiries yet.</p> : landingConv.map(([k, n]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-border py-1"><span className="truncate">{k}</span><strong>{n}</strong></div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">AI answer observations</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {(obs.data ?? []).length === 0 ? <p className="text-muted-foreground">No observations recorded. Visibility in AI answers is only shown once you record what you actually saw (AI tracker tab).</p> :
                <p>{(obs.data ?? []).filter((o) => o.cited).length} cited · {(obs.data ?? []).filter((o) => o.mentioned).length} mentioned · {(obs.data ?? []).length} recorded checks</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACTS */}
        <TabsContent value="facts" className="space-y-4">
          <p className="text-sm text-muted-foreground">These are the only facts the generator may use. Items pre-filled from the website need your confirmation. Leave anything you're unsure of unconfirmed.</p>
          {(facts.data ?? []).map((f) => <FactRow key={f.id} fact={f} onSaved={() => refresh('facts')} />)}
          <Card>
            <CardHeader><CardTitle className="text-base">Pages that must not be changed</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <LockForm onSaved={() => refresh('locked')} />
              {(locked.data ?? []).map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                  <span><code>{l.path}</code> {l.reason && <span className="text-muted-foreground">— {l.reason}</span>}</span>
                  <Button size="sm" variant="ghost" onClick={async () => { await t('geo_locked_pages').delete().eq('id', l.id); refresh('locked'); }}>Unlock</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit"><AuditTable pages={pages.data ?? []} locked={lockedSet} /></TabsContent>

        {/* CLAIMS */}
        <TabsContent value="claims" className="space-y-2">
          <p className="text-sm text-muted-foreground">Sentences the audit found that make claims (superlatives, percentages, certifications, government or grant wording, guarantees). Nothing is changed automatically — mark each one.</p>
          {(claims.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Run an audit to find claims.</p>}
          {(claims.data ?? []).map((c) => (
            <div key={c.id} className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-border p-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex gap-2"><Badge variant="outline">{c.claim_type}</Badge><code className="text-xs text-muted-foreground">{c.path}</code><Badge variant={c.status === 'needs_review' ? 'secondary' : 'outline'}>{c.status.replace('_', ' ')}</Badge></div>
                <p className="text-foreground">“{c.claim}”</p>
              </div>
              <div className="flex gap-1">
                {[['verified', 'Evidence OK'], ['remove', 'Remove/soften'], ['needs_review', 'Reset']].map(([s, l]) => (
                  <Button key={s} size="sm" variant="outline" onClick={async () => { const { data: u } = await supabase.auth.getUser(); await t('geo_claims').update({ status: s, reviewed_by: u.user?.id, reviewed_at: new Date().toISOString() }).eq('id', c.id); refresh('claims'); }}>{l}</Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* PLAN */}
        <TabsContent value="plan" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy === 'plan'} onClick={async () => { setBusy('plan'); try { const r = await invoke('geo-generate', { kind: 'content_plan', language: 'en' }); toast({ title: `${r.ideas} page ideas added`, description: r.missing_info?.length ? `Missing: ${r.missing_info.join('; ')}` : undefined }); refresh('plan'); } catch (e: any) { toast({ title: 'Could not create plan', description: e.message, variant: 'destructive' }); } setBusy(null); }}>
              {busy === 'plan' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Suggest page ideas from confirmed facts
            </Button>
          </div>
          {(plan.data ?? []).map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <div className="flex gap-2"><Badge variant="outline">{p.page_type}</Badge><Badge variant="secondary">{p.status}</Badge>{p.needs_approval && <Badge variant="outline">needs approval</Badge>}</div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                <div><Field k="Search intent" v={p.search_intent} /><Field k="Audience" v={p.audience} /><Field k="Primary question" v={p.primary_question} /><Field k="URL" v={p.url} /><Field k="H1" v={p.h1} /><Field k="Schema" v={p.schema_types.join(', ')} /></div>
                <div>
                  <p className="font-medium">Outline</p><ul className="list-disc pl-5 text-muted-foreground">{p.outline.map((o, i) => <li key={i}>{String(o)}</li>)}</ul>
                  <p className="mt-2 font-medium">Internal links</p><p className="text-muted-foreground">{p.internal_links.map(String).join(', ') || '—'}</p>
                  <p className="mt-2 font-medium text-accent">Facts / evidence needed</p><ul className="list-disc pl-5 text-muted-foreground">{p.required_facts.map((o, i) => <li key={i}>{String(o)}</li>)}</ul>
                </div>
                <div className="flex gap-2 md:col-span-2">
                  {['approved', 'rejected', 'idea'].map((s) => <Button key={s} size="sm" variant="outline" onClick={async () => { await t('geo_content_plan').update({ status: s }).eq('id', p.id); refresh('plan'); }}>{s === 'idea' ? 'Reset' : s === 'approved' ? 'Approve idea' : 'Reject'}</Button>)}
                  <Button size="sm" variant="ghost" onClick={async () => { await t('geo_content_plan').delete().eq('id', p.id); refresh('plan'); }}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* COMPETITORS */}
        <TabsContent value="competitors" className="space-y-3">
          <CompetitorForm onSaved={() => refresh('comps')} />
          {(comps.data ?? []).map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{c.name || c.url} <span className="text-xs font-normal text-muted-foreground">{c.url}</span></CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy === c.id} onClick={async () => { setBusy(c.id); try { await invoke('geo-competitor', { id: c.id }); toast({ title: 'Competitor analysed' }); refresh('comps'); } catch (e: any) { toast({ title: 'Analysis failed', description: e.message, variant: 'destructive' }); } setBusy(null); }}>
                      {busy === c.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{c.analysed_at ? 'Re-analyse' : 'Analyse'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await t('geo_competitors').delete().eq('id', c.id); refresh('comps'); }}>Remove</Button>
                  </div>
                </div>
              </CardHeader>
              {c.report && (
                <CardContent className="space-y-3 text-sm">
                  <p>{c.report.summary}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="border-b border-border"><th className="py-1 pr-2">Area</th><th className="pr-2">Competitor</th><th className="pr-2">FastMedia</th><th /></tr></thead>
                      <tbody>{(c.report.comparison ?? []).map((r: any, i: number) => (
                        <tr key={i} className="border-b border-border align-top"><td className="py-1 pr-2 font-medium">{r.area}</td><td className="pr-2">{r.competitor}</td><td className="pr-2">{r.fastmedia}</td><td>{r.needs_verification && <Badge variant="secondary">verify</Badge>}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div><p className="font-medium">Gaps and opportunities (original ideas)</p>
                    <ul className="list-disc pl-5">{(c.report.gaps ?? []).map((g: any, i: number) => <li key={i}><strong>{g.topic}</strong> — {g.question} <span className="text-muted-foreground">({g.why}; suggested: {g.suggested_page})</span></li>)}</ul></div>
                  <p className="text-xs text-muted-foreground">Observed: {c.report.technical?.pages_read} pages read, homepage answered in {c.report.technical?.home_response_ms} ms, schema: {(c.report.technical?.schema_types ?? []).join(', ') || 'none'}. {c.report.note}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* GENERATOR */}
        <TabsContent value="generator"><Generator pages={pages.data ?? []} locked={lockedSet} onDone={() => refresh('items')} /></TabsContent>

        {/* SCHEMA */}
        <TabsContent value="schema"><SchemaEditor blocks={schemas.data ?? []} facts={facts.data ?? []} onSaved={() => refresh('schemas')} /></TabsContent>

        {/* CHECKLIST */}
        <TabsContent value="checklist"><Checklist pages={pages.data ?? []} facts={facts.data ?? []} /></TabsContent>

        {/* APPROVALS */}
        <TabsContent value="approvals" className="space-y-3">
          {(items.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nothing generated yet — use the Generator tab.</p>}
          {(items.data ?? []).map((it) => <ItemCard key={it.id} it={it} onAct={logItem} onRefresh={() => { refresh('items'); refresh('schemas'); }} />)}
        </TabsContent>

        {/* TRACKER */}
        <TabsContent value="tracker" className="space-y-3">
          <p className="text-sm text-muted-foreground">Record what you actually saw in an AI search result. Nothing counts as "ranking" unless it is recorded here with its date, platform and query.</p>
          <ObservationForm onSaved={() => refresh('obs')} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="border-b border-border"><th className="py-1">Date</th><th>Platform</th><th>Query</th><th>Country / lang / device</th><th>Cited</th><th>Mentioned</th><th>Source</th><th /></tr></thead>
              <tbody>{(obs.data ?? []).map((o) => (
                <tr key={o.id} className="border-b border-border align-top">
                  <td className="py-1">{o.observed_on}</td><td>{o.platform}</td><td>{o.query}{o.quote && <p className="text-muted-foreground">“{o.quote}”</p>}</td>
                  <td>{o.country} / {o.language} / {o.device}</td><td>{o.cited ? 'Yes' : 'No'}</td><td>{o.mentioned ? 'Yes' : 'No'}</td>
                  <td>{o.source_url && <a className="text-primary underline" href={o.source_url} target="_blank" rel="noreferrer">link</a>}</td>
                  <td><Button size="sm" variant="ghost" onClick={async () => { await t('geo_ai_observations').delete().eq('id', o.id); refresh('obs'); }}>Delete</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </TabsContent>

        {/* EXPORTS */}
        <TabsContent value="exports" className="grid gap-3 sm:grid-cols-2">
          <ExportCard title="Page audit (CSV)" onClick={() => download('geo-audit.csv', toCsv((pages.data ?? []).map((p) => ({ path: p.path, status: p.http_status, title: p.title, description: p.description, h1: p.h1, words: p.word_count, schema: p.schema_types.join(' '), high: p.issues.filter((i) => i.severity === 'high').length, medium: p.issues.filter((i) => i.severity === 'medium').length, low: p.issues.filter((i) => i.severity === 'low').length, issues: p.issues.map((i) => i.message).join(' | ') }))), 'text/csv')} />
          <ExportCard title="Claims to review (CSV)" onClick={() => download('geo-claims.csv', toCsv((claims.data ?? []).map((c) => ({ path: c.path, type: c.claim_type, status: c.status, claim: c.claim }))), 'text/csv')} />
          <ExportCard title="Content plan (CSV)" onClick={() => download('geo-content-plan.csv', toCsv((plan.data ?? []).map((p) => ({ title: p.title, type: p.page_type, url: p.url, h1: p.h1, intent: p.search_intent, audience: p.audience, question: p.primary_question, schema: p.schema_types.join(' '), status: p.status, needs_facts: p.required_facts.join(' | ') }))), 'text/csv')} />
          <ExportCard title="AI observations (CSV)" onClick={() => download('geo-ai-observations.csv', toCsv((obs.data ?? []) as any), 'text/csv')} />
          <ExportCard title="All drafts (Markdown)" onClick={() => download('geo-drafts.md', (items.data ?? []).map(itemToMarkdown).join('\n\n---\n\n'), 'text/markdown')} />
          <ExportCard title="All drafts (HTML)" onClick={() => download('geo-drafts.html', (items.data ?? []).map(itemToHtml).join('\n'), 'text/html')} />
          <ExportCard title="Schema blocks (JSON-LD)" onClick={() => download('geo-schema.json', JSON.stringify((schemas.data ?? []).map((s) => ({ page: s.page_path, status: s.status, jsonld: s.json_ld })), null, 2), 'application/ld+json')} />
          <ExportCard title="Business facts (JSON)" onClick={() => download('geo-facts.json', JSON.stringify(facts.data ?? [], null, 2), 'application/json')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- small components ----------
const Stat = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{label}</p><p className="font-heading text-2xl font-bold text-foreground">{value}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</CardContent></Card>
);
const Field = ({ k, v }: { k: string; v?: string | null }) => <p><span className="font-medium">{k}:</span> <span className="text-muted-foreground">{v || '—'}</span></p>;
const ExportCard = ({ title, onClick }: { title: string; onClick: () => void }) => (
  <Card><CardContent className="flex items-center justify-between pt-5"><span className="text-sm font-medium">{title}</span><Button size="sm" variant="outline" onClick={onClick}><Download className="mr-2 h-4 w-4" />Export</Button></CardContent></Card>
);

function FactRow({ fact, onSaved }: { fact: Fact; onSaved: () => void }) {
  const [value, setValue] = useState(fact.value);
  const save = async (verified: boolean) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await t('geo_business_facts').update({ value, verified, verified_by: verified ? u.user?.id : null, verified_at: verified ? new Date().toISOString() : null, source: value !== fact.value ? 'owner' : fact.source }).eq('id', fact.id);
    if (error) toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    else toast({ title: verified ? 'Confirmed' : 'Saved as unconfirmed' });
    onSaved();
  };
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <Label className="font-medium">{fact.label}</Label>
        {fact.verified ? <Badge><CheckCircle2 className="mr-1 h-3 w-3" />Confirmed</Badge> : <Badge variant="secondary"><AlertTriangle className="mr-1 h-3 w-3" />From website — please confirm</Badge>}
      </div>
      <Textarea rows={2} value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Source: {fact.source}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => save(false)}>Save</Button>
          <Button size="sm" onClick={() => save(true)} disabled={!value.trim()}>Confirm as true</Button>
        </div>
      </div>
    </div>
  );
}

function LockForm({ onSaved }: { onSaved: () => void }) {
  const [path, setPath] = useState(''); const [reason, setReason] = useState('');
  return (
    <div className="flex flex-wrap gap-2">
      <Input className="w-48" placeholder="/offer" value={path} onChange={(e) => setPath(e.target.value)} />
      <Input className="flex-1" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button disabled={!path.startsWith('/')} onClick={async () => { const { error } = await t('geo_locked_pages').insert({ path: path.replace(/\/+$/, '') || '/', reason: reason || null }); if (error) toast({ title: 'Could not lock', description: error.message, variant: 'destructive' }); setPath(''); setReason(''); onSaved(); }}>Lock page</Button>
    </div>
  );
}

function AuditTable({ pages, locked }: { pages: PageAudit[]; locked: Set<string> }) {
  const [q, setQ] = useState(''); const [sel, setSel] = useState<PageAudit | null>(null);
  const rows = pages.filter((p) => p.path.includes(q)).sort((a, b) => b.issues.filter((i) => i.severity === 'high').length - a.issues.filter((i) => i.severity === 'high').length);
  if (!pages.length) return <p className="text-sm text-muted-foreground">Run an audit to see page-by-page results.</p>;
  return (
    <div className="space-y-2">
      <Input placeholder="Filter by path…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b border-border"><th className="py-1">Page</th><th>Words</th><th>Schema</th><th>High</th><th>Med</th><th>Low</th><th /></tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className="cursor-pointer border-b border-border hover:bg-muted" onClick={() => setSel(p)}>
              <td className="py-1"><code>{p.path}</code> {locked.has(p.path) && <Badge variant="outline">locked</Badge>}<div className="text-muted-foreground">{p.title}</div></td>
              <td>{p.word_count}</td><td>{p.schema_types.join(', ') || '—'}</td>
              {(['high', 'medium', 'low'] as const).map((s) => <td key={s}>{p.issues.filter((i) => i.severity === s).length}</td>)}
              <td><Button size="sm" variant="ghost">Open</Button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {sel && (<>
            <DialogHeader><DialogTitle>{sel.path}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <Field k="Title" v={sel.title} /><Field k="Description" v={sel.description} /><Field k="H1" v={sel.h1} />
              <div className="flex flex-wrap gap-2">{Object.entries(sel.scores).map(([k, v]) => <Badge key={k} variant={v ? 'outline' : 'secondary'}>{v ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}{k}</Badge>)}</div>
              <div><p className="font-medium">Issues</p><ul className="space-y-1">{sel.issues.map((i, n) => <li key={n} className="flex gap-2"><Badge variant={sevColour[i.severity]}>{i.severity}</Badge>{i.message}</li>)}</ul></div>
              <div><p className="font-medium">Heading outline</p><ul>{sel.headings.map((h, n) => <li key={n} style={{ paddingLeft: (h.level - 1) * 12 }} className="text-muted-foreground">H{h.level} {h.text}</li>)}</ul></div>
              <p className="text-xs text-muted-foreground">To get a suggested direct answer, FAQ or rewrite, use the Generator tab with this page selected.</p>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const KIND_LABELS: Record<string, string> = {
  page_brief: 'Page brief', faq: 'FAQ section', metadata: 'Metadata (title + description)', schema: 'Schema markup',
  internal_links: 'Internal-link recommendations', content_update: 'Content update (direct answer, headings, FAQ, CTA)',
  comparison_outline: 'Comparison-page outline', question_page: 'Customer-question page', local_outline: 'Local service page outline',
};
function Generator({ pages, locked, onDone }: { pages: PageAudit[]; locked: Set<string>; onDone: () => void }) {
  const [kind, setKind] = useState('content_update'); const [path, setPath] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'cs'>('en'); const [instructions, setInstructions] = useState(''); const [busy, setBusy] = useState(false);
  const paths = [...new Set(pages.map((p) => p.path))].sort();
  const isLocked = !!path && locked.has(path) && kind === 'content_update';
  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>What to create</Label>
            <Select value={kind} onValueChange={setKind}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(KIND_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>For page (optional)</Label>
            <Select value={path || 'none'} onValueChange={(v) => setPath(v === 'none' ? '' : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No specific page</SelectItem>{paths.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Language</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'cs')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">British English</SelectItem><SelectItem value="cs">Czech</SelectItem></SelectContent></Select></div>
        </div>
        <div><Label>Extra instructions (optional)</Label><Textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. focus on plumbers in Ústecký kraj" /></div>
        {isLocked && <p className="text-sm text-destructive">This page is locked — content updates are blocked.</p>}
        <p className="text-xs text-muted-foreground">Uses only your facts sheet and existing page text. Missing information is flagged, and every result goes to Approvals as a draft.</p>
        <Button disabled={busy || isLocked} onClick={async () => {
          setBusy(true);
          try { await invoke('geo-generate', { kind, path: path || undefined, language, instructions: instructions || undefined }); toast({ title: 'Draft created', description: 'Review it in the Approvals tab.' }); onDone(); }
          catch (e: any) { toast({ title: 'Could not generate', description: e.message, variant: 'destructive' }); }
          setBusy(false);
        }}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Generate draft</Button>
      </CardContent>
    </Card>
  );
}

function ItemCard({ it, onAct, onRefresh }: { it: Item; onAct: (it: Item, s: string, a: string, extra?: Record<string, unknown>) => Promise<void>; onRefresh: () => void }) {
  const [open, setOpen] = useState(false); const [edit, setEdit] = useState(it.after_content ?? '');
  const publishSchema = async () => {
    if (!it.json_ld || !it.target_path) return toast({ title: 'Needs a page and schema to publish', variant: 'destructive' });
    const type = String((it.json_ld as any)['@type'] ?? 'Thing');
    const v = validateSchema(type, JSON.stringify(it.json_ld));
    const { error } = await t('geo_schema_blocks').insert({ page_path: it.target_path, schema_type: type, json_ld: it.json_ld, validated: v.ok, validation_notes: v.notes, status: 'published', approved_at: new Date().toISOString() });
    if (error) return toast({ title: 'Could not publish', description: error.message, variant: 'destructive' });
    await onAct(it, 'published', 'published schema to live page'); onRefresh();
  };
  const publishMeta = async () => {
    const title = edit.match(/title[^:]*:\s*(.+)/i)?.[1]?.trim(); const description = edit.match(/description[^:]*:\s*(.+)/i)?.[1]?.trim();
    if (!it.target_path || !title || !description) return toast({ title: 'Could not read a title and description line from the draft', variant: 'destructive' });
    const { error } = await t('page_seo').upsert({ page_path: it.target_path, language: it.language, title: title.replace(/^\*+|\*+$/g, ''), description: description.replace(/^\*+|\*+$/g, '') }, { onConflict: 'page_path,language' });
    if (error) return toast({ title: 'Could not publish', description: error.message, variant: 'destructive' });
    await onAct(it, 'published', 'published metadata to page SEO');
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{it.title}</CardTitle>
          <div className="flex flex-wrap gap-2"><Badge variant="outline">{KIND_LABELS[it.kind] ?? it.kind}</Badge>{it.target_path && <Badge variant="outline">{it.target_path}</Badge>}<Badge variant="secondary">{it.status.replace('_', ' ')}</Badge>{it.unverified && <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />unverified</Badge>}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div><p className="font-medium">Facts used</p><ul className="list-disc pl-5 text-muted-foreground">{it.facts.map((f, i) => <li key={i}>{f.fact} <em>({f.source})</em></li>)}</ul></div>
          <div><p className="font-medium">Recommendations</p><ul className="list-disc pl-5 text-muted-foreground">{it.recommendations.map((r, i) => <li key={i}>{String(r)}</li>)}</ul></div>
          <div className="rounded-md border border-accent/40 bg-accent/10 p-2"><p className="font-medium">Missing information</p><ul className="list-disc pl-5">{it.missing_info.length ? it.missing_info.map((m, i) => <li key={i}>{String(m)}</li>) : <li>None flagged</li>}</ul></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Before / after</Button>
          {it.status === 'draft' && <Button size="sm" variant="outline" onClick={() => onAct(it, 'in_review', 'sent to review')}>Send to review</Button>}
          {['draft', 'in_review'].includes(it.status) && <Button size="sm" onClick={() => onAct(it, 'approved', 'approved')}>Approve</Button>}
          {it.status !== 'rejected' && it.status !== 'published' && <Button size="sm" variant="outline" onClick={() => onAct(it, 'rejected', 'rejected')}>Reject</Button>}
          {it.status === 'approved' && it.json_ld && <Button size="sm" onClick={publishSchema}>Publish schema to page</Button>}
          {it.status === 'approved' && it.kind === 'metadata' && <Button size="sm" onClick={publishMeta}>Publish metadata</Button>}
          {it.status === 'approved' && !it.json_ld && it.kind !== 'metadata' && <span className="self-center text-xs text-muted-foreground">Export this and ask me to apply it to the page.</span>}
          <Button size="sm" variant="ghost" onClick={() => download(`${it.kind}.md`, itemToMarkdown({ ...it, after_content: edit }), 'text/markdown')}>Markdown</Button>
          <Button size="sm" variant="ghost" onClick={() => download(`${it.kind}.html`, itemToHtml({ ...it, after_content: edit }), 'text/html')}>HTML</Button>
          {it.json_ld && <Button size="sm" variant="ghost" onClick={() => download(`${it.kind}.jsonld`, JSON.stringify(it.json_ld, null, 2), 'application/ld+json')}>JSON-LD</Button>}
        </div>
        <p className="text-xs text-muted-foreground">History: {it.history.map((h) => `${h.action}${h.by ? ` by ${h.by}` : ''} ${new Date(h.at).toLocaleString('en-GB')}`).join(' · ')}</p>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Before and after</DialogTitle></DialogHeader>
          {it.unverified && <p className="rounded-md bg-accent/10 p-2 text-sm"><AlertTriangle className="mr-1 inline h-4 w-4 text-accent" />Contains unverified information — check every fact before publishing.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <div><p className="mb-1 text-sm font-medium">Before (live page text)</p><pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">{it.before_content || '—'}</pre></div>
            <div><p className="mb-1 text-sm font-medium">After (proposed — editable)</p><Textarea className="min-h-[50vh] font-mono text-xs" value={edit} onChange={(e) => setEdit(e.target.value)} />
              {it.json_ld && <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">{JSON.stringify(it.json_ld, null, 2)}</pre>}
              <Button size="sm" className="mt-2" onClick={async () => { await onAct(it, it.status, 'edited', { after_content: edit }); setOpen(false); }}>Save edits</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SchemaEditor({ blocks, facts, onSaved }: { blocks: SchemaBlock[]; facts: Fact[]; onSaved: () => void }) {
  const [path, setPath] = useState('/'); const [type, setType] = useState('Organization'); const [raw, setRaw] = useState('');
  const verified = Object.fromEntries(facts.filter((f) => f.verified).map((f) => [f.fact_key, f.value]));
  const template = () => {
    const base: any = { '@context': 'https://schema.org', '@type': type };
    if (['Organization', 'LocalBusiness'].includes(type)) {
      if (verified.business_name) base.name = verified.business_name;
      if (verified.url) base.url = verified.url;
      if (verified.phone) base.telephone = verified.phone;
      if (verified.email) base.email = verified.email;
      if (verified.ico) base.identifier = { '@type': 'PropertyValue', propertyID: 'IČO', value: verified.ico };
      if (type === 'LocalBusiness' && verified.location) base.address = { '@type': 'PostalAddress', addressLocality: 'Louny', postalCode: '440 01', addressRegion: 'Ústecký kraj', addressCountry: 'CZ' };
    }
    if (type === 'WebSite') { base.name = verified.business_name ?? ''; base.url = verified.url ?? ''; }
    if (type === 'FAQPage') base.mainEntity = [{ '@type': 'Question', name: '', acceptedAnswer: { '@type': 'Answer', text: '' } }];
    if (type === 'BreadcrumbList') base.itemListElement = [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fastmedia.pro/' }];
    setRaw(JSON.stringify(base, null, 2));
    if (!Object.keys(verified).length) toast({ title: 'No confirmed facts yet', description: 'Only confirmed facts are filled in — confirm them in the Facts tab.' });
  };
  const v = raw ? validateSchema(type, raw) : null;
  const save = async (status: string) => {
    if (!v?.value) return;
    const { error } = await t('geo_schema_blocks').insert({ page_path: path, schema_type: type, json_ld: v.value, validated: v.ok, validation_notes: v.notes, status, approved_at: status === 'published' ? new Date().toISOString() : null });
    if (error) toast({ title: 'Could not save', description: error.message, variant: 'destructive' }); else { toast({ title: status === 'published' ? 'Published to the live page' : 'Saved as draft' }); setRaw(''); onSaved(); }
  };
  return (
    <div className="space-y-4">
      <Card><CardContent className="space-y-3 pt-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Page path</Label><Input value={path} onChange={(e) => setPath(e.target.value)} /></div>
          <div><Label>Schema type</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(SCHEMA_REQUIRED).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex items-end"><Button variant="outline" onClick={template}>Start from confirmed facts</Button></div>
        </div>
        {type === 'Review' && <p className="text-sm text-accent">Only add reviews that are genuine and that you have permission to publish.</p>}
        <Textarea className="min-h-[220px] font-mono text-xs" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{"@context":"https://schema.org", ...}' />
        {v && <p className={`text-sm ${v.ok ? 'text-primary' : 'text-destructive'}`}>{v.notes}</p>}
        <div className="flex gap-2"><Button variant="outline" disabled={!v?.value} onClick={() => save('draft')}>Save draft</Button><Button disabled={!v?.ok} onClick={() => save('published')}>Approve and publish</Button></div>
      </CardContent></Card>
      {blocks.map((b) => (
        <div key={b.id} className="rounded-md border border-border p-3 text-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span><code>{b.page_path}</code> · {b.schema_type} <Badge variant={b.status === 'published' ? 'default' : 'secondary'}>{b.status}</Badge> {!b.validated && <Badge variant="destructive">check</Badge>}</span>
            <div className="flex gap-1">
              {b.status !== 'published' && <Button size="sm" onClick={async () => { await t('geo_schema_blocks').update({ status: 'published', approved_at: new Date().toISOString() }).eq('id', b.id); onSaved(); }}>Publish</Button>}
              {b.status === 'published' && <Button size="sm" variant="outline" onClick={async () => { await t('geo_schema_blocks').update({ status: 'draft' }).eq('id', b.id); onSaved(); }}>Unpublish</Button>}
              <Button size="sm" variant="ghost" onClick={async () => { await t('geo_schema_blocks').delete().eq('id', b.id); onSaved(); }}>Delete</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{b.validation_notes}</p>
        </div>
      ))}
    </div>
  );
}

function Checklist({ pages, facts }: { pages: PageAudit[]; facts: Fact[] }) {
  const by = (code: string) => pages.filter((p) => p.issues.some((i) => i.code.startsWith(code))).length;
  const has = (path: string) => pages.some((p) => p.path === path && p.http_status === 200);
  const allSchema = new Set(pages.flatMap((p) => p.schema_types));
  const items: [string, boolean, string][] = pages.length ? [
    ['Every page answers (no errors)', by('http') === 0, `${by('http')} pages with errors`],
    ['Titles present, unique, under 60 characters', by('title') === 0, `${by('title')} pages need attention`],
    ['Meta descriptions present and unique', by('desc') === 0, `${by('desc')} pages`],
    ['Canonical links', by('canonical') === 0, `${by('canonical')} pages missing`],
    ['One H1 per page in crawlable HTML', by('h1') === 0, `${by('h1')} pages`],
    ['Heading order', by('heading_skip') === 0, `${by('heading_skip')} pages skip levels`],
    ['Enough crawlable text (no thin pages)', by('thin') === 0, `${by('thin')} thin pages`],
    ['No duplicated page content', by('duplicate_content') === 0, `${by('duplicate_content')} pages`],
    ['Image alt text', by('alt_missing') === 0, `${by('alt_missing')} pages`],
    ['Open Graph tags', by('og_missing') === 0, `${by('og_missing')} pages`],
    ['Structured data valid', by('schema_invalid') === 0, `${by('schema_invalid')} pages with invalid JSON-LD`],
    ['Structured data on every page', by('schema_missing') === 0, `${by('schema_missing')} pages without`],
    ['Breadcrumbs', by('breadcrumb_missing') === 0, `${by('breadcrumb_missing')} pages`],
    ['Internal linking', by('orphan') + by('links_few') === 0, `${by('orphan')} weakly linked pages`],
    ['Indexing controls reviewed', by('noindex') === 0, `${by('noindex')} noindex pages — check they are intended`],
    ['Organization / LocalBusiness schema', allSchema.has('Organization') || allSchema.has('LocalBusiness'), 'Add via Schema tab'],
    ['WebSite schema', allSchema.has('WebSite'), 'Add via Schema tab'],
    ['FAQPage schema somewhere', allSchema.has('FAQPage'), 'Add FAQs to key pages'],
    ['Contact page', has('/contact'), '/contact'],
    ['About page', has('/about'), 'Not found — consider an About page with the founder\'s story'],
    ['Case studies page', has('/case-studies'), '/case-studies'],
    ['Imprint / terms / privacy', pages.some((p) => p.path.startsWith('/legal')), 'Legal pages'],
    ['NAP consistency (name, address, phone confirmed)', ['business_name', 'location', 'phone'].every((k) => facts.find((f) => f.fact_key === k)?.verified), 'Confirm in Facts tab'],
    ['Robots.txt and sitemap reachable', pages.length > 0, 'Audit reads the sitemap'],
  ] : [];
  if (!pages.length) return <p className="text-sm text-muted-foreground">Run an audit to fill the checklist.</p>;
  return (
    <div className="space-y-1">
      {items.map(([label, ok, note]) => (
        <div key={label} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
          <span className="flex items-center gap-2">{ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}{label}</span>
          {!ok && <span className="text-xs text-muted-foreground">{note}</span>}
        </div>
      ))}
      <p className="pt-2 text-xs text-muted-foreground">Page speed, Core Web Vitals, broken links and redirects are tracked in the SEO Health Monitor.</p>
    </div>
  );
}

function CompetitorForm({ onSaved }: { onSaved: () => void }) {
  const [url, setUrl] = useState(''); const [name, setName] = useState('');
  return (
    <Card><CardContent className="flex flex-wrap gap-2 pt-5">
      <Input className="flex-1" placeholder="https://competitor.cz" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Input className="w-48" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
      <Button disabled={!/\./.test(url)} onClick={async () => { const { error } = await t('geo_competitors').insert({ url: url.trim(), name: name || null }); if (error) toast({ title: 'Could not add', description: error.message, variant: 'destructive' }); setUrl(''); setName(''); onSaved(); }}>Add competitor</Button>
      <p className="w-full text-xs text-muted-foreground">We read their public pages and suggest original ideas. Their text is never copied, and anything not directly observed is marked "verify".</p>
    </CardContent></Card>
  );
}

function ObservationForm({ onSaved }: { onSaved: () => void }) {
  const init = { observed_on: new Date().toISOString().slice(0, 10), platform: 'ChatGPT Search', query: '', country: 'CZ', language: 'cs', device: 'desktop', source_url: '', cited: false, mentioned: false, quote: '' };
  const [f, setF] = useState(init);
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Card><CardContent className="grid gap-2 pt-5 md:grid-cols-4">
      <div><Label>Date</Label><Input type="date" value={f.observed_on} onChange={(e) => set('observed_on', e.target.value)} /></div>
      <div><Label>Platform</Label><Select value={f.platform} onValueChange={(v) => set('platform', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Google AI Overviews', 'ChatGPT Search', 'Perplexity', 'Microsoft Copilot', 'Gemini'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-2"><Label>Query</Label><Input value={f.query} onChange={(e) => set('query', e.target.value)} /></div>
      <div><Label>Country</Label><Input value={f.country} onChange={(e) => set('country', e.target.value)} /></div>
      <div><Label>Language</Label><Input value={f.language} onChange={(e) => set('language', e.target.value)} /></div>
      <div><Label>Device</Label><Select value={f.device} onValueChange={(v) => set('device', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desktop">Desktop</SelectItem><SelectItem value="mobile">Mobile</SelectItem></SelectContent></Select></div>
      <div><Label>Source URL shown</Label><Input value={f.source_url} onChange={(e) => set('source_url', e.target.value)} /></div>
      <div className="md:col-span-2"><Label>Quote (optional)</Label><Input value={f.quote} onChange={(e) => set('quote', e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm"><Switch checked={f.cited} onCheckedChange={(v) => set('cited', v)} />Our site cited</label>
      <label className="flex items-center gap-2 text-sm"><Switch checked={f.mentioned} onCheckedChange={(v) => set('mentioned', v)} />Brand mentioned</label>
      <div className="md:col-span-4"><Button disabled={!f.query.trim()} onClick={async () => { const { data: u } = await supabase.auth.getUser(); const { error } = await t('geo_ai_observations').insert({ ...f, source_url: f.source_url || null, quote: f.quote || null, recorded_by: u.user?.id }); if (error) toast({ title: 'Could not save', description: error.message, variant: 'destructive' }); else { setF(init); onSaved(); } }}>Record observation</Button></div>
    </CardContent></Card>
  );
}
