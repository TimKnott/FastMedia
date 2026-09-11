import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle, Calculator, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const options = {
  cs: {
    budgets: ['Do 20 000 Kč', '20 000–50 000 Kč', '50 000–100 000 Kč', 'Nad 100 000 Kč', 'Zatím nevím'], timelines: ['Co nejdříve', 'Do jednoho měsíce', '1–3 měsíce', 'Zatím zjišťuji možnosti'], projectTypes: ['Nový web', 'Redesign stávajícího webu', 'E-shop', 'Rezervační systém', 'Video nebo tvorba obsahu', 'Něco jiného'],
    title: 'Nezávazná nabídka', intro: 'Sdělte nám několik údajů o projektu a připravíme jasnou položkovou cenu — bez závazků a nátlaku.', quoteTime: 'Písemná nabídka do jednoho pracovního dne', fixed: 'Pevné ceny — žádné pozdější příplatky', calculator: 'Chcete okamžitý odhad? Použijte kalkulačku', received: 'Poptávka přijata', receivedBody: 'Údaje o projektu máme a nabídku vám brzy pošleme.', instant: 'Mezitím si zobrazit okamžitý odhad →', name: 'Jméno a příjmení', email: 'E-mail', phone: 'Telefon', company: 'Firma', website: 'Současný web (pokud existuje)', type: 'Typ projektu', budget: 'Rozpočet', timeline: 'Termín', details: 'Podrobnosti projektu', placeholder: 'Čím se vaše firma zabývá, jaké stránky nebo funkce potřebujete a jaký máte termín?', sending: 'Odesílám…', submit: 'Vyžádat nabídku', consent: 'Odesláním formuláře souhlasíte s našimi', privacy: 'zásadami ochrany osobních údajů', success: 'Děkujeme — vaše poptávka byla odeslána. Brzy se ozveme.', error: 'Poptávku se nepodařilo odeslat. Zkuste to znovu nebo napište na support@fastmedia.pro.', none: 'Žádný', seoTitle: 'Nezávazná nabídka webu — FastMedia.Pro', seoDesc: 'Popište svůj projekt a získejte jasnou položkovou nabídku nového webu, redesignu, e-shopu nebo rezervačního systému.',
  },
  en: {
    budgets: ['Under CZK 20,000', 'CZK 20,000–50,000', 'CZK 50,000–100,000', 'Over CZK 100,000', 'Not sure yet'], timelines: ['As soon as possible', 'Within a month', '1–3 months', 'Just researching'], projectTypes: ['New website', 'Redesign of an existing site', 'Online shop', 'Booking system', 'Video or content production', 'Something else'],
    title: 'Request a quote', intro: 'Share a few details about your project and we will come back with a clear, itemised price — no obligation and no sales pressure.', quoteTime: 'A written quote within one working day', fixed: 'Fixed prices — nothing added later', calculator: 'Prefer an instant estimate? Use the calculator', received: 'Request received', receivedBody: 'We have your project details and will send your quote shortly.', instant: 'See an instant estimate meanwhile →', name: 'Full name', email: 'Email', phone: 'Phone', company: 'Company', website: 'Current website (if any)', type: 'Project type', budget: 'Budget', timeline: 'Timeline', details: 'Project details', placeholder: 'What does your business do, what pages or features do you need, and is there a deadline we should know about?', sending: 'Sending…', submit: 'Request my quote', consent: 'By sending this form you agree to our', privacy: 'privacy policy', success: 'Thank you — your request has been sent. We will reply shortly.', error: 'We could not send your request. Please email support@fastmedia.pro or try again.', none: 'None', seoTitle: 'Request a Quote — FastMedia.Pro Web Design', seoDesc: 'Tell us about your project and get a clear, itemised quote for a new website, redesign, online shop or booking system.',
  },
} as const;

