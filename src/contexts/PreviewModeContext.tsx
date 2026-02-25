import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PreviewModeContextType {
  isPreview: boolean;
  setPreview: (v: boolean) => void;
  draftCount: number;
  setDraftCount: (v: number) => void;
  refreshDraftCount: () => Promise<void>;
  publishAll: () => Promise<void>;
  discardAll: () => Promise<void>;
  publishing: boolean;
}

const PreviewModeContext = createContext<PreviewModeContextType>({
  isPreview: false,
  setPreview: () => {},
  draftCount: 0,
  setDraftCount: () => {},
  refreshDraftCount: async () => {},
  publishAll: async () => {},
  discardAll: async () => {},
  publishing: false,
});

export const usePreviewMode = () => useContext(PreviewModeContext);

export const PreviewModeProvider = ({ children }: { children: ReactNode }) => {
  const { isSuperAdmin } = useUserRole();
  const [isPreview, setPreview] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const refreshDraftCount = useCallback(async () => {
    const { count } = await supabase
      .from('site_content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft');
    setDraftCount(count ?? 0);
  }, []);

  const publishAll = useCallback(async () => {
    setPublishing(true);

    // Get all drafts
    const { data: drafts, error: fetchErr } = await supabase
      .from('site_content')
      .select('*')
      .eq('status', 'draft');

    if (fetchErr || !drafts?.length) {
      setPublishing(false);
      if (fetchErr) toast.error('Fehler beim Laden der Entwürfe');
      else toast.info('Keine Entwürfe vorhanden');
      return;
    }

    // For each draft, upsert as published then delete draft
    for (const draft of drafts) {
      await supabase
        .from('site_content')
        .upsert(
          {
            content_key: draft.content_key,
            language: draft.language,
            value: draft.value,
            status: 'published',
            updated_by: draft.updated_by,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'content_key,language,status' }
        );

      await supabase
        .from('site_content')
        .delete()
        .eq('id', draft.id);
    }

    setPublishing(false);
    setDraftCount(0);
    setPreview(false);
    toast.success(`${drafts.length} Änderung(en) veröffentlicht`);

    // Force reload to refresh all caches
    window.location.reload();
  }, []);

  const discardAll = useCallback(async () => {
    setPublishing(true);

    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('status', 'draft');

    setPublishing(false);

    if (error) {
      toast.error('Fehler beim Verwerfen');
      return;
    }

    setDraftCount(0);
    setPreview(false);
    toast.success('Alle Entwürfe verworfen');
    window.location.reload();
  }, []);

  // Don't provide preview mode to non-admins
  if (!isSuperAdmin) {
    return (
      <PreviewModeContext.Provider
        value={{
          isPreview: false,
          setPreview: () => {},
          draftCount: 0,
          setDraftCount: () => {},
          refreshDraftCount: async () => {},
          publishAll: async () => {},
          discardAll: async () => {},
          publishing: false,
        }}
      >
        {children}
      </PreviewModeContext.Provider>
    );
  }

  return (
    <PreviewModeContext.Provider
      value={{
        isPreview,
        setPreview,
        draftCount,
        setDraftCount,
        refreshDraftCount,
        publishAll,
        discardAll,
        publishing,
      }}
    >
      {children}
    </PreviewModeContext.Provider>
  );
};
