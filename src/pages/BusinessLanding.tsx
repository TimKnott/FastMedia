import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Calculator, CheckCircle2, Globe, ShoppingCart, LayoutTemplate, Megaphone, Video, Bot,
  PhoneMissed, SearchX, Clock, Smartphone, TrendingDown, MessageSquareOff, Rocket, Wrench, ShieldCheck, Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShowcaseCarousel from '@/components/ShowcaseCarousel';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedPath } from '@/lib/publicLanguage';
import hero from '@/assets/business/hero-business.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;
const L = (cs: string, en: string, de: string): L3 => ({ cs, en, de });

const c = {
  seoTitle: L('Web, který prodává — weby, e-shopy a marketing | FastMedia.Pro', 'A website that sells — sites, e-shops & marketing | FastMedia.Pro', 'Eine Website, die verkauft — Websites, Shops & Marketing | FastMedia.Pro'),
  seoDesc: L('Hotový web od 6 900 Kč nebo projekt na míru. E-shopy, obsah, videa a automatické zachycení poptávek pro řemesla, služby, obchody i pohostinství.', 'Ready-built site from 6,900 Kč or a custom build. E-shops, content, video and automatic lead capture for trades, services, retail and hospitality.', 'Fertige Website ab 6.900 Kč oder individuelles Projekt. Shops, Inhalte, Video und automatische Anfrageerfassung für Handwerk, Dienstleistung, Handel und Gastronomie.'),
  eyebrow: L('Pro firmy, které chtějí víc poptávek', 'For businesses that want more enquiries', 'Für Unternehmen, die mehr Anfragen wollen'),
  h1: L('Vaši zákazníci vás právě hledají. Najdou vás — nebo konkurenci?', 'Your customers are searching right now. Will they find you — or your competitor?', 'Ihre Kunden suchen gerade. Finden sie Sie — oder die Konkurrenz?'),
  intro: L('Postavíme vám web nebo e-shop, který odpoví na otázky dřív, než zákazník zavolá jinam, zachytí každou poptávku a pracuje i ve chvíli, kdy vy pracujete na zakázce.', 'We build a website or e-shop that answers questions before a customer calls someone else, captures every enquiry, and keeps working while you are busy on the job.', 'Wir bauen eine Website oder einen Shop, der Fragen beantwortet, bevor Kunden woanders anrufen, jede Anfrage erfasst und arbeitet, während Sie beim Kunden sind.'),
  ctaCalc: L('Spočítat cenu projektu', 'Price your project now', 'Projektpreis berechnen'),
  ctaTalk: L('Chci nezávaznou konzultaci', 'Get a free consultation', 'Kostenlose Beratung'),
  heroNote: L('Bez závazku · Odpověď do 1 pracovního dne · CZ / EN / DE', 'No obligation · Reply within 1 working day · CZ / EN / DE', 'Unverbindlich · Antwort innerhalb 1 Arbeitstages · CZ / EN / DE'),
  painsTitle: L('Kolik vás stojí web, který nepracuje?', 'What is a website that doesn’t work costing you?', 'Was kostet Sie eine Website, die nicht arbeitet?'),
  painsSub: L('Většina zákazníků se rozhodne během pár vteřin na mobilu. Tohle jsou místa, kde firmy tiše ztrácejí zakázky:', 'Most customers decide within seconds, on a phone. These are the places businesses quietly lose work:', 'Die meisten Kunden entscheiden in Sekunden, am Handy. Hier verlieren Unternehmen still Aufträge:'),
  urgencyTitle: L('Každý týden bez fungujícího webu je týden, kdy zákazníci volají jinam.', 'Every week without a working website is a week customers call someone else.', 'Jede Woche ohne funktionierende Website ist eine Woche, in der Kunden woanders anrufen.'),
  urgencyText: L('Neslibujeme zázračná čísla — výsledky se liší podle oboru, lokality a nabídky. Ale web, který se nenačte, nejde najít nebo nemá jasný kontakt, zakázky nepřinese nikdy. Čím dřív začnete, tím dřív začne pracovat.', 'We don’t promise miracle numbers — results vary by industry, location and offer. But a site that won’t load, can’t be found or hides the contact button will never bring work. The sooner you start, the sooner it starts working.', 'Wir versprechen keine Wunderzahlen — Ergebnisse variieren je nach Branche, Standort und Angebot. Aber eine Website, die nicht lädt, nicht gefunden wird oder den Kontakt versteckt, bringt nie Aufträge. Je früher Sie starten, desto früher arbeitet sie.'),
  pathsTitle: L('Dvě cesty. Vyberte si tu svou.', 'Two paths. Choose yours.', 'Zwei Wege. Wählen Sie Ihren.'),
  servicesTitle: L('Vše, co potřebujete, od jednoho týmu', 'Everything you need, from one team', 'Alles, was Sie brauchen, von einem Team'),
  processTitle: L('Jak to probíhá', 'How it works', 'So läuft es ab'),
  proofTitle: L('Skutečné weby, které jsme postavili', 'Real websites we have built', 'Echte Websites, die wir gebaut haben'),
  proofSub: L('Žádné vymyšlené reference — jen projekty, které můžete sami otevřít a proklikat.', 'No made-up testimonials — just projects you can open and click through yourself.', 'Keine erfundenen Referenzen — nur Projekte, die Sie selbst öffnen und durchklicken können.'),
  faqTitle: L('Časté otázky před rozhodnutím', 'Questions people ask before deciding', 'Häufige Fragen vor der Entscheidung'),
  finalTitle: L('Začněte dnes. Za pár minut víte, co vás web bude stát.', 'Start today. In a few minutes you’ll know what your website will cost.', 'Starten Sie heute. In wenigen Minuten wissen Sie, was Ihre Website kostet.'),
  finalText: L('Projděte kalkulačku, nebo nám rovnou napište pár vět o své firmě.', 'Run through the calculator, or just send us a few lines about your business.', 'Nutzen Sie den Kalkulator oder schreiben Sie uns ein paar Zeilen über Ihr Unternehmen.'),
};

