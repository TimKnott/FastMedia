// Service landing pages linked from the animated services scene in the homepage hero.
export interface ServiceLanding {
  slug: string;
  icon: 'Globe2' | 'Bot' | 'CalendarCheck' | 'Gauge' | 'Megaphone' | 'ShieldCheck';
  cs: ServiceCopy;
  en: ServiceCopy;
  seoTitle: string;
  seoDescription: string;
}

interface ServiceCopy {
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  benefits: string[];
  deliverables: string[];
  outcome: string;
}

export const serviceLandings: ServiceLanding[] = [
  {
    slug: 'websites',
    icon: 'Globe2',
    seoTitle: 'High-Converting Websites for Trades & Services | FastMedia.Pro',
    seoDescription:
      'Mobile-first, bilingual websites built to turn visitors into enquiries. Live in about ten days, with copy, imagery and lead capture done for you.',
    cs: {
      name: 'Weby, které získávají zákazníky',
      eyebrow: 'Základ vašeho růstu',
      headline: 'Web, který pracuje jako váš nejlepší obchodník',
      intro:
        'Rychlý, přehledný web postavený na mobil jako první. Každá sekce má jediný úkol — proměnit návštěvníka v poptávku.',
      benefits: [
        'Návrh na míru vašemu oboru, ne šablona bez duše',
        'Načtení pod dvě sekundy i na mobilních datech',
        'Česká i britská anglická verze v jednom webu',
        'Formuláře, telefon a WhatsApp na dosah jednoho kliknutí',
      ],
      deliverables: [
        'Návrh a vývoj kompletního webu',
        'Texty a výběr obrazového materiálu',
        'Nastavení domény, hostingu a zabezpečení',
        'Školení a podpora po spuštění',
      ],
      outcome: 'Typicky spouštíme do deseti pracovních dnů od schválení návrhu.',
    },
    en: {
      name: 'High-converting websites',
      eyebrow: 'The foundation of your growth',
      headline: 'A website that works like your best salesperson',
      intro:
        'A fast, clear, mobile-first website. Every section has one job — turning a visitor into an enquiry.',
      benefits: [
        'Designed around your trade, not a lifeless template',
        'Loads in under two seconds, even on mobile data',
        'Czech and British English in one website',
        'Forms, phone and WhatsApp one tap away',
      ],
      deliverables: [
        'Full design and build',
        'Copywriting and image selection',
        'Domain, hosting and security setup',
        'Training and post-launch support',
      ],
      outcome: 'We typically launch within ten working days of design sign-off.',
    },
  },
  {
    slug: 'ai-lead-assistant',
    icon: 'Bot',
    seoTitle: '24/7 AI Lead Assistant for Your Website | FastMedia.Pro',
    seoDescription:
      'An AI assistant that answers questions, qualifies leads and books jobs while you sleep — trained on your services, prices and availability.',
    cs: {
      name: 'AI asistent pro poptávky 24/7',
      eyebrow: 'Nikdy nepřijdete o poptávku',
      headline: 'Odpovídá zákazníkům i ve tři ráno',
      intro:
        'Asistent vyškolený na vaše služby a ceny odpovídá okamžitě, zjistí rozsah zakázky a předá vám hotovou poptávku.',
      benefits: [
        'Okamžitá odpověď na dotazy zákazníků',
        'Automatické hodnocení kvality poptávky 0–100',
        'Předání do vaší schránky i do administrace',
        'Česky i anglicky, bez čekání na pracovní dobu',
      ],
      deliverables: [
        'Trénink asistenta na vaše služby a ceník',
        'Napojení na web a poptávkové formuláře',
        'Nastavení upozornění a předávání poptávek',
        'Měsíční ladění podle skutečných konverzací',
      ],
      outcome: 'Zákazník dostane odpověď během několika sekund, ne hodin.',
    },
    en: {
      name: '24/7 AI lead assistant',
      eyebrow: 'Never miss another enquiry',
      headline: 'It answers customers at three in the morning',
      intro:
        'An assistant trained on your services and prices replies instantly, scopes the job and hands you a complete enquiry.',
      benefits: [
        'Instant replies to customer questions',
        'Automatic 0–100 lead quality scoring',
        'Delivered to your inbox and admin dashboard',
        'Czech and English, with no waiting for office hours',
      ],
      deliverables: [
        'Assistant trained on your services and pricing',
        'Integration with your site and enquiry forms',
        'Alerts and lead routing setup',
        'Monthly tuning based on real conversations',
      ],
      outcome: 'Customers get an answer in seconds, not hours.',
    },
  },
  {
    slug: 'bookings',
    icon: 'CalendarCheck',
    seoTitle: 'Online Bookings & Automated Follow-Up | FastMedia.Pro',
    seoDescription:
      'Let customers book you online and let automated reminders and follow-ups keep your diary full and your no-shows low.',
    cs: {
      name: 'Rezervace a následná péče',
      eyebrow: 'Plný diář bez telefonování',
      headline: 'Zákazníci si termín rezervují sami',
      intro:
        'Online rezervace napojené na váš kalendář, automatické připomínky a následné oslovení po dokončení zakázky.',
      benefits: [
        'Rezervace 24 hodin denně přímo z webu',
        'Automatické připomínky e-mailem i SMS',
        'Méně zrušených a zapomenutých termínů',
        'Žádost o recenzi po dokončení práce',
      ],
      deliverables: [
        'Rezervační systém a napojení na kalendář',
        'Šablony potvrzení a připomínek',
        'Automatizace následné péče',
        'Přehled rezervací v administraci',
      ],
      outcome: 'Méně administrativy a znatelně méně zrušených schůzek.',
    },
    en: {
      name: 'Bookings & follow-up',
      eyebrow: 'A full diary without phone tag',
      headline: 'Customers book their own slot',
      intro:
        'Online booking wired into your calendar, with automatic reminders and follow-ups once the job is done.',
      benefits: [
        'Bookings taken around the clock from your site',
        'Automatic email and SMS reminders',
        'Fewer cancellations and forgotten appointments',
        'Review requests sent after each completed job',
      ],
      deliverables: [
        'Booking system and calendar integration',
        'Confirmation and reminder templates',
        'Follow-up automation',
        'Booking overview in your admin area',
      ],
      outcome: 'Less admin and noticeably fewer no-shows.',
    },
  },
  {
    slug: 'seo-performance',
    icon: 'Gauge',
    seoTitle: 'SEO & Website Performance That Ranks | FastMedia.Pro',
    seoDescription:
      'Technical SEO, local search and speed work that gets your business found — with monthly reporting you can actually read.',
    cs: {
      name: 'SEO a rychlost',
      eyebrow: 'Ať vás zákazníci najdou',
      headline: 'Být nalezen dřív než konkurence',
      intro:
        'Technické SEO, lokální vyhledávání a optimalizace rychlosti — vše měřené a pravidelně reportované.',
      benefits: [
        'Lokální viditelnost ve vašem městě i okolí',
        'Technické SEO včetně strukturovaných dat',
        'Optimalizace rychlosti a Core Web Vitals',
        'Srozumitelný měsíční report',
      ],
      deliverables: [
        'Kompletní SEO audit a nápravy',
        'Optimalizace obsahu a klíčových slov',
        'Nastavení Google Business Profile',
        'Průběžné sledování pozic',
      ],
      outcome: 'Stabilní růst organické návštěvnosti bez placení za každý klik.',
    },
    en: {
      name: 'SEO & performance',
      eyebrow: 'Get found by ready-to-buy customers',
      headline: 'Be found before your competitors are',
      intro:
        'Technical SEO, local search and speed optimisation — all measured and reported every month.',
      benefits: [
        'Local visibility in your town and surrounding area',
        'Technical SEO including structured data',
        'Speed and Core Web Vitals optimisation',
        'A monthly report written in plain English',
      ],
      deliverables: [
        'Full SEO audit and fixes',
        'Content and keyword optimisation',
        'Google Business Profile setup',
        'Ongoing rank tracking',
      ],
      outcome: 'Steady organic growth without paying for every click.',
    },
  },
  {
    slug: 'campaigns',
    icon: 'Megaphone',
    seoTitle: 'Marketing Campaigns That Convert | FastMedia.Pro',
    seoDescription:
      'Landing pages, email and paid campaigns built around one measurable goal: more enquiries at a lower cost per lead.',
    cs: {
      name: 'Kampaně, které prodávají',
      eyebrow: 'Pozornost proměněná v zakázky',
      headline: 'Kampaně měřené v poptávkách, ne v lajcích',
      intro:
        'Cílené landing pages, e-mailové sekvence a placená reklama napojené na váš web a poptávkový systém.',
      benefits: [
        'Landing page pro každou nabídku',
        'E-mailové sekvence, které dotahují váhavé zájemce',
        'Sledování nákladů na jednu poptávku',
        'Rychlé testování a vyhodnocení',
      ],
      deliverables: [
        'Strategie kampaně a texty',
        'Landing pages a formuláře',
        'Nastavení e-mailových automatizací',
        'Reporting výsledků',
      ],
      outcome: 'Každá koruna má přiřazený výsledek.',
    },
    en: {
      name: 'Campaigns that convert',
      eyebrow: 'Attention turned into work',
      headline: 'Campaigns measured in enquiries, not likes',
      intro:
        'Focused landing pages, email sequences and paid campaigns wired into your website and enquiry system.',
      benefits: [
        'A dedicated landing page for each offer',
        'Email sequences that win back undecided buyers',
        'Cost per enquiry tracked from day one',
        'Fast testing and honest reporting',
      ],
      deliverables: [
        'Campaign strategy and copy',
        'Landing pages and forms',
        'Email automation setup',
        'Results reporting',
      ],
      outcome: 'Every pound and koruna has a result attached to it.',
    },
  },
  {
    slug: 'managed-growth',
    icon: 'ShieldCheck',
    seoTitle: 'Secure, Managed Website Growth & Support | FastMedia.Pro',
    seoDescription:
      'Hosting, security, backups, updates and continuous improvement — your website looked after so you can run your business.',
    cs: {
      name: 'Bezpečný řízený růst',
      eyebrow: 'Web, o který se nemusíte starat',
      headline: 'Hosting, bezpečnost a péče v jednom',
      intro:
        'Spravujeme hosting, aktualizace, zálohy i bezpečnost a web průběžně vylepšujeme podle skutečných dat.',
      benefits: [
        'Denní zálohy a monitoring dostupnosti',
        'Aktualizace zabezpečení a SSL',
        'Průběžné vylepšování podle dat',
        'Podpora s odpovědí do jednoho pracovního dne',
      ],
      deliverables: [
        'Spravovaný hosting a doména',
        'Bezpečnostní monitoring a zálohy',
        'Měsíční úpravy obsahu',
        'Report výkonu a doporučení',
      ],
      outcome: 'Vy se věnujete zakázkám, o web se postaráme my.',
    },
    en: {
      name: 'Secure, managed growth',
      eyebrow: 'A website you never have to worry about',
      headline: 'Hosting, security and care in one place',
      intro:
        'We manage hosting, updates, backups and security, and keep improving the site based on real data.',
      benefits: [
        'Daily backups and uptime monitoring',
        'Security patching and SSL',
        'Continuous improvement driven by data',
        'Support answered within one working day',
      ],
      deliverables: [
        'Managed hosting and domain',
        'Security monitoring and backups',
        'Monthly content updates',
        'Performance reports and recommendations',
      ],
      outcome: 'You focus on the work; we look after the website.',
    },
  },
];

export const getServiceLanding = (slug?: string) =>
  serviceLandings.find((service) => service.slug === slug);
