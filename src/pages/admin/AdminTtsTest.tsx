import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Volume2, CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BlogAudioPlayer from '@/components/blog/BlogAudioPlayer';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import { friendlyTtsError, isElevenLabsUpgradeError, ELEVENLABS_UPGRADE_MESSAGE } from '@/lib/ttsErrors';

type TestResult = {
  ok: boolean;
  audio_url?: string;
  cached?: boolean;
  chars?: number;
  error?: string;
  durationMs: number;
};

const AdminTtsTest = () => {
  const [slug, setSlug] = useState('');
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const buildTextFromStatic = (s: string): string | null => {
    const p = staticPosts.find(x => x.slug === s);
    if (!p) return null;
    const parts: string[] = [p.title?.en ?? '', p.excerpt?.en ?? ''];
    for (const sec of p.sections ?? []) {
      if (sec.type === 'heading') parts.push((sec.text?.en ?? '') + '.');
      else if (sec.type === 'paragraph') parts.push(sec.text?.en ?? '');
      else if (sec.type === 'list') parts.push(sec.items.map(i => i.en).join('. ') + '.');
    }
    return parts.filter(Boolean).join(' ');
  };

  const run = async () => {
    const trimmed = slug.trim();
    if (!trimmed) { toast.error('Enter a slug'); return; }
    setLoading(true);
    setResult(null);
    const t0 = performance.now();
    try {
      // Try DB-managed post first
      const { data: dbPost } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .eq('slug', trimmed)
        .maybeSingle();

      let body: Record<string, unknown>;
      if (dbPost?.id) {
        body = { post_id: dbPost.id };
      } else {
        const text = customText.trim() || buildTextFromStatic(trimmed);
        if (!text) {
          throw new Error('Slug not found in DB or static posts. Paste narration text manually.');
        }
        body = { slug: trimmed, text };
      }

      const { data, error } = await supabase.functions.invoke('blog-tts', { body });
      const durationMs = Math.round(performance.now() - t0);
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'TTS failed');

      setResult({ ok: true, audio_url: data.audio_url, cached: data.cached, chars: data.chars, durationMs });

      // Verify URL is reachable
      try {
        const head = await fetch(data.audio_url, { method: 'HEAD' });
        if (!head.ok) toast.warning(`Audio URL returned ${head.status}`);
        else toast.success(`TTS OK${data.cached ? ' (cached)' : ''} · ${durationMs}ms`);
      } catch {
        toast.warning('Could not HEAD audio URL (CORS or network)');
      }
    } catch (e) {
      const durationMs = Math.round(performance.now() - t0);
      // Try to extract underlying error body from FunctionsHttpError
      let extracted: string | undefined;
      const ctx = (e as { context?: Response })?.context;
      if (ctx && typeof ctx.text === 'function') {
        try { extracted = await ctx.clone().text(); } catch { /* noop */ }
      }
      const upgrade = isElevenLabsUpgradeError(e) || isElevenLabsUpgradeError(extracted);
      const msg = upgrade ? ELEVENLABS_UPGRADE_MESSAGE : friendlyTtsError(extracted ?? e);
      setResult({ ok: false, error: msg, durationMs });
      if (upgrade) toast.warning(ELEVENLABS_UPGRADE_MESSAGE);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">TTS Test Lab</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Verify ElevenLabs narration end-to-end for any blog post by slug. Looks up the DB post first, then falls back to static posts or pasted text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Blog slug</Label>
            <Input
              id="slug"
              placeholder="e.g. seo-tipy-remeslnici"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            />
            <p className="text-xs text-muted-foreground">Tip: try the slug from the URL bar of any blog article.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Narration text (optional fallback)</Label>
            <Textarea
              id="text"
              rows={4}
              placeholder="Only used if the slug is not found in DB or static posts."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </div>

          <Button onClick={run} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
            {loading ? 'Generating…' : 'Generate & verify'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.ok ? 'border-primary/30' : 'border-destructive/40'}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {result.ok
                ? <><CheckCircle2 className="w-4 h-4 text-primary" /> Success</>
                : <><XCircle className="w-4 h-4 text-destructive" /> Failed</>}
              <Badge variant="outline" className="ml-auto text-[10px]">{result.durationMs} ms</Badge>
              {result.cached && <Badge variant="secondary" className="text-[10px]">cached</Badge>}
              {typeof result.chars === 'number' && <Badge variant="outline" className="text-[10px]">{result.chars} chars</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.ok && result.audio_url && (
              <>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono bg-muted px-2 py-1 rounded flex-1 truncate">{result.audio_url}</code>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(result.audio_url!); toast.success('Copied'); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <a href={result.audio_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                  </Button>
                </div>
                <BlogAudioPlayer audioUrl={result.audio_url} title={slug} cached={result.cached} freshlyGenerated={!result.cached} />
                <audio controls src={result.audio_url} className="w-full" />
              </>
            )}
            {!result.ok && result.error === ELEVENLABS_UPGRADE_MESSAGE && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-2">
                <p className="font-medium text-sm text-foreground flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-accent" /> Upgrade ElevenLabs to enable playback
                </p>
                <p className="text-xs text-muted-foreground">
                  ElevenLabs returned <code className="px-1 rounded bg-muted">401 detected_unusual_activity</code> — the free tier has been blocked on this account. Upgrade your plan to resume narration generation.
                </p>
                <Button asChild size="sm" variant="outline">
                  <a href="https://elevenlabs.io/pricing" target="_blank" rel="noopener noreferrer">
                    Open ElevenLabs pricing <ExternalLink className="w-3 h-3 ml-1.5" />
                  </a>
                </Button>
              </div>
            )}
            {!result.ok && result.error !== ELEVENLABS_UPGRADE_MESSAGE && (
              <p className="text-sm text-destructive whitespace-pre-wrap">{result.error}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTtsTest;
