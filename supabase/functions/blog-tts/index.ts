// Generates ElevenLabs voiceover for a blog post and uploads MP3 to blog-audio bucket.
// Cost-optimised: uses eleven_turbo_v2_5 (cheapest tier) and truncates narration to ~4500 chars.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// "Sarah" — natural narration voice
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const MAX_CHARS = 4500;

function buildNarration(post: { title?: Record<string, string>; excerpt?: Record<string, string>; content?: Record<string, { sections: Array<{ type: string; text?: string; items?: string[] }> }> }) {
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
  let text = [title + '.', excerpt, ...body].filter(Boolean).join(' ');
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS).replace(/\s+\S*$/, '') + '…';
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured');

    const { post_id } = await req.json().catch(() => ({}));
    if (!post_id) throw new Error('post_id required');

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: post, error: pErr } = await admin.from('blog_posts').select('id, slug, title, excerpt, content').eq('id', post_id).single();
    if (pErr || !post) throw new Error(pErr?.message || 'Post not found');

    const narration = buildNarration(post as any);
    if (!narration.trim()) throw new Error('Empty narration');

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

    const path = `posts/${post_id}.mp3`;
    const { error: upErr } = await admin.storage.from('blog-audio').upload(path, mp3, {
      contentType: 'audio/mpeg', upsert: true, cacheControl: '604800',
    });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from('blog-audio').getPublicUrl(path);
    const audioUrl = pub.publicUrl + `?v=${Date.now()}`;

    const { error: updErr } = await admin.from('blog_posts').update({
      audio_url: audioUrl, audio_generated_at: new Date().toISOString(),
    }).eq('id', post_id);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true, audio_url: audioUrl, chars: narration.length }), {
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
