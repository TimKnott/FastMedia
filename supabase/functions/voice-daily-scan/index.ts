// Daily website health scan for FastMedia.Pro.
// Checks key public pages load correctly, stores a report, and emails the
// admin a summary. Callable only by pg_cron (CRON_SECRET) or the service role.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITE = 'https://www.fastmedia.pro';
const ADMIN_EMAIL = Deno.env.get('OWNER_NOTIFICATION_EMAIL') ?? Deno.env.get('NOTIFICATION_EMAIL') ?? 'support@fastmedia.pro';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

const PAGES: { path: string; marker?: string }[] = [
  { path: '/', marker: 'FastMedia' },
  { path: '/offer' },
  { path: '/contact' },
  { path: '/calculator' },
  { path: '/blog' },
  { path: '/case-studies' },
  { path: '/courses' },
  { path: '/grant-wizard' },
  { path: '/grant-eligibility' },
  { path: '/eugrants' },
  { path: '/sitemap.xml', marker: '<urlset' },
];

function authorized(req: Request): boolean {
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const cron = req.headers.get('x-cron-secret') ?? '';
  const CRON = Deno.env.get('CRON_SECRET') ?? '';
  if (SERVICE_ROLE && bearer === SERVICE_ROLE) return true;
  if (CRON && cron && cron === CRON) return true;
  return false;
}

Deno.serve(async (req) => {
  if (!authorized(req)) return new Response('unauthorized', { status: 401 });

  const issues: { path: string; problem: string }[] = [];
  let checked = 0;
  for (const p of PAGES) {
    checked++;
    try {
      const res = await fetch(`${SITE}${p.path}`, { redirect: 'follow' });
      const body = await res.text();
      if (!res.ok) {
        issues.push({ path: p.path, problem: `HTTP ${res.status}` });
      } else if (p.marker && !body.includes(p.marker)) {
        issues.push({ path: p.path, problem: `missing expected content "${p.marker}"` });
      }
    } catch (e) {
      issues.push({ path: p.path, problem: `unreachable: ${String(e).slice(0, 120)}` });
    }
  }

  const summary = issues.length === 0
    ? `All ${checked} pages healthy.`
    : `${issues.length} problem(s) across ${checked} pages: ${issues.map((i) => `${i.path} (${i.problem})`).join('; ')}`;

  const { data: report } = await sb
    .from('voice_scan_reports')
    .insert({ pages_checked: checked, issues, summary })
    .select('id')
    .single();

  // Email the admin report (only when there are issues, or once a week on Mondays)
  const isMonday = new Date().getUTCDay() === 1;
  let emailed = false;
  if (issues.length > 0 || isMonday) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-app-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: ADMIN_EMAIL,
        subject: issues.length === 0
          ? `FastMedia weekly site scan: all ${checked} pages healthy`
          : `FastMedia site scan: ${issues.length} issue(s) found`,
        html: `<h2>Daily website scan</h2><p>${summary}</p>${
          issues.length
            ? `<ul>${issues.map((i) => `<li><strong>${i.path}</strong> — ${i.problem}</li>`).join('')}</ul>`
            : '<p>No action needed.</p>'
        }<p style="color:#888">FastMedia.Pro voice agent · daily scan</p>`,
      }),
    });
    emailed = res.ok;
    if (report?.id) await sb.from('voice_scan_reports').update({ emailed }).eq('id', report.id);
  }

  return new Response(JSON.stringify({ ok: true, checked, issues: issues.length, emailed }));
});
