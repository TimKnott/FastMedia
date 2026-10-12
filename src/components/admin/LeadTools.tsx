import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** Turn "www.x.cz" or "x.cz" into a clickable absolute link. */
export const toHref = (url?: string | null) => {
  const u = (url ?? '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(u)) return `https://${u}`;
  return '';
};

export const ExternalLinkText = ({ url, label }: { url?: string | null; label?: string }) => {
  const href = toHref(url);
  if (!href) return null;
  return (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80 break-all" href={href} target="_blank" rel="noopener noreferrer">
      {label ?? href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
    </a>
  );
};

type SR = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

/** Free browser speech-to-text (no AI credits). Works in Chrome and Edge. */
export const MicButton = ({ onText, lang = 'cs-CZ' }: { onText: (t: string) => void; lang?: string }) => {
  const [on, setOn] = useState(false);
  const ref = useRef<SR | null>(null);
  const Ctor = typeof window !== 'undefined' ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => SR) | undefined : undefined;
  useEffect(() => () => ref.current?.stop(), []);
  if (!Ctor) return null;
  const toggle = () => {
    if (on) { ref.current?.stop(); return; }
    const r = new Ctor();
    r.lang = lang; r.interimResults = false; r.continuous = false;
    r.onresult = (e) => onText(Array.from(e.results).map((x) => x[0].transcript).join(' ').trim());
    r.onend = () => setOn(false);
    r.onerror = () => { setOn(false); toast.error('Could not hear you — check microphone permission.'); };
    ref.current = r; r.start(); setOn(true);
  };
  return (
    <Button type="button" size="icon" variant={on ? 'destructive' : 'outline'} onClick={toggle} aria-label={on ? 'Stop listening' : 'Speak instead of typing'} title="Speak (Czech)">
      {on ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
};

export const BAD_REASONS = [
  { id: 'wrong_business', label: 'Not this kind of business' },
  { id: 'wrong_link', label: 'Link goes to wrong site (council, directory…)' },
  { id: 'dead_link', label: 'Link broken / no website' },
  { id: 'outside_area', label: 'Outside my area' },
  { id: 'closed', label: 'Closed / no longer trading' },
  { id: 'duplicate', label: 'Duplicate' },
];

/** One-click "report a bad result" — teaches future searches what to avoid. */
export const ReportBad = ({ siteId, kind, title, website, onDone }: { siteId: string; kind: string; title: string; website?: string | null; onDone?: () => void }) => {
  const [open, setOpen] = useState(false);
  const send = async (reason: string) => {
    setOpen(false);
    const { error } = await supabase.from('lead_feedback').insert({ site_id: siteId, kind, reason, title, website: website ?? '' });
    if (error) return toast.error('Could not save the report.');
    toast.success('Thanks — future searches will avoid results like this.');
    onDone?.();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Report bad result"><Flag className="w-3 h-3" /> Bad result</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1">
        {BAD_REASONS.map((r) => (
          <button key={r.id} type="button" onClick={() => send(r.id)} className="w-full text-left text-sm px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {r.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
