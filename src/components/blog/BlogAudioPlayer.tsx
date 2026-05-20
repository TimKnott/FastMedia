import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Loader2, Sparkles, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  audioUrl: string;
  readMinutes?: number;
  title?: string;
  /** When true, indicates this MP3 was just generated (vs served from cache). Triggers autoplay. */
  freshlyGenerated?: boolean;
  /** Optional override: explicitly indicate cache hit (suppresses autoplay even if freshlyGenerated). */
  cached?: boolean;
}

const BlogAudioPlayer = ({ audioUrl, readMinutes, title, freshlyGenerated, cached }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setDuration(a.duration);
    const onTime = () => setProgress(a.currentTime);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWait = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('waiting', onWait);
    a.addEventListener('canplay', onCanPlay);
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('waiting', onWait);
      a.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) a.pause(); else { setLoading(true); a.play().finally(() => setLoading(false)); }
  };
  // Auto-play once the freshly generated MP3 becomes playable.
  useEffect(() => {
    if (!freshlyGenerated || cached) return;
    const a = audioRef.current; if (!a) return;
    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      setLoading(true);
      a.play()
        .catch(() => { /* Autoplay blocked — user must click */ })
        .finally(() => setLoading(false));
    };
    if (a.readyState >= 3) tryPlay();
    else a.addEventListener('canplay', tryPlay, { once: true });
    return () => { cancelled = true; a.removeEventListener('canplay', tryPlay); };
  }, [freshlyGenerated, cached, audioUrl]);


  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="my-6 rounded-xl border border-border bg-card/60 backdrop-blur p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="default"
          className="h-11 w-11 rounded-full shrink-0"
          onClick={toggle}
          aria-label={playing ? 'Pause narration' : 'Play narration'}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">Listen to this article</span>
            {readMinutes ? <span>· {readMinutes} min read</span> : null}
            {cached && (
              <Badge variant="outline" className="h-5 gap-1 text-[10px] px-1.5">
                <Database className="w-3 h-3" /> Cached
              </Badge>
            )}
            {freshlyGenerated && !cached && (
              <Badge variant="secondary" className="h-5 gap-1 text-[10px] px-1.5 bg-accent/15 text-accent border-accent/30">
                <Sparkles className="w-3 h-3" /> Generated
              </Badge>
            )}
            <span className="ml-auto tabular-nums">{fmt(progress)} / {fmt(duration)}</span>
          </div>
          <div
            className="h-1.5 rounded-full bg-muted overflow-hidden cursor-pointer"
            onClick={(e) => {
              const a = audioRef.current; if (!a || !duration) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              a.currentTime = ratio * duration;
            }}
          >
            <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={audioUrl} preload="metadata" title={title} />
    </div>
  );
};

export default BlogAudioPlayer;
