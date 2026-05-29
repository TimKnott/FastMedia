import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

export type CartItem = { name: string; amount: number; quantity: number; productId?: string };

interface StripeEmbeddedCheckoutProps {
  priceId?: string;
  quantity?: number;
  cart?: CartItem[];
  source?: "package" | "hosting" | "eshop_demo" | "calculator";
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  userId?: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout(props: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        ...props,
        environment: getStripeEnvironment(),
        returnUrl: props.returnUrl
          || `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || (data as { error?: string })?.error || "Failed to create checkout session");
    }
    return data.clientSecret;
  };

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
