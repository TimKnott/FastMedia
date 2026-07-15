// GA4 sync. Requires per-user OAuth (GA4_CLIENT_ID/SECRET/REFRESH_TOKEN). Stubs gracefully when missing.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  const clientId = Deno.env.get('GA4_CLIENT_ID');
  const clientSecret = Deno.env.get('GA4_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GA4_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) return null;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error(`GA4 token [${res.status}]: ${await res.text()}`);
  return (await res.json()).access_token as string;
}

async function runReport(token: string, propertyId: string, body: any) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GA4 runReport [${res.status}]: ${await res.text()}`);
  return res.json();
}

function weekStart(d = new Date()) {
  const dt = new Date(d); const day = dt.getUTCDay();
  dt.setUTCDate(dt.getUTCDate() + (day === 0 ? -6 : 1 - day));
  dt.setUTCHours(0, 0, 0, 0); return dt.toISOString().slice(0, 10);
}

async function syncProperty(supabase: any, prop: { id: string; ga4_property_id: string | null }, token: string) {
  if (!prop.ga4_property_id) return { skipped: 'no ga4_property_id' };
  // Overview
  const overview = await runReport(token, prop.ga4_property_id, {
    dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
    metrics: ['sessions', 'totalUsers', 'screenPageViews', 'engagementRate', 'bounceRate', 'averageSessionDuration'].map(name => ({ name })),
  });
  const headers = overview.metricHeaders?.map((h: any) => h.name) ?? [];
  const row = overview.rows?.[0]?.metricValues?.map((v: any) => Number(v.value)) ?? [];
  const metrics = Object.fromEntries(headers.map((h: string, i: number) => [h, row[i] ?? 0]));

  // Top pages
  const topPages = await runReport(token, prop.ga4_property_id, {
    dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: ['sessions', 'engagementRate', 'averageSessionDuration', 'bounceRate'].map(name => ({ name })),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 20,
  });
  const topRows = (topPages.rows ?? []).map((r: any) => ({
    page: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    engagementRate: Number(r.metricValues[1].value),
    avgDuration: Number(r.metricValues[2].value),
    bounceRate: Number(r.metricValues[3].value),
  }));
  const highExit = topRows.filter((r: any) => r.bounceRate > 0.7 && r.sessions > 20);

  await supabase.from('seo_ga4_snapshots').insert({
    property_id: prop.id, week_start: weekStart(),
    metrics, top_pages: topRows, high_exit_pages: highExit,
  });

  if (highExit.length > 3) {
    await supabase.from('seo_issues').insert({
      property_id: prop.id, severity: 'warning', category: 'engagement',
      title: `${highExit.length} pages have >70% bounce rate`,
      suggested_fix: 'Add stronger above-the-fold value, internal links, and clear CTAs on high-bounce pages.',
    });
  }
  await supabase.from('seo_properties').update({ last_ga4_at: new Date().toISOString() }).eq('id', prop.id);
  return { sessions: metrics.sessions, topPages: topRows.length };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = await getAccessToken();
    if (!token) {
      return new Response(JSON.stringify({ skipped: true, reason: 'GA4_CLIENT_ID/SECRET/REFRESH_TOKEN not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /**/ }
    const q = supabase.from('seo_properties').select('id, ga4_property_id').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;
    const results: any[] = [];
    for (const p of props ?? []) {
      try { results.push({ id: p.id, ok: true, ...(await syncProperty(supabase, p as any, token)) }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
