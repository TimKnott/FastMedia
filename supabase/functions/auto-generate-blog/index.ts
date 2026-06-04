// Auto-generates an SEO-optimised blog post every 3 days.
// Saves as draft with approval_status='pending_review', emails admin, and triggers TTS.
// Public (no JWT) – callable from pg_cron and from authenticated admin via seo-run-now.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFY_TO = 'support@fastmedia.pro';
const SITE_URL = 'https://fastmedia.pro';

const TOPIC_POOL = [
  'local SEO wins for tradespeople in 2026',
  'building Google E-E-A-T signals as a small service business',
  'Core Web Vitals: practical fixes for service websites',
  'AI-powered content strategy for niche service brands',
  'voice search optimisation for "near me" queries',
  'structured data that actually drives rich results',
  'turning a slow WordPress site into a fast Lovable site',
  'capturing more leads with a conversational quote calculator',
  'using FAQ schema to win featured snippets',
  'video SEO: how to rank YouTube embeds on service pages',
  'photography & visual identity for boutique service firms',
  'how to write service pages that rank and convert',
  'GA4 reports every service business should check weekly',
  'building trust with credentials, awards, and case studies online',
  'mobile UX patterns that reduce bounce on service sites',
  'using HowTo schema for tutorial blog posts',
  'long-tail keyword discovery without expensive tools',
  'internal linking strategies for small content libraries',
  'image SEO: alt text, dimensions, and Core Web Vitals',
  'building a content calendar around real customer questions',
];

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function pickTopic(recentSlugs: Set<string>, recentTags: Set<string>) {
  const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5);
  for (const t of shuffled) {
    const slug = slugify(t);
    if (recentSlugs.has(slug)) continue;
    const words = new Set(t.toLowerCase().split(/\s+/));
    const overlap = [...recentTags].filter(tag => words.has(tag.toLowerCase())).length;
    if (overlap < 2) return t;
  }
  return shuffled[0];
}

async function logRun(admin: ReturnType<typeof createClient>, fields: Record<string, unknown>) {
  await admin.from('blog_generation_log').insert(fields);
}

async function sendEmail(subject: string, html: string) {
  const apiKey = Deno.env.get('MAILGUN_API_KEY');
  const domain = Deno.env.get('MAILGUN_DOMAIN') ?? 'notify.fastmedia.pro';
  if (!apiKey) { console.warn('MAILGUN_API_KEY missing — skipping admin email'); return { skipped: true }; }
  const form = new FormData();
  form.append('from', `FastMedia Editorial <editor@${domain}>`);
  form.append('to', NOTIFY_TO);
  form.append('subject', subject);
  form.append('html', html);
  const tryHost = async (host: string) => fetch(`https://${host}/v3/${domain}/messages`, {
    method: 'POST', headers: { Authorization: 'Basic ' + btoa(`api:${apiKey}`) }, body: form,
  });
  let res = await tryHost('api.eu.mailgun.net');
  if (!res.ok) res = await tryHost('api.mailgun.net');
  return { ok: res.ok, status: res.status };
}

interface ArticleJSON {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  seo_keywords: string[];
  hero_image_prompt: string;
  read_time_minutes: number;
  sections: Array<{ type: 'paragraph' | 'heading' | 'list'; text?: string; items?: string[] }>;
  faq: Array<{ question: string; answer: string }>;
  howto?: { name: string; description: string; steps: Array<{ name: string; text: string }> };
}

