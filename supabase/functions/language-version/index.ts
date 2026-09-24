// Admin-gated: builds a market-localised language version of a FastMedia page
// from its English content. Saves as a draft for approval (never auto-published).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const sb = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

const LANGS: Record<string, string> = {
  bg: 'Bulgarian', hr: 'Croatian', cs: 'Czech', da: 'Danish', nl: 'Dutch', en: 'English', et: 'Estonian', fi: 'Finnish',
  fr: 'French', de: 'German', el: 'Greek', hu: 'Hungarian', ga: 'Irish', it: 'Italian', lv: 'Latvian', lt: 'Lithuanian',
  mt: 'Maltese', pl: 'Polish', pt: 'Portuguese', ro: 'Romanian', sk: 'Slovak', sl: 'Slovenian', es: 'Spanish', sv: 'Swedish',
};

function extract(html: string) {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const title = clean.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  const desc = clean.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? '';
  const blocks: string[] = [];
  const re = /<(h1|h2|h3|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(clean))) {
    const txt = m[2].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (txt.length > 2) blocks.push(`${m[1].toUpperCase()}: ${txt}`);
  }
  return { title, desc, text: [...new Set(blocks)].join('\n').slice(0, 14000) };
}

const schema = {
  type: 'object', additionalProperties: false,
  required: ['title', 'meta_description', 'h1', 'intro', 'sections', 'cta_label', 'review_notes'],
  properties: {
    title: { type: 'string' }, meta_description: { type: 'string' }, h1: { type: 'string' }, intro: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading', 'paragraphs', 'bullets'],
      properties: { heading: { type: 'string' }, paragraphs: { type: 'array', items: { type: 'string' } }, bullets: { type: 'array', items: { type: 'string' } } } } },
    cta_label: { type: 'string' },
    review_notes: { type: 'array', items: { type: 'string' } },
  },
};

async function generate(apiKey: string, langName: string, src: { title: string; desc: string; text: string }) {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
    body: JSON.stringify({
      model: 'openai/gpt-6-astra',
      stream: true,
      reasoning: { effort: 'low' },
      instructions: `You are a native ${langName} web copywriter and search specialist. Rewrite the given English web page as a ${langName} page written for that market (localisation, not literal translation). Keep every fact, number, price and legal limitation exactly as given; never invent facts, customers, statistics, reviews, certifications, awards or claims. Keep brand names. Answer the page's main question directly in the intro (first 2 sentences). Use the words ${langName} speakers actually type into Google and AI assistants for this topic (e.g. local terms for "creative voucher", "grant for a website", "EU funding for small business websites", "free course", "business plan template") naturally in the H1, headings and intro — never keyword-stuff. Make headings question-style where natural. Where a programme is Czech-specific (Kreativní vouchery), say so clearly and do not imply it exists in the reader's country. Use short paragraphs. Put anything a native reviewer should double-check, and the local search phrases you used, in review_notes (in English).`,
      input: `Title: ${src.title}\nDescription: ${src.desc}\n\nPage content:\n${src.text}`,
      text: { format: { type: 'json_schema', name: 'language_page', strict: true, schema } },
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text();
    const err = new Error(`AI ${res.status}: ${t.slice(0, 300)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', out = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const l of lines) {
      if (!l.startsWith('data:')) continue;
      const d = l.slice(5).trim();
      if (!d || d === '[DONE]') continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === 'response.output_text.delta') out += ev.delta ?? '';
        if (ev.type === 'response.failed' || ev.type === 'error') throw new Error(ev.response?.error?.message ?? ev.message ?? 'AI failed');
      } catch (e) { if ((e as Error).message && !(e instanceof SyntaxError)) throw e; }
    }
  }
  if (!out.trim()) throw new Error('The AI returned an empty result');
  return JSON.parse(out);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) return json({ error: 'AI key missing' }, 500);

  const body = await req.json().catch(() => ({}));
  const code = String(body.language_code ?? '').toLowerCase();
  let path = String(body.source_path ?? '/').trim();
  if (!LANGS[code]) return json({ error: 'Choose one of the 24 EU languages' }, 400);
  if (!path.startsWith('/') || path.length > 200 || path.includes('..')) return json({ error: 'Invalid page path' }, 400);

  try {
    const pageRes = await fetch(`https://www.fastmedia.pro${path}`, { headers: { 'Accept-Language': 'en-GB', 'User-Agent': 'FastMediaLanguageBot/1.0' } });
    if (!pageRes.ok) return json({ error: `Could not read ${path} (${pageRes.status})` }, 400);
    const src = extract(await pageRes.text());
    if (src.text.length < 80) return json({ error: 'That page has too little text to adapt' }, 400);

    const g = await generate(apiKey, LANGS[code], src);
    const slug = path === '/' ? 'home' : path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9/-]/gi, '-').toLowerCase();
    const { data, error } = await sb.from('language_versions').upsert({
      language_code: code, language_name: LANGS[code], source_path: path, slug,
      title: g.title, meta_description: g.meta_description,
      content: { h1: g.h1, intro: g.intro, sections: g.sections, cta_label: g.cta_label, review_notes: g.review_notes },
      status: 'draft', approved_at: null, approved_by: null, published_at: null,
    }, { onConflict: 'language_code,slug' }).select().single();
    if (error) throw error;
    return json({ ok: true, version: data });
  } catch (e) {
    const status = (e as { status?: number }).status;
    return json({ error: (e as Error).message }, status && status >= 400 && status < 600 ? status : 500);
  }
});
