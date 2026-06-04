import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EmbedCode = {
  id: string;
  code: string;
  placement: string;
  name: string;
};

const COOKIE_KEY = 'fm_cookie_consent';

const fetchEmbedCodes = async (): Promise<EmbedCode[]> => {
  const { data, error } = await supabase.functions.invoke('embed-codes');
  if (error) throw error;
  return data as EmbedCode[];
};

/**
 * An embed is considered analytics/tracking (and therefore requires cookie
 * consent under GDPR) if its name or code indicates a known tracker.
 */
const requiresConsent = (embed: EmbedCode): boolean => {
  const haystack = `${embed.name} ${embed.code}`.toLowerCase();
  const trackers = [
    'vbout', 'vbt.io', 'vbtrack',
    'google-analytics', 'googletagmanager', 'gtag(',
    'facebook.net', 'fbq(',
    'hotjar', 'clarity.ms', 'segment.com', 'mixpanel',
    'linkedin.com/insight', 'tiktok analytics', 'analytics.tiktok',
  ];
  return trackers.some(t => haystack.includes(t));
};

const hasAnalyticsConsent = () => localStorage.getItem(COOKIE_KEY) === 'accepted';

/**
 * Fetches active embed codes from the database and injects them into the page.
 * Trackers/analytics embeds are deferred until the user accepts cookies.
 */
const EmbedCodeInjector = () => {
  const { data: codes } = useQuery({
    queryKey: ['embed-codes-active'],
    queryFn: fetchEmbedCodes,
    staleTime: 5 * 60 * 1000,
  });

  const [consent, setConsent] = useState<boolean>(hasAnalyticsConsent);

  useEffect(() => {
    const update = () => setConsent(hasAnalyticsConsent());
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConsent(!!detail?.accepted);
    };
    window.addEventListener('fm-cookie-consent', onConsent);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('fm-cookie-consent', onConsent);
      window.removeEventListener('storage', update);
    };
  }, []);

  useEffect(() => {
    if (!codes || codes.length === 0) return;

    const allowed = codes.filter(c => !requiresConsent(c) || consent);
    const injectedElements: HTMLElement[] = [];

    allowed.forEach(embed => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-embed-id', embed.id);
      wrapper.setAttribute('data-embed-name', embed.name);
      wrapper.innerHTML = embed.code;

      const scripts = wrapper.querySelectorAll('script');
      const nonScriptNodes: Node[] = [];
      wrapper.childNodes.forEach(node => {
        if (node.nodeName !== 'SCRIPT') nonScriptNodes.push(node);
      });

      const target =
        embed.placement === 'head'
          ? document.head
          : document.body;

      nonScriptNodes.forEach(node => {
        const clone = node.cloneNode(true);
        target.appendChild(clone);
        injectedElements.push(clone as HTMLElement);
      });

      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        // Allow-list of safe script attributes. Event-handler attributes like
        // onload/onerror are stripped to avoid executing DB-sourced strings.
        const SAFE_ATTRS = new Set(['src', 'async', 'defer', 'type', 'id', 'crossorigin', 'integrity', 'nonce', 'referrerpolicy']);
        Array.from(oldScript.attributes).forEach(attr => {
          if (SAFE_ATTRS.has(attr.name.toLowerCase())) {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        if (!oldScript.src) newScript.textContent = oldScript.textContent;

        if (embed.placement === 'body_end') {
          document.body.appendChild(newScript);
        } else if (embed.placement === 'body_start') {
          document.body.insertBefore(newScript, document.body.firstChild);
        } else {
          document.head.appendChild(newScript);
        }
        injectedElements.push(newScript);
      });
    });

    return () => {
      injectedElements.forEach(el => {
        try { el.parentNode?.removeChild(el); } catch {}
      });
    };
  }, [codes, consent]);

  return null;
};

export default EmbedCodeInjector;
