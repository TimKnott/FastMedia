import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CalendarDays, CheckCircle2, Clock, Globe2, TreePine, Languages,
  MessageSquare, PhoneOff, Settings2, ShieldCheck, Smartphone, Sparkles,
  BarChart3, BedDouble, Tent, Users, CloudSun, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import heroTrail from '@/assets/equestrian/hero-trail.jpg';
import stableCourtyard from '@/assets/equestrian/stable-courtyard.jpg';
import ridingLesson from '@/assets/equestrian/riding-lesson.jpg';
import guestStay from '@/assets/equestrian/guest-stay.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;

const copy = {
  eyebrow: { cs: 'Weby pro jezdecké podniky', en: 'Websites for equestrian businesses', de: 'Websites für Reitbetriebe' } as L3,
  headline: {
    cs: 'Více času s koňmi. Web za vás vyřídí administrativu.',
    en: 'Spend more time with horses. Let your website handle the admin.',
    de: 'Mehr Zeit mit Pferden. Ihre Website erledigt die Verwaltung.',
  } as L3,
  intro: {
    cs: 'Navrhujeme weby a propojené nástroje na míru stajím, jezdeckým školám a venkovským ubytováním. Rezervace, kapacity a rutinní komunikace zvládne technologie — péče o koně a lidé zůstávají ve vašich rukou.',
    en: 'We design bespoke websites and connected tools for stables, riding schools and rural equestrian stays. Technology handles bookings, capacity and routine communication — horse care and people stay in your hands.',
    de: 'Wir gestalten maßgeschneiderte Websites und vernetzte Werkzeuge für Ställe, Reitschulen und Reiterferien. Technologie übernimmt Buchungen, Kapazitäten und Routinekommunikation — Pferdepflege und Menschen bleiben in Ihrer Hand.',
  } as L3,
  ctaPrimary: { cs: 'Probrat web na míru', en: 'Discuss a custom website', de: 'Individuelle Website besprechen' } as L3,
  ctaDemo: { cs: 'Vyzkoušet ilustrativní demo', en: 'Explore the demo', de: 'Demo ansehen' } as L3,
  painsTitle: { cs: 'Znáte to?', en: 'Sound familiar?', de: 'Kommt Ihnen bekannt vor?' } as L3,
  pains: [
    { cs: 'Telefon zvoní uprostřed jízdy nebo krmení — a každý zmeškaný hovor může být zmeškaná rezervace.', en: 'The phone rings mid-ride or mid-feeding — and every missed call can be a missed booking.', de: 'Das Telefon klingelt mitten im Ritt oder beim Füttern — jeder verpasste Anruf kann eine verpasste Buchung sein.' },
    { cs: 'Dvojí rezervace, protože termíny vedete v diáři, na papíře a ve zprávách zároveň.', en: 'Double bookings because slots live in a diary, on paper and in messages at once.', de: 'Doppelbuchungen, weil Termine gleichzeitig im Kalender, auf Papier und in Nachrichten leben.' },
    { cs: 'Koordinace personálu, instruktorů, boxů, pokojů i jízdárny v hlavě jednoho člověka.', en: 'Coordinating staff, instructors, boxes, rooms and the arena inside one person\'s head.', de: 'Personal, Trainer, Boxen, Zimmer und Reithalle im Kopf einer einzigen Person koordinieren.' },
    { cs: 'Marketing a sociální sítě vždy až večer, když je po všem.', en: 'Marketing and social media always last — late in the evening, after everything else.', de: 'Marketing und soziale Medien immer zuletzt — spät abends, nach allem anderen.' },
    { cs: 'Administrativa po pracovní době, která nikdy nekončí.', en: 'After-hours admin that never ends.', de: 'Verwaltung nach Feierabend, die nie endet.' },
  ] as L3[],
  painsNote: {
    cs: 'Technologie zvládne rutinu. Péče, výjimky a rozhodnutí zůstávají na lidech.',
    en: 'Technology handles the routine. Care, exceptions and decisions stay with people.',
    de: 'Technologie übernimmt die Routine. Pflege, Ausnahmen und Entscheidungen bleiben bei Menschen.',
  } as L3,
  demoTitle: { cs: 'Ilustrativní demo rezervací', en: 'Illustrative booking demo', de: 'Illustratives Buchungs-Demo' } as L3,
  demoBadge: { cs: 'Ilustrativní demo — ne ostrý rezervační systém', en: 'Illustrative demo — not a live booking system', de: 'Illustratives Demo — kein echtes Buchungssystem' } as L3,
  demoIntro: {
    cs: 'Ukázka, jak může rezervace respektovat kapacity: vycházky potřebují průvodce, koně a velikost skupiny; lekce instruktora; jízdárnu lze pronajmout; boxy a ubytování mají denní kapacitu. Moduly se volí podle podniku — žádný nemusí nabízet všechno.',
    en: 'A preview of capacity-aware booking: trail rides need a guide, horses and group size; lessons need an instructor; the arena can be hired; boxes and rooms have daily capacity. Modules are chosen per business — no one must offer everything.',
    de: 'Eine Vorschau kapazitätsbewusster Buchung: Ausritte brauchen Guide, Pferde und Gruppengröße; Unterricht braucht einen Trainer; die Halle ist vermietbar; Boxen und Zimmer haben Tageskapazität. Module werden pro Betrieb gewählt — niemand muss alles anbieten.',
  } as L3,
  demoDay: { cs: 'Den', en: 'Day', de: 'Tag' } as L3,
  demoCapacity: { cs: 'Kapacita', en: 'Capacity', de: 'Kapazität' } as L3,
  demoFull: { cs: 'Obsazeno', en: 'Fully booked', de: 'Ausgebucht' } as L3,
  demoLeft: { cs: 'volno', en: 'left', de: 'frei' } as L3,
  demoWhy: { cs: 'Proč je termín nedostupný', en: 'Why a slot is unavailable', de: 'Warum ein Slot nicht verfügbar ist' } as L3,
  demoSelect: { cs: 'Vyberte termín', en: 'Select a slot', de: 'Slot wählen' } as L3,
  demoConfirm: {
    cs: 'V ostrém systému by zákazník obdržel potvrzení a připomínky a kalendář by hlídal kolize personálu i zdrojů.',
    en: 'In a live system the customer would receive confirmation and reminders, and the calendar would prevent staff and resource conflicts.',
    de: 'In einem echten System erhielte der Kunde Bestätigung und Erinnerungen, und der Kalender verhinderte Personal- und Ressourcenkonflikte.',
  } as L3,
  workflowTitle: { cs: 'Jak to funguje', en: 'How it works', de: 'So funktioniert es' } as L3,
  workflow: [
    { cs: 'Nastavíte služby, zdroje a personál', en: 'You configure services, resources and staff', de: 'Sie richten Leistungen, Ressourcen und Personal ein' },
    { cs: 'Zákazník vidí jen skutečně volné termíny', en: 'Customers see only genuinely available slots', de: 'Kunden sehen nur wirklich freie Termine' },
    { cs: 'Potvrzení a připomínky se odešlou automaticky', en: 'Confirmations and reminders go out automatically', de: 'Bestätigungen und Erinnerungen gehen automatisch raus' },
    { cs: 'Kalendář hlídá kolize personálu a zdrojů', en: 'The calendar prevents staff and resource conflicts', de: 'Der Kalender verhindert Personal- und Ressourcenkonflikte' },
  ] as L3[],
  privacyNote: {
    cs: 'Soukromí osobního kalendáře: napojené obsazené termíny mohou blokovat dostupnost, aniž by byly vidět názvy či detaily soukromých událostí — podmíněno podporovanou integrací a oprávněními.',
    en: 'Personal-calendar privacy: connected busy periods can block availability without exposing private appointment titles or details — subject to a supported integration and permissions.',
    de: 'Privatsphäre des persönlichen Kalenders: Verbundenene blockierte Zeiten können die Verfügbarkeit sperren, ohne Titel oder Details privater Termine preiszugeben — abhängig von unterstützter Integration und Berechtigungen.',
  } as L3,
  studioTitle: { cs: 'Marketingové studio', en: 'Marketing studio', de: 'Marketing-Studio' } as L3,
  studioSteps: [
    { cs: 'Vyberte akci nebo službu', en: 'Choose an event or service', de: 'Wählen Sie ein Event oder eine Leistung' },
    { cs: 'Návrh vícejazyčných příspěvků, obrázků a popisků', en: 'Draft multilingual posts, images and captions', de: 'Mehrsprachige Beiträge, Bilder und Texte entwerfen' },
    { cs: 'Zkontrolujte a naplánujte přes podporované integrace', en: 'Review and schedule via supported integrations', de: 'Prüfen und über unterstützte Integrationen planen' },
  ] as L3[],
  studioNote: {
    cs: 'Dostupnost funkcí závisí na integracích a konfiguraci — nic se nepublikovalo bez vašeho schválení.',
    en: 'Feature availability depends on integrations and configuration — nothing is published without your approval.',
    de: 'Die Verfügbarkeit hängt von Integrationen und Konfiguration ab — nichts wird ohne Ihre Freigabe veröffentlicht.',
  } as L3,
  calcTitle: { cs: 'Kolik času stojí administrativa?', en: 'What does admin time cost you?', de: 'Was kostet Sie die Verwaltung?' } as L3,
  calcCalls: { cs: 'Hodiny týdně: hovory a zprávy', en: 'Weekly hours: calls & messages', de: 'Stunden pro Woche: Anrufe & Nachrichten' } as L3,
  calcBooking: { cs: 'Hodiny týdně: správa rezervací', en: 'Weekly hours: booking admin', de: 'Stunden pro Woche: Buchungsverwaltung' } as L3,
  calcSocial: { cs: 'Hodiny týdně: sociální sítě', en: 'Weekly hours: social media', de: 'Stunden pro Woche: Soziale Medien' } as L3,
  calcRate: { cs: 'Hodinová cena vašeho času (Kč)', en: 'Your hourly cost (CZK)', de: 'Ihr Stundensatz (CZK)' } as L3,
  calcSave: { cs: 'Odhad podílu času, který by automatizace mohla ušetřit (%)', en: 'Estimated share of time automation might save (%)', de: 'Geschätzter Zeitanteil, den Automatisierung sparen könnte (%)' } as L3,
  calcHours: { cs: 'Odhadované hodiny měsíčně', en: 'Estimated hours per month', de: 'Geschätzte Stunden pro Monat' } as L3,
  calcCost: { cs: 'Odhadovaná cena měsíčně', en: 'Estimated cost per month', de: 'Geschätzte Kosten pro Monat' } as L3,
  calcNote: {
    cs: 'Pouze ilustrativní odhad podle vašich vstupů — žádná garantovaná úspora.',
    en: 'An illustrative estimate based on your inputs only — no guaranteed savings.',
    de: 'Nur eine illustrative Schätzung auf Basis Ihrer Angaben — keine garantierte Ersparnis.',
  } as L3,
  benefitsTitle: { cs: 'Co získáte', en: 'What you gain', de: 'Ihre Vorteile' } as L3,
  benefits: [
    { icon: 'users', cs: 'Zákazníci si rezervují sami, kdykoliv', en: 'Customers book themselves, anytime', de: 'Kunden buchen selbst, jederzeit' },
    { icon: 'languages', cs: 'Vícejazyčné rezervace pro hosty ze zahraničí', en: 'Multilingual booking for international guests', de: 'Mehrsprachige Buchung für internationale Gäste' },
    { icon: 'sun', cs: 'Sezónní služby, storno a počasí jako nastavitelná pravidla', en: 'Seasonal services, cancellation & weather rules as configurable options', de: 'Saisonale Angebote, Storno- und Wetterregeln als konfigurierbare Optionen' },
    { icon: 'phone', cs: 'Mobilní web na míru, žádná šablona', en: 'A mobile-first custom site, no template', de: 'Individuelle mobile Website, keine Vorlage' },
    { icon: 'settings', cs: 'Centrální správa služeb, personálu a kapacit', en: 'Central management of services, staff and capacity', de: 'Zentrale Verwaltung von Leistungen, Personal und Kapazitäten' },
    { icon: 'chart', cs: 'Přehledy a reporty na jednom místě', en: 'Reports and overviews in one place', de: 'Berichte und Übersichten an einem Ort' },
  ] as { icon: string } & L3[],
  contactTitle: { cs: 'Proberme váš jezdecký web', en: 'Let\'s talk about your equestrian website', de: 'Sprechen wir über Ihre Reit-Website' } as L3,
  seoTitle: {
    cs: 'Weby pro stáje a jezdecké podniky | FastMedia.Pro',
    en: 'Websites for Stables & Equestrian Businesses | FastMedia.Pro',
    de: 'Websites für Ställe & Reitbetriebe | FastMedia.Pro',
  } as L3,
  seoDesc: {
    cs: 'Weby na míru pro stáje, jezdecké školy a venkovské ubytování: rezervace s kapacitami, vícejazyčný obsah a marketingové nástroje. Více času s koňmi, méně administrativy.',
    en: 'Bespoke websites for stables, riding schools and rural equestrian stays: capacity-aware booking, multilingual content and marketing tools. More time with horses, less admin.',
    de: 'Maßgeschneiderte Websites für Ställe, Reitschulen und Reiterferien: kapazitätsbewusste Buchung, mehrsprachige Inhalte und Marketing-Werkzeuge. Mehr Zeit mit Pferden, weniger Verwaltung.',
  } as L3,
};

