import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  projectId: string;
  logoUrl: string | null;
  existingWebsiteUrl: string | null;
  brandColor: string;
  brandColorSecondary: string | null;
  brandNotes: string | null;
  onChange: (patch: Partial<{
    logo_url: string | null;
    existing_website_url: string;
    brand_color: string;
    brand_color_secondary: string;
    brand_notes: string;
  }>) => void;
}

export const ClientBrandingEditor = (p: Props) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5 MB.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${p.projectId}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('client-brand-assets')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from('client-brand-assets').getPublicUrl(path);
    p.onChange({ logo_url: pub.publicUrl });
    setUploading(false);
    toast.success('Logo uploaded');
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-[160px_1fr] gap-4 items-start">
        <div>
          <Label className="text-xs">Client logo</Label>
          <div className="mt-1 aspect-square w-full rounded-md border border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden">
            {p.logoUrl ? (
              <img loading="lazy" decoding="async" src={p.logoUrl} alt="Client logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-[11px] text-muted-foreground text-center px-2">No logo yet</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.currentTarget.value = '';
            }}
          />
          <div className="flex gap-1.5 mt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
              {p.logoUrl ? 'Replace' : 'Upload'}
            </Button>
            {p.logoUrl && (
              <Button size="sm" variant="ghost" onClick={() => p.onChange({ logo_url: null })} aria-label="Remove logo">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Existing website (for reference)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://client-existing-site.com"
                value={p.existingWebsiteUrl || ''}
                onChange={(e) => p.onChange({ existing_website_url: e.target.value })}
              />
              {p.existingWebsiteUrl && (
                <Button variant="outline" size="icon" asChild>
                  <a href={p.existingWebsiteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              We'll mirror tone, palette and copy structure from this site.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Primary brand colour</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={p.brandColor}
                  onChange={(e) => p.onChange({ brand_color: e.target.value })}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={p.brandColor}
                  onChange={(e) => p.onChange({ brand_color: e.target.value })}
                  placeholder="#0f3a7a"
                />
              </div>
            </div>
            <div>
              <Label>Secondary / accent</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={p.brandColorSecondary || '#f59e0b'}
                  onChange={(e) => p.onChange({ brand_color_secondary: e.target.value })}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={p.brandColorSecondary || ''}
                  onChange={(e) => p.onChange({ brand_color_secondary: e.target.value })}
                  placeholder="#f59e0b"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Brand notes</Label>
            <Textarea
              rows={3}
              placeholder="Tone of voice, fonts, things to avoid, competitors they admire…"
              value={p.brandNotes || ''}
              onChange={(e) => p.onChange({ brand_notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
