// FastMedia voice agent — Twilio webhook.
// Handles inbound calls (answer, converse, forward to staff), outbound campaign
// calls, and call-status callbacks. Speaks Czech / English / German.
// Twilio must be configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_PHONE_NUMBER) before live calls work; until then the webhook answers
// with a polite "not configured" message so nothing errors loudly.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') ?? '';
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') ?? '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

const twiml = (inner: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, {
    headers: { 'Content-Type': 'text/xml' },
  });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function loadSettings() {
  const { data } = await sb.from('voice_settings').select('*').eq('id', 1).maybeSingle();
  return data ?? { enabled: false, monthly_minute_cap: 120, minutes_used: 0, forward_to_number: '+420797864432', elevenlabs_voice_id: 'onwK4e9ZLuTAKqWW03F9' };
}

function budgetExhausted(s: { monthly_minute_cap: number; minutes_used: number; usage_month?: string }): boolean {
  const month = new Date().toISOString().slice(0, 7);
  if (s.usage_month && s.usage_month !== month) return false; // new month resets
  return Number(s.minutes_used) >= Number(s.monthly_minute_cap);
}

const SYSTEM_PROMPT = `You are the FastMedia.Pro telephone assistant — a warm, natural human-sounding receptionist for a Czech web-design studio run by Timothy Knott (Louny, Ústí nad Labem region).
Rules:
- Detect the caller's language (Czech, English or German) and reply ONLY in that language.
- Keep every reply under 40 words — this is spoken aloud on a phone call.
- You help with: website prices (direct to the 60-second AI calculator on fastmedia.pro), services, the EU/Kreativní vouchery grant (up to 85% contribution), booking a consultation, and taking a message.
- Never invent prices, dates or promises. If unsure, offer to take a message or pass the call to Tim.
- If the caller asks for a human, is upset, or the topic is a complaint, legal matter or an existing-client emergency, reply with exactly: FORWARD
- If the caller says goodbye or the matter is resolved, end your reply with the token: [HANGUP]
- Output only the spoken reply (plus optional token). No markdown, no stage directions.`;

