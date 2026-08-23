import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
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
  intent?: Record<string, unknown> | null;
  intentSummary?: string | null;
  intentTranscript?: { key: string; question: string; answer: string }[] | null;
}

function classifyScore(score: number): string {
  if (score >= 80) return "high_priority";
  if (score >= 50) return "hot";
  if (score >= 25) return "warm";
  return "cold";
}

// Bucket the project's total first-year cost (one-time + 12 months) into a
// queryable budget band so admins can filter/report by bracket.
function classifyBudget(oneTime: number, monthly: number): string {
  const firstYear = (Number(oneTime) || 0) + (Number(monthly) || 0) * 12;
  if (firstYear < 25_000) return "under_25k";
  if (firstYear < 50_000) return "25k_50k";
  if (firstYear < 100_000) return "50k_100k";
  if (firstYear < 250_000) return "100k_250k";
  return "over_250k";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limit by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Merge conversational intake brief into ai_analysis
    if (body.intent || body.intentSummary || body.intentTranscript) {
      aiAnalysis = {
        ...(aiAnalysis || {}),
        intake: {
          summary: body.intentSummary || null,
          intent: body.intent || null,
          transcript: body.intentTranscript || null,
        },
      };
    }

    // Insert lead
    const leadIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
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
        budget_range: classifyBudget(body.quoteOneTime, body.quoteMonthly),
        ai_analysis: aiAnalysis,
        source: "calculator",
        language: body.language || "en",
        ip_address: leadIp || null,
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

    // Helper: invoke transactional email and verify it lands in email_send_log
    // BEFORE this edge function returns. We:
    //   1. Use a real fetch with an explicit timeout.
    //   2. Always consume the response body (Deno will otherwise abort the
    //      request when the isolate shuts down — the #1 cause of "the email
    //      function was never called").
    //   3. Log the dispatcher's HTTP status + body so non-2xx responses show
    //      up in score-lead logs instead of being silently swallowed.
    //   4. Poll email_send_log briefly for the idempotency key so we don't
    //      return until the queue insert has actually happened.
    const SEND_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const sendEmail = async (
      templateName: string,
      recipientEmail: string,
      idempotencyKey: string,
      templateData: Record<string, any>,
    ): Promise<{ ok: boolean; status?: number; error?: string; queued?: boolean }> => {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 15_000);
      try {
        const res = await fetch(SEND_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE}`,
            apikey: ANON || SERVICE_ROLE,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ templateName, recipientEmail, idempotencyKey, templateData }),
          signal: ctrl.signal,
        });
        // ALWAYS read the body so the request is not torn down when the
        // isolate shuts down. Without this, Deno may abort the inflight
        // request the moment the outer function returns.
        const text = await res.text().catch(() => "");

        if (!res.ok) {
          console.error(
            `[score-lead] send-transactional-email http ${res.status} for ${templateName} (${idempotencyKey}): ${text.slice(0, 500)}`,
          );
        } else {
          console.log(
            `[score-lead] send-transactional-email ok for ${templateName} (${idempotencyKey})`,
          );
        }

        // Verify the queue insert actually happened. We poll briefly because
        // send-transactional-email may insert the email_send_log row right
        // before responding.
        let queued = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data: logRows, error: logErr } = await supabaseAdmin
            .from("email_send_log")
            .select("id, status")
            .eq("idempotency_key", idempotencyKey)
            .limit(1);
          if (logErr) {
            console.error(`[score-lead] email_send_log query error (${idempotencyKey}):`, logErr.message);
            break;
          }
          if (logRows && logRows.length > 0) {
            queued = true;
            console.log(
              `[score-lead] email_send_log row confirmed for ${idempotencyKey} (status=${logRows[0].status})`,
            );
            break;
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        if (!queued && res.ok) {
          console.error(
            `[score-lead] dispatcher returned ${res.status} but no email_send_log row found for ${idempotencyKey}`,
          );
        }

        return { ok: res.ok, status: res.status, queued, error: res.ok ? undefined : text.slice(0, 500) };
      } catch (notifyErr) {
        const message = notifyErr instanceof Error ? notifyErr.message : String(notifyErr);
        console.error(`[score-lead] send-transactional-email fetch failed (${templateName}, ${idempotencyKey}): ${message}`);
        return { ok: false, error: message };
      } finally {
        clearTimeout(timeout);
      }
    };


    const adminEmail = Deno.env.get("PRIVATE_FORWARD_EMAIL") || Deno.env.get("NOTIFICATION_EMAIL") || "support@fastmedia.pro";
    const intakeSummary = body.intentSummary || aiAnalysis?.summary || null;

    // Always: notify admin a new lead is ready for review
    await sendEmail("lead-notification", adminEmail, `lead-notify-${lead.id}`, {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      trade: body.trade,
      score,
      classification,
      quoteOneTime: body.quoteOneTime,
      specialRequest: body.specialRequest || undefined,
    });

    // Always: confirm receipt to the client
    await sendEmail("intake-received", body.email.trim().toLowerCase(), `intake-received-${lead.id}`, {
      recipientName: body.name.trim().split(" ")[0],
      trade: body.trade,
      summary: intakeSummary || undefined,
    });

    // Hot / high_priority: auto-create a client_projects draft in `in_review`
    let autoProjectId: string | null = null;
    if (classification === "hot" || classification === "high_priority") {
      try {
        const feeLineItems = (body.selectedFeatures || []).slice(0, 50).map((f) => ({
          label: f.id,
          quantity: Number(f.quantity) || 1,
          unit_price: 0,
        }));

        // Inline draft agreement so the portal "View draft agreement" CTA shows
        // immediately. Admin can edit it freely from the back-office afterwards.
        const draftAgreement = `PRIVATE & CONFIDENTIAL

To: ${body.name.trim()}
From: FastMedia.Pro
Date: ${new Date().toLocaleDateString("en-GB")}

Dear ${body.name.trim()},

Thank you for choosing FastMedia.Pro for your ${body.trade} project. Below is the draft Service Contract for your review.

DOCUMENT 1: MASTER WEBSITE DEVELOPMENT & SERVICE CONTRACT

Between: FastMedia.Pro (the "Service Provider")
And: ${body.name.trim()} (the "Client")

1.0 PROJECT SCOPE
Delivery of a bespoke ${body.trade} website covering the features captured in your intake brief.

2.0 FINANCIAL TERMS
- Development Fee: ${(Number(body.quoteOneTime) || 0).toLocaleString("en-GB")} CZK (one-time), payable as a 25% deposit to start the project, balance on launch.
- Hosting & Maintenance: ${(Number(body.quoteMonthly) || 0).toLocaleString("en-GB")} CZK per month (annual billing available).
- All figures exclude VAT.

3.0 INTAKE BRIEF
${intakeSummary || body.specialRequest || "Captured during the conversational intake."}

4.0 NEXT STEPS
A senior FastMedia.Pro consultant will personally review this draft within one working day, refine the figures and scope, and then re-issue the final agreement for your signature ahead of the deposit invoice.

This is a working draft — no payment is due until you have approved the final version.

— FastMedia.Pro`;

        const { data: project, error: projErr } = await supabaseAdmin
          .from("client_projects")
          .insert({
            name: `${body.name.trim()} — ${body.trade}`,
            client_name: body.name.trim(),
            client_email: body.email.trim().toLowerCase(),
            staging_url: "https://fastmedia.pro?lang=en",
            status: "in_review",
            currency: "CZK",
            dev_fee: Number(body.quoteOneTime) || 0,
            hosting_fee_yearly: (Number(body.quoteMonthly) || 0) * 12,
            fee_line_items: feeLineItems,
            agreement_template: draftAgreement,
            agreement_terms: {
              source: "auto_intake",
              lead_id: lead.id,
              classification,
              score,
              intake_summary: intakeSummary,
              special_request: body.specialRequest || null,
            },
          })
          .select("id, slug, name")
          .single();

        if (projErr) {
          console.error("Auto-create project error:", projErr.message);
        } else if (project) {
          autoProjectId = project.id;

          // Issue a portal access token so the client gets a working private link.
          const tokenBytes = new Uint8Array(32);
          crypto.getRandomValues(tokenBytes);
          const portalToken = Array.from(tokenBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          const tokenExpiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();

          const { error: tokenErr } = await supabaseAdmin
            .from("project_access_tokens")
            .insert({
              project_id: project.id,
              token: portalToken,
              email: body.email.trim().toLowerCase(),
              expires_at: tokenExpiresAt,
            });
          if (tokenErr) console.error("Token insert error:", tokenErr.message);

          const safeSlug = (project.slug || "").replace(/[^a-z0-9-]/gi, "").toLowerCase();
          const clientPortalUrl = safeSlug
            ? `https://fastmedia.pro/portal/${safeSlug}/${portalToken}`
            : `https://fastmedia.pro/portal/${portalToken}`;
          // CORRECT admin route — App.tsx mounts AdminClientProjectDetail at /admin/client-projects/:id
          const adminProjectUrl = `https://fastmedia.pro/admin/client-projects/${project.id}`;

          await supabaseAdmin.from("project_audit_log").insert({
            project_id: project.id,
            actor_type: "system",
            actor_label: "score-lead auto-promotion",
            action: "auto_draft_created",
            details: { lead_id: lead.id, classification, score, portal_url: clientPortalUrl },
          });
          await supabaseAdmin.from("lead_activities").insert({
            lead_id: lead.id,
            activity_type: "promoted",
            description: `Auto-promoted to draft project (${classification}). Project ${project.id}`,
            metadata: { project_id: project.id, project_slug: project.slug, portal_url: clientPortalUrl },
          });

          // Admin: notify the draft is ready for internal review (correct URL)
          await sendEmail("client-stage-update", adminEmail, `stage-admin-draft-${project.id}`, {
            audience: "admin",
            stage: "draft_created",
            projectName: project.name,
            clientEmail: body.email.trim().toLowerCase(),
            portalUrl: adminProjectUrl,
          });

          // Client: branded portal link with the draft agreement ready to view
          await sendEmail("client-stage-update", body.email.trim().toLowerCase(), `stage-client-draft-${project.id}`, {
            audience: "client",
            stage: "draft_created",
            recipientName: body.name.trim().split(" ")[0],
            projectName: project.name,
            portalUrl: clientPortalUrl,
          });
        }
      } catch (autoErr) {
        console.error("Auto-promotion error (non-blocking):", autoErr instanceof Error ? autoErr.message : "Unknown");
      }
    }



    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        score,
        classification,
        aiAnalysis,
        autoProjectId,
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