const pains = [
  { icon: PhoneMissed, t: L('Zmeškané hovory', 'Missed calls', 'Verpasste Anrufe'), d: L('Jste na zakázce, telefon zvoní a zákazník zavolá dalšímu v seznamu.', 'You’re on a job, the phone rings, and the customer calls the next name on the list.', 'Sie sind beim Kunden, das Telefon klingelt — und der Anrufer ruft den Nächsten an.') },
  { icon: SearchX, t: L('Nejste vidět', 'You’re invisible', 'Nicht sichtbar'), d: L('Google ani AI vyhledávače vaše služby nerozumí, takže vás nenabídnou.', 'Google and AI search can’t understand your services, so they don’t recommend you.', 'Google und KI-Suche verstehen Ihre Leistungen nicht und empfehlen Sie nicht.') },
  { icon: Smartphone, t: L('Rozbitý mobil', 'Broken on mobile', 'Mobil kaputt'), d: L('Malé písmo, pomalé načítání a schovaný kontakt na telefonu odradí.', 'Tiny text, slow loading and a hidden contact button drive mobile visitors away.', 'Kleine Schrift, langsames Laden und versteckter Kontakt vertreiben Besucher.') },
  { icon: MessageSquareOff, t: L('Ztracené poptávky', 'Lost enquiries', 'Verlorene Anfragen'), d: L('Zprávy z webu, e-mailu a sociálních sítí se ztrácejí v různých aplikacích.', 'Messages from your site, email and social get lost across different apps.', 'Nachrichten von Website, E-Mail und Social Media gehen in Apps verloren.') },
  { icon: Clock, t: L('Večery u administrativy', 'Evenings on admin', 'Abende mit Verwaltung'), d: L('Odpovídáte na stále stejné otázky místo toho, abyste vydělávali.', 'You answer the same questions over and over instead of earning.', 'Sie beantworten immer dieselben Fragen, statt zu verdienen.') },
  { icon: TrendingDown, t: L('Zastaralý dojem', 'Outdated first impression', 'Veralteter Eindruck'), d: L('Starý web působí, jako byste už nepodnikali — i když jste nejlepší v oboru.', 'An old site looks like you’ve closed — even if you’re the best in your field.', 'Eine alte Website wirkt, als gäbe es Sie nicht mehr — auch wenn Sie die Besten sind.') },
];

