// LinkedIn Story Studio — plans story ideas with questions for the founder,
// and writes 8–12 line story posts ONLY from the founder's own answers.
// Never publishes anything; admin approval happens in the back office.
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CONTEXT = `Author: Tim Knott, founder of FastMedia.Pro (www.fastmedia.pro).
FastMedia.Pro builds fast, high-end websites, AI lead assistants, booking systems and SEO for tradespeople and small service businesses, working across the UK and the Czech Republic.
Audience on LinkedIn: owners of trades and small service businesses, plus marketers and founders.
Write in British English. Calm, direct, warm, specific, human. First person.`;

const RULES = `Hard rules:
- Never invent personal experiences, customers, names, quotes, revenue, results, dates, credentials, statistics, emotions or conversations.
- Use only facts present in the founder's answers. If something important is missing, write [NEEDS DETAIL] and list a question.
- Content mix across a plan: about 65% expertise/customer problem, 25% personal values, 10% promotional.
- Never start with "Here are 5 lessons", "Let me tell you", "In today's fast-paced world", "As an entrepreneur", "Success is not about", "The truth is", "I am excited to announce", "This is your reminder".
- Never use: unlock your potential, transform your business, take it to the next level, game-changer, secret formula, hustle harder, make an impact, elevate your brand.`;

const STR = { type: 'string' };
const STRS = { type: 'array', items: STR };

const planSchema = {
  type: 'object', additionalProperties: false, required: ['ideas'],
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['title', 'story_type', 'purpose', 'angle', 'suggested_hook', 'questions'],
        properties: {
          title: STR,
          story_type: { type: 'string', enum: ['service', 'industry', 'personal', 'customer', 'failure', 'decision', 'observation'] },
          purpose: STR, angle: STR, suggested_hook: STR, questions: STRS,
        },
      },
    },
  },
};

const score = { type: 'object', additionalProperties: false, required: ['name', 'score'], properties: { name: STR, score: { type: 'integer' } } };
const draftSchema = {
  type: 'object', additionalProperties: false,
  required: ['purpose', 'audience', 'angle', 'why_it_matters', 'pyramid', 'post', 'version_a', 'version_b', 'alternate_hooks', 'image', 'cta', 'quality', 'warnings', 'claims_to_verify', 'anonymise', 'missing_questions', 'editing_notes'],
  properties: {
    purpose: STR, audience: STR, angle: STR, why_it_matters: STR,
    pyramid: { type: 'object', additionalProperties: false, required: ['exposition', 'rising_action', 'climax', 'falling_action', 'resolution'], properties: { exposition: STR, rising_action: STR, climax: STR, falling_action: STR, resolution: STR } },
    post: STR, version_a: STR, version_b: STR, alternate_hooks: STRS,
    image: { type: 'object', additionalProperties: false, required: ['type', 'text', 'description', 'why', 'layout', 'alt', 'prompt'], properties: { type: { type: 'string', enum: ['text_card', 'personal_photo', 'illustration', 'evidence'] }, text: STR, description: STR, why: STR, layout: STR, alt: STR, prompt: STR } },
    cta: STR,
    quality: { type: 'array', items: score },
    warnings: STRS, claims_to_verify: STRS, anonymise: STRS, missing_questions: STRS, editing_notes: STRS,
  },
};

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  try {
    const body = await req.json();
    if (body.action === 'plan') {
      const count = Math.min(Math.max(Number(body.count) || 10, 1), 30);
      const existing: string[] = Array.isArray(body.existing_titles) ? body.existing_titles.slice(0, 80) : [];
      const res = await generateJson<{ ideas: unknown[] }>(
        `Plan the next ${count} LinkedIn story ideas for this founder. Each idea must be a story the founder can only tell from his own memory, so give 4–6 specific, open questions that draw out the real situation, what he wanted, the obstacle, the turning point, the result and what he believes now. Do not presume any answer. Avoid repeating these existing ideas: ${existing.join(' | ') || 'none'}. Suggested hooks must be placeholders that the founder's answers can make true, never a stated fact.`,
        { instructions: `${CONTEXT}\n${RULES}`, schema: planSchema, schemaName: 'story_plan', effort: 'low' },
      );
      return json({ ok: true, ideas: res.ideas });
    }
    if (body.action === 'draft') {
      const qa = (body.questions ?? []).filter((x: { a?: string }) => x?.a?.trim())
        .map((x: { q: string; a: string }) => `Q: ${x.q}\nA: ${x.a}`).join('\n\n');
      if (!qa && !body.notes?.trim()) return json({ ok: false, error: 'Answer at least one question first — the story must come from your own experience.' }, 400);
      const draft = await generateJson(
        `Story idea: ${body.title}\nType: ${body.story_type}\nAngle: ${body.angle ?? ''}\n\nThe founder's own words:\n${qa}\n\nExtra notes: ${body.notes ?? ''}\n\nWrite the post using a compressed Freytag pyramid (exposition, rising action, climax, falling action, resolution). The post is 8–12 lines, one short thought per line, a blank line between lines, hook first, story before lesson, at most one call to action and only if it fits. Version A more personal and conversational, Version B more authoritative and business-focused — same facts only. Image: prefer a text card of 3–8 words that complements (not repeats) the first line; give a 1:1 image-generation prompt without text. Score these 12 items 1–5: Hook strength, Clarity, Specificity, Human feel, Story movement, Emotional interest, Relevance to audience, Credibility, Lesson quality, Ease of reading, Visual fit, Call-to-action fit. List honest warnings.`,
        { instructions: `${CONTEXT}\n${RULES}`, schema: draftSchema, schemaName: 'story_draft', effort: 'medium' },
      );
      return json({ ok: true, draft });
    }
    return json({ ok: false, error: 'Unknown action' }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('story-studio failed:', msg);
    const status = /ai_gateway_failed (402|429|403)/.exec(msg)?.[1];
    return json({ ok: false, error: status === '402' ? 'AI credits have run out — top up in Settings → Plans & credits.' : status === '429' ? 'Too many requests — wait a minute and try again.' : msg }, status ? Number(status) : 500);
  }
});
