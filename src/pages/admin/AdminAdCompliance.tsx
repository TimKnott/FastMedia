import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, XCircle, Wand2, Copy, Loader2 } from 'lucide-react';
import { checkAd, PLATFORM_FIELDS, type AdFields, type Platform } from '@/lib/adCompliance';

const LABELS: Record<Platform, string> = { sklik: 'Seznam Sklik', google: 'Google Ads', meta: 'Facebook / Instagram' };

const AdminAdCompliance = () => {
  const [platform, setPlatform] = useState<Platform>('sklik');
  const [ad, setAd] = useState<AdFields>({});
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const fields = PLATFORM_FIELDS[platform];
  const issues = useMemo(() => checkAd(platform, ad), [platform, ad]);
  const errors = issues.filter((i) => i.severity === 'error').length;

  const fix = async () => {
    setBusy(true); setNotes('');
    const { data, error } = await supabase.functions.invoke('ad-compliance-fix', { body: { platform, ad, issues } });
    setBusy(false);
    if (error || !data?.ok) return toast.error(data?.error ?? 'Could not fix the advert.');
    setAd(data.ad); setNotes(data.notes ?? '');
    toast.success('Advert rewritten — re-checked below.');
  };

  const copyAll = () => {
    navigator.clipboard.writeText(fields.map((f) => `${f.label}: ${ad[f.key] ?? ''}`).join('\n'));
    toast.success('Copied');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Ad Compliance Checker</h1>
        <p className="text-muted-foreground">Check an advert against platform rules before you submit it. Fix problems in one click.</p>
      </div>
      <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
        <TabsList>{(Object.keys(LABELS) as Platform[]).map((p) => <TabsTrigger key={p} value={p}>{LABELS[p]}</TabsTrigger>)}</TabsList>
      </Tabs>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Your advert</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => {
              const v = ad[f.key] ?? '';
              const Field = f.multiline ? Textarea : Input;
              return (
                <div key={f.key} className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor={`f-${f.key}`}>{f.label}</Label>
                    <span className={`text-xs ${v.length > f.max ? 'text-destructive' : 'text-muted-foreground'}`}>{v.length}/{f.max}</span>
                  </div>
                  <Field id={`f-${f.key}`} value={v} onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setAd({ ...ad, [f.key]: e.target.value })} />
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2">
              <Button onClick={fix} disabled={busy || issues.length === 0}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Fix all problems with AI
              </Button>
              <Button variant="outline" onClick={copyAll}><Copy className="h-4 w-4" /> Copy advert</Button>
              <Button variant="ghost" onClick={() => { setAd({}); setNotes(''); }}>Clear</Button>
            </div>
            {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {errors === 0 ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}
              {errors === 0 ? 'Ready to submit' : `${errors} problem${errors > 1 ? 's' : ''} would get it rejected`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.length === 0 && <p className="text-muted-foreground">No problems found for {LABELS[platform]}.</p>}
            {issues.map((i, n) => (
              <div key={n} className="flex gap-2 rounded-md border border-border p-3">
                {i.severity === 'error' ? <XCircle className="h-4 w-4 shrink-0 text-destructive" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />}
                <div className="text-sm">
                  <div className="flex gap-2"><span className="font-medium text-foreground">{i.field}</span><Badge variant="outline">{i.rule}</Badge></div>
                  <p className="text-muted-foreground">{i.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAdCompliance;
