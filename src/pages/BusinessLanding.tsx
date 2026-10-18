import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Calculator, CheckCircle2, Globe, ShoppingCart, PenSquare, Search, Inbox, CalendarCheck, CreditCard,
  Languages, Newspaper, Lock, Cookie, MessageCircle, Workflow, Video, Megaphone, BarChart3, Puzzle, PlusCircle,
  SearchX, Smartphone, PhoneMissed, Wrench, Frown, Signpost, Copy, Check, Timer, ExternalLink, Sparkles,
  Compass, Ruler, Palette, Code2, Rocket, LineChart, Star, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedPath } from '@/lib/publicLanguage';
import { showcaseSites } from '@/data/showcaseSites';
import { FAST20_CODE, activateFast20, fast20RemainingMs, pickStore } from '@/lib/fast20Offer';
import hero from '@/assets/business/hero-business.jpg';
import ecommerce from '@/assets/business/ecommerce.jpg';
import processImg from '@/assets/business/process.jpg';
import leadsImg from '@/assets/business/leads.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;
const L = (cs: string, en: string, de: string): L3 => ({ cs, en, de });

/* ---------- copy ---------- */
const t = {
  seoTitle: L('Weby a e-shopy na míru, které přinášejí poptávky | FastMedia.Pro', 'Custom websites & e-shops that bring enquiries | FastMedia.Pro', 'Individuelle Websites & Shops, die Anfragen bringen | FastMedia.Pro'),
  seoDesc: L('Weby a e-shopy na míru od 18 900 Kč, hotové weby od 6 900 Kč. SEO, poptávky, automatizace, videa a obsah. Spočítejte cenu v AI kalkulačce.', 'Custom websites and e-shops from 18,900 Kč, ready-built sites from 6,900 Kč. SEO, lead capture, automation, video and content. Price it in the AI calculator.', 'Individuelle Websites und Shops ab 18.900 Kč, fertige Websites ab 6.900 Kč. SEO, Anfragen, Automatisierung, Video und Inhalte. Preis im KI-Kalkulator berechnen.'),
  eyebrow: L('Weby a e-shopy na míru', 'Custom websites & e-shops', 'Individuelle Websites & Shops'),
  h1a: L('Web, který nejen vypadá skvěle,', 'A website that doesn’t just look good —', 'Eine Website, die nicht nur gut aussieht —'),
  h1b: L('ale přináší poptávky a prodeje.', 'it brings in enquiries and sales.', 'sondern Anfragen und Umsatz bringt.'),
  heroSub: L('Navrhneme a postavíme web nebo e-shop kolem toho, jak vaši zákazníci skutečně hledají a rozhodují se — a propojíme ho s formuláři, rezervacemi a automatizacemi, aby žádná příležitost nezapadla.', 'We design and build your website or e-shop around how your customers really search and decide — then connect it to forms, bookings and automations so no opportunity slips away.', 'Wir gestalten und bauen Ihre Website oder Ihren Shop danach, wie Ihre Kunden wirklich suchen und entscheiden — verbunden mit Formularen, Buchungen und Automatisierungen, damit keine Chance verloren geht.'),
  ctaCalc: L('Spočítat cenu v AI kalkulačce', 'Price it in the AI calculator', 'Preis im KI-Kalkulator berechnen'),
  ctaWork: L('Prohlédnout naši práci', 'See our work', 'Unsere Arbeit ansehen'),
  ctaTalk: L('Domluvit nezávaznou konzultaci', 'Book a free consultation', 'Kostenlose Beratung vereinbaren'),
  ctaQuote: L('Získat nabídku na míru', 'Get a tailored quote', 'Individuelles Angebot erhalten'),
  ctaClaim: L('Uplatnit 20 % v kalkulačce', 'Claim 20% in the calculator', '20 % im Kalkulator sichern'),
  ctaCompare: L('Porovnat hotové balíčky', 'Compare ready-built packages', 'Fertige Pakete vergleichen'),
};

const trust = [
  L('Mobilní design od prvního pixelu', 'Mobile-first from the first pixel', 'Mobile-first ab dem ersten Pixel'),
  L('Česky, anglicky i německy', 'Czech, English and German', 'Tschechisch, Englisch und Deutsch'),
  L('30denní garance u malých balíčků', '30-day guarantee on small packages', '30-Tage-Garantie für kleine Pakete'),
  L('Vy schvalujete — nic se nepublikuje samo', 'You approve — nothing goes out on its own', 'Sie geben frei — nichts geht automatisch raus'),
];

const pains = [
  { icon: SearchX, t: L('Na Googlu nejste vidět', 'Invisible in search', 'Unsichtbar in der Suche'), d: L('Zákazník hledá „vaši službu + město“ a najde konkurenci. Ne proto, že je lepší — jen jeho web Google rozumí.', 'A customer searches “your service + town” and finds a competitor. Not because they’re better — Google just understands their site.', 'Kunden suchen „Ihre Leistung + Ort“ und finden die Konkurrenz. Nicht weil sie besser ist — Google versteht nur deren Website.') },
  { icon: Smartphone, t: L('Na mobilu to drhne', 'Clunky on mobile', 'Holprig am Handy'), d: L('Malé písmo, pomalé načítání, tlačítka mimo dosah palce. Většina návštěv je z telefonu — a odchází.', 'Tiny text, slow loading, buttons out of thumb’s reach. Most visits come from phones — and they leave.', 'Kleine Schrift, langsames Laden, Buttons außer Daumenreichweite. Die meisten Besuche kommen vom Handy — und gehen.') },
  { icon: PhoneMissed, t: L('Poptávky utíkají', 'Enquiries slip away', 'Anfragen gehen verloren'), d: L('Jste na zakázce, telefon nezvednete a e-mail zapadne. Zákazník mezitím napsal jinam.', 'You’re on a job, miss the call, the email gets buried. Meanwhile the customer has asked someone else.', 'Sie sind beim Kunden, verpassen den Anruf, die E-Mail geht unter. Inzwischen hat der Kunde woanders gefragt.') },
  { icon: Wrench, t: L('Změna textu = e-mail webaři', 'Every edit needs a developer', 'Jede Änderung braucht den Entwickler'), d: L('Nová cena nebo fotka čeká týdny, takže web stárne a přestává odpovídat realitě.', 'A new price or photo waits weeks, so the site ages and stops matching reality.', 'Ein neuer Preis oder ein Foto wartet Wochen — die Website veraltet.') },
  { icon: Frown, t: L('Slabý první dojem', 'A weak first impression', 'Schwacher erster Eindruck'), d: L('Zastaralý web říká „možná už nefungujeme“ — i když jste ve svém oboru nejlepší.', 'An outdated site says “maybe we’ve closed” — even if you’re the best in your field.', 'Eine veraltete Website sagt „vielleicht gibt es uns nicht mehr“ — selbst wenn Sie die Besten sind.') },
  { icon: Signpost, t: L('Chybí jasný další krok', 'No clear next step', 'Kein klarer nächster Schritt'), d: L('Návštěvník neví, jestli volat, psát nebo rezervovat — tak neudělá nic.', 'Visitors don’t know whether to call, write or book — so they do nothing.', 'Besucher wissen nicht, ob sie anrufen, schreiben oder buchen sollen — also tun sie nichts.') },
];