async function aiReply(history: { role: string; text: string }[], callerText: string): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map((t) => ({ role: t.role === 'agent' ? 'assistant' : 'user', content: t.text })),
    { role: 'user', content: callerText },
  ];
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LOVABLE_API_KEY}` },
    body: JSON.stringify({ model: 'google/gemini-3-flash-preview', messages, max_tokens: 120 }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? '').trim();
}

/** Generate an MP3 with ElevenLabs, store it, return a signed URL Twilio can play. Falls back to null. */
async function speak(text: string, voiceId: string, callId: string, turn: number): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
        }),
      },
    );
    if (!res.ok) {
      console.error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return null;
    }
    const audio = new Uint8Array(await res.arrayBuffer());
    const path = `${callId}/turn-${turn}.mp3`;
    const up = await sb.storage.from('voice-audio').upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
    if (up.error) {
      console.error('audio upload failed', up.error.message);
      return null;
    }
    const signed = await sb.storage.from('voice-audio').createSignedUrl(path, 3600);
    return signed.data?.signedUrl ?? null;
  } catch (e) {
    console.error('speak failed', e);
    return null;
  }
}

function playOrSay(url: string | null, text: string): string {
  if (url) return `<Play>${esc(url)}</Play>`;
  return `<Say language="cs-CZ">${esc(text)}</Say>`;
}

const GREETING =
  'Dobrý den, tady asistent FastMedia.Pro. / Hello, this is the FastMedia.Pro assistant. / Guten Tag, hier ist der Assistent von FastMedia.Pro. Jak vám mohu pomoct? / How can I help? / Wie kann ich helfen?';

const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';

/** Verify Twilio's X-Twilio-Signature (HMAC-SHA1 over public URL + sorted POST params). Fails closed. */
async function verifyTwilio(req: Request, publicUrl: string, form: FormData): Promise<boolean> {
  const sig = req.headers.get('X-Twilio-Signature') ?? '';
  if (!TWILIO_AUTH_TOKEN || !sig) return false;
  const params: [string, string][] = [];
  form.forEach((v, k) => params.push([k, String(v)]));
  params.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const data = publicUrl + params.map(([k, v]) => k + v).join('');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(TWILIO_AUTH_TOKEN), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...mac));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

/** The call id in the URL must belong to the Twilio call making this request. */
async function callMatches(callId: string, callSid: string): Promise<boolean> {
  if (!callId || !callSid) return false;
  const { data } = await sb.from('voice_calls').select('id').eq('id', callId).eq('twilio_call_sid', callSid).maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') ?? 'inbound';
  const form = await req.formData().catch(() => new FormData());
  const callSid = String(form.get('CallSid') ?? '');
  const from = String(form.get('From') ?? '');
  const to = String(form.get('To') ?? '');

  // Only genuine Twilio requests are processed.
  const publicUrl = `${SUPABASE_URL}/functions/v1/voice-webhook${url.search}`;
  if (!(await verifyTwilio(req, publicUrl, form))) {
    return new Response('Forbidden', { status: 403 });
  }

  const settings = await loadSettings();

  if (!settings.enabled) {
    return twiml(`<Say language="en-GB">The FastMedia voice assistant is not switched on yet. Please call back later or email support at fastmedia dot pro.</Say><Hangup/>`);
  }
  if (budgetExhausted(settings)) {
    return twiml(`<Say language="en-GB">Our assistant has reached its monthly limit. Please email support at fastmedia dot pro.</Say><Hangup/>`);
  }

  if (action === 'inbound' || action === 'outbound') {
    const campaignId = url.searchParams.get('campaign');
    const prospectId = url.searchParams.get('prospect');
    const { data: call } = await sb
      .from('voice_calls')
      .insert({
        direction: action === 'inbound' ? 'inbound' : 'outbound',
        from_number: from,
        to_number: to,
        status: 'in_progress',
        twilio_call_sid: callSid || null,
        campaign_id: campaignId,
        prospect_id: prospectId,
      })
      .select('id')
      .single();
    const callId = call?.id ?? 'unknown';
    let opening = GREETING;
    if (action === 'outbound' && campaignId) {
      const { data: camp } = await sb.from('voice_campaigns').select('script').eq('id', campaignId).maybeSingle();
      if (camp?.script) opening = camp.script.split('\n')[0].slice(0, 300);
    }
    await sb.from('voice_call_turns').insert({ call_id: callId, role: 'agent', text: opening });
    const audio = await speak(opening, settings.elevenlabs_voice_id, callId, 0);
    const gather = `<Gather input="speech" action="${SUPABASE_URL}/functions/v1/voice-webhook?action=gather&amp;call=${callId}" method="POST" speechTimeout="auto" language="cs-CZ">${playOrSay(audio, opening)}</Gather><Say language="en-GB">We did not hear anything. Goodbye.</Say><Hangup/>`;
    return twiml(gather);
  }

  if (action === 'gather') {
    const callId = url.searchParams.get('call') ?? '';
    const speech = String(form.get('SpeechResult') ?? '').trim();
    if (!callId || !(await callMatches(callId, callSid))) return twiml('<Hangup/>');
    if (!speech) {
      return twiml(`<Gather input="speech" action="${SUPABASE_URL}/functions/v1/voice-webhook?action=gather&amp;call=${callId}" method="POST" speechTimeout="auto" language="cs-CZ"><Say language="en-GB">Sorry, I did not catch that. Could you repeat?</Say></Gather><Hangup/>`);
    }
    await sb.from('voice_call_turns').insert({ call_id: callId, role: 'caller', text: speech });
    const { data: turns } = await sb.from('voice_call_turns').select('role, text').eq('call_id', callId).order('created_at');
    let reply = 'Sorry, something went wrong on our side. Let me connect you to Tim.';
    try {
      reply = await aiReply(turns ?? [], speech);
    } catch (e) {
      console.error('aiReply failed', e);
    }
    if (reply.trim() === 'FORWARD' || reply.startsWith('FORWARD')) {
      await sb.from('voice_calls').update({ status: 'forwarded', forwarded: true }).eq('id', callId);
      const msg = 'Jistě, předávám hovor. / One moment, connecting you. / Einen Moment, ich verbinde Sie.';
      const audio = await speak(msg, settings.elevenlabs_voice_id, callId, (turns?.length ?? 0) + 1);
      await sb.from('voice_call_turns').insert({ call_id: callId, role: 'agent', text: msg });
      return twiml(`${playOrSay(audio, msg)}<Dial callerId="${esc(to)}" timeout="25">${esc(settings.forward_to_number)}</Dial><Say language="en-GB">No one is available right now. Please email support at fastmedia dot pro.</Say><Hangup/>`);
    }
    const hangup = reply.includes('[HANGUP]');
    const spoken = reply.replace('[HANGUP]', '').trim();
    await sb.from('voice_call_turns').insert({ call_id: callId, role: 'agent', text: spoken });
    const audio = await speak(spoken, settings.elevenlabs_voice_id, callId, (turns?.length ?? 0) + 1);
    if (hangup) return twiml(`${playOrSay(audio, spoken)}<Hangup/>`);
    return twiml(`<Gather input="speech" action="${SUPABASE_URL}/functions/v1/voice-webhook?action=gather&amp;call=${callId}" method="POST" speechTimeout="auto" language="cs-CZ">${playOrSay(audio, spoken)}</Gather><Hangup/>`);
  }

  if (action === 'status') {
    const callId = url.searchParams.get('call');
    const duration = parseInt(String(form.get('CallDuration') ?? '0'), 10) || 0;
    const status = String(form.get('CallStatus') ?? 'completed');
    const recordingUrl = String(form.get('RecordingUrl') ?? '');
    if (callId && (await callMatches(callId, callSid))) {
      await sb.from('voice_calls').update({
        status: status === 'completed' ? 'completed' : status === 'no-answer' ? 'no_answer' : status === 'failed' ? 'failed' : 'completed',
        duration_seconds: duration,
        recording_url: recordingUrl || null,
        ended_at: new Date().toISOString(),
      }).eq('id', callId);
      // Budget bookkeeping
      const month = new Date().toISOString().slice(0, 7);
      const s = await loadSettings();
      const used = s.usage_month === month ? Number(s.minutes_used) : 0;
      await sb.from('voice_settings').update({ minutes_used: used + duration / 60, usage_month: month, updated_at: new Date().toISOString() }).eq('id', 1);
      // Summarise + CRM sync in the background
      EdgeRuntime.waitUntil(
        (async () => {
          try {
            const { data: turns } = await sb.from('voice_call_turns').select('role, text').eq('call_id', callId).order('created_at');
            if (turns?.length && LOVABLE_API_KEY) {
              const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LOVABLE_API_KEY}` },
                body: JSON.stringify({
                  model: 'google/gemini-3-flash-preview',
                  max_tokens: 150,
                  messages: [
                    { role: 'system', content: 'Summarise this phone call in 2 short English sentences and give a one-word outcome (lead, message, support, spam, other). Format: summary… | outcome: x' },
                    { role: 'user', content: turns.map((t) => `${t.role}: ${t.text}`).join('\n') },
                  ],
                }),
              });
              if (res.ok) {
                const j = await res.json();
                const txt: string = j.choices?.[0]?.message?.content ?? '';
                const [sum, out] = txt.split('| outcome:');
                await sb.from('voice_calls').update({ summary: sum?.trim() ?? txt, outcome: out?.trim().toLowerCase() ?? null }).eq('id', callId);
              }
            }
            await fetch(`${SUPABASE_URL}/functions/v1/flowlu-sync`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${SERVICE_ROLE}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ call_id: callId }),
            });
          } catch (e) {
            console.error('post-call processing failed', e);
          }
        })(),
      );
    }
    return new Response('ok');
  }

  return new Response('voice-webhook: unknown action', { status: 400 });
});
