// Admin-only snapshot of email queue health: pgmq depths, DLQ counts,
// cron job status, rate-limit backoff, recent dispatch/wake net.http_post calls.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const safeCount = async (table: string) => {
    try {
      const { count, error } = await admin
        .schema('pgmq' as never)
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) return null;
      return count ?? 0;
    } catch {
      return null;
    }
  };

  // Depths (visible messages) via pgmq schema tables.
  const [authDepth, transDepth, authDlq, transDlq] = await Promise.all([
    safeCount('q_auth_emails'),
    safeCount('q_transactional_emails'),
    safeCount('q_auth_emails_dlq'),
    safeCount('q_transactional_emails_dlq'),
  ]);

  // Peek DLQ rows for the failures panel.
  const peekDlq = async (queue: string) => {
    try {
      const { data, error } = await admin
        .schema('pgmq' as never)
        .from(queue)
        .select('msg_id, read_ct, enqueued_at, vt, message')
        .order('enqueued_at', { ascending: false })
        .limit(20);
      if (error) return [] as unknown[];
      return data ?? [];
    } catch {
      return [] as unknown[];
    }
  };
  const [authDlqRows, transDlqRows] = await Promise.all([
    peekDlq('q_auth_emails_dlq'),
    peekDlq('q_transactional_emails_dlq'),
  ]);

  // In-flight messages (read_ct >= 1) as a proxy for "currently retrying".
  const inflight = async (queue: string) => {
    try {
      const { data, error } = await admin
        .schema('pgmq' as never)
        .from(queue)
        .select('msg_id, read_ct, enqueued_at, vt, message')
        .gte('read_ct', 1)
        .order('read_ct', { ascending: false })
        .limit(20);
      if (error) return [] as unknown[];
      return data ?? [];
    } catch {
      return [] as unknown[];
    }
  };
  const [authInflight, transInflight] = await Promise.all([
    inflight('q_auth_emails'),
    inflight('q_transactional_emails'),
  ]);

  // Cron job status.
  let cronJob: { active: boolean; schedule?: string; jobname?: string } = { active: false };
  try {
    const { data } = await admin
      .schema('cron' as never)
      .from('job')
      .select('jobname, schedule, active')
      .eq('jobname', 'process-email-queue')
      .maybeSingle();
    if (data) cronJob = { active: !!data.active, schedule: data.schedule, jobname: data.jobname };
  } catch { /* ignore */ }

  // Rate-limit backoff & throughput config.
  const { data: state } = await admin
    .from('email_send_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  // Recent dispatch/wake net.http_post activity.
  let recentDispatch: unknown[] = [];
  try {
    const { data } = await admin
      .schema('net' as never)
      .from('_http_response')
      .select('id, status_code, created, error_msg, content')
      .order('created', { ascending: false })
      .limit(25);
    if (data) recentDispatch = data;
  } catch { /* net schema may not be exposed */ }

  return new Response(
    JSON.stringify({
      generated_at: new Date().toISOString(),
      queues: {
        auth: { depth: authDepth, dlq_depth: authDlq, inflight: authInflight, dlq_sample: authDlqRows },
        transactional: { depth: transDepth, dlq_depth: transDlq, inflight: transInflight, dlq_sample: transDlqRows },
      },
      cron: cronJob,
      state,
      recent_dispatch_calls: recentDispatch,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
  );
});
