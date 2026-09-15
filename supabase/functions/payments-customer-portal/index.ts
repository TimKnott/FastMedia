// Creates a Stripe Billing Portal session for the AUTHENTICATED user only.
// Body: { return_url?: string, environment: 'sandbox'|'live' }
// Returns: { url: string }

import { createClient } from "npm:@supabase/supabase-js@2";
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
    // Require an authenticated Supabase user.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const { return_url, environment } = body as {
      return_url?: string;
      environment?: StripeEnv;
    };
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    // Resolve the Stripe customer ID strictly from data owned by the authed user.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let resolvedCustomerId: string | undefined;
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    resolvedCustomerId = (sub as { stripe_customer_id?: string } | null)?.stripe_customer_id ?? undefined;

    // Payments may not be configured yet in this environment. Return a clear,
    // friendly message instead of a raw 500 server error.
    const keyName = env === "live" ? "STRIPE_LIVE_API_KEY" : "STRIPE_SANDBOX_API_KEY";
    if (!Deno.env.get(keyName)) {
      console.warn("[payments-customer-portal] payments not configured", { env });
      return new Response(
        JSON.stringify({
          error:
            "The billing portal isn't available yet. Please email support@fastmedia.pro and we'll help with your subscription.",
          code: "payments_not_configured",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = createStripeClient(env);

    // Fallback: look up Stripe customer by the authenticated user's verified email only.
    if (!resolvedCustomerId && user.email) {
      const found = await stripe.customers.list({ email: user.email.toLowerCase().trim(), limit: 1 });
      if (found.data.length > 0) resolvedCustomerId = found.data[0].id;
    }

    if (!resolvedCustomerId) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer found for your account. Please complete a purchase first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const origin = req.headers.get("origin") ?? "https://fastmedia.pro";
    const portal = await stripe.billingPortal.sessions.create({
      customer: resolvedCustomerId,
      return_url: return_url || `${origin}/account`,
    });

    console.log("[payments-customer-portal] created", { env, user: user.id });

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
