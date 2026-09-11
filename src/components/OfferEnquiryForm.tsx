import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, CheckCircle2 } from 'lucide-react';

type Lang = 'cs' | 'en';

const copy = {
  cs: {
    title: 'Nezávazná poptávka',
    sub: 'Napište pár řádků a ozveme se do 24 hodin s návrhem, cenou i posouzením, zda můžete žádat o dotaci.',
    name: 'Jméno a příjmení',
    email: 'E-mail',
    phone: 'Telefon (nepovinné)',
    company: 'Firma (nepovinné)',
    message: 'Co potřebujete?',
    messagePlaceholder: 'Např. nový web pro instalatérskou firmu, rezervace termínů a anglická verze.',
    grant: 'Mám zájem o posouzení dotace',
    grantLevel: 'Očekávaná výše dotace (orientačně)',
    submit: 'Odeslat poptávku',
    sending: 'Odesílám…',
    doneTitle: 'Poptávka odeslána',
    doneBody: 'Máme ji u sebe a ozveme se do 24 hodin. Pokud spěchá, zavolejte na +420 797 864 432.',
    errName: 'Vyplňte prosím jméno.',
    errEmail: 'Zadejte prosím platný e-mail.',
    errMessage: 'Napište prosím, co potřebujete.',
    errGeneric: 'Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo napište na support@fastmedia.pro.',
  },
  en: {
    title: 'Send an enquiry',
    sub: 'Write a few lines and we will reply within 24 hours with a proposal, a price and an assessment of your grant eligibility.',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone (optional)',
    company: 'Company (optional)',
    message: 'What do you need?',
    messagePlaceholder: 'E.g. a new website for a plumbing firm, online booking and an English version.',
    grant: 'I would like a grant eligibility check',
    grantLevel: 'Expected grant level (indicative)',
    submit: 'Send enquiry',
    sending: 'Sending…',
    doneTitle: 'Enquiry sent',
    doneBody: 'We have it and will reply within 24 hours. If it is urgent, call +420 797 864 432.',
    errName: 'Please enter your name.',
    errEmail: 'Please enter a valid email address.',
    errMessage: 'Please tell us what you need.',
    errGeneric: 'We could not send your enquiry. Please try again or email support@fastmedia.pro.',
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const OfferEnquiryForm = ({ lang = 'cs', source }: { lang?: Lang; source?: string }) => {
  const t = copy[lang];
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [grant, setGrant] = useState(true);
  const [grantPercent, setGrantPercent] = useState('50');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t.errName);
    if (!EMAIL_RE.test(form.email.trim())) return toast.error(t.errEmail);
    if (!form.message.trim()) return toast.error(t.errMessage);

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-enquiry', {
        body: {
          kind: 'offer',
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          message: form.message.trim(),
          details: {
            Source: source ?? 'Offer campaign page (/offer)',
            Language: lang === 'cs' ? 'Czech' : 'English',
            'Grant check requested': grant ? 'Yes' : 'No',
            ...(grant ? { 'Expected grant level': `${grantPercent}%` } : {}),
          },
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t.errGeneric);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <Card className="max-w-2xl mx-auto border-primary/40 shadow-xl">
        <CardContent className="p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">{t.doneTitle}</h3>
          <p className="text-muted-foreground">{t.doneBody}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-primary/30 shadow-xl">
      <CardContent className="p-6 md:p-10">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">{t.title}</h3>
        <p className="text-muted-foreground mb-6">{t.sub}</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offer-name">{t.name}</Label>
              <Input id="offer-name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-email">{t.email}</Label>
              <Input id="offer-email" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-phone">{t.phone}</Label>
              <Input id="offer-phone" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-company">{t.company}</Label>
              <Input id="offer-company" value={form.company} onChange={set('company')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-message">{t.message}</Label>
            <Textarea id="offer-message" rows={5} value={form.message} onChange={set('message')} placeholder={t.messagePlaceholder} required />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="offer-grant" checked={grant} onCheckedChange={v => setGrant(v === true)} />
            <Label htmlFor="offer-grant" className="text-sm font-normal">{t.grant}</Label>
          </div>
          {grant && (
            <div className="space-y-2">
              <Label htmlFor="offer-grant-level">{t.grantLevel}</Label>
              <select
                id="offer-grant-level"
                value={grantPercent}
                onChange={e => setGrantPercent(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {['0', '25', '40', '50', '60', '70', '85'].map(v => (
                  <option key={v} value={v}>{v}%</option>
                ))}
              </select>
            </div>
          )}
          <Button type="submit" size="lg" className="w-full h-12" disabled={sending}>
            <Send className="w-4 h-4 mr-2" />
            {sending ? t.sending : t.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferEnquiryForm;