const paths = [
  {
    icon: Rocket, tag: L('Rychlý start', 'Fast start', 'Schnellstart'),
    t: L('Hotový web pro váš obor', 'Ready-built website for your trade', 'Fertige Website für Ihre Branche'),
    d: L('Ověřená oborová šablona upravená na vaši značku, texty a fotky. Ideální pro řemesla a služby, které chtějí být online rychle.', 'A proven industry template adapted to your brand, copy and photos. Ideal for trades and services that want to be online fast.', 'Eine bewährte Branchenvorlage, angepasst an Ihre Marke, Texte und Fotos. Ideal für Handwerk und Dienstleister, die schnell online sein wollen.'),
    pts: [L('Od 6 900 Kč jednorázově, nebo 0 Kč předem a 990 Kč měsíčně', 'From 6,900 Kč one-off, or 0 Kč upfront and 990 Kč monthly', 'Ab 6.900 Kč einmalig oder 0 Kč Anzahlung und 990 Kč monatlich'), L('První rok hostingu a .cz domény v ceně', 'First year of hosting and .cz domain included', 'Erstes Jahr Hosting und .cz-Domain inklusive'), L('30denní garance vrácení peněz', '30-day money-back guarantee', '30 Tage Geld-zurück-Garantie')],
    cta: L('Zobrazit hotové balíčky', 'See ready-built packages', 'Fertige Pakete ansehen'), to: '/offer',
  },
  {
    icon: Wrench, tag: L('Na míru', 'Custom', 'Individuell'),
    t: L('Web nebo e-shop na míru', 'Custom website or e-shop', 'Individuelle Website oder Onlineshop'),
    d: L('Pro firmy, které potřebují rezervace, e-shop, více jazyků, propojení s nástroji nebo automatizace. Cenu si složíte sami v kalkulačce.', 'For businesses that need bookings, an e-shop, multiple languages, tool integrations or automation. Build your own price in the calculator.', 'Für Unternehmen mit Buchungen, Shop, mehreren Sprachen, Integrationen oder Automatisierung. Den Preis stellen Sie im Kalkulator selbst zusammen.'),
    pts: [L('Projekty od 18 900 Kč', 'Projects from 18,900 Kč', 'Projekte ab 18.900 Kč'), L('Moduly vyberete podle potřeby', 'Pick only the modules you need', 'Nur die Module wählen, die Sie brauchen'), L('Záruka funkčnosti dodaného řešení', 'Functionality warranty on delivery', 'Funktionsgarantie bei Lieferung')],
    cta: L('Spočítat projekt na míru', 'Price a custom project', 'Individuelles Projekt berechnen'), to: '/calculator',
  },
];

