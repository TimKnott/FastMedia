// AI Demo Generator
// Creates a brand-new trade demo (services, FAQs, calculator prompts, gallery)
// from a single prompt: trade name + (optional) icon/gradient.
// Generates a hero image and 4 gallery images and stores everything in custom_demos.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32)
}

interface DemoPayload {
  trade_id: string
  icon: string
  gradient: string
  name: { cs: string; en: string; de: string }
  tagline: { cs: string; en: string; de: string }
  description: { cs: string; en: string; de: string }
  services: Array<{
    icon: string
    title: { cs: string; en: string; de: string }
    description: { cs: string; en: string; de: string }
  }>
  faqs: Array<{
    question: { cs: string; en: string; de: string }
    answer: { cs: string; en: string; de: string }
  }>
  calculator_prompts: Array<{ cs: string; en: string; de: string }>
  hero_image_prompt: string
  gallery_image_prompts: string[]
}

async function generateDemoContent(
  tradeName: string,
  hint?: { icon?: string; gradient?: string },
): Promise<DemoPayload> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

  const systemPrompt = `You are the content engine for FastMedia.Pro. You generate complete trilingual content packages (Czech, English, German) for new "trade demo" websites — these are template sites we build for service businesses (e.g. plumbers, dentists, photographers, gyms, etc.).

Output everything in the schema, translated naturally to all three languages.

Rules:
- Czech is primary, then English, then German.
- Pick a single emoji for the icon if not provided.
- Pick a tasteful Tailwind gradient class if not provided (e.g. 'bg-gradient-to-br from-blue-500 to-cyan-400').
- Generate 6 services with concise, real titles + 1-sentence descriptions.
- Generate 6 FAQs that real customers of this trade actually ask.
- Generate 5 short "calculator prompts" — one-line ideas that this business owner could request when using our website-builder calculator (e.g. "Add an emergency call-out button", "Show booking calendar with deposit").
- hero_image_prompt: editorial photo of the trade in action, cinematic lighting, no text/logos.
- gallery_image_prompts: array of EXACTLY 4 prompts showing different aspects of the trade (workshop, customer interaction, finished work, tools/setup).
- Never mention specific software platforms, AI builders, or website tools.
- Tone: warm, professional, conversion-focused.`

  const userPrompt = `Trade: "${tradeName}"
${hint?.icon ? `Suggested icon: ${hint.icon}` : ''}
${hint?.gradient ? `Suggested gradient: ${hint.gradient}` : ''}

Generate the complete demo content package now.`

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
              name: 'publish_demo',
              description: 'Save the new trade demo content.',
              parameters: {
                type: 'object',
                properties: {
                  trade_id: {
                    type: 'string',
                    description:
                      'short lowercase id with no spaces or punctuation, e.g. "windowcleaning"',
                  },
                  icon: { type: 'string' },
                  gradient: { type: 'string' },
                  name: triLangSchema(),
                  tagline: triLangSchema(),
                  description: triLangSchema(),
                  services: {
                    type: 'array',
                    minItems: 4,
                    maxItems: 8,
                    items: {
                      type: 'object',
                      properties: {
                        icon: { type: 'string' },
                        title: triLangSchema(),
                        description: triLangSchema(),
                      },
                      required: ['icon', 'title', 'description'],
                    },
                  },
                  faqs: {
                    type: 'array',
                    minItems: 4,
                    maxItems: 8,
                    items: {
                      type: 'object',
                      properties: {
                        question: triLangSchema(),
                        answer: triLangSchema(),
                      },
                      required: ['question', 'answer'],
                    },
                  },
                  calculator_prompts: {
                    type: 'array',
                    minItems: 3,
                    maxItems: 6,
                    items: triLangSchema(),
                  },
                  hero_image_prompt: { type: 'string' },
                  gallery_image_prompts: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 4,
                    maxItems: 4,
                  },
                },
                required: [
                  'trade_id',
                  'icon',
                  'gradient',
                  'name',
                  'tagline',
                  'description',
                  'services',
                  'faqs',
                  'calculator_prompts',
                  'hero_image_prompt',
                  'gallery_image_prompts',
                ],
              },
            },
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'publish_demo' },
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
  const parsed = JSON.parse(toolCall.function.arguments) as DemoPayload
  parsed.trade_id = slugify(parsed.trade_id || tradeName)
  if (hint?.icon) parsed.icon = hint.icon
  if (hint?.gradient) parsed.gradient = hint.gradient
  return parsed
}

