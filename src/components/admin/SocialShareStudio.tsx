import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Download, ExternalLink, Loader2, Share2, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DbBlogPost } from '@/hooks/useDbBlogPosts';

type Platform = 'linkedin' | 'facebook' | 'instagram' | 'tiktok';

interface PlatformCopy {
  caption: string;
  hashtags: string[];
  hook?: string;
  script?: string[];
}

interface Kit {
  linkedin: PlatformCopy;
  facebook: PlatformCopy;
  instagram: PlatformCopy;
  tiktok: PlatformCopy;
  imageHeadline: string;
  imageSubline: string;
}

const PLATFORMS: Array<{
  id: Platform;
  label: string;
  size: { w: number; h: number; name: string };
  shareUrl?: (url: string, text: string) => string;
  uploadUrl?: string;
}> = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    size: { w: 1200, h: 627, name: '1200 × 627' },
    shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    size: { w: 1200, h: 630, name: '1200 × 630' },
    shareUrl: (url, text) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    size: { w: 1080, h: 1080, name: '1080 × 1080' },
    uploadUrl: 'https://www.instagram.com/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    size: { w: 1080, h: 1920, name: '1080 × 1920' },
    uploadUrl: 'https://www.tiktok.com/upload',
  },
];

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

interface Props {
  post: DbBlogPost | null;
  open: boolean;
  onClose: () => void;
}

