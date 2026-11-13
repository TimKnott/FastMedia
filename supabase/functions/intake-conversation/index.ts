import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSignedInUserId } from "../_shared/require-user.ts";

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

// Deterministic question slots. `key` is the slot we're trying to fill.
// `seed` is the canonical English question that the AI will rephrase in the
// user's language/tone. Branching between slots is decided by inspecting the
// prior answers + project context — see nextMissingSlot below.
const SLOTS: Record<string, { seed: string; required?: boolean }> = {
  timeline: { seed: "When would you ideally like the website to be live?", required: true },
  urgency_reason: { seed: "That's a tight timeline — what's driving the deadline (launch event, marketing campaign, season)?" },
  decision_maker: { seed: "Will you be the one signing off the project, or is someone else involved in the decision?", required: true },
  decision_maker_who: { seed: "Who else needs to sign off, and what would help them feel confident in saying yes?" },
  budget_fit: { seed: "Does the estimated budget shown on screen feel comfortable for you, or would you like to adjust scope?", required: true },
  budget_adjust: { seed: "Which features feel essential vs. nice-to-have, so we can shape a proposal that fits your budget?" },
  content_readiness: { seed: "Do you already have brand assets, copy and photos, or would you like us to produce them?" },
  success_metric: { seed: "What would make this project a clear success for you in the first 6 months?" },
  tone: { seed: "How would you describe the tone you want the site to convey (e.g. premium, friendly, technical, playful)?" },
  extra: { seed: "Is there anything else we should know before we put a proposal together?" },
};

const norm = (s?: string) => (s || "").toLowerCase();

const answerSignals = {
  // Timeline answer suggests urgency
  urgent: (a: string) =>
    /(asap|urgent|hned|sofort|this week|tento týden|diese woche|next week|příští týden|nächste woche|<\s*4|under (a |one )?month|do měsíce|innerhalb eines monats|deadline|launch|spuštění|start)/i.test(
      a,
    ),
  // Decision-maker answer indicates someone else / committee involved
  hasOtherDecider: (a: string) =>
    /(partner|spoluvlastník|mitinhaber|committee|board|představenstvo|vorstand|wife|husband|manžel|frau|mann|team|kolegové|kolleg|company|firm|s.r.o\.?|sro|gmbh|other(s)?|další|weitere|jiný|jiné|another|someone else|nikdo jiný|kein|both|oba|beide)/i.test(
      a,
    ),
  // Budget-fit answer signals discomfort
  budgetDiscomfort: (a: string) =>
    /(too high|too much|expensive|drahé|drahy|teuer|tight|napjatý|tighter|less|menší|kleiner|reduce|snížit|reduzieren|cut|adjust|upravit|anpassen|smaller|out of (our )?budget|nad (náš )?rozpočet|über (unser )?budget)/i.test(
      a,
    ),
  // Already covered content readiness in special request or any answer
  contentMentioned: (text: string) =>
    /(have\b[^.]*\b(copy|photos?|brand|assets|logo|content|images?)|máme\s+(?:už\s+)?(texty|fotky|fotografie|brand|loga|obsah)|haben\s+(?:bereits\s+|schon\s+)?(texte|fotos|marke|logos|inhalte|bilder)|need (copy|photos?|content|images?)|potřebujeme (texty|fotky|obsah)|brauchen (texte|fotos|inhalte))/i.test(
      text,
    ),
  // Already conveyed tone in special request or any answer
  toneMentioned: (text: string) =>
    /(premium|luxury|luxusní|luxuriös|playful|hravé|verspielt|technical|technick|technisch|friendly|přátelsk|freundlich|modern|minimalist|minimalist|edgy|bold|elegant|elegantní|professional|profesionální|professionell|warm|fun|seriös|seriózní)/i.test(
      text,
    ),
};

function answerFor(history: Turn[], key: string): string | undefined {
  return history.find((h) => h.key === key)?.answer;
}

const MAX_TURNS = 7;

