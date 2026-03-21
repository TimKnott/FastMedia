import { useState } from 'react';
import { motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle, Calculator, Globe, ArrowRight } from 'lucide-react';
import { trades } from '@/data/trades';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const content = {
  cs: {
    title: 'Poptat projekt',
    subtitle: 'Řekněte nám o svém podnikání a my vám vytvoříme web, který pracuje za vás.',
    name: 'Jméno',
    email: 'E-mail',
    phone: 'Telefon',
    trade: 'Obor',
    company: 'Název firmy',
    website: 'Aktuální web (pokud existuje)',
    message: 'Popište svůj projekt',
    messagePlaceholder: 'Co od nového webu očekáváte? Jaké funkce potřebujete? Jaký je váš rozpočet?',
    submit: 'Odeslat poptávku',
    success: 'Děkujeme! Vaši poptávku jsme přijali a brzy se vám ozveme.',
    calcBanner: 'Chcete nejprve prozkoumat možnosti? Zkuste naši AI kalkulačku — vše lze kdykoliv změnit.',
    calcCta: 'Otevřít AI kalkulačku',
    globalNote: 'Sídlíme v České republice, mluvíme anglicky a pracujeme pro firmy po celém světě.',
  },
  en: {
    title: 'Inquire About Your Project',
    subtitle: 'Tell us about your business and we\'ll build a website that works for you.',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    trade: 'Industry',
    company: 'Company Name',
    website: 'Current Website (if any)',
    message: 'Describe Your Project',
    messagePlaceholder: 'What do you expect from your new website? What features do you need? What\'s your budget?',
    submit: 'Submit Inquiry',
    success: 'Thank you! We\'ve received your inquiry and will get back to you shortly.',
    calcBanner: "Want to explore options first? Try our AI calculator — don't worry, everything can be changed later.",
    calcCta: 'Open AI Calculator',
    globalNote: 'Based in Czech Republic, native English speakers, working remotely for companies worldwide.',
  },
  de: {
    title: 'Projekt anfragen',
    subtitle: 'Erzählen Sie uns von Ihrem Unternehmen und wir erstellen eine Website, die für Sie arbeitet.',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    trade: 'Branche',
    company: 'Firmenname',
    website: 'Aktuelle Website (falls vorhanden)',
    message: 'Beschreiben Sie Ihr Projekt',
    messagePlaceholder: 'Was erwarten Sie von Ihrer neuen Website? Welche Funktionen brauchen Sie? Wie hoch ist Ihr Budget?',
    submit: 'Anfrage senden',
    success: 'Vielen Dank! Wir haben Ihre Anfrage erhalten und melden uns in Kürze.',
    calcBanner: 'Möchten Sie zuerst Optionen erkunden? Probieren Sie unseren AI-Kalkulator — alles kann später geändert werden.',
    calcCta: 'AI-Kalkulator öffnen',
    globalNote: 'Sitz in Tschechien, englische Muttersprachler, weltweit remote tätig.',
  },
};

const InquiryForm = () => {
  const { language, t: tGlobal } = useLanguage();
  const t = content[language];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', trade: '', company: '', website: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save as a lead
      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        trade: formData.trade || 'general',
        special_request: [
          formData.company ? `Company: ${formData.company}` : '',
          formData.website ? `Current site: ${formData.website}` : '',
          formData.message,
        ].filter(Boolean).join('\n'),
        source: 'inquiry_page',
        language,
        selected_features: [],
        gdpr_consent: true,
        consent_timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      // Trigger notification via score-lead edge function (which also notifies admin)
      try {
        await supabase.functions.invoke('score-lead', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            trade: formData.trade || 'general',
            specialRequest: [
              formData.company ? `Company: ${formData.company}` : '',
              formData.website ? `Current site: ${formData.website}` : '',
              formData.message,
            ].filter(Boolean).join('\n'),
            selectedFeatures: [],
            language,
          },
        });
      } catch {
        // Notification failure shouldn't block the user
      }

      setIsSubmitted(true);
      toast.success(t.success);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="FastMedia.Pro — Inquire About Your Project"
        description="Submit a project inquiry to FastMedia.Pro. Czech-based team of native English speakers building websites for businesses worldwide."
        canonical="/inquiry"
        ogType="website"
        pagePath="/inquiry"
      />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main className="pt-20">
          {/* Global presence banner */}
          <div className="bg-primary text-primary-foreground py-3">
            <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-accent" />
              <span>{t.globalNote}</span>
            </div>
          </div>

          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid lg:grid-cols-5 gap-12">
                  {/* Left info column */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">{t.title}</h1>
                      <p className="text-muted-foreground text-lg mb-8">{t.subtitle}</p>

                      {/* Calculator suggestion */}
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
                        <Calculator className="w-8 h-8 text-accent mb-3" />
                        <p className="text-foreground text-sm mb-4">{t.calcBanner}</p>
                        <Link
                          to="/calculator"
                          className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
                        >
                          {t.calcCta} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right form column */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="lg:col-span-3"
                  >
                    {isSubmitted ? (
                      <div className="bg-card rounded-3xl p-10 shadow-md text-center">
                        <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                        <p className="text-foreground font-display font-bold text-xl mb-2">{t.success}</p>
                        <Link to="/calculator" className="text-accent font-medium text-sm hover:underline mt-4 inline-block">
                          {t.calcCta} →
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 lg:p-10 shadow-md space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.name}</label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-11" />
                          </div>
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.email}</label>
                            <Input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-11" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.phone}</label>
                            <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
                          </div>
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.trade}</label>
                            <Select value={formData.trade} onValueChange={v => setFormData({ ...formData, trade: v })}>
                              <SelectTrigger className="h-11"><SelectValue placeholder="..." /></SelectTrigger>
                              <SelectContent>
                                {trades.map(trade => (
                                  <SelectItem key={trade.id} value={trade.id}>{trade.icon} {tGlobal(trade.nameKey)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.company}</label>
                            <Input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="h-11" />
                          </div>
                          <div>
                            <label className="block text-foreground text-sm font-medium mb-1.5">{t.website}</label>
                            <Input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." className="h-11" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-foreground text-sm font-medium mb-1.5">{t.message}</label>
                          <Textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder={t.messagePlaceholder} rows={5} />
                        </div>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground font-semibold h-14 text-lg shadow-glow hover:opacity-90 transition-opacity">
                          {isSubmitting ? '...' : t.submit}
                          <Send className="ml-2 w-5 h-5" />
                        </Button>
                      </form>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

const Inquiry = () => (
  <LanguageProvider>
    <InquiryForm />
  </LanguageProvider>
);

export default Inquiry;
