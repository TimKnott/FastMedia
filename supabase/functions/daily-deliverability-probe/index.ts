// Daily deliverability probe: sends a probe through the outbound pipeline,
// waits for the queue to process it, gathers 24h send stats + failures, then
// emails an admin report to NOTIFICATION_EMAIL.
// Callable only by pg_cron (CRON_SECRET header) or the service role.
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  adminMessageUrl,
  isFailureStatus,
  resolveProbeOutcome,
  type SendLogRow,
} from '../_shared/deliverability.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

function authorized(req: Request): boolean {
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const cron = req.headers.get('x-cron-secret') ?? '';
  const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const CRON = Deno.env.get('CRON_SECRET') ?? '';
  if (SERVICE && bearer === SERVICE) return true;
  if (CRON && cron && cron === CRON) return true;
  return false;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Post an immediate alert to Slack. Never throws — alerting must not break the report. */
async function postSlackAlert(text: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') ?? '';
  const SLACK_API_KEY = Deno.env.get('SLACK_API_KEY') ?? '';
  const channel = Deno.env.get('SLACK_ALERT_CHANNEL') ?? '#general';
  if (!LOVABLE_API_KEY || !SLACK_API_KEY) {
    console.warn('Slack alert skipped: Slack connection not linked to this project');
    return 'slack_not_configured';
  }
  try {
    const res = await fetch('https://connector-gateway.lovable.dev/slack/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': SLACK_API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ channel, text }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`Slack alert failed [${res.status}]: ${body.slice(0, 400)}`);
      return `http_${res.status}`;
    }
    let parsed: { ok?: boolean; error?: string };
    try {
      parsed = JSON.parse(body);
    } catch {
      console.error(`Slack alert returned non-JSON: ${body.slice(0, 200)}`);
      return 'non_json_response';
    }
    if (!parsed.ok) {
      console.error(`Slack alert rejected: ${parsed.error}`);
      return parsed.error ?? 'slack_error';
    }
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Slack alert threw:', msg);
    return msg;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!authorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const NOTIFICATION_EMAIL = Deno.env.get('PRIVATE_FORWARD_EMAIL') || Deno.env.get('NOTIFICATION_EMAIL');
  if (!NOTIFICATION_EMAIL) {
    return new Response(JSON.stringify({ error: 'NOTIFICATION_EMAIL not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const probeRecipient = 'support@fastmedia.pro';
  const probeId = `probe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  // 1) Fire probe through the outbound pipeline
  let probeError: string | null = null;
  let probeMessageId: string | null = null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-app-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateName: 'deliverability-test',
        recipientEmail: probeRecipient,
        idempotencyKey: probeId,
        templateData: {
          probeId,
          triggeredBy: 'daily-deliverability-probe',
          triggeredAt: new Date().toISOString(),
          note: 'Automated daily probe',
        },
      }),
    });
    if (!res.ok) {
      probeError = `HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`;
    } else {
      const body = await res.json();
      probeMessageId = body.messageId ?? null;
    }
  } catch (e) {
    probeError = e instanceof Error ? e.message : String(e);
  }

  if (!probeMessageId && !probeError) {
    probeError = 'Probe did not return a messageId; delivery cannot be verified';
  }

  // 2) Poll email_send_log for the probe's OWN terminal row (~45s max).
  //    Matching is strictly by message_id — unrelated rows can never leak in.
  let probeLatencyMs: number | null = null;
  let matchedRows: SendLogRow[] = [];
  if (probeMessageId) {
    for (let i = 0; i < 15; i++) {
      await sleep(3000);
      const { data } = await admin
        .from('email_send_log')
        .select('message_id,status,error_message,created_at')
        .eq('message_id', probeMessageId)
        .order('created_at', { ascending: false })
        .limit(10);
      matchedRows = (data ?? []) as SendLogRow[];
      const interim = resolveProbeOutcome(matchedRows, probeMessageId);
      if (interim.matched) {
        probeLatencyMs = Date.now() - startedAt;
        break;
      }
    }
  }

  const outcome = resolveProbeOutcome(matchedRows, probeMessageId, probeError);
  const probeStatus = outcome.status;
  probeError = outcome.errorMessage;
  const probeMessageUrl = adminMessageUrl(probeMessageId);

  // 3) 24h aggregate stats (deduplicated by message_id)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from('email_send_log')
    .select('message_id,status,template_name,error_message,created_at,recipient_email')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(2000);

  const latestByMsg = new Map<string, any>();
  for (const r of recent ?? []) {
    const key = r.message_id ?? `${r.template_name}:${r.recipient_email}:${r.created_at}`;
    if (!latestByMsg.has(key)) latestByMsg.set(key, r);
  }
  const rows = [...latestByMsg.values()];
  const totals = {
    sent: rows.filter((r) => r.status === 'sent').length,
    failed: rows.filter((r) => ['failed', 'dlq', 'bounced', 'complained'].includes(r.status)).length,
    suppressed: rows.filter((r) => r.status === 'suppressed').length,
    pending: rows.filter((r) => r.status === 'pending').length,
  };
  const failures = rows
    .filter((r) => ['failed', 'dlq', 'bounced', 'complained'].includes(r.status))
    .slice(0, 10)
    .map((r) => ({
      when: new Date(r.created_at).toISOString(),
      status: r.status,
      template: r.template_name,
      error: (r.error_message ?? '').slice(0, 400),
      messageUrl: adminMessageUrl(r.message_id ?? null),
    }));

  const { count: suppressionCount } = await admin
    .from('suppressed_emails')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);

  // 4) Immediate Slack alert on any failure / bounce / suppression
  let slackAlertError: string | null = null;
  let slackAlerted = false;
  if (isFailureStatus(probeStatus)) {
    slackAlerted = true;
    slackAlertError = await postSlackAlert(
      [
        `:rotating_light: *FastMedia.Pro deliverability FAIL* — probe ended in \`${probeStatus}\``,
        `*Recipient:* ${probeRecipient}`,
        `*Probe ID:* ${probeId}`,
        `*Message ID:* ${probeMessageId ?? '—'}`,
        probeError ? `*Error / DSN:* ${probeError.slice(0, 500)}` : null,
        `*Evidence:* ${probeMessageUrl}`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  // 5) Send admin report
  const reportPayload = {
    templateName: 'deliverability-daily-report',
    recipientEmail: NOTIFICATION_EMAIL,
    idempotencyKey: `deliverability-report-${new Date().toISOString().slice(0, 10)}`,
    templateData: {
      probeId,
      probeStatus,
      probeBadge: outcome.badgeLabel,
      probeRecipient,
      probeError,
      probeLatencyMs,
      probeMessageId,
      probeMessageUrl,
      window: 'last 24h',
      totals,
      failures,
      suppressions: suppressionCount ?? 0,
      generatedAt: new Date().toISOString(),
    },
  };

  let reportError: string | null = null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-app-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportPayload),
    });
    if (!res.ok) reportError = `HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`;
  } catch (e) {
    reportError = e instanceof Error ? e.message : String(e);
  }

  return new Response(
    JSON.stringify({
      ok: !reportError,
      probeId,
      probeMessageId,
      probeMessageUrl,
      probeStatus,
      probeBadge: outcome.badgeLabel,
      probeError,
      probeLatencyMs,
      totals,
      failures: failures.length,
      suppressions: suppressionCount ?? 0,
      slackAlerted,
      slackAlertError,
      reportError,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
