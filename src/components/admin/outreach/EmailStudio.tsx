import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionManager } from '@/components/admin/outreach/PermissionManager';
import { EmailVisualEditor } from '@/components/admin/EmailVisualEditor';
import { toast } from '@/hooks/use-toast';
import { Copy, HelpCircle, Languages, Loader2, Play, Save, Star, Trash2, Upload, Video, X } from 'lucide-react';
import {
  BUILTIN_TEMPLATES, GUIDE_TRADES, MERGE_FIELDS, WRITING_PROMPTS, checkEmail, guessMapping, parseTable,
  recommendEmail, renderMerge, type MergeField, type Signal, type StudioTemplate,
} from '@/lib/emailStudio';

const db = supabase as any;
const ONBOARD_KEY = 'fm-email-studio-onboarded';

const STEPS = [
  { t: 'Connect your mailbox', d: 'Emails send from your Google Workspace mailbox through the paced queue (Sending pace tab). Keep Test mode on while practising.' },
  { t: 'Pick who to email', d: 'Use the Lead review queue, or paste/upload a spreadsheet in the Personalise tab.' },
  { t: 'Choose a template', d: 'Not sure which? Open the Guide tab — pick the business type and what you noticed, and it recommends one.' },
  { t: 'Personalise & adapt', d: 'Merge fields like {{company}} fill in from your list. Use "Adapt to Czech/German" for native wording, then check it with the English back-translation.' },
  { t: 'Approve & queue', d: 'Nothing sends automatically. Copy the finished email into a prospect\'s draft and approve it in Message approvals.' },
];

async function errText(error: unknown) {
  return error instanceof FunctionsHttpError ? await error.context.text() : String((error as Error)?.message ?? error);
}

