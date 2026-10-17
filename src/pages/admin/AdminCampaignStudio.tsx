import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, Copy, Plus, Check, Send, Trash2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  STUDIO_STAGES, toolHref, briefText, draftFromCampaign, canTransition, stageProgress, type StudioTool,
} from '@/lib/campaignStudio';

type Campaign = {
  id: string; name: string; objective: string | null; audience: string | null; industry: string | null;
  offer: string | null; cta: string | null; destination_url: string | null; hero_image_url: string | null;
  copy: Record<string, string>; status: string;
};
type Draft = {
  id: string; campaign_id: string; channel: string; subject: string | null; body: string; image_url: string | null;
  cta: string | null; destination_url: string | null; status: string; outcome: { replies?: number; conversions?: number; reach?: number };
  approved_at: string | null; sent_at: string | null;
};

const CHANNELS = ['email', 'facebook', 'instagram', 'linkedin', 'tiktok', 'google', 'seznam', 'direct'];
const STATUSES = ['planning', 'finding', 'creating', 'sending', 'tracking', 'done'];

const INTEGRATIONS = [
  { name: 'Email lists (Vbout)', state: 'Configured', note: 'Send from 4A after approval; opt-outs handled by Vbout and the suppression list.' },
  { name: 'Single emails (Google Workspace)', state: 'Configured', note: 'Used for reviewed one-to-one outreach in 4C.' },
  { name: 'Social publishing (RADAAR)', state: 'Not connected', note: 'Social drafts are copy-and-post manually. No automatic publishing.' },
  { name: 'LinkedIn', state: 'Manual only', note: 'Open profiles manually; no scraping or automated messages.' },
];

