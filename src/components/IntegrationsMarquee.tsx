import { useLanguage } from '@/contexts/LanguageContext';

// Only tools FastMedia.Pro actually uses or connects to — no implied client relationships.
const ROWS: string[][] = [
  ['Stripe', 'Apple Pay', 'Google Pay', 'Online booking calendar', 'Invoices & reminders', 'Customer portal'],
  ['Google Search Console', 'Google Analytics 4', 'Seznam.cz', 'Sklik', 'Google Ads', 'Schema.org', 'OpenStreetMap', 'Kreativní Česko'],
  ['Flowlu CRM', 'WhatsApp', 'Google Workspace', 'Twilio', 'ElevenLabs voice', 'Installable app (PWA)', 'CZ · EN · DE'],
];

const copy = {
  cs: { k: 'Propojení', t: 'FastMedia.Pro propojí váš web s nástroji, které už používáte', s: 'Platby, vyhledávání, CRM a komunikace – vše napojené na jeden systém FastMedia.' },
  en: { k: 'Integrations', t: 'FastMedia.Pro connects your website to the tools you already use', s: 'Payments, search, CRM and messaging – all wired into one FastMedia system.' },
  de: { k: 'Integrationen', t: 'FastMedia.Pro verbindet Ihre Website mit Ihren gewohnten Tools', s: 'Zahlungen, Suche, CRM und Kommunikation – alles in einem FastMedia-System.' },
};

const IntegrationsMarquee = () => {
  const { language } = useLanguage();
  const c = copy[(language as keyof typeof copy)] ?? copy.cs;
  return (
    <section aria-labelledby="integrations-title" className="py-16 lg:py-24 bg-background overflow-hidden">
      <style>{`@keyframes fm-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .fm-marq{animation:fm-marq var(--d,40s) linear infinite}
        .fm-marq-wrap:hover .fm-marq{animation-play-state:paused}
        @media (prefers-reduced-motion:reduce){.fm-marq{animation:none}}`}</style>
      <div className="container mx-auto px-4 text-center max-w-3xl mb-10">
        <span className="text-accent font-semibold text-sm uppercase tracking-wider">{c.k}</span>
        <h2 id="integrations-title" className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-3 mb-3">{c.t}</h2>
        <p className="text-muted-foreground text-lg">{c.s}</p>
      </div>
      <div className="fm-marq-wrap space-y-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {ROWS.map((row, i) => (
          <div key={i} className="flex w-max fm-marq" style={{ ['--d' as string]: `${36 + i * 8}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
            {[...row, ...row].map((name, j) => (
              <span key={j} aria-hidden={j >= row.length} className="mx-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />{name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default IntegrationsMarquee;
