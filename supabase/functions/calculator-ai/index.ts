import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limit by IP or forwarded header
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { selectedFeatures, trade, specialRequest, language } = body;

    // Input validation
    if (!trade || typeof trade !== "string" || trade.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid request." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (specialRequest && (typeof specialRequest !== "string" || specialRequest.length > 1000)) {
      return new Response(JSON.stringify({ error: "Invalid request." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(selectedFeatures) || selectedFeatures.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid request." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validLangs = ["cs", "en", "de"];
    const lang = validLangs.includes(language) ? language : "en";
    const langName = lang === "cs" ? "Czech" : lang === "de" ? "German" : "English";

    let systemPrompt: string;
    let userPrompt: string;

    if (specialRequest) {
      systemPrompt = `You are a helpful web development consultant for FastMedia.Pro, a company that builds websites for tradespeople. Respond in ${langName}. You must return a JSON object with this structure: { "available": boolean, "suggestion": string, "alternativeFeatures": string[] }. If the requested feature can be achieved with existing web features, set available=true and explain how. If not, set available=false and suggest alternatives. Keep suggestion under 100 words. alternativeFeatures should be IDs from this list: contact-form, booking-system, gallery, reviews, google-maps, social-media, blog, newsletter, analytics, live-chat, multi-language, seo-advanced, video, ecommerce, crm, virtual-tour, ai-chatbot, unified-inbox, auto-invoicing, customer-portal, whatsapp-button, testimonial-video, price-calculator, before-after, lead-scoring, sms-notifications, payment-gateway, heatmaps, ab-testing, error-monitoring. Note: auto-invoicing now includes a complete accounting system with recurring invoices (daily/weekly/monthly) and a Kanban board integration.`;
      userPrompt = `The customer works in "${trade}" and requests: "${specialRequest}". Their current features: ${JSON.stringify(selectedFeatures)}. What do you suggest?`;
    } else {
      systemPrompt = `You are a helpful web development consultant for FastMedia.Pro. Respond in ${langName}. Based on the customer's trade and selected features, suggest 2-3 additional features they should consider. Return a JSON object: { "suggestions": [{ "id": string, "reason": string }] }. Feature IDs available: contact-form, booking-system, gallery, reviews, google-maps, social-media, blog, newsletter, analytics, live-chat, multi-language, seo-advanced, video, ecommerce, crm, virtual-tour, ai-chatbot, unified-inbox, auto-invoicing, customer-portal, whatsapp-button, testimonial-video, price-calculator, before-after, lead-scoring, sms-notifications, payment-gateway, heatmaps, ab-testing, error-monitoring. Only suggest features NOT already selected. Keep each reason under 30 words.`;
      userPrompt = `Trade: "${trade}". Currently selected features: ${JSON.stringify(selectedFeatures)}. What additional features would benefit this business?`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Service is busy. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { suggestions: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculator-ai error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
