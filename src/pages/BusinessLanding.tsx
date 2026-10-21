import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, CalendarCheck, CheckCircle2, HelpCircle, Languages, Smartphone, Sparkles,
  PenSquare, Ruler, Rocket, ExternalLink, Calculator, ShieldCheck, FileText, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedPath } from '@/lib/publicLanguage';
import { trackEvent } from '@/lib/trackEvent';
import hero from '@/assets/business/hero-business.jpg';
import processImg from '@/assets/business/process.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;
const L = (cs: string, en: string, de: string): L3 => ({ cs, en, de });

/* ---------- copy (Czech-first) ---------- */
const t = {
  seoTitle: L(
    'Web pro řemeslníky za 20 € měsíčně — s online rezervacemi | FastMedia.Pro',
    'A tradesperson website for €20/month — with online booking | FastMedia.Pro',
    'Handwerker-Website für 20 €/Monat — mit Online-Buchung | FastMedia.Pro',
  ),
  seoDesc: L(
    'Profesionální web z oborové šablony s online rezervačním kalendářem za 20 € měsíčně. Pro řemeslníky a služby. Česky, anglicky, německy. Nezávazná poptávka.',
    'A professional industry-template website with an online booking calendar for €20/month. For trades and service businesses. Czech, English, German. Free enquiry.',
    'Professionelle Branchen-Website mit Online-Buchungskalender für 20 €/Monat. Für Handwerk und Dienstleistungen. Tschechisch, Englisch, Deutsch. Unverbindliche Anfrage.',
  ),
  eyebrow: L('Pro řemeslníky a služby', 'For trades & services', 'Für Handwerk & Dienstleistungen'),
  h1a: L('Profesionální web pro vaše řemeslo', 'A professional website for your trade', 'Eine professionelle Website für Ihr Handwerk'),
  h1b: L('s online rezervacemi za 20 € měsíčně.', 'with online booking for €20/month.', 'mit Online-Buchung für 20 €/Monat.'),
  heroSub: L(
    'Postavíme vám web z osvědčené oborové šablony a zákazníci si u vás objednají termín sami — i když zrovna pracujete. Žádná velká počáteční investice, žádné programování z vaší strany.',
    'We build your site from a proven industry template and customers book a slot themselves — even while you are on a job. No large upfront investment, no programming on your side.',
    'Wir bauen Ihre Website aus einer bewährten Branchenvorlage, und Kunden buchen ihren Termin selbst — auch während Sie arbeiten. Keine große Anfangsinvestition, kein Programmieren Ihrerseits.',
  ),
  ctaPrimary: L('Chci web za 20 € měsíčně', 'I want the €20/month website', 'Ich will die Website für 20 €/Monat'),
  ctaDemos: L('Prohlédnout ukázkové weby', 'See the demo websites', 'Demo-Websites ansehen'),
  ctaCalculator: L('Spočítat web na míru', 'Price a bespoke site', 'Individuelle Website berechnen'),
  ctaContact: L('Napsat nám', 'Write to us', 'Schreiben Sie uns'),
};

const trust = [
  L('Rezervační kalendář v ceně', 'Booking calendar included', 'Buchungskalender inklusive'),
  L('Česky, anglicky i německy', 'Czech, English and German', 'Tschechisch, Englisch und Deutsch'),
  L('Mobilní design od prvního pixelu', 'Mobile-first from the first pixel', 'Mobile-first ab dem ersten Pixel'),
  L('Nejsme plátci DPH', 'We are not VAT registered', 'Nicht umsatzsteuerpflichtig'),
];