const QuoteRequestInner = () => {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const c = options[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', website: '', message: '',
  });
  // Store selections as indices so they survive a CZ/EN language switch.
  const [typeIdx, setTypeIdx] = useState(0);
  const [budgetIdx, setBudgetIdx] = useState(1);
  const [timelineIdx, setTimelineIdx] = useState(1);
  const projectType = c.projectTypes[typeIdx];
  const budget = c.budgets[budgetIdx];
  const timeline = c.timelines[timelineIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-enquiry', {
        body: {
          kind: 'quote',
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: form.message,
          details: {
            'Project type': projectType,
            Budget: budget,
            Timeline: timeline,
             'Current website': form.website || c.none,
          },
        },
      });
      if (error) throw error;
      if ((data as { success?: boolean })?.success !== true) throw new Error('Submission rejected');
      setIsSubmitted(true);
       toast.success(c.success);
    } catch {
       toast.error(c.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
         title={c.seoTitle}
         description={c.seoDesc}
        canonical="/quote-request"
        ogType="website"
        pagePath="/quote-request"
      />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main className="pt-20">
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                     <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">{c.title}</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                       {c.intro}
                    </p>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-accent shrink-0" />
                         <span className="text-muted-foreground">{c.quoteTime}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                         <span className="text-muted-foreground">{c.fixed}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Calculator className="w-5 h-5 text-accent shrink-0" />
                        <Link to="/calculator" className="text-foreground hover:text-accent transition-colors">
                           {c.calculator}
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="lg:col-span-3"
                >
                  {isSubmitted ? (
                    <div className="bg-card rounded-3xl p-10 shadow-md text-center">
                      <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                       <p className="text-foreground font-display font-bold text-xl mb-2">{c.received}</p>
                      <p className="text-muted-foreground text-sm mb-4">
                         {c.receivedBody}
                      </p>
                      <Link to="/calculator" className="text-accent font-medium text-sm hover:underline">
                         {c.instant}
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 lg:p-10 shadow-md space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="q-name" className="block text-foreground text-sm font-medium mb-1.5">{c.name}</label>
                          <Input id="q-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11" />
                        </div>
                        <div>
                           <label htmlFor="q-email" className="block text-foreground text-sm font-medium mb-1.5">{c.email}</label>
                          <Input id="q-email" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="q-phone" className="block text-foreground text-sm font-medium mb-1.5">{c.phone}</label>
                          <Input id="q-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11" />
                        </div>
                        <div>
                           <label htmlFor="q-company" className="block text-foreground text-sm font-medium mb-1.5">{c.company}</label>
                          <Input id="q-company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div>
                         <label htmlFor="q-website" className="block text-foreground text-sm font-medium mb-1.5">{c.website}</label>
                        <Input id="q-website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="h-11" placeholder="www.example.com" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                           <label htmlFor="q-type" className="block text-foreground text-sm font-medium mb-1.5">{c.type}</label>
                          <select
                            id="q-type"
                            value={String(typeIdx)}
                            onChange={e => setTypeIdx(Number(e.target.value))}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                             {c.projectTypes.map((o, i) => <option key={o} value={i}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                           <label htmlFor="q-budget" className="block text-foreground text-sm font-medium mb-1.5">{c.budget}</label>
                          <select
                            id="q-budget"
                            value={String(budgetIdx)}
                            onChange={e => setBudgetIdx(Number(e.target.value))}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                             {c.budgets.map((o, i) => <option key={o} value={i}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                           <label htmlFor="q-timeline" className="block text-foreground text-sm font-medium mb-1.5">{c.timeline}</label>
                          <select
                            id="q-timeline"
                            value={String(timelineIdx)}
                            onChange={e => setTimelineIdx(Number(e.target.value))}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                             {c.timelines.map((o, i) => <option key={o} value={i}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                         <label htmlFor="q-message" className="block text-foreground text-sm font-medium mb-1.5">{c.details}</label>
                        <Textarea
                          id="q-message"
                          required
                          rows={6}
                          value={form.message}
                          onChange={e => setForm({ ...form, message: e.target.value })}
                           placeholder={c.placeholder}
                        />
                      </div>
                      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground font-semibold h-14 text-lg shadow-glow hover:opacity-90 transition-opacity">
                         {isSubmitting ? c.sending : c.submit}
                        <Send className="ml-2 w-5 h-5" />
                      </Button>
                      <p className="text-muted-foreground text-xs text-center">
                         {c.consent}{' '}
                         <Link to="/legal/privacy-policy" className="underline hover:text-accent">{c.privacy}</Link>.
                      </p>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

const QuoteRequest = () => <QuoteRequestInner />;

export default QuoteRequest;
