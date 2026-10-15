// Browse AI connection (Phase 1): admin-only status check and robot list.
// The API key lives only in the BROWSE_AI_API_KEY backend secret and is never logged or returned.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const API = 'https://api.browse.ai/v2';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function callBrowseAi(path: string, key: string) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${key}` } });
  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  return { status: res.status, data };
}

function safeError(status: number) {
  const msg =
    status === 401 || status === 403 ? 'Browse AI rejected the API key'
    : status === 429 ? 'Browse AI rate limit reached — try again later'
    : status >= 500 ? 'Browse AI is temporarily unavailable'
    : 'Browse AI request failed';
  return json({ ok: false, status, error: msg }, status >= 500 ? 502 : status);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);

  const key = Deno.env.get('BROWSE_AI_API_KEY');
  if (!key) return json({ ok: false, error: 'Browse AI key is not configured' }, 503);

  let action = '';
  try { action = String((await req.json())?.action ?? ''); } catch { /* ignore */ }

  try {
    if (action === 'status') {
      const r = await callBrowseAi('/status', key);
      if (r.status !== 200) return safeError(r.status);
      return json({ ok: true, status: 'connected' });
    }

    if (action === 'list_robots') {
      const r = await callBrowseAi('/robots', key);
      if (r.status !== 200) return safeError(r.status);
      const items = r.data?.robots?.items ?? [];
      const robots = (Array.isArray(items) ? items : []).map((x: any) => ({
        id: String(x?.id ?? ''),
        name: String(x?.name ?? ''),
        createdAt: x?.createdAt ?? null,
        inputParameters: Array.isArray(x?.inputParameters)
          ? x.inputParameters.map((p: any) => String(p?.name ?? '')).filter(Boolean)
          : [],
      }));
      return json({ ok: true, count: robots.length, robots });
    }

    return json({ ok: false, error: 'Unknown action. Use "status" or "list_robots".' }, 400);
  } catch {
    console.error('browse-ai: request to Browse AI failed');
    return json({ ok: false, error: 'Could not reach Browse AI' }, 502);
  }
});