/* Confirmed vs. to-confirm — deliberately honest split. */
const included = [
  { icon: Sparkles, t: L('Web z oborové šablony', 'Industry-template website', 'Branchen-Vorlagen-Website'), d: L('Osvědčená struktura pro váš obor, upravená na vaši značku, texty a fotky.', 'A proven structure for your trade, adapted to your brand, copy and photos.', 'Bewährte Struktur für Ihre Branche, angepasst an Marke, Texte und Fotos.') },
  { icon: CalendarCheck, t: L('Online rezervační kalendář', 'Online booking calendar', 'Online-Buchungskalender'), d: L('Zákazníci si vybírají volné termíny sami — méně telefonátů a přepisování.', 'Customers pick free slots themselves — fewer phone calls and less back-and-forth.', 'Kunden wählen freie Termine selbst — weniger Anrufe und Hin und Her.') },
  { icon: Smartphone, t: L('Perfektní na mobilu', 'Flawless on mobile', 'Perfekt auf dem Handy'), d: L('Většina vašich zákazníků přijde z telefonu — web je navržený právě pro ně.', 'Most of your customers arrive on a phone — the site is designed for exactly that.', 'Die meisten Ihrer Kunden kommen vom Handy — die Website ist genau dafür gebaut.') },
  { icon: Languages, t: L('Česky, anglicky, německy', 'Czech, English, German', 'Tschechisch, Englisch, Deutsch'), d: L('Web může mluvit jazykem vašich zákazníků — přirozeně, ne strojově.', 'Your site can speak your customers’ language — naturally, not machine-translated.', 'Ihre Website spricht die Sprache Ihrer Kunden — natürlich, nicht maschinell übersetzt.') },
];

const toConfirm = [
  L('Doména a hosting', 'Domain and hosting', 'Domain und Hosting'),
  L('HTTPS zabezpečení (SSL)', 'HTTPS security (SSL)', 'HTTPS-Absicherung (SSL)'),
  L('Rozsah úprav a podpory v ceně', 'Scope of included edits and support', 'Umfang von Änderungen und Support'),
  L('Limity rezervací (počet služeb, termínů)', 'Booking limits (services, slots)', 'Buchungslimits (Leistungen, Termine)'),
  L('Minimální délka smlouvy a výpověď', 'Minimum term and cancellation', 'Mindestlaufzeit und Kündigung'),
  L('Případný zřizovací poplatek', 'Any setup fee', 'Mögliche Einrichtungsgebühr'),
];

const optional = [
  L('Další stránky a jazykové verze', 'Extra pages and language versions', 'Zusätzliche Seiten und Sprachversionen'),
  L('E-shop nebo katalog produktů', 'E-shop or product catalogue', 'Onlineshop oder Produktkatalog'),
  L('Texty, fotky a video spoty', 'Copywriting, photos and video promos', 'Texte, Fotos und Videospots'),
  L('Napojení na další nástroje (platby, CRM…)', 'Connections to other tools (payments, CRM…)', 'Anbindung weiterer Tools (Zahlungen, CRM…)'),
];

const steps = [
  { icon: PenSquare, t: L('Napíšete nám', 'You write to us', 'Sie schreiben uns'), d: L('Pár vět o vašem oboru a co potřebujete. Nezávazně.', 'A few lines about your trade and what you need. No commitment.', 'Ein paar Zeilen zu Ihrem Gewerbe und was Sie brauchen. Unverbindlich.') },
  { icon: Ruler, t: L('Domluvíme podmínky', 'We agree the terms', 'Wir klären die Konditionen'), d: L('Před platbou dostanete písemně přesný rozsah — co je v ceně a co ne.', 'Before any payment you get the exact scope in writing — what is included and what is not.', 'Vor jeder Zahlung erhalten Sie schriftlich den genauen Umfang — was enthalten ist und was nicht.') },
  { icon: Rocket, t: L('Schválíte a spustíme', 'You approve, we launch', 'Sie geben frei, wir starten'), d: L('Web si prohlédnete a schválíte. Nic se nepublikuje bez vás.', 'You review and approve the site. Nothing goes live without you.', 'Sie prüfen und geben die Website frei. Nichts geht ohne Sie live.') },
];

/* Real, existing demo routes — labelled as demos, never as client work. */
const demos = [
  { to: '/demo/plumbing', name: L('Instalatérství', 'Plumbing', 'Sanitär') },
  { to: '/demo/electrical', name: L('Elektrikář', 'Electrician', 'Elektriker') },
  { to: '/demo/carpentry', name: L('Truhlářství', 'Carpentry', 'Tischlerei') },
  { to: '/demo/cleaning', name: L('Úklidové služby', 'Cleaning services', 'Reinigung') },
  { to: '/demo/gardening', name: L('Zahradnictví', 'Gardening', 'Gärtnerei') },
  { to: '/demo/beauty-salon', name: L('Kosmetický salon', 'Beauty salon', 'Kosmetikstudio') },
];

