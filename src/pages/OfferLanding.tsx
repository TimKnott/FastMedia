import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ShieldCheck, Phone, Mail, MessageCircle, Calculator,
  Wrench, Zap, Car, Scissors, Hammer, Flower2, Paintbrush, KeyRound, Timer, Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { PRICING as P } from '@/lib/offerPricing';

type Lang = 'cs' | 'en' | 'de';

const HERO_IMG = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80';

const trades = [
  { slug: 'plumbing', icon: Wrench, cs: 'Instalatér', en: 'Plumber', de: 'Sanitärbetrieb' },
  { slug: 'electrical', icon: Zap, cs: 'Elektrikář', en: 'Electrician', de: 'Elektrobetrieb' },
  { slug: 'autorepair', icon: Car, cs: 'Autoservis', en: 'Car repair', de: 'Autowerkstatt' },
  { slug: 'beautysalon', icon: Scissors, cs: 'Salon krásy', en: 'Beauty salon', de: 'Kosmetikstudio' },
  { slug: 'carpentry', icon: Hammer, cs: 'Truhlář', en: 'Carpenter', de: 'Tischlerei' },
  { slug: 'painting', icon: Paintbrush, cs: 'Malíř', en: 'Painter', de: 'Malerbetrieb' },
  { slug: 'locksmith', icon: KeyRound, cs: 'Zámečník', en: 'Locksmith', de: 'Schlüsseldienst' },
  { slug: 'florist', icon: Flower2, cs: 'Květinářství', en: 'Florist', de: 'Floristik' },
];

