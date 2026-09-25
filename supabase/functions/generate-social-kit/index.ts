// Social share kit generator.
// Takes a blog post id (or raw title/excerpt) and returns professional,
// platform-specific captions for LinkedIn, Facebook, Instagram and TikTok.
// British English, FastMedia.Pro brand voice.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITE = 'https://www.fastmedia.pro';

interface Kit {
  linkedin: { caption: string; hashtags: string[] };
  facebook: { caption: string; hashtags: string[] };
  instagram: { caption: string; hashtags: string[] };
  tiktok: { caption: string; hashtags: string[]; hook: string; script: string[] };
  imageHeadline: string;
  imageSubline: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);

    const body = await req.json().catch(() => ({}));
    const postId: string | undefined = body.post_id;
    let title: string = typeof body.title === 'string' ? body.title : '';
    let excerpt: string = typeof body.excerpt === 'string' ? body.excerpt : '';
    let slug: string = typeof body.slug === 'string' ? body.slug : '';
    let bodyText = '';

    if (postId) {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      const { data: post, error } = await admin
        .from('blog_posts')
        .select('slug, title, excerpt, content, category, seo_keywords')
        .eq('id', postId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!post) throw new Error('Post not found');
      slug = post.slug;
      title = (post.title as Record<string, string>)?.en || title;
      excerpt = (post.excerpt as Record<string, string>)?.en || excerpt;
      const sections = ((post.content as Record<string, { sections?: Array<{ text?: string; items?: string[] }> }>)?.en?.sections) ?? [];
      bodyText = sections
        .map((s) => s.text ?? (s.items ?? []).join('. '))
        .filter(Boolean)
        .join('\n')
        .slice(0, 4000);
    }

    if (!title) throw new Error('A title is required');

    const url = slug ? `${SITE}/blog/${slug}` : SITE;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const systemPrompt = `You are the social media lead for FastMedia.Pro, a premium web design and digital studio for trades, service businesses and small companies.

Write in BRITISH ENGLISH only. Brand voice: confident, useful, specific, never hypey. Company-first voice ("we at FastMedia.Pro"), never first-person personal.

Produce platform-native copy for one blog article. Rules per platform:
- LinkedIn: 120-200 words, professional, a strong opening line, short paragraphs separated by blank lines, one clear insight, ends with a question or soft CTA and the article link. 3-5 hashtags.
- Facebook: 60-110 words, warm and plain-spoken, one benefit, ends with the link. 2-4 hashtags.
- Instagram: 80-150 words, punchy first line, line breaks, 1-2 emoji maximum, "link in bio" instead of a URL. 8-12 hashtags mixing niche and broad.
- TikTok: caption max 150 characters, a spoken hook (max 12 words) and a 5-beat spoken script (each beat one short sentence, total under 45 seconds when read aloud). 4-6 hashtags.
- imageHeadline: max 8 words for a share graphic. imageSubline: max 14 words.

Never invent statistics, awards or client names. Hashtags without the # symbol.

Return ONLY valid JSON matching exactly:
{"linkedin":{"caption":"","hashtags":[]},"facebook":{"caption":"","hashtags":[]},"instagram":{"caption":"","hashtags":[]},"tiktok":{"caption":"","hashtags":[],"hook":"","script":["","","","",""]},"imageHeadline":"","imageSubline":""}`;

    const userPrompt = `Article title: ${title}
Summary: ${excerpt}
Article URL: ${url}

Article body (for accurate detail):
${bodyText || '(not available — rely on the title and summary only)'}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errorBody = await aiRes.text();
      console.error(`AI gateway failed [${aiRes.status}]: ${errorBody}`);
      return new Response(
        JSON.stringify({ error: 'AI request failed', status: aiRes.status, details: errorBody }),
        { status: aiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('AI returned an unexpected format');
    const kit = JSON.parse(cleaned.slice(start, end + 1)) as Kit;

    return new Response(JSON.stringify({ ok: true, url, title, kit }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('generate-social-kit failed:', message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
