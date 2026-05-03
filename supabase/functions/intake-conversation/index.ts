import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Turn = { key: string; question: string; answer: string };
type Body = {
  language?: "cs" | "en" | "de";
  trade?: string;
  selectedFeatures?: { id: string; quantity: number }[];
  specialRequest?: string;
  quoteOneTime?: number;
  quoteMonthly?: number;
  history?: Turn[];
};

// Deterministic question slots, asked in this order if missing.
// `key` is the slot we're trying to fill; `seed` is the canonical English question
// that the AI will rephrase in the user's language/tone.
const SLOTS: { key: string; seed: string; required?: boolean }[] = [
  { key: "timeline", seed: "When would you ideally like the website to be live?", required: true },
  { key: "decision_maker", seed: "Will you be the one signing off the project, or is someone else involved in the decision?", required: true },
  { key: "budget_fit", seed: "Does the estimated budget shown on screen feel comfortable for you, or would you like to adjust scope?", required: true },
  { key: "success_metric", seed: "What would make this project a clear success for you in the first 6 months?" },
  { key: "content_readiness", seed: "Do you already have brand assets, copy and photos, or would you like us to produce them?" },
  { key: "tone", seed: "How would you describe the tone you want the site to convey (e.g. premium, friendly, technical, playful)?" },
  { key: "extra", seed: "Is there anything else we should know before we put a proposal together?" },
];

function nextMissingSlot(history: Turn[]): { key: string; seed: string } | null {
  const answered = new Set(history.map((h) => h.key));
  // Critical-first: if any required slot still missing, ask it next.
  for (const s of SLOTS) {
    if (!answered.has(s.key)) {
      // Stop the conversation early once we have ≥3 answers AND all required slots are covered AND we're past the required block.
      if (
        history.length >= 3 &&
        SLOTS.filter((x) => x.required).every((x) => answered.has(x.key)) &&
        !s.required
      ) {
        // Allow up to 7 turns total before forcing close.
        if (history.length >= 7) return null;
        return s;
      }
      return s;
    }
  }
  return null;
}

async function aiRephrase(seed: string, language: string, history: Turn[], context: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return seed;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are an intake consultant for a website agency. Rephrase the supplied seed question in a warm, conversational tone in the user's language. Keep it ONE sentence, max 22 words, no preamble, no quotes around the answer. Reference earlier answers naturally if relevant. Output only the question text.",
          },
          {
            role: "user",
            content: `Language: ${language}\nProject context: ${context}\nPrior turns: ${JSON.stringify(
              history.slice(-3).map((h) => ({ q: h.question, a: h.answer })),
            )}\nSeed question (English): ${seed}`,
          },
        ],
      }),
    });
    if (!resp.ok) return seed;
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 4 ? text.replace(/^["']|["']$/g, "") : seed;
  } catch {
    return seed;
  }
}

async function aiSummarise(language: string, context: string, history: Turn[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const fallback = {
    summary: history.map((h) => `${h.question} — ${h.answer}`).join("\n"),
    intent: {
      timeline: history.find((h) => h.key === "timeline")?.answer ?? null,
      decision_maker: history.find((h) => h.key === "decision_maker")?.answer ?? null,
      budget_fit: history.find((h) => h.key === "budget_fit")?.answer ?? null,
      success_metric: history.find((h) => h.key === "success_metric")?.answer ?? null,
      content_readiness: history.find((h) => h.key === "content_readiness")?.answer ?? null,
      tone: history.find((h) => h.key === "tone")?.answer ?? null,
      urgency: "medium" as const,
      readiness: "medium" as const,
    },
  };
  if (!LOVABLE_API_KEY) return fallback;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You convert an intake transcript into a concise sales brief. Reply ONLY by calling the function. Write the summary in the user's language; keep keys in the structured object lowercase English.",
          },
          {
            role: "user",
            content: `Language: ${language}\nContext: ${context}\nTranscript: ${JSON.stringify(history)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "intake_brief",
              description: "Structured intake brief.",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "2–4 sentence brief in the user's language." },
                  intent: {
                    type: "object",
                    properties: {
                      timeline: { type: "string" },
                      decision_maker: { type: "string" },
                      budget_fit: { type: "string" },
                      success_metric: { type: "string" },
                      content_readiness: { type: "string" },
                      tone: { type: "string" },
                      urgency: { type: "string", enum: ["low", "medium", "high"] },
                      readiness: { type: "string", enum: ["low", "medium", "high"] },
                    },
                    required: ["urgency", "readiness"],
                    additionalProperties: false,
                  },
                },
                required: ["summary", "intent"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "intake_brief" } },
      }),
    });
    if (!resp.ok) return fallback;
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return fallback;
    return JSON.parse(args);
  } catch {
    return fallback;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    const language = body.language === "cs" || body.language === "de" ? body.language : "en";
    const history = Array.isArray(body.history) ? body.history.slice(0, 10) : [];

    const context = [
      body.trade ? `trade=${body.trade}` : null,
      body.selectedFeatures?.length ? `features=${body.selectedFeatures.map((f) => f.id).join(",")}` : null,
      body.quoteOneTime ? `one_time=${body.quoteOneTime}` : null,
      body.quoteMonthly ? `monthly=${body.quoteMonthly}` : null,
      body.specialRequest ? `notes=${body.specialRequest.slice(0, 200)}` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const slot = nextMissingSlot(history);
    if (!slot) {
      const brief = await aiSummarise(language, context, history);
      return new Response(
        JSON.stringify({ done: true, ...brief, transcript: history }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const phrased = await aiRephrase(slot.seed, language, history, context);
    return new Response(
      JSON.stringify({ done: false, key: slot.key, question: phrased }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("intake-conversation error", e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ error: "Conversation failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
