import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Returns a short-lived download link for the PDF of a PUBLISHED case study only.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  try {
    const { id } = await req.json().catch(() => ({}))
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Invalid id' }, 400)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data } = await admin.from('case_studies').select('pdf_path,is_published').eq('id', id).maybeSingle()
    if (!data?.is_published || !data.pdf_path) return json({ url: null })
    const { data: signed } = await admin.storage.from('case-studies').createSignedUrl(data.pdf_path, 600)
    return json({ url: signed?.signedUrl ?? null })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
