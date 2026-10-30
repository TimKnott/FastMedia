import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface VideoData { title: string; recipient: string | null; video_url: string | null; thumbnail_url: string | null; cta_url: string }

const send = (token: string, event: string) => supabase.functions.invoke('video-view', { body: { token, event } });

/** Personal video page linked from outreach emails (/v/:token). Not indexed. */
export default function VideoLanding() {
  const { token = '' } = useParams();
  const [data, setData] = useState<VideoData | null>(null);
  const [error, setError] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    send(token, 'opened').then(({ data, error }) => (error || !data?.video_url ? setError(true) : setData(data)));
  }, [token]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <Helmet>
        <title>Your personal video | FastMedia.Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-3xl space-y-6 text-center">
        <p className="text-sm uppercase tracking-widest text-accent">FastMedia.Pro</p>
        {error ? (
          <p className="text-muted-foreground">This video link is no longer available.</p>
        ) : !data ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
        ) : (
          <>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {data.recipient ? `A short video for ${data.recipient}` : data.title}
            </h1>
            <video
              className="w-full rounded-lg border border-border bg-muted"
              src={data.video_url ?? undefined}
              poster={data.thumbnail_url ?? undefined}
              controls
              autoPlay
              playsInline
              onPlay={() => { if (!played.current) { played.current = true; send(token, 'played'); } }}
              onEnded={() => send(token, 'completed')}
            />
            <Button asChild size="lg">
              <a href={data.cta_url} onClick={() => send(token, 'cta_click')}>Let's plan my website</a>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