function triLangSchema() {
  return {
    type: 'object' as const,
    properties: {
      cs: { type: 'string' },
      en: { type: 'string' },
      de: { type: 'string' },
    },
    required: ['cs', 'en', 'de'],
  }
}

async function generateImage(prompt: string): Promise<Uint8Array | null> {
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
              content: `${prompt}. Editorial photography, cinematic lighting, no text, no logos, no watermarks, 16:9.`,
            },
          ],
          modalities: ['image', 'text'],
        }),
      },
    )

    if (!response.ok) return null

    const data = await response.json()
    const imageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url
    if (!imageUrl?.startsWith('data:image')) return null

    const base64 = imageUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  tradeId: string,
  label: string,
  bytes: Uint8Array,
): Promise<string | null> {
  const filename = `${tradeId}/${label}-${Date.now()}.png`
  const { error } = await supabase.storage
    .from('demo-images')
    .upload(filename, bytes, { contentType: 'image/png', upsert: false })
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  const { data: pub } = supabase.storage
    .from('demo-images')
    .getPublicUrl(filename)
  return pub.publicUrl
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData } = await supabaseAuth.auth.getUser()
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // role check via service client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: hasEditor } = await supabase.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'editor',
    })
    if (!hasEditor) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const tradeName = (body.tradeName || '').toString().trim()
    if (!tradeName) {
      return new Response(
        JSON.stringify({ error: 'tradeName is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('[generate-demo] for:', tradeName)

    const demo = await generateDemoContent(tradeName, {
      icon: body.icon,
      gradient: body.gradient,
    })

    // Ensure unique trade_id
    const { data: existing } = await supabase
      .from('custom_demos')
      .select('trade_id')
      .eq('trade_id', demo.trade_id)
      .maybeSingle()
    if (existing) {
      demo.trade_id = `${demo.trade_id}${Date.now().toString(36).slice(-3)}`
    }

    // Generate images in parallel
    const [heroBytes, ...galleryBytes] = await Promise.all([
      generateImage(demo.hero_image_prompt),
      ...demo.gallery_image_prompts.map((p) => generateImage(p)),
    ])

    let heroUrl: string | null = null
    if (heroBytes) {
      heroUrl = await uploadImage(supabase, demo.trade_id, 'hero', heroBytes)
    }

    const galleryUrls: string[] = []
    for (let i = 0; i < galleryBytes.length; i++) {
      const b = galleryBytes[i]
      if (!b) continue
      const url = await uploadImage(supabase, demo.trade_id, `gallery-${i}`, b)
      if (url) galleryUrls.push(url)
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('custom_demos')
      .insert({
        trade_id: demo.trade_id,
        icon: demo.icon,
        gradient: demo.gradient,
        hero_image_url: heroUrl,
        gallery_images: galleryUrls,
        name: demo.name,
        tagline: demo.tagline,
        description: demo.description,
        services: demo.services,
        faqs: demo.faqs,
        calculator_prompts: demo.calculator_prompts,
        is_active: true,
        created_by: userData.user.id,
      })
      .select('id, trade_id')
      .single()

    if (insertErr) throw insertErr

    return new Response(
      JSON.stringify({
        success: true,
        demo: inserted,
        gallery_count: galleryUrls.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('[generate-demo] error:', err)
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
