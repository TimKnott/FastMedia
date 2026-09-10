import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Landmark, CheckCircle2, FileText, AlertTriangle, ExternalLink, Phone, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

type Lang = 'cs' | 'en';

const copy = {
  cs: {
    seoTitle: 'Dotace na webové stránky a digitalizaci | Jak žádat | FastMedia',
    seoDesc: 'Přehled českých a evropských dotačních programů na digitalizaci malých a středních firem, kdo může žádat, kolik lze získat a jak podat žádost krok za krokem.',
    switchLabel: 'English',
    badge: 'Průvodce dotacemi',
    h1: 'Dotace na web a digitalizaci: co je pravda a jak o ni požádat',
    sub: 'Na digitalizaci malých a středních firem existují v Česku dotační programy financované z evropských fondů. Nový web může být uznatelným nákladem, pokud je součástí širšího digitalizačního projektu. Níže najdete férový přehled bez marketingových slibů.',
    honestyTitle: 'Nejdřív na rovinu',
    honesty: [
      'Nejsme dotační poradenská kancelář ani „registrovaný státní dodavatel“ — takový status pro dodavatele webů v Česku neexistuje. Jsme běžný dodavatel, kterého si můžete do žádosti uvést.',
      'Míra podpory se liší podle programu, velikosti firmy a regionu. U programů na digitalizaci MSP se běžně pohybuje v desítkách procent uznatelných nákladů, nikoli automaticky u nejvyšší hranice.',
      'Samostatná „dotace na webové stránky“ obvykle neexistuje. Web bývá uznatelný jako část projektu digitalizace, e-commerce nebo pořízení softwaru.',
      'Rozhodnutí o přiznání i o výši podpory dělá vždy poskytovatel dotace, nikdy dodavatel.',
    ],
    programsTitle: 'Kde se dnes o podporu žádá',
    programs: [
      {
        t: 'OP TAK — Digitální podnik (Digitální technologie)',
        d: 'Program Ministerstva průmyslu a obchodu administrovaný Agenturou pro podnikání a inovace. Podporuje pořízení softwaru, IT infrastruktury a digitálních služeb pro malé a střední podniky. Výzvy se otevírají a uzavírají v cyklech — sledujte aktuální stav u API.',
        href: 'https://apiagentura.gov.cz/cs/podporovane-aktivity-optak/digitalni-podnik-optak/digitalni-podnik-digitalni-technologie-vyzva-i/',
        hrefLabel: 'Agentura pro podnikání a inovace',
      },
      {
        t: 'OP TAK — oficiální portál programu',
        d: 'Texty výzev, pravidla způsobilosti nákladů a přílohy žádostí. Tady ověříte, zda váš záměr do programu vůbec spadá a jaká míra podpory pro vás platí.',
        href: 'https://optak.gov.cz/',
        hrefLabel: 'optak.gov.cz',
      },
      {
        t: 'Regionální a místní programy (MAS, kraje, ITI)',
        d: 'Menší výzvy pro konkrétní území nebo obory. Bývají administrativně jednodušší a s nižšími částkami, ale často s vyšší mírou podpory než celostátní programy.',
        href: 'https://www.dotaceeu.cz/',
        hrefLabel: 'dotaceeu.cz',
      },
    ],
    stepsTitle: 'Jak žádost probíhá krok za krokem',
    steps: [
      { n: '01', t: 'Ověřte si výzvu', d: 'Najděte otevřenou výzvu, přečtěte si podmínky (velikost firmy, CZ-NACE, místo realizace) a termín příjmu žádostí.' },
      { n: '02', t: 'Připravte firemní podklady', d: 'IČO, výpis z obchodního rejstříku, účetní závěrky, počet zaměstnanců, prohlášení o velikosti podniku a o podpoře de minimis.' },
      { n: '03', t: 'Nechte si zpracovat nabídku', d: 'Od nás dostanete technickou specifikaci a cenovou nabídku ve struktuře, kterou žádost vyžaduje — položkově a s termíny.' },
      { n: '04', t: 'Podejte žádost', d: 'Žádost se podává elektronicky přes informační systém poskytovatele (u OP TAK přes IS KP). Potřebujete elektronickou identitu a datovou schránku.' },
      { n: '05', t: 'Realizace až po podání', d: 'U většiny programů nesmíte projekt zahájit před podáním žádosti. Rozhodně nic neplaťte předem, dokud si pravidlo neověříte.' },
      { n: '06', t: 'Vyúčtování a udržitelnost', d: 'Po dokončení doložíte faktury, doklady o úhradě a výstupy projektu. Následuje období udržitelnosti, kdy musíte řešení provozovat.' },
    ],
    helpTitle: 'Co v tom uděláme my',
    help: [
      'Technická specifikace webu v rozsahu, který výzva vyžaduje',
      'Položková cenová nabídka s termíny plnění',
      'Podklady k výběru dodavatele (pokud je vyžadován průzkum trhu)',
      'Faktury a doklady ve formátu vhodném pro vyúčtování',
      'Doporučení na nezávislého dotačního poradce, pokud chcete žádost zpracovat na klíč',
    ],
    warnTitle: 'Na co si dát pozor',
    warn: 'Buďte opatrní u kohokoli, kdo vám garantuje konkrétní procento podpory nebo „jisté schválení“. Míru podpory určuje výzva, nikoli dodavatel. Ověřte si vždy aktuální text výzvy na stránkách poskytovatele — pravidla se mezi výzvami mění.',
    faqTitle: 'Časté dotazy',
    faqs: [
      { q: 'Zaplatí dotace celý web?', a: 'Ne. Dotace vždy pokrývá jen část uznatelných nákladů a vyplácí se zpravidla až zpětně po vyúčtování. Zbytek hradíte z vlastních zdrojů.' },
      { q: 'Musím mít dotaci schválenou, než začneme?', a: 'Pokud chcete náklady na web zahrnout do žádosti, ano — ve většině programů nesmí realizace začít před podáním žádosti. Rádi počkáme a termín vám podržíme.' },
      { q: 'Pomůžete mi žádost napsat?', a: 'Připravíme kompletní technické a cenové podklady. Samotné zpracování a podání žádosti doporučujeme svěřit dotačnímu poradci, se kterým rádi spolupracujeme.' },
      { q: 'Co když dotaci nezískám?', a: 'Web vám uděláme i tak — s 30denní garancí vrácení peněz a možností rozložit platbu.' },
    ],
    ctaTitle: 'Chcete posoudit, zda můžete žádat?',
    ctaSub: 'Napište nám pár řádků o firmě a záměru. Ozveme se do 24 hodin s tím, co dnes reálně jde.',
    backToOffer: 'Zpět na nabídku',
    calc: 'Spočítat cenu webu',
    call: 'Zavolat +420 797 864 432',
  },
  en: {
    seoTitle: 'Czech Grants for Websites and Digitalisation | How to Apply | FastMedia',
    seoDesc: 'A plain-English guide to Czech and EU grant programmes for small business digitalisation: who can apply, what is actually funded and how to submit an application.',
    switchLabel: 'Čeština',
    badge: 'Grant guide',
    h1: 'Grants for websites and digitalisation: the honest version',
    sub: 'The Czech Republic runs EU-funded grant programmes for the digitalisation of small and medium-sized businesses. A new website can be an eligible cost when it forms part of a wider digitalisation project. Here is a fair overview, without the marketing promises.',
    honestyTitle: 'Straight talk first',
    honesty: [
      'We are not a grant consultancy and not a "registered government supplier" — no such status exists for website suppliers in the Czech Republic. We are simply a supplier you can name in your application.',
      'The support rate depends on the programme, your company size and your region. For SME digitalisation programmes it is typically a share of eligible costs in the tens of percent, not automatically the highest headline figure.',
      'A standalone "website grant" generally does not exist. A website is usually eligible as part of a digitalisation, e-commerce or software project.',
      'The decision on approval and the amount always rests with the grant provider, never with the supplier.',
    ],
    programsTitle: 'Where applications are made today',
    programs: [
      {
        t: 'OP TAK — Digital Enterprise (Digital Technologies)',
        d: 'A Ministry of Industry and Trade programme administered by the Agency for Business and Innovation. It supports the purchase of software, IT infrastructure and digital services for SMEs. Calls open and close in cycles, so check the current status with the agency.',
        href: 'https://apiagentura.gov.cz/cs/podporovane-aktivity-optak/digitalni-podnik-optak/digitalni-podnik-digitalni-technologie-vyzva-i/',
        hrefLabel: 'Agency for Business and Innovation',
      },
      {
        t: 'OP TAK — the official programme portal',
        d: 'Call documents, eligible-cost rules and application annexes. This is where you confirm whether your project fits the programme and what support rate applies to you.',
        href: 'https://optak.gov.cz/',
        hrefLabel: 'optak.gov.cz',
      },
      {
        t: 'Regional and local programmes (LAGs, regions, ITI)',
        d: 'Smaller calls for a specific area or sector. They are usually simpler to administer with lower amounts, but often carry a higher support rate than national programmes.',
        href: 'https://www.dotaceeu.cz/',
        hrefLabel: 'dotaceeu.cz',
      },
    ],
    stepsTitle: 'How an application works, step by step',
    steps: [
      { n: '01', t: 'Check the call', d: 'Find an open call and read the conditions: company size, sector code, place of delivery and the submission deadline.' },
      { n: '02', t: 'Gather company paperwork', d: 'Company number, register extract, financial statements, headcount, and declarations of enterprise size and de minimis aid.' },
      { n: '03', t: 'Get a compliant quotation', d: 'We provide a technical specification and an itemised quotation in the structure the application requires, with delivery dates.' },
      { n: '04', t: 'Submit the application', d: 'Applications are filed electronically through the provider\'s system (IS KP for OP TAK). You need an electronic identity and a data box.' },
      { n: '05', t: 'Start work only after filing', d: 'Most programmes forbid starting the project before the application is submitted. Do not pay anything up front until you have checked this rule.' },
      { n: '06', t: 'Reporting and sustainability', d: 'On completion you submit invoices, proof of payment and project outputs, followed by a sustainability period during which the solution must stay in use.' },
    ],
    helpTitle: 'What we do for you',
    help: [
      'A technical specification of the website in the detail the call demands',
      'An itemised quotation with delivery milestones',
      'Supplier-selection documents where a market survey is required',
      'Invoices and records in a format suited to grant reporting',
      'An introduction to an independent grant consultant if you want the application handled end to end',
    ],
    warnTitle: 'What to watch out for',
    warn: 'Be careful with anyone who guarantees a specific percentage of funding or "certain approval". The support rate is set by the call, not by a supplier. Always check the current call text on the provider\'s own website — the rules change between calls.',
    faqTitle: 'Common questions',
    faqs: [
      { q: 'Will a grant pay for the whole website?', a: 'No. A grant covers part of the eligible costs and is normally paid in arrears after reporting. You fund the rest yourself.' },
      { q: 'Do I need approval before we start?', a: 'If you want the website cost included in the application, yes — most programmes forbid starting before submission. We are happy to hold your slot.' },
      { q: 'Will you write the application for me?', a: 'We prepare the full technical and pricing documentation. We recommend a grant consultant for writing and filing the application itself, and we work with one regularly.' },
      { q: 'What if I do not get a grant?', a: 'We will build the site anyway, with the 30-day money-back guarantee and the option to spread payment.' },
    ],
    ctaTitle: 'Want to know whether you can apply?',
    ctaSub: 'Send us a few lines about your business and your plan. We will reply within 24 hours with what is realistically available today.',
    backToOffer: 'Back to the offer',
    calc: 'Calculate my price',
    call: 'Call +420 797 864 432',
  },
} as const;

