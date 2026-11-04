import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { safeHttpUrl } from '@/lib/prospectLinks';
import { parseImport, validateRows, prepareForImport, sha256, type PreviewRow } from '@/lib/opportunityImport';
import { SignalBreakdown } from '@/components/admin/BuyingSignalPanel';
import type { ScoreResult } from '@/lib/buyingSignals';

type Opp = Record<string, any>;
const STATUSES = ['new', 'reviewing', 'qualified', 'proposal_sent', 'won', 'lost', 'archived', 'rejected'];
const OUTCOMES = ['proposal_sent', 'reply', 'meeting', 'won', 'lost', 'no_response'];
const kindLabel = (k: string) => (k === 'active_buyer_request' ? 'Active buyer request' : 'Prospect hypothesis');
const days = (d?: string) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null);
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x?.text ?? JSON.stringify(x))) : []);
const sel = 'h-9 rounded-md border border-input bg-background px-2 text-sm';

function Nav() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm"><Link to="/admin/opportunities">Inbox</Link></Button>
      <Button asChild variant="outline" size="sm"><Link to="/admin/opportunities/import">Import</Link></Button>
      <Button asChild variant="outline" size="sm"><Link to="/admin/opportunities/methods">Methods</Link></Button>
    </div>
  );
}

const Header = ({ title }: { title: string }) => (
  <div className="space-y-2">
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-sm text-muted-foreground">Admin-only. Separate from prospects, leads and CRM. Records arrive only via manual import — no automated discovery writes here.</p>
    <Nav />
  </div>
);

