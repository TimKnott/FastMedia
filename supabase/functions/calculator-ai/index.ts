import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { selectedFeatures, trade, specialRequest, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === 'cs' ? 'Czech' : language === 'de' ? 'German' : 'English';

    let systemPrompt: string;
    let userPrompt: string;

    if (specialRequest) {
      systemPrompt = `You are a helpful web development consultant for FastMedia.Pro, a company that builds websites for tradespeople. Respond in ${lang}. You must return a JSON object with this structure: { "available": boolean, "suggestion": string, "alternativeFeatures": string[] }. If the requested feature can be achieved with existing web features, set available=true and explain how. If not, set available=false and suggest alternatives. Keep suggestion under 100 words. alternativeFeatures should be IDs from this list: contact-form, booking-system, gallery, reviews, google-maps, social-media, blog, newsletter, analytics, live-chat, multi-language, seo-advanced, video, ecommerce, crm, virtual-tour.`;
      userPrompt = `The customer works in "${trade}" and requests: "${specialRequest}". Their current features: ${JSON.stringify(selectedFeatures)}. What do you suggest?`;
    } else {
      systemPrompt = `You are a helpful web development consultant for FastMedia.Pro. Respond in ${lang}. Based on the customer's trade and selected features, suggest 2-3 additional features they should consider. Return a JSON object: { "suggestions": [{ "id": string, "reason": string }] }. Feature IDs available: contact-form, booking-system, gallery, reviews, google-maps, social-media, blog, newsletter, analytics, live-chat, multi-language, seo-advanced, video, ecommerce, crm, virtual-tour. Only suggest features NOT already selected. Keep each reason under 30 words.`;
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
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { suggestions: [], error: "Could not parse AI response" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculator-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
