import { useState } from 'react';
import { Headphones, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BlogAudioPlayer from './BlogAudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { isElevenLabsUpgradeError } from '@/lib/ttsErrors';

interface Props {
  /** DB-managed post id (preferred — uses cached audio_url) */
  postId?: string;
  /** Pre-existing audio URL from DB; if present, render player immediately */
  initialAudioUrl?: string | null;
  /** For static blog posts: stable slug used as cache key */
  slug?: string;
  /** For static blog posts: narration text */
  text?: string;
  /** Approximate read time for display */
  readMinutes?: number;
  title?: string;
}

const labels = {
  listen: { cs: 'Poslechnout článek', en: 'Listen to this article', de: 'Artikel anhören' },
  generating: { cs: 'Připravuji namluvení…', en: 'Generating narration…', de: 'Erzeuge Vertonung…' },
  failed: { cs: 'Namluvení se nezdařilo', en: 'Narration failed', de: 'Vertonung fehlgeschlagen' },
  retry: { cs: 'Zkusit znovu', en: 'Try again', de: 'Erneut versuchen' },
};

const BlogAudioCTA = ({ postId, initialAudioUrl, slug, text, readMinutes, title }: Props) => {
  const { language } = useLanguage();
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = postId ? { post_id: postId } : { slug, text };
      const { data, error: fnErr } = await supabase.functions.invoke('blog-tts', { body: payload });
      if (fnErr) throw fnErr;
      if (!data?.ok || !data?.audio_url) throw new Error(data?.error || 'No audio URL');
      setAudioUrl(data.audio_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (audioUrl) {
    return <BlogAudioPlayer audioUrl={audioUrl} readMinutes={readMinutes} title={title} />;
  }

  return (
    <div className="my-6 rounded-xl border border-border bg-card/60 backdrop-blur p-4 shadow-card flex items-center gap-3">
      <Button
        onClick={generate}
        disabled={loading}
        size="lg"
        className="gap-2 rounded-full"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Headphones className="w-4 h-4" />}
        {loading ? labels.generating[language] : labels.listen[language]}
        {!loading && readMinutes ? <span className="opacity-80">· {readMinutes} min</span> : null}
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{labels.failed[language]}</span>
          <button onClick={generate} className="underline ml-1">{labels.retry[language]}</button>
        </div>
      )}
    </div>
  );
};

export default BlogAudioCTA;
