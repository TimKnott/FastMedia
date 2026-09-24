import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQJsonLd from '@/components/FAQJsonLd';
import { useLanguage } from '@/contexts/LanguageContext';
import { grantPages } from '@/data/grantContentPages';

const SITE = 'https://www.fastmedia.pro';

export default function GrantContentPage() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const page = grantPages.find((p) => p.path === pathname) ?? grantPages[0];
  const t = page.copy[lang];

  const schema = {
    '@context': 'https://schema.org',
    '@type': page.schemaType,
    name: t.h1,
    description: t.answer,
    url: SITE + page.path,
    inLanguage: lang === 'en' ? 'en-GB' : 'cs-CZ',
    dateModified: page.updated,
    ...(page.schemaType === 'HowTo'
      ? { step: t.sections.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.h2, text: s.body ?? s.list?.join('; ') })) }
      : { provider: { '@type': 'Organization', name: 'FastMedia.Pro', url: SITE }, areaServed: 'European Union' }),
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FastMedia.Pro', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: t.h1, item: SITE + page.path },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath={page.path} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>
      <FAQJsonLd faqs={t.faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <Navbar />

      <header className="border-b border-border bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{t.kicker}</p>
          <h1 className="font-display text-3xl font-bold md:text-5xl">{t.h1}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground" data-speakable>{t.answer}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {t.cta.map((c, i) => (
              <Button key={c.to} asChild variant={i === 0 ? 'default' : 'outline'}>
                <Link to={c.to}>{c.label}{i === 0 && <ArrowRight className="ml-2 h-4 w-4" />}</Link>
              </Button>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {lang === 'en' ? 'Last updated' : 'Aktualizováno'}: <time dateTime={page.updated}>{page.updated}</time> · FastMedia.Pro
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-10 px-4 py-12">
        {t.sections.map((s) => (
          <section key={s.h2}>
            <h2 className="mb-4 font-display text-2xl font-semibold">{s.h2}</h2>
            {s.body && <p className="leading-relaxed text-muted-foreground">{s.body}</p>}
            {s.list && (
              <ul className="space-y-2">
                {s.list.map((li) => (
                  <li key={li} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><span>{li}</span></li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold">{lang === 'en' ? 'Frequently asked questions' : 'Časté otázky'}</h2>
          <Accordion type="single" collapsible>
            {t.faqs.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Card>
          <CardContent className="flex flex-wrap gap-3 p-6">
            {grantPages.filter((p) => p.path !== page.path).map((p) => (
              <Button key={p.path} asChild variant="ghost"><Link to={p.path}>{p.copy[lang].h1}</Link></Button>
            ))}
            <Button asChild variant="ghost"><Link to="/grant-eligibility">{lang === 'en' ? 'Eligibility rules' : 'Podmínky způsobilosti'}</Link></Button>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          {lang === 'en'
            ? 'FastMedia.Pro is a web supplier, not the grant-giving agency. Grant decisions are made by the programme administrator.'
            : 'FastMedia.Pro je dodavatel webů, nikoli poskytovatel dotace. O dotaci rozhoduje administrátor programu.'}
        </p>
      </main>
      <Footer />
    </div>
  );
}
