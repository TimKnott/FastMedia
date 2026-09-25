// Industry landing pages. "Customer questions" are the questions these
// businesses' own customers typically ask online — phrased as FAQs, not
// testimonials. No invented reviews, figures or clients.

type Lang = 'cs' | 'en';
interface QA { q: string; a: string }
interface Copy {
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  problems: string[];
  features: string[];
  faqTitle: string;
  faq: QA[];
}
export interface IndustryLanding {
  slug: string;
  trade?: string;
  seoTitle: string;
  seoDescription: string;
  cs: Copy;
  en: Copy;
}

export const industryLandings: IndustryLanding[] = [
  {
    slug: 'plumbers',
    trade: 'plumbing',
    seoTitle: 'Websites for Plumbers | FastMedia.Pro',
    seoDescription: 'Websites for plumbers that answer customer questions, show prices clearly and turn emergency searches into booked jobs. Czech and English.',
    cs: {
      name: 'Instalatéři',
      eyebrow: 'Weby pro instalatéry',
      headline: 'Web, který promění „instalatér ihned“ v zakázku',
      intro: 'Zákazník s tekoucím kohoutkem nečte dlouhé texty. Chce vědět, jestli přijedete, kdy a za kolik. Postavíme vám web, který na to odpoví během pár vteřin.',
      problems: ['Zákazníci volají konkurenci, protože u vás nenajdou cenu ani dostupnost', 'Poptávky přicházejí bez fotek a adresy', 'Web se na mobilu špatně ovládá'],
      features: ['Tlačítko „Zavolat hned“ a WhatsApp na mobilu', 'Orientační ceník a výjezdné', 'Poptávkový formulář s fotkou závady', 'Mapa oblasti, kde působíte', 'Online rezervace termínu'],
      faqTitle: 'Na co se ptají vaši zákazníci',
      faq: [
        { q: 'Kolik stojí výjezd instalatéra?', a: 'Na webu zobrazíme váš výjezdný poplatek a orientační ceny běžných oprav, aby zákazník věděl, co čekat.' },
        { q: 'Přijedete ještě dnes?', a: 'Web může ukazovat vaši dostupnost a nabídnout havarijní linku, pokud ji poskytujete.' },
        { q: 'Působíte i v mé obci?', a: 'Seznam obcí a mapa oblasti odpoví dřív, než zákazník musí volat.' },
        { q: 'Můžu poslat fotku závady?', a: 'Ano — formulář umožní nahrát fotku, takže přijedete se správným dílem.' },
      ],
    },
    en: {
      name: 'Plumbers',
      eyebrow: 'Websites for plumbers',
      headline: 'A website that turns “plumber near me” into booked jobs',
      intro: 'Someone with a leaking tap does not read long pages. They want to know whether you can come, when and roughly what it costs. We build a site that answers that in seconds.',
      problems: ['Customers call a competitor because your price or availability is not shown', 'Enquiries arrive without photos or an address', 'The site is awkward to use on a phone'],
      features: ['“Call now” and WhatsApp buttons on mobile', 'Guide prices and call-out fee', 'Enquiry form with a photo of the problem', 'Map of the area you cover', 'Online appointment booking'],
      faqTitle: 'What your customers ask',
      faq: [
        { q: 'How much is a plumber call-out?', a: 'Your site shows your call-out fee and guide prices for common repairs, so customers know what to expect.' },
        { q: 'Can you come today?', a: 'The site can show your availability and an emergency line if you offer one.' },
        { q: 'Do you cover my area?', a: 'A list of towns and a coverage map answers this before the customer has to ring.' },
        { q: 'Can I send a photo of the problem?', a: 'Yes — the form accepts a photo, so you arrive with the right parts.' },
      ],
    },
  },
  {
    slug: 'electricians',
    trade: 'electrical',
    seoTitle: 'Websites for Electricians | FastMedia.Pro',
    seoDescription: 'Websites for electricians that explain services, qualifications and prices clearly and make it easy to request a quote or inspection.',
    cs: {
      name: 'Elektrikáři',
      eyebrow: 'Weby pro elektrikáře',
      headline: 'Web, díky kterému vám zákazník důvěřuje dřív, než zavolá',
      intro: 'U elektřiny jde o bezpečí. Zákazník chce vidět vaši kvalifikaci, co přesně děláte a jak rychle se ozvete. Postavíme web, který to ukáže jasně.',
      problems: ['Zákazník neví, jestli děláte revize, rozvaděče nebo jen drobné opravy', 'Chybí informace o oprávnění', 'Poptávky se ztrácejí v e-mailu'],
      features: ['Přehled služeb: opravy, rozvody, revize, nabíječky', 'Sekce s vaším oprávněním a pojištěním', 'Formulář pro nacenění s fotkami', 'Online rezervace revize', 'Kontaktní tlačítka na mobilu'],
      faqTitle: 'Na co se ptají vaši zákazníci',
      faq: [
        { q: 'Děláte revize elektroinstalace?', a: 'Web jasně uvede, zda revize provádíte, pro jaké objekty a jak si termín objednat.' },
        { q: 'Máte potřebné oprávnění?', a: 'Vaše oprávnění a pojištění ukážeme na viditelném místě — uvádíme jen to, co doložíte.' },
        { q: 'Kolik stojí instalace nabíječky pro elektromobil?', a: 'Orientační cenu a postup ukážeme přímo na stránce služby.' },
        { q: 'Jak rychle se ozvete?', a: 'Formulář potvrdí přijetí poptávky a web uvede, do kdy se obvykle ozvete.' },
      ],
    },
    en: {
      name: 'Electricians',
      eyebrow: 'Websites for electricians',
      headline: 'A website that earns trust before the customer even calls',
      intro: 'Electrical work is about safety. Customers want to see your qualifications, exactly what you do and how quickly you reply. We build a site that shows this clearly.',
      problems: ['Customers cannot tell whether you do inspections, rewires or only small repairs', 'Your qualifications are not shown', 'Enquiries get lost in email'],
      features: ['Clear service list: repairs, rewiring, inspections, EV chargers', 'A section for your qualifications and insurance', 'Quote form with photos', 'Online inspection booking', 'Contact buttons on mobile'],
      faqTitle: 'What your customers ask',
      faq: [
        { q: 'Do you carry out electrical inspections?', a: 'The site states clearly whether you do inspections, for which properties and how to book one.' },
        { q: 'Are you qualified and insured?', a: 'Your qualifications and insurance are shown prominently — we only list what you can evidence.' },
        { q: 'How much does an EV charger installation cost?', a: 'A guide price and the steps involved appear on the service page.' },
        { q: 'How quickly will you reply?', a: 'The form confirms receipt and the site states your usual response time.' },
      ],
    },
  },
  {
    slug: 'small-service-businesses',
    seoTitle: 'Websites for Small Service Businesses | FastMedia.Pro',
    seoDescription: 'Websites for cleaners, handymen, salons, gardeners and other local service businesses — clear prices, online booking and a simple contact path.',
    cs: {
      name: 'Malé servisní firmy',
      eyebrow: 'Weby pro malé firmy a živnostníky',
      headline: 'Jednoduchý web, který vám přivádí zákazníky',
      intro: 'Úklid, hodinový manžel, kadeřnictví, zahradník — zákazník chce vědět, co nabízíte, kolik to stojí a jak si vás objednat. Nic víc, nic míň.',
      problems: ['Zákazníci vás najdou jen přes známé', 'Pořád odpovídáte na stejné dotazy po telefonu', 'Nemáte čas řešit technické věci'],
      features: ['Přehledný ceník služeb', 'Online rezervace a připomínky', 'Časté dotazy, které ušetří telefonáty', 'Profil na Google Mapách propojený s webem', 'Česká i anglická verze'],
      faqTitle: 'Na co se ptají vaši zákazníci',
      faq: [
        { q: 'Kolik stojí vaše služby?', a: 'Ceník na webu odpoví okamžitě a zákazník přichází s jasným očekáváním.' },
        { q: 'Můžu se objednat online?', a: 'Ano — rezervační kalendář ukáže volné termíny a pošle připomínku.' },
        { q: 'Kde vás najdu a kdy máte otevřeno?', a: 'Adresu, mapu a otevírací dobu zobrazíme na každé stránce.' },
        { q: 'Mluvíte anglicky?', a: 'Anglická verze webu osloví i cizince žijící ve vašem okolí.' },
      ],
    },
    en: {
      name: 'Small service businesses',
      eyebrow: 'Websites for small local businesses',
      headline: 'A simple website that brings you customers',
      intro: 'Cleaners, handymen, salons, gardeners — customers want to know what you offer, what it costs and how to book. Nothing more, nothing less.',
      problems: ['Customers only find you by word of mouth', 'You keep answering the same questions by phone', 'You have no time for technical work'],
      features: ['Clear price list', 'Online booking with reminders', 'FAQs that save phone calls', 'Google Maps profile linked to your site', 'Czech and English versions'],
      faqTitle: 'What your customers ask',
      faq: [
        { q: 'How much do your services cost?', a: 'A price list on the site answers instantly, so customers arrive with clear expectations.' },
        { q: 'Can I book online?', a: 'Yes — a booking calendar shows free slots and sends a reminder.' },
        { q: 'Where are you and when are you open?', a: 'Your address, map and opening hours appear on every page.' },
        { q: 'Do you speak English?', a: 'An English version reaches expats living near you.' },
      ],
    },
  },
];

export const getIndustryLanding = (slug?: string) => industryLandings.find((i) => i.slug === slug);
export type { Lang };
