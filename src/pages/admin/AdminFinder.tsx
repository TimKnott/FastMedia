import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, Sheet, Trash2, ExternalLink, Download, Gauge, Target, Copy, Send } from 'lucide-react';

type Kind = 'listing' | 'event' | 'content' | 'bad_site' | 'local_place' | 'audience_pack';
type Site = { id: string; name: string; default_location: string; default_radius_km: number; sheet_url: string | null; modes: Kind[] };
type Pack = { meta_locations: string[]; meta_radius_km: number; age_min: number; age_max: number; meta_interests: string[]; ad_angles: string[]; search_keywords: string[]; negative_keywords: string[]; audience_note: string; budget_note: string };
type Find = { id: string; kind: Kind; title: string; category: string; country: string; city: string; date_start: string; date_end: string; website: string; email: string; phone: string; address: string; summary: string; source_url: string; status: string; exported_at: string | null; score: number | null; audit: { reasons?: string[] } & Partial<Pack> | null };

const COUNTRIES = ['Czech Republic', 'Slovakia', 'Austria', 'Germany', 'Poland', 'Hungary'];
const LABEL: Record<Kind, string> = { listing: 'Directory listings', event: 'Events', content: 'Blog & YouTube ideas', bad_site: 'Bad websites', local_place: 'Local horse places', audience_pack: 'Advert targeting' };
const PLACEHOLDER: Record<Kind, string> = {
  listing: 'e.g. jezdecká škola, livery yard, farrier, veterinář',
  event: 'e.g. show jumping, dressage, horse fair, western',
  content: 'e.g. winter hoof care, buying a first horse',
  bad_site: 'e.g. instalatér, elektrikář, kadeřnictví',
  local_place: 'leave empty for all, or e.g. ustájení, pony club',
  audience_pack: 'e.g. horse owners with 1–3 horses, stable managers',
};
const usesArea = (k: Kind) => k === 'bad_site' || k === 'local_place' || k === 'audience_pack';

const errorText = async (error: unknown, data: { error?: string } | null) => {
  if (data?.error) return data.error;
  if (error instanceof FunctionsHttpError) { try { return (await error.context.json()).error; } catch { /* ignore */ } }
  return 'Something went wrong. Try again.';
};
const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('Copied'); };