async function generateArticle(topic: string): Promise<ArticleJSON> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

  const sys = `You are the senior SEO editor for FastMedia.Pro — a high-end web design studio serving tradespeople, service businesses, and small brands.
Write British English only. Use Oxford-style punctuation and concrete, expert examples.
Optimise for Google E-E-A-T, featured snippets, and AI Overviews.
Return ONLY valid JSON matching the requested schema — no markdown fences, no commentary.`;

  const user = `Write a unique, evergreen blog article about: "${topic}".
Requirements:
- 900-1300 words across 6-10 sections (mix of headings, paragraphs, and 1-2 lists).
- Lead with the most valuable insight (skimmable, Google AI Overview friendly).
- Include 4-6 SEO keywords naturally (target keyword + variations + 1-2 long-tail).
- Include 4 FAQs (question + 30-60 word answers) — used for FAQPage schema.
- If the topic is procedural, include a HowTo block with 4-7 numbered steps; otherwise omit "howto".
- Hero image prompt should be photoreal, on-brand for a UK service business.
- read_time_minutes = round(words / 220).

Return JSON:
{
  "title": "Compelling H1, <=70 chars, contains target keyword",
  "slug": "kebab-case-slug-from-title",
  "excerpt": "1-2 sentence meta description, <=160 chars",
  "category": "seo | web-design | marketing | small-business",
  "tags": ["3-6 short tags"],
  "seo_keywords": ["target keyword", "variation 1", "long-tail 1", ...],
  "hero_image_prompt": "photoreal scene…",
  "read_time_minutes": 6,
  "sections": [
    { "type": "heading", "text": "…" },
    { "type": "paragraph", "text": "…" },
    { "type": "list", "items": ["…", "…"] }
  ],
  "faq": [
    { "question": "…?", "answer": "…" }
  ],
  "howto": { "name": "…", "description": "…", "steps": [{ "name": "Step 1", "text": "…" }] }
}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LOVABLE_API_KEY}` },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error('AI rate limit (429)');
    if (res.status === 402) throw new Error('AI credits exhausted (402)');
    throw new Error(`AI request failed ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned empty content');
  return JSON.parse(content) as ArticleJSON;
}

function buildFAQSchema(faqs: ArticleJSON['faq']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function buildHowToSchema(h?: ArticleJSON['howto']) {
  if (!h) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: h.name,
    description: h.description,
    step: h.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Auth gate: only pg_cron / admins may trigger AI generation.
  // Accept either the service role key or an explicit CRON_SECRET if configured.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const cronSecret = Deno.env.get('CRON_SECRET') ?? '';
  const allowed = token.length > 0 && (token === serviceRoleKey || (cronSecret && token === cronSecret));
  if (!allowed) {
    // Validate it is at least a signed Supabase JWT for an admin user before
    // allowing manual triggers from the admin UI (e.g. seo-run-now).
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await supabaseUser.auth.getClaims(token);
    const uid = claims?.claims?.sub;
    let isAdmin = false;
    if (uid) {
      const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data: roleOk } = await adminClient.rpc('has_role', { _user_id: uid, _role: 'editor' });
      isAdmin = roleOk === true;
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: logRow } = await admin.from('blog_generation_log').insert({ status: 'running' }).select('id').single();
  const logId = (logRow as { id?: string } | null)?.id;

  try {
    // Get recent slugs / tags to avoid duplication
    const { data: recent } = await admin.from('blog_posts').select('slug, tags, title')
      .order('created_at', { ascending: false }).limit(40);
    const recentSlugs = new Set<string>();
    const recentTags = new Set<string>();
    (recent ?? []).forEach((p: { slug: string; tags?: string[] }) => {
      recentSlugs.add(p.slug);
      (Array.isArray(p.tags) ? p.tags : []).forEach((t: string) => recentTags.add(t));
    });

    const topic = pickTopic(recentSlugs, recentTags);
    const article = await generateArticle(topic);

    // De-dupe slug
    let finalSlug = slugify(article.slug || article.title);
    let n = 1;
    while (recentSlugs.has(finalSlug)) { n++; finalSlug = `${slugify(article.slug || article.title)}-${n}`; if (n > 9) break; }

    const faqSchema = buildFAQSchema(article.faq || []);
    const howtoSchema = buildHowToSchema(article.howto);
    const wordCount = article.sections.reduce((a, s) => a + ((s.text ?? '').split(/\s+/).length + (s.items?.join(' ').split(/\s+/).length ?? 0)), 0);
    const readTime = article.read_time_minutes || Math.max(2, Math.round(wordCount / 220));

    const titleObj = { cs: article.title, en: article.title, de: article.title };
    const excerptObj = { cs: article.excerpt, en: article.excerpt, de: article.excerpt };
    const contentObj = {
      cs: { sections: article.sections },
      en: { sections: article.sections },
      de: { sections: article.sections },
    };

    const { data: inserted, error: insertErr } = await admin.from('blog_posts').insert({
      slug: finalSlug,
      category: article.category || 'web-design',
      title: titleObj,
      excerpt: excerptObj,
      content: contentObj,
      tags: article.tags || [],
      ai_generated: true,
      auto_generated: true,
      status: 'draft',
      approval_status: 'pending_review',
      author: 'FastMedia Editorial AI',
      read_time_minutes: readTime,
      seo_keywords: article.seo_keywords || [],
      faq_schema: faqSchema,
      howto_schema: howtoSchema,
      generation_metadata: { topic, model: 'google/gemini-2.5-flash', word_count: wordCount, hero_image_prompt: article.hero_image_prompt },
    }).select('id, slug').single();
    if (insertErr) throw insertErr;
    const postId = (inserted as { id: string }).id;

    // Trigger TTS in background
    admin.functions.invoke('blog-tts', { body: { post_id: postId } }).catch((e) => console.error('blog-tts trigger failed:', e));

    // Email admin
    const reviewUrl = `${SITE_URL}/admin/blog-manage`;
    await sendEmail(
      `📝 Blog draft awaiting review: ${article.title}`,
      `<div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="color:#0f3a7a;margin:0 0 12px">New auto-generated draft</h2>
        <p style="margin:0 0 8px"><strong>${article.title}</strong></p>
        <p style="color:#555;margin:0 0 16px">${article.excerpt}</p>
        <p style="margin:0 0 4px"><strong>Topic:</strong> ${topic}</p>
        <p style="margin:0 0 4px"><strong>Read time:</strong> ${readTime} min · <strong>Words:</strong> ${wordCount}</p>
        <p style="margin:0 0 16px"><strong>Keywords:</strong> ${(article.seo_keywords || []).join(', ')}</p>
        <p><a href="${reviewUrl}" style="display:inline-block;background:#0f3a7a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Review and approve →</a></p>
        <p style="color:#888;font-size:12px;margin-top:24px">Audio narration is being generated in the background. The post will only go live after you approve it.</p>
      </div>`
    );

    if (logId) await admin.from('blog_generation_log').update({
      status: 'success', completed_at: new Date().toISOString(),
      topic, post_id: postId, model: 'google/gemini-2.5-flash',
      keyword: (article.seo_keywords || [])[0] ?? null,
    }).eq('id', logId);

    return new Response(JSON.stringify({ ok: true, post_id: postId, slug: finalSlug, topic }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('auto-generate-blog error:', msg);
    if (logId) await admin.from('blog_generation_log').update({
      status: 'failed', completed_at: new Date().toISOString(), error: msg,
    }).eq('id', logId);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
