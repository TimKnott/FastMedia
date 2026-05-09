import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { Loader2, UserCircle2 } from "lucide-react";

/**
 * Customer account page. If the visitor is logged in, we use their email
 * to open the Stripe Billing Portal. If not, they can enter the email used
 * at checkout to access the same portal.
 */
const Account = () => {
  const [loading, setLoading] = useState(true);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setAuthedEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthedEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Your Account — FastMedia.Pro"
        description="Manage your subscription, billing details, and invoices."
        canonical="/account"
        noindex
      />
      <Navbar />
      <main className="min-h-[70vh] bg-background py-24 px-4">
        <div className="container mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-display font-semibold">Your account</h1>
            <p className="text-muted-foreground">
              Manage your subscription, payment method, and invoices.
            </p>
          </header>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Subscription &amp; billing</CardTitle>
                  <CardDescription>
                    Open the secure billing portal to change plan, update card, view invoices, or cancel.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your account…
                </div>
              ) : authedEmail ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/40 p-4 text-sm">
                    <span className="text-muted-foreground">Signed in as </span>
                    <span className="font-medium">{authedEmail}</span>
                  </div>
                  <BillingPortalButton
                    email={authedEmail}
                    returnUrl={`${window.location.origin}/account`}
                    variant="default"
                    label="Manage billing"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the email you used at checkout to open your billing portal.
                  </p>
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="guest-email">Email</Label>
                    <Input
                      id="guest-email"
                      type="email"
                      placeholder="you@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                  <BillingPortalButton
                    email={guestEmail || undefined}
                    returnUrl={`${window.location.origin}/account`}
                    variant="default"
                    label="Open billing portal"
                  />
                </div>
              )}

              <div className="border-t pt-4 text-sm text-muted-foreground">
                The portal opens in a new tab. Need help? Email{" "}
                <a className="text-primary hover:underline" href="mailto:support@fastmedia.pro">
                  support@fastmedia.pro
                </a>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
