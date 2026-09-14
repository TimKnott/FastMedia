import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads a boolean site setting. Defaults to `false` (hidden) until the
 * row is loaded, so gated sections never flash on screen.
 */
export const useSiteSetting = (key: string, fallback = false) => {
  const [enabled, setEnabled] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();
    setEnabled(data?.enabled ?? fallback);
    setLoading(false);
  }, [key, fallback]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (value: boolean) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, enabled: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (!error) setEnabled(value);
      return error;
    },
    [key]
  );

  return { enabled, loading, update, reload: load };
};

/**
 * Loads every site setting at once. Missing rows fall back to the caller's
 * default, so newly added sections stay visible until switched off.
 */
export const useAllSiteSettings = () => {
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('key, enabled');
    const next: Record<string, boolean> = {};
    data?.forEach((row) => {
      next[row.key] = row.enabled;
    });
    setMap(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEnabled = useCallback(
    (key: string, fallback = true) => map[key] ?? fallback,
    [map]
  );

  const setEnabled = useCallback(async (key: string, value: boolean) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, enabled: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (!error) setMap((prev) => ({ ...prev, [key]: value }));
    return error;
  }, []);

  return { map, isEnabled, setEnabled, loading, reload: load };
};