const PackView = ({ p }: { p: Pack }) => (
  <div className="grid md:grid-cols-2 gap-4 text-sm">
    <div className="space-y-2">
      <p className="font-medium">Facebook / Instagram</p>
      <p>Locations: {p.meta_locations?.join(', ')} · +{p.meta_radius_km} km · age {p.age_min}–{p.age_max}</p>
      <div className="flex flex-wrap gap-1">{p.meta_interests?.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div>
      <p className="font-medium pt-2">Advert angles</p>
      <ul className="list-disc pl-5">{p.ad_angles?.map((a) => <li key={a}>{a}</li>)}</ul>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between"><p className="font-medium">Google / Sklik phrases</p><Button size="sm" variant="ghost" onClick={() => copy(p.search_keywords.join('\n'))}><Copy className="w-3 h-3" /> Copy</Button></div>
      <p className="text-muted-foreground">{p.search_keywords?.join(' · ')}</p>
      <div className="flex items-center justify-between"><p className="font-medium">Do not show for</p><Button size="sm" variant="ghost" onClick={() => copy(p.negative_keywords.map((k) => `-${k}`).join('\n'))}><Copy className="w-3 h-3" /> Copy</Button></div>
      <p className="text-muted-foreground">{p.negative_keywords?.join(' · ')}</p>
    </div>
    <p className="md:col-span-2 text-muted-foreground">Estimate: {p.audience_note} {p.budget_note}</p>
    <div className="md:col-span-2 flex gap-2">
      <Button asChild size="sm" variant="outline"><Link to="/admin/ad-studio">Open Ad Studio</Link></Button>
      <Button asChild size="sm" variant="outline"><Link to="/admin/ad-compliance">Check adverts</Link></Button>
    </div>
  </div>
);

const AdminFinder = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState('');
  const [kind, setKind] = useState<Kind>('listing');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(30);
  const [countries, setCountries] = useState<string[]>(['Czech Republic']);
  const [count, setCount] = useState(10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [items, setItems] = useState<Find[]>([]);
  const [busy, setBusy] = useState('');

  const site = sites.find((s) => s.id === siteId);
  const modes = (site?.modes?.length ? site.modes : ['listing']) as Kind[];

  useEffect(() => {
    supabase.from('business_sites').select('id,name,default_location,default_radius_km,sheet_url,modes').order('created_at').then(({ data }) => {
      const list = (data as unknown as Site[]) ?? [];
      setSites(list);
      if (list.length) setSiteId(list[0].id);
    });
  }, []);

  const load = async (id = siteId) => {
    if (!id) return;
    const { data } = await supabase.from('directory_finds').select('*').eq('site_id', id).order('created_at', { ascending: false }).limit(1000);
    setItems((data as unknown as Find[]) ?? []);
  };
  useEffect(() => {
    if (!site) return;
    setKind(modes[0]); setLocation(site.default_location || ''); setRadius(site.default_radius_km || 30); setSheetUrl(site.sheet_url ?? '');
    load(site.id);
  }, [siteId, sites.length]);

  const call = async (body: Record<string, unknown>, label: string) => {
    setBusy(label);
    const { data, error } = await supabase.functions.invoke('finder', { body: { site_id: siteId, ...body } });
    setBusy('');
    if (error || !data?.ok) { toast.error(await errorText(error, data)); return null; }
    load();
    return data;
  };

  const search = async () => {
    if (kind === 'audience_pack') { if (await call({ action: 'audience_pack', topic, location, radius_km: radius }, 'search')) toast.success('Targeting pack ready.'); return; }
    const d = await call({ kind, topic, countries, count, location, radius_km: radius, date_from: from, date_to: to }, 'search');
    if (d) toast.success(`Found ${d.found}, added ${d.added} new.${kind === 'bad_site' ? ' Now press "Check websites".' : ''}`);
  };
  const audit = async () => { const d = await call({ action: 'audit' }, 'audit'); if (d) toast.success(`Checked ${d.checked} websites.`); };
  const exportSheet = async () => { const d = await call({ action: 'export' }, 'export'); if (d) toast.success(d.exported ? `Sent ${d.exported} rows to your Google Sheet.` : 'Nothing new to send.'); };
  const saveSheet = async () => {
    const { error } = await supabase.from('business_sites').update({ sheet_url: sheetUrl.trim() }).eq('id', siteId);
    if (error) return toast.error('Could not save the link.');
    setSites((p) => p.map((s) => (s.id === siteId ? { ...s, sheet_url: sheetUrl.trim() } : s)));
    toast.success('Sheet link saved.');
  };
  const setStatus = async (id: string, status: string) => {
    await supabase.from('directory_finds').update({ status }).eq('id', id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status } : i)));
  };
  const remove = async (id: string) => { await supabase.from('directory_finds').delete().eq('id', id); setItems((p) => p.filter((i) => i.id !== id)); };
  const toProspecting = async (i: Find) => {
    const { error } = await supabase.from('prospects').insert({
      company: i.title, email: i.email.toLowerCase(), phone: i.phone || null, website: i.website || null, region: i.city || null, trade: i.category || null,
      language: 'cs', source: 'finder', source_id: i.id, fit_score: i.score ?? 0, notes: (i.audit?.reasons ?? []).join('; '),
    });
    if (error) return toast.error(error.message.includes('duplicate') ? 'Already in the Prospecting desk.' : 'Could not add to Prospecting desk.');
    setStatus(i.id, 'contacted');
    toast.success('Added to the Prospecting desk.');
  };
  const csv = () => {
    const rows = shown.map((i) => [i.title, i.category, i.city, i.country, i.website, i.email, i.phone, i.score ?? '', (i.audit?.reasons ?? []).join('; '), i.summary, i.source_url, i.status]);
    const text = [['name', 'category', 'city', 'country', 'website', 'email', 'phone', 'score', 'reasons', 'summary', 'source', 'status'], ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const shown = useMemo(() => {
    const l = items.filter((i) => i.kind === kind);
    return kind === 'bad_site' ? [...l].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)) : l;
  }, [items, kind]);
  const pending = items.filter((i) => !i.exported_at && i.status !== 'rejected' && i.kind !== 'audience_pack').length;
  const unchecked = items.filter((i) => i.kind === 'bad_site' && i.score == null).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Finder</h1>
          <p className="text-sm text-muted-foreground">Each search uses a small amount of AI credit, only when you press the button. Website checks are free.</p>
        </div>
        <div className="w-full md:w-80 space-y-1.5">
          <Label>Website</Label>
          <Select value={siteId} onValueChange={setSiteId}>
            <SelectTrigger><SelectValue placeholder="Choose website" /></SelectTrigger>
            <SelectContent>{sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {kind === 'local_place' || kind === 'audience_pack' ? (
        <p className="text-xs text-muted-foreground">Finds only businesses, clubs, public groups and events — never private people's profiles, which the social networks and GDPR don't allow. Reach individual horse owners through the advert targeting pack.</p>
      ) : null}

      <Card>
        <CardHeader><CardTitle className="text-base">Google Sheet (optional)</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Paste the Google Sheet link for this website" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
          <Button variant="outline" onClick={saveSheet}>Save link</Button>
          <Button onClick={exportSheet} disabled={!!busy || !site?.sheet_url}>
            {busy === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />} Send {pending} new to sheet
          </Button>
        </CardContent>
      </Card>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <TabsList>{modes.map((k) => <TabsTrigger key={k} value={k}>{LABEL[k]}</TabsTrigger>)}</TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="topic">{kind === 'audience_pack' ? 'Who to reach' : 'What to look for (Czech or English)'}</Label>
            <Input id="topic" placeholder={PLACEHOLDER[kind]} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          {usesArea(kind) ? (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5 flex-1 min-w-48"><Label htmlFor="loc">Area</Label><Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
              <div className="space-y-1.5 w-28"><Label htmlFor="rad">Radius km</Label><Input id="rad" type="number" min={1} max={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Countries</Label>
              <div className="flex flex-wrap gap-4">
                {COUNTRIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={countries.includes(c)} onCheckedChange={() => setCountries((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))} /> {c}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 items-end">
            {kind === 'event' && (<>
              <div className="space-y-1.5"><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </>)}
            {kind !== 'audience_pack' && (
              <div className="space-y-1.5 w-32">
                <Label>How many</Label>
                <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[5, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={search} disabled={!!busy}>
              {busy === 'search' ? <Loader2 className="w-4 h-4 animate-spin" /> : kind === 'audience_pack' ? <Target className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {kind === 'audience_pack' ? 'Build targeting pack' : 'Search'}
            </Button>
            {kind === 'bad_site' && (
              <Button variant="outline" onClick={audit} disabled={!!busy || !unchecked}>
                {busy === 'audit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gauge className="w-4 h-4" />} Check websites ({unchecked}) — free
              </Button>
            )}
            {kind !== 'audience_pack' && <Button variant="ghost" onClick={csv} disabled={!shown.length}><Download className="w-4 h-4" /> CSV</Button>}
          </div>
          {busy === 'search' && <p className="text-xs text-muted-foreground">Working — this can take a minute or two.</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{shown.length} saved · {LABEL[kind]}</p>
        {shown.map((i) => (
          <Card key={i.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{i.title}</span>
                {i.score != null && <Badge variant={i.score >= 50 ? 'destructive' : 'secondary'}>Needs new site: {i.score}/100</Badge>}
                {i.category && <Badge variant="secondary">{i.category}</Badge>}
                {(i.city || i.country) && <Badge variant="outline">{[i.city, i.country].filter(Boolean).join(', ')}</Badge>}
                {i.date_start && <Badge variant="outline">{i.date_start}{i.date_end && i.date_end !== i.date_start ? ` – ${i.date_end}` : ''}</Badge>}
                {i.exported_at && <Badge>In sheet</Badge>}
              </div>
              {i.kind === 'audience_pack' && i.audit ? <PackView p={i.audit as Pack} /> : null}
              {i.audit?.reasons && <p className="text-sm">{i.audit.reasons.join(' · ')}</p>}
              {i.summary && <p className="text-sm text-muted-foreground">{i.summary}</p>}
              <div className="flex flex-wrap gap-3 text-sm">
                {i.website && <a className="text-primary inline-flex items-center gap-1" href={i.website} target="_blank" rel="noreferrer">Website <ExternalLink className="w-3 h-3" /></a>}
                {i.source_url && i.source_url !== i.website && <a className="text-primary inline-flex items-center gap-1" href={i.source_url} target="_blank" rel="noreferrer">Source <ExternalLink className="w-3 h-3" /></a>}
                {i.email && <span>{i.email}</span>}
                {i.phone && <span>{i.phone}</span>}
              </div>
              <div className="flex gap-2 items-center">
                {i.kind !== 'audience_pack' && (
                  <Select value={i.status} onValueChange={(v) => setStatus(i.id, v)}>
                    <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{['new', 'contacted', 'won', 'added', 'rejected'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {i.kind === 'bad_site' && i.email && <Button size="sm" variant="outline" onClick={() => toProspecting(i)}><Send className="w-3 h-3" /> Prospecting desk</Button>}
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(i.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminFinder;
