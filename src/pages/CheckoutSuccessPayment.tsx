import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Receipt, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OrderRow {
  id: string;
  amount_total: number;
  currency: string;
  status: string;
  source: string;
  customer_email: string | null;
}

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let tries = 0;
    const poll = async () => {
      const { data } = await supabase
        .from("payment_orders")
        .select("id, amount_total, currency, status, source, customer_email")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (data) {
        setOrder(data as OrderRow);
        setLoading(false);
        return;
      }
      tries += 1;
      if (tries < 10) setTimeout(poll, 1500);
      else setLoading(false);
    };
    poll();
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-card text-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-display font-bold text-foreground">Confirming your payment…</h1>
            <p className="text-sm text-muted-foreground mt-2">This usually takes a few seconds.</p>
          </>
        ) : order ? (
          <>
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-accent" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Payment received</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Thank you{order.customer_email ? `, ${order.customer_email}` : ""}. We've sent a confirmation by email.
            </p>
            <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-1 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">
                  {(order.amount_total / 100).toLocaleString()} {order.currency.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize text-foreground">{order.status}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link to="/account"><Receipt className="w-4 h-4" />My orders</Link>
              </Button>
              <Button asChild className="flex-1 gap-2">
                <Link to="/"><Home className="w-4 h-4" />Home</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-display font-bold text-foreground mb-2">Payment processed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {sessionId
                ? "We received your payment but haven't fully confirmed it yet. You'll get an email confirmation shortly."
                : "No session information found."}
            </p>
            <Button asChild>
              <Link to="/">Return home</Link>
            </Button>
          </>
        )}
      </motion.div>
    </main>
  );
};

export default CheckoutSuccess;
