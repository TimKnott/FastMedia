import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("[webhook] subscription missing userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // Pull line-item details for the order record
  const stripe = createStripeClient(env);
  let priceId = session.metadata?.priceId ?? null;
  let productId = session.metadata?.productId ?? null;
  let cart: any = null;
  if (session.metadata?.cart) {
    try { cart = JSON.parse(session.metadata.cart); } catch { /* ignore */ }
  }
  if (!priceId) {
    try {
      const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 50 });
      if (items.data.length && !cart) {
        cart = items.data.map((li: any) => ({
          name: li.description,
          amount: li.amount_total,
          quantity: li.quantity,
        }));
      }
    } catch (e) {
      console.warn("[webhook] could not fetch line items", e);
    }
  }

  await getSupabase().from("payment_orders").upsert(
    {
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      user_id: session.metadata?.userId ?? null,
      source: session.metadata?.source ?? "package",
      price_id: priceId,
      product_id: productId,
      cart,
      amount_total: session.amount_total ?? 0,
      currency: (session.currency ?? "czk").toLowerCase(),
      status: session.payment_status === "paid" ? "paid" : (session.payment_status ?? "pending"),
      environment: env,
      metadata: session.metadata ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" },
  );

  // Fire admin notification (best-effort)
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        type: "payment_received",
        subject: `New payment: ${((session.amount_total ?? 0) / 100).toFixed(0)} ${(session.currency ?? "czk").toUpperCase()}`,
        details: {
          source: session.metadata?.source,
          email: session.customer_details?.email,
          session_id: session.id,
          environment: env,
        },
      }),
    });
  } catch (e) {
    console.warn("[webhook] notify-admin failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("[webhook] invalid env", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("[webhook]", event.type, env);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      default:
        console.log("[webhook] unhandled", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[webhook] error", e);
    return new Response("Webhook error", { status: 400 });
  }
});
