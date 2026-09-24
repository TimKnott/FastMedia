import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_STORAGE_KEY = 'fastmedia-visitor-session';
const EXIT_SHOWN_KEY = 'fastmedia-exit-shown';

const sessionKey = () => {
  try {
    let key = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, key);
    }
    return key;
  } catch {
    return 'anonymous';
  }
};

export interface VisitorSignalInput {
  kind: 'exit_intent' | 'form_abandoned' | 'high_value';
  page_path?: string;
  form_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
  payload?: Record<string, unknown>;
}

/** Records a conversion-safeguard signal. Silent on failure — never blocks the visitor. */
export const recordVisitorSignal = async (input: VisitorSignalInput) => {
  try {
    await supabase.functions.invoke('visitor-signal', {
      body: {
        ...input,
        page_path: input.page_path ?? window.location.pathname,
        session_key: sessionKey(),
      },
    });
  } catch {
    /* safeguards must never break the page */
  }
};

/** Fires once per browser session when the visitor moves to leave the page. */
export const useExitIntent = (enabled = true) => {
  const [triggered, setTriggered] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (sessionStorage.getItem(EXIT_SHOWN_KEY)) return;
    } catch {
      /* ignore */
    }

    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      try {
        sessionStorage.setItem(EXIT_SHOWN_KEY, '1');
      } catch {
        /* ignore */
      }
      setTriggered(true);
      void recordVisitorSignal({ kind: 'exit_intent' });
    };

    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) fire();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'w') fire();
    };

    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled]);

  return { triggered, dismiss: () => setTriggered(false) };
};

/**
 * Saves a part-filled form so the agent can follow up by email. Call `track`
 * whenever fields change and `complete` on a successful submit.
 */
export const useFormAbandonment = (formId: string, language = 'cs') => {
  const latest = useRef<Record<string, unknown>>({});
  const submitted = useRef(false);

  const track = useCallback((values: Record<string, unknown>) => {
    latest.current = values;
  }, []);

  const complete = useCallback(() => {
    submitted.current = true;
    // Clear any abandonment already logged (e.g. from a tab switch) so no recovery email goes out.
    void recordVisitorSignal({ kind: 'form_abandoned', form_id: formId, language, payload: { completed: true } });
  }, [formId, language]);

  useEffect(() => {
    const flush = () => {
      if (submitted.current) return;
      const values = latest.current;
      const email = typeof values.email === 'string' ? values.email : '';
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
      void recordVisitorSignal({
        kind: 'form_abandoned',
        form_id: formId,
        email,
        name: typeof values.name === 'string' ? values.name : undefined,
        phone: typeof values.phone === 'string' ? values.phone : undefined,
        language,
        payload: values,
      });
    };

    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [formId, language]);

  return { track, complete };
};