const AdminCampaignStudio = () => {
  const { hasMinRole } = useUserRole();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem('fm-active-campaign') ?? '');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [referralStats, setReferralStats] = useState({ count: 0, won: 0, valueCents: 0 });
  const [tab, setTab] = useState('brief');
  const [newName, setNewName] = useState('');

  const active = campaigns.find((c) => c.id === activeId) ?? null;

  const load = async () => {
    const { data } = await supabase.from('campaigns').select('*').neq('status', 'archived').order('created_at', { ascending: false });
    const list = (data as unknown as Campaign[]) ?? [];
    setCampaigns(list);
    if (!list.find((c) => c.id === activeId) && list[0]) setActiveId(list[0].id);
  };
  const loadDrafts = async (id: string) => {
    const { data } = await supabase.from('campaign_drafts').select('*').eq('campaign_id', id).order('created_at');
    setDrafts((data as unknown as Draft[]) ?? []);
    const { data: refs } = await supabase.from('referrals').select('status, project_value_cents').eq('campaign_id', id);
    const r = refs ?? [];
    setReferralStats({
      count: r.length,
      won: r.filter((x) => x.status === 'won').length,
      valueCents: r.filter((x) => x.status === 'won').reduce((s, x) => s + (x.project_value_cents ?? 0), 0),
    });
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (activeId) { localStorage.setItem('fm-active-campaign', activeId); void loadDrafts(activeId); }
  }, [activeId]);

  const create = async () => {
    if (newName.trim().length < 2) return toast.error('Give the campaign a name.');
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('campaigns').insert({ name: newName.trim(), created_by: u.user?.id }).select().single();
    if (error) return toast.error(error.message);
    setNewName(''); await load(); setActiveId(data.id); setTab('brief');
  };

  const saveBrief = async (patch: Partial<Campaign>) => {
    if (!active) return;
    const { error } = await supabase.from('campaigns').update(patch).eq('id', active.id);
    if (error) return toast.error(error.message);
    setCampaigns((cs) => cs.map((c) => (c.id === active.id ? { ...c, ...patch } : c)));
    toast.success('Campaign saved');
  };

  const addDraft = async (channel: string) => {
    if (!active) return;
    const { error } = await supabase.from('campaign_drafts').insert(draftFromCampaign(active, channel));
    if (error) return toast.error(error.message);
    void loadDrafts(active.id);
  };

  const updateDraft = async (d: Draft, patch: Partial<Draft> & Record<string, unknown>) => {
    const { error } = await supabase.from('campaign_drafts').update(patch).eq('id', d.id);
    if (error) return toast.error(error.message);
    void loadDrafts(d.campaign_id);
  };

  const move = async (d: Draft, to: string) => {
    if (!canTransition(d.status, to)) return toast.error('Approve the draft first.');
    if ((to === 'sent' || to === 'published') &&
      !window.confirm(`Record this ${d.channel} draft as ${to}? Do this only after it has actually gone out through the ${d.channel === 'email' ? 'email tool' : 'platform'}.`)) return;
    const { data: u } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    await updateDraft(d, {
      status: to,
      ...(to === 'approved' ? { approved_at: now, approved_by: u.user?.id } : {}),
      ...(to === 'sent' || to === 'published' ? { sent_at: now } : {}),
    });
  };

  const totals = useMemo(() => drafts.reduce((t, d) => ({
    out: t.out + (d.status === 'sent' || d.status === 'published' ? 1 : 0),
    replies: t.replies + (d.outcome?.replies ?? 0),
    conversions: t.conversions + (d.outcome?.conversions ?? 0),
    reach: t.reach + (d.outcome?.reach ?? 0),
  }), { out: 0, replies: 0, conversions: 0, reach: 0 }), [drafts]);

  const openTool = (tool: StudioTool) => {
    if (tool.to.startsWith('#')) setTab(tool.to.slice(1));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Campaign Studio</h1>
          <p className="text-sm text-muted-foreground">Plan → Find → Create → Send → Track. One campaign flows through every step.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={activeId} onValueChange={setActiveId}>
            <SelectTrigger className="w-64" aria-label="Active campaign"><SelectValue placeholder="Choose a campaign" /></SelectTrigger>
            <SelectContent>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New campaign name" className="w-48" />
          <Button onClick={create}><Plus className="w-4 h-4 mr-1" />New</Button>
        </div>
      </div>

      {active && (
        <Card>
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">{active.name}</span><span className="text-muted-foreground capitalize">{active.status}</span></div>
              <Progress value={stageProgress(active.status)} aria-label="Campaign progress" />
            </div>
            <Select value={active.status} onValueChange={(v) => saveBrief({ status: v })}>
              <SelectTrigger className="w-40" aria-label="Campaign stage"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(briefText(active)); toast.success('Brief copied'); }}>
              <Copy className="w-4 h-4 mr-1" />Copy brief
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Numbered stages */}
      <div className="grid gap-4 lg:grid-cols-5">
        {STUDIO_STAGES.map((stage, i) => (
          <section key={stage.key} className={`rounded-xl border-t-4 ${stage.border} bg-card shadow-card p-4 space-y-3`} aria-labelledby={`stage-${stage.key}`}>
            <div className="flex items-center gap-3">
              <span className={`${stage.bg} text-stage-foreground font-display text-2xl font-bold w-11 h-11 rounded-lg flex items-center justify-center`}>{stage.number}</span>
              <h2 id={`stage-${stage.key}`} className={`font-display font-bold ${stage.text}`}>{stage.title}</h2>
            </div>
            {stage.tools.map((tool) => {
              const allowed = hasMinRole(tool.minRole);
              const href = toolHref(tool, active);
              const inner = (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className={`${stage.bg} text-stage-foreground`}>{tool.code}</Badge>
                    <span className="font-medium text-sm">{tool.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  {!allowed && <p className="text-xs text-destructive mt-1">Super Admin only</p>}
                </>
              );
              return tool.to.startsWith('#') ? (
                <button key={tool.code} type="button" onClick={() => openTool(tool)} className="block w-full text-left rounded-lg border border-border p-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{inner}</button>
              ) : allowed ? (
                <Link key={tool.code} to={href} className="block rounded-lg border border-border p-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{inner}</Link>
              ) : (
                <div key={tool.code} className="rounded-lg border border-border p-3 opacity-60">{inner}</div>
              );
            })}
            {i < STUDIO_STAGES.length - 1 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">Next: {STUDIO_STAGES[i + 1].title}<ArrowRight className="w-3 h-3" /></p>
            )}
          </section>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="brief">1A Brief</TabsTrigger>
          <TabsTrigger value="drafts">3C / 4B Drafts</TabsTrigger>
          <TabsTrigger value="analytics">5A Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="brief">
          {!active ? <p className="text-sm text-muted-foreground py-6">Create a campaign to start.</p> : (
            <BriefForm key={active.id} campaign={active} onSave={saveBrief} />
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {!active ? <p className="text-sm text-muted-foreground py-6">Create a campaign first.</p> : (
            <>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((c) => <Button key={c} size="sm" variant="outline" onClick={() => addDraft(c)} className="capitalize"><Plus className="w-3 h-3 mr-1" />{c}</Button>)}
              </div>
              <p className="text-xs text-muted-foreground">Drafts inherit the brief's copy, hero image, CTA and link. Nothing is sent from here: approve, send it through the email tool or platform, then record the outcome. Check consent and the suppression list before any email.</p>
              {drafts.map((d) => <DraftCard key={d.id} d={d} onSave={(p) => updateDraft(d, p)} onMove={(to) => move(d, to)} onDelete={async () => { await supabase.from('campaign_drafts').delete().eq('id', d.id); void loadDrafts(d.campaign_id); }} />)}
              {drafts.length === 0 && <p className="text-sm text-muted-foreground">No drafts yet.</p>}
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ['Drafts', drafts.length], ['Sent / published', totals.out], ['Reach', totals.reach],
              ['Replies', totals.replies], ['Conversions', totals.conversions], ['Partner referrals', referralStats.count],
            ].map(([l, v]) => (
              <Card key={String(l)}><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{l}</p><p className="text-2xl font-bold">{v}</p></CardContent></Card>
            ))}
          </div>
          <p className="text-sm mt-4">Won referral value: <strong>{(referralStats.valueCents / 100).toLocaleString('cs-CZ')} Kč</strong> from {referralStats.won} won referrals.</p>
          <p className="text-xs text-muted-foreground mt-2">Figures are what you record on each draft and referral. No platform reporting is pulled in automatically yet.</p>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-3 md:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <Card key={i.name}><CardContent className="pt-6">
                <div className="flex justify-between items-center"><span className="font-medium text-sm">{i.name}</span>
                  <Badge variant={i.state === 'Configured' ? 'default' : 'outline'}>{i.state}</Badge></div>
                <p className="text-xs text-muted-foreground mt-2">{i.note}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BriefForm = ({ campaign, onSave }: { campaign: Campaign; onSave: (p: Partial<Campaign>) => void }) => {
  const [f, setF] = useState({ ...campaign, headline: campaign.copy?.headline ?? '', body: campaign.copy?.body ?? '' });
  const field = (k: keyof typeof f, label: string, area = false) => (
    <div className="space-y-1">
      <Label htmlFor={`brief-${k}`}>{label}</Label>
      {area
        ? <Textarea id={`brief-${k}`} value={(f[k] as string) ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        : <Input id={`brief-${k}`} value={(f[k] as string) ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
    </div>
  );
  return (
    <Card><CardHeader><CardTitle className="text-base">Campaign brief — used by every later step</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {field('name', 'Name')}{field('objective', 'Objective')}
        {field('audience', 'Audience / location')}{field('industry', 'Industry')}
        {field('offer', 'Offer')}{field('cta', 'Call to action')}
        {field('destination_url', 'Destination URL')}{field('hero_image_url', 'Hero image URL (from 3B or Media)')}
        {field('headline', 'Headline (from 3A)')}{field('body', 'Main copy (from 3A)', true)}
        <div className="md:col-span-2">
          <Button onClick={() => onSave({
            name: f.name, objective: f.objective, audience: f.audience, industry: f.industry, offer: f.offer, cta: f.cta,
            destination_url: f.destination_url, hero_image_url: f.hero_image_url, copy: { headline: f.headline, body: f.body },
          })}>Save brief</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DraftCard = ({ d, onSave, onMove, onDelete }: {
  d: Draft; onSave: (p: Record<string, unknown>) => void; onMove: (to: string) => void; onDelete: () => void;
}) => {
  const [subject, setSubject] = useState(d.subject ?? '');
  const [body, setBody] = useState(d.body);
  const [outcome, setOutcome] = useState({ reach: d.outcome?.reach ?? 0, replies: d.outcome?.replies ?? 0, conversions: d.outcome?.conversions ?? 0 });
  const locked = d.status !== 'draft';
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex gap-2 items-center"><Badge variant="outline" className="capitalize">{d.channel}</Badge><Badge>{d.status}</Badge></div>
          <div className="flex gap-2">
            {d.status === 'draft' && <Button size="sm" onClick={() => onSave({ subject, body })}>Save</Button>}
            {d.status === 'draft' && <Button size="sm" variant="outline" onClick={() => { onSave({ subject, body }); onMove('approved'); }}><Check className="w-3 h-3 mr-1" />Approve</Button>}
            {d.status === 'approved' && <Button size="sm" variant="outline" onClick={() => onMove('draft')}>Back to draft</Button>}
            {d.status === 'approved' && <Button size="sm" onClick={() => onMove(d.channel === 'email' || d.channel === 'direct' ? 'sent' : 'published')}><Send className="w-3 h-3 mr-1" />Record as {d.channel === 'email' || d.channel === 'direct' ? 'sent' : 'published'}</Button>}
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(`${subject ? subject + '\n\n' : ''}${body}`)} aria-label="Copy draft"><Copy className="w-3 h-3" /></Button>
            {d.status === 'draft' && <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete draft"><Trash2 className="w-3 h-3" /></Button>}
          </div>
        </div>
        {d.channel === 'email' && <Input value={subject} disabled={locked} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" />}
        <Textarea value={body} disabled={locked} onChange={(e) => setBody(e.target.value)} rows={5} aria-label="Draft text" />
        {d.image_url && <img src={d.image_url} alt="Campaign hero" className="h-24 rounded-md object-cover" />}
        {(d.status === 'sent' || d.status === 'published') && (
          <div className="flex flex-wrap gap-2 items-end">
            {(['reach', 'replies', 'conversions'] as const).map((k) => (
              <div key={k} className="space-y-1"><Label className="capitalize text-xs">{k}</Label>
                <Input type="number" min={0} className="w-28" value={outcome[k]} onChange={(e) => setOutcome({ ...outcome, [k]: Number(e.target.value) || 0 })} /></div>
            ))}
            <Button size="sm" onClick={() => onSave({ outcome })}>Save outcome</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCampaignStudio;
