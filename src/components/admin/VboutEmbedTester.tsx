import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, XCircle, PlayCircle, Send, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

type EmbedCode = {
  id: string;
  name: string;
  code: string;
  placement: string;
  is_active: boolean;
};

const placementOptions = [
  { value: 'head', label: '<head>' },
  { value: 'body_start', label: '<body> start' },
  { value: 'body_end', label: '<body> end' },
];

/**
 * Dedicated tester for the Vbout embed code. Lets a super-admin:
 * - See which embed_codes row is the Vbout tracker
 * - Toggle active state
 * - Move it between placements (head, body_start, body_end)
 * - Run a sandboxed test that injects the script into this page and
 *   watches for vbt.io network hits via PerformanceObserver
 * - Preview the raw snippet
 */
const VboutEmbedTester = () => {
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    hits: string[];
    elapsed: number;
  } | null>(null);
  const injectedRef = useRef<HTMLScriptElement[]>([]);

  const { data: vboutEmbed, isLoading } = useQuery({
    queryKey: ['embed-codes', 'vbout'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('embed_codes')
        .select('id, name, code, placement, is_active')
        .or('name.ilike.%vbout%,code.ilike.%vbt.io%')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EmbedCode | null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Pick<EmbedCode, 'placement' | 'is_active'>>) => {
      if (!vboutEmbed) return;
      const { error } = await supabase
        .from('embed_codes')
        .update(patch)
        .eq('id', vboutEmbed.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embed-codes'] });
      queryClient.invalidateQueries({ queryKey: ['embed-codes', 'vbout'] });
      queryClient.invalidateQueries({ queryKey: ['embed-codes-active'] });
      toast.success('Vbout embed updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cleanupInjection = () => {
    injectedRef.current.forEach(el => {
      try { el.parentNode?.removeChild(el); } catch {}
    });
    injectedRef.current = [];
  };

  const runTest = async () => {
    if (!vboutEmbed) return;
    cleanupInjection();
    setTestResult(null);
    setTesting(true);

    const startedAt = performance.now();
    const captured: string[] = [];
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(e => {
        if (/vbt\.io|vbout/i.test(e.name)) captured.push(e.name);
      });
    });
    try { observer.observe({ type: 'resource', buffered: false }); } catch {
      observer.observe({ entryTypes: ['resource'] });
    }

    // Re-execute snippet scripts in-page
    const wrapper = document.createElement('div');
    wrapper.innerHTML = vboutEmbed.code;
    wrapper.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value));
      if (!old.src) s.textContent = old.textContent;
      document.body.appendChild(s);
      injectedRef.current.push(s);
    });

    // Wait up to 5s for a hit
    await new Promise(resolve => setTimeout(resolve, 5000));
    observer.disconnect();

    setTestResult({
      ok: captured.length > 0,
      hits: captured.slice(0, 10),
      elapsed: Math.round(performance.now() - startedAt),
    });
    setTesting(false);
  };

  useEffect(() => () => cleanupInjection(), []);

  const placementLabel = useMemo(
    () => placementOptions.find(p => p.value === vboutEmbed?.placement)?.label ?? vboutEmbed?.placement,
    [vboutEmbed?.placement],
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">Loading Vbout embed…</CardContent>
      </Card>
    );
  }

  if (!vboutEmbed) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" /> Vbout Embed
          </CardTitle>
          <CardDescription>
            No Vbout snippet found. Add one below with a name containing "Vbout" or a snippet referencing <code>vbt.io</code> and it will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-accent" /> Vbout Embed Tester
            </CardTitle>
            <CardDescription>
              Inspect, toggle, move, and test-fire the Vbout tracking snippet without leaving the admin.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={vboutEmbed.is_active ? 'default' : 'secondary'}>
              {vboutEmbed.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">{placementLabel}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Placement</Label>
            <Select
              value={vboutEmbed.placement}
              onValueChange={v => updateMutation.mutate({ placement: v })}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {placementOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Active on the live site</Label>
            <div className="flex items-center gap-2 mt-2.5">
              <Switch
                checked={vboutEmbed.is_active}
                onCheckedChange={is_active => updateMutation.mutate({ is_active })}
                disabled={updateMutation.isPending}
              />
              <span className="text-sm text-muted-foreground">
                {vboutEmbed.is_active ? 'Injected into every page' : 'Not loaded for visitors'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={runTest} disabled={testing} size="sm">
            {testing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
            {testing ? 'Testing (5s)…' : 'Run test fire'}
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/admin/vbout-debug" target="_blank" rel="noreferrer">
              <Eye className="w-4 h-4 mr-2" /> Open live debug panel
            </a>
          </Button>
        </div>

        {testResult && (
          <div
            className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
              testResult.ok
                ? 'border-accent/40 bg-accent/5'
                : 'border-destructive/40 bg-destructive/5'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 min-w-0">
              <p className="font-medium">
                {testResult.ok
                  ? `Vbout tracker fired — ${testResult.hits.length} request(s) in ${testResult.elapsed}ms`
                  : `No vbt.io requests detected within ${testResult.elapsed}ms`}
              </p>
              {testResult.ok && (
                <ul className="font-mono text-xs text-muted-foreground space-y-0.5">
                  {testResult.hits.map((h, i) => (
                    <li key={i} className="truncate">{h}</li>
                  ))}
                </ul>
              )}
              {!testResult.ok && (
                <p className="text-xs text-muted-foreground">
                  Check that the snippet contains a valid <code>_account</code> and that ad-blockers are disabled in this browser.
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Snippet preview</Label>
          <pre className="mt-1.5 bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
            {vboutEmbed.code}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default VboutEmbedTester;
