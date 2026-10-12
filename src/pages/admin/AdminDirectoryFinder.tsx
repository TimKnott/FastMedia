import { useEffect, useState } from 'react';
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
import { Loader2, Search, Sheet, Trash2, ExternalLink } from 'lucide-react';

const SITE_ID = '40210e5e-9dc4-43ec-8f72-8b72fccb4dd8';
const COUNTRIES = ['Czech Republic', 'Slovakia', 'Austria', 'Germany', 'Poland', 'Hungary'];
type Kind = 'listing' | 'event' | 'content';
type Find = { id: string; kind: Kind; title: string; category: string; country: string; city: string; date_start: string; date_end: string; website: string; email: string; phone: string; summary: string; source_url: string; status: string; exported_at: string | null };

const KIND_LABEL: Record<Kind, string> = { listing: 'Directory listings', event: 'Events', content: 'Blog & YouTube ideas' };
const PLACEHOLDER: Record<Kind, string> = {
  listing: 'e.g. jezdecká škola, livery yard, farrier, kovář, veterinář',
  event: 'e.g. show jumping, dressage, horse fair, western, endurance',
  content: 'e.g. winter hoof care, buying a first horse, stable hygiene',
};

const errorText = async (error: unknown, data: { error?: string } | null) => {
  if (data?.error) return data.error;
  if (error instanceof FunctionsHttpError) { try { return (await error.context.json()).error; } catch { /* ignore */ } }
  return 'Something went wrong. Try again.';
};

const AdminDirectoryFinder = () => {
  const [kind, setKind] = useState<Kind>('listing');
  const [topic, setTopic] = useState('');
  const [countries, setCountries] = useState<string[]>(['Czech Republic']);
  const [count, setCount] = useState(10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [items, setItems] = useState<Find[]>([]);
  const [busy, setBusy] = useState<'' | 'search' | 'export'>('');

  const load = async () => {
    const { data } = await supabase.from('directory_finds').select('*').eq('site_id', SITE_ID).order('created_at', { ascending: false }).limit(1000);
    setItems((data as Find[]) ?? []);
  };
  useEffect(() => {
    load();
    supabase.from('business_sites').select('sheet_url').eq('id', SITE_ID).maybeSingle().then(({ data }) => setSheetUrl(data?.sheet_url ?? ''));
  }, []);

  const toggle = (c: string) => setCountries((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const search = async () => {
    setBusy('search');
    const { data, error } = await supabase.functions.invoke('directory-finder', {
      body: { site_id: SITE_ID, kind, topic, countries, count, date_from: from, date_to: to },
    });
    setBusy('');
    if (error || !data?.ok) return toast.error(await errorText(error, data));
    toast.success(`Found ${data.found}, added ${data.added} new.`);
    load();
  };

  const saveSheet = async () => {
    const { error } = await supabase.from('business_sites').update({ sheet_url: sheetUrl.trim() }).eq('id', SITE_ID);
    error ? toast.error('Could not save the link.') : toast.success('Sheet link saved.');
  };

  const exportSheet = async () => {
    setBusy('export');
    const { data, error } = await supabase.functions.invoke('directory-finder', { body: { site_id: SITE_ID, action: 'export' } });
    setBusy('');
    if (error || !data?.ok) return toast.error(await errorText(error, data));
    toast.success(data.exported ? `Sent ${data.exported} rows to your Google Sheet.` : 'Nothing new to send.');
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from('directory_finds').update({ status }).eq('id', id);
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status } : i)));
  };
  const remove = async (id: string) => {
    await supabase.from('directory_finds').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const shown = items.filter((i) => i.kind === kind);
  const pending = items.filter((i) => !i.exported_at && i.status !== 'rejected').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Cheval et Stable finder</h1>
        <p className="text-sm text-muted-foreground">Finds new stables and horse businesses, events in Czechia and nearby countries, and blog/YouTube ideas — then sends them to your Google Sheet. Each search uses a small amount of AI credit, only when you press the button.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Google Sheet</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <Input placeholder="Paste the Google Sheet link (https://docs.google.com/spreadsheets/d/…)" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
            <Button variant="outline" onClick={saveSheet}>Save link</Button>
            <Button onClick={exportSheet} disabled={!!busy}>
              {busy === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />} Send {pending} new to sheet
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Rows go into tabs called Listings, Events and Content ideas (created if missing). Rows already in the sheet are skipped.</p>
        </CardContent>
      </Card>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <TabsList>{(Object.keys(KIND_LABEL) as Kind[]).map((k) => <TabsTrigger key={k} value={k}>{KIND_LABEL[k]}</TabsTrigger>)}</TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="topic">What to look for (Czech or English)</Label>
            <Input id="topic" placeholder={PLACEHOLDER[kind]} value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Countries</Label>
            <div className="flex flex-wrap gap-4">
              {COUNTRIES.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={countries.includes(c)} onCheckedChange={() => toggle(c)} /> {c}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            {kind === 'event' && (<>
              <div className="space-y-1.5"><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </>)}
            <div className="space-y-1.5 w-32">
              <Label>How many</Label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[5, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={search} disabled={!!busy}>
              {busy === 'search' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
            </Button>
          </div>
          {busy === 'search' && <p className="text-xs text-muted-foreground">Searching the web — this can take a minute or two.</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{shown.length} saved {KIND_LABEL[kind].toLowerCase()}</p>
        {shown.map((i) => (
          <Card key={i.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{i.title}</span>
                {i.category && <Badge variant="secondary">{i.category}</Badge>}
                {(i.city || i.country) && <Badge variant="outline">{[i.city, i.country].filter(Boolean).join(', ')}</Badge>}
                {i.date_start && <Badge variant="outline">{i.date_start}{i.date_end && i.date_end !== i.date_start ? ` – ${i.date_end}` : ''}</Badge>}
                {i.exported_at && <Badge>In sheet</Badge>}
              </div>
              {i.summary && <p className="text-sm text-muted-foreground">{i.summary}</p>}
              <div className="flex flex-wrap gap-3 text-sm">
                {i.website && <a className="text-primary inline-flex items-center gap-1" href={i.website} target="_blank" rel="noreferrer">Website <ExternalLink className="w-3 h-3" /></a>}
                {i.source_url && i.source_url !== i.website && <a className="text-primary inline-flex items-center gap-1" href={i.source_url} target="_blank" rel="noreferrer">Source <ExternalLink className="w-3 h-3" /></a>}
                {i.email && <span>{i.email}</span>}
                {i.phone && <span>{i.phone}</span>}
              </div>
              <div className="flex gap-2 items-center">
                <Select value={i.status} onValueChange={(v) => setStatus(i.id, v)}>
                  <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{['new', 'contacted', 'added', 'rejected'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(i.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDirectoryFinder;
