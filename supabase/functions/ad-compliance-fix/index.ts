// Rewrites a failing advert into platform-compliant copy. Admin only.
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const RULES: Record<string, string> = {
  sklik: 'Seznam Sklik: headlines max 30 chars, descriptions max 90. Czech sentence case only (first word and proper nouns capitalised). Max ONE exclamation mark in whole advert and none in headline 1. No ellipses, repeated punctuation, emojis, symbols or ALL CAPS. No phone numbers or emails. No superlatives (nej-, jednička, bezkonkurenční) without proof. Avoid repeating words.',
  google: 'Google Ads RSA: headlines max 30 chars, descriptions max 90. No exclamation marks in headlines. No repeated punctuation, emojis, symbols, gimmicky capitals, phone numbers or emails. Avoid unproven superlatives and repetition.',
  meta: 'Meta/Instagram: primary text max 125 chars, headline max 40, description max 30. Never imply the reader has a personal attribute (health, finances, relationships). No guaranteed or unrealistic outcomes. Max one exclamation mark.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  try {
    const b = await req.json();
    const platform = ['sklik', 'google', 'meta'].includes(b.platform) ? b.platform : null;
    if (!platform || typeof b.ad !== 'object' || !b.ad) return json({ ok: false, error: 'Invalid request' }, 400);
    const keys = Object.keys(b.ad).filter((k) => /^[a-z0-9]{1,12}$/.test(k)).slice(0, 8);
    const ad: Record<string, string> = {};
    for (const k of keys) ad[k] = String(b.ad[k] ?? '').slice(0, 400);
    const issues = Array.isArray(b.issues) ? b.issues.slice(0, 40).map((i: unknown) => String((i as { message?: string })?.message ?? '').slice(0, 200)) : [];
    const schema = {
      type: 'object', additionalProperties: false, required: [...keys, 'notes'],
      properties: { ...Object.fromEntries(keys.map((k) => [k, { type: 'string' }])), notes: { type: 'string' } },
    };
    const res = await generateJson<Record<string, string>>(
      `Advert (JSON): ${JSON.stringify(ad)}\nDetected problems: ${issues.join(' | ') || 'none'}\nRewrite every field so it passes all rules. Keep the same language, real prices, offer and call to action. Do not invent facts, discounts, reviews or numbers. Keep fields empty if they were empty. "notes" = one short English sentence about what changed.`,
      { instructions: `You are an advert compliance editor. ${RULES[platform]}`, schema, schemaName: 'fixed_ad', effort: 'low' },
    );
    const { notes, ...fixed } = res;
    return json({ ok: true, ad: fixed, notes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    const s = Number(/ai_gateway_failed (\d{3})/.exec(msg)?.[1] ?? 500);
    const friendly = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'Could not fix the advert. Try again.';
    return json({ ok: false, error: friendly }, s);
  }
});