const services = [
  { icon: Globe, t: L('Weby, které prodávají', 'Websites that sell', 'Websites, die verkaufen'), d: L('Rychlé, mobilní, srozumitelné pro Google i AI vyhledávače, s jasnou výzvou k akci na každé stránce.', 'Fast, mobile-first, readable by Google and AI search, with a clear call to action on every page.', 'Schnell, mobil, lesbar für Google und KI-Suche, mit klarer Handlungsaufforderung auf jeder Seite.') },
  { icon: ShoppingCart, t: L('E-shopy', 'E-shops', 'Onlineshops'), d: L('Katalog, košík, platby a přehled objednávek — připraveno na prodej od prvního dne.', 'Catalogue, cart, payments and order overview — ready to sell from day one.', 'Katalog, Warenkorb, Zahlungen und Bestellübersicht — verkaufsbereit ab Tag eins.') },
  { icon: LayoutTemplate, t: L('Hotové oborové weby', 'Ready-built industry sites', 'Fertige Branchen-Websites'), d: L('Desítky oborových šablon — od instalatérů po salony a kavárny.', 'Dozens of industry templates — from plumbers to salons and cafés.', 'Dutzende Branchenvorlagen — vom Installateur bis zu Salon und Café.') },
  { icon: Megaphone, t: L('Marketing a obsah', 'Marketing & content', 'Marketing & Inhalte'), d: L('Texty, příspěvky na sítě a reklamy připravíme — vy je schválíte, nic se nepublikuje samo.', 'We prepare copy, social posts and adverts — you approve them; nothing is published on its own.', 'Wir bereiten Texte, Beiträge und Anzeigen vor — Sie geben frei; nichts wird automatisch veröffentlicht.') },
  { icon: Video, t: L('Video promo', 'Video promos', 'Werbevideos'), d: L('Krátká videa na web, Instagram, TikTok a YouTube ve správných formátech.', 'Short videos for your site, Instagram, TikTok and YouTube in the right formats.', 'Kurze Videos für Website, Instagram, TikTok und YouTube in den richtigen Formaten.') },
  { icon: Bot, t: L('Zachycení poptávek a automatizace', 'Lead capture & automation', 'Anfrageerfassung & Automatisierung'), d: L('Chytré formuláře, rezervace a chat, které poptávku zachytí, roztřídí a pošlou vám.', 'Smart forms, bookings and chat that capture, sort and forward every enquiry to you.', 'Intelligente Formulare, Buchungen und Chat, die jede Anfrage erfassen, sortieren und weiterleiten.') },
];

const steps = [
  L('Spočítáte cenu v kalkulačce nebo nám napíšete', 'Price it in the calculator or send us a message', 'Preis im Kalkulator berechnen oder Nachricht senden'),
  L('Probereme cíle, obsah a termín', 'We agree goals, content and timeline', 'Wir klären Ziele, Inhalte und Zeitplan'),
  L('Navrhneme a postavíme — vy schvalujete', 'We design and build — you approve', 'Wir gestalten und bauen — Sie geben frei'),
  L('Spustíme a dál pomáháme s růstem', 'We launch and keep helping you grow', 'Wir starten und helfen beim Wachstum'),
];

