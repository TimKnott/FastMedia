import { type StripeEnv, createStripeClient, resolveOrCreateCustomer } from "../_shared/stripe.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { BASE_WEBSITE_PRICE, BASE_HOSTING_PRICE, LABOR_RATE, calculatorFeatureMap } from "../_shared/calculator-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CartItem = { name: string; amount: number; quantity: number; productId?: string };

interface Body {
  // Catalogue mode — recurring or one-off price already in Stripe
  priceId?: string;
  quantity?: number;
  // Dynamic mode — eshop demo cart
  cart?: CartItem[];
  // Common
  source?: "package" | "hosting" | "eshop_demo" | "calculator";
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  userId?: string;
  returnUrl?: string;
  environment: StripeEnv;
}

function parseCalculatorSelections(features = "") {
  return features
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const match = raw.match(/^([a-z0-9-]+)x(\d{1,2})$/);
      if (!match) throw new Error("Invalid calculator feature selection");
      const feature = calculatorFeatureMap[match[1]];
      if (!feature) throw new Error("Unknown calculator feature");
      const requestedQty = Math.max(1, Math.min(20, Number(match[2])));
      return { id: match[1], feature, quantity: feature.allowMultiple ? requestedQty : 1 };
    });
}

async function calculateCouponDiscount(code: string | undefined, oneTimeAmount: number, monthlyAmount: number) {
  if (!code?.trim()) return { oneTimeDiscount: 0, monthlyDiscount: 0, code: "" };
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) throw new Error("Coupon validation is not configured");

  const supabase = createClient(supabaseUrl, serviceKey);
  const normalized = code.trim().toUpperCase();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", normalized)
    .maybeSingle();

  if (error) throw error;
  if (!coupon || !coupon.is_active) throw new Error("Coupon is not valid");
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) throw new Error("Coupon is not valid yet");
  if (coupon.valid_until && new Date(coupon.valid_until) < now) throw new Error("Coupon has expired");
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) throw new Error("Coupon usage limit reached");

  const applies = coupon.applies_to as "one_time" | "monthly" | "both";
  const baseAmount = applies === "monthly" ? monthlyAmount : applies === "one_time" ? oneTimeAmount : oneTimeAmount + monthlyAmount;
  if (baseAmount < Number(coupon.min_amount || 0)) throw new Error("Coupon minimum amount not met");

  let oneTimeDiscount = 0;
  let monthlyDiscount = 0;
  const value = Number(coupon.discount_value);
  if (coupon.discount_type === "percentage") {
    if (applies === "one_time" || applies === "both") oneTimeDiscount = Math.round((oneTimeAmount * value) / 100);
    if (applies === "monthly" || applies === "both") monthlyDiscount = Math.round((monthlyAmount * value) / 100);
  } else if (applies === "one_time") {
    oneTimeDiscount = Math.min(value, oneTimeAmount);
  } else if (applies === "monthly") {
    monthlyDiscount = Math.min(value, monthlyAmount);
  } else {
    const total = oneTimeAmount + monthlyAmount;
    if (total > 0) {
      oneTimeDiscount = Math.min(oneTimeAmount, Math.round((value * oneTimeAmount) / total));
      monthlyDiscount = Math.min(monthlyAmount, value - oneTimeDiscount);
    }
  }
  return { oneTimeDiscount, monthlyDiscount, code: coupon.code };
}

async function buildCalculatorCart(metadata: Record<string, string> = {}) {
  const selected = parseCalculatorSelections(metadata.features || "");
  const oneTime = selected.reduce((sum, item) => sum + item.feature.oneTimePrice * item.quantity, BASE_WEBSITE_PRICE);
  const laborHours = selected.reduce((sum, item) => sum + item.feature.laborHours * item.quantity, 0);
  const laborCost = laborHours * LABOR_RATE;
  const monthly = selected.reduce((sum, item) => sum + item.feature.monthlyPrice * item.quantity, BASE_HOSTING_PRICE);
  const oneTimeWithLabor = oneTime + laborCost;
  const hostingAnnual = monthly * 12;
  const coupon = await calculateCouponDiscount(metadata.coupon, oneTimeWithLabor, monthly);
  const totalAnnualDiscount = coupon.oneTimeDiscount + coupon.monthlyDiscount * 12;

  const cart = [
    { name: "Base website", amount: BASE_WEBSITE_PRICE * 100, quantity: 1, productId: "base_website" },
    ...selected.map(({ id, feature, quantity }) => ({ name: feature.name, amount: feature.oneTimePrice * 100, quantity, productId: id })),
    ...(laborCost > 0 ? [{ name: `Labor & Implementation (${laborHours} hrs)`, amount: laborCost * 100, quantity: 1, productId: "labor" }] : []),
    { name: "Hosting & maintenance — 12 months prepaid", amount: hostingAnnual * 100, quantity: 1, productId: "hosting_annual" },
  ];

  if (totalAnnualDiscount > 0) {
    const discountMinor = totalAnnualDiscount * 100;
    const totalMinor = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    if (totalMinor <= discountMinor) throw new Error("Coupon discount exceeds order total");
    const ratio = (totalMinor - discountMinor) / totalMinor;
    for (const item of cart) item.amount = Math.max(1, Math.round(item.amount * ratio));
  }

  return {
    cart,
    metadata: {
      verifiedTotalCzk: String(oneTimeWithLabor + hostingAnnual - totalAnnualDiscount),
      checkoutTotalToday: String(oneTimeWithLabor + hostingAnnual - totalAnnualDiscount),
      annualHostingCzk: String(hostingAnnual),
      monthlyHostingCzk: String(monthly),
      coupon: coupon.code,
    },
  };
}

