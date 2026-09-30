// Checks whether a submitted backlink page is live and links to fastmedia.pro.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  const { id } = await req.json().catch(() => ({}));
  if (!id) return json({ error: 'id required' }, 400);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await db.from('backlink_opportunities').select('*').eq('id', id).single();
  if (!row?.live_url) return json({ error: 'Add the page address where your listing appears first.' }, 400);

  let result = '';
  let found = false;
  let nofollow = false;
  try {
    const r = await fetch(row.live_url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FastMediaLinkCheck/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const html = await r.text();
    const anchors = html.match(/<a\b[^>]*href=["'][^"']*fastmedia\.pro[^"']*["'][^>]*>/gi) ?? [];
    found = anchors.length > 0;
    nofollow = found && anchors.every((a) => /rel=["'][^"']*(nofollow|ugc|sponsored)/i.test(a));
    result = !r.ok
      ? `Page returned HTTP ${r.status}`
      : found
        ? `Link found (${anchors.length})${nofollow ? ' — nofollow' : ' — followed'}`
        : 'Page is live but no link to fastmedia.pro was found';
  } catch (e) {
    result = `Could not open page: ${(e as Error).message}`;
  }
  const patch: Record<string, unknown> = { last_check_at: new Date().toISOString(), last_check_result: result };
  if (found && row.status !== 'live') { patch.status = 'live'; patch.live_at = new Date().toISOString(); }
  await db.from('backlink_opportunities').update(patch).eq('id', id);
  return json({ found, nofollow, result });
});
