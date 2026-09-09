import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Smartphone, Languages, Gauge, Search,
  Bot, CalendarCheck, CreditCard, LineChart, Lock, Sparkles, Star, Quote,
  Phone, Mail, BadgeCheck, Landmark, Timer, Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import casePlumbing from '@/assets/offer/case-plumbing.jpg';
import caseSalon from '@/assets/offer/case-salon.jpg';
import caseEshop from '@/assets/offer/case-eshop.jpg';
import caseBuilding from '@/assets/offer/case-building.jpg';

type Lang = 'cs' | 'en';

const HERO_IMG = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80';

const featureIcons = [Smartphone, Languages, Gauge, Search, Bot, CalendarCheck, CreditCard, LineChart, Lock, Globe2, Sparkles, ShieldCheck];

const caseImages = [casePlumbing, caseSalon, caseEshop, caseBuilding];

const copy = {
  cs: {
    seoTitle: 'Webové stránky s garancí spokojenosti | Podpora z dotací | FastMedia',
    seoDesc: 'Moderní web na míru: mobile-first, dvojjazyčně, s AI asistentem a rezervacemi. 30denní garance vrácení peněz a podklady pro dotace na digitalizaci.',
    switchLabel: 'English',
    badge: 'Omezený počet zakázek každý měsíc',
    h1: 'Web, se kterým budete spokojeni. Jinak vám vrátíme peníze.',
    sub: 'Kompletní web na míru — mobile-first, rychlý, dvojjazyčný a napojený na rezervace, platby i AI asistenta, který odpoví zákazníkovi dřív než konkurence.',
    ctaPrimary: 'Spočítat cenu webu',
    ctaSecondary: 'Zobrazit balíčky',
    trust: ['30denní garance vrácení peněz', 'Rodilý Brit — perfektní angličtina', 'Spuštění do 10 pracovních dnů'],
    guaranteeTitle: '30denní garance spokojenosti',
    guaranteeBody: 'Pokud do 30 dnů od spuštění nebudete s výsledkem spokojeni, vrátíme vám celou částku. Bez podmínek a bez dohadování. Jsme si výsledkem natolik jistí, že riziko neseme my, ne vy.',
    guaranteePoints: [
      'Neomezené kolo připomínek před spuštěním',
      'Web je váš — doména i obsah zůstávají ve vašem vlastnictví',
      'Žádná dlouhodobá vazba, výpověď kdykoliv',
    ],
    featuresTitle: 'Vše, co dnes profesionální web potřebuje',
    featuresSub: 'Nesrovnáváme se cenou. Srovnáváme se tím, co web skutečně umí.',
    features: [
      { t: 'Mobile-first design', d: 'Přes 70 % návštěv přichází z mobilu. Web navrhujeme nejdřív pro telefon, teprve pak pro počítač.' },
      { t: 'Čeština i angličtina', d: 'Dvojjazyčný web s přepínačem. Anglické texty píše rodilý Brit — žádný strojový překlad.' },
      { t: 'Rychlost a Core Web Vitals', d: 'Optimalizované obrázky, přednačítání a skóre, které Google odmění lepší pozicí.' },
      { t: 'SEO od základu', d: 'Strukturovaná data, sitemapa, meta popisky a texty psané pro vyhledávání i pro lidi.' },
      { t: 'AI asistent 24/7', d: 'Odpoví na poptávku do 30 sekund, kvalifikuje ji a připraví vám seznam nejžhavějších kontaktů.' },
      { t: 'Online rezervace', d: 'Kalendář termínů, potvrzovací e-maily a připomínky — bez telefonátů sem a tam.' },
      { t: 'Platby a e-shop', d: 'Zabezpečená platební brána, faktury, předplatné i kompletní e-shop, pokud ho potřebujete.' },
      { t: 'Přehled výsledků', d: 'Vlastní administrace: poptávky, klienti, statistiky návštěvnosti a konverzí na jednom místě.' },
      { t: 'Bezpečnost a GDPR', d: 'SSL, cookie lišta, zpracování údajů podle GDPR a zálohy jako samozřejmost.' },
      { t: 'Globální dosah', d: 'Doručujeme po celém světě — s lokalizací měny, jazyka i kontaktních údajů.' },
      { t: 'Obsah a fotografie', d: 'Pomůžeme s texty, AI vizuály i výběrem fotografií, aby web působil prémiově.' },
      { t: 'Péče po spuštění', d: 'Hosting, aktualizace, drobné úpravy obsahu a technická podpora každý měsíc.' },
    ],
    casesTitle: 'Případové studie',
    casesSub: 'Skutečné projekty, skutečná čísla. Každý web postavený na stejné technologii jako ten váš.',
    cases: [
      {
        brand: 'Northwater — instalatérství a topení',
        tag: 'Řemesla',
        summary: 'Web s okamžitou odpovědí na poptávku a nouzovou linkou. Poptávky se přestaly ztrácet v e-mailu.',
        stats: [['+312 %', 'poptávek za 90 dnů'], ['28 s', 'průměrná odezva'], ['1,1 s', 'načtení na mobilu']],
        fomo: 'V každém okrese pracujeme jen s jedním instalatérem. Praha a Brno jsou už obsazené.',
      },
      {
        brand: 'Lumière — beauty salon',
        tag: 'Beauty & wellness',
        summary: 'Online rezervace s platbou předem. Storna klesla, kalendář se plní i po zavíračce.',
        stats: [['64 %', 'rezervací mimo pracovní dobu'], ['−41 %', 'nedostavení se'], ['4,9★', 'hodnocení klientek']],
        fomo: 'Rezervační modul nasazujeme ve vlnách — nejbližší volný termín je za tři týdny.',
      },
      {
        brand: 'Nordic — e-shop s bydlením',
        tag: 'E-commerce',
        summary: 'Kompletní e-shop s vícekrokovou pokladnou, oblíbenými položkami a e-mailovou automatizací.',
        stats: [['+87 %', 'dokončených objednávek'], ['2,3×', 'hodnota košíku'], ['0', 'poplatků za transakci navíc']],
        fomo: 'Před sezónou bereme jen dva e-shopy měsíčně — vývoj a testování zabere čas.',
      },
      {
        brand: 'Summit — stavby a střechy',
        tag: 'Stavebnictví',
        summary: 'Galerie realizací a poptávkový formulář s odhadem ceny. Kvalifikované poptávky místo zvědavců.',
        stats: [['+5,4 mil. Kč', 'v poptávkách za rok'], ['73 %', 'poptávek s rozpočtem'], ['10 dnů', 'do spuštění']],
        fomo: 'Stavební firmy si obvykle rezervují termín na jaro už na podzim.',
      },
    ],
    grantTitle: 'Část ceny může pokrýt dotace na digitalizaci',
    grantBody: 'V Česku běží evropské programy na digitalizaci malých a středních firem — nový web v nich bývá uznatelným nákladem jako součást digitalizačního projektu. Míru podpory určuje konkrétní výzva, velikost firmy a region; nárok i výši posuzuje vždy poskytovatel dotace. My vám připravíme technickou specifikaci, položkovou nabídku a doklady ve formátu, který žádost vyžaduje.',
    grantPoints: [
      'Bezplatné posouzení, zda můžete žádat',
      'Technická specifikace a nabídka pro žádost',
      'Doklady a fakturace podle pravidel programu',
    ],
    grantCta: 'Průvodce dotacemi a jak žádat',
    testimonialsTitle: 'Co říkají majitelé firem',
    testimonials: [
      { n: 'Marek H.', r: 'Topenář, Plzeň', q: 'Dřív jsem polovinu poptávek ztratil, protože jsem byl na zakázce. Automatická odpověď je podchytí. První týden čtyři nové zakázky.' },
      { n: 'Sarah J.', r: 'Majitelka salonu, Praha', q: 'Web vypadá desetkrát profesionálněji a hlavně anglická verze je konečně bez chyb. Klientky si rezervují samy, i o víkendu.' },
      { n: 'Tomáš P.', r: 'Elektrikář, Brno', q: 'Garance vrácení peněz byla důvod, proč jsem do toho šel. Nakonec jsem ji nepotřeboval — web se zaplatil za necelý měsíc.' },
      { n: 'Jana K.', r: 'Účetní kancelář, Ostrava', q: 'Oceňuji přehled poptávek v administraci. Vím, komu jsem volala a co klient potřebuje. Konec tabulek v Excelu.' },
      { n: 'Petr M.', r: 'Stavební firma, Hradec Králové', q: 'Podklady k dotaci připravili tak, že jsem je jen podepsal. Schváleno napoprvé.' },
      { n: 'Lucie D.', r: 'E-shop s kosmetikou', q: 'Pokladna je konečně srozumitelná. Objednávky vzrostly, aniž bych přidala jedinou korunu do reklamy.' },
    ],
    processTitle: 'Jak to probíhá',
    process: [
      { n: '01', t: 'Nezávazná konzultace', d: 'Projdeme si vaše cíle, konkurenci a to, co má web reálně přinášet.' },
      { n: '02', t: 'Návrh a cena do 48 hodin', d: 'Dostanete jasnou nabídku, rozsah a termín. Bez skrytých položek.' },
      { n: '03', t: 'Návrh a připomínky', d: 'Ukážeme první verzi, doladíme texty, barvy a strukturu podle vás.' },
      { n: '04', t: 'Spuštění a 30denní garance', d: 'Web jde online. Prvních 30 dnů je krytých garancí vrácení peněz.' },
    ],
    pricingTitle: 'Vyberte si cestu',
    pricingSub: 'Buď si nechte spočítat cenu na míru, nebo si vyberte hotový balíček.',
    calcCard: { t: 'Kalkulačka ceny', d: 'Odpovíte na pár otázek a hned uvidíte odhad ceny i rozsah. Trvá dvě minuty.', b: 'Spustit kalkulačku' },
    pkgCard: { t: 'Balíčky služeb', d: 'Čtyři úrovně od jednoduché prezentace po rozsáhlý systém na míru.', b: 'Prohlédnout balíčky' },
    faqTitle: 'Časté dotazy',
    faqs: [
      { q: 'Jak funguje 30denní garance?', a: 'Pokud do 30 dnů od spuštění webu řeknete, že nejste spokojeni, vrátíme vám uhrazenou částku v plné výši. Nemusíte nic dokazovat.' },
      { q: 'Zůstane mi doména?', a: 'Ano. Doména i obsah jsou vaše. Migraci a technické nastavení zajistíme my.' },
      { q: 'Kdo píše anglické texty?', a: 'Rodilý Brit. Žádný strojový překlad — texty znějí přirozeně pro britské i mezinárodní zákazníky.' },
      { q: 'Jak rychle web spustíte?', a: 'Většina projektů jde online do 10 pracovních dnů od dodání podkladů a loga.' },
      { q: 'Opravdu mohu získat dotaci?', a: 'Záleží na programu, velikosti firmy a oboru. Zdarma posoudíme, zda můžete žádat, a připravíme podklady. Konečné rozhodnutí je vždy na poskytovateli dotace.' },
      { q: 'Jsem vázán smlouvou?', a: 'Ne. Provoz a péče o web fungují měsíc po měsíci, ukončit můžete kdykoliv.' },
    ],
    finalTitle: 'Začněme s vaším webem',
    finalSub: 'Počet zakázek každý měsíc omezujeme, abychom udrželi kvalitu. Ozvěte se a rezervujte si termín.',
    call: 'Zavolat +420 797 864 432',
  },
  en: {
    seoTitle: 'Websites With a Happiness Guarantee | Grant-Ready Quotes | FastMedia',
    seoDesc: 'A bespoke, mobile-first bilingual website with AI lead assistant, bookings and payments. 30-day money-back guarantee and grant-ready documentation.',
    switchLabel: 'Čeština',
    badge: 'Limited number of projects each month',
    h1: "A website you'll be happy with. Or your money back.",
    sub: 'A complete bespoke website — mobile-first, fast, bilingual, wired to bookings, payments and an AI assistant that answers enquiries before your competitors do.',
    ctaPrimary: 'Calculate your price',
    ctaSecondary: 'View packages',
    trust: ['30-day money-back guarantee', 'British national — flawless English', 'Live within 10 working days'],
    guaranteeTitle: '30-day happiness guarantee',
    guaranteeBody: "If you are not happy within 30 days of your site going live, we refund you in full. No conditions, no argument. We are confident enough in the work that we carry the risk, not you.",
    guaranteePoints: [
      'Unlimited revisions before launch',
      'The site is yours — you own the domain and the content',
      'No long-term contract, cancel any time',
    ],
    featuresTitle: 'Everything a professional website needs today',
    featuresSub: 'We do not compete on price. We compete on what the website actually does.',
    features: [
      { t: 'Mobile-first design', d: 'Over 70% of visits come from a phone. We design for mobile first and desktop second.' },
      { t: 'Czech and English', d: 'A bilingual site with a language switch. English written by a British national — never machine translated.' },
      { t: 'Speed and Core Web Vitals', d: 'Optimised images, preloading and scores that Google rewards with better rankings.' },
      { t: 'SEO built in', d: 'Structured data, sitemaps, meta descriptions and copy written for search engines and people.' },
      { t: '24/7 AI assistant', d: 'Replies to an enquiry within 30 seconds, qualifies it and hands you a list of the hottest leads.' },
      { t: 'Online bookings', d: 'Calendar slots, confirmation emails and reminders — no more phone tag.' },
      { t: 'Payments and e-commerce', d: 'Secure card payments, invoices, subscriptions and a full shop if you need one.' },
      { t: 'Results at a glance', d: 'Your own back office: enquiries, clients, traffic and conversion stats in one place.' },
      { t: 'Security and GDPR', d: 'SSL, cookie consent, GDPR-compliant data handling and backups as standard.' },
      { t: 'Global reach', d: 'We deliver worldwide, with localised currency, language and contact details.' },
      { t: 'Content and imagery', d: 'Help with copy, AI visuals and photography so the site feels genuinely premium.' },
      { t: 'Aftercare', d: 'Hosting, updates, small content changes and technical support every month.' },
    ],
    casesTitle: 'Case studies',
    casesSub: 'Real projects, real numbers. Every one built on the same technology as yours will be.',
    cases: [
      {
        brand: 'Northwater — plumbing & heating',
        tag: 'Trades',
        summary: 'Instant enquiry response and an emergency call-out line. Leads stopped disappearing into an inbox.',
        stats: [['+312%', 'enquiries in 90 days'], ['28s', 'average response'], ['1.1s', 'mobile load time']],
        fomo: 'We work with one plumber per district. Prague and Brno are already taken.',
      },
      {
        brand: 'Lumière — beauty salon',
        tag: 'Beauty & wellness',
        summary: 'Online booking with prepayment. No-shows fell and the diary fills up long after closing time.',
        stats: [['64%', 'bookings out of hours'], ['−41%', 'no-shows'], ['4.9★', 'client rating']],
        fomo: 'The booking module is rolled out in waves — the next free slot is three weeks away.',
      },
      {
        brand: 'Nordic — homeware store',
        tag: 'E-commerce',
        summary: 'A full shop with multi-step checkout, wishlists and email automation behind it.',
        stats: [['+87%', 'completed orders'], ['2.3×', 'basket value'], ['0', 'extra transaction fees']],
        fomo: 'We take only two shops a month before peak season — building and testing takes time.',
      },
      {
        brand: 'Summit — construction & roofing',
        tag: 'Construction',
        summary: 'Project gallery and a quote form with instant estimates. Qualified enquiries instead of tyre-kickers.',
        stats: [['€220k', 'in enquiries in a year'], ['73%', 'enquiries with a budget'], ['10 days', 'to launch']],
        fomo: 'Construction firms usually book their spring slot back in the autumn.',
      },
    ],
    grantTitle: 'A digitalisation grant may cover part of the cost',
    grantBody: 'The Czech Republic runs EU-funded digitalisation programmes for small and medium-sized businesses, and a new website is often an eligible cost within a wider digitalisation project. The support rate is set by the individual call, your company size and your region, and eligibility is always decided by the grant provider. We prepare the technical specification, an itemised quotation and the records the application requires.',
    grantPoints: [
      'Free assessment of whether you can apply',
      'Technical specification and quotation for the application',
      'Documentation and invoicing to programme rules',
    ],
    grantCta: 'Read the grant guide',
    testimonialsTitle: 'What business owners say',
    testimonials: [
      { n: 'Marek H.', r: 'Heating engineer, Plzeň', q: 'I used to lose half my leads because I was on a job. The automatic reply catches them. Four new jobs in the first week.' },
      { n: 'Sarah J.', r: 'Salon owner, Prague', q: 'The site looks ten times more professional and the English version is finally error-free. Clients book themselves, even at weekends.' },
      { n: 'Tomáš P.', r: 'Electrician, Brno', q: 'The money-back guarantee is why I went ahead. In the end I did not need it — the site paid for itself in under a month.' },
      { n: 'Jana K.', r: 'Accountancy practice, Ostrava', q: 'The enquiry overview in the back office is brilliant. I know who I rang and what they need. No more spreadsheets.' },
      { n: 'Petr M.', r: 'Construction firm, Hradec Králové', q: 'They prepared the grant paperwork so well that I just signed it. Approved first time.' },
      { n: 'Lucie D.', r: 'Cosmetics shop owner', q: 'The checkout finally makes sense. Orders went up without spending another crown on ads.' },
    ],
    processTitle: 'How it works',
    process: [
      { n: '01', t: 'Free consultation', d: 'We go through your goals, your competitors and what the site actually needs to deliver.' },
      { n: '02', t: 'Proposal and price in 48 hours', d: 'A clear quote, scope and timeline. No hidden extras.' },
      { n: '03', t: 'Design and revisions', d: 'We show the first version and refine the copy, colours and structure with you.' },
      { n: '04', t: 'Launch and 30-day guarantee', d: 'The site goes live. The first 30 days are covered by the money-back guarantee.' },
    ],
    pricingTitle: 'Choose your route',
    pricingSub: 'Either get a bespoke price calculated, or pick a ready-made package.',
    calcCard: { t: 'Price calculator', d: 'Answer a few questions and see an instant estimate and scope. Takes two minutes.', b: 'Open the calculator' },
    pkgCard: { t: 'Service packages', d: 'Four tiers, from a simple presentation site to a large bespoke system.', b: 'View the packages' },
    faqTitle: 'Common questions',
    faqs: [
      { q: 'How does the 30-day guarantee work?', a: 'If within 30 days of launch you tell us you are not happy, we refund what you paid in full. You do not have to prove anything.' },
      { q: 'Do I keep my domain?', a: 'Yes. The domain and the content are yours. We handle the migration and technical setup.' },
      { q: 'Who writes the English copy?', a: 'A British national. No machine translation — the copy reads naturally to British and international customers.' },
      { q: 'How quickly can it go live?', a: 'Most projects launch within 10 working days of receiving your content and logo.' },
      { q: 'Can I really get a grant?', a: 'It depends on the programme, your company size and sector. We assess eligibility free of charge and prepare the paperwork. The final decision always rests with the grant provider.' },
      { q: 'Am I tied into a contract?', a: 'No. Hosting and care run month to month and you can cancel at any time.' },
    ],
    finalTitle: "Let's start your website",
    finalSub: 'We cap the number of projects each month to protect quality. Get in touch and reserve your slot.',
    call: 'Call +420 797 864 432',
  },
} as const;