const copy = {
  cs: {
    seoTitle: 'Web pro řemeslníky za 6 900 Kč nebo 0 Kč předem | FastMedia',
    seoDesc: 'Hotový web pro živnostníky: 6 900 Kč jednorázově včetně 1. roku hostingu a domény, nebo 0 Kč předem a 990 Kč měsíčně. 30denní garance vrácení peněz.',
    badge: 'Web do 10 pracovních dnů',
    h1: 'Web, který vám přivede zákazníky z okolí. Od 6 900 Kč.',
    sub: 'Profesionální web pro řemeslníky a živnostníky. Jasná cena, žádné skryté poplatky, a pokud nebudete spokojeni do 30 dnů, vrátíme vám peníze.',
    ctaPrimary: 'Zobrazit ceny',
    ctaSecondary: 'Nezávazná poptávka',
    trust: ['30denní garance vrácení peněz', '1. rok hostingu a .cz domény v ceně', 'Web i doména jsou vaše'],
    demosTitle: 'Podívejte se, jak by mohl vypadat váš web',
    demosSub: 'Vyberte svůj obor a prohlédněte si živou ukázku.',
    demosAll: 'Všechny obory',
    pricingTitle: 'Dvě jednoduché možnosti',
    pricingSub: 'Obě obsahují stejný kompletní web. Liší se jen tím, jak platíte. Nejsme plátci DPH — ceny jsou konečné.',
    own: {
      name: 'Vlastní web', tag: 'Jednorázová platba', price: P.ownPrice, unit: 'jednorázově',
      note: `Od 2. roku ${P.renewalYear} / rok (${P.renewalMonthEq} měsíčně)`,
      items: [
        'Jednostránkový web na míru vašemu oboru',
        'Tlačítko pro okamžité zavolání a WhatsApp',
        'Služby (až 6), o vás, galerie až 12 fotek',
        'Otevírací doba, mapa oblasti, kontaktní formulář',
        '1. rok hostingu a .cz domény zdarma',
        'SSL certifikát (HTTPS) a 1 firemní e-mail',
        'Zápis do Google Map a Firmy.cz',
        'Rychlé načítání na mobilu',
      ],
      cta: 'Chci vlastní web',
    },
    sub2: {
      name: 'Web jako služba', tag: 'Bez vstupní investice', price: P.subMonthly, unit: '/ měsíc',
      upfront: `${P.subUpfront} předem`,
      note: 'Smlouva na 12 měsíců, poté výpověď kdykoliv s 30denní lhůtou',
      items: [
        'Vše z balíčku Vlastní web',
        'Hosting a doména po celou dobu v ceně',
        'Až 45 minut úprav obsahu každý měsíc',
        'Nové fotky, ceny, otevírací doba, oznámení',
        'Bezpečnostní aktualizace a denní zálohy',
        'Podpora e-mailem i telefonem',
        `Po 12 měsících možnost přejít na ${P.renewalYear} / rok`,
      ],
      cta: 'Chci web za 0 Kč předem',
      popular: 'Nejoblíbenější',
    },
    renewalTitle: 'Kolik platíte po prvním roce?',
    renewalRows: [
      ['Vlastní web', `${P.renewalYear} / rok — hosting, prodloužení domény, SSL, denní zálohy a technická podpora. Fakturujeme jednou ročně.`],
      ['Web jako služba', `Dál ${P.subMonthly} / měsíc s měsíční výpovědí, nebo přechod na ${P.renewalYear} / rok, pokud už úpravy nepotřebujete.`],
      ['Volitelná péče', 'Plná správa za 4 900 Kč / rok — 1 hodina úprav měsíčně a přednostní telefonická podpora.'],
    ],
    hostageTitle: 'Žádné vázanosti ani rukojmí',
    hostageBody: `Web i doména jsou od prvního dne vaše. Po 12 měsících můžete pokračovat u nás za ${P.renewalYear} ročně, nebo vám zdarma předáme kompletní data a web si převedete kamkoliv jinam.`,
    calcTitle: 'Potřebujete větší web?',
    calcBody: `Balíčky výše jsou pro jednostránkový web. Pokud chcete více stránek, online rezervace, e-shop, klientskou zónu nebo více jazyků, spočítejte si cenu v naší kalkulačce. Větší weby začínají od ${P.customFrom}.`,
    calcPoints: ['Vícestránkové weby', 'Online rezervace termínů', 'E-shop a platby', 'Klientská zóna', 'Více jazyků'],
    calcCta: 'Spočítat cenu většího webu',
    proofTitle: 'Naše práce',
    proofBody: 'Prohlédněte si skutečné weby, které jsme postavili — se snímky obrazovky a popisem, co řeší.',
    proofCta: 'Zobrazit případové studie',
    grantTitle: 'Firma s větším projektem?',
    grantBody: 'U větších projektů může část ceny pokrýt dotace na digitalizaci. Zdarma posoudíme, zda můžete žádat.',
    grantCta: 'Průvodce dotacemi',
    processTitle: 'Jak to probíhá',
    process: [
      ['01', 'Poptávka', 'Vyplníte 3 údaje nebo zavoláte. Ozveme se do 24 hodin.'],
      ['02', 'Návrh zdarma', 'Připravíme návrh webu. Platíte, až když se vám líbí.'],
      ['03', 'Úpravy', 'Doladíme texty, fotky a barvy podle vás.'],
      ['04', 'Spuštění', 'Web jde online do 10 pracovních dnů. 30 dní garance.'],
    ],
    faqTitle: 'Časté dotazy',
    faqs: [
      ['Co přesně dostanu za 6 900 Kč?', 'Kompletní jednostránkový web pro váš obor včetně textů, galerie, kontaktního formuláře, mapy, tlačítka pro volání a WhatsApp, zápisu do Google Map a Firmy.cz, plus první rok hostingu, .cz domény, SSL a jednoho e-mailu.'],
      ['Kolik zaplatím po prvním roce?', `${P.renewalYear} ročně za hosting, doménu, SSL, zálohy a podporu. Jedna faktura ročně, žádné měsíční drobné platby.`],
      ['Jak funguje varianta za 990 Kč měsíčně?', 'Nic neplatíte předem. Prvních 12 měsíců platíte 990 Kč měsíčně, poté můžete pokračovat s měsíční výpovědí, nebo přejít na roční hosting.'],
      ['Jak funguje 30denní garance?', 'Platí pro oba balíčky (Vlastní web i Web jako služba). Pokud do 30 dnů od spuštění nebudete spokojeni, vrátíme vám zaplacenou částku. Bez dokazování. U větších webů z kalkulačky garanci vrácení nabídnout nemůžeme — tam platí garance funkčnosti a předávací protokol.'],
      ['Co když budu chtít odejít?', 'Web i doména jsou vaše. Zdarma vám předáme všechna data a pomůžeme s převodem.'],
      ['Potřebuji víc než jednu stránku.', `Použijte naši kalkulačku — spočítá cenu webu s více stránkami, rezervacemi nebo e-shopem. Větší weby začínají od ${P.customFrom}.`],
    ],
    finalTitle: 'Začněme s vaším webem',
    finalSub: 'Zavolejte, napište na WhatsApp nebo vyplňte poptávku. Ozveme se do 24 hodin.',
    call: `Zavolat ${P.phone}`,
    wa: 'Napsat na WhatsApp',
  },
  en: {
    seoTitle: 'A website for trades from 6,900 Kč or 0 Kč upfront | FastMedia',
    seoDesc: 'A ready website for tradespeople: 6,900 Kč one-off including the first year of hosting and domain, or 0 Kč upfront and 990 Kč a month. 30-day money-back guarantee.',
    badge: 'Live within 10 working days',
    h1: 'A website that brings you local customers. From 6,900 Kč.',
    sub: 'A professional website for tradespeople and small businesses. Clear price, no hidden fees, and if you are not happy within 30 days, you get your money back.',
    ctaPrimary: 'See prices',
    ctaSecondary: 'Send an enquiry',
    trust: ['30-day money-back guarantee', 'First year of hosting and .cz domain included', 'The site and domain are yours'],
    demosTitle: 'See what your website could look like',
    demosSub: 'Pick your trade and open a live example.',
    demosAll: 'All trades',
    pricingTitle: 'Two simple options',
    pricingSub: 'Both include the same complete website. The only difference is how you pay.',
    own: {
      name: 'Own your website', tag: 'One-off payment', price: P.ownPrice, unit: 'one-off',
      note: `From year 2: ${P.renewalYear} / year (${P.renewalMonthEq} a month)`,
      items: [
        'One-page website tailored to your trade',
        'Tap-to-call and WhatsApp buttons',
        'Services (up to 6), about you, gallery of up to 12 photos',
        'Opening hours, service area map, contact form',
        'First year of hosting and .cz domain free',
        'SSL certificate (HTTPS) and 1 business email',
        'Listing on Google Maps and Firmy.cz',
        'Fast loading on mobile',
      ],
      cta: 'I want to own my website',
    },
    sub2: {
      name: 'Website as a service', tag: 'Nothing upfront', price: P.subMonthly, unit: '/ month',
      upfront: `${P.subUpfront} upfront`,
      note: '12-month term, then cancel any time with 30 days notice',
      items: [
        'Everything in Own your website',
        'Hosting and domain included throughout',
        'Up to 45 minutes of content changes every month',
        'New photos, prices, opening hours, announcements',
        'Security updates and daily backups',
        'Email and phone support',
        `After 12 months, option to switch to ${P.renewalYear} / year`,
      ],
      cta: 'I want it for 0 Kč upfront',
      popular: 'Most popular',
    },
    renewalTitle: 'What do you pay after the first year?',
    renewalRows: [
      ['Own your website', `${P.renewalYear} / year — hosting, domain renewal, SSL, daily backups and technical support. Invoiced once a year.`],
      ['Website as a service', `Continue at ${P.subMonthly} / month with monthly notice, or switch to ${P.renewalYear} / year if you no longer need changes.`],
      ['Optional care', 'Full care for 4,900 Kč / year — 1 hour of changes a month and priority phone support.'],
    ],
    hostageTitle: 'No lock-in, no hostage-taking',
    hostageBody: `The website and domain are yours from day one. After 12 months you can stay with us for ${P.renewalYear} a year, or we hand over all your files free of charge to move wherever you like.`,
    calcTitle: 'Need a bigger website?',
    calcBody: `The packages above are for a one-page website. If you need more pages, online booking, an e-shop, a client area or several languages, work out your price in our calculator. Bigger websites start from ${P.customFrom}.`,
    calcPoints: ['Multi-page websites', 'Online booking', 'E-shop and payments', 'Client area', 'Several languages'],
    calcCta: 'Price a bigger website',
    proofTitle: 'Our work',
    proofBody: 'See real websites we have built — with screenshots and what each one does.',
    proofCta: 'View case studies',
    grantTitle: 'A company with a bigger project?',
    grantBody: 'For bigger projects, a digitalisation grant may cover part of the cost. We check for free whether you can apply.',
    grantCta: 'Grant guide',
    processTitle: 'How it works',
    process: [
      ['01', 'Enquiry', 'Fill in 3 details or call. We reply within 24 hours.'],
      ['02', 'Free draft', 'We prepare a draft. You pay only when you like it.'],
      ['03', 'Changes', 'We fine-tune the text, photos and colours with you.'],
      ['04', 'Launch', 'Live within 10 working days. 30-day guarantee.'],
    ],
    faqTitle: 'Common questions',
    faqs: [
      ['What exactly do I get for 6,900 Kč?', 'A complete one-page website for your trade with copy, gallery, contact form, map, call and WhatsApp buttons, Google Maps and Firmy.cz listing, plus the first year of hosting, .cz domain, SSL and one email address.'],
      ['What do I pay after the first year?', `${P.renewalYear} a year for hosting, domain, SSL, backups and support. One invoice a year.`],
      ['How does the 990 Kč a month option work?', 'You pay nothing upfront. For the first 12 months you pay 990 Kč a month, then continue with monthly notice or switch to yearly hosting.'],
      ['How does the 30-day guarantee work?', 'It applies to both packages (Own Website and Website as a Service). If you are not happy within 30 days of launch, we refund what you paid. No questions. Larger calculator-priced projects are covered by a functionality warranty and handover protocol instead.'],
      ['What if I want to leave?', 'The site and domain are yours. We hand over all files free of charge and help you move.'],
      ['I need more than one page.', `Use our calculator — it prices websites with more pages, booking or an e-shop. Bigger websites start from ${P.customFrom}.`],
    ],
    finalTitle: "Let's start your website",
    finalSub: 'Call, message us on WhatsApp or send an enquiry. We reply within 24 hours.',
    call: `Call ${P.phone}`,
    wa: 'Message on WhatsApp',
  },
  de: {
    seoTitle: 'Webdesign für Handwerksbetriebe ab 6.900 Kč | FastMedia',
    seoDesc: 'Eine Website für Ihr Unternehmen: 6.900 Kč einmalig mit Hosting und .cz-Domain im ersten Jahr oder 990 Kč monatlich ohne Anzahlung. Klare Folgekosten.',
    badge: 'Online innerhalb von 10 Arbeitstagen',
    h1: 'Eine Website für Ihr Unternehmen. Ab 6.900 Kč.',
    sub: 'Professionelle Websites für Handwerksbetriebe und kleine Unternehmen. Klare Preise ohne versteckte Gebühren. Für die beiden kleinen Pakete gilt unsere 30-Tage-Geld-zurück-Garantie.',
    ctaPrimary: 'Preise ansehen', ctaSecondary: 'Unverbindlich anfragen',
    trust: ['30-Tage-Geld-zurück-Garantie für kleine Pakete', 'Hosting und .cz-Domain im ersten Jahr inklusive', 'Website und Domain gehören Ihnen'],
    demosTitle: 'So könnte Ihre Website aussehen', demosSub: 'Wählen Sie Ihre Branche und sehen Sie sich eine Live-Demo an.', demosAll: 'Alle Branchen',
    pricingTitle: 'Zwei einfache Möglichkeiten',
    pricingSub: 'Beide Pakete enthalten dieselbe vollständige Website. Der Unterschied liegt in der Zahlung. Wir sind nicht umsatzsteuerpflichtig registriert – die angegebenen Preise sind Endpreise in tschechischen Kronen.',
    own: {
      name: 'Eigene Website', tag: 'Einmalige Zahlung', price: P.ownPrice, unit: 'einmalig',
      note: `Ab dem zweiten Jahr: ${P.renewalYear} jährlich (${P.renewalMonthEq} monatlich umgerechnet)`,
      items: ['Eine einseitige Website für Ihre Branche', 'Schaltflächen für Anrufe und WhatsApp', 'Bis zu 6 Leistungen, Über-uns-Bereich und bis zu 12 Fotos', 'Öffnungszeiten, Gebietskarte und Kontaktformular', 'Hosting und .cz-Domain im ersten Jahr inklusive', 'SSL-Zertifikat (HTTPS) und eine geschäftliche E-Mail-Adresse', 'Eintrag bei Google Maps und Firmy.cz', 'Schnelle Darstellung auf Mobilgeräten'],
      cta: 'Ich möchte eine eigene Website',
    },
    sub2: {
      name: 'Website im Monatsabo', tag: 'Ohne Anzahlung', price: P.subMonthly, unit: '/ Monat', upfront: `${P.subUpfront} im Voraus`,
      note: '12 Monate Mindestlaufzeit, danach jederzeit mit 30 Tagen Frist kündbar',
      items: ['Alles aus dem Paket Eigene Website', 'Hosting und Domain während der Laufzeit inklusive', 'Bis zu 45 Minuten Inhaltsänderungen pro Monat', 'Neue Fotos, Preise, Öffnungszeiten und Mitteilungen', 'Sicherheitsupdates und tägliche Backups', 'Unterstützung per E-Mail und Telefon', `Nach 12 Monaten Wechsel zu ${P.renewalYear} jährlich möglich`],
      cta: 'Ich möchte ohne Anzahlung starten', popular: 'Beliebtes Paket',
    },
    renewalTitle: 'Was kostet die Website nach dem ersten Jahr?',
    renewalRows: [
      ['Eigene Website', `${P.renewalYear} jährlich für Hosting, Domainverlängerung, SSL, tägliche Backups und technischen Support. Eine Rechnung pro Jahr.`],
      ['Website im Monatsabo', `Weiterhin ${P.subMonthly} monatlich mit Kündigungsfrist oder Wechsel zu ${P.renewalYear} jährlich, wenn Sie keine Inhaltsänderungen mehr benötigen.`],
      ['Optionale Betreuung', 'Umfassende Betreuung für 4.900 Kč jährlich: eine Stunde Änderungen pro Monat und bevorzugter telefonischer Support.'],
    ],
    hostageTitle: 'Ihre Website bleibt Ihre Website',
    hostageBody: `Website und Domain gehören Ihnen vom ersten Tag an. Nach 12 Monaten können Sie für ${P.renewalYear} jährlich bei uns bleiben oder alle Dateien kostenlos erhalten und zu einem anderen Anbieter wechseln.`,
    calcTitle: 'Benötigen Sie eine größere Website?',
    calcBody: `Diese Pakete gelten für eine einseitige Website. Für mehrere Seiten, Buchungen, einen Onlineshop, einen Kundenbereich oder mehrere Sprachen nutzen Sie unseren Kalkulator. Größere Projekte beginnen bei ${P.customFrom}. Die Geld-zurück-Garantie der kleinen Pakete gilt hierfür nicht.`,
    calcPoints: ['Mehrseitige Websites', 'Online-Terminbuchung', 'Onlineshop und Zahlungen', 'Kundenbereich', 'Mehrere Sprachen'], calcCta: 'Größeres Projekt kalkulieren',
    proofTitle: 'Unsere Projekte', proofBody: 'Sehen Sie sich echte Websites mit Screenshots und Beschreibungen an.', proofCta: 'Projektbeispiele ansehen',
    grantTitle: 'Planen Sie ein größeres Projekt?', grantBody: 'Digitalisierungsförderungen können unter bestimmten Voraussetzungen einen Teil der Kosten abdecken. Die Förderstelle entscheidet über die Eignung; eine deutsche Förderung ist nicht zugesichert.', grantCta: 'Fördermöglichkeiten ansehen',
    processTitle: 'So läuft Ihr Projekt ab',
    process: [['01', 'Anfrage', 'Senden Sie uns Ihre Angaben oder rufen Sie an. Wir antworten innerhalb von 24 Stunden.'], ['02', 'Kostenloser Entwurf', 'Wir erstellen einen Entwurf. Sie bezahlen erst, wenn er Ihnen gefällt.'], ['03', 'Abstimmung', 'Wir passen Texte, Fotos und Farben mit Ihnen an.'], ['04', 'Veröffentlichung', 'Online innerhalb von 10 Arbeitstagen. Für kleine Pakete gilt die 30-Tage-Garantie.']],
    faqTitle: 'Häufige Fragen',
    faqs: [
      ['Was erhalte ich für 6.900 Kč?', 'Eine vollständige einseitige Website mit Texten, Galerie, Kontaktformular, Karte, Anruf- und WhatsApp-Schaltflächen, Eintrag bei Google Maps und Firmy.cz sowie Hosting, .cz-Domain, SSL und einer E-Mail-Adresse im ersten Jahr.'],
      ['Was bezahle ich nach dem ersten Jahr?', `${P.renewalYear} jährlich für Hosting, Domain, SSL, Backups und Support. Eine Rechnung pro Jahr.`],
      ['Wie funktioniert das Monatsabo für 990 Kč?', 'Keine Anzahlung. Sie bezahlen 990 Kč monatlich für zunächst 12 Monate. Danach können Sie monatlich mit 30 Tagen Frist kündigen oder zum jährlichen Hosting wechseln.'],
      ['Wie funktioniert die 30-Tage-Garantie?', 'Sie gilt für die beiden kleinen Pakete. Wenn Sie innerhalb von 30 Tagen nach Veröffentlichung unzufrieden sind, erstatten wir Ihre Zahlung. Größere Projekte aus dem Kalkulator sind ausgeschlossen; dort gelten die Funktionsgewährleistung und das Übergabeprotokoll.'],
      ['Kann ich zu einem anderen Anbieter wechseln?', 'Ja. Website und Domain gehören Ihnen. Wir übergeben die Dateien kostenlos und helfen beim Umzug.'],
      ['Ich benötige mehrere Seiten.', `Nutzen Sie den Kalkulator für zusätzliche Seiten, Buchungen oder einen Onlineshop. Größere Websites beginnen bei ${P.customFrom}.`],
    ],
    finalTitle: 'Sprechen wir über Ihre Website', finalSub: 'Rufen Sie an, schreiben Sie über WhatsApp oder senden Sie eine Anfrage. Wir antworten innerhalb von 24 Stunden.', call: `Anrufen: ${P.phone}`, wa: 'Über WhatsApp schreiben',
  },
} as const;

