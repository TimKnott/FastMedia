import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExitIntent, recordVisitorSignal } from '@/hooks/useVisitorSafeguards';
import { Rocket } from 'lucide-react';

/**
 * On-site conversion safeguard: when a visitor moves to leave, offer the price
 * calculator and a call-back. Never shown on admin or portal routes.
 */
const ExitIntentOffer = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const cs = language !== 'en';
  const excluded = /^\/(admin|portal|showcase)/.test(pathname);
  const { triggered, dismiss } = useExitIntent(!excluded);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (excluded) return null;

  const submit = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setSent(true);
    await recordVisitorSignal({
      kind: 'high_value',
      email,
      language,
      payload: { intent: 'exit_intent_callback' },
    });
  };

  return (
    <Dialog open={triggered} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-accent" />
            {cs ? 'Než odejdete…' : 'Before you go…'}
          </DialogTitle>
          <DialogDescription>
            {cs
              ? 'Spočítejte si cenu webu za dvě minuty, nebo nám nechte e-mail a ozveme se s orientační nabídkou.'
              : 'Price your website in two minutes, or leave your email and we will come back with an indicative quote.'}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <p className="text-sm text-muted-foreground">
            {cs ? 'Děkujeme — ozveme se vám e-mailem.' : 'Thank you — we will email you shortly.'}
          </p>
        ) : (
          <div className="space-y-3">
            <Button asChild className="w-full" onClick={dismiss}>
              <Link to="/calculator">{cs ? 'Spočítat cenu' : 'Price my website'}</Link>
            </Button>
            <div className="flex gap-2">
              <Input
                type="email"
                inputMode="email"
                placeholder={cs ? 'vas@email.cz' : 'you@example.com'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button variant="secondary" onClick={submit}>
                {cs ? 'Ozvěte se mi' : 'Call me back'}
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={dismiss}>
              {cs ? 'Ne, děkuji' : 'No thanks'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentOffer;
