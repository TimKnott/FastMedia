// Public unsubscribe endpoint. GET shows a confirm button (so link scanners cannot unsubscribe people);
// POST (button or RFC 8058 one-click) adds the address to the global suppression list immediately.
import { createClient } from 'npm:@supabase/supabase-js@2';

const page = (body: string, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>FastMedia.Pro</title><body style="font-family:Arial,sans-serif;max-width:520px;margin:48px auto;padding:0 16px">${body}</body>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') ?? '').trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return page('<p>Invalid or expired link. Email support@fastmedia.pro and we will remove you.</p>', 400);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row, error } = await db.from('email_unsubscribe_tokens').select('email,used_at').eq('token', token).maybeSingle();
  if (error || !row) return page('<p>Invalid or expired link. Email support@fastmedia.pro and we will remove you.</p>', 404);

  if (req.method === 'GET') {
    return page(`<h1 style="font-size:20px">Unsubscribe / Odhlásit odběr</h1><p>${row.used_at ? 'You are already unsubscribed.' : 'Stop all marketing emails from FastMedia.Pro to this address?'}</p>${row.used_at ? '' : `<form method="post"><button style="padding:10px 18px">Unsubscribe</button></form>`}`);
  }
  if (req.method !== 'POST') return page('<p>Method not allowed.</p>', 405);

  const email = String(row.email).toLowerCase();
  const now = new Date().toISOString();
  const { data: already } = await db.from('suppressed_emails').select('id').eq('email', email).maybeSingle();
  if (!already) {
    const { error: supErr } = await db.from('suppressed_emails').insert({ email, reason: 'unsubscribe', metadata: { via: 'marketing-unsubscribe', at: now } });
    if (supErr) return page('<p>Something went wrong. Email support@fastmedia.pro and we will remove you.</p>', 500);
  }
  await db.from('email_unsubscribe_tokens').update({ used_at: now }).eq('token', token);
  await db.from('marketing_permissions').update({ objection_at: now }).eq('email', email);
  await db.from('prospects').update({ status: 'unsubscribed', unsubscribed_at: now }).ilike('email', email);
  return page('<h1 style="font-size:20px">Unsubscribed</h1><p>You will not receive further marketing emails from FastMedia.Pro.</p>');
});
