// One-off reminder: emails the owner the open-task checklist. Fixed recipient
// and content, so no user input is accepted.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { ALERT_RECIPIENTS } from '../_shared/alert-recipients.ts'
import { sendViaGmail } from '../_shared/gmail-fallback.ts'

const TASKS = [
  'Search Console: use URL inspection → "Request indexing" for https://www.fastmedia.pro/, /eu-creative-grant and /grant-business-plan.',
  'Google Business Profile: ask Lovable to "connect Business Profile" and complete Google\'s verification.',
  'Flowlu: create a new API key (Settings → API) and send it with your Flowlu web address.',
  'Twilio: ask Lovable to "connect Twilio" so the voice agent gets its number.',
  'GetSales: create and switch on the LinkedIn sequence starting from the "SEO Experts" list, and add the webhook URL under Settings → Webhooks.',
  'Case studies: send the four real PDFs (Northwater, Lumière, Nordic, Summit) and any client-approved figures.',
  'Review the EU language drafts in Admin → Language versions.',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const subject = 'Reminder: FastMedia.Pro open tasks'
  const text = `Hi Tim,\n\nHere are the tasks still waiting for you:\n\n${TASKS.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nFastMedia.Pro`
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p>Hi Tim,</p><p>Here are the tasks still waiting for you:</p><ol>${TASKS.map((t) => `<li>${t}</li>`).join('')}</ol><p>FastMedia.Pro</p></div>`
  const results = await Promise.all(ALERT_RECIPIENTS.map((to) => sendViaGmail(to, subject, html, text)))
  const result = { sent: results.every((r) => r.sent), results }
  return new Response(JSON.stringify(result), {
    status: result.sent ? 200 : 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
