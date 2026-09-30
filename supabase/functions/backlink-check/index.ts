// Checks whether backlink pages are live and link to fastmedia.pro.
// Body: { id } checks one listing; { all: true } checks every listing with a page address (weekly cron).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret, x-job-token',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

type Row = { id: string; live_url: string | null; status: string };

async function checkOne(db: ReturnType<typeof createClient>, row: Row) {
  let result = '';
  let found = false;
  let nofollow = false;
  try {
    const r = await fetch(row.live_url!, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FastMediaLinkCheck/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const html = await r.text();
    const anchors = html.match(/<a\b[^>]*href=["'][^"']*fastmedia\.pro[^"']*["'][^>]*>/gi) ?? [];
    found = r.ok && anchors.length > 0;
    nofollow = found && anchors.every((a) => /rel=["'][^"']*(nofollow|ugc|sponsored)/i.test(a));
    result = !r.ok
      ? `Page returned HTTP ${r.status}`
      : found
        ? `Link found (${anchors.length})${nofollow ? ' — nofollow' : ' — followed'}`
        : 'Page is live but no link to fastmedia.pro was found';
  } catch (e) {
    result = `Could not open page: ${(e as Error).message}`;
  }
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { last_check_at: now, last_check_result: result, link_ok: found };
  if (found && row.status !== 'live') { patch.status = 'live'; patch.live_at = now; }
  await db.from('backlink_opportunities').update(patch).eq('id', row.id);
  await db.from('backlink_checks').insert({ opportunity_id: row.id, found, nofollow, result });
  return { found, nofollow, result };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const jobToken = req.headers.get('x-job-token') ?? '';
  let jobOk = false;
  if (jobToken) {
    const { data: tok } = await db.from('internal_job_tokens').select('token').eq('name', 'backlink_check').maybeSingle();
    jobOk = !!tok?.token && tok.token === jobToken;
  }
  if (!jobOk && !(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  const body = await req.json().catch(() => ({}));

  if (body.all) {
    const { data: rows } = await db.from('backlink_opportunities').select('id, live_url, status').not('live_url', 'is', null);
    let ok = 0;
    const list = (rows ?? []) as Row[];
    for (let i = 0; i < list.length; i += 5) {
      const res = await Promise.all(list.slice(i, i + 5).map((r) => checkOne(db, r)));
      ok += res.filter((r) => r.found).length;
    }
    return json({ checked: list.length, linking: ok });
  }

  if (!body.id) return json({ error: 'id required' }, 400);
  const { data: row } = await db.from('backlink_opportunities').select('id, live_url, status').eq('id', body.id).single();
  if (!row?.live_url) return json({ error: 'Add the page address where your listing appears first.' }, 400);
  return json(await checkOne(db, row as Row));
});