const faqs = [
  { q: L('Kolik to bude stát?', 'How much will it cost?', 'Was kostet es?'), a: L('Hotový jednostránkový web stojí 6 900 Kč jednorázově (první rok hostingu a domény v ceně), nebo 990 Kč měsíčně bez platby předem. Projekty na míru začínají od 18 900 Kč a přesnou cenu uvidíte v kalkulačce.', 'A ready-built one-page site is 6,900 Kč one-off (first year of hosting and domain included), or 990 Kč monthly with nothing upfront. Custom projects start from 18,900 Kč — the calculator shows your exact price.', 'Eine fertige One-Page-Website kostet 6.900 Kč einmalig (erstes Jahr Hosting und Domain inklusive) oder 990 Kč monatlich ohne Anzahlung. Individuelle Projekte ab 18.900 Kč — der Kalkulator zeigt den genauen Preis.') },
  { q: L('Nemám čas se tím zabývat.', 'I don’t have time for this.', 'Ich habe keine Zeit dafür.'), a: L('Právě proto to děláme za vás. Od vás potřebujeme hlavně informace o firmě a schválení — zbytek zařídíme.', 'That’s exactly why we do it for you. We mainly need information about your business and your approval — we handle the rest.', 'Genau deshalb machen wir das für Sie. Wir brauchen vor allem Infos zu Ihrem Unternehmen und Ihre Freigabe — den Rest erledigen wir.') },
  { q: L('Nemám texty ani fotky.', 'I don’t have copy or photos.', 'Ich habe keine Texte oder Fotos.'), a: L('Texty vám pomůžeme napsat a fotky můžeme doplnit nebo vytvořit. Nemusíte mít nic připraveného.', 'We help write the copy and can source or create images. You don’t need anything ready.', 'Wir helfen beim Texten und können Bilder beschaffen oder erstellen. Sie müssen nichts vorbereiten.') },
  { q: L('Co když nebudu spokojený?', 'What if I’m not happy?', 'Was, wenn ich nicht zufrieden bin?'), a: L('Malé balíčky (6 900 Kč a 990 Kč/měsíc) mají 30denní garanci vrácení peněz. Na projekty z kalkulačky se vztahuje záruka funkčnosti.', 'Small packages (6,900 Kč and 990 Kč/month) have a 30-day money-back guarantee. Calculator projects come with a functionality warranty.', 'Kleine Pakete (6.900 Kč und 990 Kč/Monat) haben eine 30-Tage-Geld-zurück-Garantie. Kalkulator-Projekte haben eine Funktionsgarantie.') },
  { q: L('Zvládnete i e-shop nebo rezervace?', 'Can you do e-shops or bookings?', 'Können Sie Shops oder Buchungen?'), a: L('Ano. E-shop, rezervace, více jazyků i další moduly si vyberete v kalkulačce.', 'Yes. E-shop, bookings, multiple languages and other modules can all be chosen in the calculator.', 'Ja. Shop, Buchungen, mehrere Sprachen und weitere Module wählen Sie im Kalkulator.') },
  { q: L('Pracujete i mimo Česko?', 'Do you work outside Czechia?', 'Arbeiten Sie auch außerhalb Tschechiens?'), a: L('Ano, projekty dodáváme na dálku a weby stavíme česky, anglicky i německy.', 'Yes — we deliver remotely and build sites in Czech, English and German.', 'Ja — wir arbeiten aus der Ferne und bauen Websites auf Tschechisch, Englisch und Deutsch.') },
];

