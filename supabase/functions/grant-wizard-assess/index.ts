import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxRequests = 8, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

const clamp = (n: unknown, min: number, max: number, fallback: number) => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
};

const strList = (v: unknown, maxItems = 12, maxLen = 160): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").slice(0, maxItems).map((s) => s.trim().slice(0, maxLen)).filter(Boolean)
    : [];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) return json({ error: "Too many requests. Please try again in a minute." }, 429);

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return json({ error: "Invalid request." }, 400);

    const lang = body.language === "cs" ? "cs" : "en";
    const langName = lang === "cs" ? "Czech" : "British English";

    const payload = {
      region: typeof body.region === "string" ? body.region.slice(0, 80) : "",
      industry: typeof body.industry === "string" ? body.industry.slice(0, 80) : "",
      upgrades: strList(body.upgrades, 10, 120),
      budgetCzk: clamp(body.budgetCzk, 0, 5_000_000, 150_000),
      vatRegistered: body.vatRegistered === true,
      eligibility: {
        activeBusiness: body.activeBusiness === true,
        noDebts: body.noDebts === true,
        deMinimisOk: body.deMinimisOk === true,
      },
      projectDescription: typeof body.projectDescription === "string" ? body.projectDescription.slice(0, 2000) : "",
      hasWebsite: body.hasWebsite === true,
      hasBranding: body.hasBranding === true,
      hasPortfolio: body.hasPortfolio === true,
      baselineScore: clamp(body.baselineScore, 0, 100, 50),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return json({ error: "Assessment service is temporarily unavailable." }, 503);
    }

    const systemPrompt = `You are a Czech creative-voucher (Kreativní vouchery) application readiness assessor working for FastMedia.Pro, a web and creative supplier. You are NOT the grant provider and cannot approve anything. Assess only how well prepared an applicant is.
Respond in ${langName}. Return ONLY a JSON object with this exact shape:
{
  "chancePercent": number (0-100, realistic readiness estimate),
  "verdict": string (max 25 words, honest, no promises of approval),
  "summary": string (2-4 sentences explaining the score),
  "strengths": string[] (2-5 items),
  "gaps": string[] (2-6 items: exactly what is missing from their description, portfolio, branding, documents),
  "improvements": string[] (3-6 concrete actions to raise their chance),
  "documents": string[] (3-6 documents/attachments they should prepare)
}
Rules: never state or imply that the grant is guaranteed; the provider decides. Weight heavily whether the project contains genuinely bespoke creative work (custom design, custom software) rather than off-the-shelf templates, whether the described project is specific and measurable, and whether the budget sits within typical voucher limits. Treat the supplied baselineScore as a starting point and adjust it by at most 20 points in either direction. Keep every string under 220 characters.`;

    const userPrompt = `Applicant data (JSON): ${JSON.stringify(payload)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text.slice(0, 500));
      if (res.status === 429) return json({ error: "The assessment service is busy. Please try again in a minute." }, 429);
      if (res.status === 402) return json({ error: "The assessment service is unavailable right now." }, 402);
      return json({ error: "Could not generate the assessment. Please try again." }, 502);
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }

    const report = {
      chancePercent: clamp(parsed.chancePercent, 0, 100, payload.baselineScore),
      verdict: typeof parsed.verdict === "string" ? parsed.verdict.slice(0, 300) : "",
      summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 1200) : "",
      strengths: strList(parsed.strengths, 6, 240),
      gaps: strList(parsed.gaps, 8, 240),
      improvements: strList(parsed.improvements, 8, 240),
      documents: strList(parsed.documents, 8, 240),
    };

    return json({ report });
  } catch (err) {
    console.error("grant-wizard-assess failed", err);
    return json({ error: "An unexpected error occurred." }, 500);
  }
});
