import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Copy, ExternalLink, Plus, Search } from 'lucide-react';
import { calcCommissionCents, referralLink, type ProgrammeRules } from '@/lib/campaignStudio';

type Settings = ProgrammeRules & { is_open: boolean; attribution_days: number; terms: string | null };
type Partner = { id: string; name: string; email: string | null; company: string | null; website: string | null; linkedin_url: string | null; referral_code: string; status: string; source: string; consent_marketing: boolean; notes: string | null };
type Referral = { id: string; partner_id: string | null; referral_code: string | null; campaign_id: string | null; business_name: string; contact_name: string | null; contact_email: string | null; website: string | null; status: string; project_value_cents: number | null; source: string; created_at: string };
type Commission = { id: string; referral_id: string; partner_id: string | null; amount_cents: number; status: string; basis: string | null };

const PARTNER_STATUSES = ['prospect', 'applied', 'active', 'paused', 'rejected'];
const REFERRAL_STATUSES = ['submitted', 'contacted', 'qualified', 'won', 'lost'];
const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'void'];
const kc = (c: number) => `${(c / 100).toLocaleString('cs-CZ')} Kč`;

const AdminPartners = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [np, setNp] = useState({ name: '', company: '', website: '', email: '', linkedin_url: '', source: 'directory', notes: '' });

  const load = async () => {
    const [s, p, r, c, cm] = await Promise.all([
      supabase.from('partner_programme_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('partners').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
      supabase.from('commissions').select('*').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('id,name').order('created_at', { ascending: false }),
    ]);
    setSettings(s.data as unknown as Settings);
    setPartners((p.data as Partner[]) ?? []);
    setReferrals((r.data as Referral[]) ?? []);
    setCommissions((c.data as Commission[]) ?? []);
    setCampaigns(cm.data ?? []);
  };
  useEffect(() => { void load(); }, []);

  const partnerName = (id: string | null) => partners.find((p) => p.id === id)?.name ?? '—';

  const saveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from('partner_programme_settings').update({
      is_open: settings.is_open, commission_type: settings.commission_type, commission_rate_bps: settings.commission_rate_bps,
      fixed_commission_cents: settings.fixed_commission_cents, min_project_value_cents: settings.min_project_value_cents,
      attribution_days: settings.attribution_days, terms: settings.terms,
    }).eq('id', 1);
    error ? toast.error(error.message) : toast.success('Programme rules saved');
  };

  const addProspect = async () => {
    if (np.name.trim().length < 2) return toast.error('Name required');
    if (np.linkedin_url && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(np.linkedin_url)) return toast.error('LinkedIn URL must be a linkedin.com address');
    const { error } = await supabase.from('partners').insert({ ...np, status: 'prospect' });
    if (error) return toast.error(error.message);
    setNp({ name: '', company: '', website: '', email: '', linkedin_url: '', source: 'directory', notes: '' });
    void load();
  };

  const upd = async (table: 'partners' | 'referrals' | 'commissions', id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from(table).update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    void load();
  };

  const createCommission = async (r: Referral) => {
    if (!settings) return;
    if (r.status !== 'won') return toast.error('Only won referrals earn commission.');
    if (commissions.some((c) => c.referral_id === r.id)) return toast.error('Commission already recorded.');
    const amount = calcCommissionCents(settings, r.project_value_cents);
    if (amount == null) return toast.error('Set a commission rate and project value (above the minimum) first.');
    const basis = settings.commission_type === 'fixed' ? 'fixed' : `${(settings.commission_rate_bps ?? 0) / 100}% of ${kc(r.project_value_cents ?? 0)}`;
    const { error } = await supabase.from('commissions').insert({ referral_id: r.id, partner_id: r.partner_id, amount_cents: amount, basis });
    error ? toast.error(error.message) : (toast.success('Commission recorded'), load());
  };

  const report = useMemo(() => partners.filter((p) => p.status !== 'prospect').map((p) => {
    const rs = referrals.filter((r) => r.partner_id === p.id);
    const cs = commissions.filter((c) => c.partner_id === p.id && c.status !== 'void');
    return {
      p, refs: rs.length, won: rs.filter((r) => r.status === 'won').length,
      value: rs.filter((r) => r.status === 'won').reduce((s, r) => s + (r.project_value_cents ?? 0), 0),
      owed: cs.filter((c) => c.status !== 'paid').reduce((s, c) => s + c.amount_cents, 0),
      paid: cs.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount_cents, 0),
    };
  }), [partners, referrals, commissions]);

  const rateMissing = settings && (settings.commission_type === 'percent' ? settings.commission_rate_bps == null : settings.fixed_commission_cents == null);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-semibold text-stage-find">2C</p>
        <h1 className="font-display text-2xl font-bold">Partner Manager</h1>
        <p className="text-sm text-muted-foreground">Referral partners, referrals, commissions. Public signup page: <Link to="/partners" className="underline">/partners</Link></p>
      </div>
      {rateMissing && <p className="text-sm rounded-md border border-destructive/40 bg-destructive/10 p-3">No commission rate is set yet. Commissions can't be calculated until you set one under Rules.</p>}

      <Tabs defaultValue="referrals">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="finder">Partner Finder</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Table>
            <TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Partner / code</TableHead><TableHead>Source</TableHead><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead>Project value (Kč)</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><div className="font-medium">{r.business_name}</div><div className="text-xs text-muted-foreground">{r.contact_name} {r.contact_email}</div></TableCell>
                  <TableCell>{partnerName(r.partner_id)}<div className="text-xs text-muted-foreground">{r.referral_code || 'no code'}</div></TableCell>
                  <TableCell className="text-xs">{r.source}</TableCell>
                  <TableCell>
                    <Select value={r.campaign_id ?? 'none'} onValueChange={(v) => upd('referrals', r.id, { campaign_id: v === 'none' ? null : v })}>
                      <SelectTrigger className="w-36" aria-label="Campaign"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="none">—</SelectItem>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => upd('referrals', r.id, { status: v })}>
                      <SelectTrigger className="w-32" aria-label="Referral status"><SelectValue /></SelectTrigger>
                      <SelectContent>{REFERRAL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input type="number" min={0} className="w-28" defaultValue={r.project_value_cents != null ? r.project_value_cents / 100 : ''}
                    onBlur={(e) => { const v = e.target.value === '' ? null : Math.round(Number(e.target.value) * 100); if (v !== r.project_value_cents) void upd('referrals', r.id, { project_value_cents: v }); }} aria-label="Project value" /></TableCell>
                  <TableCell><Button size="sm" variant="outline" disabled={r.status !== 'won'} onClick={() => createCommission(r)}>Commission</Button></TableCell>
                </TableRow>
              ))}
              {referrals.length === 0 && <TableRow><TableCell colSpan={7} className="text-muted-foreground">No referrals yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="partners">
          <Table>
            <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Code / link</TableHead><TableHead>Consent</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {partners.filter((p) => p.status !== 'prospect').map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.company} {p.email}</div></TableCell>
                  <TableCell><code className="text-xs">{p.referral_code}</code>
                    <Button size="icon" variant="ghost" aria-label="Copy referral link" onClick={() => { navigator.clipboard.writeText(referralLink(p.referral_code)); toast.success('Link copied'); }}><Copy className="w-3 h-3" /></Button></TableCell>
                  <TableCell>{p.consent_marketing ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                  <TableCell>
                    <Select value={p.status} onValueChange={(v) => upd('partners', p.id, { status: v })}>
                      <SelectTrigger className="w-32" aria-label="Partner status"><SelectValue /></SelectTrigger>
                      <SelectContent>{PARTNER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs underline inline-flex items-center gap-1">LinkedIn<ExternalLink className="w-3 h-3" /></a>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="finder" className="space-y-4">
          <Card><CardContent className="pt-6 text-sm space-y-2">
            <p>Find potential partners (accountants, designers, IT firms, trade associations) through business directories, search engines, company websites and authorised APIs only.</p>
            <p className="text-muted-foreground">LinkedIn: store a profile URL you found yourself and open it manually. No scraping, no automated LinkedIn messages. Contact by email only where you have a lawful basis; nothing is sent from here.</p>
            <Button asChild variant="outline" size="sm"><Link to="/admin/finder?mode=partners"><Search className="w-4 h-4 mr-1" />Open Lead Finder (public sources)</Link></Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Add partner prospect</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {(['name', 'company', 'website', 'email', 'linkedin_url'] as const).map((k) => (
                <div key={k} className="space-y-1"><Label htmlFor={`np-${k}`} className="capitalize">{k.replace('_', ' ')}</Label>
                  <Input id={`np-${k}`} value={np[k]} onChange={(e) => setNp({ ...np, [k]: e.target.value })} /></div>
              ))}
              <div className="space-y-1"><Label>Found via</Label>
                <Select value={np.source} onValueChange={(v) => setNp({ ...np, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['directory', 'search_engine', 'company_website', 'authorised_api', 'referral', 'event'].map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="md:col-span-3 space-y-1"><Label htmlFor="np-notes">Notes</Label><Textarea id="np-notes" value={np.notes} onChange={(e) => setNp({ ...np, notes: e.target.value })} /></div>
              <Button onClick={addProspect} className="w-fit"><Plus className="w-4 h-4 mr-1" />Add prospect</Button>
            </CardContent></Card>
          <Table>
            <TableHeader><TableRow><TableHead>Prospect</TableHead><TableHead>Source</TableHead><TableHead>Links</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {partners.filter((p) => p.status === 'prospect').map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.company} {p.email}</div></TableCell>
                  <TableCell className="text-xs">{p.source}</TableCell>
                  <TableCell className="space-x-2 text-xs">
                    {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="underline">Website</a>}
                    {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="underline">Open LinkedIn manually</a>}
                  </TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => upd('partners', p.id, { status: 'active' })}>Mark as partner</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="commissions">
          <Table>
            <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Referral</TableHead><TableHead>Basis</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {commissions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{partnerName(c.partner_id)}</TableCell>
                  <TableCell>{referrals.find((r) => r.id === c.referral_id)?.business_name}</TableCell>
                  <TableCell className="text-xs">{c.basis}</TableCell>
                  <TableCell>{kc(c.amount_cents)}</TableCell>
                  <TableCell>
                    <Select value={c.status} onValueChange={(v) => upd('commissions', c.id, { status: v, paid_at: v === 'paid' ? new Date().toISOString() : null })}>
                      <SelectTrigger className="w-28" aria-label="Commission status"><SelectValue /></SelectTrigger>
                      <SelectContent>{COMMISSION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {commissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">No commissions yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="report">
          <Table>
            <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Referrals</TableHead><TableHead>Won</TableHead><TableHead>Won value</TableHead><TableHead>Owed</TableHead><TableHead>Paid</TableHead></TableRow></TableHeader>
            <TableBody>
              {report.map((x) => (
                <TableRow key={x.p.id}><TableCell>{x.p.name}</TableCell><TableCell>{x.refs}</TableCell><TableCell>{x.won}</TableCell><TableCell>{kc(x.value)}</TableCell><TableCell>{kc(x.owed)}</TableCell><TableCell>{kc(x.paid)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="rules">
          {settings && (
            <Card><CardContent className="pt-6 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 md:col-span-2"><Switch id="open" checked={settings.is_open} onCheckedChange={(v) => setSettings({ ...settings, is_open: v })} /><Label htmlFor="open">Accept new partner signups on the website</Label></div>
              <div className="space-y-1"><Label>Commission type</Label>
                <Select value={settings.commission_type} onValueChange={(v) => setSettings({ ...settings, commission_type: v as 'percent' | 'fixed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">Percent of project value</SelectItem><SelectItem value="fixed">Fixed amount per won referral</SelectItem></SelectContent>
                </Select></div>
              {settings.commission_type === 'percent' ? (
                <div className="space-y-1"><Label htmlFor="rate">Rate (%) — empty until you decide</Label>
                  <Input id="rate" type="number" min={0} max={100} step={0.5} value={settings.commission_rate_bps != null ? settings.commission_rate_bps / 100 : ''}
                    onChange={(e) => setSettings({ ...settings, commission_rate_bps: e.target.value === '' ? null : Math.round(Number(e.target.value) * 100) })} /></div>
              ) : (
                <div className="space-y-1"><Label htmlFor="fixed">Fixed amount (Kč)</Label>
                  <Input id="fixed" type="number" min={0} value={settings.fixed_commission_cents != null ? settings.fixed_commission_cents / 100 : ''}
                    onChange={(e) => setSettings({ ...settings, fixed_commission_cents: e.target.value === '' ? null : Math.round(Number(e.target.value) * 100) })} /></div>
              )}
              <div className="space-y-1"><Label htmlFor="min">Minimum project value (Kč)</Label>
                <Input id="min" type="number" min={0} value={settings.min_project_value_cents / 100} onChange={(e) => setSettings({ ...settings, min_project_value_cents: Math.round(Number(e.target.value || 0) * 100) })} /></div>
              <div className="space-y-1"><Label htmlFor="days">Attribution window (days)</Label>
                <Input id="days" type="number" min={1} max={730} value={settings.attribution_days} onChange={(e) => setSettings({ ...settings, attribution_days: Number(e.target.value) || 90 })} /></div>
              <div className="md:col-span-2 space-y-1"><Label htmlFor="terms">Programme terms shown on the partner page</Label>
                <Textarea id="terms" rows={5} value={settings.terms ?? ''} onChange={(e) => setSettings({ ...settings, terms: e.target.value })} /></div>
              <Button onClick={saveSettings} className="w-fit">Save rules</Button>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPartners;
