import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Bot, CalendarCheck, CheckCircle2, Gauge, Globe2, Megaphone, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { getServiceLanding, serviceLandings } from '@/data/serviceLandings';
import { useLanguage } from '@/contexts/LanguageContext';
import launchSky from '@/assets/launch-sky-moonlit.jpg';

const icons = { Globe2, Bot, CalendarCheck, Gauge, Megaphone, ShieldCheck };

const ui = {
  cs: {
    benefits: 'Co tím získáte',
    deliverables: 'Co je součástí',
    other: 'Další služby',
    calculator: 'Spočítat cenu',
    enquire: 'Nezávazně poptat',
    enquiryHeading: 'Máte zájem?',
  },
  en: {
    benefits: 'What you get',
    deliverables: "What's included",
    other: 'Other services',
    calculator: 'Calculate a price',
    enquire: 'Send an enquiry',
    enquiryHeading: 'Interested?',
  },
} as const;

const ServiceLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const service = getServiceLanding(slug);

  if (!service) return <Navigate to="/" replace />;

  const c = service[lang];
  const t = ui[lang];
  const Icon = icons[service.icon];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={service.seoTitle}
        description={service.seoDescription}
        pagePath={`/service/${service.slug}`}
      />
      <Navigation />

      <header className="launch-hero relative overflow-hidden bg-launch text-launch-foreground">
        <img
          src={launchSky}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="launch-hero__shade absolute inset-0" />
        <div className="launch-hero__vignette absolute inset-0" />
        <div className="launch-stars absolute inset-0" aria-hidden="true" />

        <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase text-launch-accent">
              <span className="h-px w-10 bg-launch-accent" />
              {c.eyebrow}
            </div>
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-launch-border bg-launch-surface backdrop-blur-md">
              <Icon className="h-7 w-7 text-launch-accent" />
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {c.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-launch-muted sm:text-lg">{c.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12">
                <a href="#enquiry">{t.enquire} <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-launch-border bg-launch-surface text-launch-foreground backdrop-blur-md hover:bg-launch-surface-strong hover:text-launch-foreground"
              >
                <Link to="/calculator">{t.calculator}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold md:text-3xl">{t.benefits}</h2>
              <ul className="space-y-4">
                {c.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold md:text-3xl">{t.deliverables}</h2>
              <ul className="space-y-4">
                {c.deliverables.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Card className="mt-8 border-primary/30">
                <CardContent className="p-6 text-sm text-muted-foreground">{c.outcome}</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="enquiry" className="bg-muted/40 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center font-display text-2xl font-bold md:text-3xl">{t.enquiryHeading}</h2>
            <OfferEnquiryForm lang={lang} source={`Service page (/service/${service.slug}) — ${service.en.name}`} />
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 font-display text-2xl font-bold md:text-3xl">{t.other}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceLandings
              .filter((other) => other.slug !== service.slug)
              .map((other) => {
                const OtherIcon = icons[other.icon];
                return (
                  <Link
                    key={other.slug}
                    to={`/service/${other.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
                  >
                    <OtherIcon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-semibold">{other[lang].name}</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceLanding;
