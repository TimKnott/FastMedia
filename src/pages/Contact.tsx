import { useState } from 'react';
import { motion } from 'framer-motion';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Send, CheckCircle, Mail, Phone, MessageCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How quickly will you reply to my message?',
    a: 'Every enquiry is forwarded straight to our inbox and we reply within one working day, usually much sooner. Urgent jobs are best sent via WhatsApp.',
  },
  {
    q: 'How much does a website cost?',
    a: 'Packages start with a fixed-price base website and scale with the features you choose. Our AI calculator gives you an itemised quote in about two minutes, with no obligation.',
  },
  {
    q: 'How long does a project take?',
    a: 'A standard business website is typically live within two to three weeks from approval of the content. Larger builds with shops or booking systems take a little longer.',
  },
  {
    q: 'Do you work with businesses outside the Czech Republic?',
    a: 'Yes. We are based in the Czech Republic, work in British English and deliver remotely for clients worldwide.',
  },
  {
    q: 'Is hosting and maintenance included?',
    a: 'Hosting, security updates and monitoring are covered by a monthly plan so your site stays fast, secure and online without you having to think about it.',
  },
  {
    q: 'Can you improve a website I already have?',
    a: 'Absolutely. Send us the address in the form above and we will come back with an honest assessment of what to fix first.',
  },
];

const ContactInner = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const details = [
      formData.company ? `Company: ${formData.company}` : '',
      formData.message,
    ].filter(Boolean).join('\n');

    try {
      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        trade: 'general',
        special_request: details,
        source: 'contact_page',
        language: 'en',
        selected_features: [],
        gdpr_consent: true,
        consent_timestamp: new Date().toISOString(),
      });
      if (error) throw error;

      const { error: fnError } = await supabase.functions.invoke('score-lead', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          trade: 'general',
          specialRequest: details,
          selectedFeatures: [],
          language: 'en',
        },
      });
      if (fnError) console.error('score-lead notification failed:', fnError);

      setIsSubmitted(true);
      toast.success('Thank you — your message is on its way. We will reply shortly.');
    } catch {
      toast.error('Something went wrong. Please try again or email support@fastmedia.pro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact FastMedia.Pro — Talk to Our Web Team"
        description="Get in touch with FastMedia.Pro. Send a message, call or WhatsApp us about a new website, redesign or ongoing support. We reply within one working day."
        canonical="/contact"
        ogType="website"
        pagePath="/contact"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
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
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">Contact us</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                      Tell us what you need and we will come back with clear advice and a straight price — no sales pressure.
                    </p>

                    <ul className="space-y-4 text-sm">
                      <li className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-accent shrink-0" />
                        <a href="mailto:support@fastmedia.pro" className="text-foreground hover:text-accent transition-colors">
                          support@fastmedia.pro
                        </a>
                      </li>
                      <li className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-accent shrink-0" />
                        <a href="tel:+420797864432" className="text-foreground hover:text-accent transition-colors">
                          +420 797 864 432
                        </a>
                      </li>
                      <li className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-accent shrink-0" />
                        <a href="https://wa.me/447926400060" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors">
                          WhatsApp us
                        </a>
                      </li>
                      <li className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">Replies within one working day</span>
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
                      <p className="text-foreground font-display font-bold text-xl mb-2">Message received</p>
                      <p className="text-muted-foreground text-sm mb-4">
                        We have your details and will be in touch shortly.
                      </p>
                      <Link to="/calculator" className="text-accent font-medium text-sm hover:underline">
                        Get an instant quote with the AI calculator →
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 lg:p-10 shadow-md space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-name" className="block text-foreground text-sm font-medium mb-1.5">Full name</label>
                          <Input id="contact-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-11" />
                        </div>
                        <div>
                          <label htmlFor="contact-email" className="block text-foreground text-sm font-medium mb-1.5">Email</label>
                          <Input id="contact-email" required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-phone" className="block text-foreground text-sm font-medium mb-1.5">Phone</label>
                          <Input id="contact-phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
                        </div>
                        <div>
                          <label htmlFor="contact-company" className="block text-foreground text-sm font-medium mb-1.5">Company</label>
                          <Input id="contact-company" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="contact-message" className="block text-foreground text-sm font-medium mb-1.5">How can we help?</label>
                        <Textarea
                          id="contact-message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us about your business, what you need and any deadline you are working to."
                        />
                      </div>
                      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground font-semibold h-14 text-lg shadow-glow hover:opacity-90 transition-opacity">
                        {isSubmitting ? 'Sending…' : 'Send message'}
                        <Send className="ml-2 w-5 h-5" />
                      </Button>
                      <p className="text-muted-foreground text-xs text-center">
                        By sending this form you agree to our{' '}
                        <Link to="/legal/privacy-policy" className="underline hover:text-accent">privacy policy</Link>.
                      </p>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-16 lg:py-20 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-8 text-center">
                  Frequently asked questions
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((f, i) => (
                    <AccordionItem key={f.q} value={`faq-${i}`} className="bg-card rounded-2xl px-5 border-none shadow-sm">
                      <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

const Contact = () => (
  <LanguageProvider>
    <ContactInner />
  </LanguageProvider>
);

export default Contact;
