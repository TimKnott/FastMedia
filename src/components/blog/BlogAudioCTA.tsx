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

const upgradeLabels = {
  title: { cs: 'Namluvení článku je dočasně nedostupné', en: 'Audio playback temporarily unavailable', de: 'Audio-Wiedergabe vorübergehend nicht verfügbar' },
  body: {
    cs: 'Pro spuštění hlasového namluvení článku je potřeba upgradovat účet ElevenLabs.',
    en: 'Upgrade your ElevenLabs plan to enable narration playback for this article.',
    de: 'Bitte aktualisieren Sie Ihren ElevenLabs-Plan, um die Vertonung zu aktivieren.',
  },
};

const BlogAudioCTA = ({ postId, initialAudioUrl, slug, text, readMinutes, title }: Props) => {
  const { language } = useLanguage();
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);
  // Cached when the URL was supplied by parent (already persisted) OR the function says cached.
  const [cached, setCached] = useState<boolean>(!!initialAudioUrl);
  const [freshlyGenerated, setFreshlyGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setUpgradeNeeded(false);
    try {
      const payload = postId ? { post_id: postId } : { slug, text };
      const { data, error: fnErr } = await supabase.functions.invoke('blog-tts', { body: payload });
      if (fnErr) throw fnErr;
      if (!data?.ok || !data?.audio_url) throw new Error(data?.error || 'No audio URL');
      setCached(!!data.cached);
      setFreshlyGenerated(!data.cached);
      setAudioUrl(data.audio_url);
    } catch (e) {
      const ctxErr = (e as { context?: { error?: string } })?.context?.error;
      if (isElevenLabsUpgradeError(e) || isElevenLabsUpgradeError(ctxErr)) {
        setUpgradeNeeded(true);
      } else {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (audioUrl) {
    return (
      <BlogAudioPlayer
        audioUrl={audioUrl}
        readMinutes={readMinutes}
        title={title}
        cached={cached}
        freshlyGenerated={freshlyGenerated}
      />
    );
  }

  if (upgradeNeeded) {
    return (
      <div className="my-6 rounded-xl border border-accent/30 bg-accent/5 p-4 shadow-card flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{upgradeLabels.title[language]}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{upgradeLabels.body[language]}</p>
        </div>
      </div>
    );
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
