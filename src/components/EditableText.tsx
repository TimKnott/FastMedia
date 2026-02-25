import { useState, useRef, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePreviewMode } from '@/contexts/PreviewModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  /** The translation key used for DB storage */
  contentKey: string;
  /** Default/fallback text (from translations) */
  defaultValue: string;
  /** Override value from useSiteContent */
  value?: string;
  /** Called after successful save to update local cache */
  onSave?: (key: string, value: string) => void;
  /** HTML tag to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  /** Additional class names */
  className?: string;
  /** Use multiline textarea instead of input */
  multiline?: boolean;
}

const EditableText = ({
  contentKey,
  defaultValue,
  value,
  onSave,
  as: Tag = 'span',
  className,
  multiline = false,
}: EditableTextProps) => {
  const { isSuperAdmin } = useUserRole();
  const { language } = useLanguage();
  const { setPreview, refreshDraftCount } = usePreviewMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const displayValue = value ?? defaultValue;

  useEffect(() => {
    if (editing) {
      setDraft(displayValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editing, displayValue]);

  const handleSave = useCallback(async () => {
    if (draft === displayValue) {
      setEditing(false);
      return;
    }
    setSaving(true);

    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    const { error } = await supabase
      .from('site_content')
      .upsert(
        {
          content_key: contentKey,
          language,
          value: draft,
          status: 'draft',
          updated_by: userId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'content_key,language,status' }
      );

    setSaving(false);
    if (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
      return;
    }

    toast.success('Als Entwurf gespeichert');
    onSave?.(contentKey, draft);
    setEditing(false);
    setPreview(true);
    refreshDraftCount();
  }, [draft, displayValue, contentKey, language, onSave, setPreview, refreshDraftCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  // Non-admin: render plain text
  if (!isSuperAdmin) {
    return <Tag className={className}>{displayValue}</Tag>;
  }

  // Admin editing mode
  if (editing) {
    return (
      <div className="relative inline-flex items-start gap-1 w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className={cn(
              'w-full bg-background/90 backdrop-blur text-foreground border-2 border-accent rounded-lg px-3 py-2 outline-none resize-y',
              className
            )}
            style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full bg-background/90 backdrop-blur text-foreground border-2 border-accent rounded-lg px-3 py-1 outline-none',
              className
            )}
            style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
          />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-shrink-0 p-1.5 rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          title="Speichern"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex-shrink-0 p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          title="Abbrechen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Admin view mode: show pencil on hover
  return (
    <Tag
      className={cn('group/editable relative cursor-pointer inline', className)}
      onClick={() => setEditing(true)}
      title="Klicken zum Bearbeiten"
    >
      {displayValue}
      <Pencil className="inline-block w-4 h-4 ml-2 opacity-0 group-hover/editable:opacity-70 transition-opacity text-accent" />
    </Tag>
  );
};

export default EditableText;
