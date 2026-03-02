import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type EmbedCode = {
  id: string;
  code: string;
  placement: string;
  name: string;
};

/**
 * Fetches active embed codes from the database and injects them into the page.
 * - head: injected into <head>
 * - body_start: injected at the start of <body>
 * - body_end: injected at the end of <body>
 */
const EmbedCodeInjector = () => {
  const { data: codes } = useQuery({
    queryKey: ['embed-codes-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('embed_codes')
        .select('id, code, placement, name')
        .eq('is_active', true);
      if (error) throw error;
      return data as EmbedCode[];
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  useEffect(() => {
    if (!codes || codes.length === 0) return;

    const injectedElements: HTMLElement[] = [];

    codes.forEach(embed => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-embed-id', embed.id);
      wrapper.setAttribute('data-embed-name', embed.name);
      wrapper.innerHTML = embed.code;

      // Execute any script tags
      const scripts = wrapper.querySelectorAll('script');
      const nonScriptNodes: Node[] = [];

      // Collect non-script children
      wrapper.childNodes.forEach(node => {
        if (node.nodeName !== 'SCRIPT') {
          nonScriptNodes.push(node);
        }
      });

      const target =
        embed.placement === 'head'
          ? document.head
          : embed.placement === 'body_start'
            ? document.body
            : document.body;

      // Insert non-script nodes
      nonScriptNodes.forEach(node => {
        const clone = node.cloneNode(true);
        target.appendChild(clone);
        injectedElements.push(clone as HTMLElement);
      });

      // Re-create script tags so the browser executes them
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
        // For external scripts (with src), don't set textContent as it prevents loading
        if (!oldScript.src) {
          newScript.textContent = oldScript.textContent;
        }

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

    // Cleanup on unmount or when codes change
    return () => {
      injectedElements.forEach(el => {
        try { el.parentNode?.removeChild(el); } catch {}
      });
    };
  }, [codes]);

  return null;
};

export default EmbedCodeInjector;