function nextMissingSlot(
  history: Turn[],
  context: { specialRequest?: string },
): { key: string; seed: string } | null {
  const answered = new Set(history.map((h) => h.key));
  const allText = [context.specialRequest || "", ...history.map((h) => h.answer)].join(" ");

  // Build the dynamic, answer-aware slot order
  const order: string[] = [];

  // 1) timeline (required) — and conditional follow-up if urgent
  order.push("timeline");
  const tl = answerFor(history, "timeline");
  if (tl && answerSignals.urgent(tl)) order.push("urgency_reason");

  // 2) decision_maker (required) — and conditional follow-up if someone else involved
  order.push("decision_maker");
  const dm = answerFor(history, "decision_maker");
  if (dm && answerSignals.hasOtherDecider(dm)) order.push("decision_maker_who");

  // 3) budget_fit (required) — and conditional adjust step if discomfort
  order.push("budget_fit");
  const bf = answerFor(history, "budget_fit");
  if (bf && answerSignals.budgetDiscomfort(bf)) order.push("budget_adjust");

  // 4) content_readiness — skip if already covered in special request or any answer
  if (!answerSignals.contentMentioned(allText)) order.push("content_readiness");

  // 5) success_metric — always asked once we're past required block (high signal for proposal)
  order.push("success_metric");

  // 6) tone — skip if already conveyed in special request or earlier answers
  if (!answerSignals.toneMentioned(allText)) order.push("tone");

  // 7) extra — final catch-all, only used if we still have headroom
  order.push("extra");

  // Required slots
  const requiredKeys = Object.entries(SLOTS).filter(([, v]) => v.required).map(([k]) => k);
  const allRequiredAnswered = requiredKeys.every((k) => answered.has(k));

  // Walk the dynamic order, skipping anything already answered
  for (const key of order) {
    if (answered.has(key)) continue;
    const slot = SLOTS[key];
    if (!slot) continue;

    // Stop early once we've covered required + at least 3 turns total, and the
    // next candidate is optional, but still allow up to MAX_TURNS.
    if (history.length >= 3 && allRequiredAnswered && !slot.required) {
      if (history.length >= MAX_TURNS) return null;
      return { key, seed: slot.seed };
    }
    return { key, seed: slot.seed };
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

// Default per-slot suggestion chips (used when AI is unavailable or as a base).
const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  timeline: ["Within 2 weeks", "Within 1 month", "1–2 months", "Flexible"],
  urgency_reason: ["Marketing campaign launch", "Seasonal demand", "Replacing an old site", "No hard deadline"],
  decision_maker: ["Yes, just me", "Me + business partner", "Me + spouse / family", "Team / committee"],
  decision_maker_who: ["Business partner", "Spouse / family", "Whole team", "Investor / board"],
  budget_fit: ["Yes, looks fine", "A bit high — let's trim", "Need a payment plan", "Happy to add more"],
  budget_adjust: ["Keep core only", "Drop animations", "Phase optional features later", "Keep everything"],
  content_readiness: ["I have everything ready", "I have some assets", "Please produce it all", "Not sure yet"],
  success_metric: ["More qualified leads", "Higher Google ranking", "Stronger brand image", "Online bookings"],
  tone: ["Premium & refined", "Friendly & warm", "Bold & modern", "Trustworthy & technical"],
  extra: ["Nothing else", "Need multilingual", "Need integrations", "I'll share more by email"],
};

async function aiSuggestions(
  slotKey: string,
  language: string,
  history: Turn[],
  context: string,
): Promise<string[]> {
  const base = DEFAULT_SUGGESTIONS[slotKey] || [];
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return base;
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
              "You generate 4 short, clickable quick-reply chips for an intake question on a website-agency quote form. Each chip = a likely answer the user could tap instead of typing. Tailor them to the trade, prior answers, and the slot. Each chip ≤ 7 words, written in the user's language, distinct from each other, no numbering, no quotes.",
          },
          {
            role: "user",
            content: `Language: ${language}\nContext: ${context}\nSlot: ${slotKey}\nPrior turns: ${JSON.stringify(
              history.slice(-4).map((h) => ({ k: h.key, q: h.question, a: h.answer })),
            )}\nFallback ideas (English): ${JSON.stringify(base)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggestions",
              description: "Quick-reply chips for the user.",
              parameters: {
                type: "object",
                properties: {
                  chips: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5,
                  },
                },
                required: ["chips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggestions" } },
      }),
    });
    if (!resp.ok) return base;
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return base;
    const parsed = JSON.parse(args);
    const chips = (parsed?.chips || []).filter((c: unknown) => typeof c === "string" && (c as string).trim().length > 0).slice(0, 5);
    return chips.length >= 3 ? chips : base;
  } catch {
    return base;
  }
}


// AI-driven slot selection: given the candidate slots that are still unanswered,
// let the model pick which one to ask next based on what would most de-risk the
// proposal. Falls back to the rules-based default if anything goes wrong.
async function aiPickSlot(
  defaultKey: string,
  candidates: { key: string; seed: string }[],
  history: Turn[],
  context: string,
  language: string,
): Promise<{ key: string; reason?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || candidates.length <= 1) return { key: defaultKey };
  try {
    const allowed = candidates.map((c) => c.key);
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are a senior website-agency intake strategist. Pick the single next question that will most reduce risk in the proposal. Prefer required slots (timeline, decision_maker, budget_fit) before optional ones. Always pick exactly one key from the allowed list — never stop early.",
          },
          {
            role: "user",
            content: `Language: ${language}\nContext: ${context}\nTranscript so far: ${JSON.stringify(
              history.map((h) => ({ key: h.key, q: h.question, a: h.answer })),
            )}\nAllowed next keys (in default priority order): ${JSON.stringify(allowed)}\nDefault next: ${defaultKey}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "pick_next_slot",
              description: "Pick the most useful next intake question.",
              parameters: {
                type: "object",
                properties: {
                  key: { type: "string", enum: allowed },
                  reason: { type: "string", description: "≤15 words on why this question is most useful next." },
                },
                required: ["key"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "pick_next_slot" } },
      }),
    });
    if (!resp.ok) return { key: defaultKey };
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { key: defaultKey };
    const parsed = JSON.parse(args);
    if (!allowed.includes(parsed.key)) return { key: defaultKey };
    return parsed;
  } catch {
    return { key: defaultKey };
  }
}

