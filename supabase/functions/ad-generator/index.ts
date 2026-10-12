// AI advert generator for the admin Ad Studio. Writes Czech ad copy around
// FastMedia's real offer. Never publishes anything.
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const OFFER = `FastMedia.Pro (www.fastmedia.pro) builds websites for Czech tradespeople and small businesses. Real offer, use only these facts:
- Starter website 6 900 Kč one-off, first year hosting + .cz domain included, 30-day money-back guarantee.
- Subscription 990 Kč/month, 0 Kč upfront, hosting, domain and 45 min edits monthly, 12-month initial term.
- From year two: 2 490 Kč/year hosting, domain, SSL, backups. No lock-in, the client owns the site.
- Bigger sites (e-shop, bookings, multi-page): online AI calculator, from 18 900 Kč. No guarantee on these.
- Not a VAT payer: prices are final. Launch typically within 10 working days.
Never invent reviews, client names, statistics or discounts.`;

const STR = { type: 'string' };
const schema = {
  type: 'object', additionalProperties: false, required: ['ads'],
  properties: { ads: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    required: ['slug', 'kicker', 'headline', 'price', 'sub', 'cta', 'primary', 'theme', 'hashtags', 'image_prompt'],
    properties: {
      slug: STR, kicker: STR, headline: STR, price: STR, sub: STR, cta: STR, primary: STR,
      theme: { type: 'string', enum: ['primary', 'accent', 'dark'] }, hashtags: STR, image_prompt: STR,
    },
  } } },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  try {
    const b = await req.json();
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
    const platform = str(b.platform, 40) || 'facebook';
    const audience = str(b.audience, 120) || 'Czech tradespeople';
    const offer = str(b.offer, 60) || 'starter';
    const tone = str(b.tone, 40) || 'direct';
    const angle = str(b.angle, 400);
    const count = Math.min(Math.max(Number(b.count) || 3, 1), 5);
    const res = await generateJson<{ ads: unknown[] }>(
      `Write ${count} distinct ${platform} adverts in natural Czech.
Audience: ${audience}. Offer focus: ${offer}. Tone: ${tone}. Extra angle: ${angle || 'none'}.
Field rules: kicker max 28 chars; headline max 40 chars; price is a short price label from the offer (e.g. "6 900 Kč" or "990 Kč/měs."); sub max 45 chars; cta max 16 chars; primary text max 125 chars; slug is lowercase-kebab ascii max 24 chars; hashtags 3-5 Czech hashtags; image_prompt in English describing a supporting photo without text. Vary hooks and themes.`,
      { instructions: OFFER, schema, schemaName: 'ads', effort: 'low' },
    );
    return json({ ok: true, ads: res.ads });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    const status = /ai_gateway_failed (\d{3})/.exec(msg)?.[1];
    const s = status ? Number(status) : 500;
    const friendly = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'Could not generate adverts. Try again.';
    return json({ ok: false, error: friendly }, s);
  }
});