export function EmailStudio() {
  const [showIntro, setShowIntro] = useState(() => typeof window !== 'undefined' && !localStorage.getItem(ONBOARD_KEY));
  const [tab, setTab] = useState('compose');
  const [subject, setSubject] = useState(BUILTIN_TEMPLATES[0].subject);
  const [html, setHtml] = useState(BUILTIN_TEMPLATES[0].body_html);
  const [saved, setSaved] = useState<StudioTemplate[]>([]);

  const loadSaved = async () => {
    const { data } = await db.from('email_templates').select('*').order('is_favourite', { ascending: false }).order('updated_at', { ascending: false });
    setSaved(data ?? []);
  };
  useEffect(() => { loadSaved(); }, []);

  const useTemplate = (t: StudioTemplate) => { setSubject(t.subject); setHtml(t.body_html); setTab('compose'); toast({ title: `Loaded “${t.name}”` }); };
  const closeIntro = () => { localStorage.setItem(ONBOARD_KEY, '1'); setShowIntro(false); };

  return (
    <div className="space-y-4">
      {showIntro ? (
        <Card className="border-accent/40">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-lg">Welcome to the Email studio — 5 steps</CardTitle>
            <Button size="icon" variant="ghost" aria-label="Close guide" onClick={closeIntro}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 sm:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="rounded-md border border-border p-3">
                  <p className="text-xs font-semibold text-accent">Step {i + 1}</p>
                  <p className="font-medium text-foreground">{s.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">Rules: business addresses only, every email gets an unsubscribe line, and stay within the daily pace (25–35/day while warming up).</p>
            <Button className="mt-3" onClick={closeIntro}>Got it</Button>
          </CardContent>
        </Card>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowIntro(true)}><HelpCircle className="mr-2 h-4 w-4" />How this works</Button>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="guide">1 · Guide</TabsTrigger>
          <TabsTrigger value="templates">2 · Templates</TabsTrigger>
          <TabsTrigger value="compose">3 · Write &amp; adapt</TabsTrigger>
          <TabsTrigger value="merge">4 · Personalise</TabsTrigger>
          <TabsTrigger value="video">5 · Video</TabsTrigger>
          <TabsTrigger value="permissions">6 · Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="guide"><GuidePanel onUse={useTemplate} /></TabsContent>
        <TabsContent value="templates"><TemplatesPanel saved={saved} reload={loadSaved} onUse={useTemplate} subject={subject} html={html} /></TabsContent>
        <TabsContent value="compose"><ComposePanel subject={subject} setSubject={setSubject} html={html} setHtml={setHtml} /></TabsContent>
        <TabsContent value="merge"><MergePanel subject={subject} html={html} /></TabsContent>
        <TabsContent value="video"><VideoPanel onInsert={(url) => { setHtml((h) => h + `<p><a href="${url}">▶ Watch the video</a></p>`); setTab('compose'); }} /></TabsContent>
        <TabsContent value="permissions"><PermissionManager /></TabsContent>
      </Tabs>
    </div>
  );
}

function GuidePanel({ onUse }: { onUse: (t: StudioTemplate) => void }) {
  const [trade, setTrade] = useState('trades');
  const [signal, setSignal] = useState<Signal>('no_site');
  const advice = recommendEmail(trade, signal);
  const tpl = BUILTIN_TEMPLATES.find((t) => t.id === advice.templateId)!;
  const signals: { id: Signal; label: string }[] = [
    { id: 'no_site', label: 'No website' }, { id: 'old_site', label: 'Old / poor website' },
    { id: 'weak_google', label: 'Weak Google listing' }, { id: 'no_booking', label: 'No online booking' }, { id: 'unknown', label: 'Not sure' },
  ];
  return (
    <Card><CardContent className="space-y-4 pt-6">
      <div>
        <Label>Type of business</Label>
        <div className="mt-2 flex flex-wrap gap-2">{GUIDE_TRADES.map((g) => (
          <Button key={g.id} size="sm" variant={trade === g.id ? 'default' : 'outline'} onClick={() => setTrade(g.id)}>{g.label}</Button>))}</div>
      </div>
      <div>
        <Label>What did you notice?</Label>
        <div className="mt-2 flex flex-wrap gap-2">{signals.map((s) => (
          <Button key={s.id} size="sm" variant={signal === s.id ? 'default' : 'outline'} onClick={() => setSignal(s.id)}>{s.label}</Button>))}</div>
      </div>
      <div className="rounded-md border border-accent/40 bg-accent/5 p-4 space-y-2">
        <p className="text-sm text-muted-foreground">Recommended</p>
        <p className="font-semibold text-foreground">{tpl.name}</p>
        <p className="text-sm text-foreground">{advice.reason}</p>
        <p className="text-sm"><span className="text-muted-foreground">Subject ideas: </span>{advice.subjects.join(' · ')}</p>
        <p className="text-sm"><span className="text-muted-foreground">Tip: </span>{advice.tip}</p>
        <Button onClick={() => onUse(tpl)}>Use this template</Button>
      </div>
    </CardContent></Card>
  );
}

function TemplatesPanel({ saved, reload, onUse, subject, html }: { saved: StudioTemplate[]; reload: () => void; onUse: (t: StudioTemplate) => void; subject: string; html: string }) {
  const [name, setName] = useState('');
  const save = async () => {
    if (!name.trim()) return toast({ title: 'Give the template a name', variant: 'destructive' });
    const { error } = await db.from('email_templates').insert({ name: name.trim(), subject, body_html: html });
    if (error) return toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    setName(''); reload(); toast({ title: 'Template saved' });
  };
  const fav = async (t: StudioTemplate) => { await db.from('email_templates').update({ is_favourite: !t.is_favourite }).eq('id', t.id); reload(); };
  const del = async (t: StudioTemplate) => { if (!confirm(`Delete “${t.name}”?`)) return; await db.from('email_templates').delete().eq('id', t.id); reload(); };
  const dup = async (t: StudioTemplate) => { await db.from('email_templates').insert({ name: `${t.name} (copy)`, subject: t.subject, body_html: t.body_html, category: t.category }); reload(); };
  const card = (t: StudioTemplate) => (
    <div key={t.id} className="rounded-md border border-border p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{t.name}</p>
        {t.builtin ? <Badge variant="secondary">Standard</Badge> : t.is_favourite && <Star className="h-4 w-4 text-accent" aria-label="Favourite" />}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{t.subject}</p>
      <div className="flex flex-wrap gap-1">
        <Button size="sm" onClick={() => onUse(t)}>Use</Button>
        {t.builtin ? (
          <Button size="sm" variant="outline" onClick={() => dup(t)}><Copy className="mr-1 h-3 w-3" />Save a copy</Button>
        ) : (<>
          <Button size="sm" variant="ghost" aria-label="Favourite" onClick={() => fav(t)}><Star className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" aria-label="Duplicate" onClick={() => dup(t)}><Copy className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => del(t)}><Trash2 className="h-4 w-4" /></Button>
        </>)}
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      <Card><CardContent className="flex flex-wrap items-end gap-2 pt-6">
        <div className="flex-1 min-w-[200px]"><Label htmlFor="tpl-name">Save the current email as a template</Label><Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Plumbers — Prague" /></div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" />Save</Button>
      </CardContent></Card>
      {saved.length > 0 && <><h3 className="font-semibold text-foreground">My templates</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map(card)}</div></>}
      <h3 className="font-semibold text-foreground">Standard templates</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{BUILTIN_TEMPLATES.map(card)}</div>
    </div>
  );
}

function ComposePanel({ subject, setSubject, html, setHtml }: { subject: string; setSubject: (s: string) => void; html: string; setHtml: (s: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [adapted, setAdapted] = useState<{ lang: string; subject: string; html: string; notes: string; missing: string[] } | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const check = checkEmail(subject, html);

  const adapt = async (target: 'cs' | 'de') => {
    setBusy(target); setBack(null);
    const { data, error } = await supabase.functions.invoke('email-adapt', { body: { mode: 'adapt', target, subject, html } });
    setBusy(null);
    if (error) return toast({ title: 'Adaptation failed', description: await errText(error), variant: 'destructive' });
    setAdapted({ lang: target, subject: data.subject, html: data.html, notes: data.notes, missing: data.missing_placeholders ?? [] });
  };
  const backTranslate = async () => {
    if (!adapted) return;
    setBusy('back');
    const { data, error } = await supabase.functions.invoke('email-adapt', { body: { mode: 'back', target: 'en', subject: adapted.subject, html: adapted.html } });
    setBusy(null);
    if (error) return toast({ title: 'Back-translation failed', description: await errText(error), variant: 'destructive' });
    setBack(`<p><strong>${data.subject}</strong></p>${data.html}`);
  };
  const copyOut = async (s: string, h: string) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([h], { type: 'text/html' }), 'text/plain': new Blob([`${s}\n\n${h.replace(/<[^>]+>/g, '')}`], { type: 'text/plain' }) })]);
    } catch { await navigator.clipboard.writeText(`${s}\n\n${h}`); }
    toast({ title: 'Copied', description: 'Paste it into a prospect draft in Message approvals.' });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <div><Label htmlFor="studio-subject">Subject</Label><Input id="studio-subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <EmailVisualEditor value={html} onChange={setHtml} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => adapt('cs')} disabled={!!busy}>{busy === 'cs' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}Adapt to Czech</Button>
          <Button variant="outline" onClick={() => adapt('de')} disabled={!!busy}>{busy === 'de' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}Adapt to German</Button>
          <Button onClick={() => copyOut(subject, html)}><Copy className="mr-2 h-4 w-4" />Copy email</Button>
        </div>
        {adapted && (
          <Card><CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{adapted.lang === 'cs' ? 'Czech' : 'German'} version</p>
              {adapted.missing.length > 0 && <Badge variant="destructive">Missing: {adapted.missing.join(', ')}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{adapted.notes}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Input value={adapted.subject} onChange={(e) => setAdapted({ ...adapted, subject: e.target.value })} aria-label="Adapted subject" />
                <EmailVisualEditor value={adapted.html} onChange={(h) => setAdapted({ ...adapted, html: h })} />
              </div>
              <div className="rounded-md border border-border p-3 text-sm [&_p]:mb-2">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">English check</p>
                {back ? <div dangerouslySetInnerHTML={{ __html: back.replace(/<script[\s\S]*?<\/script>/gi, '') }} /> : (
                  <Button size="sm" variant="outline" onClick={backTranslate} disabled={busy === 'back'}>{busy === 'back' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Translate back to English</Button>)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => copyOut(adapted.subject, adapted.html)}><Copy className="mr-2 h-4 w-4" />Copy {adapted.lang === 'cs' ? 'Czech' : 'German'} email</Button>
              <Button variant="outline" onClick={() => { setSubject(adapted.subject); setHtml(adapted.html); setAdapted(null); }}>Replace main draft</Button>
            </div>
          </CardContent></Card>
        )}
      </div>
      <aside className="space-y-3">
        <Card><CardHeader><CardTitle className="text-sm">Email check · {check.words} words</CardTitle></CardHeader>
          <CardContent>{check.issues.length === 0 ? <p className="text-sm text-primary">Looks good.</p> : (
            <ul className="list-disc pl-4 text-sm text-foreground space-y-1">{check.issues.map((i) => <li key={i}>{i}</li>)}</ul>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Writing prompts</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">{WRITING_PROMPTS.map((w) => <li key={w}>{w}</li>)}</ul>
            <p className="mt-3 text-xs text-muted-foreground">Merge fields: {MERGE_FIELDS.map((f) => `{{${f}}}`).join(' ')}</p></CardContent></Card>
      </aside>
    </div>
  );
}

async function callSheets(body: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke('sheets-import', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) { try { const j = await error.context.json(); msg = j.status === 404 ? 'Sheet not found — check the link.' : j.status === 403 ? 'Your connected Google account cannot open this sheet.' : j.error ?? msg; } catch { /* keep */ } }
    throw new Error(msg);
  }
  return data;
}

function SheetPicker({ onLoad }: { onLoad: (tsv: string) => void }) {
  const [link, setLink] = useState(() => localStorage.getItem('fm-studio-sheet') ?? '');
  const [info, setInfo] = useState<{ title: string; tabs: string[] } | null>(null);
  const [tab, setTab] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e) { toast({ title: 'Google Sheets', description: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); } };
  const openSheet = () => run(async () => {
    const d = await callSheets({ action: 'tabs', sheet: link });
    localStorage.setItem('fm-studio-sheet', link);
    setInfo(d); setTab(d.tabs[0] ?? '');
  });
  const loadTab = () => run(async () => {
    const d = await callSheets({ action: 'rows', sheet: link, tab });
    onLoad(d.tsv); toast({ title: `Loaded ${d.rows} rows from “${tab}”` });
  });
  return (
    <Card><CardHeader><CardTitle className="text-sm">Use a Google Sheet</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Paste the sheet link (the first row must be headers). Read-only — nothing in your sheet is changed.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input aria-label="Google Sheets link" value={link} onChange={(e) => { setLink(e.target.value); setInfo(null); }} placeholder="https://docs.google.com/spreadsheets/d/…" />
          <Button variant="outline" onClick={openSheet} disabled={busy || !link.trim()}>{busy && !info ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Open sheet</Button>
        </div>
        {info && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium">{info.title}</span>
            <select aria-label="Sheet tab" className="rounded-md border border-input bg-background px-2 py-2 text-sm" value={tab} onChange={(e) => setTab(e.target.value)}>
              {info.tabs.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button onClick={loadTab} disabled={busy || !tab}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Load rows</Button>
          </div>
        )}
      </CardContent></Card>
  );
}

function MergePanel({ subject, html }: { subject: string; html: string }) {
  const [raw, setRaw] = useState('');
  const table = useMemo(() => parseTable(raw), [raw]);
  const [map, setMap] = useState<Partial<Record<MergeField, string>>>({});
  const [fallbacks, setFallbacks] = useState<Record<string, string>>({ first_name: 'there', sender_name: 'Tim Knott' });
  const [idx, setIdx] = useState(0);
  useEffect(() => { setMap(guessMapping(table.headers)); setIdx(0); }, [table.headers.join('|')]);

  const rowFor = (r: Record<string, string>) => Object.fromEntries(MERGE_FIELDS.map((f) => [f, map[f] ? r[map[f]!] ?? '' : '']));
  const results = table.rows.map((r) => {
    const row = rowFor(r);
    const s = renderMerge(subject, row, fallbacks), b = renderMerge(html, row, fallbacks);
    return { subject: s.text, html: b.text, missing: [...new Set([...s.missing, ...b.missing])] };
  });
  const cur = results[idx];
  const onFile = async (f?: File) => {
    if (!f) return;
    if (!/\.(csv|tsv|txt)$/i.test(f.name)) return toast({ title: 'Please upload a CSV', description: 'In Excel or Google Sheets: File → Download → CSV. Or copy the cells and paste them below.', variant: 'destructive' });
    setRaw(await f.text());
  };
  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [['row', 'subject', 'html', 'missing'].join(','), ...results.map((r, i) => [i + 1, esc(r.subject), esc(r.html), esc(r.missing.join(' '))].join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = 'personalised-emails.csv'; a.click();
  };

  return (
    <div className="space-y-4">
      <SheetPicker onLoad={setRaw} />
      <Card><CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="merge-file" className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"><Upload className="h-4 w-4" />Upload CSV</Label>
          <input id="merge-file" type="file" accept=".csv,.tsv,.txt" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          <span className="text-xs text-muted-foreground">or copy cells from Excel/Google Sheets (with the header row) and paste:</span>
        </div>
        <Textarea rows={5} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'company,first_name,city,trade,website\nInstalatérství Novák,Jan,Louny,plumber,novak.cz'} />
      </CardContent></Card>
      {table.headers.length > 0 && (<>
        <Card><CardHeader><CardTitle className="text-sm">Match your columns ({table.rows.length} rows)</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{MERGE_FIELDS.map((f) => (
            <div key={f} className="space-y-1">
              <Label htmlFor={`map-${f}`}>{`{{${f}}}`}</Label>
              <select id={`map-${f}`} className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm" value={map[f] ?? ''} onChange={(e) => setMap({ ...map, [f]: e.target.value || undefined })}>
                <option value="">— not in sheet —</option>{table.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <Input placeholder="If empty, use…" value={fallbacks[f] ?? ''} onChange={(e) => setFallbacks({ ...fallbacks, [f]: e.target.value })} aria-label={`Fallback for ${f}`} />
            </div>))}</CardContent></Card>
        {cur && (
          <Card><CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</Button>
              <span className="text-sm text-foreground">Row {idx + 1} of {results.length}</span>
              <Button size="sm" variant="outline" disabled={idx >= results.length - 1} onClick={() => setIdx(idx + 1)}>Next</Button>
              <span className="text-sm text-muted-foreground">{results.filter((r) => r.missing.length).length} rows with missing data</span>
              <Button size="sm" className="ml-auto" onClick={exportCsv}>Download all as CSV</Button>
            </div>
            {cur.missing.length > 0 && <Badge variant="destructive">Missing: {cur.missing.join(', ')}</Badge>}
            <p className="font-medium text-foreground">{cur.subject}</p>
            <div className="rounded-md border border-border bg-card p-4 text-sm [&_a]:underline [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: cur.html.replace(/<script[\s\S]*?<\/script>/gi, '') }} />
          </CardContent></Card>
        )}
      </>)}
    </div>
  );
}

interface VideoRow { id: string; title: string; storage_path: string; cta_url: string; created_at: string }
interface LinkRow { id: string; token: string; recipient_label: string | null; video_id: string; views: { event: string }[] }

function VideoPanel({ onInsert }: { onInsert: (url: string) => void }) {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [recipient, setRecipient] = useState<Record<string, string>>({});
  const base = 'https://www.fastmedia.pro/v/';

  const load = async () => {
    const [{ data: v }, { data: l }] = await Promise.all([
      db.from('outreach_videos').select('*').order('created_at', { ascending: false }),
      db.from('video_links').select('id, token, recipient_label, video_id, views:video_views(event)').order('created_at', { ascending: false }),
    ]);
    setVideos(v ?? []); setLinks(l ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) return toast({ title: 'Please choose a video file', variant: 'destructive' });
    setBusy(true);
    const path = `${crypto.randomUUID()}-${f.name.replace(/[^a-z0-9.\-_]/gi, '_')}`;
    const { error } = await supabase.storage.from('outreach-videos').upload(path, f, { contentType: f.type });
    if (!error) await db.from('outreach_videos').insert({ title: title.trim() || f.name, storage_path: path });
    setBusy(false);
    if (error) return toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    setTitle(''); load(); toast({ title: 'Video uploaded' });
  };
  const makeLink = async (v: VideoRow) => {
    const { data, error } = await db.from('video_links').insert({ video_id: v.id, recipient_label: recipient[v.id]?.trim() || null }).select('token').single();
    if (error) return toast({ title: 'Could not create link', description: error.message, variant: 'destructive' });
    await navigator.clipboard.writeText(base + data.token).catch(() => {});
    setRecipient({ ...recipient, [v.id]: '' }); load();
    toast({ title: 'Personal link copied', description: base + data.token });
  };
  const count = (l: LinkRow, e: string) => l.views.filter((v) => v.event === e).length;

  return (
    <div className="space-y-4">
      <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        No email app (Gmail, Outlook, Apple Mail) plays video inside the inbox. Your email shows a link or a picture with a play button; clicking it opens a FastMedia page where the video plays straight away. Views are recorded per link.
      </p>
      <Card><CardContent className="flex flex-wrap items-end gap-2 pt-6">
        <div className="flex-1 min-w-[200px]"><Label htmlFor="vid-title">Video title</Label><Input id="vid-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Intro for plumbers" /></div>
        <Label htmlFor="vid-file" className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}Upload video (max 200 MB)
        </Label>
        <input id="vid-file" type="file" accept="video/*" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
      </CardContent></Card>
      {videos.map((v) => (
        <Card key={v.id}><CardHeader><CardTitle className="text-base">{v.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-xs" placeholder="Who is it for? (e.g. Novák plumbing)" value={recipient[v.id] ?? ''} onChange={(e) => setRecipient({ ...recipient, [v.id]: e.target.value })} aria-label="Recipient name" />
              <Button onClick={() => makeLink(v)}>Create personal link</Button>
            </div>
            <ul className="space-y-2">{links.filter((l) => l.video_id === v.id).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{l.recipient_label ?? 'General link'}</span>
                <code className="text-xs text-muted-foreground">{base}{l.token}</code>
                <Badge variant="secondary">opened {count(l, 'opened')}</Badge>
                <Badge variant="secondary"><Play className="mr-1 h-3 w-3" />played {count(l, 'played')}</Badge>
                <Badge variant="secondary">finished {count(l, 'completed')}</Badge>
                <Badge variant="secondary">clicked CTA {count(l, 'cta_click')}</Badge>
                <Button size="sm" variant="outline" onClick={() => onInsert(base + l.token)}>Insert into email</Button>
              </li>))}</ul>
          </CardContent></Card>
      ))}
    </div>
  );
}