// Build the full ordered list of unanswered candidate slots (rules pass).
function candidateSlots(
  history: Turn[],
  context: { specialRequest?: string },
): { key: string; seed: string }[] {
  const answered = new Set(history.map((h) => h.key));
  const allText = [context.specialRequest || "", ...history.map((h) => h.answer)].join(" ");
  const order: string[] = ["timeline"];
  const tl = answerFor(history, "timeline");
  if (tl && answerSignals.urgent(tl)) order.push("urgency_reason");
  order.push("decision_maker");
  const dm = answerFor(history, "decision_maker");
  if (dm && answerSignals.hasOtherDecider(dm)) order.push("decision_maker_who");
  order.push("budget_fit");
  const bf = answerFor(history, "budget_fit");
  if (bf && answerSignals.budgetDiscomfort(bf)) order.push("budget_adjust");
  if (!answerSignals.contentMentioned(allText)) order.push("content_readiness");
  order.push("success_metric");
  if (!answerSignals.toneMentioned(allText)) order.push("tone");
  order.push("extra");
  const out: { key: string; seed: string }[] = [];
  for (const k of order) {
    if (answered.has(k)) continue;
    const slot = SLOTS[k];
    if (slot) out.push({ key: k, seed: slot.seed });
  }
  return out;
}

async function aiSummarise(language: string, context: string, history: Turn[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const get = (k: string) => history.find((h) => h.key === k)?.answer ?? null;
  const fallback = {
    summary: history.map((h) => `${h.question} — ${h.answer}`).join("\n"),
    intent: {
      timeline: get("timeline"),
      urgency_reason: get("urgency_reason"),
      decision_maker: get("decision_maker"),
      decision_maker_who: get("decision_maker_who"),
      budget_fit: get("budget_fit"),
      budget_adjust: get("budget_adjust"),
      success_metric: get("success_metric"),
      content_readiness: get("content_readiness"),
      tone: get("tone"),
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
                      urgency_reason: { type: "string" },
                      decision_maker: { type: "string" },
                      decision_maker_who: { type: "string" },
                      budget_fit: { type: "string" },
                      budget_adjust: { type: "string" },
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
    if (!(await getSignedInUserId(req))) {
      return new Response(JSON.stringify({ error: "Please sign in to use this assistant." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
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

    const slot = nextMissingSlot(history, { specialRequest: body.specialRequest });
    if (!slot) {
      const brief = await aiSummarise(language, context, history);
      return new Response(
        JSON.stringify({ done: true, ...brief, transcript: history }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // AI-driven slot selection on top of the rules-based default.
    const candidates = candidateSlots(history, { specialRequest: body.specialRequest });
    let chosen = slot;
    if (history.length >= 2 && candidates.length > 1) {
      const pick = await aiPickSlot(slot.key, candidates, history, context, language);
      const match = candidates.find((c) => c.key === pick.key);
      if (match) chosen = match;
    }

    const [phrased, suggestions] = await Promise.all([
      aiRephrase(chosen.seed, language, history, context),
      aiSuggestions(chosen.key, language, history, context),
    ]);
    return new Response(
      JSON.stringify({ done: false, key: chosen.key, question: phrased, suggestions, transcript: history }),
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