interface Service {
  key: string;
  name: L3;
  slots: string[];
  /** per-day (0=Mon..6=Sun) availability: remaining capacity + reason when full */
  capacity: (day: number, slot: string) => { left: number; total: number; reason?: L3 };
}

const services: Service[] = [
  {
    key: 'trail',
    name: { cs: 'Vyjížďky s průvodcem', en: 'Guided trail rides', de: 'Geführte Ausritte' },
    slots: ['09:00', '11:00', '14:00', '16:00'],
    capacity: (day, slot) => {
      // 2 guides, 8 horses, group max 6; Sat/Sun one guide away
      const guides = day >= 5 ? 1 : 2;
      const groups = guides; // one group per guide per slot
      const booked = (day * 7 + slot.length * 3) % 2 === 0 ? 1 : 0;
      const left = Math.max(0, groups - booked);
      return left > 0
        ? { left, total: groups }
        : { left: 0, total: groups, reason: { cs: 'Žádný volný průvodce v tomto čase', en: 'No guide available at this time', de: 'Kein Guide zu dieser Zeit verfügbar' } };
    },
  },
  {
    key: 'lesson',
    name: { cs: 'Jezdecké lekce', en: 'Riding lessons', de: 'Reitunterricht' },
    slots: ['08:00', '10:00', '15:00', '17:00'],
    capacity: (day, slot) => {
      const instructors = day === 2 ? 0 : 1; // instructor off on Wednesdays
      if (instructors === 0) return { left: 0, total: 0, reason: { cs: 'Instruktor má tento den volno', en: 'Instructor is off this day', de: 'Trainer hat an diesem Tag frei' } };
      const left = slot === '10:00' ? 0 : 1;
      return left > 0 ? { left, total: 1 } : { left: 0, total: 1, reason: { cs: 'Lekce již obsazena', en: 'Lesson already booked', de: 'Stunde bereits gebucht' } };
    },
  },
  {
    key: 'arena',
    name: { cs: 'Pronájem jízdárny', en: 'Arena hire', de: 'Hallennmiete' },
    slots: ['07:00', '12:00', '18:00', '19:00'],
    capacity: (day, slot) => {
      const taken = (day === 1 && slot === '18:00') || (day === 4 && slot === '12:00');
      return taken
        ? { left: 0, total: 1, reason: { cs: 'Jízdárna je v tomto čase pronajatá', en: 'Arena is hired at this time', de: 'Halle ist zu dieser Zeit vermietet' } }
        : { left: 1, total: 1 };
    },
  },
  {
    key: 'livery',
    name: { cs: 'Boxy a denní péče', en: 'Livery boxes & daily care', de: 'Boxen & Tagespflege' },
    slots: ['celý den'],
    capacity: (day) => {
      const boxes = 12;
      const used = 9 + (day % 3);
      const left = boxes - used;
      return { left, total: boxes };
    },
  },
  {
    key: 'stay',
    name: { cs: 'Ubytování a kempování', en: 'Rooms & camping pitches', de: 'Zimmer & Stellplätze' },
    slots: ['celý den'],
    capacity: (day) => {
      const units = 6;
      const used = day >= 5 ? 6 : 3 + (day % 2);
      const left = units - used;
      return left > 0
        ? { left, total: units }
        : { left: 0, total: units, reason: { cs: 'Víkend je plně obsazen', en: 'Weekend fully booked', de: 'Wochenende ausgebucht' } };
    },
  },
];

