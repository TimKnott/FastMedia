import { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, ListChecks, Megaphone, Settings2, Activity, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useVoiceSettings, useUpdateVoiceSettings, useVoiceCalls, useVoiceCallTurns,
  useVoiceCampaigns, useSaveCampaign, useApproveCampaign, useVoiceScanReports,
  type VoiceCall,
} from '@/hooks/useVoiceAgent';

const fmtDuration = (s: number | null) => {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    completed: 'bg-accent/15 text-accent',
    forwarded: 'bg-primary/15 text-primary',
    in_progress: 'bg-primary/15 text-primary',
    failed: 'bg-destructive/15 text-destructive',
    no_answer: 'bg-muted text-muted-foreground',
  };
  return <Badge className={map[status] ?? 'bg-muted text-muted-foreground'}>{status.replace('_', ' ')}</Badge>;
};

function TranscriptDialog({ call, open, onClose }: { call: VoiceCall | null; open: boolean; onClose: () => void }) {
  const { data: turns } = useVoiceCallTurns(call?.id ?? null);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Call transcript — {call?.from_number ?? ''}</DialogTitle>
        </DialogHeader>
        {call?.summary && <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">{call.summary}</p>}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto py-2">
          {turns?.map((t) => (
            <div key={t.id} className={`text-sm rounded-lg px-3 py-2 ${t.role === 'agent' ? 'bg-primary/10 ml-6' : 'bg-muted mr-6'}`}>
              <span className="block text-xs text-muted-foreground mb-0.5">{t.role === 'agent' ? 'Assistant' : 'Caller'}</span>
              {t.text}
            </div>
          ))}
          {!turns?.length && <p className="text-sm text-muted-foreground">No transcript recorded.</p>}
        </div>
        {call?.recording_url && (
          <audio controls src={call.recording_url} className="w-full" />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminVoiceAgent() {
  const { toast } = useToast();
  const { data: settings } = useVoiceSettings();
  const updateSettings = useUpdateVoiceSettings();
  const { data: calls } = useVoiceCalls();
  const { data: campaigns } = useVoiceCampaigns();
  const { data: scans } = useVoiceScanReports();
  const saveCampaign = useSaveCampaign();
  const approveCampaign = useApproveCampaign();

  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [newCampaign, setNewCampaign] = useState({ name: '', script: '' });
  const [forwardTo, setForwardTo] = useState<string | null>(null);
  const [minuteCap, setMinuteCap] = useState<string | null>(null);

  const used = settings ? Number(settings.minutes_used).toFixed(1) : '0';
  const cap = settings?.monthly_minute_cap ?? 120;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Phone className="h-6 w-6 text-accent" /> Voice agent</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Answers and makes calls in Czech, English and German, forwards to your team, and logs everything to Flowlu.
        </p>
      </div>

      {!settings?.enabled && (
        <Card className="border-accent/40 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Setup needed before live calls</CardTitle>
            <CardDescription>
              The agent is built and waiting. To go live: 1) create a Twilio account and buy a Czech number,
              2) tell me the account keys and I'll connect them, 3) point the Twilio number's voice webhook at this site,
              4) set up call forwarding on your phone (I'll give you the exact code). Then switch the agent on below.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Minutes used this month</p>
            <p className="text-2xl font-heading font-bold">{used} / {cap}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Calls handled</p>
            <p className="text-2xl font-heading font-bold">{calls?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Agent status</p>
            <p className="text-2xl font-heading font-bold flex items-center gap-2">
              {settings?.enabled ? <><CheckCircle2 className="h-5 w-5 text-accent" /> On</> : <><Clock className="h-5 w-5 text-muted-foreground" /> Off</>}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calls">
        <TabsList>
          <TabsTrigger value="calls"><PhoneIncoming className="h-4 w-4 mr-1.5" />Calls</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="h-4 w-4 mr-1.5" />Campaigns</TabsTrigger>
          <TabsTrigger value="scans"><Activity className="h-4 w-4 mr-1.5" />Daily scans</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="h-4 w-4 mr-1.5" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="mt-4">
          <Card>
            <CardContent className="pt-5">
              {!calls?.length && <p className="text-sm text-muted-foreground">No calls yet. They'll appear here once the agent is live.</p>}
              <div className="divide-y divide-border">
                {calls?.map((c) => (
                  <button key={c.id} onClick={() => setSelectedCall(c)} className="w-full text-left py-3 flex items-center gap-3 hover:bg-muted/40 rounded px-2">
                    {c.direction === 'inbound' ? <PhoneIncoming className="h-4 w-4 text-accent shrink-0" /> : <PhoneOutgoing className="h-4 w-4 text-primary shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.direction === 'inbound' ? c.from_number : c.to_number}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.summary ?? new Date(c.started_at).toLocaleString('en-GB')}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{fmtDuration(c.duration_seconds)}</span>
                    {c.outcome && <Badge variant="outline" className="text-xs">{c.outcome}</Badge>}
                    {statusBadge(c.status)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New outreach campaign</CardTitle>
              <CardDescription>Nothing is dialled until you approve it. Prospects come from your Prospecting desk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Campaign name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} />
              <Textarea
                placeholder="Opening script — the first thing the agent says, then what it should offer…"
                rows={4}
                value={newCampaign.script}
                onChange={(e) => setNewCampaign({ ...newCampaign, script: e.target.value })}
              />
              <Button
                disabled={!newCampaign.name || !newCampaign.script || saveCampaign.isPending}
                onClick={async () => {
                  await saveCampaign.mutateAsync({ ...newCampaign, status: 'pending_approval' });
                  setNewCampaign({ name: '', script: '' });
                  toast({ title: 'Campaign saved — approve it below when ready' });
                }}
              >
                Save campaign
              </Button>
            </CardContent>
          </Card>
          {campaigns?.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.script}</p>
                  <Badge variant="outline" className="mt-2 text-xs">{c.status.replace('_', ' ')}</Badge>
                </div>
                {c.status === 'pending_approval' && (
                  <Button size="sm" onClick={async () => { await approveCampaign.mutateAsync(c.id); toast({ title: 'Campaign approved' }); }}>
                    Approve
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" /> Daily website scans</CardTitle>
              <CardDescription>Every morning the agent checks your key pages and emails you if something breaks (plus a weekly all-clear).</CardDescription>
            </CardHeader>
            <CardContent>
              {!scans?.length && <p className="text-sm text-muted-foreground">First scan runs tomorrow morning.</p>}
              <div className="divide-y divide-border">
                {scans?.map((s) => (
                  <div key={s.id} className="py-3 flex items-center gap-3">
                    {s.issues.length === 0
                      ? <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      : <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{s.summary}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.ran_at).toLocaleString('en-GB')} · {s.pages_checked} pages{s.emailed ? ' · emailed' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Agent switched on</Label>
                  <p className="text-xs text-muted-foreground">Only turn on after Twilio is connected.</p>
                </div>
                <Switch
                  checked={settings?.enabled ?? false}
                  onCheckedChange={async (v) => { await updateSettings.mutateAsync({ enabled: v }); toast({ title: v ? 'Agent switched on' : 'Agent switched off' }); }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Flowlu CRM sync</Label>
                  <p className="text-xs text-muted-foreground">Needs your Flowlu API key — give it to me and I'll connect it.</p>
                </div>
                <Switch
                  checked={settings?.flowlu_enabled ?? false}
                  onCheckedChange={async (v) => { await updateSettings.mutateAsync({ flowlu_enabled: v }); }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Forward calls to</Label>
                <div className="flex gap-2">
                  <Input
                    value={forwardTo ?? settings?.forward_to_number ?? ''}
                    onChange={(e) => setForwardTo(e.target.value)}
                    placeholder="+420 797 864 432"
                  />
                  <Button variant="outline" onClick={async () => { if (forwardTo) { await updateSettings.mutateAsync({ forward_to_number: forwardTo }); toast({ title: 'Saved' }); } }}>Save</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly minute cap (budget guard)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={minuteCap ?? String(cap)}
                    onChange={(e) => setMinuteCap(e.target.value)}
                  />
                  <Button variant="outline" onClick={async () => { if (minuteCap) { await updateSettings.mutateAsync({ monthly_minute_cap: parseInt(minuteCap, 10) || 120 }); toast({ title: 'Saved' }); } }}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">The agent politely stops taking calls when the cap is reached, so you can never overspend.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TranscriptDialog call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