const BusinessLanding = () => {
  const { language } = useLanguage();
  const lang = (['cs', 'en', 'de'].includes(language) ? language : 'cs') as Lang;
  const lp = (p: string) => localizedPath(p, lang);

  const Ctas = ({ dark = false }: { dark?: boolean }) => (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold shadow-glow h-12 px-7">
        <Link to={lp('/calculator')}><Calculator className="mr-2 h-4 w-4" />{c.ctaCalc[lang]}</Link>
      </Button>
      <Button asChild size="lg" variant="outline" className={`h-12 px-7 ${dark ? 'bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' : ''}`}>
        <a href="#enquiry">{c.ctaTalk[lang]} <ArrowRight className="ml-2 h-4 w-4" /></a>
      </Button>
    </div>
  );

  const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle[lang]} description={c.seoDesc[lang]} pagePath="/business" />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden gradient-hero">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold text-xs uppercase tracking-wider">{c.eyebrow[lang]}</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mt-5 mb-6 leading-tight">{c.h1[lang]}</h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl">{c.intro[lang]}</p>
              <Ctas dark />
              <p className="mt-5 text-sm text-primary-foreground/60">{c.heroNote[lang]}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative">
              <img src={hero} alt={L('Majitelka firmy ukazuje svůj nový web na telefonu', 'Business owner showing her new website on a phone', 'Unternehmerin zeigt ihre neue Website am Handy')[lang]} width={1600} height={1200} className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]" />
              <div className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-6 sm:w-64 bg-card rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-border/50">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center"><Languages className="w-5 h-5 text-accent-foreground" /></div>
                <p className="text-sm font-medium text-foreground">{L('Weby v češtině, angličtině i němčině', 'Websites in Czech, English and German', 'Websites auf Tschechisch, Englisch und Deutsch')[lang]}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pains */}
        <section className="py-20 lg:py-28 container mx-auto px-4 lg:px-8">
          <motion.div {...fade} className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">{c.painsTitle[lang]}</h2>
            <p className="text-lg text-muted-foreground">{c.painsSub[lang]}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pains.map((p, i) => (
              <motion.div key={p.t.en} {...fade} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                <p.icon className="w-8 h-8 text-destructive mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{p.t[lang]}</h3>
                <p className="text-muted-foreground">{p.d[lang]}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Urgency */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <h2 className="text-2xl lg:text-4xl font-display font-bold text-primary-foreground mb-5">{c.urgencyTitle[lang]}</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">{c.urgencyText[lang]}</p>
            <div className="flex justify-center"><Ctas dark /></div>
          </div>
        </section>

        {/* Two paths */}
        <section className="py-20 lg:py-28 container mx-auto px-4 lg:px-8">
          <motion.h2 {...fade} className="text-3xl lg:text-5xl font-display font-bold text-foreground text-center mb-14">{c.pathsTitle[lang]}</motion.h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {paths.map(p => (
              <motion.div key={p.t.en} {...fade} className="bg-card rounded-3xl p-8 border border-border/50 shadow-card flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center"><p.icon className="w-6 h-6 text-accent-foreground" /></div>
                  <span className="text-accent font-semibold text-sm uppercase tracking-wider">{p.tag[lang]}</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-foreground mb-3">{p.t[lang]}</h3>
                <p className="text-muted-foreground mb-6">{p.d[lang]}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.pts.map(pt => <li key={pt.en} className="flex gap-3 text-foreground"><CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />{pt[lang]}</li>)}
                </ul>
                <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold w-full"><Link to={lp(p.to)}>{p.cta[lang]} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">{L('Nejsme plátci DPH — uvedené ceny jsou konečné.', 'We are not VAT registered — prices shown are final.', 'Wir sind nicht umsatzsteuerpflichtig — die Preise sind Endpreise.')[lang]}</p>
        </section>

        {/* Services */}
        <section className="py-20 lg:py-28 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.h2 {...fade} className="text-3xl lg:text-5xl font-display font-bold text-foreground text-center mb-14">{c.servicesTitle[lang]}</motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => (
                <motion.div key={s.t.en} {...fade} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-7 shadow-card border border-border/50 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-5"><s.icon className="w-6 h-6 text-accent-foreground" /></div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">{s.t[lang]}</h3>
                  <p className="text-muted-foreground">{s.d[lang]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 container mx-auto px-4 lg:px-8">
          <motion.h2 {...fade} className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center mb-12">{c.processTitle[lang]}</motion.h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {steps.map((s, i) => (
              <li key={s.en} className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                <span className="text-4xl font-display font-bold text-accent">{i + 1}</span>
                <p className="mt-3 font-medium text-foreground">{s[lang]}</p>
              </li>
            ))}
          </ol>
          <div className="flex justify-center mt-10"><Ctas /></div>
        </section>

        {/* Proof */}
        <section className="pt-20 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-3">{c.proofTitle[lang]}</h2>
            <p className="text-muted-foreground text-lg flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5 text-accent" />{c.proofSub[lang]}</p>
          </div>
          <ShowcaseCarousel />
          <CaseStudiesSection />
        </section>

        {/* FAQ */}
        <section className="py-20 lg:py-28 container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center mb-10">{c.faqTitle[lang]}</h2>
          <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border/50 px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q.en} value={`f${i}`}>
                <AccordionTrigger className="text-left font-display font-semibold">{f.q[lang]}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a[lang]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA + enquiry */}
        <section id="enquiry" className="py-20 lg:py-28 gradient-hero scroll-mt-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-primary-foreground text-center mb-4">{c.finalTitle[lang]}</h2>
            <p className="text-primary-foreground/80 text-center text-lg mb-8">{c.finalText[lang]}</p>
            <div className="flex justify-center mb-10">
              <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold shadow-glow h-12 px-8">
                <Link to={lp('/calculator')}><Calculator className="mr-2 h-4 w-4" />{c.ctaCalc[lang]}</Link>
              </Button>
            </div>
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-lg">
              <OfferEnquiryForm lang={lang} source="Business landing page (/business)" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessLanding;