const SocialShareStudio = ({ post, open, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<Kit | null>(null);
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [headline, setHeadline] = useState('');
  const [subline, setSubline] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>('');

  const url = post ? `https://www.fastmedia.pro/blog/${post.slug}` : 'https://www.fastmedia.pro';

  const generate = useCallback(async () => {
    if (!post) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-kit', {
        body: { post_id: post.id },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Could not build the share kit');
      setKit(data.kit as Kit);
      setHeadline((data.kit as Kit).imageHeadline || post.title?.en || '');
      setSubline((data.kit as Kit).imageSubline || post.excerpt?.en || '');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not build the share kit');
    } finally {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (open && post) {
      setKit(null);
      setPlatform('linkedin');
      setHeadline(post.title?.en || '');
      setSubline(post.excerpt?.en || '');
      generate();
    }
  }, [open, post, generate]);

  // Draw the branded share graphic
  const draw = useCallback(async () => {
    const meta = PLATFORMS.find((p) => p.id === platform)!;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = meta.size;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#080f24');
    grad.addColorStop(0.55, '#0d1b3e');
    grad.addColorStop(1, '#13245a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Hero image as a soft backdrop
    if (post?.hero_image_url) {
      const img = await loadImage(post.hero_image_url);
      if (img) {
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.globalAlpha = 0.32;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.globalAlpha = 1;
        const veil = ctx.createLinearGradient(0, 0, 0, h);
        veil.addColorStop(0, 'rgba(8,15,36,0.55)');
        veil.addColorStop(1, 'rgba(8,15,36,0.96)');
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Coral accent glow
    const glow = ctx.createRadialGradient(w * 0.85, h * 0.12, 0, w * 0.85, h * 0.12, w * 0.55);
    glow.addColorStop(0, 'rgba(255,94,66,0.35)');
    glow.addColorStop(1, 'rgba(255,94,66,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const pad = Math.round(w * 0.075);
    const isTall = h / w > 1.2;

    // Eyebrow
    ctx.fillStyle = '#ff5e42';
    ctx.fillRect(pad, isTall ? h * 0.34 : pad + 6, Math.round(w * 0.11), Math.max(5, Math.round(w * 0.006)));

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = `600 ${Math.round(w * 0.026)}px "Inter", system-ui, sans-serif`;
    ctx.fillText(
      (post?.category || 'INSIGHT').toUpperCase(),
      pad,
      (isTall ? h * 0.34 : pad + 6) + Math.round(w * 0.062),
    );

    // Headline
    const headSize = isTall ? Math.round(w * 0.085) : Math.round(w * 0.062);
    ctx.font = `700 ${headSize}px "Space Grotesk", "Inter", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    const headLines = wrapText(ctx, headline || post?.title?.en || '', w - pad * 2).slice(0, 4);
    let y = isTall ? h * 0.48 : h * 0.42;
    for (const line of headLines) {
      ctx.fillText(line, pad, y);
      y += headSize * 1.18;
    }

    // Subline
    if (subline) {
      const subSize = isTall ? Math.round(w * 0.038) : Math.round(w * 0.03);
      ctx.font = `400 ${subSize}px "Inter", system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      const subLines = wrapText(ctx, subline, w - pad * 2).slice(0, 3);
      y += subSize * 0.7;
      for (const line of subLines) {
        ctx.fillText(line, pad, y);
        y += subSize * 1.4;
      }
    }

    // Footer brand bar
    const barH = Math.round(h * (isTall ? 0.085 : 0.13));
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, h - barH, w, barH);
    ctx.fillStyle = '#ff5e42';
    ctx.fillRect(0, h - barH, Math.round(w * 0.012), barH);
    ctx.font = `700 ${Math.round(w * 0.032)}px "Space Grotesk", "Inter", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FastMedia.Pro', pad, h - barH / 2 + Math.round(w * 0.011));
    ctx.font = `400 ${Math.round(w * 0.024)}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    const tail = 'fastmedia.pro';
    ctx.fillText(tail, w - pad - ctx.measureText(tail).width, h - barH / 2 + Math.round(w * 0.009));

    setPreviewSrc(canvas.toDataURL('image/png'));
  }, [platform, headline, subline, post]);

  useEffect(() => {
    if (open) void draw();
  }, [open, draw]);

  const current = kit?.[platform];
  const meta = PLATFORMS.find((p) => p.id === platform)!;
  const fullCaption = current
    ? [current.caption, current.hashtags?.map((h) => `#${h.replace(/^#/, '')}`).join(' ')]
        .filter(Boolean)
        .join('\n\n')
    : '';

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Copying is blocked by your browser — select the text and copy it manually');
    }
  };

  const downloadImage = () => {
    if (!previewSrc || !post) return;
    const a = document.createElement('a');
    a.href = previewSrc;
    a.download = `${post.slug}-${platform}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Social share studio
            <Badge variant="outline" className="text-[10px]">FastMedia.Pro voice</Badge>
          </DialogTitle>
          <DialogDescription>
            Ready-to-post captions, hashtags and a branded graphic for each platform. Copy the caption, download the image, then post.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-mono text-muted-foreground break-all">{url}</p>
          <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
            Rewrite captions
          </Button>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)} className="mt-1">
          <TabsList className="flex-wrap h-auto">
            {PLATFORMS.map((p) => (
              <TabsTrigger key={p.id} value={p.id} className="text-xs">{p.label}</TabsTrigger>
            ))}
          </TabsList>

          {PLATFORMS.map((p) => (
            <TabsContent key={p.id} value={p.id} className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Copy side */}
                <div className="space-y-3">
                  {loading && !kit ? (
                    <Card>
                      <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 mx-auto mb-2 animate-pulse" />
                        Writing platform-native captions…
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {p.id === 'tiktok' && kit?.tiktok?.hook && (
                        <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground">Spoken hook</p>
                          <p className="text-sm text-foreground">{kit.tiktok.hook}</p>
                          {kit.tiktok.script?.length ? (
                            <ol className="list-decimal pl-4 text-xs text-muted-foreground space-y-1">
                              {kit.tiktok.script.map((s, i) => <li key={i}>{s}</li>)}
                            </ol>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              copy(
                                [kit.tiktok.hook, ...(kit.tiktok.script ?? [])].join('\n'),
                                'Video script',
                              )
                            }
                          >
                            <Copy className="w-3 h-3 mr-1" /> Copy script
                          </Button>
                        </div>
                      )}

                      <div>
                        <Label className="text-xs">Caption</Label>
                        <Textarea
                          value={current?.caption ?? ''}
                          rows={p.id === 'tiktok' ? 4 : 10}
                          onChange={(e) =>
                            setKit((k) => (k ? { ...k, [p.id]: { ...k[p.id], caption: e.target.value } } : k))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Hashtags</Label>
                        <Input
                          value={(current?.hashtags ?? []).map((h) => `#${h.replace(/^#/, '')}`).join(' ')}
                          onChange={(e) =>
                            setKit((k) =>
                              k
                                ? {
                                    ...k,
                                    [p.id]: {
                                      ...k[p.id],
                                      hashtags: e.target.value.split(/\s+/).filter(Boolean),
                                    },
                                  }
                                : k,
                            )
                          }
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => copy(fullCaption, 'Caption')}>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy caption + hashtags
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copy(url, 'Link')}>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy link
                        </Button>
                        {p.shareUrl && (
                          <Button size="sm" variant="secondary" asChild>
                            <a href={p.shareUrl(url, current?.caption ?? '')} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open {p.label} composer
                            </a>
                          </Button>
                        )}
                        {p.uploadUrl && (
                          <Button size="sm" variant="secondary" asChild>
                            <a href={p.uploadUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open {p.label}
                            </a>
                          </Button>
                        )}
                      </div>
                      {p.uploadUrl && (
                        <p className="text-[11px] text-muted-foreground">
                          {p.label} does not accept posts from a link, so copy the caption, download the graphic below and upload it.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Graphic side */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label className="text-xs">Graphic headline</Label>
                      <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Graphic subline</Label>
                      <Input value={subline} onChange={(e) => setSubline(e.target.value)} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col items-center gap-2">
                    {previewSrc ? (
                      <img loading="lazy" decoding="async"
                        src={previewSrc}
                        alt="Share graphic preview"
                        className={p.id === 'tiktok' ? 'max-h-80 rounded-lg' : 'w-full rounded-lg'}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground py-8">Building graphic…</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">{meta.size.name} px — sized for {p.label}</p>
                    <Button size="sm" variant="outline" onClick={downloadImage} disabled={!previewSrc}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Download graphic
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareStudio;
