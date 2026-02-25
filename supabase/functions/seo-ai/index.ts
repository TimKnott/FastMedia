import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pagePath, pageLabel, currentTitle, currentDescription, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langName = language === "cs" ? "Czech" : language === "de" ? "German" : "English";

    const systemPrompt = `You are an expert SEO consultant. Generate optimized meta tags for a web page.
Rules:
- Title: max 60 characters, include primary keyword early
- Description: max 155 characters, compelling call-to-action, include keyword
- OG Title: can be slightly longer than title (max 70 chars), more engaging
- OG Description: max 200 chars, social-media friendly
- All content must be in ${langName}
- Focus on the trade/service industry and local SEO for Czech Republic
- Return results using the provided tool`;

    const userPrompt = `Page: ${pageLabel} (${pagePath})
${currentTitle ? `Current title: ${currentTitle}` : "No title set"}
${currentDescription ? `Current description: ${currentDescription}` : "No description set"}
Language: ${langName}

Generate optimized SEO meta tags for this page.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "seo_suggestions",
              description: "Return SEO tag suggestions for the page",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Optimized page title (max 60 chars)" },
                  description: { type: "string", description: "Meta description (max 155 chars)" },
                  og_title: { type: "string", description: "Open Graph title (max 70 chars)" },
                  og_description: { type: "string", description: "OG description (max 200 chars)" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 additional SEO tips for this page",
                  },
                },
                required: ["title", "description", "og_title", "og_description", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "seo_suggestions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