const OfferLanding = () => {
  const { language } = useLanguage();
  const lang: Lang = language;
  const t = copy[lang];
  const { hash, search } = useLocation();
  const params = new URLSearchParams(search);
  const obor = params.get('obor');
  const focusTrade = trades.find((tr) => tr.slug === obor);

  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [hash]);

  const plans = [
    { ...t.own, upfront: undefined as string | undefined, popular: undefined as string | undefined },
    { ...t.sub2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} canonical="/offer" ogType="website" pagePath="/offer" />

      <div className="sticky top-0 z-50 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="font-semibold tracking-tight">FastMedia<span className="text-primary">.Pro</span></Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <a href={P.phoneHref}><Phone className="w-4 h-4" /> {P.phone}</a>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img decoding="async" src={HERO_IMG} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/88 to-primary/50" />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-foreground border border-primary/40 text-xs font-semibold uppercase tracking-wide mb-6">
              <Timer className="w-3.5 h-3.5" /> {focusTrade ? focusTrade[lang] : t.badge}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.06] mb-6">{t.h1}</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">{t.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/30">
                <a href="#cenik">{t.ctaPrimary}<ArrowRight className="w-5 h-5" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                <a href="#enquiry">{t.ctaSecondary}</a>
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

      {/* DEMOS */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t.demosTitle}</h2>
          <p className="text-muted-foreground">{t.demosSub}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {trades.map((tr) => {
            const Icon = tr.icon;
            const active = tr.slug === obor;
            return (
              <Link key={tr.slug} to={`/demo/${tr.slug}`}
                className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'border-primary bg-primary/10' : 'border-border/60 bg-card'}`}>
                <span className="p-3 rounded-xl bg-primary/10 text-primary"><Icon className="w-6 h-6" /></span>
                <span className="font-semibold">{tr[lang]}</span>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <Button asChild variant="link"><Link to="/#demos">{t.demosAll}<ArrowRight className="w-4 h-4" /></Link></Button>
        </div>
      </section>

      {/* PRICING */}
      <section id="cenik" className="bg-muted/40 py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.pricingTitle}</h2>
            <p className="text-lg text-muted-foreground">{t.pricingSub}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {plans.map((p) => (
              <Card key={p.name} className={`relative h-full ${p.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border/60 shadow-lg'}`}>
                {p.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{p.popular}</Badge>
                )}
                <CardContent className="p-8 flex flex-col h-full">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{p.tag}</p>
                  <h3 className="text-2xl font-bold mb-4">{p.name}</h3>
                  {p.upfront && <p className="text-lg font-semibold text-foreground">{p.upfront}, {lang === 'cs' ? 'poté' : lang === 'de' ? 'danach' : 'then'}</p>}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{p.price}</span>
                    <span className="text-muted-foreground">{p.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{p.note}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" variant={p.popular ? 'default' : 'outline'} className="w-full h-12">
                    <a href="#enquiry">{p.cta}<ArrowRight className="w-4 h-4" /></a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Renewal + no hostage */}
          <div className="grid md:grid-cols-[1.4fr,1fr] gap-6 max-w-5xl mx-auto mt-8">
            <Card className="border-border/60">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4">{t.renewalTitle}</h3>
                <dl className="space-y-4">
                  {t.renewalRows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-semibold">{k}</dt>
                      <dd className="text-sm text-muted-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-6 md:p-8">
                <Unlock className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-3">{t.hostageTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.hostageBody}</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="w-5 h-5 text-primary" />{t.trust[0]}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CALCULATOR BRIDGE */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <Card className="max-w-5xl mx-auto border-accent/40 overflow-hidden">
          <CardContent className="p-8 md:p-12 grid md:grid-cols-[auto,1fr] gap-8 items-start">
            <div className="p-5 rounded-2xl bg-accent/15 text-accent w-fit"><Calculator className="w-12 h-12" /></div>
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{t.calcTitle}</h2>
              <p className="text-lg text-muted-foreground mb-5">{t.calcBody}</p>
              <ul className="flex flex-wrap gap-2 mb-6">
                {t.calcPoints.map((pt) => <li key={pt}><Badge variant="secondary">{pt}</Badge></li>)}
              </ul>
              <Button asChild size="lg" className="h-12"><Link to="/calculator">{t.calcCta}<ArrowRight className="w-4 h-4" /></Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* PROOF + GRANT */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card className="border-border/60"><CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-3">{t.proofTitle}</h3>
            <p className="text-muted-foreground mb-6">{t.proofBody}</p>
            <Button asChild variant="outline"><Link to="/case-studies">{t.proofCta}<ArrowRight className="w-4 h-4" /></Link></Button>
          </CardContent></Card>
          <Card className="border-border/60"><CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-3">{t.grantTitle}</h3>
            <p className="text-muted-foreground mb-6">{t.grantBody}</p>
            <Button asChild variant="outline"><Link to="/grants">{t.grantCta}<ArrowRight className="w-4 h-4" /></Link></Button>
          </CardContent></Card>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-muted/40 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t.processTitle}</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {t.process.map(([n, title, d]) => (
              <Card key={n} className="h-full border-border/60"><CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold flex items-center justify-center mb-4">{n}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="w-full">
          {t.faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ENQUIRY */}
      <section id="enquiry" className="bg-muted/40 py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4"><OfferEnquiryForm lang={lang} /></div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.finalTitle}</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">{t.finalSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base">
              <a href={P.phoneHref}><Phone className="w-5 h-5" /> {t.call}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <a href={P.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-5 h-5" /> {t.wa}</a>
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-80 flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> support@fastmedia.pro</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OfferLanding;
