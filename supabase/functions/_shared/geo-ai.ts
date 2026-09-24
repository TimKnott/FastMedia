// JSON-returning AI helper for the GEO tools (Lovable AI gateway).
export async function aiJson(system: string, user: string): Promise<Record<string, unknown>> {
  const key = Deno.env.get('LOVABLE_API_KEY')
  if (!key) throw new Error('AI is not configured')
  const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-6-astra',
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${user}\n\nReturn only a json object.` },
      ],
    }),
  })
  if (r.status === 429) throw new Error('AI is busy — try again in a minute.')
  if (r.status === 402) throw new Error('AI credits are used up — add credits in workspace billing.')
  if (!r.ok) throw new Error(`AI request failed [${r.status}]: ${(await r.text()).slice(0, 300)}`)
  const body = await r.json()
  const content = body?.choices?.[0]?.message?.content ?? '{}'
  try {
    return JSON.parse(content)
  } catch {
    const m = String(content).match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : {}
  }
}

export const GUARDRAILS = `Rules you must follow:
- Use ONLY the facts provided (verified business facts and existing page text). Never invent business facts, customer results, reviews, awards, certifications, locations, services, prices, statistics or competitor claims.
- Any fact marked unverified must be listed in "missing_info" as needing confirmation rather than stated as true.
- If information needed is missing, say so in "missing_info" instead of guessing.
- Separate facts (each with its source) from recommendations.
- No superlatives such as "best", "leading", "number one". No keyword stuffing. No copying competitor text.
- Put the direct answer first, use descriptive headings, short paragraphs and lists; state limitations, dates and geographic scope.
- Brand voice: clear, friendly, professional, plain language.`