const benefits = [
  { img: hero, alt: L('Majitelka firmy s novým webem v telefonu', 'Business owner with her new website on a phone', 'Unternehmerin mit neuer Website am Handy'), k: L('Přesvědčí', 'Persuades', 'Überzeugt'), t: L('Za pár vteřin jasně řekne, proč právě vy', 'Says why you, within seconds', 'Sagt in Sekunden, warum Sie'), pts: [L('Jasné sdělení a nabídka nad ohybem', 'Clear message and offer above the fold', 'Klare Botschaft und Angebot sofort sichtbar'), L('Výzva k akci na každé obrazovce', 'A call to action on every screen', 'Handlungsaufforderung auf jedem Bildschirm'), L('Rychlé načítání na mobilu', 'Fast loading on mobile', 'Schnelles Laden am Handy')], mock: 'site' as const },
  { img: leadsImg, alt: L('Řemeslník kontroluje nové poptávky na tabletu', 'Tradesperson checking new enquiries on a tablet', 'Handwerker prüft neue Anfragen am Tablet'), k: L('Zachytí', 'Captures', 'Erfasst'), t: L('Každá poptávka dorazí na jedno místo', 'Every enquiry lands in one place', 'Jede Anfrage landet an einem Ort'), pts: [L('Chytré formuláře s potřebnými údaji', 'Smart forms that ask the right questions', 'Intelligente Formulare mit den richtigen Fragen'), L('Okamžité potvrzení zákazníkovi', 'Instant confirmation to the customer', 'Sofortige Bestätigung an den Kunden'), L('Napojení na CRM, kde je nastaveno', 'CRM hand-off where configured', 'CRM-Anbindung, wo eingerichtet')], mock: 'inbox' as const },
  { img: processImg, alt: L('Tým navrhuje web nad wireframy', 'Team designing a website over wireframes', 'Team gestaltet Website anhand von Wireframes'), k: L('Roste', 'Grows', 'Wächst'), t: L('Web, který můžete sami upravovat a rozvíjet', 'A site you can edit and grow yourself', 'Eine Website, die Sie selbst pflegen und erweitern'), pts: [L('Upravitelný obsah bez programátora', 'Editable content without a developer', 'Bearbeitbare Inhalte ohne Entwickler'), L('Blog a nové stránky kdykoli', 'Blog and new pages any time', 'Blog und neue Seiten jederzeit'), L('Moduly přidáte, až je budete potřebovat', 'Add modules when you need them', 'Module hinzufügen, wenn Sie sie brauchen')], mock: 'chart' as const },
];

type Cap = { icon: typeof Globe; t: L3; std: boolean };
const caps: Cap[] = [
  { icon: Smartphone, t: L('Responzivní mobilní design na míru', 'Custom responsive, mobile-first design', 'Individuelles responsives Mobile-first-Design'), std: true },
  { icon: Search, t: L('Základy SEO, sitemapa a strukturovaná data', 'SEO foundations, sitemap & structured data', 'SEO-Grundlagen, Sitemap & strukturierte Daten'), std: true },
  { icon: Inbox, t: L('Poptávkové a kontaktní formuláře', 'Lead capture & enquiry forms', 'Anfrage- und Kontaktformulare'), std: true },
  { icon: Lock, t: L('SSL certifikát', 'SSL certificate', 'SSL-Zertifikat'), std: true },
  { icon: Cookie, t: L('GDPR a cookie lišta', 'GDPR & cookie consent', 'DSGVO & Cookie-Einwilligung'), std: true },
  { icon: PenSquare, t: L('Upravitelný obsah (CMS)', 'Editable content (CMS)', 'Bearbeitbare Inhalte (CMS)'), std: true },
  { icon: ShoppingCart, t: L('E-shop a produktový katalog', 'E-shop & product catalogue', 'Onlineshop & Produktkatalog'), std: false },
  { icon: CreditCard, t: L('Online platby', 'Online payments', 'Online-Zahlungen'), std: false },
  { icon: CalendarCheck, t: L('Rezervace a objednávky termínů', 'Booking & appointment flows', 'Buchungen & Terminabläufe'), std: false },
  { icon: Languages, t: L('Vícejazyčný web (CZ / EN / DE)', 'Multilingual site (CZ / EN / DE)', 'Mehrsprachige Website (CZ / EN / DE)'), std: false },
  { icon: Newspaper, t: L('Blog a neomezené příspěvky', 'Blog with unlimited posts', 'Blog mit unbegrenzten Beiträgen'), std: false },
  { icon: MessageCircle, t: L('Živý chat nebo chatbot', 'Live chat or chatbot', 'Live-Chat oder Chatbot'), std: false },
  { icon: Workflow, t: L('Automatizace a napojení na CRM', 'Automations & CRM hand-off', 'Automatisierungen & CRM-Anbindung'), std: false },
  { icon: BarChart3, t: L('Analytika a reporty', 'Analytics & reporting', 'Analytik & Berichte'), std: false },
  { icon: Video, t: L('Video reklamy a promo', 'Video adverts & promos', 'Videoanzeigen & Promos'), std: false },
  { icon: Megaphone, t: L('Copywriting a obsah na sítě', 'Copywriting & social content', 'Texte & Social-Media-Inhalte'), std: false },
  { icon: Puzzle, t: L('Integrace a vlastní nástroje / kalkulačky', 'Integrations & custom tools / calculators', 'Integrationen & eigene Tools / Rechner'), std: false },
  { icon: PlusCircle, t: L('Správa projektů a admin nástroje', 'Admin & project management tools', 'Admin- & Projektmanagement-Tools'), std: false },
];

const steps = [
  { icon: Compass, t: L('Poznání', 'Discovery', 'Kennenlernen'), d: L('Cíle, zákazníci, konkurence.', 'Goals, customers, competitors.', 'Ziele, Kunden, Wettbewerb.') },
  { icon: Ruler, t: L('Rozsah a kalkulace', 'Scope & calculator', 'Umfang & Kalkulator'), d: L('Moduly a cena předem.', 'Modules and price up front.', 'Module und Preis vorab.') },
  { icon: Palette, t: L('Návrh a prototyp', 'Design & prototype', 'Design & Prototyp'), d: L('Uvidíte web dřív, než se staví.', 'See it before it’s built.', 'Sehen, bevor gebaut wird.') },
  { icon: Code2, t: L('Vývoj a obsah', 'Build & content', 'Umsetzung & Inhalte'), d: L('Texty, fotky, funkce.', 'Copy, images, features.', 'Texte, Bilder, Funktionen.') },
  { icon: Rocket, t: L('Testování a spuštění', 'Testing & launch', 'Test & Start'), d: L('Mobil, rychlost, formuláře.', 'Mobile, speed, forms.', 'Mobil, Tempo, Formulare.') },
  { icon: LineChart, t: L('Zlepšování a podpora', 'Improve & support', 'Verbessern & Support'), d: L('Úpravy podle dat.', 'Refine with real data.', 'Optimieren mit echten Daten.') },
];

