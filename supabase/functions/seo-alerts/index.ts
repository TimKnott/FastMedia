// Sends weekly SEO digest email + immediate critical alerts. Uses Mailgun (notify.fastmedia.pro).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('MAILGUN_API_KEY');
  const domain = Deno.env.get('MAILGUN_DOMAIN') ?? 'notify.fastmedia.pro';
  if (!apiKey) { console.warn('MAILGUN_API_KEY missing — skipping email'); return { skipped: true }; }
  const form = new FormData();
  form.append('from', `FastMedia SEO <seo@${domain}>`);
  form.append('to', to);
  form.append('subject', subject);
  form.append('html', html);
  form.append('h:Reply-To', 'support@fastmedia.pro');
  const res = await fetch(`https://api.eu.mailgun.net/v3/${domain}/messages`, {
    method: 'POST', headers: { Authorization: 'Basic ' + btoa(`api:${apiKey}`) }, body: form,
  });
  if (!res.ok) {
    // Try US endpoint as fallback
    const res2 = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST', headers: { Authorization: 'Basic ' + btoa(`api:${apiKey}`) }, body: form,
    });
    if (!res2.ok) throw new Error(`Mailgun [${res2.status}]: ${await res2.text()}`);
  }
  return { ok: true };
}

function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }

async function buildDigest(supabase: any, prop: any) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [{ data: issues }, { data: bl }, { data: ps }, { data: freshness }, { data: snap }] = await Promise.all([
    supabase.from('seo_issues').select('*').eq('property_id', prop.id).eq('status', 'open').gte('created_at', since).order('severity'),
    supabase.from('seo_backlinks').select('*').eq('property_id', prop.id).order('snapshot_at', { ascending: false }).limit(1),
    supabase.from('seo_pagespeed').select('url, strategy, performance, lcp_ms').eq('property_id', prop.id).gte('audited_at', since).order('audited_at', { ascending: false }).limit(10),
    supabase.from('seo_content_freshness').select('url, days_since_update, impressions_28d').eq('property_id', prop.id).order('impressions_28d', { ascending: false }).limit(5),
    supabase.from('seo_snapshots').select('metrics').eq('property_id', prop.id).eq('dimension', 'daily').order('week_start', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const totals = (snap?.metrics ?? []).reduce((a: any, r: any) => ({ clicks: a.clicks + (r.clicks ?? 0), imp: a.imp + (r.impressions ?? 0) }), { clicks: 0, imp: 0 });
  const critical = (issues ?? []).filter((i: any) => i.severity === 'critical');
  const warnings = (issues ?? []).filter((i: any) => i.severity === 'warning');

  const issuesHtml = (issues ?? []).slice(0, 15).map((i: any) => `
    <tr><td style="padding:6px 10px;border-bottom:1px solid #eee;"><strong style="color:${i.severity === 'critical' ? '#c0392b' : i.severity === 'warning' ? '#d68910' : '#2874a6'}">${i.severity.toUpperCase()}</strong></td>
    <td style="padding:6px 10px;border-bottom:1px solid #eee;">${escapeHtml(i.title)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;color:#666;">${escapeHtml(i.suggested_fix ?? '')}</td></tr>`).join('');

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:auto;color:#1a1a2e;">
    <h2 style="margin:0 0 4px;">Weekly SEO Digest — ${escapeHtml(prop.display_name)}</h2>
    <p style="color:#666;margin:0 0 24px;">${prop.site_url}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
      <div style="background:#f5f6fa;padding:12px;border-radius:8px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Clicks (28d)</div><div style="font-size:24px;font-weight:600;">${totals.clicks.toLocaleString()}</div></div>
      <div style="background:#f5f6fa;padding:12px;border-radius:8px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Impressions</div><div style="font-size:24px;font-weight:600;">${totals.imp.toLocaleString()}</div></div>
      <div style="background:#f5f6fa;padding:12px;border-radius:8px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Authority</div><div style="font-size:24px;font-weight:600;">${bl?.[0]?.authority_score ?? '—'}</div></div>
    </div>
    <h3>Issues this week (${critical.length} critical, ${warnings.length} warnings)</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${issuesHtml || '<tr><td style="padding:12px;color:#27ae60;">✓ No new issues. Nice work.</td></tr>'}</table>
    <p style="margin-top:32px;font-size:12px;color:#999;">View full dashboard: <a href="https://www.fastmedia.pro/admin/seo-insights">fastmedia.pro/admin/seo-insights</a></p>
  </div>`;
  return { html, subject: `[SEO] ${critical.length}🔴 ${warnings.length}🟡 — ${prop.display_name}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode ?? 'digest'; // 'digest' | 'critical-now'
    const { data: props } = await supabase.from('seo_properties').select('*').eq('is_active', true);
    const sent: any[] = [];
    for (const prop of props ?? []) {
      try {
        const to = prop.alert_email ?? 'support@fastmedia.pro';
        if (mode === 'critical-now') {
          const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
          const { data: crits } = await supabase.from('seo_issues').select('*').eq('property_id', prop.id).eq('severity', 'critical').eq('status', 'open').gte('created_at', since);
          if (!crits?.length) { sent.push({ id: prop.id, skipped: 'no crit' }); continue; }
          const list = crits.slice(0, 10).map((c: any) => `<li><strong>${escapeHtml(c.title)}</strong><br><small>${escapeHtml(c.suggested_fix ?? '')}</small></li>`).join('');
          const html = `<div style="font-family:Inter,Arial,sans-serif;"><h2 style="color:#c0392b;">🔴 ${crits.length} critical SEO issue${crits.length > 1 ? 's' : ''} — ${escapeHtml(prop.display_name)}</h2><ul>${list}</ul><p><a href="https://www.fastmedia.pro/admin/seo-insights">Open dashboard</a></p></div>`;
          await sendEmail(to, `[SEO CRITICAL] ${crits.length} issue${crits.length > 1 ? 's' : ''} — ${prop.display_name}`, html);
          await supabase.from('seo_alerts_log').insert({ property_id: prop.id, alert_type: 'critical', severity: 'critical', subject: `${crits.length} critical issues`, recipient: to, metadata: { count: crits.length } });
          sent.push({ id: prop.id, ok: true, count: crits.length });
        } else {
          const { subject, html } = await buildDigest(supabase, prop);
          await sendEmail(to, subject, html);
          await supabase.from('seo_alerts_log').insert({ property_id: prop.id, alert_type: 'digest', severity: 'info', subject, recipient: to });
          sent.push({ id: prop.id, ok: true });
        }
      } catch (e) { sent.push({ id: prop.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
