// Generates ElevenLabs voiceover for a blog post and uploads MP3 to blog-audio bucket.
// Supports two modes:
//   1) { post_id }        — pulls content from blog_posts table (DB-managed posts)
//   2) { slug, text }     — uses provided narration text, keyed by slug (static posts)
// Returns cached audio if already generated. Cost-optimised: eleven_turbo_v2_5, ≤4500 chars.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah
const MAX_CHARS = 4500;

function buildNarrationFromPost(post: { title?: Record<string, string>; excerpt?: Record<string, string>; content?: Record<string, { sections: Array<{ type: string; text?: string; items?: string[] }> }> }) {
  const lang = 'en';
  const title = post.title?.[lang] ?? '';
  const excerpt = post.excerpt?.[lang] ?? '';
  const sections = post.content?.[lang]?.sections ?? [];
  const body: string[] = [];
  for (const s of sections) {
    if (s.type === 'heading' && s.text) body.push(`${s.text}.`);
    else if (s.type === 'paragraph' && s.text) body.push(s.text);
    else if (s.type === 'list' && Array.isArray(s.items)) body.push(s.items.join('. ') + '.');
  }
  return clip([title + '.', excerpt, ...body].filter(Boolean).join(' '));
}

function clip(text: string) {
  if (text.length > MAX_CHARS) return text.slice(0, MAX_CHARS).replace(/\s+\S*$/, '') + '…';
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured');

    // AuthN/AuthZ: only admins, service-role, or the internal CRON_SECRET may
    // trigger TTS generation. This prevents anonymous abuse of the paid
    // ElevenLabs quota. Public visitors can still play pre-generated audio via
    // the cached `audio_url` column exposed to the client.
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const cronSecret = req.headers.get('x-cron-secret') ?? '';
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

    let authorized = false;
    if (bearer && bearer === SERVICE_ROLE) authorized = true;
    else if (CRON_SECRET && cronSecret && cronSecret === CRON_SECRET) authorized = true;
    else if (bearer) {
      const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: claims } = await userClient.auth.getClaims(bearer);
      const uid = claims?.claims?.sub;
      if (uid) {
        const adminCheck = createClient(Deno.env.get('SUPABASE_URL')!, SERVICE_ROLE);
        const { data: isAdmin } = await adminCheck.rpc('has_role', { _user_id: uid, _role: 'admin' });
        if (isAdmin) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { post_id, slug, text } = body as { post_id?: string; slug?: string; text?: string };

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, SERVICE_ROLE);

    let narration = '';
    let storagePath = '';
    let dbPostId: string | null = null;

    if (post_id) {
      const { data: post, error: pErr } = await admin.from('blog_posts').select('id, slug, title, excerpt, content, audio_url').eq('id', post_id).single();
      if (pErr || !post) throw new Error(pErr?.message || 'Post not found');
      if (post.audio_url) {
        return new Response(JSON.stringify({ ok: true, audio_url: post.audio_url, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      narration = buildNarrationFromPost(post as any);
      storagePath = `posts/${post_id}.mp3`;
      dbPostId = post.id;
    } else if (slug && text) {
      narration = clip(text);
      storagePath = `static/${slug.replace(/[^a-z0-9-]/gi, '-')}.mp3`;
    } else {
      throw new Error('Provide either post_id or { slug, text }');
    }

    if (!narration.trim()) throw new Error('Empty narration');

    // Check cache in storage for static slug mode
    if (!post_id) {
      const { data: existing } = await admin.storage.from('blog-audio').list(storagePath.split('/')[0], { search: storagePath.split('/')[1] });
      if (existing && existing.find((f) => f.name === storagePath.split('/')[1])) {
        const { data: pub } = admin.storage.from('blog-audio').getPublicUrl(storagePath);
        return new Response(JSON.stringify({ ok: true, audio_url: pub.publicUrl, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: narration,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true, speed: 1.0 },
        }),
      },
    );
    if (!ttsRes.ok) {
      const errBody = await ttsRes.text();
      throw new Error(`ElevenLabs ${ttsRes.status}: ${errBody.slice(0, 200)}`);
    }
    const mp3 = new Uint8Array(await ttsRes.arrayBuffer());

    const { error: upErr } = await admin.storage.from('blog-audio').upload(storagePath, mp3, {
      contentType: 'audio/mpeg', upsert: true, cacheControl: '604800',
    });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from('blog-audio').getPublicUrl(storagePath);
    const audioUrl = pub.publicUrl;

    if (dbPostId) {
      await admin.from('blog_posts').update({
        audio_url: audioUrl, audio_generated_at: new Date().toISOString(),
      }).eq('id', dbPostId);
    }

    return new Response(JSON.stringify({ ok: true, audio_url: audioUrl, chars: narration.length, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('blog-tts error:', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
