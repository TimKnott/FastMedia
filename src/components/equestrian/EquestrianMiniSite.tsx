import { useEffect, useState } from 'react';
import {
  Baby, GraduationCap, Warehouse, BedDouble, Mountain, Trophy, ShoppingBag, Stethoscope,
  Sparkles, MapPin, Mail, Phone, Star, Share2, CalendarDays, Users, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoBookingCalendar from '@/components/DemoBookingCalendar';
import stableCourtyard from '@/assets/equestrian/stable-courtyard.jpg';
import ridingLesson from '@/assets/equestrian/riding-lesson.jpg';
import guestStay from '@/assets/equestrian/guest-stay.jpg';
import heroTrail from '@/assets/equestrian/hero-trail.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;

export interface EquestrianCategory {
  key: string;
  icon: typeof Baby;
  label: L3;
  demoName: string;
  tagline: L3;
  image: string;
  services: L3[];
}

export const categories: EquestrianCategory[] = [
  { key: 'breeders', icon: Baby, image: stableCourtyard, demoName: 'Willow Brook Stud',
    label: { en: 'Breeders, stud farms & horse sales', cs: 'Chovatelé, hřebčíny a prodej koní', de: 'Züchter, Gestüte & Pferdeverkauf' },
    tagline: { en: 'Quality warmbloods, bred with patience.', cs: 'Kvalitní teplokrevníci, chovaní s trpělivostí.', de: 'Qualitäts-Warmblüter, mit Geduld gezüchtet.' },
    services: [
      { en: 'Horses for sale with video & pedigree', cs: 'Koně na prodej s videem a rodokmenem', de: 'Verkaufspferde mit Video & Abstammung' },
      { en: 'Stallion services & breeding enquiries', cs: 'Připouštění a dotazy k chovu', de: 'Deckhengste & Zuchtanfragen' },
      { en: 'Viewing appointments', cs: 'Termíny prohlídek', de: 'Besichtigungstermine' },
    ] },
  { key: 'schools', icon: GraduationCap, image: ridingLesson, demoName: 'Meadow Lane Riding School',
    label: { en: 'Riding schools, instructors & trainers', cs: 'Jezdecké školy, instruktoři a trenéři', de: 'Reitschulen, Reitlehrer & Trainer' },
    tagline: { en: 'Confident riders, happy horses.', cs: 'Sebevědomí jezdci, spokojení koně.', de: 'Sichere Reiter, zufriedene Pferde.' },
    services: [
      { en: 'Private & group lessons', cs: 'Individuální a skupinové lekce', de: 'Einzel- & Gruppenstunden' },
      { en: 'Children’s pony club', cs: 'Dětský pony klub', de: 'Kinder-Ponyclub' },
      { en: 'Instructor schedules by day', cs: 'Rozvrhy instruktorů po dnech', de: 'Trainer-Zeitpläne pro Tag' },
    ] },
  { key: 'livery', icon: Warehouse, image: stableCourtyard, demoName: 'Oakridge Livery Yard',
    label: { en: 'Livery yards, stables & boarding', cs: 'Ustájení, stáje a penziony pro koně', de: 'Pensionsställe, Ställe & Einstellplätze' },
    tagline: { en: 'Calm, careful care for your horse.', cs: 'Klidná a pečlivá péče o vašeho koně.', de: 'Ruhige, sorgfältige Pflege für Ihr Pferd.' },
    services: [
      { en: 'Full, part & DIY livery', cs: 'Plné, částečné i vlastní ustájení', de: 'Voll-, Teil- & Selbstversorgerpension' },
      { en: 'Box availability waiting list', cs: 'Pořadník volných boxů', de: 'Warteliste für freie Boxen' },
      { en: 'Daily care & turnout log', cs: 'Denní péče a výběhy', de: 'Tägliche Pflege & Koppelgang' },
    ] },
  { key: 'stays', icon: BedDouble, image: guestStay, demoName: 'Hillside Farm Stay',
    label: { en: 'Equestrian accommodation, farm stays & camping', cs: 'Ubytování u koní, farmy a kempy', de: 'Reiterferien-Unterkünfte, Hof & Camping' },
    tagline: { en: 'Wake up next to the paddock.', cs: 'Probuďte se vedle výběhu.', de: 'Aufwachen neben der Koppel.' },
    services: [
      { en: 'Rooms, cabins & camping pitches', cs: 'Pokoje, chatky a místa pro stany', de: 'Zimmer, Hütten & Stellplätze' },
      { en: 'Guest horse boxes', cs: 'Boxy pro koně hostů', de: 'Gastboxen für Pferde' },
      { en: 'Seasonal packages', cs: 'Sezónní balíčky', de: 'Saisonpakete' },
    ] },
  { key: 'trails', icon: Mountain, image: heroTrail, demoName: 'Forest Trail Riding Centre',
    label: { en: 'Trail rides, trekking & riding holidays', cs: 'Vyjížďky, treky a jezdecké dovolené', de: 'Ausritte, Wanderritte & Reiturlaub' },
    tagline: { en: 'See the countryside from the saddle.', cs: 'Poznejte krajinu ze sedla.', de: 'Die Landschaft vom Sattel aus erleben.' },
    services: [
      { en: '1–3 hour guided rides', cs: 'Vyjížďky s průvodcem 1–3 hodiny', de: 'Geführte Ausritte 1–3 Stunden' },
      { en: 'Multi-day treks', cs: 'Vícedenní treky', de: 'Mehrtägige Wanderritte' },
      { en: 'Capacity by guides & horses', cs: 'Kapacita podle průvodců a koní', de: 'Kapazität nach Guides & Pferden' },
    ] },
  { key: 'events', icon: Trophy, image: ridingLesson, demoName: 'Valley Dressage Club',
    label: { en: 'Dressage, competitions & events', cs: 'Drezura, závody a akce', de: 'Dressur, Turniere & Events' },
    tagline: { en: 'Entries, schedules and results in one place.', cs: 'Přihlášky, rozpisy a výsledky na jednom místě.', de: 'Nennungen, Zeitpläne und Ergebnisse an einem Ort.' },
    services: [
      { en: 'Event calendar & entries', cs: 'Kalendář akcí a přihlášky', de: 'Eventkalender & Nennungen' },
      { en: 'Start times & arena plans', cs: 'Startovní časy a plány kolbiště', de: 'Startzeiten & Platzpläne' },
      { en: 'Results & photo galleries', cs: 'Výsledky a fotogalerie', de: 'Ergebnisse & Fotogalerien' },
    ] },
  { key: 'retail', icon: ShoppingBag, image: stableCourtyard, demoName: 'Saddle & Feed Store',
    label: { en: 'Tack, feed & equestrian retailers', cs: 'Sedlářství, krmiva a jezdecké potřeby', de: 'Sattlerei, Futter & Reitsportfachhandel' },
    tagline: { en: 'Everything for horse and rider.', cs: 'Vše pro koně i jezdce.', de: 'Alles für Pferd und Reiter.' },
    services: [
      { en: 'Product catalogue & stock enquiries', cs: 'Katalog a dotazy na skladem', de: 'Produktkatalog & Lageranfragen' },
      { en: 'Saddle-fitting appointments', cs: 'Termíny pro sedlaře', de: 'Sattelanpassungstermine' },
      { en: 'Feed order reminders', cs: 'Připomínky objednávek krmiva', de: 'Futterbestell-Erinnerungen' },
    ] },
  { key: 'pros', icon: Stethoscope, image: guestStay, demoName: 'Equine Care Practice',
    label: { en: 'Vets, farriers, physios & equine pros', cs: 'Veterináři, podkováři, fyzioterapeuti', de: 'Tierärzte, Hufschmiede, Physios & Profis' },
    tagline: { en: 'Visits planned around your rounds.', cs: 'Návštěvy plánované podle vašich tras.', de: 'Besuche passend zu Ihren Touren.' },
    services: [
      { en: 'Yard-visit booking by area', cs: 'Rezervace výjezdů podle oblasti', de: 'Stallbesuche nach Gebiet buchen' },
      { en: 'Recall reminders (shoeing, dental)', cs: 'Připomínky (kování, zuby)', de: 'Erinnerungen (Beschlag, Zähne)' },
      { en: 'Emergency contact notes', cs: 'Pokyny pro naléhavé případy', de: 'Hinweise für Notfälle' },
    ] },
];

const t = {
  catTitle: { en: 'Who is it for? Pick your business', cs: 'Pro koho? Vyberte svůj obor', de: 'Für wen? Wählen Sie Ihr Geschäft' },
  badge: { en: 'Illustrative demo — not a real customer website', cs: 'Ilustrativní ukázka — nejde o web skutečného zákazníka', de: 'Illustrative Demo — keine echte Kundenwebsite' },
  title: { en: 'What your mini-site could look like', cs: 'Jak by mohl vypadat váš mini-web', de: 'So könnte Ihre Mini-Website aussehen' },
  intro: { en: 'Switch business type to see a tailored sample. Names, contact details and reviews below are placeholders.', cs: 'Přepněte typ podniku a uvidíte přizpůsobenou ukázku. Jména, kontakty a recenze jsou zástupné.', de: 'Wechseln Sie den Geschäftstyp für ein passendes Beispiel. Namen, Kontaktdaten und Bewertungen sind Platzhalter.' },
  services: { en: 'Services', cs: 'Služby', de: 'Leistungen' },
  schedule: { en: 'Staff & service schedule (sample)', cs: 'Rozvrh personálu a služeb (ukázka)', de: 'Personal- & Leistungsplan (Beispiel)' },
  social: { en: 'Promotion panel (draft for review)', cs: 'Propagační panel (návrh ke schválení)', de: 'Werbe-Panel (Entwurf zur Prüfung)' },
  socialText: { en: 'Draft post: “Spring rides are open — book your slot online.” Posting only after you approve, via an integration you choose.', cs: 'Návrh příspěvku: „Jarní vyjížďky jsou otevřené — rezervujte online.“ Zveřejní se až po vašem schválení přes zvolenou integraci.', de: 'Entwurf: „Frühlingsausritte sind offen — jetzt online buchen.“ Veröffentlichung erst nach Ihrer Freigabe über eine gewählte Integration.' },
  review: { en: 'Sample review (not a real testimonial)', cs: 'Ukázková recenze (není skutečná)', de: 'Beispielbewertung (kein echtes Testimonial)' },
  reviewText: { en: '“Booking was easy and the horses were lovely.” — Sample Visitor', cs: '„Rezervace byla snadná a koně skvělí.“ — Ukázkový návštěvník', de: '„Die Buchung war einfach, die Pferde wunderbar.“ — Beispielgast' },
  contact: { en: 'Contact & location (placeholder)', cs: 'Kontakt a poloha (zástupné)', de: 'Kontakt & Standort (Platzhalter)' },
  ask: { en: 'Send an enquiry (demo)', cs: 'Odeslat dotaz (ukázka)', de: 'Anfrage senden (Demo)' },
  askNote: { en: 'Demo form — nothing is sent.', cs: 'Ukázkový formulář — nic se neodesílá.', de: 'Demo-Formular — es wird nichts gesendet.' },
  whyTitle: { en: 'Why a mini-site helps', cs: 'Proč mini-web pomáhá', de: 'Warum eine Mini-Website hilft' },
  owner: { en: 'For the owner: fewer calls, one place to update services, capacity and seasonal offers, and a professional presence you control.', cs: 'Pro majitele: méně telefonátů, jedno místo pro služby, kapacity a sezónní nabídky a profesionální prezentace pod vaší kontrolou.', de: 'Für Inhaber: weniger Anrufe, ein Ort für Leistungen, Kapazitäten und Saisonangebote und ein professioneller Auftritt unter Ihrer Kontrolle.' },
  visitor: { en: 'For visitors: clear services, availability at a glance, enquiries any time and information in their own language on any phone.', cs: 'Pro návštěvníky: jasné služby, dostupnost na první pohled, dotazy kdykoli a informace v jejich jazyce na mobilu.', de: 'Für Besucher: klare Leistungen, Verfügbarkeit auf einen Blick, Anfragen jederzeit und Infos in ihrer Sprache auf jedem Handy.' },
  calNote: { en: 'Calendar shown for illustration — live booking is configured per project.', cs: 'Kalendář je ilustrativní — skutečné rezervace se nastavují pro každý projekt.', de: 'Kalender zur Veranschaulichung — echte Buchungen werden pro Projekt eingerichtet.' },
};

const schedule: { who: L3; when: L3 }[] = [
  { who: { en: 'Anna — instructor', cs: 'Anna — instruktorka', de: 'Anna — Reitlehrerin' }, when: { en: 'Mon–Fri 9:00–15:00', cs: 'Po–Pá 9:00–15:00', de: 'Mo–Fr 9:00–15:00' } },
  { who: { en: 'Tom — trail guide', cs: 'Tom — průvodce', de: 'Tom — Rittführer' }, when: { en: 'Sat–Sun 10:00–17:00', cs: 'So–Ne 10:00–17:00', de: 'Sa–So 10:00–17:00' } },
  { who: { en: 'Yard team — daily care', cs: 'Tým stáje — denní péče', de: 'Stallteam — tägliche Pflege' }, when: { en: 'Daily 7:00 & 18:00', cs: 'Denně 7:00 a 18:00', de: 'Täglich 7:00 & 18:00' } },
];

export const CategoryCards = ({ lang }: { lang: Lang }) => (
  <nav aria-label={t.catTitle[lang]} className="mt-10">
    <p className="mb-3 text-sm font-semibold text-white/90">{t.catTitle[lang]}</p>
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {categories.map((c) => (
        <li key={c.key}>
          <a href={`#minisite-${c.key}`}
            className="flex h-full items-start gap-2 rounded-xl border border-white/20 bg-white/10 p-3 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm">
            <c.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {c.label[lang]}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const EquestrianMiniSite = ({ lang }: { lang: Lang }) => {
  const [key, setKey] = useState('trails');
  useEffect(() => {
    const sync = () => {
      const m = window.location.hash.match(/^#minisite-(\w+)/);
      if (m && categories.some((c) => c.key === m[1])) {
        setKey(m[1]);
        document.getElementById('minisite')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const c = categories.find((x) => x.key === key)!;

  return (
    <section id="minisite" className="scroll-mt-20 py-16">
      {categories.map((x) => <span key={x.key} id={`minisite-${x.key}`} className="sr-only" />)}
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> {t.badge[lang]}
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{t.title[lang]}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t.intro[lang]}</p>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2" role="tablist">
          {categories.map((x) => (
            <button key={x.key} role="tab" aria-selected={key === x.key} onClick={() => setKey(x.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${key === x.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'}`}>
              {x.label[lang]}
            </button>
          ))}
        </div>

        {/* Browser frame */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" /><span className="h-2.5 w-2.5 rounded-full bg-accent/60" /><span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            <span className="ml-3 truncate text-xs text-muted-foreground">{c.demoName.toLowerCase().replace(/[^a-z]+/g, '-')}.example</span>
          </div>
          <div className="relative h-56 sm:h-72">
            <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 p-6 text-background">
              <p className="font-display text-2xl font-bold sm:text-3xl">{c.demoName}</p>
              <p className="mt-1 text-sm opacity-90">{c.tagline[lang]}</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-primary" /> {t.services[lang]}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">{c.services.map((s) => <li key={s.en}>• {s[lang]}</li>)}</ul>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> {t.schedule[lang]}</h3>
              <ul className="space-y-2 text-sm">{schedule.map((s) => (
                <li key={s.who.en} className="flex justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"><span>{s.who[lang]}</span><span className="text-muted-foreground">{s.when[lang]}</span></li>
              ))}</ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Share2 className="h-4 w-4 text-accent" /> {t.social[lang]}</h3>
                <p className="text-xs text-muted-foreground">{t.socialText[lang]}</p>
              </div>
              <div className="rounded-xl border border-dashed border-border p-4">
                <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold">{[0,1,2,3,4].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}</h3>
                <p className="text-xs italic text-muted-foreground">{t.reviewText[lang]}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{t.review[lang]}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <DemoBookingCalendar primaryColor="hsl(var(--primary))" gradientClass="bg-gradient-to-r from-primary to-accent" tradeName={c.demoName} />
            <p className="-mt-8 pb-6 text-center text-xs text-muted-foreground"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{t.calNote[lang]}</p>
          </div>

          <div className="grid gap-6 border-t border-border p-6 md:grid-cols-2">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3" aria-label={t.ask[lang]}>
              <h3 className="font-semibold">{t.ask[lang]}</h3>
              <input aria-label="Name" placeholder="Name" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input aria-label="Email" type="email" placeholder="email@example.com" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <textarea aria-label="Message" rows={3} placeholder="…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <Button type="submit" disabled className="w-full">{t.ask[lang]}</Button>
              <p className="text-xs text-muted-foreground">{t.askNote[lang]}</p>
            </form>
            <div>
              <h3 className="mb-3 font-semibold">{t.contact[lang]}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><MapPin className="h-4 w-4 text-primary" /> 1 Example Lane, Sample Village</li>
                <li className="flex gap-2"><Phone className="h-4 w-4 text-primary" /> +00 000 000 000</li>
                <li className="flex gap-2"><Mail className="h-4 w-4 text-primary" /> hello@example.com</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <p className="rounded-2xl border border-border bg-card p-5 text-sm"><strong className="block font-display text-base">{t.whyTitle[lang]}</strong>{t.owner[lang]}</p>
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t.visitor[lang]}</p>
        </div>
      </div>
    </section>
  );
};

export default EquestrianMiniSite;