const GrantGuide = () => {
  const { language } = useLanguage();
  const lang: Lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t.seoTitle}
        description={t.seoDesc}
        canonical="/grants"
        ogType="article"
        pagePath="/grants"
      />

      <div className="sticky top-0 z-50 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/offer" className="text-sm text-muted-foreground hover:text-foreground">
            ← {t.backToOffer}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <section className="container mx-auto px-4 py-14 md:py-20 max-w-4xl">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mb-6">
          <Landmark className="w-9 h-9" />
        </div>
        <Badge variant="secondary" className="mb-4">{t.badge}</Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-6">{t.h1}</h1>
        <p className="text-lg text-muted-foreground">{t.sub}</p>
      </section>

      <section className="container mx-auto px-4 pb-4 max-w-4xl">
        <Card className="border-primary/30">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">{t.honestyTitle}</h2>
            <ul className="space-y-3">
              {t.honesty.map(h => (
                <li key={h} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20 max-w-4xl">
        <h2 className="text-2xl md:text-4xl font-bold mb-8">{t.programsTitle}</h2>
        <div className="space-y-5">
          {t.programs.map((p, i) => (
            <motion.div key={p.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{p.t}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{p.d}</p>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary inline-flex items-center gap-1.5 hover:underline"
                  >
                    {p.hrefLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-10">{t.stepsTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}>
                <Card className="h-full border-border/60">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold flex items-center justify-center mb-4">
                      {s.n}
                    </div>
                    <h3 className="font-semibold mb-2">{s.t}</h3>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20 max-w-4xl grid md:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-6 md:p-8">
            <FileText className="w-8 h-8 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-4">{t.helpTitle}</h2>
            <ul className="space-y-3">
              {t.help.map(h => (
                <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 md:p-8">
            <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-4">{t.warnTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.warn}</p>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-14 md:pb-20 max-w-3xl">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="w-full">
          {t.faqs.map((f, i) => (
            <AccordionItem key={i} value={`grant-faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="grant-enquiry" className="bg-muted/40 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">{t.ctaTitle}</h2>
            <p className="text-muted-foreground">{t.ctaSub}</p>
          </div>
          <OfferEnquiryForm lang={lang} />
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild size="lg" variant="outline">
              <Link to="/calculator#grant">{t.calc}<ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="tel:+420797864432"><Phone className="w-4 h-4 mr-2" />{t.call}</a>
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> support@fastmedia.pro
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GrantGuide;
