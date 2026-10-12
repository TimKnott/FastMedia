import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send, Upload, Download, Play, Pause, Info, Wand2, Copy, ShieldCheck } from 'lucide-react';

type Format = '9:16' | '1:1' | '16:9';
type Shape = 'circle' | 'pill' | 'ribbon';
type Pos = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
interface Concept { title: string; style: string; hook: string; subtitles: string[]; cta: string; badge: string; badgeShape: Shape; musicPrompt: string; videoPrompt: string; flexclipTip: string }
interface Msg { role: 'user' | 'assistant'; content: string; concepts?: Concept[] }

const SIZES: Record<Format, [number, number]> = { '9:16': [1080, 1920], '1:1': [1080, 1080], '16:9': [1920, 1080] };
const STYLES = ['Problem → solution', 'Price comparison', 'Behind the scenes', 'UGC / phone-filmed', 'Cinematic', 'Bold kinetic text'];

// Read brand colours from the design tokens so exported videos match the site.
const token = (name: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : '';
};

const AdminVideoStudio = () => {
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [siteId, setSiteId] = useState<string>('');
  const [format, setFormat] = useState<Format>('9:16');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [prompts, setPrompts] = useState({ video: '', music: '' });

  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [volume, setVolume] = useState(80);
  const [keepVideoSound, setKeepVideoSound] = useState(false);

  const [hook, setHook] = useState('');
  const [subs, setSubs] = useState('');
  const [cta, setCta] = useState('');
  const [lowerThird, setLowerThird] = useState(true);
  const [badge, setBadge] = useState('');
  const [shape, setShape] = useState<Shape>('circle');
  const [badgePos, setBadgePos] = useState<Pos>('top-right');
  const [logoPos, setLogoPos] = useState<Pos>('top-left');

  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtx = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode } | null>(null);
  const state = useRef({ hook, subs, cta, lowerThird, badge, shape, badgePos, logoPos, logoImg, format });
  state.current = { hook, subs, cta, lowerThird, badge, shape, badgePos, logoPos, logoImg, format };

  useEffect(() => {
    supabase.from('business_sites').select('id,name').order('created_at').then(({ data }) => {
      setSites(data ?? []); if (data?.[0]) setSiteId(data[0].id);
    });
  }, []);

  // Single draw loop: preview and export use the exact same pixels.
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = canvasRef.current; const v = videoRef.current;
      if (c) {
        const s = state.current; const [W, H] = SIZES[s.format];
        if (c.width !== W) c.width = W; if (c.height !== H) c.height = H;
        const g = c.getContext('2d')!;
        const primary = token('--primary') || 'blue', accent = token('--accent') || 'coral', fg = token('--primary-foreground') || 'white';
        g.fillStyle = token('--background') || 'black'; g.fillRect(0, 0, W, H);
        if (v && v.readyState >= 2) {
          const r = Math.max(W / v.videoWidth, H / v.videoHeight); const vw = v.videoWidth * r, vh = v.videoHeight * r;
          g.drawImage(v, (W - vw) / 2, (H - vh) / 2, vw, vh);
        }
        const t = v && v.duration ? v.currentTime : 0, dur = v && v.duration ? v.duration : 10;
        const fade = (a: number, b: number) => Math.max(0, Math.min(1, (t - a) * 3, (b - t) * 3));
        const u = Math.min(W, H) / 1080; const font = (px: number, w = 800) => `${w} ${px * u}px 'Space Grotesk', Inter, sans-serif`;
        const wrap = (text: string, x: number, y: number, max: number, lh: number) => {
          const words = text.split(' '); let line = ''; const lines: string[] = [];
          for (const w of words) { const tst = line ? `${line} ${w}` : w; if (g.measureText(tst).width > max && line) { lines.push(line); line = w; } else line = tst; }
          if (line) lines.push(line); lines.forEach((l, i) => g.fillText(l, x, y + i * lh)); return lines.length;
        };
        g.textAlign = 'center'; g.textBaseline = 'middle';
        // Hook: first 3 seconds (or always when no video)
        const hookA = v?.duration ? fade(0, Math.min(3.5, dur)) : 1;
        if (s.hook && hookA > 0) {
          g.globalAlpha = hookA; g.font = font(96); g.fillStyle = fg; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 24 * u;
          wrap(s.hook, W / 2, H * 0.3, W * 0.85, 110 * u); g.shadowBlur = 0; g.globalAlpha = 1;
        }
        // Subtitles: spread across middle of clip
        const lines = s.subs.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length) {
          const start = v?.duration ? 3 : 0, end = v?.duration ? dur - 2.5 : 1;
          const seg = Math.max(0.5, (end - start) / lines.length);
          const i = v?.duration ? Math.floor((t - start) / seg) : 0;
          if (i >= 0 && i < lines.length) {
            const a = v?.duration ? fade(start + i * seg, start + (i + 1) * seg) : 1;
            g.globalAlpha = a; g.font = font(56, 700);
            const y = H * 0.78; const tw = Math.min(g.measureText(lines[i]).width + 60 * u, W * 0.92);
            if (s.lowerThird) { g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect((W - tw) / 2, y - 50 * u, tw, 100 * u, 20 * u); g.fill(); }
            g.fillStyle = fg; wrap(lines[i], W / 2, y, W * 0.88, 64 * u); g.globalAlpha = 1;
          }
        }
        // CTA: last 2.5 seconds
        const ctaA = v?.duration ? fade(dur - 2.5, dur + 1) : 1;
        if (s.cta && ctaA > 0) {
          g.globalAlpha = ctaA; g.font = font(54); const tw = g.measureText(s.cta).width + 90 * u; const y = H * 0.9;
          g.fillStyle = accent; g.beginPath(); g.roundRect((W - tw) / 2, y - 48 * u, tw, 96 * u, 48 * u); g.fill();
          g.fillStyle = fg; g.fillText(s.cta, W / 2, y); g.globalAlpha = 1;
        }
        const corner = (p: Pos, w: number, h: number) => {
          const m = 50 * u; return [p.includes('left') ? m : W - m - w, p.includes('top') ? m : H - m - h] as const;
        };
        // Badge
        if (s.badge) {
          g.font = font(46); const tw = g.measureText(s.badge).width;
          const w = s.shape === 'circle' ? Math.max(220 * u, tw + 50 * u) : tw + 80 * u, h = s.shape === 'circle' ? w : 100 * u;
          const [x, y] = corner(s.badgePos, w, h); const pulse = 1 + Math.sin(performance.now() / 300) * 0.03;
          g.save(); g.translate(x + w / 2, y + h / 2); g.scale(pulse, pulse); g.fillStyle = s.shape === 'ribbon' ? primary : accent;
          g.beginPath();
          if (s.shape === 'circle') g.arc(0, 0, w / 2, 0, Math.PI * 2);
          else if (s.shape === 'pill') g.roundRect(-w / 2, -h / 2, w, h, h / 2);
          else { g.rotate(-0.08); g.rect(-w / 2, -h / 2, w, h); }
          g.fill(); g.fillStyle = fg; g.fillText(s.badge, 0, 0); g.restore();
        }
        // Logo
        if (s.logoImg) {
          const h = 110 * u, w = (s.logoImg.width / s.logoImg.height) * h; const [x, y] = corner(s.logoPos, w, h);
          g.drawImage(s.logoImg, x, y, w, h);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [volume, audioUrl]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = !keepVideoSound; }, [keepVideoSound, videoUrl]);

  const pickFile = (accept: string, cb: (f: File) => void) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
    i.onchange = () => i.files?.[0] && cb(i.files[0]); i.click();
  };

  const send = async (text = draft) => {
    if (!text.trim() || thinking) return;
    const next = [...msgs, { role: 'user' as const, content: text.trim() }];
    setMsgs(next); setDraft(''); setThinking(true);
    const { data, error } = await supabase.functions.invoke('video-director', {
      body: { siteId, format, messages: next.map(({ role, content }) => ({ role, content })) },
    });
    setThinking(false);
    if (error || !data?.ok) { toast.error(data?.error ?? 'The director could not answer.'); return; }
    setMsgs([...next, { role: 'assistant', content: data.reply, concepts: data.concepts }]);
  };

  const apply = (c: Concept) => {
    setHook(c.hook); setSubs(c.subtitles.join('\n')); setCta(c.cta); setBadge(c.badge); setShape(c.badgeShape);
    setPrompts({ video: c.videoPrompt, music: c.musicPrompt });
    toast.success('Loaded into the editor. Paste the prompts into FlexClip, then upload the results here.');
  };

  const ensureAudioGraph = () => {
    if (audioCtx.current) return audioCtx.current;
    const ctx = new AudioContext(); const dest = ctx.createMediaStreamDestination();
    for (const el of [videoRef.current, audioRef.current]) if (el) { const src = ctx.createMediaElementSource(el); src.connect(dest); src.connect(ctx.destination); }
    audioCtx.current = { ctx, dest }; return audioCtx.current;
  };

  const togglePlay = async () => {
    const v = videoRef.current, a = audioRef.current;
    if (playing) { v?.pause(); a?.pause(); setPlaying(false); return; }
    ensureAudioGraph(); await audioCtx.current?.ctx.resume();
    if (v && videoUrl) await v.play(); if (a && audioUrl) await a.play(); setPlaying(true);
  };

  const preflight = [
    { ok: !!videoUrl, text: 'Background video uploaded' },
    { ok: !hook || hook.split(/\s+/).length <= 6, text: 'Hook is 6 words or fewer (readable in 2 seconds)' },
    { ok: !!cta, text: 'Call to action added' },
    { ok: !subs || lowerThird, text: 'Subtitles have a dark box for readability' },
    { ok: !badge || badge.length <= 14, text: 'Badge text is short' },
  ];

  const exportVideo = async () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !videoUrl) return toast.error('Upload a video first.');
    if (!window.confirm('Export runs in your browser and is free. It plays the whole clip once in real time — keep this tab open. Continue?')) return;
    const { ctx, dest } = ensureAudioGraph(); await ctx.resume();
    const stream = new MediaStream([...c.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    const chunks: Blob[] = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime }); const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `advert-${format.replace(':', 'x')}.${mime.includes('mp4') ? 'mp4' : 'webm'}`; a.click();
      setRecording(false); setPlaying(false); audioRef.current?.pause();
      toast.success(mime.includes('mp4') ? 'MP4 downloaded.' : 'Video downloaded (WebM). Most platforms accept it; FlexClip can convert to MP4 if needed.');
    };
    v.currentTime = 0; if (audioRef.current) audioRef.current.currentTime = 0;
    setRecording(true); rec.start(500); await v.play(); if (audioUrl) await audioRef.current?.play(); setPlaying(true);
    v.onended = () => rec.state === 'recording' && rec.stop();
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('Copied'); };
  const [W, H] = SIZES[format];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Video Studio</h1>
          <p className="text-muted-foreground text-sm">Plan with the director, make clips in FlexClip, then add titles, badges, logo and music here.</p>
        </div>
        <div className="flex gap-3 items-end">
          <div><Label>Website</Label>
            <Select value={siteId} onValueChange={setSiteId}><SelectTrigger className="w-56"><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>{sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <Tabs value={format} onValueChange={(v) => setFormat(v as Format)}><TabsList>
            <TabsTrigger value="9:16">9:16 Reels/TikTok</TabsTrigger><TabsTrigger value="1:1">1:1 Feed</TabsTrigger><TabsTrigger value="16:9">16:9 YouTube/Google</TabsTrigger>
          </TabsList></Tabs>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm flex gap-2">
        <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
        <span><b>Cost guide:</b> uploading your own FlexClip videos and licensed music is free. Exporting is free (runs in your browser). Only the director chat uses AI — a tiny fraction of a credit per message. Nothing here generates AI video, so there are no surprise charges.</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr_380px]">
        {/* Director */}
        <Card className="flex flex-col max-h-[860px]">
          <CardHeader className="pb-2"><CardTitle className="text-base">Creative director</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="flex flex-wrap gap-1">{STYLES.map((s) => (
              <Button key={s} size="sm" variant="outline" className="h-7 text-xs" disabled={thinking}
                onClick={() => send(`Give me ideas in the "${s}" style.`)}>{s}</Button>))}</div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!msgs.length && <p className="text-sm text-muted-foreground">Tell me who the advert is for and what you want them to do — e.g. "TikTok ad for plumbers with no website yet". I'll suggest styles and write FlexClip prompts.</p>}
              {msgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'ml-6 rounded-lg bg-primary text-primary-foreground p-2 text-sm' : 'text-sm space-y-2'}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.concepts?.map((c, j) => (
                    <div key={j} className="rounded-lg border border-border p-2 space-y-1">
                      <div className="flex justify-between gap-2"><b>{c.title}</b><Badge variant="secondary">{c.style}</Badge></div>
                      <p className="text-xs">Hook: <i>{c.hook}</i></p>
                      <p className="text-xs text-muted-foreground">{c.flexclipTip}</p>
                      <Button size="sm" className="w-full" onClick={() => apply(c)}><Wand2 className="h-3 w-3 mr-1" />Load into editor</Button>
                    </div>))}
                </div>))}
              {thinking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex gap-2">
              <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Chat about ideas…"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <Button size="icon" aria-label="Send" onClick={() => send()} disabled={thinking || !draft.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="mx-auto bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: `${W}/${H}`, maxHeight: 720, maxWidth: '100%' }}>
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <video ref={videoRef} src={videoUrl || undefined} className="hidden" playsInline crossOrigin="anonymous" onEnded={() => { setPlaying(false); audioRef.current?.pause(); }} />
            <audio ref={audioRef} src={audioUrl || undefined} loop className="hidden" />
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={togglePlay} disabled={recording || (!videoUrl && !audioUrl)}>{playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}{playing ? 'Pause' : 'Play preview'}</Button>
              <Button onClick={exportVideo} disabled={recording || !videoUrl}>{recording ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}{recording ? 'Recording…' : 'Export video (free)'}</Button>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="text-sm font-semibold">Pre-flight check</p>
              {preflight.map((p) => <p key={p.text} className={`text-xs ${p.ok ? 'text-muted-foreground' : 'text-destructive'}`}>{p.ok ? '✓' : '✗'} {p.text}</p>)}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">1. Video</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => pickFile('video/*', (f) => setVideoUrl(URL.createObjectURL(f)))}><Upload className="h-4 w-4 mr-1" />Upload video (free)</Button>
              <Label>FlexClip video prompt</Label>
              <Textarea rows={3} value={prompts.video} onChange={(e) => setPrompts({ ...prompts, video: e.target.value })} placeholder="Ask the director, or write your own…" />
              <Button size="sm" variant="ghost" disabled={!prompts.video} onClick={() => copy(prompts.video)}><Copy className="h-3 w-3 mr-1" />Copy for FlexClip</Button>
              <div className="flex items-center gap-2 text-sm"><Switch checked={keepVideoSound} onCheckedChange={setKeepVideoSound} />Keep the video's own sound</div>
            </CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">2. Music & sound</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => pickFile('audio/*', (f) => setAudioUrl(URL.createObjectURL(f)))}><Upload className="h-4 w-4 mr-1" />Upload music / sound (free)</Button>
              {audioUrl && <p className="text-xs text-muted-foreground">Soundtrack loaded — loops to the video length.</p>}
              <Label>FlexClip music prompt</Label>
              <Textarea rows={2} value={prompts.music} onChange={(e) => setPrompts({ ...prompts, music: e.target.value })} />
              <Button size="sm" variant="ghost" disabled={!prompts.music} onClick={() => copy(prompts.music)}><Copy className="h-3 w-3 mr-1" />Copy for FlexClip</Button>
              <Label>Music volume</Label><Slider value={[volume]} max={100} step={1} onValueChange={([v]) => setVolume(v)} />
            </CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">3. Titles & subtitles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Label>Hook (first 3 seconds)</Label><Input value={hook} onChange={(e) => setHook(e.target.value)} />
              <Label>Subtitles (one per line)</Label><Textarea rows={3} value={subs} onChange={(e) => setSubs(e.target.value)} />
              <Label>Call to action (last seconds)</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="www.fastmedia.pro" />
              <div className="flex items-center gap-2 text-sm"><Switch checked={lowerThird} onCheckedChange={setLowerThird} />Dark box behind subtitles</div>
            </CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">4. Badges & shapes</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. 990 Kč/měs." />
              <div className="flex gap-2">
                <Select value={shape} onValueChange={(v) => setShape(v as Shape)}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="circle">Circle</SelectItem><SelectItem value="pill">Pill</SelectItem><SelectItem value="ribbon">Ribbon</SelectItem></SelectContent></Select>
                <PosSelect value={badgePos} onChange={setBadgePos} />
              </div>
            </CardContent></Card>

          <Card><CardHeader className="pb-2"><CardTitle className="text-base">5. Logo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => pickFile('image/*', (f) => { const img = new Image(); img.onload = () => setLogoImg(img); img.src = URL.createObjectURL(f); })}><Upload className="h-4 w-4 mr-1" />Upload logo (PNG)</Button>
              <PosSelect value={logoPos} onChange={setLogoPos} />
              {logoImg && <Button size="sm" variant="ghost" onClick={() => setLogoImg(null)}>Remove logo</Button>}
            </CardContent></Card>

          <p className="text-xs text-muted-foreground flex gap-1"><Info className="h-3 w-3 mt-0.5 shrink-0" />Files stay on your computer — nothing is uploaded or stored.</p>
        </div>
      </div>
    </div>
  );
};

const PosSelect = ({ value, onChange }: { value: Pos; onChange: (p: Pos) => void }) => (
  <Select value={value} onValueChange={(v) => onChange(v as Pos)}><SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>{(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Pos[]).map((p) => <SelectItem key={p} value={p}>{p.replace('-', ' ')}</SelectItem>)}</SelectContent></Select>
);

export default AdminVideoStudio;
