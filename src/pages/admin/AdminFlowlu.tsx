import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, PlugZap, Copy, CheckCircle2, AlertTriangle, Link2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

async function call(action: string) {
  const { data, error } = await supabase.functions.invoke('flowlu-admin', { body: { action } });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

export default function AdminFlowlu() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [hookUrl, setHookUrl] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['flowlu_settings'],
    queryFn: async () => (await supabase.from('flowlu_settings' as never).select('*').eq('id', 1).maybeSingle()).data as any,
  });
  const { data: log = [] } = useQuery({
    queryKey: ['flowlu_log'],
    queryFn: async () => ((await supabase.from('flowlu_sync_log' as never).select('*').order('created_at', { ascending: false }).limit(100)).data ?? []) as any[],
  });
  const { data: mailboxes, isLoading: mailboxesLoading } = useQuery({
    queryKey: ['flowlu_mailboxes'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('flowlu-admin', {
        body: { action: 'raw_get', path: 'module/email/account/list', params: { limit: '10' } },
      });
      if (error) {
        let msg = error.message;
        try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      return ((data as any)?.items ?? []) as { id: number; name: string; sender_name?: string; active?: number }[];
    },
    staleTime: 60_000,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['flowlu_settings'] });
    qc.invalidateQueries({ queryKey: ['flowlu_log'] });
    qc.invalidateQueries({ queryKey: ['flowlu_mailboxes'] });
  };

  const run = async (action: string) => {
    setBusy(action);
    try {
      const r = await call(action);
      if (action === 'test') toast({ title: r.ok ? 'Connected' : 'Connection failed', description: r.message, variant: r.ok ? 'default' : 'destructive' });
      else if (action === 'webhook_url') setHookUrl(r.url);
      else toast({ title: 'Sync finished', description: `${r.leads} leads, ${r.enquiries} enquiries, ${r.calls} calls sent${r.failed ? ` · ${r.failed} failed` : ''}` });
    } catch (e) {
      toast({ title: 'Something went wrong', description: (e as Error).message, variant: 'destructive' });
    } finally { setBusy(null); refresh(); }
  };

  const toggle = async (field: string, value: boolean) => {
    await supabase.from('flowlu_settings' as never).update({ [field]: value } as never).eq('id', 1);
    refresh();
  };

  const counts = {
    synced: log.filter((l) => l.status === 'synced').length,
    failed: log.filter((l) => l.status === 'failed').length,
    received: log.filter((l) => l.direction === 'pull').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Flowlu CRM</h1>
        <p className="text-muted-foreground">Every calculator lead, website enquiry and voice-agent call is sent to Flowlu as a new opportunity.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><PlugZap className="h-5 w-5" />Connection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {settings?.last_test_ok === true && <Badge className="bg-accent/15 text-accent"><CheckCircle2 className="mr-1 h-3 w-3" />Connected</Badge>}
            {settings?.last_test_ok === false && <Badge className="bg-destructive/15 text-destructive"><AlertTriangle className="mr-1 h-3 w-3" />Not connected</Badge>}
            <span className="text-sm text-muted-foreground">{settings?.last_test_message ?? 'Not tested yet'}</span>
          </div>
          {settings?.last_test_ok === false && (
            <p className="text-sm text-muted-foreground">If Flowlu says the API key is not loaded, create a new key in Flowlu under Settings → API, make sure it has CRM access, and ask me to update the stored key.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run('test')} disabled={!!busy}>Test connection</Button>
            <Button variant="outline" onClick={() => run('sync')} disabled={!!busy}><RefreshCw className={`mr-2 h-4 w-4 ${busy === 'sync' ? 'animate-spin' : ''}`} />Sync now</Button>
            <Button variant="outline" onClick={() => run('retry_failed')} disabled={!!busy}>Retry failed</Button>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={settings?.auto_sync_leads ?? true} onCheckedChange={(v) => toggle('auto_sync_leads', v)} />Send leads & enquiries</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={settings?.auto_sync_calls ?? true} onCheckedChange={(v) => toggle('auto_sync_calls', v)} />Send voice calls</label>
          </div>
          <p className="text-xs text-muted-foreground">New leads, enquiries and finished calls are sent instantly, with an hourly catch-up. Last sync: {settings?.last_sync_at ? new Date(settings.last_sync_at).toLocaleString('en-GB') : 'never'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" />Webhook from Flowlu</CardTitle>
          <CardDescription>In Flowlu, go to Settings → Webhooks, add this address and choose the CRM events you want sent back here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {hookUrl ? (<>
            <Input readOnly value={hookUrl} className="flex-1" />
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(hookUrl); toast({ title: 'Copied' }); }}><Copy className="h-4 w-4" /></Button>
          </>) : <Button variant="outline" onClick={() => run('webhook_url')}>Show webhook address</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Activity</CardTitle><CardDescription>{counts.synced} sent · {counts.failed} failed · {counts.received} received from Flowlu</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {log.length === 0 && <p className="text-muted-foreground">Nothing yet.</p>}
          {log.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-2 text-sm">
              <Badge className={l.status === 'failed' ? 'bg-destructive/15 text-destructive' : l.status === 'synced' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}>{l.status}</Badge>
              <span className="font-medium">{l.entity_type}</span>
              <span className="text-muted-foreground">{l.payload?.name ?? l.payload?.phone ?? l.flowlu_id ?? ''}</span>
              {l.error && <span className="flex-1 truncate text-destructive">{l.error}</span>}
              <span className="ml-auto text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('en-GB')}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