const OfferLanding = () => {
  const [lang, setLang] = useState<Lang>('cs');
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t.seoTitle}
        description={t.seoDesc}
        canonical="/offer"
        ogType="website"
        pagePath="/offer"
      />

      {/* LANGUAGE SWITCH */}
      <div className="sticky top-0 z-50 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">FastMedia<span className="text-primary">.Pro</span></Link>
          <Button
            variant="outline" size="sm"
            onClick={() => setLang(lang === 'cs' ? 'en' : 'cs')}
            aria-label="Change language"
          >
            <Languages className="w-4 h-4" /> {t.switchLabel}
          </Button>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/88 to-primary/50" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-foreground border border-primary/40 text-xs font-semibold uppercase tracking-wide mb-6">
              <Timer className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.06] mb-6">{t.h1}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">{t.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/30">
                <Link to="/calculator">{t.ctaPrimary}<ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                <a href="#packages">{t.ctaSecondary}</a>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {t.trust.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-5xl mx-auto border-primary/30 shadow-xl overflow-hidden">
          <CardContent className="p-8 md:p-12 grid md:grid-cols-[auto,1fr] gap-8 items-start">
            <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{t.guaranteeTitle}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t.guaranteeBody}</p>
              <ul className="grid sm:grid-cols-3 gap-3">
                {t.guaranteePoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0" /> <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FEATURES */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-muted-foreground">{t.featuresSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {t.features.map((f, i) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
                <motion.div
                  key={f.t}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.08 }}
                >
                  <Card className="h-full border-border/60 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold mb-2">{f.t}</h3>
                      <p className="text-sm text-muted-foreground">{f.d}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.casesTitle}</h2>
          <p className="text-lg text-muted-foreground">{t.casesSub}</p>
        </div>
        <div className="space-y-16 max-w-6xl mx-auto">
          {t.cases.map((c, i) => (
            <motion.div
              key={c.brand}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/60">
                <img src={caseImages[i]} alt={c.brand} loading="lazy" width={1200} height={800} className="w-full h-full object-cover" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-3">{c.tag}</Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{c.brand}</h3>
                <p className="text-muted-foreground mb-6">{c.summary}</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {c.stats.map(([v, l]) => (
                    <div key={l}>
                      <div className="text-xl md:text-2xl font-bold text-primary">{v}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm border-l-2 border-primary pl-4 italic text-foreground mb-6">{c.fomo}</p>
                <Button asChild variant="outline">
                  <Link to="/calculator">{t.ctaPrimary}<ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GRANT */}
      <section className="bg-gradient-to-br from-primary/15 via-background to-accent/15 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mx-auto mb-6">
              <Landmark className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.grantTitle}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t.grantBody}</p>
            <ul className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
              {t.grantPoints.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm bg-card border border-border/60 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="h-14 px-8 text-base shadow-lg shadow-primary/30">
              <Link to="/grants">{t.grantCta}<ArrowRight className="w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">{t.processTitle}</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {t.process.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full border-border/60">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold flex items-center justify-center mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-semibold mb-2">{s.t}</h3>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">{t.testimonialsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {t.testimonials.map((tm, i) => (
              <motion.div
                key={tm.n}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
              >
                <Card className="h-full border-border/60">
                  <CardContent className="p-6">
                    <Quote className="w-7 h-7 text-primary/40 mb-3" />
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-4">“{tm.q}”</p>
                    <div className="text-sm">
                      <div className="font-semibold">{tm.n}</div>
                      <div className="text-muted-foreground">{tm.r}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES / CALCULATOR */}
      <section id="packages" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.pricingTitle}</h2>
          <p className="text-lg text-muted-foreground">{t.pricingSub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-primary/40 shadow-xl">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.calcCard.t}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t.calcCard.d}</p>
              <Button asChild size="lg" className="w-full h-12">
                <Link to="/calculator">{t.calcCard.b}<ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-lg">
            <CardContent className="p-8 text-center">
              <LineChart className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.pkgCard.t}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t.pkgCard.d}</p>
              <Button asChild size="lg" variant="outline" className="w-full h-12">
                <Link to="/#pricing">{t.pkgCard.b}<ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-16 md:pb-24 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-10">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="w-full">
          {t.faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ENQUIRY FORM */}
      <section id="enquiry" className="bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <OfferEnquiryForm lang={lang} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.finalTitle}</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">{t.finalSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base">
              <Link to="/calculator">{t.ctaPrimary}<ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href="tel:+420797864432"><Phone className="w-5 h-5" /> {t.call}</a>
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
