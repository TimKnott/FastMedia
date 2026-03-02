import { useState, useRef, useCallback } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditableImageProps {
  /** Unique key for storing the override URL in site_content */
  contentKey: string;
  /** Default image source (bundled asset) */
  defaultSrc: string;
  /** Override URL from useSiteContent */
  overrideSrc?: string;
  /** Called after successful upload to update local cache */
  onSave?: (key: string, value: string) => void;
  /** Alt text */
  alt?: string;
  /** Additional class names for the img element */
  className?: string;
  /** Container class names */
  containerClassName?: string;
}

const EditableImage = ({
  contentKey,
  defaultSrc,
  overrideSrc,
  onSave,
  alt = '',
  className,
  containerClassName,
}: EditableImageProps) => {
  const { isSuperAdmin } = useUserRole();
  const { setPreview, refreshDraftCount } = usePreviewMode();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displaySrc = overrideSrc || defaultSrc;

  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Nur Bilddateien erlaubt (JPEG, PNG, WebP, SVG, GIF)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Maximale Dateigröße: 5 MB');
      return;
    }

    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${contentKey.replace(/\./g, '/')}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload fehlgeschlagen');
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('site-images')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // Save the URL to site_content as draft
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    const { error: dbError } = await supabase
      .from('site_content')
      .upsert(
        {
          content_key: contentKey,
          language: 'all',
          value: publicUrl,
          status: 'draft',
          updated_by: userId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'content_key,language,status' }
      );

    setUploading(false);

    if (dbError) {
      toast.error('Fehler beim Speichern');
      console.error(dbError);
      return;
    }

    toast.success('Bild als Entwurf gespeichert');
    onSave?.(contentKey, publicUrl);
    setPreview(true);
    refreshDraftCount();

    // Reset file input
    if (inputRef.current) inputRef.current.value = '';
  }, [contentKey, onSave]);

  // Non-admin: plain image
  if (!isSuperAdmin) {
    return <img src={displaySrc} alt={alt} className={className} />;
  }

  return (
    <div className={cn('relative group/editable-img', containerClassName)}>
      <img src={displaySrc} alt={alt} className={className} />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/0 group-hover/editable-img:bg-foreground/30 transition-colors duration-300 cursor-pointer flex items-center justify-center"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="bg-background/90 backdrop-blur rounded-xl p-4 shadow-lg">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
          <div className="bg-background/90 backdrop-blur rounded-xl p-4 shadow-lg opacity-0 group-hover/editable-img:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
            <Camera className="w-6 h-6 text-accent" />
            <span className="text-xs font-medium text-foreground">Bild ändern</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg,.gif"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default EditableImage;
