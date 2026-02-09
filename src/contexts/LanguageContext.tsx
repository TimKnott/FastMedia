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
  'nav.pricing': { cs: 'Ceník', en: 'Pricing', de: 'Preise' },
  'nav.faq': { cs: 'FAQ', en: 'FAQ', de: 'FAQ' },
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
  'pricing.starter.hosting': { cs: '1 500 Kč/měs.', en: '1 500 Kč/mo', de: '1 500 Kč/Mon.' },
  'pricing.starter.desc': { cs: 'Jednoduchý web pro začátek', en: 'Simple website to get started', de: 'Einfache Website zum Starten' },
  'pricing.starter.features': { cs: 'Jednostránkový web|Responzivní design|Kontaktní formulář|Základní SEO|1 revize', en: 'Single page website|Responsive design|Contact form|Basic SEO|1 revision', de: 'Einseitige Website|Responsives Design|Kontaktformular|Basis SEO|1 Revision' },
  'pricing.basic.name': { cs: 'Basic', en: 'Basic', de: 'Basic' },
  'pricing.basic.price': { cs: '9 990 Kč', en: '9 990 Kč', de: '9 990 Kč' },
  'pricing.basic.hosting': { cs: '2 000 Kč/měs.', en: '2 000 Kč/mo', de: '2 000 Kč/Mon.' },
  'pricing.basic.desc': { cs: 'Profesionální prezentace', en: 'Professional presentation', de: 'Professionelle Präsentation' },
  'pricing.basic.features': { cs: 'Až 5 stránek|Responzivní design|Kontaktní formulář|Pokročilé SEO|Galerie prací|3 revize', en: 'Up to 5 pages|Responsive design|Contact form|Advanced SEO|Project gallery|3 revisions', de: 'Bis zu 5 Seiten|Responsives Design|Kontaktformular|Erweitertes SEO|Projektgalerie|3 Revisionen' },
  'pricing.pro.name': { cs: 'Professional', en: 'Professional', de: 'Professional' },
  'pricing.pro.price': { cs: '19 990 Kč', en: '19 990 Kč', de: '19 990 Kč' },
  'pricing.pro.hosting': { cs: '3 500 Kč/měs.', en: '3 500 Kč/mo', de: '3 500 Kč/Mon.' },
  'pricing.pro.desc': { cs: 'Kompletní řešení pro firmu', en: 'Complete business solution', de: 'Komplettlösung für Unternehmen' },
  'pricing.pro.features': { cs: 'Až 10 stránek|Prémiový design|Rezervační systém|Pokročilé SEO|Galerie + reference|Google Analytics|5 revizí|Prioritní podpora', en: 'Up to 10 pages|Premium design|Booking system|Advanced SEO|Gallery + testimonials|Google Analytics|5 revisions|Priority support', de: 'Bis zu 10 Seiten|Premium-Design|Buchungssystem|Erweitertes SEO|Galerie + Referenzen|Google Analytics|5 Revisionen|Prioritärer Support' },
  'pricing.enterprise.name': { cs: 'Enterprise', en: 'Enterprise', de: 'Enterprise' },
  'pricing.enterprise.price': { cs: 'Na míru', en: 'Custom', de: 'Individuell' },
  'pricing.enterprise.hosting': { cs: '5 000 Kč/měs.', en: '5 000 Kč/mo', de: '5 000 Kč/Mon.' },
  'pricing.enterprise.desc': { cs: 'Individuální řešení na klíč', en: 'Custom turnkey solution', de: 'Individuelle Schlüssellösung' },
  'pricing.enterprise.features': { cs: 'Neomezené stránky|Vlastní design|E-shop integrace|CMS systém|Vícejazyčnost|Dedikovaný manažer|Neomezené revize|24/7 podpora', en: 'Unlimited pages|Custom design|E-shop integration|CMS system|Multi-language|Dedicated manager|Unlimited revisions|24/7 support', de: 'Unbegrenzte Seiten|Individuelles Design|E-Shop-Integration|CMS-System|Mehrsprachigkeit|Dedizierter Manager|Unbegrenzte Revisionen|24/7 Support' },
  'pricing.hosting.label': { cs: 'Hosting', en: 'Hosting', de: 'Hosting' },

  // FAQ
  'faq.label': { cs: 'FAQ', en: 'FAQ', de: 'FAQ' },
  'faq.title': { cs: 'Často kladené otázky', en: 'Frequently Asked Questions', de: 'Häufig gestellte Fragen' },
  'faq.subtitle': { cs: 'Odpovědi na nejčastější dotazy o našich službách', en: 'Answers to the most common questions about our services', de: 'Antworten auf die häufigsten Fragen zu unseren Dienstleistungen' },
  'faq.q1': { cs: 'Jak dlouho trvá vytvoření webu?', en: 'How long does it take to build a website?', de: 'Wie lange dauert die Erstellung einer Website?' },
  'faq.a1': { cs: 'Většinu webů dodáváme do 5–10 pracovních dní od schválení návrhu. Složitější projekty (Enterprise) mohou trvat 2–4 týdny.', en: 'Most websites are delivered within 5–10 business days after design approval. More complex projects (Enterprise) may take 2–4 weeks.', de: 'Die meisten Websites werden innerhalb von 5–10 Werktagen nach Designfreigabe geliefert. Komplexere Projekte (Enterprise) können 2–4 Wochen dauern.' },
  'faq.q2': { cs: 'Co potřebuji dodat na začátku?', en: 'What do I need to provide to get started?', de: 'Was muss ich zu Beginn bereitstellen?' },
  'faq.a2': { cs: 'Stačí nám logo, fotky vašich prací, kontaktní údaje a popis služeb. S obsahem vám rádi pomůžeme.', en: 'Just your logo, photos of your work, contact details, and service descriptions. We\'re happy to help with content.', de: 'Nur Ihr Logo, Fotos Ihrer Arbeit, Kontaktdaten und Leistungsbeschreibungen. Wir helfen gerne beim Inhalt.' },
  'faq.q3': { cs: 'Jsou v ceně zahrnuty i texty a fotky?', en: 'Are texts and photos included in the price?', de: 'Sind Texte und Fotos im Preis enthalten?' },
  'faq.a3': { cs: 'Základní texty připravíme za vás. Profesionální fotografie nejsou zahrnuty, ale doporučíme vám osvědčené fotografy.', en: 'We prepare basic texts for you. Professional photography is not included, but we can recommend trusted photographers.', de: 'Wir erstellen grundlegende Texte für Sie. Professionelle Fotografie ist nicht enthalten, aber wir empfehlen bewährte Fotografen.' },
  'faq.q4': { cs: 'Mohu si web později upravovat sám?', en: 'Can I edit the website myself later?', de: 'Kann ich die Website später selbst bearbeiten?' },
  'faq.a4': { cs: 'Ano, u balíčků s CMS systémem (Enterprise) můžete obsah upravovat sami. U ostatních balíčků provádíme úpravy za vás.', en: 'Yes, with CMS packages (Enterprise) you can edit content yourself. For other packages, we handle updates for you.', de: 'Ja, bei CMS-Paketen (Enterprise) können Sie den Inhalt selbst bearbeiten. Bei anderen Paketen übernehmen wir die Aktualisierungen.' },
  'faq.q5': { cs: 'Je v ceně i doména a hosting?', en: 'Is domain and hosting included?', de: 'Sind Domain und Hosting inklusive?' },
  'faq.a5': { cs: 'Doména a hosting nejsou zahrnuty v jednorázové ceně, ale rádi vám je zajistíme. Roční náklady na hosting se pohybují od 1 200 Kč.', en: 'Domain and hosting are not included in the one-time price, but we\'re happy to arrange them. Annual hosting costs start from 1,200 Kč.', de: 'Domain und Hosting sind nicht im Einmalpreis enthalten, aber wir arrangieren sie gerne. Die jährlichen Hosting-Kosten beginnen bei 1.200 Kč.' },
  'faq.q6': { cs: 'Co když nebudu spokojený s návrhem?', en: 'What if I\'m not satisfied with the design?', de: 'Was ist, wenn ich mit dem Design nicht zufrieden bin?' },
  'faq.a6': { cs: 'Každý balíček zahrnuje revize (1–5 podle typu). Než začneme programovat, schválíte si návrh, takže vždy víte, co dostanete.', en: 'Each package includes revisions (1–5 depending on tier). You approve the design before we start coding, so you always know what you\'ll get.', de: 'Jedes Paket beinhaltet Revisionen (1–5 je nach Stufe). Sie genehmigen das Design, bevor wir mit der Programmierung beginnen.' },
  'faq.q7': { cs: 'Nabízíte i údržbu webu?', en: 'Do you offer website maintenance?', de: 'Bieten Sie Website-Wartung an?' },
  'faq.a7': { cs: 'Ano, nabízíme měsíční údržbu od 500 Kč/měsíc. Zahrnuje aktualizace, zálohy a drobné úpravy obsahu.', en: 'Yes, we offer monthly maintenance from 500 Kč/month. It includes updates, backups, and minor content changes.', de: 'Ja, wir bieten monatliche Wartung ab 500 Kč/Monat an. Sie umfasst Updates, Backups und kleinere Inhaltsänderungen.' },
  'faq.q8': { cs: 'Jak probíhá platba?', en: 'How does payment work?', de: 'Wie funktioniert die Bezahlung?' },
  'faq.a8': { cs: 'Platba probíhá ve dvou částech – 50 % záloha před zahájením a 50 % po dokončení a schválení webu. Akceptujeme bankovní převod i fakturu.', en: 'Payment is split in two – 50% deposit before starting and 50% upon completion and approval. We accept bank transfer and invoice.', de: 'Die Zahlung erfolgt in zwei Teilen – 50 % Anzahlung vor Beginn und 50 % nach Fertigstellung und Freigabe. Wir akzeptieren Banküberweisung und Rechnung.' },

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