const faqs = [
  { q: L('Kolik stojí web na míru?', 'How much does a custom website cost?', 'Was kostet eine individuelle Website?'), a: L('Projekty na míru začínají od 18 900 Kč. Přesnou cenu podle vybraných funkcí vám ukáže AI kalkulačka. Hotové weby začínají od 6 900 Kč jednorázově nebo 990 Kč měsíčně. Nejsme plátci DPH.', 'Custom projects start from 18,900 Kč. The AI calculator shows an exact price for the features you choose. Ready-built sites start from 6,900 Kč one-off or 990 Kč a month. We are not VAT registered.', 'Individuelle Projekte ab 18.900 Kč. Der KI-Kalkulator zeigt den genauen Preis für Ihre Funktionen. Fertige Websites ab 6.900 Kč einmalig oder 990 Kč monatlich. Wir sind nicht umsatzsteuerpflichtig.') },
  { q: L('Jak dlouho to trvá?', 'How long does it take?', 'Wie lange dauert es?'), a: L('Záleží na rozsahu a na tom, jak rychle dodáte podklady. Hotové weby jsou nejrychlejší; termín projektu na míru potvrdíme po upřesnění zadání.', 'It depends on scope and how quickly content arrives. Ready-built sites are fastest; we confirm a custom project timeline once scope is agreed.', 'Das hängt vom Umfang und von Ihren Inhalten ab. Fertige Websites sind am schnellsten; den Zeitplan für Individualprojekte bestätigen wir nach Klärung des Umfangs.') },
  { q: L('Nemám texty ani fotky.', 'I don’t have copy or photos.', 'Ich habe keine Texte oder Fotos.'), a: L('Pomůžeme s copywritingem a obrázky můžeme doplnit nebo vytvořit — podle rozsahu projektu.', 'We help with copywriting and can source or create images, depending on project scope.', 'Wir helfen beim Texten und können Bilder beschaffen oder erstellen — je nach Umfang.') },
  { q: L('Postavíte i e-shop?', 'Can you build an e-shop?', 'Bauen Sie auch Onlineshops?'), a: L('Ano — katalog, košík, platby a správu objednávek si vyberete jako moduly v kalkulačce.', 'Yes — catalogue, cart, payments and order management are modules you choose in the calculator.', 'Ja — Katalog, Warenkorb, Zahlungen und Bestellverwaltung wählen Sie als Module im Kalkulator.') },
  { q: L('Je v ceně SEO?', 'Is SEO included?', 'Ist SEO enthalten?'), a: L('Základy SEO (struktura, sitemapa, metadata, rychlost) jsou standard. Rozšířené SEO je volitelný modul. Pozice ve vyhledávání nikdo zaručit nemůže.', 'SEO foundations (structure, sitemap, metadata, speed) are standard. Advanced SEO is an optional module. Nobody can guarantee rankings.', 'SEO-Grundlagen (Struktur, Sitemap, Metadaten, Tempo) sind Standard. Erweitertes SEO ist ein optionales Modul. Rankings kann niemand garantieren.') },
  { q: L('Co podpora po spuštění?', 'What about support after launch?', 'Was ist mit Support nach dem Start?'), a: L('Hosting a údržba se platí zvlášť jako roční služba; úpravy a další rozvoj domluvíme podle potřeby.', 'Hosting and maintenance are a separate annual service; changes and further development are arranged as needed.', 'Hosting und Wartung sind ein separater Jahresservice; Änderungen und Weiterentwicklung nach Bedarf.') },
  { q: L('Pracujete i pro zahraniční firmy?', 'Do you work internationally?', 'Arbeiten Sie international?'), a: L('Ano, projekty dodáváme na dálku a weby stavíme česky, anglicky a německy.', 'Yes — we deliver remotely and build sites in Czech, English and German.', 'Ja — wir arbeiten aus der Ferne und bauen Websites auf Tschechisch, Englisch und Deutsch.') },
  { q: L('Co je volitelné?', 'What is optional?', 'Was ist optional?'), a: L('Vše označené jako „volitelné“ výše — např. e-shop, platby, rezervace, chat, automatizace, vícejazyčnost, videa — se přidává podle rozsahu a promítne se do ceny v kalkulačce.', 'Everything marked “optional” above — e.g. e-shop, payments, bookings, chat, automations, extra languages, video — is added per scope and reflected in the calculator price.', 'Alles oben als „optional“ Markierte — z. B. Shop, Zahlungen, Buchungen, Chat, Automatisierung, Sprachen, Video — wird je nach Umfang ergänzt und im Kalkulatorpreis berücksichtigt.') },
  { q: L('Jak funguje sleva 20 % a kdy končí?', 'How does the 20% discount work and when does it end?', 'Wie funktioniert der 20-%-Rabatt und wann endet er?'), a: L('Odpočet začíná, když nabídku na této stránce poprvé uvidíte, a trvá 24 hodin ve vašem prohlížeči. Kód FAST20 zadejte do pole pro slevový kód v kalkulačce před platbou. Sleva 20 % se vztahuje jen na jednorázovou tvorbu webu (základ, moduly, práce) — ne na hosting, předplatné, reklamní rozpočet ani jiné poplatky. Kód ověřuje náš server.', 'The countdown starts when you first see the offer on this page and lasts 24 hours in your browser. Enter FAST20 in the calculator’s discount code field before paying. The 20% applies only to one-time website build work (base, modules, labour) — not hosting, subscriptions, ad spend or other fees. The code is checked by our server.', 'Der Countdown startet, wenn Sie das Angebot auf dieser Seite zum ersten Mal sehen, und läuft 24 Stunden in Ihrem Browser. Geben Sie FAST20 vor der Zahlung im Gutscheinfeld des Kalkulators ein. Die 20 % gelten nur für die einmalige Website-Erstellung (Basis, Module, Arbeit) — nicht für Hosting, Abos, Werbebudget oder andere Gebühren. Der Code wird von unserem Server geprüft.') },
];

/* ---------- small building blocks ---------- */
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</span>
);
const H2 = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <h2 className={`font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.08] ${light ? 'text-primary-foreground' : 'text-foreground'}`}>{children}</h2>
);