const faqs: { q: L3; a: L3 }[] = [
  {
    q: L('Co přesně je v ceně 20 € měsíčně?', 'What exactly does €20/month include?', 'Was genau ist in den 20 €/Monat enthalten?'),
    a: L('Základ tvoří web z oborové šablony s online rezervačním kalendářem. U domény, hostingu, rozsahu úprav a dalších detailů si podmínky potvrdíme písemně ještě před objednávkou — nic neplatíte, dokud nevíte přesně, co dostanete.', 'The core is an industry-template website with an online booking calendar. For the domain, hosting, edit scope and other details we confirm the terms in writing before you order — you pay nothing until you know exactly what you get.', 'Der Kern ist eine Branchen-Vorlagen-Website mit Online-Buchungskalender. Domain, Hosting, Änderungsumfang und weitere Details bestätigen wir schriftlich vor der Bestellung — Sie zahlen nichts, bevor Sie genau wissen, was Sie bekommen.'),
  },
  {
    q: L('Musím podepsat dlouhou smlouvu?', 'Do I have to sign a long contract?', 'Muss ich einen langen Vertrag unterschreiben?'),
    a: L('Podmínky minimální doby a výpovědi vám sdělíme předem písemně, ještě než cokoli zaplatíte. Nevymýšlíme je na místě — proto je tady neuvádíme bez ověření.', 'We tell you the minimum-term and cancellation terms in writing before you pay anything. We do not make them up on the spot — that is why they are not stated here unverified.', 'Mindestlaufzeit und Kündigungsbedingungen teilen wir Ihnen schriftlich mit, bevor Sie etwas zahlen. Wir erfinden sie nicht spontan — darum stehen sie hier nicht ungeprüft.'),
  },
  {
    q: L('Jak funguje rezervační kalendář?', 'How does the booking calendar work?', 'Wie funktioniert der Buchungskalender?'),
    a: L('Zákazník si na webu vybere službu a volný termín a odešle rezervaci. Přesné možnosti (počet služeb, kapacity, připomenutí) záleží na nastavení — probereme je spolu při zřízení.', 'A customer picks a service and a free slot on your site and sends the booking. The exact options (number of services, capacity, reminders) depend on the setup — we go through them together.', 'Kunden wählen auf Ihrer Website eine Leistung und einen freien Termin und senden die Buchung. Die genauen Möglichkeiten (Anzahl der Leistungen, Kapazitäten, Erinnerungen) hängen von der Einrichtung ab — wir besprechen sie gemeinsam.'),
  },
  {
    q: L('Je to opravdu 20 €, nebo se cena změní?', 'Is it really €20, or will the price change?', 'Sind es wirklich 20 €, oder ändert sich der Preis?'),
    a: L('20 € měsíčně je cena předplatného za web ze šablony s rezervacemi. Pokud budete chtít něco navíc (další stránky, e-shop, texty…), dostanete samostatnou nabídku — nic se nepřidává bez vašeho souhlasu.', '€20/month is the subscription price for the template website with booking. If you want anything extra (more pages, an e-shop, copywriting…), you get a separate quote — nothing is added without your consent.', '20 €/Monat ist der Abo-Preis für die Vorlagen-Website mit Buchung. Wenn Sie etwas Zusätzliches wollen (mehr Seiten, Shop, Texte…), erhalten Sie ein separates Angebot — nichts wird ohne Ihre Zustimmung hinzugefügt.'),
  },
  {
    q: L('Co když chci něco většího než šablonu?', 'What if I want more than a template?', 'Was, wenn ich mehr als eine Vorlage will?'),
    a: L('Umíme i weby a e-shopy zcela na míru od 18 900 Kč — přesnou cenu vám za pár minut spočítá naše AI kalkulačka. Předplatné za 20 € je ale pro většinu řemeslníků ten nejrychlejší start.', 'We also build fully bespoke websites and e-shops from 18,900 Kč — our AI calculator prices it in minutes. But for most tradespeople the €20 subscription is the fastest start.', 'Wir bauen auch vollständig individuelle Websites und Shops ab 18.900 Kč — unser KI-Kalkulator berechnet den Preis in Minuten. Für die meisten Handwerker ist das 20-€-Abo aber der schnellste Start.'),
  },
  {
    q: L('Kdo za FastMedia.Pro stojí?', 'Who is behind FastMedia.Pro?', 'Wer steht hinter FastMedia.Pro?'),
    a: L('FastMedia.Pro provozuje Timothy Knott (IČO 17308551) z Lounska, Česká republika. Nejsme plátci DPH. Osobně působíme v Ústeckém kraji, jinak pracujeme na dálku po celé ČR a EU.', 'FastMedia.Pro is run by Timothy Knott (IČO 17308551) from the Louny area, Czech Republic. We are not VAT registered. We work in person in the Ústí nad Labem region and remotely across the Czech Republic and the EU.', 'FastMedia.Pro wird von Timothy Knott (IČO 17308551) aus der Region Louny, Tschechien, betrieben. Wir sind nicht umsatzsteuerpflichtig. Persönlich in der Region Ústí nad Labem, sonst remote in ganz Tschechien und der EU.'),
  },
];

