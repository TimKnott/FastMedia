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
import { Send, CheckCircle, Calculator, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const budgets = ['Under 20,000 CZK', '20,000–50,000 CZK', '50,000–100,000 CZK', 'Over 100,000 CZK', 'Not sure yet'];
const timelines = ['As soon as possible', 'Within a month', '1–3 months', 'Just researching'];
const projectTypes = ['New website', 'Redesign of an existing site', 'Online shop', 'Booking system', 'Video or content production', 'Something else'];

const QuoteRequestInner = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', website: '',
    projectType: projectTypes[0], budget: budgets[1], timeline: timelines[1], message: '',
  });

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
            'Project type': form.projectType,
            Budget: form.budget,
            Timeline: form.timeline,
            'Current website': form.website || 'None',
          },
        },
      });
      if (error) throw error;
      if ((data as { success?: boolean })?.success !== true) throw new Error('Submission rejected');
      setIsSubmitted(true);
      toast.success('Thank you — your request has been sent. We will reply shortly.');
    } catch {
      toast.error('We could not send your request. Please email support@fastmedia.pro or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Request a Quote — FastMedia.Pro Web Design"
        description="Tell us about your project and get a clear, itemised quote for a new website, redesign, online shop or booking system. No obligation, reply within one working day."
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
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">Request a quote</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                      Share a few details about your project and we will come back with a clear, itemised price — no obligation and no sales pressure.
                    </p>
                    <ul className="space-y-4 text-sm">
                      <li className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">A written quote within one working day</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">Fixed prices — nothing added later</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Calculator className="w-5 h-5 text-accent shrink-0" />
                        <Link to="/calculator" className="text-foreground hover:text-accent transition-colors">
                          Prefer an instant estimate? Use the calculator
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
                      <p className="text-foreground font-display font-bold text-xl mb-2">Request received</p>
                      <p className="text-muted-foreground text-sm mb-4">
                        We have your project details and will send your quote shortly.
                      </p>
                      <Link to="/calculator" className="text-accent font-medium text-sm hover:underline">
                        See an instant estimate meanwhile →
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 lg:p-10 shadow-md space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="q-name" className="block text-foreground text-sm font-medium mb-1.5">Full name</label>
                          <Input id="q-name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11" />
                        </div>
                        <div>
                          <label htmlFor="q-email" className="block text-foreground text-sm font-medium mb-1.5">Email</label>
                          <Input id="q-email" required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="q-phone" className="block text-foreground text-sm font-medium mb-1.5">Phone</label>
                          <Input id="q-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11" />
                        </div>
                        <div>
                          <label htmlFor="q-company" className="block text-foreground text-sm font-medium mb-1.5">Company</label>
                          <Input id="q-company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="h-11" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="q-website" className="block text-foreground text-sm font-medium mb-1.5">Current website (if any)</label>
                        <Input id="q-website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="h-11" placeholder="www.example.com" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="q-type" className="block text-foreground text-sm font-medium mb-1.5">Project type</label>
                          <select
                            id="q-type"
                            value={form.projectType}
                            onChange={e => setForm({ ...form, projectType: e.target.value })}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                            {projectTypes.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="q-budget" className="block text-foreground text-sm font-medium mb-1.5">Budget</label>
                          <select
                            id="q-budget"
                            value={form.budget}
                            onChange={e => setForm({ ...form, budget: e.target.value })}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                            {budgets.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="q-timeline" className="block text-foreground text-sm font-medium mb-1.5">Timeline</label>
                          <select
                            id="q-timeline"
                            value={form.timeline}
                            onChange={e => setForm({ ...form, timeline: e.target.value })}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                          >
                            {timelines.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="q-message" className="block text-foreground text-sm font-medium mb-1.5">Project details</label>
                        <Textarea
                          id="q-message"
                          required
                          rows={6}
                          value={form.message}
                          onChange={e => setForm({ ...form, message: e.target.value })}
                          placeholder="What does your business do, what pages or features do you need, and is there a deadline we should know about?"
                        />
                      </div>
                      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gradient-accent text-accent-foreground font-semibold h-14 text-lg shadow-glow hover:opacity-90 transition-opacity">
                        {isSubmitting ? 'Sending…' : 'Request my quote'}
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
        </main>
        <Footer />
      </div>
    </>
  );
};

const QuoteRequest = () => (
  <LanguageProvider>
    <QuoteRequestInner />
  </LanguageProvider>
);

export default QuoteRequest;