const dayNames: Record<Lang, string[]> = {
  cs: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
};

const benefitIcons: Record<string, typeof Users> = {
  users: Users, languages: Languages, sun: CloudSun, phone: Smartphone, settings: Settings2, chart: BarChart3,
};

const EquestrianLanding = () => {
  const { language } = useLanguage();
  const lang: Lang = language === 'de' ? 'de' : language === 'en' ? 'en' : 'cs';
  const [serviceKey, setServiceKey] = useState('trail');
  const [day, setDay] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hoursCalls, setHoursCalls] = useState(4);
  const [hoursBooking, setHoursBooking] = useState(5);
  const [hoursSocial, setHoursSocial] = useState(3);
  const [rate, setRate] = useState(400);
  const [savePct, setSavePct] = useState(50);

  const service = services.find((s) => s.key === serviceKey)!;
  const weekly = hoursCalls + hoursBooking + hoursSocial;
  const monthlyHours = useMemo(() => Math.round(weekly * 4.33 * (savePct / 100) * 10) / 10, [weekly, savePct]);
  const monthlyCost = Math.round(monthlyHours * rate);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: copy.seoTitle[lang].replace(' | FastMedia.Pro', ''),
    description: copy.seoDesc[lang],
    url: 'https://www.fastmedia.pro/equestrian',
    provider: { '@type': 'ProfessionalService', name: 'FastMedia.Pro', telephone: '+420 797 864 432', email: 'support@fastmedia.pro' },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={copy.seoTitle[lang]} description={copy.seoDesc[lang]} pagePath="/equestrian" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <img src={heroTrail} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(140_30%_8%)] via-[hsl(140_30%_8%)]/70 to-[hsl(140_30%_8%)]/30" />
        <div className="container relative mx-auto max-w-3xl px-4 py-24 md:py-36">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[hsl(45_90%_65%)]">
            <TreePine className="h-4 w-4" /> {copy.eyebrow[lang]}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{copy.headline[lang]}</h1>
          <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">{copy.intro[lang]}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-[hsl(45_90%_55%)] text-[hsl(140_30%_10%)] hover:bg-[hsl(45_90%_60%)]">
              <a href="#enquiry">{copy.ctaPrimary[lang]} <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <a href="#demo">{copy.ctaDemo[lang]}</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Pains */}
        <section className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold">{copy.painsTitle[lang]}</h2>
            <ul className="space-y-4">
              {copy.pains.map((p) => (
                <li key={p.en} className="flex gap-3">
                  <PhoneOff className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-muted-foreground">{p[lang]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" /> {copy.painsNote[lang]}
            </p>
          </div>
          <img src={stableCourtyard} alt="" loading="lazy" width={1280} height={960} className="rounded-3xl shadow-lg" />
        </section>

        {/* Illustrative booking demo */}
        <section id="demo" className="bg-muted/40 py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(45_90%_55%)]/15 px-4 py-1.5 text-xs font-semibold text-[hsl(45_80%_35%)]">
                <Sparkles className="h-3.5 w-3.5" /> {copy.demoBadge[lang]}
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{copy.demoTitle[lang]}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{copy.demoIntro[lang]}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8">
              {/* Service tabs */}
              <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label={copy.demoTitle[lang]}>
                {services.map((s) => (
                  <button
                    key={s.key}
                    role="tab"
                    aria-selected={serviceKey === s.key}
                    onClick={() => { setServiceKey(s.key); setPicked(null); }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${serviceKey === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                  >
                    {s.name[lang]}
                  </button>
                ))}
              </div>

              {/* Day switcher */}
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{copy.demoDay[lang]}:</span>
                <div className="flex flex-wrap gap-1">
                  {dayNames[lang].map((d, i) => (
                    <button
                      key={d}
                      onClick={() => { setDay(i); setPicked(null); }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${day === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div className="grid gap-3 sm:grid-cols-2">
                {service.slots.map((slot) => {
                  const cap = service.capacity(day, slot);
                  const full = cap.left === 0;
                  const active = picked === slot;
                  return (
                    <button
                      key={slot}
                      disabled={full}
                      onClick={() => setPicked(slot)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${full ? 'cursor-not-allowed border-border bg-muted/40 opacity-70' : active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{slot === 'celý den' ? (lang === 'cs' ? 'Celý den' : lang === 'de' ? 'Ganzer Tag' : 'All day') : slot}</span>
                        <span className={`text-xs font-semibold ${full ? 'text-destructive' : 'text-emerald-600'}`}>
                          {full ? copy.demoFull[lang] : `${cap.left}/${cap.total} ${copy.demoLeft[lang]}`}
                        </span>
                      </div>
                      {full && cap.reason && (
                        <p className="mt-1 text-xs text-muted-foreground">{cap.reason[lang]}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {picked && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
                  {copy.demoConfirm[lang]}
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Workflow + privacy */}
        <section className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2">
          <img src={ridingLesson} alt="" loading="lazy" width={1280} height={960} className="rounded-3xl shadow-lg" />
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold">{copy.workflowTitle[lang]}</h2>
            <ol className="space-y-4">
              {copy.workflow.map((w, i) => (
                <li key={w.en} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <span className="pt-1 text-muted-foreground">{w[lang]}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Lock className="h-5 w-5 shrink-0 text-primary" /> {copy.privacyNote[lang]}
            </p>
          </div>
        </section>

        {/* Marketing studio */}
        <section className="bg-muted/40 py-16">
          <div className="container mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold">{copy.studioTitle[lang]}</h2>
              <ol className="space-y-4">
                {copy.studioSteps.map((s, i) => (
                  <li key={s.en} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(45_90%_55%)] font-display text-sm font-bold text-[hsl(140_30%_10%)]">{i + 1}</span>
                    <span className="pt-1 text-muted-foreground">{s[lang]}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <MessageSquare className="h-5 w-5 shrink-0 text-primary" /> {copy.studioNote[lang]}
              </p>
            </div>
            <img src={guestStay} alt="" loading="lazy" width={1280} height={960} className="rounded-3xl shadow-lg" />
          </div>
        </section>

        {/* Time/cost calculator */}
        <section className="container mx-auto max-w-3xl px-4 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl">{copy.calcTitle[lang]}</h2>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {([
                [copy.calcCalls[lang], hoursCalls, setHoursCalls, 20],
                [copy.calcBooking[lang], hoursBooking, setHoursBooking, 20],
                [copy.calcSocial[lang], hoursSocial, setHoursSocial, 20],
                [copy.calcRate[lang], rate, setRate, 2000],
                [copy.calcSave[lang], savePct, setSavePct, 90],
              ] as [string, number, (v: number) => void, number][]).map(([label, value, setter, max]) => (
                <label key={label} className="block">
                  <span className="mb-1 flex justify-between text-sm font-medium">
                    {label} <span className="text-muted-foreground">{value}{label.includes('%') ? ' %' : label.includes('Kč') ? ' Kč' : ' h'}</span>
                  </span>
                  <input
                    type="range" min={0} max={max} value={value}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="w-full accent-[hsl(45_90%_55%)]"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/60 p-5 text-center">
                <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="font-display text-3xl font-bold">{monthlyHours} h</p>
                <p className="text-xs text-muted-foreground">{copy.calcHours[lang]}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-5 text-center">
                <BarChart3 className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="font-display text-3xl font-bold">{monthlyCost.toLocaleString(lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : 'cs-CZ')} Kč</p>
                <p className="text-xs text-muted-foreground">{copy.calcCost[lang]}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">{copy.calcNote[lang]}</p>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/40 py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center font-display text-2xl font-bold sm:text-3xl">{copy.benefitsTitle[lang]}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.benefits.map((b) => {
                const Icon = benefitIcons[b.icon];
                return (
                  <div key={b.en} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="pt-1.5 text-sm font-medium text-foreground">{b[lang]}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Globe2 className="h-4 w-4" /> <BedDouble className="h-4 w-4" /> <Tent className="h-4 w-4" />
            </p>
          </div>
        </section>

        {/* Enquiry */}
        <section id="enquiry" className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl">{copy.contactTitle[lang]}</h2>
          <OfferEnquiryForm lang={lang} source="Equestrian landing page (/equestrian)" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EquestrianLanding;
