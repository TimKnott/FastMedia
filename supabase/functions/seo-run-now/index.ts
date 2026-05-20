// Admin-invoked dispatcher: runs sync and/or audit on demand.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: claims.claims.sub, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const { job = 'sync', propertyId } = body;
    const jobMap: Record<string, string | string[]> = {
      sync: 'seo-sync-gsc',
      eat: 'seo-audit-eat',
      semrush: 'seo-sync-semrush',
      pagespeed: 'seo-pagespeed',
      'broken-links': 'seo-broken-links',
      freshness: 'seo-content-freshness',
      voice: 'seo-voice-search',
      ga4: 'seo-ga4-sync',
      digest: 'seo-alerts',
      'critical-alert': 'seo-alerts',
      all: ['seo-sync-gsc', 'seo-sync-semrush', 'seo-pagespeed', 'seo-broken-links', 'seo-content-freshness', 'seo-voice-search', 'seo-ga4-sync', 'seo-audit-eat'],
    };
    const target = jobMap[job] ?? 'seo-sync-gsc';
    const fns = Array.isArray(target) ? target : [target];
    const results: any[] = [];
    for (const fnName of fns) {
      const invokeBody: any = { propertyId };
      if (fnName === 'seo-alerts') invokeBody.mode = job === 'critical-alert' ? 'critical-now' : 'digest';
      const { data, error } = await admin.functions.invoke(fnName, { body: invokeBody });
      results.push({ fn: fnName, ok: !error, data, error: error?.message });
    }
    return new Response(JSON.stringify({ ok: true, job, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