/* ---------- small building blocks ---------- */
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>
);
const H2 = ({ children, light }: { children: ReactNode; light?: boolean }) => (
  <h2 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance ${light ? 'text-primary-foreground' : 'text-foreground'}`}>{children}</h2>
);

const BusinessLanding = () => {
  const { language } = useLanguage();
  const lang: Lang = language === 'de' ? 'de' : language === 'en' ? 'en' : 'cs';
  const reduce = useReducedMotion();
  const fade = reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };
  const lp = (p: string) => localizedPath(p, lang);
  const [openFaq, setOpenFaq] = useState<string | undefined>();

  const cta = (where: string) => trackEvent('cta_click', { page: 'business', location: where });
  const primaryBtn = (label: string, where: string) => (
    <Button asChild size="lg" className="h-12 px-7 text-base font-semibold">
      <a href="#enquiry" onClick={() => cta(where)}>{label}<ArrowRight className="ml-2 h-5 w-5" /></a>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle[lang]} description={t.seoDesc[lang]} canonical="/business" pagePath="/business" />
      <Navbar />
      <main>
        {/* 1 HERO */}
        <section className="relative gradient-hero overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fade}>
              <Eyebrow>{t.eyebrow[lang]}</Eyebrow>
              <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground text-balance">
                {t.h1a[lang]} <span className="text-accent">{t.h1b[lang]}</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl">{t.heroSub[lang]}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                {primaryBtn(t.ctaPrimary[lang], 'hero')}
                <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <a href="#demos" onClick={() => cta('hero-demos')}>{t.ctaDemos[lang]}</a>
                </Button>
              </div>
              <ul className="mt-9 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {trust.map((item) => (
                  <li key={item.en} className="flex items-center gap-2 text-sm text-primary-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{item[lang]}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fade} className="relative">
              <img src={hero} alt={L('Ukázka webu pro řemeslníka na mobilu a počítači', 'A tradesperson website shown on phone and desktop', 'Handwerker-Website auf Handy und Desktop')[lang]} width={1280} height={960} className="rounded-[2rem] w-full object-cover aspect-[4/3] shadow-2xl ring-1 ring-primary-foreground/10" />
              <div className="absolute -bottom-5 left-5 right-5 sm:right-auto rounded-2xl bg-card border border-border/60 shadow-lg px-5 py-4 flex items-center gap-3">
                <CalendarCheck className="h-8 w-8 text-accent shrink-0" />
                <p className="text-sm font-medium text-foreground">{L('„Zákazník si objednal termín, zatímco jste byli na zakázce.“', '“A customer booked a slot while you were on a job.”', '„Ein Kunde hat gebucht, während Sie beim Kunden waren.“')}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2 WHAT'S INCLUDED — honest split */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="max-w-3xl">
              <Eyebrow>{L('Co za to dostanete', 'What you get', 'Was Sie bekommen')[lang]}</Eyebrow>
              <div className="mt-5"><H2>{L('20 € měsíčně. A víte přesně, za co.', '€20 a month. And you know exactly what for.', '20 € im Monat. Und Sie wissen genau, wofür.')[lang]}</H2></div>
            </motion.div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {included.map((f) => (
                <motion.div key={f.t.en} {...fade} className="rounded-3xl bg-card border border-border/60 p-6 shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-glow"><f.icon className="h-6 w-6 text-accent-foreground" /></span>
                  <h3 className="mt-5 font-display font-bold text-lg text-foreground">{f.t[lang]}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.d[lang]}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-5">
              <motion.div {...fade} className="rounded-3xl border border-accent/40 bg-accent/5 p-7">
                <h3 className="flex items-center gap-2 font-display font-bold text-lg text-foreground"><HelpCircle className="h-5 w-5 text-accent" />{L('Co si ověříme před objednávkou', 'What we confirm before you order', 'Was wir vor der Bestellung klären')[lang]}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{L('U těchto bodů dostanete přesné podmínky písemně ještě před platbou — raději pořádně vysvětlit než slibovat naslepo:', 'For these points you receive the exact terms in writing before any payment — we would rather explain properly than promise blindly:', 'Zu diesen Punkten erhalten Sie die genauen Bedingungen schriftlich vor jeder Zahlung — wir erklären lieber gründlich, als blind zu versprechen:')}</p>
                <ul className="mt-4 space-y-2">
                  {toConfirm.map((item) => (
                    <li key={item.en} className="flex items-start gap-2 text-sm text-foreground"><FileText className="h-4 w-4 mt-0.5 text-accent shrink-0" />{item[lang]}</li>
                  ))}
                </ul>
              </motion.div>
              <motion.div {...fade} className="rounded-3xl bg-card border border-border/60 p-7 shadow-card">
                <h3 className="flex items-center gap-2 font-display font-bold text-lg text-foreground"><Sparkles className="h-5 w-5 text-accent" />{L('Volitelná rozšíření navíc', 'Optional add-ons', 'Optionale Erweiterungen')[lang]}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{L('Nejsou součástí předplatného — vždy je nabídneme zvlášť a jen s vaším souhlasem:', 'Not part of the subscription — always quoted separately and only with your consent:', 'Nicht Teil des Abos — immer separat angeboten und nur mit Ihrer Zustimmung:')}</p>
                <ul className="mt-4 space-y-2">
                  {optional.map((item) => (
                    <li key={item.en} className="flex items-start gap-2 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />{item[lang]}</li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3 FAQ — near the top, before demos */}
        <section className="py-24 lg:py-28 bg-muted/40">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
            <motion.div {...fade}>
              <Eyebrow>FAQ</Eyebrow>
              <div className="mt-5"><H2>{L('Než se rozhodnete', 'Before you decide', 'Bevor Sie entscheiden')[lang]}</H2></div>
              <p className="mt-5 text-muted-foreground">{L('Odpovídáme rovnou — a co nevíme jistě, to si raději ověříme s vámi písemně.', 'We answer straight — and what we cannot state for sure, we confirm with you in writing.', 'Wir antworten ehrlich — und was wir nicht sicher sagen können, bestätigen wir Ihnen schriftlich.')[lang]}</p>
            </motion.div>
            <Accordion
              type="single"
              collapsible
              value={openFaq}
              onValueChange={(v) => {
                setOpenFaq(v);
                if (v) trackEvent('faq_open', { page: 'business', item: v });
              }}
              className="rounded-3xl bg-card border border-border/60 px-6"
            >
              {faqs.map((f, i) => (
                <AccordionItem key={f.q.en} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display font-semibold text-base">{f.q[lang]}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">{f.a[lang]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 4 DEMOS — real routes, labelled as demos */}
        <section id="demos" className="py-24 lg:py-32 scroll-mt-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="max-w-3xl">
              <Eyebrow>{L('Ukázkové weby', 'Demo websites', 'Demo-Websites')[lang]}</Eyebrow>
              <div className="mt-5"><H2>{L('Proklikejte si, jak by váš web mohl vypadat', 'Click through how your site could look', 'Klicken Sie durch, wie Ihre Website aussehen könnte')[lang]}</H2></div>
              <p className="mt-5 text-lg text-muted-foreground">{L('Toto jsou naše ukázkové weby (demo) — ne stránky skutečných zákazníků. Každá šablona se upraví na váš obor, barvy a texty.', 'These are our demo websites — not real customer sites. Every template is adapted to your trade, colours and copy.', 'Dies sind unsere Demo-Websites — keine echten Kundenseiten. Jede Vorlage wird an Ihre Branche, Farben und Texte angepasst.')[lang]}</p>
            </motion.div>
            <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {demos.map((d) => (
                <motion.li key={d.to} {...fade}>
                  <Link
                    to={lp(d.to)}
                    onClick={() => trackEvent('demo_click', { page: 'business', demo: d.to })}
                    className="group flex items-center justify-between rounded-3xl bg-card border border-border/60 p-6 shadow-card transition hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground">{L('Demo', 'Demo', 'Demo')[lang]}</span>
                      <span className="mt-1 block font-display text-xl font-bold text-foreground">{d.name[lang]}</span>
                    </span>
                    <ExternalLink className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5 HOW IT WORKS */}
        <section className="py-24 lg:py-32 bg-muted/40">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Eyebrow>{L('Jak to probíhá', 'How it works', 'So läuft es')[lang]}</Eyebrow>
                <div className="mt-5"><H2>{L('Tři kroky. Žádná překvapení.', 'Three steps. No surprises.', 'Drei Schritte. Keine Überraschungen.')[lang]}</H2></div>
                <p className="mt-5 text-lg text-muted-foreground">{L('Podmínky znáte předem a v každém kroku schvalujete vy.', 'You know the terms up front and you approve every step.', 'Sie kennen die Bedingungen vorab und geben jeden Schritt frei.')[lang]}</p>
              </div>
              <img src={processImg} alt={L('Schůzka nad návrhem webu', 'A meeting over a website draft', 'Besprechung eines Website-Entwurfs')[lang]} loading="lazy" width={1280} height={960} className="rounded-[2rem] w-full object-cover aspect-[16/10] shadow-lg" />
            </motion.div>
            <ol className="mt-16 grid sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <motion.li key={s.t.en} {...fade} className="rounded-3xl bg-card border border-border/60 p-7 shadow-card">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-accent shadow-glow"><s.icon className="h-6 w-6 text-accent-foreground" /></span>
                    <span className="font-display text-3xl font-bold text-accent">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display font-bold text-lg text-foreground">{s.t[lang]}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d[lang]}</p>
                </motion.li>
              ))}
            </ol>
            <div className="mt-12 flex flex-col sm:flex-row gap-3">{primaryBtn(t.ctaPrimary[lang], 'after-steps')}</div>
          </div>
        </section>

        {/* 6 BESPOKE — clearly secondary */}
        <section className="py-24 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="rounded-[2rem] bg-card border border-border/60 p-8 lg:p-12 shadow-card grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
              <div>
                <Eyebrow>{L('Potřebujete víc?', 'Need more?', 'Brauchen Sie mehr?')[lang]}</Eyebrow>
                <div className="mt-4"><H2>{L('Web nebo e-shop zcela na míru', 'A fully bespoke website or e-shop', 'Vollständig individuelle Website oder Shop')[lang]}</H2></div>
                <p className="mt-5 text-lg text-muted-foreground">{L('Pro větší projekty stavíme weby a e-shopy na míru od 18 900 Kč — s vlastním designem, platbami, automatizacemi i vícejazyčnými verzemi. Přesnou cenu vám za pár minut spočítá AI kalkulačka.', 'For larger projects we build bespoke websites and e-shops from 18,900 Kč — with custom design, payments, automations and multilingual versions. The AI calculator prices it in minutes.', 'Für größere Projekte bauen wir individuelle Websites und Shops ab 18.900 Kč — mit eigenem Design, Zahlungen, Automatisierungen und Mehrsprachigkeit. Der KI-Kalkulator berechnet den Preis in Minuten.')[lang]}</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                    <Link to={lp('/calculator')} onClick={() => cta('bespoke-calculator')}><Calculator className="mr-2 h-5 w-5" />{t.ctaCalculator[lang]}</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="h-12 px-7 text-base">
                    <Link to={lp('/offer')} onClick={() => cta('bespoke-offer')}>{L('Srovnat všechny balíčky', 'Compare all packages', 'Alle Pakete vergleichen')[lang]}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  L('E-shop a online platby', 'E-shop and online payments', 'Onlineshop und Online-Zahlungen'),
                  L('Vlastní design na míru značce', 'Custom design around your brand', 'Individuelles Design für Ihre Marke'),
                  L('Automatizace a napojení na další nástroje', 'Automation and tool integrations', 'Automatisierung und Tool-Anbindungen'),
                  L('Vícejazyčné verze (CZ / EN / DE)', 'Multilingual versions (CZ / EN / DE)', 'Mehrsprachige Versionen (CZ / EN / DE)'),
                ].map((item) => (
                  <li key={item.en} className="flex items-start gap-2 text-foreground"><CheckCircle2 className="h-5 w-5 mt-0.5 text-accent shrink-0" />{item[lang]}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* 7 FINAL CTA + ENQUIRY */}
        <section id="enquiry" className="relative py-24 lg:py-32 gradient-hero overflow-hidden scroll-mt-24">
          <img src={processImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-10" />
          <div className="relative container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
            <motion.div {...fade}>
              <H2 light>{L('Napište nám pár řádků. Ozveme se s konkrétní nabídkou.', 'Write us a few lines. We will come back with a concrete offer.', 'Schreiben Sie uns ein paar Zeilen. Wir melden uns mit einem konkreten Angebot.')[lang]}</H2>
              <p className="mt-6 text-lg text-primary-foreground/80">{L('Vyplněním formuláře se k ničemu nezavazujete. Odpovíme vám s přesným rozsahem a podmínkami písemně — a teprve potom se rozhodnete.', 'Sending the form commits you to nothing. We reply with the exact scope and terms in writing — and only then do you decide.', 'Das Formular verpflichtet Sie zu nichts. Wir antworten schriftlich mit dem genauen Umfang und den Konditionen — erst dann entscheiden Sie.')[lang]}</p>
              <div className="mt-9 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-6 space-y-3 text-sm text-primary-foreground/85">
                <p className="flex items-center gap-2 font-semibold text-primary-foreground"><Building2 className="h-4 w-4 text-accent" />FastMedia.Pro — Timothy Knott</p>
                <p>{L('IČO 17308551 · Louny 440 01, Ústecký kraj, Česká republika · Nejsme plátci DPH', 'IČO 17308551 · Louny 440 01, Ústí nad Labem Region, Czech Republic · Not VAT registered', 'IČO 17308551 · Louny 440 01, Region Ústí nad Labem, Tschechien · Nicht umsatzsteuerpflichtig')}</p>
                <p className="flex flex-wrap gap-x-5 gap-y-1">
                  <a href="tel:+420797864432" className="underline underline-offset-4 hover:text-accent">+420 797 864 432</a>
                  <a href="mailto:support@fastmedia.pro" className="underline underline-offset-4 hover:text-accent">support@fastmedia.pro</a>
                </p>
                <p className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
                  <Link to={lp('/legal/privacy-policy')} className="underline underline-offset-4 hover:text-accent">{L('Ochrana osobních údajů', 'Privacy policy', 'Datenschutzerklärung')[lang]}</Link>
                  <Link to={lp('/legal/terms-of-service')} className="underline underline-offset-4 hover:text-accent">{L('Obchodní podmínky', 'Terms of service', 'AGB')[lang]}</Link>
                  <Link to={lp('/legal/refund-policy')} className="underline underline-offset-4 hover:text-accent">{L('Reklamace a zrušení', 'Refunds & cancellation', 'Widerruf & Stornierung')[lang]}</Link>
                </p>
                <p className="flex items-start gap-2 pt-1 text-primary-foreground/70"><ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-accent" />{L('Vaše údaje použijeme jen k odpovědi na poptávku.', 'We use your details only to answer your enquiry.', 'Wir verwenden Ihre Daten nur zur Beantwortung Ihrer Anfrage.')[lang]}</p>
              </div>
            </motion.div>
            <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-lg">
              <OfferEnquiryForm
                lang={lang}
                source="Business landing — €20/month subscription (/business)"
                onStart={() => trackEvent('enquiry_form_start', { page: 'business' })}
                onSubmitted={() => trackEvent('enquiry_submitted', { page: 'business', intent: 'subscription-20' })}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessLanding;