function Inbox() {
  const [rows, setRows] = useState<Opp[]>([]);
  const [q, setQ] = useState(''); const [kind, setKind] = useState(''); const [status, setStatus] = useState(''); const [minScore, setMinScore] = useState(0); const [due, setDue] = useState(false);
  useEffect(() => { supabase.from('opportunities').select('*').order('priority_score', { ascending: false }).limit(1000).then(({ data }) => setRows(data ?? [])); }, []);
  const shown = useMemo(() => rows.filter((r) =>
    (!q || [r.title, r.company, r.country, r.service_need].join(' ').toLowerCase().includes(q.toLowerCase())) &&
    (!kind || r.kind === kind) && (!status || r.status === status) && r.priority_score >= minScore &&
    (!due || (r.follow_up_at && new Date(r.follow_up_at) <= new Date()))), [rows, q, kind, status, minScore, due]);
  return (
    <div className="space-y-4 p-4">
      <Header title="Opportunity Intelligence" />
      <div className="flex flex-wrap gap-2">
        <Input aria-label="Search" placeholder="Search title, company, country, need" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select aria-label="Type" className={sel} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All types</option><option value="active_buyer_request">Active buyer request</option><option value="prospect_hypothesis">Prospect hypothesis</option>
        </select>
        <select aria-label="Status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Minimum score" className={sel} value={minScore} onChange={(e) => setMinScore(+e.target.value)}>
          {[0, 25, 50, 75].map((n) => <option key={n} value={n}>Score ≥ {n}</option>)}
        </select>
        <label className="flex items-center gap-1 text-sm text-muted-foreground"><input type="checkbox" checked={due} onChange={(e) => setDue(e.target.checked)} /> Follow-up due</label>
      </div>
      {!shown.length && <p className="text-sm text-muted-foreground">No opportunities yet. Use Import to add sourced records.</p>}
      <div className="grid gap-2">
        {shown.map((r) => (
          <Card key={r.id}><CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="min-w-0">
              <Link to={`/admin/opportunities/${r.id}`} className="font-medium text-foreground underline-offset-2 hover:underline">{r.title}</Link>
              <p className="text-xs text-muted-foreground">{[r.company, r.country, r.service_need, r.source_type].filter(Boolean).join(' · ')}{days(r.posted_at) !== null ? ` · ${days(r.posted_at)}d old` : ' · date unknown'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={r.kind === 'active_buyer_request' ? 'default' : 'secondary'}>{kindLabel(r.kind)}</Badge>
              <Badge variant="outline">{r.status}</Badge>
              <span className="font-semibold text-foreground" title="Priority/fit, not purchase probability">{r.priority_score}</span>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function Detail({ id }: { id: string }) {
  const { toast } = useToast();
  const [o, setO] = useState<Opp | null>(null); const [events, setEvents] = useState<Opp[]>([]); const [outcomes, setOutcomes] = useState<Opp[]>([]);
  const [form, setForm] = useState({ status: '', follow_up_at: '', notes: '' });
  const [oc, setOc] = useState({ outcome: 'proposal_sent', value: '', currency: 'CZK', note: '' });
  const load = async () => {
    const [{ data }, ev, out] = await Promise.all([
      supabase.from('opportunities').select('*').eq('id', id).maybeSingle(),
      supabase.from('opportunity_events').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('opportunity_outcomes').select('*').eq('opportunity_id', id).order('occurred_at', { ascending: false }),
    ]);
    setO(data); setEvents(ev.data ?? []); setOutcomes(out.data ?? []);
    if (data) setForm({ status: data.status, follow_up_at: data.follow_up_at?.slice(0, 10) ?? '', notes: data.notes ?? '' });
  };
  useEffect(() => { load(); }, [id]);
  if (!o) return <div className="p-4"><Header title="Opportunity" /><p className="mt-4 text-sm text-muted-foreground">Not found or no access.</p></div>;
  const src = safeHttpUrl(o.source_url);
  const save = async () => {
    const { error } = await supabase.from('opportunities').update({ status: form.status, follow_up_at: form.follow_up_at || null, notes: form.notes || null }).eq('id', id);
    toast({ title: error ? 'Save failed' : 'Saved', description: error?.message }); load();
  };
  const addOutcome = async () => {
    const { data: u } = await supabase.auth.getUser();
    const cents = oc.value ? Math.round(parseFloat(oc.value) * 100) : null;
    const { error } = await supabase.from('opportunity_outcomes').insert({ opportunity_id: id, outcome: oc.outcome, value_cents: cents, currency: cents ? oc.currency : null, note: oc.note || null, actor_id: u.user?.id });
    toast({ title: error ? 'Could not record outcome' : 'Outcome recorded', description: error?.message }); load();
  };
  const prompt = `Assess this ${kindLabel(o.kind).toLowerCase()} for FastMedia.pro (web development agency). Use only these facts; say what is unknown.\nTitle: ${o.title}\nCompany: ${o.company ?? 'unknown'}\nCountry: ${o.country ?? 'unknown'}\nService need: ${o.service_need ?? 'unknown'}\nSource (${o.source_type}): ${o.source_url}\nPosted: ${o.posted_at ?? 'unknown'}; deadline: ${o.deadline_at ?? 'none'}\nEvidence: ${list(o.evidence).join(' | ') || 'none'}\nRisks: ${list(o.risks).join(' | ') || 'none'}\nSuggest scope, deliverables, risks and a short proposal outline. Do not assume a purchase.`;
  const breakdown = o.score_breakdown as ScoreResult | undefined;
  return (
    <div className="space-y-4 p-4">
      <Header title={o.title} />
      <div className="flex flex-wrap gap-2">
        <Badge variant={o.kind === 'active_buyer_request' ? 'default' : 'secondary'}>{kindLabel(o.kind)}</Badge>
        <Badge variant="outline">{o.source_type} · {o.discovery_method}</Badge>
        <Badge variant="outline">{o.posted_at ? `Posted ${days(o.posted_at)}d ago` : 'Posting date unknown'}</Badge>
        {o.deadline_at && <Badge variant="outline">Deadline {o.deadline_at.slice(0, 10)}</Badge>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Brief</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Source: {src ? <a href={src} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline">{src}</a> : 'invalid'}</p>
          <p>Retrieved: {o.retrieved_at?.slice(0, 10) ?? 'unknown'}</p>
          <p>Company: {o.company ?? '—'} · Country: {o.country ?? '—'}</p>
          <p>Public contact route: {o.public_contact_route ?? 'not recorded'}</p>
          <p>Service need: {o.service_need ?? '—'}</p>
          <p>Why it fits FastMedia: {o.fit_reason ?? 'not recorded'}</p>
          <p>Suggested deliverables: {list(o.deliverables).join(', ') || '—'}</p>
          <p>Evidence:</p><ul className="list-disc pl-5">{list(o.evidence).map((e, i) => <li key={i}>{e}</li>)}{!list(o.evidence).length && <li>None recorded</li>}</ul>
          <p>Risks: {list(o.risks).join(', ') || 'none recorded'}</p>
          <a className="text-primary underline" target="_blank" rel="noopener noreferrer" href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}>Ask ChatGPT</a>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Score {o.priority_score}/100</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">
          {breakdown?.breakdown ? <SignalBreakdown result={breakdown} /> : <p>No breakdown stored.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Follow-up</CardTitle></CardHeader><CardContent className="space-y-2">
          <select aria-label="Status" className={sel} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <Input aria-label="Follow-up date" type="date" value={form.follow_up_at} onChange={(e) => setForm({ ...form, follow_up_at: e.target.value })} />
          <Textarea aria-label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
          <Button onClick={save}>Save</Button>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Outcomes (manual only)</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <select aria-label="Outcome" className={sel} value={oc.outcome} onChange={(e) => setOc({ ...oc, outcome: e.target.value })}>{OUTCOMES.map((s) => <option key={s}>{s}</option>)}</select>
            <Input aria-label="Value" className="w-28" placeholder="Value" inputMode="decimal" value={oc.value} onChange={(e) => setOc({ ...oc, value: e.target.value })} />
            <Input aria-label="Currency" className="w-20" value={oc.currency} onChange={(e) => setOc({ ...oc, currency: e.target.value.toUpperCase() })} />
            <Input aria-label="Outcome note" placeholder="Note" value={oc.note} onChange={(e) => setOc({ ...oc, note: e.target.value })} />
            <Button variant="outline" onClick={addOutcome}>Record</Button>
          </div>
          {outcomes.map((x) => <p key={x.id} className="text-muted-foreground">{x.occurred_at.slice(0, 10)} · {x.outcome}{x.value_cents != null ? ` · ${(x.value_cents / 100).toFixed(2)} ${x.currency ?? ''}` : ''}{x.note ? ` · ${x.note}` : ''}</p>)}
          {!outcomes.length && <p className="text-muted-foreground">Not recorded.</p>}
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">
        {events.map((e) => <p key={e.id}>{new Date(e.created_at).toLocaleString()} · {e.action} {e.details?.changed ? `(${e.details.changed.join(', ')})` : ''}</p>)}
      </CardContent></Card>
    </div>
  );
}

function ImportPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const onFile = async (f?: File) => {
    if (!f) return;
    const text = await f.text();
    try { setPreview(validateRows(parseImport(text, f.name))); setFile({ name: f.name, text }); }
    catch (e) { toast({ title: 'Could not parse file', description: String(e) }); }
  };
  const ok = preview.filter((r) => !r.errors.length && !r.duplicateInFile);
  const commit = async () => {
    if (!file) return; setBusy(true);
    const { data, error } = await supabase.rpc('opportunity_import', { _filename: file.name, _hash: await sha256(file.text), _rows: prepareForImport(preview) as any });
    setBusy(false);
    const d = data as any;
    toast({ title: error ? 'Import failed' : d?.duplicate_file ? 'File already imported — nothing added' : `Imported ${d?.accepted}, skipped ${d?.skipped} existing`, description: error?.message ?? (d?.errors?.length ? `${d.errors.length} rows rejected by server` : undefined) });
  };
  return (
    <div className="space-y-4 p-4">
      <Header title="Import opportunities" />
      <p className="text-sm text-muted-foreground">JSON array or CSV. Required: title, kind (active_buyer_request | prospect_hypothesis), source_url. Optional: company, source_type (job_post, tender, forum_post, company_website, directory_listing…), discovery_method, posted_at, deadline_at, country, service_need, fit_reason, public_contact_route, deliverables, risks (CSV: separate with |), evidence. Scores are recomputed from evidence; supplied scores are ignored.</p>
      <Input type="file" accept=".json,.csv,application/json,text/csv" aria-label="Import file" onChange={(e) => onFile(e.target.files?.[0])} />
      {!!preview.length && (
        <>
          <p className="text-sm text-foreground">{ok.length} ready · {preview.length - ok.length} rejected or duplicate</p>
          <div className="grid gap-1 text-xs">
            {preview.map((r) => (
              <div key={r.index} className={`rounded border p-2 ${r.errors.length ? 'border-destructive' : 'border-border'}`}>
                <span className="font-medium text-foreground">#{r.index} {String(r.row.title ?? '(no title)')}</span>
                {[...r.errors, ...r.notes].map((m) => <p key={m} className={r.errors.length ? 'text-destructive' : 'text-muted-foreground'}>{m}</p>)}
              </div>
            ))}
          </div>
          <Button disabled={!ok.length || busy} onClick={commit}>Import {ok.length} rows</Button>
        </>
      )}
    </div>
  );
}

function Methods() {
  const [rows, setRows] = useState<Opp[]>([]); const [outs, setOuts] = useState<Opp[]>([]);
  useEffect(() => {
    supabase.from('opportunities').select('id,source_type,discovery_method,priority_score').limit(5000).then(({ data }) => setRows(data ?? []));
    supabase.from('opportunity_outcomes').select('opportunity_id,outcome').limit(5000).then(({ data }) => setOuts(data ?? []));
  }, []);
  const groups = useMemo(() => {
    const m = new Map<string, { n: number; high: number; ids: Set<string> }>();
    rows.forEach((r) => { const k = `${r.source_type} · ${r.discovery_method}`; const g = m.get(k) ?? { n: 0, high: 0, ids: new Set() }; g.n++; if (r.priority_score >= 60) g.high++; g.ids.add(r.id); m.set(k, g); });
    return [...m.entries()];
  }, [rows]);
  const count = (ids: Set<string>, o: string) => { const c = outs.filter((x) => ids.has(x.opportunity_id) && x.outcome === o).length; return c || 'not recorded'; };
  return (
    <div className="space-y-4 p-4">
      <Header title="Source / method performance" />
      <p className="text-xs text-muted-foreground">Proposals and wins come only from manually recorded outcomes.</p>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Source · method</th><th>Records</th><th>Score ≥60</th><th>Proposals</th><th>Won</th></tr></thead>
        <tbody>{groups.map(([k, g]) => <tr key={k} className="border-t border-border text-foreground"><td>{k}</td><td>{g.n}</td><td>{g.high}</td><td>{count(g.ids, 'proposal_sent')}</td><td>{count(g.ids, 'won')}</td></tr>)}</tbody></table>
        {!groups.length && <p className="text-sm text-muted-foreground">No records yet.</p>}
      </div>
    </div>
  );
}

export default function AdminOpportunities() {
  const { id } = useParams();
  if (id === 'import') return <ImportPage />;
  if (id === 'methods') return <Methods />;
  if (id) return <Detail id={id} />;
  return <Inbox />;
}
