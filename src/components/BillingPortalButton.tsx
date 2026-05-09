import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BillingPortalButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Stripe customer id, e.g. "cus_..." (preferred when available) */
  customerId?: string;
  /** Customer email — used as fallback to look up the Stripe customer */
  email?: string;
  /** Where to send the customer after they finish in the portal */
  returnUrl?: string;
  /** Use the live Stripe environment instead of sandbox/test */
  live?: boolean;
  label?: string;
}

/**
 * Opens the Stripe-hosted Billing Portal so customers can update payment
 * methods, view invoices, and cancel or change their subscription.
 */
export function BillingPortalButton({
  customerId,
  email,
  returnUrl,
  live = false,
  label = "Manage billing",
  variant = "outline",
  size,
  className,
  ...rest
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!customerId && !email) {
      toast.error("Missing customer details to open the billing portal.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `payments-customer-portal?env=${live ? "live" : "sandbox"}`,
        {
          body: {
            customer_id: customerId,
            email,
            return_url: returnUrl ?? window.location.href,
          },
        },
      );
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("No portal URL returned.");
      window.location.assign(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open the billing portal.";
      console.error("[BillingPortalButton]", e);
      toast.error(msg);
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
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

export default BillingPortalButton;
