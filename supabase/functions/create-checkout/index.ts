import { type StripeEnv, createStripeClient, resolveOrCreateCustomer } from "../_shared/stripe.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CartItem = { name: string; amount: number; quantity: number; productId?: string };
type CalculatorFeatureDef = { name: string; oneTimePrice: number; monthlyPrice: number; laborHours: number; allowMultiple?: boolean };

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

const BASE_WEBSITE_PRICE = 4990;
const BASE_HOSTING_PRICE = 1500;
const LABOR_RATE = 800;

const calculatorFeatureMap: Record<string, CalculatorFeatureDef> = {
  "contact-form": { name: "Contact Form", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  "booking-system": { name: "Booking System", oneTimePrice: 4500, monthlyPrice: 300, laborHours: 6, allowMultiple: true },
  gallery: { name: "Project Gallery", oneTimePrice: 2500, monthlyPrice: 100, laborHours: 3 },
  reviews: { name: "Reviews System", oneTimePrice: 2000, monthlyPrice: 100, laborHours: 3 },
  "google-maps": { name: "Google Maps", oneTimePrice: 1000, monthlyPrice: 0, laborHours: 1 },
  "social-media": { name: "Social Media Integration", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  blog: { name: "Blog / News", oneTimePrice: 3500, monthlyPrice: 200, laborHours: 5 },
  newsletter: { name: "Newsletter", oneTimePrice: 2500, monthlyPrice: 200, laborHours: 3 },
  analytics: { name: "Google Analytics", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  "seo-advanced": { name: "Advanced SEO", oneTimePrice: 3000, monthlyPrice: 0, laborHours: 4 },
  "live-chat": { name: "Live Chat", oneTimePrice: 3000, monthlyPrice: 300, laborHours: 4 },
  "multi-language": { name: "Multi-language", oneTimePrice: 5000, monthlyPrice: 200, laborHours: 8, allowMultiple: true },
  video: { name: "Video Section", oneTimePrice: 2500, monthlyPrice: 150, laborHours: 3 },
  ecommerce: { name: "E-commerce", oneTimePrice: 15000, monthlyPrice: 500, laborHours: 20 },
  crm: { name: "CRM System", oneTimePrice: 8000, monthlyPrice: 400, laborHours: 12 },
  "virtual-tour": { name: "Virtual Tour", oneTimePrice: 6000, monthlyPrice: 200, laborHours: 8 },
  "ai-chatbot": { name: "AI Chatbot", oneTimePrice: 8000, monthlyPrice: 500, laborHours: 10 },
  "unified-inbox": { name: "Unified Inbox", oneTimePrice: 6000, monthlyPrice: 400, laborHours: 8 },
  "auto-invoicing": { name: "Auto Invoicing & Accounting", oneTimePrice: 8000, monthlyPrice: 500, laborHours: 10 },
  "customer-portal": { name: "Customer Portal", oneTimePrice: 10000, monthlyPrice: 500, laborHours: 15 },
  "whatsapp-button": { name: "WhatsApp Button", oneTimePrice: 500, monthlyPrice: 0, laborHours: 1 },
  "testimonial-video": { name: "Video Testimonials", oneTimePrice: 3000, monthlyPrice: 150, laborHours: 4 },
  "price-calculator": { name: "Price Calculator", oneTimePrice: 5000, monthlyPrice: 200, laborHours: 6 },
  "before-after": { name: "Before & After Gallery", oneTimePrice: 2000, monthlyPrice: 100, laborHours: 3 },
  "lead-scoring": { name: "Lead Scoring", oneTimePrice: 4000, monthlyPrice: 300, laborHours: 5 },
  "sms-notifications": { name: "SMS Notifications", oneTimePrice: 2000, monthlyPrice: 200, laborHours: 3 },
  "payment-gateway": { name: "Payment Gateway", oneTimePrice: 5000, monthlyPrice: 300, laborHours: 6 },
  heatmaps: { name: "Heatmaps & Behavior Analysis", oneTimePrice: 2000, monthlyPrice: 150, laborHours: 2 },
  "ab-testing": { name: "A/B Testing", oneTimePrice: 3000, monthlyPrice: 200, laborHours: 4 },
  "error-monitoring": { name: "Error Monitoring", oneTimePrice: 1500, monthlyPrice: 100, laborHours: 2 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body: Body = await req.json();
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl = body.returnUrl || `${req.headers.get("origin") || ""}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const source = body.source || (body.priceId ? "package" : "eshop_demo");

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
    } else if (body.cart && body.cart.length) {
      // Dynamic price_data for the demo eshop
      lineItems = body.cart.map((item) => ({
        price_data: {
          currency: "czk",
          product_data: { name: item.name },
          unit_amount: Math.round(item.amount),
        },
        quantity: item.quantity,
      }));
      productDescription = `Eshop order (${body.cart.length} items)`;
      useManaged = false;
    } else {
      throw new Error("Either priceId or cart must be provided");
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
        ...(body.cart && { cart: JSON.stringify(body.cart).slice(0, 450) }),
        ...(body.metadata || {}),
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
