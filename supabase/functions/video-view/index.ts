// Public: resolves a personal video token to a short-lived signed video URL and records views.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const EVENTS = new Set(['opened', 'played', 'completed', 'cta_click'])
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token : ''
    if (!/^[a-f0-9]{24}$/.test(token)) return json({ error: 'invalid_token' }, 400)
    const event = typeof body?.event === 'string' ? body.event : 'opened'
    if (!EVENTS.has(event)) return json({ error: 'invalid_event' }, 400)

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: link } = await db
      .from('video_links')
      .select('id, recipient_label, outreach_videos(title, storage_path, thumbnail_url, cta_url)')
      .eq('token', token)
      .maybeSingle()
    if (!link) return json({ error: 'not_found' }, 404)

    // Light abuse guard: at most 60 events per link per hour.
    const { count } = await db
      .from('video_views')
      .select('id', { count: 'exact', head: true })
      .eq('link_id', link.id)
      .gt('created_at', new Date(Date.now() - 3600_000).toISOString())
    if ((count ?? 0) < 60) await db.from('video_views').insert({ link_id: link.id, event })

    if (event !== 'opened') return json({ ok: true })
    const v = (link as any).outreach_videos
    const { data: signed } = await db.storage.from('outreach-videos').createSignedUrl(v.storage_path, 60 * 60 * 3)
    return json({
      title: v.title,
      recipient: link.recipient_label,
      video_url: signed?.signedUrl ?? null,
      thumbnail_url: v.thumbnail_url,
      cta_url: v.cta_url,
    })
  } catch (e) {
    console.error('video-view failed', e)
    return json({ error: 'failed' }, 500)
  }
})
