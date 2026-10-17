import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { referralLink } from '@/lib/campaignStudio';

const REF_KEY = 'fm-referral-code';

const copy = {
  cs: { title: 'Partnerský program FastMedia.Pro', intro: 'Znáte firmu, která potřebuje lepší web? Doporučte ji a za úspěšná doporučení získáte odměnu podle pravidel programu.', join: 'Stát se partnerem', refer: 'Doporučit firmu', name: 'Jméno', email: 'E-mail', phone: 'Telefon', company: 'Firma', website: 'Web', consent: 'Souhlasím se zasíláním informací o partnerském programu e-mailem. Souhlas lze kdykoli odvolat.', submit: 'Odeslat', code: 'Váš partnerský kód', business: 'Název firmy', contact: 'Kontaktní osoba', notes: 'Proč potřebují nový web?', yourCode: 'Váš partnerský kód (nepovinné)', thanks: 'Děkujeme, doporučení jsme přijali.', closed: 'Registrace nových partnerů je momentálně pozastavena. Doporučení můžete poslat i tak.', terms: 'Pravidla programu', noTerms: 'Výši odměny a pravidla potvrdíme před prvním doporučením.' },
  en: { title: 'FastMedia.Pro Partner Programme', intro: 'Know a business that needs a better website? Refer them and earn rewards for successful referrals under the programme rules.', join: 'Become a referral partner', refer: 'Refer a business', name: 'Name', email: 'Email', phone: 'Phone', company: 'Company', website: 'Website', consent: 'I agree to receive partner programme emails. I can withdraw consent at any time.', submit: 'Submit', code: 'Your referral code', business: 'Business name', contact: 'Contact person', notes: 'Why do they need a new website?', yourCode: 'Your referral code (optional)', thanks: 'Thank you — referral received.', closed: 'New partner signups are paused right now. You can still send a referral.', terms: 'Programme rules', noTerms: 'We confirm reward amounts and rules with you before your first referral.' },
  de: { title: 'FastMedia.Pro Partnerprogramm', intro: 'Kennen Sie ein Unternehmen, das eine bessere Website braucht? Empfehlen Sie es und erhalten Sie gemäß den Programmregeln eine Prämie für erfolgreiche Empfehlungen.', join: 'Empfehlungspartner werden', refer: 'Unternehmen empfehlen', name: 'Name', email: 'E-Mail', phone: 'Telefon', company: 'Firma', website: 'Website', consent: 'Ich möchte E-Mails zum Partnerprogramm erhalten. Die Einwilligung kann ich jederzeit widerrufen.', submit: 'Senden', code: 'Ihr Empfehlungscode', business: 'Firmenname', contact: 'Ansprechpartner', notes: 'Warum braucht das Unternehmen eine neue Website?', yourCode: 'Ihr Empfehlungscode (optional)', thanks: 'Vielen Dank — Empfehlung erhalten.', closed: 'Neue Partneranmeldungen sind derzeit pausiert. Empfehlungen können Sie trotzdem senden.', terms: 'Programmregeln', noTerms: 'Prämienhöhe und Regeln bestätigen wir vor Ihrer ersten Empfehlung.' },
};

const joinSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(255), phone: z.string().max(40), company: z.string().max(160), website: z.string().max(300) });
const referSchema = z.object({ business: z.string().trim().min(2).max(160), email: z.union([z.literal(''), z.string().trim().email().max(255)]) });

const Partners = () => {
  const { language } = useLanguage();
  const t = copy[language] ?? copy.en;
  const [params] = useSearchParams();
  const [programme, setProgramme] = useState<{ is_open: boolean; terms: string | null } | null>(null);
  const [join, setJoin] = useState({ name: '', email: '', phone: '', company: '', website: '', consent: false });
  const [myCode, setMyCode] = useState<string | null>(null);
  const [ref, setRef] = useState({ code: '', business: '', contact: '', email: '', phone: '', website: '', notes: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromUrl = params.get('ref');
    if (fromUrl) localStorage.setItem(REF_KEY, fromUrl.toUpperCase().slice(0, 20));
    setRef((r) => ({ ...r, code: localStorage.getItem(REF_KEY) ?? '' }));
    supabase.rpc('get_partner_programme_public').then(({ data }) => setProgramme(data?.[0] ?? null));
  }, [params]);

  const submitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = joinSchema.safeParse(join);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { data, error } = await supabase.rpc('register_partner', { _name: join.name, _email: join.email, _phone: join.phone, _company: join.company, _website: join.website, _consent: join.consent });
    setBusy(false);
    if (error) return toast.error(error.message);
    setMyCode(data as string);
  };

  const submitRef = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = referSchema.safeParse(ref);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.rpc('submit_referral', { _code: ref.code, _business: ref.business, _contact: ref.contact, _email: ref.email, _phone: ref.phone, _website: ref.website, _notes: ref.notes });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.thanks);
    setRef({ ...ref, business: '', contact: '', email: '', phone: '', website: '', notes: '' });
  };

  const field = <T extends object>(state: T, set: React.Dispatch<React.SetStateAction<T>>, k: Extract<keyof T, string>, label: string, type = 'text') => (
    <div className="space-y-1"><Label htmlFor={`f-${k}`}>{label}</Label>
      <Input id={`f-${k}`} type={type} value={state[k] as string} onChange={(e) => set({ ...state, [k]: e.target.value })} /></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.title} description={t.intro} />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground text-lg">{t.intro}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><CardTitle>{t.join}</CardTitle></CardHeader><CardContent>
            {programme && !programme.is_open && <p className="text-sm text-muted-foreground mb-3">{t.closed}</p>}
            {myCode ? (
              <div className="space-y-2"><p className="text-sm">{t.code}: <strong>{myCode}</strong></p>
                <p className="text-xs break-all text-muted-foreground">{referralLink(myCode, window.location.origin)}</p></div>
            ) : (
              <form onSubmit={submitJoin} className="space-y-3">
                {field(join, setJoin, 'name', t.name)}{field(join, setJoin, 'email', t.email, 'email')}
                {field(join, setJoin, 'phone', t.phone)}{field(join, setJoin, 'company', t.company)}{field(join, setJoin, 'website', t.website)}
                <div className="flex gap-2 items-start"><Checkbox id="consent" checked={join.consent} onCheckedChange={(v) => setJoin({ ...join, consent: v === true })} />
                  <Label htmlFor="consent" className="text-xs font-normal leading-snug">{t.consent}</Label></div>
                <Button type="submit" disabled={busy || (programme ? !programme.is_open : false)}>{t.submit}</Button>
              </form>
            )}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{t.refer}</CardTitle></CardHeader><CardContent>
            <form onSubmit={submitRef} className="space-y-3">
              {field(ref, setRef, 'code', t.yourCode)}{field(ref, setRef, 'business', t.business)}{field(ref, setRef, 'contact', t.contact)}
              {field(ref, setRef, 'email', t.email, 'email')}{field(ref, setRef, 'phone', t.phone)}{field(ref, setRef, 'website', t.website)}
              <div className="space-y-1"><Label htmlFor="f-notes">{t.notes}</Label><Textarea id="f-notes" value={ref.notes} onChange={(e) => setRef({ ...ref, notes: e.target.value })} /></div>
              <Button type="submit" disabled={busy}>{t.submit}</Button>
            </form>
          </CardContent></Card>
        </div>
        <section className="space-y-2"><h2 className="font-display text-xl font-semibold">{t.terms}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{programme?.terms || t.noTerms}</p></section>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