const ALLOWED_RETURN_ORIGINS = new Set([
  "https://www.fastmedia.pro",
  "https://fastmedia.pro",
  "https://fastmedia.lovable.app",
  "https://id-preview--faf4a9b8-8a61-403f-9d1f-15d5029793d2.lovable.app",
  "http://localhost:8080",
]);
const DEFAULT_RETURN_PATH = "/checkout/success?session_id={CHECKOUT_SESSION_ID}";

function safeReturnUrl(requested: string | undefined, origin: string | null): string {
  const fallbackOrigin = origin && ALLOWED_RETURN_ORIGINS.has(origin) ? origin : "https://www.fastmedia.pro";
  if (!requested) return `${fallbackOrigin}${DEFAULT_RETURN_PATH}`;
  try {
    const u = new URL(requested.replace("{CHECKOUT_SESSION_ID}", "SESSION_PLACEHOLDER"));
    if (!ALLOWED_RETURN_ORIGINS.has(u.origin)) return `${fallbackOrigin}${DEFAULT_RETURN_PATH}`;
    return requested;
  } catch {
    return `${fallbackOrigin}${DEFAULT_RETURN_PATH}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body: Body = await req.json();
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl = safeReturnUrl(body.returnUrl, req.headers.get("origin"));
    const source = body.source || (body.priceId ? "package" : "eshop_demo");
    // Never trust client-supplied prices: only server-built calculator carts are allowed.
    let requestCart: CartItem[] | undefined = undefined;
    let verifiedMetadata: Record<string, string> = {};

    if (source === "calculator") {
      const verified = await buildCalculatorCart(body.metadata || {});
      requestCart = verified.cart;
      verifiedMetadata = verified.metadata;
    }

    const stripe = createStripeClient(env);

    const customerId = (body.customerEmail || body.userId)
      ? await resolveOrCreateCustomer(stripe, {
          email: body.customerEmail,
          userId: body.userId,
          name: body.customerName,
        })
      : undefined;

    let lineItems: any[] = [];
    let isRecurring = false;
    let mode: "payment" | "subscription" = "payment";
    let productDescription: string | undefined;
    let priceIdForRecord: string | undefined;
    let productIdForRecord: string | undefined;
    let useManaged = source !== "eshop_demo"; // physical goods => automatic_tax only

    if (body.priceId) {
      if (!/^[a-zA-Z0-9_-]+$/.test(body.priceId)) throw new Error("Invalid priceId");
      const prices = await stripe.prices.list({ lookup_keys: [body.priceId] });
      if (!prices.data.length) throw new Error("Price not found");
      const stripePrice = prices.data[0];
      isRecurring = stripePrice.type === "recurring";
      mode = isRecurring ? "subscription" : "payment";
      const productId = typeof stripePrice.product === "string"
        ? stripePrice.product
        : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);
      productDescription = product.name;
      priceIdForRecord = body.priceId;
      productIdForRecord = productId;
      lineItems = [{ price: stripePrice.id, quantity: body.quantity || 1 }];
    } else if (requestCart && requestCart.length) {
      // Dynamic price_data for calculator-built packages.
      lineItems = requestCart.map((item) => ({
        price_data: {
          currency: "czk",
          product_data: { name: item.name },
          unit_amount: Math.round(item.amount),
        },
        quantity: item.quantity,
      }));
      productDescription = source === "calculator" ? `Website package (${requestCart.length} items)` : `Eshop order (${requestCart.length} items)`;
      useManaged = false;
    } else {
      throw new Error("Either priceId or a calculator selection must be provided");
    }

    const sessionParams: any = {
      line_items: lineItems,
      mode,
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerId && { customer: customerId }),
      ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
      metadata: {
        source,
        ...(body.userId && { userId: body.userId }),
        ...(priceIdForRecord && { priceId: priceIdForRecord }),
        ...(productIdForRecord && { productId: productIdForRecord }),
        ...(requestCart && { cart: JSON.stringify(requestCart).slice(0, 450) }),
        ...(body.metadata || {}),
        ...verifiedMetadata,
      },
      ...(isRecurring && body.userId && {
        subscription_data: { metadata: { userId: body.userId, source } },
      }),
      ...(useManaged
        ? { managed_payments: { enabled: true } }
        : { automatic_tax: { enabled: true } }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[create-checkout]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
