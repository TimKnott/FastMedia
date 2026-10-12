// Creative Director chat for the Video Studio. Admin only. Text-only (cheap).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const concept = {
  type: 'object', additionalProperties: false,
  required: ['title', 'style', 'hook', 'subtitles', 'cta', 'badge', 'badgeShape', 'musicPrompt', 'videoPrompt', 'flexclipTip'],
  properties: {
    title: { type: 'string' }, style: { type: 'string' }, hook: { type: 'string' },
    subtitles: { type: 'array', items: { type: 'string' } }, cta: { type: 'string' }, badge: { type: 'string' },
    badgeShape: { type: 'string', enum: ['circle', 'pill', 'ribbon'] },
    musicPrompt: { type: 'string' }, videoPrompt: { type: 'string' }, flexclipTip: { type: 'string' },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  try {
    const b = await req.json();
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-12)
      .map((m: { role?: string; content?: string }) => `${m.role === 'assistant' ? 'Director' : 'Owner'}: ${String(m.content ?? '').slice(0, 1500)}`);
    if (!msgs.length) return json({ ok: false, error: 'Write a message first.' }, 400);
    let site = 'FastMedia.Pro web design (Czech Republic)';
    if (typeof b.siteId === 'string') {
      const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data } = await sb.from('business_sites').select('name,url,description').eq('id', b.siteId).maybeSingle();
      if (data) site = `${data.name} ${data.url ?? ''} — ${data.description}`;
    }
    const format = ['9:16', '1:1', '16:9'].includes(b.format) ? b.format : '9:16';
    const res = await generateJson<{ reply: string; concepts: unknown[] }>(
      `Brand: ${site}\nVideo format: ${format}\nConversation:\n${msgs.join('\n')}\n\nReply as the Director.`,
      {
        instructions: 'You are a friendly creative director for short social and display video adverts. Reply in English in "reply" (short, practical, ask one useful question if needed). When useful, give 0-3 concepts with different styles (e.g. problem-solution, price comparison, behind the scenes, UGC, cinematic). On-screen texts (hook, subtitles, cta, badge) must be in natural Czech, hook max 6 words, badge max 3 words. Use only facts the owner or brand description gives — never invent prices, reviews, statistics or discounts; if a price is unknown leave badge generic. videoPrompt: an English prompt the owner can paste into FlexClip AI video. musicPrompt: an English description for FlexClip AI music. flexclipTip: one short tip. Remind the owner that uploading their own FlexClip video and music costs nothing here.',
        schema: { type: 'object', additionalProperties: false, required: ['reply', 'concepts'], properties: { reply: { type: 'string' }, concepts: { type: 'array', items: concept } } },
        schemaName: 'director', effort: 'low',
      },
    );
    return json({ ok: true, ...res });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    const s = Number(/ai_gateway_failed (\d{3})/.exec(msg)?.[1] ?? 500);
    const friendly = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'The director could not answer. Try again.';
    return json({ ok: false, error: friendly }, s);
  }
});
