import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'cs' | 'en' | 'de';

interface Translations {
  [key: string]: {
    cs: string;
    en: string;
    de: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.home': { cs: 'Domů', en: 'Home', de: 'Startseite' },
  'nav.demos': { cs: 'Ukázky', en: 'Demos', de: 'Demos' },
  'nav.services': { cs: 'Služby', en: 'Services', de: 'Dienstleistungen' },
  'nav.reviews': { cs: 'Recenze', en: 'Reviews', de: 'Bewertungen' },
  'nav.contact': { cs: 'Kontakt', en: 'Contact', de: 'Kontakt' },
  'nav.book': { cs: 'Rezervovat konzultaci', en: 'Book Consultation', de: 'Beratung buchen' },

  // Hero
  'hero.title': { cs: 'Profesionální weby pro řemeslníky', en: 'Professional Websites for Tradespeople', de: 'Professionelle Websites für Handwerker' },
  'hero.subtitle': { cs: 'Získejte moderní webové stránky pro vaše podnikání během několika dní. Bez starostí, bez technických znalostí.', en: 'Get a modern website for your business in days. No hassle, no technical knowledge required.', de: 'Erhalten Sie in wenigen Tagen eine moderne Website für Ihr Unternehmen. Ohne Aufwand, ohne technische Kenntnisse.' },
  'hero.cta': { cs: 'Prohlédnout ukázky', en: 'Browse Demos', de: 'Demos ansehen' },
  'hero.cta2': { cs: 'Objednat konzultaci', en: 'Book Consultation', de: 'Beratung buchen' },

  // Services Section
  'services.title': { cs: 'Pro všechny řemeslníky', en: 'For All Tradespeople', de: 'Für alle Handwerker' },
  'services.subtitle': { cs: 'Nabízíme webové stránky pro širokou škálu řemesel a služeb', en: 'We offer websites for a wide range of trades and services', de: 'Wir bieten Websites für eine Vielzahl von Gewerken und Dienstleistungen' },

  // Demos Section
  'demos.title': { cs: 'Prohlédněte si naše ukázky', en: 'Explore Our Demos', de: 'Entdecken Sie unsere Demos' },
  'demos.subtitle': { cs: 'Klikněte na jakoukoli ukázku a představte si svůj vlastní web', en: 'Click any demo and imagine your own website', de: 'Klicken Sie auf eine Demo und stellen Sie sich Ihre eigene Website vor' },
  'demos.explore': { cs: 'Prozkoumat', en: 'Explore', de: 'Entdecken' },

  // Reviews Section
  'reviews.title': { cs: 'Co říkají naši klienti', en: 'What Our Clients Say', de: 'Was unsere Kunden sagen' },
  'reviews.subtitle': { cs: 'Přečtěte si recenze od spokojených zákazníků', en: 'Read reviews from satisfied customers', de: 'Lesen Sie Bewertungen von zufriedenen Kunden' },

  // Booking Section
  'booking.title': { cs: 'Zarezervujte si bezplatnou konzultaci', en: 'Book a Free Consultation', de: 'Buchen Sie eine kostenlose Beratung' },
  'booking.subtitle': { cs: 'Probereme vaše potřeby a najdeme ideální řešení', en: 'We\'ll discuss your needs and find the perfect solution', de: 'Wir besprechen Ihre Anforderungen und finden die perfekte Lösung' },
  'booking.name': { cs: 'Vaše jméno', en: 'Your Name', de: 'Ihr Name' },
  'booking.email': { cs: 'E-mail', en: 'Email', de: 'E-Mail' },
  'booking.phone': { cs: 'Telefon', en: 'Phone', de: 'Telefon' },
  'booking.trade': { cs: 'Obor podnikání', en: 'Your Trade', de: 'Ihr Gewerk' },
  'booking.message': { cs: 'Vaše zpráva', en: 'Your Message', de: 'Ihre Nachricht' },
  'booking.submit': { cs: 'Odeslat žádost', en: 'Send Request', de: 'Anfrage senden' },
  'booking.success': { cs: 'Děkujeme! Ozveme se vám co nejdříve.', en: 'Thank you! We\'ll contact you soon.', de: 'Vielen Dank! Wir werden Sie bald kontaktieren.' },

  // Pricing
  'pricing.label': { cs: 'Ceník', en: 'Pricing', de: 'Preise' },
  'pricing.title': { cs: 'Vyberte si balíček', en: 'Choose Your Package', de: 'Wählen Sie Ihr Paket' },
  'pricing.subtitle': { cs: 'Transparentní ceny bez skrytých poplatků', en: 'Transparent pricing with no hidden fees', de: 'Transparente Preise ohne versteckte Gebühren' },
  'pricing.popular': { cs: 'Nejoblíbenější', en: 'Most Popular', de: 'Beliebteste' },
  'pricing.cta': { cs: 'Objednat', en: 'Get Started', de: 'Loslegen' },
  'pricing.starter.name': { cs: 'Starter', en: 'Starter', de: 'Starter' },
  'pricing.starter.price': { cs: '4 990 Kč', en: '4 990 Kč', de: '4 990 Kč' },
  'pricing.starter.desc': { cs: 'Jednoduchý web pro začátek', en: 'Simple website to get started', de: 'Einfache Website zum Starten' },
  'pricing.starter.features': { cs: 'Jednostránkový web|Responzivní design|Kontaktní formulář|Základní SEO|1 revize', en: 'Single page website|Responsive design|Contact form|Basic SEO|1 revision', de: 'Einseitige Website|Responsives Design|Kontaktformular|Basis SEO|1 Revision' },
  'pricing.basic.name': { cs: 'Basic', en: 'Basic', de: 'Basic' },
  'pricing.basic.price': { cs: '9 990 Kč', en: '9 990 Kč', de: '9 990 Kč' },
  'pricing.basic.desc': { cs: 'Profesionální prezentace', en: 'Professional presentation', de: 'Professionelle Präsentation' },
  'pricing.basic.features': { cs: 'Až 5 stránek|Responzivní design|Kontaktní formulář|Pokročilé SEO|Galerie prací|3 revize', en: 'Up to 5 pages|Responsive design|Contact form|Advanced SEO|Project gallery|3 revisions', de: 'Bis zu 5 Seiten|Responsives Design|Kontaktformular|Erweitertes SEO|Projektgalerie|3 Revisionen' },
  'pricing.pro.name': { cs: 'Professional', en: 'Professional', de: 'Professional' },
  'pricing.pro.price': { cs: '19 990 Kč', en: '19 990 Kč', de: '19 990 Kč' },
  'pricing.pro.desc': { cs: 'Kompletní řešení pro firmu', en: 'Complete business solution', de: 'Komplettlösung für Unternehmen' },
  'pricing.pro.features': { cs: 'Až 10 stránek|Prémiový design|Rezervační systém|Pokročilé SEO|Galerie + reference|Google Analytics|5 revizí|Prioritní podpora', en: 'Up to 10 pages|Premium design|Booking system|Advanced SEO|Gallery + testimonials|Google Analytics|5 revisions|Priority support', de: 'Bis zu 10 Seiten|Premium-Design|Buchungssystem|Erweitertes SEO|Galerie + Referenzen|Google Analytics|5 Revisionen|Prioritärer Support' },
  'pricing.enterprise.name': { cs: 'Enterprise', en: 'Enterprise', de: 'Enterprise' },
  'pricing.enterprise.price': { cs: 'Na míru', en: 'Custom', de: 'Individuell' },
  'pricing.enterprise.desc': { cs: 'Individuální řešení na klíč', en: 'Custom turnkey solution', de: 'Individuelle Schlüssellösung' },
  'pricing.enterprise.features': { cs: 'Neomezené stránky|Vlastní design|E-shop integrace|CMS systém|Vícejazyčnost|Dedikovaný manažer|Neomezené revize|24/7 podpora', en: 'Unlimited pages|Custom design|E-shop integration|CMS system|Multi-language|Dedicated manager|Unlimited revisions|24/7 support', de: 'Unbegrenzte Seiten|Individuelles Design|E-Shop-Integration|CMS-System|Mehrsprachigkeit|Dedizierter Manager|Unbegrenzte Revisionen|24/7 Support' },

  // Footer
  'footer.rights': { cs: 'Všechna práva vyhrazena', en: 'All rights reserved', de: 'Alle Rechte vorbehalten' },
  'footer.privacy': { cs: 'Ochrana osobních údajů', en: 'Privacy Policy', de: 'Datenschutz' },
  'footer.terms': { cs: 'Obchodní podmínky', en: 'Terms of Service', de: 'Nutzungsbedingungen' },

  // Demo pages
  'demo.back': { cs: 'Zpět na FastMedia.Pro', en: 'Back to FastMedia.Pro', de: 'Zurück zu FastMedia.Pro' },
  'demo.contact': { cs: 'Kontaktujte nás', en: 'Contact Us', de: 'Kontaktieren Sie uns' },
  'demo.about': { cs: 'O nás', en: 'About Us', de: 'Über uns' },
  'demo.services': { cs: 'Naše služby', en: 'Our Services', de: 'Unsere Dienstleistungen' },
  'demo.callnow': { cs: 'Zavolejte nyní', en: 'Call Now', de: 'Jetzt anrufen' },
  'demo.getquote': { cs: 'Získat nabídku', en: 'Get Quote', de: 'Angebot erhalten' },

  // Trades
  'trade.plumbing': { cs: 'Instalatérství', en: 'Plumbing', de: 'Klempnerei' },
  'trade.electrical': { cs: 'Elektrikářské práce', en: 'Electrical Services', de: 'Elektroinstallationen' },
  'trade.building': { cs: 'Stavebnictví', en: 'Construction', de: 'Bauwesen' },
  'trade.roofing': { cs: 'Pokrývačství', en: 'Roofing', de: 'Dachdecker' },
  'trade.drywall': { cs: 'Sádrokarton', en: 'Drywall', de: 'Trockenbau' },
  'trade.wells': { cs: 'Studnařství', en: 'Well Services', de: 'Brunnenbau' },
  'trade.heating': { cs: 'Topenářství', en: 'Heating', de: 'Heizungsbau' },
  'trade.solar': { cs: 'Solární panely', en: 'Solar Panels', de: 'Solaranlagen' },
  'trade.heatpumps': { cs: 'Tepelná čerpadla', en: 'Heat Pumps', de: 'Wärmepumpen' },
  'trade.painting': { cs: 'Malířství', en: 'Painting', de: 'Malerarbeiten' },
  'trade.interior': { cs: 'Interiéry', en: 'Interior Design', de: 'Innenarchitektur' },
  'trade.exterior': { cs: 'Fasády a exteriéry', en: 'Facades & Exterior', de: 'Fassaden & Außen' },
  'trade.gardening': { cs: 'Zahradnictví', en: 'Landscaping', de: 'Gartengestaltung' },
  'trade.cleaning': { cs: 'Úklidové služby', en: 'Cleaning Services', de: 'Reinigungsdienste' },
  'trade.locksmith': { cs: 'Zámečnictví', en: 'Locksmith', de: 'Schlosserei' },
  'trade.carpentry': { cs: 'Truhlářství', en: 'Carpentry', de: 'Tischlerei' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('cs');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation['cs'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
