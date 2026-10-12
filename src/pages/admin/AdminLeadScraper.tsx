import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MicButton, ExternalLinkText, ReportBad } from '@/components/admin/LeadTools';
import { Loader2, Plus, Search, Download, Settings2, Trash2 } from 'lucide-react';

type Site = { id: string; name: string; url: string | null; description: string; lead_brief: string; default_location: string; default_radius_km: number };
type Lead = { id: string; name: string; category: string | null; website: string | null; email: string | null; phone: string | null; address: string | null; distance_note: string | null; why_fit: string | null; source_url: string | null; status: string; created_at: string };

const emptySite = { name: '', url: '', description: '', lead_brief: '', default_location: '', default_radius_km: 30 };

const AdminLeadScraper = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(30);
  const [extra, setExtra] = useState('');
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<(typeof emptySite & { id?: string }) | null>(null);

  const site = sites.find((s) => s.id === siteId);

  const loadSites = async () => {
    const { data } = await supabase.from('business_sites').select('*').order('created_at');
    setSites((data as Site[]) ?? []);
    if (!siteId && data?.length) setSiteId(data[0].id);
  };
  const loadLeads = async () => {
    if (!siteId) return;
    const { data } = await supabase.from('scraped_leads').select('*').eq('site_id', siteId).order('created_at', { ascending: false }).limit(500);
    setLeads((data as Lead[]) ?? []);
  };
  useEffect(() => { loadSites(); }, []);
  useEffect(() => {
    if (site) { setLocation(site.default_location); setRadius(site.default_radius_km); }
    loadLeads();
  }, [siteId]);

  const run = async () => {
    if (!industry.trim()) return toast.error('Enter an industry or search term.');
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('lead-scraper', {
      body: { site_id: siteId, industry, location, radius_km: radius, extra, count },
    });
    setBusy(false);
    if (error || !data?.ok) return toast.error(data?.error || 'Search failed. Try again.');
    toast.success(`Found ${data.found}, added ${data.added} new.`);
    loadLeads();
  };

  const saveSite = async () => {
    if (!edit?.name.trim()) return toast.error('Name is required.');
    const { id, ...row } = edit;
    const { error } = id
      ? await supabase.from('business_sites').update(row).eq('id', id)
      : await supabase.from('business_sites').insert(row);
    if (error) return toast.error(error.message);
    toast.success('Saved'); setEdit(null); loadSites();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from('scraped_leads').update({ status }).eq('id', id);
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  };
  const remove = async (id: string) => {
    await supabase.from('scraped_leads').delete().eq('id', id);
    setLeads((l) => l.filter((x) => x.id !== id));
  };

  const exportCsv = () => {
    const cols = ['name', 'category', 'website', 'email', 'phone', 'address', 'distance_note', 'why_fit', 'source_url', 'status'] as const;
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...leads.map((l) => cols.map((c) => esc(l[c])).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
    a.download = `${site?.name ?? 'leads'}-leads.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Lead Scraper</h1>
        <p className="text-sm text-muted-foreground">Find new contacts for any of your websites. Uses app AI credits, not build credits. Nothing is contacted automatically.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <Label>Website</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger><SelectValue placeholder="Choose website" /></SelectTrigger>
                <SelectContent>{sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {site && <Button variant="outline" size="sm" onClick={() => setEdit({ ...site, url: site.url ?? '' })}><Settings2 className="w-4 h-4 mr-1" />Edit search rules</Button>}
            <Button variant="outline" size="sm" onClick={() => setEdit({ ...emptySite })}><Plus className="w-4 h-4 mr-1" />Add website</Button>
          </div>
          {site && <p className="text-xs text-muted-foreground"><strong>Looking for:</strong> {site.lead_brief}</p>}
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2"><Label>Industry or search term (English or Czech)</Label>
              <div className="flex gap-2"><Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. jezdecká stáj, dairy farm, plumber" /><MicButton onText={setIndustry} /></div></div>
            <div><Label>Near</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Telč" /></div>
            <div><Label>Radius (km)</Label><Input type="number" min={1} max={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-3"><Label>Extra notes (optional)</Label>
              <div className="flex gap-2"><Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="e.g. no website yet, at least 10 horses" /><MicButton onText={setExtra} /></div></div>
            <div><Label>How many</Label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[5, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select></div>
          </div>
          <Button onClick={run} disabled={busy || !siteId}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {busy ? 'Searching the web… (up to 2 min)' : 'Find leads'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Saved leads for {site?.name} ({leads.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!leads.length}><Download className="w-4 h-4 mr-1" />CSV</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {!leads.length && <p className="text-sm text-muted-foreground">No leads yet — run a search above.</p>}
          {leads.map((l) => (
            <div key={l.id} className="border border-border rounded-lg p-3 text-sm space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong>{l.name}</strong>
                {l.category && <Badge variant="secondary">{l.category}</Badge>}
                <Badge variant={l.status === 'new' ? 'outline' : 'default'}>{l.status}</Badge>
                <div className="ml-auto flex gap-1">
                  {['contacted', 'listed', 'rejected'].map((s) => (
                    <Button key={s} size="sm" variant="ghost" onClick={() => setStatus(l.id, s)}>{s}</Button>
                  ))}
                  <Button size="icon" variant="ghost" aria-label="Delete lead" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-4">
                <ExternalLinkText url={l.website} />
                {l.email && <a href={`mailto:${l.email}`}>{l.email}</a>}
                {l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}
                {l.address && <span>{l.address}</span>}
                {l.distance_note && <span>{l.distance_note}</span>}
              </div>
              {l.why_fit && <p>{l.why_fit}</p>}
              <span className="text-xs flex items-center gap-2"><ExternalLinkText url={l.source_url} label="Where it was found" /><ReportBad siteId={siteId} kind="lead" title={l.name} website={l.website} onDone={loadLeads} /></span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{edit?.id ? 'Edit website' : 'Add website'}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div><Label>Website address</Label><Input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} /></div>
              <div><Label>What the business does</Label><Textarea rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div><Label>Who to find (search rules)</Label><Textarea rows={4} value={edit.lead_brief} onChange={(e) => setEdit({ ...edit, lead_brief: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Default location</Label><Input value={edit.default_location} onChange={(e) => setEdit({ ...edit, default_location: e.target.value })} /></div>
                <div><Label>Default radius (km)</Label><Input type="number" value={edit.default_radius_km} onChange={(e) => setEdit({ ...edit, default_radius_km: Number(e.target.value) })} /></div>
              </div>
              <Button onClick={saveSite} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeadScraper;
