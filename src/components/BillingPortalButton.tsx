import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
const environment: "sandbox" | "live" = clientToken?.startsWith("pk_test_") ? "sandbox" : "live";

interface BillingPortalButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Stripe customer id (preferred) */
  customerId?: string;
  /** Email fallback used to look up the Stripe customer */
  email?: string;
  /** Where Stripe sends the customer when they finish */
  returnUrl?: string;
  label?: string;
}

/**
 * Opens Stripe's hosted Billing Portal in a NEW TAB so customers can update
 * payment methods, view invoices, and cancel/change their subscription.
 * The portal cannot be embedded in an iframe.
 */
export function BillingPortalButton({
  customerId,
  email,
  returnUrl,
  label = "Manage billing",
  variant = "outline",
  size,
  className,
  ...rest
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!customerId && !email) {
      toast.error("We need your email or customer ID to open the billing portal.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payments-customer-portal", {
        body: {
          customer_id: customerId,
          email,
          return_url: returnUrl ?? window.location.href,
          environment,
        },
      });
      if (error) throw error;
      const url = (data as { url?: string; error?: string })?.url;
      if (!url) {
        throw new Error((data as { error?: string })?.error ?? "No portal URL returned.");
      }
      // Must open in a new tab — the portal cannot be embedded in an iframe,
      // so it won't work inside the Lovable preview frame.
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open the billing portal.";
      console.error("[BillingPortalButton]", e);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {label}
    </Button>
  );
}

export default BillingPortalButton;