const SiteMock = () => (
  <div className="rounded-2xl bg-card border border-border/60 shadow-lg overflow-hidden w-full">
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-muted/50">
      <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" /><span className="h-2.5 w-2.5 rounded-full bg-accent/70" /><span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
      <span className="ml-3 h-4 flex-1 rounded bg-background/80" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-24 rounded-xl gradient-hero" />
      <div className="h-3 w-2/3 rounded bg-foreground/80" /><div className="h-2 w-5/6 rounded bg-muted-foreground/40" />
      <div className="flex gap-2"><span className="h-7 w-28 rounded-lg gradient-accent" /><span className="h-7 w-20 rounded-lg border border-border" /></div>
      <div className="grid grid-cols-3 gap-2 pt-1">{[0, 1, 2].map(i => <div key={i} className="h-12 rounded-lg bg-muted" />)}</div>
    </div>
  </div>
);
const InboxMock = ({ lang }: { lang: Lang }) => (
  <div className="rounded-2xl bg-card border border-border/60 shadow-lg p-4 w-full space-y-2">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{L('Ukázka — nové poptávky', 'Sample — new enquiries', 'Beispiel — neue Anfragen')[lang]}</p>
    {[L('Web formulář', 'Website form', 'Website-Formular'), L('Rezervace', 'Booking', 'Buchung'), L('Chat', 'Chat', 'Chat')].map((s, i) => (
      <div key={s.en} className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5">
        <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${i === 0 ? 'gradient-accent' : 'bg-primary/15'}`}><Inbox className={`h-4 w-4 ${i === 0 ? 'text-accent-foreground' : 'text-primary'}`} /></span>
        <div className="flex-1 space-y-1"><div className="h-2.5 w-1/2 rounded bg-foreground/70" /><div className="h-2 w-3/4 rounded bg-muted-foreground/40" /></div>
        <span className="text-[10px] font-semibold text-accent">{s[lang]}</span>
      </div>
    ))}
  </div>
);
const ChartMock = ({ lang }: { lang: Lang }) => (
  <div className="rounded-2xl bg-card border border-border/60 shadow-lg p-4 w-full">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{L('Ilustrační přehled', 'Illustrative overview', 'Illustrative Übersicht')[lang]}</p>
    <div className="flex items-end gap-2 h-24">{[30, 45, 38, 60, 52, 72, 80].map((h, i) => <div key={i} className="flex-1 rounded-t-md gradient-accent opacity-80" style={{ height: `${h}%` }} />)}</div>
  </div>
);

/* ---------- 24h offer ---------- */
function useFast20() {
  const [activatedAt, setActivatedAt] = useState<number | null>(null);
  const [storageKind, setStorageKind] = useState<'local' | 'session' | 'memory'>('local');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const { store, kind } = pickStore();
    setStorageKind(kind);
    setActivatedAt(activateFast20(store));
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const remaining = activatedAt == null ? null : fast20RemainingMs(activatedAt, now);
  return { remaining, storageKind, ready: activatedAt != null };
}

const OfferBlock = ({ lang, lp }: { lang: Lang; lp: (p: string) => string }) => {
  const { remaining, storageKind, ready } = useFast20();
  const [copied, setCopied] = useState(false);
  const active = ready && (remaining ?? 0) > 0;
  const s = Math.floor((remaining ?? 0) / 1000);
  const parts = [
    { v: Math.floor(s / 3600), l: L('hodin', 'hours', 'Stunden') },
    { v: Math.floor((s % 3600) / 60), l: L('minut', 'minutes', 'Minuten') },
    { v: s % 60, l: L('sekund', 'seconds', 'Sekunden') },
  ];
  const copy = async () => {
    try { await navigator.clipboard.writeText(FAST20_CODE); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked: code stays visible */ }
  };

  return (
    <section id="offer" className="relative py-20 lg:py-28 overflow-hidden gradient-hero scroll-mt-24">
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[48rem] rounded-full bg-accent/25 blur-3xl" />
      <div className="relative container mx-auto px-4 lg:px-8 max-w-5xl text-center">
        <Eyebrow><Timer className="h-3.5 w-3.5" />{L('Skutečná 24hodinová nabídka', 'Genuine 24-hour offer', 'Echtes 24-Stunden-Angebot')[lang]}</Eyebrow>
        <div className="mt-6"><H2 light>{active ? L('20 % sleva na tvorbu webu na míru', '20% off custom website build work', '20 % Rabatt auf die individuelle Website-Erstellung')[lang] : L('Tato nabídka vypršela', 'This offer has expired', 'Dieses Angebot ist abgelaufen')[lang]}</H2></div>
        <p className="mt-5 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          {active
            ? L('Odpočet běží 24 hodin od chvíle, kdy jste nabídku poprvé uviděli v tomto prohlížeči. Obnovení stránky ho nevynuluje. Po vypršení sleva skončí.', 'The countdown runs for 24 hours from when you first saw this offer in this browser. Refreshing won’t reset it. When it reaches zero, the discount ends.', 'Der Countdown läuft 24 Stunden ab dem ersten Anzeigen in diesem Browser. Neuladen setzt ihn nicht zurück. Bei null endet der Rabatt.')[lang]
            : L('24hodinové okno pro kód FAST20 v tomto prohlížeči skončilo. Cenu projektu si stále můžete spočítat v kalkulačce.', 'The 24-hour window for FAST20 in this browser has ended. You can still price your project in the calculator.', 'Das 24-Stunden-Fenster für FAST20 in diesem Browser ist abgelaufen. Sie können Ihr Projekt weiterhin im Kalkulator berechnen.')[lang]}
        </p>

        {ready && active && (
          <>
            <div role="timer" aria-live="off" aria-label={`${parts[0].v}h ${parts[1].v}m ${parts[2].v}s`} className="mt-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto">
              {parts.map(p => (
                <div key={p.l.en} className="rounded-2xl sm:rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur py-5 sm:py-8">
                  <span className="block font-display font-bold tabular-nums text-4xl sm:text-6xl lg:text-7xl text-primary-foreground">{String(p.v).padStart(2, '0')}</span>
                  <span className="mt-1 block text-xs sm:text-sm uppercase tracking-widest text-primary-foreground/60">{p.l[lang]}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-xl mx-auto">
              <button type="button" onClick={copy} className="flex-1 inline-flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-accent bg-background/95 px-5 py-4 font-mono text-2xl font-bold tracking-[0.2em] text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {FAST20_CODE}
                <span className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold tracking-normal">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? L('Zkopírováno', 'Copied', 'Kopiert')[lang] : L('Kopírovat kód', 'Copy code', 'Code kopieren')[lang]}
                </span>
              </button>
              <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold shadow-glow h-auto py-4 px-6">
                <Link to={`${lp('/calculator')}?coupon=${FAST20_CODE}`}>{t.ctaClaim[lang]} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <ol className="mt-8 grid sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto text-sm text-primary-foreground/80">
              {[L('Projděte AI kalkulačku a vyberte funkce.', 'Complete the AI calculator and pick your features.', 'Durchlaufen Sie den KI-Kalkulator und wählen Sie Funktionen.'), L('V souhrnu vložte FAST20 do pole „Slevový kód“.', 'In the summary, enter FAST20 in the “Discount code” field.', 'Geben Sie in der Übersicht FAST20 ins Feld „Gutscheincode“ ein.'), L('Server kód ověří a cena ukáže slevu i konečnou částku.', 'Our server checks the code; the breakdown shows the discount and final total.', 'Unser Server prüft den Code; die Übersicht zeigt Rabatt und Endbetrag.')].map((x, i) => (
                <li key={x.en} className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4"><span className="font-display font-bold text-accent mr-2">{i + 1}.</span>{x[lang]}</li>
              ))}
            </ol>
          </>
        )}
        {ready && !active && (
          <div className="mt-8 flex justify-center"><Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold"><Link to={lp('/calculator')}>{t.ctaCalc[lang]}</Link></Button></div>
        )}
        <p className="mt-8 text-xs text-primary-foreground/60 max-w-2xl mx-auto">
          {L('Sleva platí jen na jednorázovou tvorbu webu (základ, moduly, práce), ne na hosting, předplatné, reklamní rozpočet ani jiné poplatky. Nelze kombinovat s jinými kódy.', 'Applies only to one-time website build work (base, modules, labour) — not hosting, subscriptions, ad spend or other fees. One code per order.', 'Gilt nur für die einmalige Website-Erstellung (Basis, Module, Arbeit) — nicht für Hosting, Abos, Werbebudget oder andere Gebühren. Ein Code pro Bestellung.')[lang]}
          {storageKind !== 'local' && ' ' + L('Váš prohlížeč blokuje trvalé úložiště, takže odpočet platí jen pro tuto relaci.', 'Your browser blocks persistent storage, so the countdown only lasts for this session.', 'Ihr Browser blockiert dauerhaften Speicher; der Countdown gilt nur für diese Sitzung.')[lang]}
        </p>
      </div>
    </section>
  );
};

/* ---------- page ---------- */
const BusinessLanding = () => {
  const { language } = useLanguage();
  const lang = (['cs', 'en', 'de'].includes(language) ? language : 'cs') as Lang;
  const lp = (p: string) => localizedPath(p, lang);
  const reduce = useReducedMotion();
  const fade = reduce ? {} : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6 } };

  const Primary = ({ label = t.ctaCalc[lang] }: { label?: string }) => (
    <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold shadow-glow h-12 px-7">
      <Link to={lp('/calculator')}><Calculator className="mr-2 h-4 w-4" />{label}</Link>
    </Button>
  );
  const Secondary = ({ to, label, dark = false }: { to: string; label: string; dark?: boolean }) => (
    <Button asChild size="lg" variant="outline" className={`h-12 px-7 ${dark ? 'bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' : ''}`}>
      {to.startsWith('#') ? <a href={to}>{label} <ArrowRight className="ml-2 h-4 w-4" /></a> : <Link to={lp(to)}>{label} <ArrowRight className="ml-2 h-4 w-4" /></Link>}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead title={t.seoTitle[lang]} description={t.seoDesc[lang]} pagePath="/business" />
      <Navbar />
      <main>
        {/* 1 HERO */}
        <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 gradient-hero overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(hsl(var(--primary-foreground))_1px,transparent_1px)] [background-size:22px_22px]" />
          <div aria-hidden className="absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-3xl" />
          <div className="relative container mx-auto px-4 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
            <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Eyebrow><Sparkles className="h-3.5 w-3.5" />{t.eyebrow[lang]}</Eyebrow>
              <h1 className="mt-6 font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-[4rem] leading-[1.04] text-primary-foreground">
                {t.h1a[lang]} <span className="text-accent">{t.h1b[lang]}</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl">{t.heroSub[lang]}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3"><Primary /><Secondary to="/case-studies" label={t.ctaWork[lang]} dark /></div>
              <ul className="mt-9 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {trust.map(x => <li key={x.en} className="flex items-center gap-2 text-sm text-primary-foreground/80"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" />{x[lang]}</li>)}
              </ul>
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative pb-10 sm:pb-0">
              <img src={hero} alt={benefits[0].alt[lang]} width={1600} height={1200} className="rounded-[2rem] shadow-lg w-full object-cover aspect-[4/3] ring-1 ring-primary-foreground/10" />
              <div className="absolute -bottom-2 sm:-bottom-8 -left-2 sm:-left-8 w-56 sm:w-64"><SiteMock /></div>
              <div className="hidden sm:flex absolute -top-6 right-6 items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-lg border border-border/60">
                <span className="h-9 w-9 rounded-xl gradient-accent flex items-center justify-center"><Inbox className="h-4 w-4 text-accent-foreground" /></span>
                <span className="text-sm font-semibold text-foreground">{L('Nová poptávka', 'New enquiry', 'Neue Anfrage')[lang]}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2 PAINS */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="max-w-3xl">
              <Eyebrow>{L('Upřímně', 'Let’s be honest', 'Ehrlich gesagt')[lang]}</Eyebrow>
              <div className="mt-5"><H2>{L('Váš web vám možná tiše bere zakázky.', 'Your website may be quietly costing you work.', 'Ihre Website kostet Sie vielleicht still Aufträge.')[lang]}</H2></div>
              <p className="mt-5 text-lg text-muted-foreground">{L('Nejde o to, jestli je hezký. Jde o to, co se stane v prvních vteřinách, kdy ho zákazník otevře na telefonu.', 'It isn’t about whether it looks nice. It’s what happens in the first seconds a customer opens it on their phone.', 'Es geht nicht darum, ob sie hübsch ist — sondern was in den ersten Sekunden am Handy passiert.')[lang]}</p>
            </motion.div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pains.map((p, i) => (
                <motion.article key={p.t.en} {...fade} className={`group relative rounded-3xl p-7 border transition-shadow hover:shadow-lg ${i % 3 === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border/60'}`}>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${i % 3 === 1 ? 'bg-primary-foreground/10' : 'bg-destructive/10'}`}><p.icon className={`h-6 w-6 ${i % 3 === 1 ? 'text-accent' : 'text-destructive'}`} /></span>
                  <h3 className="mt-5 font-display font-bold text-xl">{p.t[lang]}</h3>
                  <p className={`mt-2 ${i % 3 === 1 ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{p.d[lang]}</p>
                </motion.article>
              ))}
            </div>
            <motion.div {...fade} className="mt-12 rounded-3xl border border-accent/30 bg-accent/5 p-7 lg:p-9 flex flex-col lg:flex-row lg:items-center gap-6">
              <p className="flex-1 text-lg text-foreground"><strong className="font-display">{L('Každý týden čekání je týden, kdy zákazníci volají jinam.', 'Every week you wait is a week customers call someone else.', 'Jede Woche Warten ist eine Woche, in der Kunden woanders anrufen.')[lang]}</strong> {L('Nesvítíme falešnými čísly — výsledky se liší podle oboru a nabídky. Ale web, který nejde najít, nikdy nic nepřinese.', 'We won’t flash fake numbers — results vary by industry and offer. But a site nobody finds will never bring anything.', 'Keine Fantasiezahlen — Ergebnisse variieren. Aber eine Website, die niemand findet, bringt nie etwas.')[lang]}</p>
              <Primary label={t.ctaQuote[lang]} />
            </motion.div>
          </div>
        </section>

        {/* 3 BENEFITS alternating */}
        <section className="py-24 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="text-center max-w-3xl mx-auto"><H2>{L('Váš web by měl makat stejně jako vy.', 'Your website should work as hard as you do.', 'Ihre Website sollte so hart arbeiten wie Sie.')[lang]}</H2></motion.div>
            <div className="mt-20 space-y-24 lg:space-y-32">
              {benefits.map((b, i) => (
                <motion.div key={b.t.en} {...fade} className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  <div className="relative">
                    <img src={b.img} alt={b.alt[lang]} loading="lazy" width={1280} height={960} className="rounded-[2rem] shadow-lg w-full object-cover aspect-[4/3]" />
                    <div className={`absolute -bottom-8 w-56 sm:w-72 ${i % 2 ? '-left-2 sm:-left-10' : '-right-2 sm:-right-10'}`}>
                      {b.mock === 'site' ? <SiteMock /> : b.mock === 'inbox' ? <InboxMock lang={lang} /> : <ChartMock lang={lang} />}
                    </div>
                  </div>
                  <div className="pt-6 lg:pt-0">
                    <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">0{i + 1} · {b.k[lang]}</span>
                    <h3 className="mt-3 font-display font-bold text-3xl lg:text-4xl text-foreground leading-tight">{b.t[lang]}</h3>
                    <ul className="mt-7 space-y-4">
                      {b.pts.map(p => <li key={p.en} className="flex gap-3 text-lg text-foreground"><CheckCircle2 className="h-6 w-6 text-accent shrink-0" />{p[lang]}</li>)}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 CAPABILITIES */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-end">
              <div><Eyebrow>{L('Co umíme', 'Capabilities', 'Leistungen')[lang]}</Eyebrow><div className="mt-5"><H2>{L('Vše pro web, který prodává — od jednoho týmu.', 'Everything a selling website needs — from one team.', 'Alles für eine verkaufende Website — aus einer Hand.')[lang]}</H2></div></div>
              <div className="flex flex-wrap gap-3 lg:justify-end text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 text-accent px-4 py-2 font-semibold"><CheckCircle2 className="h-4 w-4" />{L('Standard v každém webu na míru', 'Standard in every custom site', 'Standard in jeder Individual-Website')[lang]}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted text-muted-foreground px-4 py-2 font-semibold"><PlusCircle className="h-4 w-4" />{L('Volitelné / dle rozsahu', 'Optional / subject to scope', 'Optional / je nach Umfang')[lang]}</span>
              </div>
            </motion.div>
            <ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {caps.map(c => (
                <li key={c.t.en} className={`flex items-center gap-4 rounded-2xl p-5 border ${c.std ? 'bg-card border-accent/30' : 'bg-card/60 border-border/60'}`}>
                  <span className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${c.std ? 'gradient-accent' : 'bg-muted'}`}><c.icon className={`h-5 w-5 ${c.std ? 'text-accent-foreground' : 'text-foreground'}`} /></span>
                  <span className="flex-1 font-medium text-foreground">{c.t[lang]}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 ${c.std ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>{c.std ? L('Standard', 'Standard', 'Standard')[lang] : L('Volitelné', 'Optional', 'Optional')[lang]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">{L('Integrace (např. CRM, platby, chat) fungují po nastavení pro váš projekt a mohou vyžadovat účet u třetí strany.', 'Integrations (e.g. CRM, payments, chat) work once configured for your project and may need a third-party account.', 'Integrationen (z. B. CRM, Zahlungen, Chat) funktionieren nach Einrichtung für Ihr Projekt und können ein Drittanbieter-Konto erfordern.')[lang]}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3"><Primary label={L('Vybrat funkce a zjistit cenu', 'Pick features and see your price', 'Funktionen wählen und Preis sehen')[lang]} /></div>
          </div>
        </section>

        {/* 5 ECOMMERCE */}
        <section className="relative py-24 lg:py-32 bg-primary text-primary-foreground overflow-hidden">
          <div aria-hidden className="absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
          <div className="relative container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fade}>
              <Eyebrow><ShoppingCart className="h-3.5 w-3.5" />E-commerce</Eyebrow>
              <div className="mt-5"><H2 light>{L('E-shop, ve kterém se nakupuje snadno.', 'An e-shop that’s easy to buy from.', 'Ein Shop, in dem Kaufen leichtfällt.')[lang]}</H2></div>
              <p className="mt-5 text-lg text-primary-foreground/75">{L('Přehledný katalog, rychlý košík a pokladna bez zbytečných kroků — na mobilu i počítači. Vy přitom spravujete produkty, objednávky a sklad z jednoho místa.', 'A clear catalogue, a quick cart and a checkout without needless steps — on mobile and desktop. You manage products, orders and stock from one place.', 'Klarer Katalog, schneller Warenkorb und ein Checkout ohne unnötige Schritte — mobil und am Desktop. Produkte, Bestellungen und Bestand verwalten Sie an einem Ort.')[lang]}</p>
              <ul className="mt-8 grid sm:grid-cols-2 gap-4">
                {[[Package, L('Produkty, varianty, kategorie', 'Products, variants, categories', 'Produkte, Varianten, Kategorien')], [CreditCard, L('Online platby (volitelné)', 'Online payments (optional)', 'Online-Zahlungen (optional)')], [Search, L('Produktové stránky pro SEO', 'SEO-ready product pages', 'SEO-fähige Produktseiten')], [Star, L('Akce, kupóny a doporučení', 'Promotions, coupons, cross-sells', 'Aktionen, Gutscheine, Empfehlungen')]].map(([Icon, x]) => {
                  const I = Icon as typeof Package; const lbl = x as L3;
                  return <li key={lbl.en} className="flex items-center gap-3 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-4"><I className="h-5 w-5 text-accent shrink-0" /><span>{lbl[lang]}</span></li>;
                })}
              </ul>
              <div className="mt-9 flex flex-col sm:flex-row gap-3"><Primary label={L('Naplánovat e-shop', 'Plan your e-shop', 'Shop planen')[lang]} /><Secondary to="/demo/eshop" label={L('Vyzkoušet demo e-shop', 'Try the demo e-shop', 'Demo-Shop testen')[lang]} dark /></div>
            </motion.div>
            <motion.div {...fade}><img src={ecommerce} alt={L('E-shop zobrazený na notebooku a telefonu', 'Online store shown on a laptop and phone', 'Onlineshop auf Laptop und Handy')[lang]} loading="lazy" width={1280} height={960} className="rounded-[2rem] w-full object-cover aspect-[4/3] shadow-lg ring-1 ring-primary-foreground/10" /></motion.div>
          </div>
        </section>

        {/* 6 LEADS & AUTOMATION */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="text-center max-w-3xl mx-auto">
              <Eyebrow><Workflow className="h-3.5 w-3.5" />{L('Poptávky a automatizace', 'Lead generation & automation', 'Leads & Automatisierung')[lang]}</Eyebrow>
              <div className="mt-5"><H2>{L('Z návštěvy dohledatelná poptávka.', 'Turn visits into trackable enquiries.', 'Aus Besuchen werden nachverfolgbare Anfragen.')[lang]}</H2></div>
              <p className="mt-5 text-lg text-muted-foreground">{L('Každá poptávka má zdroj, stav a další krok. Vidíte, co funguje — a nic nezapadne v telefonu.', 'Every enquiry gets a source, a status and a next step. You see what works — and nothing gets lost in your phone.', 'Jede Anfrage hat Quelle, Status und nächsten Schritt. Sie sehen, was funktioniert — und nichts geht im Handy verloren.')[lang]}</p>
            </motion.div>
            <motion.ol {...fade} className="mt-16 grid md:grid-cols-4 gap-4 relative">
              {[[Globe, L('Návštěvník', 'Visitor', 'Besucher'), L('Najde vás přes Google, reklamu nebo sítě.', 'Finds you via search, ads or social.', 'Findet Sie über Suche, Anzeigen oder Social.')], [Inbox, L('Formulář / rezervace', 'Form / booking', 'Formular / Buchung'), L('Chytrý formulář posbírá vše potřebné.', 'A smart form collects what you need.', 'Ein smartes Formular sammelt alles Nötige.')], [Workflow, L('Automatizace', 'Automation', 'Automatisierung'), L('Potvrzení zákazníkovi, upozornění vám.', 'Confirmation to them, alert to you.', 'Bestätigung an Kunden, Hinweis an Sie.')], [BarChart3, L('CRM a přehled', 'CRM & reporting', 'CRM & Berichte'), L('Stav a zdroj každé poptávky (kde je nastaveno).', 'Status and source of every lead (where configured).', 'Status und Quelle jeder Anfrage (wo eingerichtet).')]].map(([Icon, title, desc], i) => {
                const I = Icon as typeof Globe; const ti = title as L3; const de = desc as L3;
                return (
                  <li key={ti.en} className="relative rounded-3xl bg-card border border-border/60 p-6 shadow-card">
                    <span className="absolute -top-3 left-6 rounded-full bg-accent text-accent-foreground text-xs font-bold px-2.5 py-0.5">{i + 1}</span>
                    <I className="h-7 w-7 text-primary" />
                    <h3 className="mt-4 font-display font-bold text-lg text-foreground">{ti[lang]}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{de[lang]}</p>
                  </li>
                );
              })}
            </motion.ol>
            <motion.div {...fade} className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
              <img src={leadsImg} alt={benefits[1].alt[lang]} loading="lazy" width={1280} height={960} className="rounded-[2rem] w-full object-cover aspect-[16/11] shadow-lg" />
              <div className="space-y-4">
                <InboxMock lang={lang} />
                <div className="flex flex-col sm:flex-row gap-3 pt-4"><Primary label={L('Přidat zachycení poptávek', 'Add lead capture to my site', 'Anfrage-Erfassung hinzufügen')[lang]} /></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 7 INTERNATIONAL */}
        <section className="py-24 lg:py-28 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <motion.div {...fade}>
              <Eyebrow><Languages className="h-3.5 w-3.5" />{L('Mezinárodně', 'International', 'International')[lang]}</Eyebrow>
              <div className="mt-5"><H2>{L('Mluvte jazykem svých zákazníků.', 'Speak your customers’ language.', 'Sprechen Sie die Sprache Ihrer Kunden.')[lang]}</H2></div>
              <p className="mt-5 text-lg text-muted-foreground">{L('Stavíme weby v češtině, angličtině a němčině — s přirozenými texty, ne strojovým překladem, a s vlastními adresami pro každý jazyk, aby vás našli i ve vyhledávání v zahraničí.', 'We build sites in Czech, English and German — with natural copy, not machine translation, and separate addresses per language so you can be found in search abroad too.', 'Wir bauen Websites auf Tschechisch, Englisch und Deutsch — mit natürlichen Texten statt Maschinenübersetzung und eigenen Adressen pro Sprache, damit Sie auch im Ausland gefunden werden.')[lang]}</p>
            </motion.div>
            <motion.div {...fade} className="grid sm:grid-cols-3 gap-4">
              {[['CZ', 'Postavíme web, který přivádí poptávky.'], ['EN', 'We build websites that bring in enquiries.'], ['DE', 'Wir bauen Websites, die Anfragen bringen.']].map(([code, line]) => (
                <div key={code} className="rounded-3xl bg-card border border-border/60 p-6 shadow-card" lang={code === 'CZ' ? 'cs' : code.toLowerCase()}>
                  <span className="font-display text-3xl font-bold text-accent">{code}</span>
                  <p className="mt-4 text-foreground font-medium">“{line}”</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 8 PROCESS */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="grid lg:grid-cols-2 gap-12 items-center">
              <div><Eyebrow>{L('Proces', 'Process', 'Ablauf')[lang]}</Eyebrow><div className="mt-5"><H2>{L('Jasný postup. Žádná překvapení.', 'A clear process. No surprises.', 'Klarer Ablauf. Keine Überraschungen.')[lang]}</H2></div><p className="mt-5 text-lg text-muted-foreground">{L('Cenu znáte předem a v každém kroku schvalujete vy.', 'You know the price up front and you approve every step.', 'Sie kennen den Preis vorab und geben jeden Schritt frei.')[lang]}</p></div>
              <img src={processImg} alt={benefits[2].alt[lang]} loading="lazy" width={1280} height={960} className="rounded-[2rem] w-full object-cover aspect-[16/10] shadow-lg" />
            </motion.div>
            <ol className="mt-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
              <div aria-hidden className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-px bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0" />
              {steps.map((s, i) => (
                <motion.li key={s.t.en} {...fade} className="relative text-center">
                  <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-glow"><s.icon className="h-6 w-6 text-accent-foreground" /></span>
                  <p className="mt-4 text-xs font-bold text-accent">0{i + 1}</p>
                  <h3 className="font-display font-bold text-foreground">{s.t[lang]}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d[lang]}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* PROOF */}
        <section className="py-24 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div {...fade} className="max-w-3xl">
              <Eyebrow>{L('Skutečné projekty', 'Real projects', 'Echte Projekte')[lang]}</Eyebrow>
              <div className="mt-5"><H2 light>{L('Nepředstíráme. Proklikejte si to.', 'No pretending. Click through them yourself.', 'Kein Schein. Klicken Sie selbst durch.')[lang]}</H2></div>
              <p className="mt-5 text-lg text-primary-foreground/75">{L('Žádná vymyšlená loga ani reference — jen živé weby, které jsme postavili.', 'No invented logos or testimonials — just live sites we have built.', 'Keine erfundenen Logos oder Referenzen — nur echte Websites, die wir gebaut haben.')[lang]}</p>
            </motion.div>
            <ul className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseSites.slice(0, 6).map(s => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="group block rounded-3xl overflow-hidden bg-primary-foreground/5 border border-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <img src={s.image} alt={s.name} loading="lazy" className="w-full aspect-[16/10] object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <span className="flex items-center justify-between p-4 font-semibold">{s.name}<ExternalLink className="h-4 w-4 text-accent" /></span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col sm:flex-row gap-3"><Primary label={L('Chci podobný web', 'I want a site like these', 'Ich will so eine Website')[lang]} /><Secondary to="/case-studies" label={L('Případové studie', 'Read case studies', 'Fallstudien lesen')[lang]} dark /></div>
          </div>
        </section>
        <CaseStudiesSection />

        {/* 9 CHOOSE ROUTE */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <motion.div {...fade} className="text-center"><Eyebrow>{L('Vyberte si cestu', 'Choose your route', 'Wählen Sie Ihren Weg')[lang]}</Eyebrow><div className="mt-5"><H2>{L('Na míru, nebo hotový?', 'Bespoke or ready-built?', 'Individuell oder fertig?')[lang]}</H2></div></motion.div>
            <div className="mt-14 overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-card">
              <table className="w-full min-w-[560px] text-left">
                <caption className="sr-only">{L('Srovnání webu na míru a hotového webu', 'Bespoke vs ready-built comparison', 'Vergleich individuell vs. fertig')[lang]}</caption>
                <thead>
                  <tr className="border-b border-border/60">
                    <th scope="col" className="p-5 text-sm text-muted-foreground font-medium w-1/3" />
                    <th scope="col" className="p-5 bg-primary text-primary-foreground rounded-tl-none"><span className="text-xs uppercase tracking-wider text-accent font-bold">{L('Doporučujeme', 'Recommended', 'Empfohlen')[lang]}</span><span className="block font-display text-xl font-bold">{L('Web / e-shop na míru', 'Bespoke website / e-shop', 'Individuelle Website / Shop')[lang]}</span></th>
                    <th scope="col" className="p-5"><span className="block font-display text-xl font-bold text-foreground">{L('Hotový web', 'Ready-built website', 'Fertige Website')[lang]}</span></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    [L('Cena', 'Price', 'Preis'), L('od 18 900 Kč — přesně v kalkulačce', 'from 18,900 Kč — exact in the calculator', 'ab 18.900 Kč — genau im Kalkulator'), L('od 6 900 Kč jednorázově nebo 990 Kč/měs.', 'from 6,900 Kč one-off or 990 Kč/month', 'ab 6.900 Kč einmalig oder 990 Kč/Monat')],
                    [L('Design', 'Design', 'Design'), L('Navržený pro vaši značku', 'Designed around your brand', 'Für Ihre Marke gestaltet'), L('Oborová šablona upravená na vás', 'Industry template adapted to you', 'Branchenvorlage, angepasst')],
                    [L('Funkce', 'Features', 'Funktionen'), L('E-shop, rezervace, platby, automatizace dle výběru', 'E-shop, bookings, payments, automation as chosen', 'Shop, Buchungen, Zahlungen, Automatisierung nach Wahl'), L('Jednostránkový web s kontaktem', 'One-page site with contact', 'One-Page-Website mit Kontakt')],
                    [L('Hosting a doména', 'Hosting & domain', 'Hosting & Domain'), L('Roční hosting dle kalkulace', 'Annual hosting as calculated', 'Jahres-Hosting laut Kalkulation'), L('1. rok hostingu a .cz domény v ceně', 'First year of hosting and .cz domain included', '1. Jahr Hosting und .cz-Domain inklusive')],
                    [L('Záruka', 'Guarantee', 'Garantie'), L('Záruka funkčnosti', 'Functionality warranty', 'Funktionsgarantie'), L('30denní vrácení peněz', '30-day money-back', '30 Tage Geld zurück')],
                    [L('Sleva FAST20', 'FAST20 discount', 'FAST20-Rabatt'), L('Ano, 20 % na tvorbu (24 h)', 'Yes, 20% off build work (24h)', 'Ja, 20 % auf Erstellung (24 h)'), L('Ne', 'No', 'Nein')],
                  ].map(([k, a, b]) => (
                    <tr key={k.en} className="border-b border-border/40 last:border-0">
                      <th scope="row" className="p-5 font-medium text-muted-foreground">{k[lang]}</th>
                      <td className="p-5 bg-primary/5 font-medium text-foreground">{a[lang]}</td>
                      <td className="p-5 text-foreground">{b[lang]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">{L('Nejsme plátci DPH. Hotové balíčky se řídí podmínkami na stránce nabídky; přesný odhad projektu na míru vám dá kalkulačka.', 'We are not VAT registered. Ready-built packages follow the terms on the offer page; the calculator gives your tailored estimate.', 'Wir sind nicht umsatzsteuerpflichtig. Fertige Pakete unterliegen den Bedingungen auf der Angebotsseite; der Kalkulator liefert Ihre individuelle Schätzung.')[lang]}</p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3"><Primary label={L('Spočítat web na míru', 'Price a bespoke site', 'Individuelle Website berechnen')[lang]} /><Secondary to="/offer" label={t.ctaCompare[lang]} /></div>
          </div>
        </section>

        {/* 10–11 OFFER */}
        <OfferBlock lang={lang} lp={lp} />

        {/* 13 FAQ */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
            <motion.div {...fade}><Eyebrow>FAQ</Eyebrow><div className="mt-5"><H2>{L('Než se rozhodnete', 'Before you decide', 'Bevor Sie entscheiden')[lang]}</H2></div><div className="mt-8"><Secondary to="#enquiry" label={L('Zeptat se nás přímo', 'Ask us directly', 'Direkt fragen')[lang]} /></div></motion.div>
            <Accordion type="single" collapsible className="rounded-3xl bg-card border border-border/60 px-6">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q.en} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display font-semibold text-base">{f.q[lang]}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">{f.a[lang]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 14 FINAL */}
        <section id="enquiry" className="relative py-24 lg:py-32 gradient-hero overflow-hidden scroll-mt-24">
          <img src={processImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-10" />
          <div className="relative container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
            <motion.div {...fade}>
              <H2 light>{L('Váš příští zákazník už hledá. Ať najde vás.', 'Your next customer is already searching. Make sure they find you.', 'Ihr nächster Kunde sucht schon. Sorgen Sie dafür, dass er Sie findet.')[lang]}</H2>
              <p className="mt-6 text-lg text-primary-foreground/80">{L('Za pár minut v kalkulačce víte, co web bude stát. Nebo nám napište a odpovíme do jednoho pracovního dne.', 'A few minutes in the calculator tells you what it will cost. Or write to us — we reply within one working day.', 'Ein paar Minuten im Kalkulator, und Sie kennen den Preis. Oder schreiben Sie uns — Antwort innerhalb eines Arbeitstages.')[lang]}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3"><Primary label={L('Začít v AI kalkulačce', 'Start in the AI calculator', 'Im KI-Kalkulator starten')[lang]} /><Secondary to="/contact" label={t.ctaTalk[lang]} dark /></div>
            </motion.div>
            <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-lg">
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
