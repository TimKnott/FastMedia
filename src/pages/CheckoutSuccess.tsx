import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Post-checkout success page.
 * Stripe Embedded Checkout redirects here with ?session_id={CHECKOUT_SESSION_ID}.
 * We optionally accept ?email=... so the Manage Billing button can resolve the
 * customer without an extra fetch. Falls back to a small email form.
 */
const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const emailFromUrl = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailFromUrl);
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  return (
    <>
      <SEOHead
         title={en ? 'Payment Successful — FastMedia.Pro' : 'Platba proběhla úspěšně — FastMedia.Pro'}
         description={en ? 'Your subscription is active. Manage billing, view invoices, or update your payment method.' : 'Vaše předplatné je aktivní. Spravujte platby, faktury a platební metodu.'}
        canonical="/checkout/success"
        noindex
      />
      <Navbar />
      <main className="min-h-[70vh] bg-background py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-border/60">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
               <CardTitle className="text-3xl font-display">{en ? 'Payment successful' : 'Platba proběhla úspěšně'}</CardTitle>
              <CardDescription className="text-base">
                 {en ? 'Thanks — your purchase is confirmed and a receipt is on its way to your inbox.' : 'Děkujeme — nákup je potvrzen a doklad míří do vaší e-mailové schránky.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sessionId && (
                <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
                   <span className="font-medium text-foreground">{en ? 'Reference:' : 'Číslo objednávky:'}</span>{" "}
                  <code className="text-xs break-all">{sessionId}</code>
                </div>
              )}

              <div className="space-y-3">
                 <h3 className="font-semibold">{en ? 'Manage your subscription' : 'Správa předplatného'}</h3>
                <p className="text-sm text-muted-foreground">
                   {en ? 'Open the secure billing portal to update your payment method, download invoices, switch plans, or cancel at any time.' : 'V bezpečném platebním portálu můžete změnit platební metodu, stáhnout faktury, přejít na jiný tarif nebo předplatné zrušit.'}
                </p>

                {!emailFromUrl && (
                  <div className="space-y-2">
                     <Label htmlFor="success-email">{en ? 'Email used at checkout' : 'E-mail použitý při platbě'}</Label>
                    <Input
                      id="success-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <BillingPortalButton
                    email={email || undefined}
                    returnUrl={`${window.location.origin}/account`}
                    variant="default"
                     label={en ? 'Manage billing' : 'Spravovat platby'}
                  />
                  <Button asChild variant="ghost">
                    <Link to="/account">
                       {en ? 'Go to your account' : 'Přejít do účtu'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6 text-sm text-muted-foreground">
                 {en ? 'Need help? Email' : 'Potřebujete pomoc? Napište na'}{" "}
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

export default CheckoutSuccess;
