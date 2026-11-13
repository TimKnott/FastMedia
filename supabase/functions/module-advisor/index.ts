// Calculator "Suggest something new" assistant.
// Asks a few follow-up questions about a feature that is not in the module list,
// then writes a summary with a rough, unconfirmed price range and saves it for the admin.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { generateJson } from '../_shared/ai-json.ts';
import { getSignedInUserId } from "../_shared/require-user.ts";

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const hits = new Map<string, { n: number; reset: number }>();
const limited = (ip: string) => {
  const now = Date.now(); const e = hits.get(ip);
  if (!e || now > e.reset) { hits.set(ip, { n: 1, reset: now + 10 * 60_000 }); return false; }
  e.n++; return e.n > 30;
};

const MAX_ANSWERS = 4;
const schema = {
  type: 'object', additionalProperties: false,
  required: ['done', 'question', 'covered_by', 'summary', 'suggested_min', 'suggested_max'],
  properties: {
    done: { type: 'boolean' },
    question: { type: 'string' },
    covered_by: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    suggested_min: { type: 'integer' },
    suggested_max: { type: 'integer' },
  },
};

type Msg = { role: 'visitor' | 'advisor'; content: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await getSignedInUserId(req))) return json({ error: 'Please sign in to use this assistant.' }, 401);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) return json({ error: 'Too many requests — please wait a few minutes.' }, 429);

  try {
    const body = await req.json();
    const messages: Msg[] = Array.isArray(body.messages) ? body.messages
      .filter((m: Msg) => (m?.role === 'visitor' || m?.role === 'advisor') && typeof m.content === 'string')
      .slice(0, 12).map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 1500) })) : [];
    if (!messages.length || messages[0].role !== 'visitor' || !messages[0].content.trim()) return json({ error: 'Describe your idea first.' }, 400);
    const trade = typeof body.trade === 'string' ? body.trade.slice(0, 100) : '';
    const selected: string[] = Array.isArray(body.selected_modules) ? body.selected_modules.filter((x: unknown) => typeof x === 'string').slice(0, 60) : [];
    const catalog: { id: string; name: string; price: number }[] = Array.isArray(body.catalog) ? body.catalog.slice(0, 120)
      .filter((m: { id?: unknown; name?: unknown }) => typeof m?.id === 'string' && typeof m?.name === 'string')
      .map((m: { id: string; name: string; price?: number }) => ({ id: m.id.slice(0, 60), name: m.name.slice(0, 80), price: Number(m.price) || 0 })) : [];
    const answers = messages.filter(m => m.role === 'visitor').length;
    const mustFinish = answers > MAX_ANSWERS;

    const transcript = messages.map(m => `${m.role === 'visitor' ? 'Visitor' : 'Advisor'}: ${m.content}`).join('\n');
    const result = await generateJson<{ done: boolean; question: string; covered_by: string[]; summary: string; suggested_min: number; suggested_max: number }>(
      `Business type: ${trade || 'unknown'}\nModules already chosen: ${selected.join(', ') || 'none'}\nModule catalogue (id — name — one-off CZK): ${catalog.map(c => `${c.id} — ${c.name} — ${c.price}`).join('; ')}\n\nConversation so far:\n${transcript}\n\n${mustFinish ? 'You MUST finish now: set done=true.' : `The visitor has answered ${answers} time(s). Ask at most ${MAX_ANSWERS} questions in total.`}`,
      {
        instructions: `You are the FastMedia.Pro website advisor inside a price calculator. A visitor wants a website feature that may not be in the module list. Your job is to understand the real need behind it.
- If you still need to understand the goal, who will use it, how often, or an example, set done=false and ask ONE short, friendly, specific question in British English. Leave summary empty and prices 0.
- When you understand enough (or must finish), set done=true, leave question empty, and write a clear summary for the FastMedia owner: what the visitor needs, why, who uses it, and any details. Under 120 words.
- covered_by: catalogue ids that already cover part of the need (empty if none). Only use ids from the catalogue.
- suggested_min/suggested_max: a rough one-off range in CZK for the NEW part only, based on similar catalogue prices. This is indicative and will be confirmed by FastMedia; never present it as a final price.
- Never promise delivery dates or guaranteed outcomes.`,
        schema, schemaName: 'module_advice', effort: 'low',
      },
    );

    const ids = new Set(catalog.map(c => c.id));
    const covered = (result.covered_by ?? []).filter(id => ids.has(id));
    let requestId: string | null = null;

    if (result.done) {
      const url = Deno.env.get('SUPABASE_URL')!; const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const admin = createClient(url, key);
      const name = typeof body.contact_name === 'string' ? body.contact_name.slice(0, 120) : null;
      const email = typeof body.contact_email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email) ? body.contact_email.slice(0, 200).toLowerCase() : null;
      const { data, error } = await admin.from('module_requests').insert({
        trade, selected_modules: selected, conversation: messages, summary: result.summary,
        suggested_min: Math.max(0, result.suggested_min), suggested_max: Math.max(0, result.suggested_max),
        covered_by: covered, contact_name: name, contact_email: email,
      }).select('id').single();
      if (error) console.error('module_requests insert failed:', error.message);
      requestId = data?.id ?? null;
      try {
        await fetch(`${url}/functions/v1/notify-admin`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({ type: 'module_request', data: { requestId, trade, summary: result.summary, range: `${result.suggested_min}–${result.suggested_max} CZK`, contact: email ?? 'not given yet' } }),
        });
      } catch { /* notification is best-effort */ }
    }

    return json({ ok: true, ...result, covered_by: covered, request_id: requestId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('module-advisor failed:', msg);
    const status = /ai_gateway_failed (402|429|403)/.exec(msg)?.[1];
    if (status === '429') return json({ error: 'The assistant is busy — please try again in a minute.' }, 429);
    if (status) return json({ error: 'The assistant is unavailable right now. Please describe your idea in the notes and we will get back to you.' }, Number(status));
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
