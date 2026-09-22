// Shared helper: one JSON answer from the Lovable AI Gateway Responses API.
// Always streams (reasoning models routinely run for minutes) and accumulates
// the output text server-side, then parses it as JSON.

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/responses'
const MODEL = 'openai/gpt-6-astra'

export interface AiJsonOptions {
  instructions?: string
  schema?: Record<string, unknown>
  schemaName?: string
  effort?: 'low' | 'medium' | 'high'
}

export async function generateJson<T = unknown>(
  prompt: string,
  options: AiJsonOptions = {},
): Promise<T> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not configured')

  const body: Record<string, unknown> = {
    model: MODEL,
    input: options.instructions
      ? [
          { role: 'developer', content: [{ type: 'input_text', text: options.instructions }] },
          { role: 'user', content: [{ type: 'input_text', text: prompt }] },
        ]
      : prompt,
    stream: true,
    reasoning: { effort: options.effort ?? 'low' },
  }
  if (options.schema) {
    body.text = {
      format: {
        type: 'json_schema',
        name: options.schemaName ?? 'result',
        strict: true,
        schema: options.schema,
      },
    }
  }

  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': apiKey,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const details = (await res.text()).slice(0, 400)
    throw new Error(`ai_gateway_failed ${res.status}: ${details}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const event = JSON.parse(payload)
        if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
          text += event.delta
        } else if (event.type === 'response.completed' && typeof event.response?.output_text === 'string' && !text) {
          text = event.response.output_text
        } else if (event.type === 'error') {
          throw new Error(`ai_stream_error: ${JSON.stringify(event).slice(0, 300)}`)
        }
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('ai_stream_error')) throw error
      }
    }
  }

  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  if (!cleaned) throw new Error('ai_empty_response')
  try {
    return JSON.parse(cleaned) as T
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T
    throw new Error('ai_unparseable_response')
  }
}
