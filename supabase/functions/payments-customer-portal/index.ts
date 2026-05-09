// Creates a Stripe Billing Portal session.
// Body: { customer_id?: string, email?: string, return_url?: string, environment: 'sandbox'|'live' }
// Returns: { url: string }

import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      customer_id,
      email,
      return_url,
      environment,
    } = body as {
      customer_id?: string;
      email?: string;
      return_url?: string;
      environment?: StripeEnv;
    };

    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    if (!customer_id && !email) {
      return new Response(
        JSON.stringify({ error: "customer_id or email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = createStripeClient(env);

    let resolvedCustomerId = customer_id;
    if (!resolvedCustomerId && email) {
      const normalized = email.toLowerCase().trim();
      const found = await stripe.customers.list({ email: normalized, limit: 1 });
      if (found.data.length === 0) {
        console.warn("[payments-customer-portal] no customer for email", normalized);
        return new Response(
          JSON.stringify({
            error: "No customer found for this email. Please complete a purchase first.",
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      resolvedCustomerId = found.data[0].id;
    }

    const origin = req.headers.get("origin") ?? "https://fastmedia.pro";
    const portal = await stripe.billingPortal.sessions.create({
      customer: resolvedCustomerId!,
      return_url: return_url || `${origin}/account`,
    });

    console.log("[payments-customer-portal] created", {
      env,
      customer: resolvedCustomerId,
    });

    return new Response(JSON.stringify({ url: portal.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[payments-customer-portal] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
