// AI Blog Post Generator
// Generates a single English (British English) blog post about web design / online business
// for FastMedia.Pro's audience (tradespeople, small businesses, service providers).
// Saves the result as a 'draft' for admin approval.
//
// Note: the blog_posts.title/excerpt/content columns are jsonb keyed by language.
// We write the same English copy under the cs/en/de keys so legacy readers keep working,
// but only English is ever generated or shown.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TOPICS = [
  'choosing the right colour palette for a service business website',
  'why fast page-load times convert more customers',
  'mobile-first design for trade and service websites',
  'how customer reviews build trust on a homepage',
  'simple SEO wins for local service businesses',
  'using high-quality photography to stand out online',
  'writing service pages that actually convert',
  'why every service website needs an online booking widget',
  'before-and-after galleries that win jobs',
  'how to design a homepage hero that grabs attention in 3 seconds',
  'the role of social proof in service website conversion',
  'accessible web design for older customers',
  'website navigation patterns that reduce bounce rate',
  'using video on a service business landing page',
  'what makes a great about-us page',
  'how website speed impacts Google rankings for local businesses',
  'designing pricing pages that build confidence',
  'micro-animations that delight visitors without slowing down a site',
  'building a portfolio section that closes deals',
  'using AI assistants and chatbots on a small business website',
]

function pickTopic(seed?: string) {
  if (seed) return seed
  const idx = Math.floor(Math.random() * TOPICS.length)
  return TOPICS[idx]
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

interface ArticlePayload {
  slug: string
  category: string
  read_time_minutes: number
  tags: string[]
  hero_image_prompt: string
  title: string
  excerpt: string
  sections: Array<{ type: string; text?: string; items?: string[] }>
}

async function generateArticle(topic: string): Promise<ArticlePayload> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

  const systemPrompt = `You are the editorial AI for FastMedia.Pro, a high-end web design and digital agency that builds beautiful, conversion-focused websites for tradespeople, service businesses, and small companies (plumbers, photographers, salons, gyms, dentists, gardeners, etc.).

Your job: write a single, beautifully crafted blog article on the given topic, in BRITISH ENGLISH only.

LANGUAGE RULES (strict):
- Use British English spelling throughout (colour, optimise, organisation, behaviour, centre, analyse, programme, licence, traveller, recognise, customise, personalise, etc.).
- Use British vocabulary and phrasing where it differs from American (e.g. "mobile" not "cell", "high street" not "main street", "shop" not "store", "CV" not "resume", "tradesperson" not "contractor" where appropriate).
- Use single quotes for inline quotations and the Oxford comma sparingly, in line with British editorial style.
- Do NOT include any Czech or German text. Do NOT translate. English only.

CONTENT RULES:
- Never mention specific website-building tools, AI builders, or platform names (no Lovable, Base44, Wix, Squarespace, WordPress, Webflow, etc.).
- Never mention "AI builders" or "no-code" platforms.
- Speak about web design principles, what good websites do for businesses, customer psychology, conversion, SEO, photography, branding — focused on the END RESULT for a small business owner.
- Tone: warm, expert, modern, encouraging — not salesy.
- Length: 600–900 words. Use 4–6 short H2 sections, 1–2 short bulleted lists, plus paragraphs.
- Include a friendly, specific title (not generic clickbait) and a single-sentence excerpt.
- Pick a category from: webdesign | seo | marketing | business | tips
- Suggest 3–5 lowercase tags.
- Suggest a vivid hero_image_prompt for an image generator: editorial-quality photo, a real-life scene of a tradesperson or small business owner using a beautiful website on a device, or an environment shot — no text, no logos, cinematic lighting.`

  const userPrompt = `Topic: ${topic}

Generate the article now using the provided schema. Output content sections as an array of objects: { "type": "paragraph", "text": "..." } or { "type": "heading", "text": "..." } or { "type": "list", "items": ["...", "..."] }. Keep paragraphs reasonably short (2–4 sentences). Remember: British English only.`

  const response = await fetch(
    'https://ai.gateway.lovable.dev/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'publish_article',
              description: 'Publish a fully-written British English blog article.',
              parameters: {
                type: 'object',
                properties: {
                  slug: {
                    type: 'string',
                    description: 'URL slug (lowercase, dash-separated)',
                  },
                  category: {
                    type: 'string',
                    enum: ['webdesign', 'seo', 'marketing', 'business', 'tips'],
                  },
                  read_time_minutes: { type: 'integer', minimum: 3, maximum: 12 },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 3,
                    maxItems: 5,
                  },
                  hero_image_prompt: { type: 'string' },
                  title: { type: 'string', description: 'British English title' },
                  excerpt: { type: 'string', description: 'Single-sentence British English excerpt' },
                  sections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['paragraph', 'heading', 'list'],
                        },
                        text: { type: 'string' },
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                      required: ['type'],
                    },
                  },
                },
                required: [
                  'slug',
                  'category',
                  'read_time_minutes',
                  'tags',
                  'hero_image_prompt',
                  'title',
                  'excerpt',
                  'sections',
                ],
              },
            },
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'publish_article' },
        },
      }),
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI Gateway error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]
  if (!toolCall?.function?.arguments) {
    throw new Error('AI did not return a tool call')
  }
  const parsed = JSON.parse(toolCall.function.arguments) as ArticlePayload
  parsed.slug = slugify(parsed.slug || parsed.title)
  return parsed
}

