import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, Phone, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { getIndustryLanding, industryLandings } from '@/data/industryLandings';
import { useLanguage } from '@/contexts/LanguageContext';

const ui = {
  cs: { problems: 'Znáte to?', features: 'Co váš web umí', calc: 'Spočítat cenu webu', enquire: 'Nezávazně poptat', contact: 'Kontaktujte nás', other: 'Další obory' },
  en: { problems: 'Sound familiar?', features: 'What your website does', calc: 'Price my website', enquire: 'Send an enquiry', contact: 'Get in touch', other: 'Other industries' },
} as const;

const IndustryLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const page = getIndustryLanding(slug);
  if (!page) return <Navigate to="/" replace />;
  const c = page[lang];
  const t = ui[lang];
  const calcHref = page.trade ? `/calculator?trade=${page.trade}` : '/calculator';
  const url = `https://www.fastmedia.pro/websites-for/${page.slug}`;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.seoTitle.replace(' | FastMedia.Pro', ''),
    description: page.seoDescription,
    url,
    provider: { '@type': 'ProfessionalService', name: 'FastMedia.Pro', telephone: '+420 797 864 432', email: 'support@fastmedia.pro' },
    areaServed: ['Czech Republic', 'European Union'],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={page.seoTitle} description={page.seoDescription} pagePath={`/websites-for/${page.slug}`} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceLd)}</script>
      </Helmet>
      <Navbar />

      <header className="bg-launch text-launch-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase text-launch-accent">{c.eyebrow}</p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{c.headline}</h1>
          <p className="mt-6 text-base leading-relaxed text-launch-muted sm:text-lg">{c.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12"><a href="#enquiry">{t.enquire} <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-launch-border bg-launch-surface text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground">
              <Link to={calcHref}>{t.calc}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold">{t.problems}</h2>
            <ul className="space-y-4">{c.problems.map((p) => (
              <li key={p} className="flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><span className="text-muted-foreground">{p}</span></li>
            ))}</ul>
          </div>
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold">{t.features}</h2>
            <ul className="space-y-4">{c.features.map((f) => (
              <li key={f} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span className="text-muted-foreground">{f}</span></li>
            ))}</ul>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 pb-16">
          <h2 className="mb-6 font-display text-2xl font-bold">{c.faqTitle}</h2>
          <Accordion type="single" collapsible>
            {c.faq.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section id="enquiry" className="bg-muted/40 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center font-display text-2xl font-bold">{t.contact}</h2>
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline"><a href="tel:+420797864432"><Phone className="mr-2 h-4 w-4" />+420 797 864 432</a></Button>
              <Button asChild variant="outline"><a href="mailto:support@fastmedia.pro"><Mail className="mr-2 h-4 w-4" />support@fastmedia.pro</a></Button>
            </div>
            <OfferEnquiryForm lang={lang} source={`Industry page (/websites-for/${page.slug}) — ${page.en.name}`} />
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-6 font-display text-2xl font-bold">{t.other}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {industryLandings.filter((o) => o.slug !== page.slug).map((o) => (
              <Link key={o.slug} to={`/websites-for/${o.slug}`} className="group flex items-center rounded-lg border border-border bg-card p-5 hover:border-primary/50">
                <span className="font-semibold">{o[lang].name}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IndustryLanding;
