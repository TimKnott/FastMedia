import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, MessageSquareText, ListChecks, Wand2, Clock,
  Star, Quote, Phone, Mail, Zap, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
} from '@/components/ui/carousel';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';

const HERO_IMG = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80';
const WORK_IMG = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80';
const PHONE_IMG = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1400&q=80';
const DASHBOARD_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80';

const carouselSlides = [
  { img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80', title: 'Plumbers & heating engineers' },
  { img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80', title: 'Electricians & contractors' },
  { img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', title: 'Builders & renovators' },
  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80', title: 'Local service businesses' },
  { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', title: 'Studios, salons & clinics' },
];

const testimonials = [
  {
    name: 'Marek H.',
    role: 'Heating engineer',
    quote: 'I used to lose half my leads to whoever called first. The text-back caught them while I was still on a job. Booked 4 jobs in the first week.',
    rating: 5,
  },
  {
    name: 'Sarah J.',
    role: 'Salon owner',
    quote: 'New website looks ten times more professional and I open the app to a tidy list of clients to ring back. Worth every cent.',
    rating: 5,
  },
  {
    name: 'Tomáš P.',
    role: 'Electrician',
    quote: 'No upfront cost was the dealbreaker for me. I’d been quoted €4,000 elsewhere. Now I just pay monthly and the system pays for itself.',
    rating: 5,
  },
];

const benefits = [
  {
    icon: Wand2,
    feature: 'Complete rebuild',
    how: 'We redesign your site for maximum conversion.',
    benefit: 'You look like the premium, go-to choice in your area.',
  },
  {
    icon: MessageSquareText,
    feature: 'Instant text-back',
    how: 'The moment someone fills out a form, the system texts them.',
    benefit: 'They stop shopping around because they have been answered.',
  },
  {
    icon: ListChecks,
    feature: 'The "Hot List"',
    how: 'Inquiries sorted by budget, service required and timing.',
    benefit: 'You open an app and get a clean list of exactly who to call.',
  },
  {
    icon: ShieldCheck,
    feature: 'Zero upfront cost',
    how: 'We waive the thousands standard agencies charge.',
    benefit: 'No massive risk or capital outlay to get started.',
  },
];

const steps = [
  {
    n: '01',
    title: 'The prospect inquires',
    body: 'A potential customer lands on your new website and submits a quote request or contact form.',
  },
  {
    n: '02',
    title: 'The automation fires (within 30 seconds)',
    body: 'The system sends a friendly, personalised SMS and email: "Hi [Name], got your request for [Service]! I\'m out on a project right now but want to get you taken care of. Looking to get this done this week, or just planning ahead?"',
  },
  {
    n: '03',
    title: 'The lead is secured',
    body: 'The customer replies to the text. They feel looked after and stop messaging other businesses. The system keeps the conversation warm.',
  },
  {
    n: '04',
    title: 'Your hot list is ready',
    body: 'When you sit down at your desk, you open a clean dashboard showing a neat list of qualified customers, their contact details, and exactly what they need.',
  },
];

const faqs = [
  { q: 'Do I keep my domain name?', a: 'Yes, you retain full ownership of your domain. We handle all the technical migration.' },
  { q: 'Is there a long-term contract?', a: 'No, it is month-to-month. We rely on the results of the system to keep you happy.' },
  { q: 'What if I already have a website?', a: 'Perfect. We will take your current content, upgrade the layout to look stunning on mobile and desktop, and inject the automation engine behind it.' },
  { q: 'How quickly can it go live?', a: 'Most rebuilds launch within 10 days of you sending over your content and logo.' },
  { q: 'What does the €297/mo cover?', a: 'Hosting, SSL, the AI lead assistant, ongoing software maintenance, and small content updates each month.' },
];

const OfferLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Never Lose a Lead Again — Rebuilt Website + 24/7 AI Assistant — €297/mo"
        description="A completely rebuilt, modern website plus an automated assistant that text-backs inquiries instantly. Zero upfront cost. Just €297/month. Month-to-month."
        canonical="/offer"
        ogType="website"
        pagePath="/offer"
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Tradesperson reviewing leads on a phone" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-primary/60" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/40 text-xs font-semibold uppercase tracking-wide mb-6">
              <Zap className="w-3.5 h-3.5" /> Limited monthly spaces
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6">
              Never Lose a Lead to a Competitor Again.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              A completely rebuilt, modern website. An automated assistant that text-backs inquiries instantly. All for less than the cost of a daily cup of coffee.
            </p>
            <p className="text-sm text-muted-foreground italic mb-8">
              Perfect for busy contractors, service providers and local businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                <Link to="/calculator">
                  Claim Your Website Upgrade Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">You don't just need a prettier website. You need a system that closes the gap.</h2>
            <p className="text-lg text-muted-foreground mb-4">
              You are busy running your business — on a job site, or with a client. When a new inquiry comes through your website, you can't always answer instantly.
            </p>
            <p className="text-lg text-muted-foreground">
              By the time you check your email three hours later, that lead has already moved down the Google results page and hired your competitor.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img src={WORK_IMG} alt="Tradesperson on a job site" className="w-full h-[400px] object-cover" />
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="how-it-works" className="bg-muted/40 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How the System Works</h2>
            <p className="text-lg text-muted-foreground">Outcomes, not technical specs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={b.feature}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/60">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                        <b.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{b.feature}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{b.how}</p>
                        <p className="text-sm font-medium text-foreground flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {b.benefit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Visualising the Workflow</h2>
          <p className="text-lg text-muted-foreground">From form fill to booked job — automatically.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
          <motion.img
            src={PHONE_IMG} alt="Customer receiving instant text-back on phone"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl shadow-2xl w-full h-[420px] object-cover"
          />
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto"
        >
          <img src={DASHBOARD_IMG} alt="Clean dashboard showing qualified leads" className="w-full h-[360px] md:h-[460px] object-cover" />
        </motion.div>
      </section>

      {/* WHO IT'S FOR — CAROUSEL */}
      <section className="bg-muted/40 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for service businesses that hate losing leads</h2>
            <p className="text-muted-foreground">Already powering websites across trades and local services.</p>
          </div>
          <Carousel opts={{ loop: true, align: 'start' }} className="max-w-5xl mx-auto">
            <CarouselContent>
              {carouselSlides.map((s) => (
                <CarouselItem key={s.title} className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative rounded-xl overflow-hidden h-64 group">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 font-semibold text-foreground">
                      {s.title}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Real owners. Real results.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-border/60">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/40 mb-3" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="text-sm">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-gradient-to-br from-primary/15 via-background to-accent/15 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              No €3,000 Upfront Fees. <span className="text-primary">Just €297/month.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Traditional agencies charge thousands upfront just for the design, then leave you to figure out the marketing.
              We do the opposite. We invest our time into rebuilding your website completely free of charge.
              All you pay is a flat <strong className="text-foreground">€297 per month</strong> hosting, software and system maintenance fee.
            </p>
            <p className="text-lg text-foreground font-medium mb-10">
              If the system saves or secures just <em>one</em> decent job a month, it completely pays for itself.
              Everything else is pure profit.
            </p>
            <Card className="max-w-md mx-auto shadow-2xl border-primary/30">
              <CardContent className="p-8 text-center">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Monthly system fee</div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-6xl font-bold">€297</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <div className="text-sm text-muted-foreground mb-6">No setup. No contract. Cancel any time.</div>
                <ul className="text-left space-y-2 mb-8 text-sm">
                  {[
                    'Complete website rebuild (worth €3,000+)',
                    'AI text-back lead assistant 24/7',
                    'Qualified "Hot List" dashboard',
                    'Hosting, SSL & ongoing maintenance',
                    'Month-to-month, no lock-in',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="w-full h-14 text-base shadow-lg shadow-primary/30">
                  <Link to="/calculator">
                    Let's Get Started — Rebuild My Site
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20 md:py-28 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-10">Common questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to put your customer acquisition on autopilot?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Let's build your new system. Spaces for our zero-down rebuilds are limited each month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base">
              <Link to="/calculator">
                Let's Get Started — Rebuild My Site
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="tel:+420797864432">
                <Phone className="w-5 h-5" /> Call +420 797 864 432
              </a>
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-80 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> support@fastmedia.pro
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfferLanding;
