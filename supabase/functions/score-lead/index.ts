import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  trade: string;
  selectedFeatures: { id: string; quantity: number }[];
  specialRequest?: string;
  quoteOneTime: number;
  quoteMonthly: number;
  laborHours: number;
  language: string;
  gdprConsent: boolean;
}

function classifyScore(score: number): string {
  if (score >= 80) return "high_priority";
  if (score >= 50) return "hot";
  if (score >= 25) return "warm";
  return "cold";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: LeadInput = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email) || body.email.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!body.trade || typeof body.trade !== "string" || body.trade.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid trade." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!body.gdprConsent) {
      return new Response(JSON.stringify({ error: "GDPR consent required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!Array.isArray(body.selectedFeatures) || body.selectedFeatures.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid features." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch active scoring rules
    const { data: rules } = await supabaseAdmin
      .from("scoring_rules")
      .select("*")
      .eq("is_active", true);

    // Calculate score based on rules
    let score = 0;
    const featureCount = body.selectedFeatures.length;
    const featureIds = body.selectedFeatures.map(f => f.id);
    const totalBudget = body.quoteOneTime;
    const hasSpecialRequest = !!body.specialRequest?.trim();

    // Feature categories (from calculatorFeatures data)
    const premiumFeatures = ["ecommerce", "crm", "virtual-tour"];

    for (const rule of (rules || [])) {
      const cond = rule.condition as Record<string, any>;
      let matched = false;

      switch (rule.rule_category) {
        case "feature_count":
          if (cond.min_features && featureCount >= cond.min_features) matched = true;
          break;
        case "feature_type":
          if (cond.feature_id && featureIds.includes(cond.feature_id)) matched = true;
          if (cond.category === "premium" && featureIds.some(id => premiumFeatures.includes(id))) matched = true;
          break;
        case "budget":
          if (cond.min_total && totalBudget >= cond.min_total) matched = true;
          break;
        case "urgency":
          if (cond.has_special_request && hasSpecialRequest) matched = true;
          break;
      }

      if (matched) score += rule.points;
    }

    // Cap at 100
    score = Math.min(score, 100);
    const classification = classifyScore(score);

    // Get AI analysis
    let aiAnalysis = null;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a lead analyst. Given calculator data, provide a brief JSON analysis: { "summary": "1-2 sentence lead summary", "recommended_approach": "brief sales strategy", "upsell_opportunities": ["feature1", "feature2"] }. Be concise.`,
              },
              {
                role: "user",
                content: `Trade: ${body.trade}, Features: ${featureIds.join(", ")}, Budget: ${totalBudget} CZK/one-time + ${body.quoteMonthly} CZK/month, Special request: ${body.specialRequest || "none"}, Score: ${score}/100 (${classification})`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          try {
            aiAnalysis = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");
          } catch { /* ignore parse errors */ }
        }
      } catch (e) {
        console.error("AI analysis error:", e instanceof Error ? e.message : "Unknown");
      }
    }

    // Insert lead
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = req.headers.get("user-agent")?.substring(0, 500);

    const { data: lead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        trade: body.trade,
        gdpr_consent: true,
        consent_timestamp: new Date().toISOString(),
        score,
        classification,
        selected_features: body.selectedFeatures,
        special_request: body.specialRequest || null,
        quote_one_time: body.quoteOneTime,
        quote_monthly: body.quoteMonthly,
        labor_hours: body.laborHours,
        ai_analysis: aiAnalysis,
        source: "calculator",
        language: body.language || "en",
        ip_address: clientIp || null,
        user_agent: userAgent || null,
      })
      .select("id, score, classification")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to save lead." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record initial score in history
    await supabaseAdmin.from("lead_score_history").insert({
      lead_id: lead.id,
      old_score: 0,
      new_score: score,
      new_classification: classification,
      reason: "Initial calculator submission scoring",
    });

    // Record activity
    await supabaseAdmin.from("lead_activities").insert({
      lead_id: lead.id,
      activity_type: "created",
      description: `Lead created from calculator. Trade: ${body.trade}, Score: ${score} (${classification})`,
      metadata: { features_count: featureCount, quote_total: totalBudget },
    });

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        score,
        classification,
        aiAnalysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("score-lead error:", e instanceof Error ? e.message : "Unknown");
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
