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
