// Creates a Stripe Billing Portal session so customers can manage
// their subscription, payment method, invoices, and cancel.
// Accepts { customer_id?: string, email?: string, return_url?: string }.
// If no customer_id is provided, looks up the customer by email.

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";

const env = (k: string) => Deno.env.get(k) ?? "";

function getStripe(envParam: "sandbox" | "live") {
  const key =
    envParam === "live"
      ? env("STRIPE_LIVE_API_KEY") || env("STRIPE_API_KEY")
      : env("STRIPE_SANDBOX_API_KEY");
  if (!key) throw new Error(`Missing Stripe API key for env=${envParam}`);
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const envParam = (url.searchParams.get("env") ?? "sandbox") as "sandbox" | "live";

    const body = await req.json().catch(() => ({}));
    const { customer_id, email, return_url } = body as {
      customer_id?: string;
      email?: string;
      return_url?: string;
    };

    if (!customer_id && !email) {
      return new Response(
        JSON.stringify({ error: "customer_id or email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = getStripe(envParam);

    let resolvedCustomerId = customer_id;
    if (!resolvedCustomerId && email) {
      const found = await stripe.customers.list({ email: email.toLowerCase().trim(), limit: 1 });
      if (found.data.length === 0) {
        return new Response(
          JSON.stringify({ error: "No customer found for this email. Complete a purchase first." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      resolvedCustomerId = found.data[0].id;
    }

    const origin = req.headers.get("origin") ?? "https://fastmedia.pro";
    const session = await stripe.billingPortal.sessions.create({
      customer: resolvedCustomerId!,
      return_url: return_url || `${origin}/`,
    });

    console.log("[payments-customer-portal] created session", {
      env: envParam,
      customer: resolvedCustomerId,
    });

    return new Response(JSON.stringify({ url: session.url }), {
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