async function generateHeroImage(prompt: string): Promise<Uint8Array | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) return null

  try {
    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            {
              role: 'user',
              content: `${prompt}. Editorial photography, cinematic lighting, 16:9 aspect, no text, no logos, no watermarks.`,
            },
          ],
          modalities: ['image', 'text'],
        }),
      },
    )

    if (!response.ok) {
      console.error('Image gen failed:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const imageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url
    if (!imageUrl?.startsWith('data:image')) return null

    const base64 = imageUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch (e) {
    console.error('Image generation error:', e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let body: { topic?: string; autoPublish?: boolean } = {}
    try {
      body = await req.json()
    } catch {
      // empty body is ok (cron call)
    }
    const topic = pickTopic(body.topic)
    const autoPublish = body.autoPublish === true

    console.log('[generate-blog-post] topic:', topic)

    const article = await generateArticle(topic)

    // Ensure unique slug
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', article.slug)
      .maybeSingle()
    if (existing) {
      article.slug = `${article.slug}-${Date.now().toString(36).slice(-4)}`
    }

    // Hero image
    let heroUrl: string | null = null
    const imageBytes = await generateHeroImage(article.hero_image_prompt)
    if (imageBytes) {
      const filename = `${article.slug}-${Date.now()}.png`
      const { error: uploadErr } = await supabase.storage
        .from('blog-images')
        .upload(filename, imageBytes, {
          contentType: 'image/png',
          upsert: false,
        })
      if (!uploadErr) {
        const { data: pub } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filename)
        heroUrl = pub.publicUrl
      } else {
        console.error('Upload error:', uploadErr)
      }
    }

    // Mirror the British-English copy into the legacy cs/de keys so existing
    // readers (which may still look up either key) always see the same English text.
    const titleJson = { cs: article.title, en: article.title, de: article.title }
    const excerptJson = { cs: article.excerpt, en: article.excerpt, de: article.excerpt }
    const contentJson = {
      cs: { sections: article.sections },
      en: { sections: article.sections },
      de: { sections: article.sections },
    }

    // Insert as draft (or published if requested)
    const { data: inserted, error: insertErr } = await supabase
      .from('blog_posts')
      .insert({
        slug: article.slug,
        category: article.category,
        read_time_minutes: article.read_time_minutes,
        tags: article.tags,
        hero_image_url: heroUrl,
        title: titleJson,
        excerpt: excerptJson,
        content: contentJson,
        ai_generated: true,
        status: autoPublish ? 'published' : 'draft',
        published_at: autoPublish ? new Date().toISOString() : null,
      })
      .select('id, slug, status')
      .single()

    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({
        success: true,
        post: inserted,
        topic,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('[generate-blog-post] error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
