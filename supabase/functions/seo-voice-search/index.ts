// Analyze GSC query data for question/voice patterns. Re-uses latest 'keyword' snapshot.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUESTION_PREFIXES = /^(how|what|why|when|where|which|who|can|does|do|is|are|should|will|jak|co|proč|kdy|kde|který|kdo|je|jsou|wie|was|warum|wann|wo|welche|wer|kann|ist|sind)\b/i;

async function process(supabase: any, propertyId: string) {
  const { data: snap } = await supabase.from('seo_snapshots').select('metrics').eq('property_id', propertyId).eq('dimension', 'keyword').order('week_start', { ascending: false }).limit(1).maybeSingle();
  const rows = snap?.metrics ?? [];
  await supabase.from('seo_voice_queries').delete().eq('property_id', propertyId);
  let questions = 0;
  for (const r of rows) {
    const q = r.keys?.[0] ?? '';
    const isQ = QUESTION_PREFIXES.test(q) || q.includes('?');
    if (!isQ) continue;
    questions++;
    await supabase.from('seo_voice_queries').insert({
      property_id: propertyId, query: q,
      clicks: r.clicks ?? 0, impressions: r.impressions ?? 0, position: r.position ?? null,
      is_question: true,
    });
  }
  if (questions >= 5) {
    await supabase.from('seo_issues').insert({
      property_id: propertyId, severity: 'info', category: 'voice-search',
      title: `${questions} question queries detected`,
      suggested_fix: 'Create FAQ blocks with FAQPage JSON-LD on the relevant pages to capture voice-search snippets.',
    });
  }
  return { questions };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /**/ }
    const q = supabase.from('seo_properties').select('id').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;
    const results: any[] = [];
    for (const p of props ?? []) {
      try { results.push({ id: p.id, ok: true, ...(await process(supabase, p.id)) }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
