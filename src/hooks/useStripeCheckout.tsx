import { useState, useCallback } from "react";
import { StripeEmbeddedCheckout, type CartItem } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckoutOptions {
  priceId?: string;
  quantity?: number;
  cart?: CartItem[];
  source?: "package" | "hosting" | "eshop_demo" | "calculator";
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  userId?: string;
  title?: string;
}

export function useStripeCheckout() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<CheckoutOptions | null>(null);

  const openCheckout = useCallback((opts: CheckoutOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  const checkoutElement = (
    <Dialog open={isOpen} onOpenChange={(o) => (o ? null : closeCheckout())}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{options?.title || "Checkout"}</DialogTitle>
        </DialogHeader>
        {isOpen && options && <StripeEmbeddedCheckout {...options} />}
      </DialogContent>
    </Dialog>
  );

  return { openCheckout, closeCheckout, isOpen, checkoutElement };
}
