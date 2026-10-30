import { Link } from 'react-router-dom';
import { Globe, CalendarCheck, BellRing, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type L = 'cs' | 'en' | 'de';
const copy: Record<L, { k: string; t: string; s: string; hub: string; hubSub: string; cta: string; cards: [string, string][] }> = {
  cs: { k: 'Jak to funguje', t: 'Jeden systém FastMedia. Vše, co váš web potřebuje.', s: 'Za 20 €/měsíc: web podle šablony, rezervace, hosting, měsíční kontroly a až hodina úprav.', hub: 'FastMedia.Pro', hubSub: 'Jeden centrální systém', cta: 'Naplánovat můj web',
    cards: [['Web ve 3 jazycích', 'Čeština, angličtina, němčina a technické SEO.'], ['Online rezervace', 'Zákazníci si rezervují termín 24/7.'], ['Poptávky do mobilu', 'Okamžité upozornění a napojení na CRM.'], ['Místní vyhledávání', 'Připraveno pro Google a Seznam ve vašem okolí.']] },
  en: { k: 'How it works', t: 'One FastMedia system. Everything your website needs.', s: 'For €20/month: template website, bookings, hosting, monthly checks and up to one hour of edits.', hub: 'FastMedia.Pro', hubSub: 'One central system', cta: "Let's plan my website",
    cards: [['Trilingual website', 'Czech, English, German and technical SEO.'], ['Online bookings', 'Customers book a slot 24/7.'], ['Enquiries to your phone', 'Instant alerts and CRM sync.'], ['Local search ready', 'Set up for Google and Seznam in your area.']] },
  de: { k: 'So funktioniert es', t: 'Ein FastMedia-System. Alles, was Ihre Website braucht.', s: 'Für 20 €/Monat: Template-Website, Buchungen, Hosting, monatliche Checks und bis zu einer Stunde Änderungen.', hub: 'FastMedia.Pro', hubSub: 'Ein zentrales System', cta: 'Meine Website planen',
    cards: [['Dreisprachige Website', 'Tschechisch, Englisch, Deutsch und technisches SEO.'], ['Online-Buchungen', 'Kunden buchen rund um die Uhr.'], ['Anfragen aufs Handy', 'Sofortige Benachrichtigung und CRM-Sync.'], ['Lokale Suche', 'Vorbereitet für Google und Seznam vor Ort.']] },
};
const ICONS = [Globe, CalendarCheck, BellRing, MapPin];

const EngineDiagram = () => {
  const { language } = useLanguage();
  const c = copy[(language as L)] ?? copy.cs;
  return (
    <section aria-labelledby="engine-title" className="py-16 lg:py-24 bg-muted/30">
      <style>{`@keyframes fm-dash{to{stroke-dashoffset:-24}}@keyframes fm-wave{to{transform:translateX(-50%)}}
        .fm-dash{animation:fm-dash 1.2s linear infinite}.fm-wave{animation:fm-wave 6s linear infinite}
        @media (prefers-reduced-motion:reduce){.fm-dash,.fm-wave{animation:none}}`}</style>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{c.k}</span>
          <h2 id="engine-title" className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3 mb-3">{c.t}</h2>
          <p className="text-muted-foreground text-lg">{c.s}</p>
        </div>

        <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-accent/40 bg-primary p-6 text-center shadow-glow">
          <svg aria-hidden className="absolute inset-x-0 bottom-0 h-16 w-[200%] fm-wave text-accent/40" viewBox="0 0 800 60" preserveAspectRatio="none">
            <path d="M0 30 Q50 0 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M0 40 Q50 15 100 40 T200 40 T300 40 T400 40 T500 40 T600 40 T700 40 T800 40" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
          </svg>
          <p className="relative font-display text-2xl font-bold text-primary-foreground">{c.hub}</p>
          <p className="relative text-sm text-primary-foreground/80">{c.hubSub}</p>
        </div>

        <svg aria-hidden className="hidden lg:block mx-auto h-16 w-full max-w-5xl text-accent" viewBox="0 0 1000 64" preserveAspectRatio="none">
          {[125, 375, 625, 875].map(x => (
            <path key={x} className="fm-dash" d={`M500 0 C500 32 ${x} 32 ${x} 64`} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          ))}
        </svg>
        <div className="lg:hidden mx-auto my-3 h-10 w-px border-l-2 border-dashed border-accent" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {c.cards.map(([title, text], i) => {
            const Icon = ICONS[i];
            return (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-1">
                <Icon className="h-6 w-6 text-accent mb-3" aria-hidden />
                <h3 className="font-display font-bold text-card-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{text}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/business" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-md hover:shadow-glow transition-shadow">
            {c.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EngineDiagram;
