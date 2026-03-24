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
  'nav.consultant': { cs: 'Konzultantka', en: 'Consultant', de: 'Beraterin' },
  'nav.calculator': { cs: 'Kalkulačka', en: 'Calculator', de: 'Kalkulator' },
  'nav.install': { cs: 'Instalovat aplikaci', en: 'Install App', de: 'App installieren' },
  'nav.inquiry': { cs: 'Poptávka', en: 'Inquiry', de: 'Anfrage' },
  'nav.admin': { cs: 'Přihlášení', en: 'Login', de: 'Anmelden' },

  // Hero — direct answer in first sentence
  'hero.title': {
    cs: 'Weby, které pracují za vás — 24/7',
    en: 'Websites That Work for You — 24/7',
    de: 'Websites, die für Sie arbeiten — 24/7',
  },
  'hero.subtitle': {
    cs: 'FastMedia.Pro vytváří konverzní weby pro řemeslníky a služby. Váš web odpovídá zákazníkům, sbírá poptávky, rezervuje termíny a sjednocuje komunikaci — automaticky, bez vaší účasti.',
    en: 'FastMedia.Pro builds conversion-focused websites for tradespeople and service businesses. Your site answers customer questions, captures leads, books appointments, and unifies communication — automatically, without your involvement.',
    de: 'FastMedia.Pro erstellt konversionsorientierte Websites für Handwerker und Dienstleister. Ihre Website beantwortet Kundenanfragen, erfasst Leads, bucht Termine und vereint die Kommunikation — automatisch, ohne Ihr Zutun.',
  },
  'hero.cta': { cs: 'Bezplatná strategická konzultace', en: 'Book a Free Strategy Call', de: 'Kostenlose Strategieberatung buchen' },
  'hero.cta2': { cs: 'Prohlédnout ukázky oborů', en: 'View Industry Demos', de: 'Branchendemos ansehen' },

  // Services Section — clear intent
  'services.title': {
    cs: 'Weby pro všechny řemeslné obory',
    en: 'Websites for Every Trade and Service',
    de: 'Websites für jedes Gewerk und jeden Dienstleister',
  },
  'services.subtitle': {
    cs: 'Nabízíme profesionální webové stránky přizpůsobené potřebám 37 řemeslných a servisních oborů — od instalatérů po IT služby.',
    en: 'We build professional websites tailored to 37 trade and service industries — from plumbers to IT services.',
    de: 'Wir erstellen professionelle Websites für 37 Handwerks- und Dienstleistungsbranchen — von Klempnern bis IT-Dienstleistern.',
  },

  // Demos Section
  'demos.title': {
    cs: 'Živé ukázky oborových webů',
    en: 'Live Industry Website Demos',
    de: 'Live-Demos für Branchen-Websites',
  },
  'demos.subtitle': {
    cs: 'Prohlédněte si funkční ukázky webů pro konkrétní obory. Každá ukázka ukazuje reálné rozložení, funkce a design, který můžete získat.',
    en: 'Explore fully functional website demos for specific trades. Each demo shows real layout, features, and design you can get.',
    de: 'Entdecken Sie voll funktionsfähige Website-Demos für bestimmte Branchen. Jede Demo zeigt reales Layout, Funktionen und Design.',
  },
  'demos.explore': { cs: 'Prozkoumat', en: 'Explore', de: 'Entdecken' },

  // Reviews Section
  'reviews.title': {
    cs: 'Co říkají naši klienti',
    en: 'What Our Clients Say',
    de: 'Was unsere Kunden sagen',
  },
  'reviews.subtitle': {
    cs: 'Ověřené recenze od řemeslníků a podnikatelů, kteří používají weby od FastMedia.Pro.',
    en: 'Verified reviews from tradespeople and business owners using FastMedia.Pro websites.',
    de: 'Verifizierte Bewertungen von Handwerkern und Unternehmern, die FastMedia.Pro-Websites nutzen.',
  },

  // Booking Section — clear what happens
  'booking.title': {
    cs: 'Zarezervujte si bezplatnou konzultaci',
    en: 'Book a Free Consultation',
    de: 'Buchen Sie eine kostenlose Beratung',
  },
  'booking.subtitle': {
    cs: 'Řekneme vám, co váš web potřebuje, kolik to bude stát, a jak rychle ho dokončíme. Bez závazků.',
    en: 'We\'ll tell you what your website needs, how much it costs, and how fast we can deliver. No obligation.',
    de: 'Wir sagen Ihnen, was Ihre Website braucht, was es kostet und wie schnell wir liefern können. Unverbindlich.',
  },
  'booking.name': { cs: 'Vaše jméno', en: 'Your Name', de: 'Ihr Name' },
  'booking.email': { cs: 'E-mail', en: 'Email', de: 'E-Mail' },
  'booking.phone': { cs: 'Telefon', en: 'Phone', de: 'Telefon' },
  'booking.trade': { cs: 'Obor podnikání', en: 'Your Trade', de: 'Ihr Gewerk' },
  'booking.message': { cs: 'Vaše zpráva', en: 'Your Message', de: 'Ihre Nachricht' },
  'booking.submit': { cs: 'Odeslat žádost', en: 'Send Request', de: 'Anfrage senden' },
  'booking.success': { cs: 'Děkujeme! Ozveme se vám co nejdříve.', en: 'Thank you! We\'ll contact you soon.', de: 'Vielen Dank! Wir werden Sie bald kontaktieren.' },

  // Pricing — direct, factual
  'pricing.label': { cs: 'Ceník', en: 'Pricing', de: 'Preise' },
  'pricing.title': {
    cs: 'Transparentní ceník webových balíčků',
    en: 'Transparent Website Pricing',
    de: 'Transparente Website-Preise',
  },
  'pricing.subtitle': {
    cs: 'Čtyři balíčky od jednoduchého webu po kompletní řešení na klíč. Žádné skryté poplatky.',
    en: 'Four packages from a simple website to a full custom solution. No hidden fees.',
    de: 'Vier Pakete von der einfachen Website bis zur kompletten Individuallösung. Keine versteckten Gebühren.',
  },
  'pricing.popular': { cs: 'Nejoblíbenější', en: 'Most Popular', de: 'Beliebteste' },
  'pricing.cta': { cs: 'Objednat', en: 'Get Started', de: 'Loslegen' },
  'pricing.calculator.hint': { cs: 'Potřebujete něco na míru?', en: 'Need something custom?', de: 'Brauchen Sie etwas Individuelles?' },
  'pricing.calculator.cta': { cs: 'Sestavte si vlastní nabídku', en: 'Build your custom quote', de: 'Erstellen Sie Ihr individuelles Angebot' },
  'pricing.starter.name': { cs: 'Starter', en: 'Starter', de: 'Starter' },
  'pricing.starter.price': { cs: '4 990 Kč', en: '4 990 Kč', de: '4 990 Kč' },
  'pricing.starter.hosting': { cs: '1 500 Kč/měs.', en: '1 500 Kč/mo', de: '1 500 Kč/Mon.' },
  'pricing.starter.desc': { cs: 'Jednoduchý jednostránkový web pro začátek podnikání online.', en: 'A simple single-page website to establish your online presence.', de: 'Eine einfache Einzelseiten-Website für den Einstieg.' },
  'pricing.starter.features': { cs: 'Jednostránkový web|Responzivní design|Kontaktní formulář|Základní SEO|1 revize', en: 'Single page website|Responsive design|Contact form|Basic SEO|1 revision', de: 'Einseitige Website|Responsives Design|Kontaktformular|Basis SEO|1 Revision' },
  'pricing.basic.name': { cs: 'Basic', en: 'Basic', de: 'Basic' },
  'pricing.basic.price': { cs: '9 990 Kč', en: '9 990 Kč', de: '9 990 Kč' },
  'pricing.basic.hosting': { cs: '2 000 Kč/měs.', en: '2 000 Kč/mo', de: '2 000 Kč/Mon.' },
  'pricing.basic.desc': { cs: 'Profesionální web s galerií a pokročilým SEO.', en: 'Professional multi-page website with gallery and advanced SEO.', de: 'Professionelle Mehrseiten-Website mit Galerie und erweitertem SEO.' },
  'pricing.basic.features': { cs: 'Až 5 stránek|Responzivní design|Kontaktní formulář|Pokročilé SEO|Galerie prací|3 revize', en: 'Up to 5 pages|Responsive design|Contact form|Advanced SEO|Project gallery|3 revisions', de: 'Bis zu 5 Seiten|Responsives Design|Kontaktformular|Erweitertes SEO|Projektgalerie|3 Revisionen' },
  'pricing.pro.name': { cs: 'Professional', en: 'Professional', de: 'Professional' },
  'pricing.pro.price': { cs: '19 990 Kč', en: '19 990 Kč', de: '19 990 Kč' },
  'pricing.pro.hosting': { cs: '3 500 Kč/měs.', en: '3 500 Kč/mo', de: '3 500 Kč/Mon.' },
  'pricing.pro.desc': { cs: 'Kompletní firemní řešení s rezervačním systémem a analytikou.', en: 'Complete business solution with booking system and analytics.', de: 'Komplettlösung für Unternehmen mit Buchungssystem und Analytik.' },
  'pricing.pro.features': { cs: 'Až 10 stránek|Prémiový design|Rezervační systém|Pokročilé SEO|Galerie + reference|Google Analytics|5 revizí|Prioritní podpora', en: 'Up to 10 pages|Premium design|Booking system|Advanced SEO|Gallery + testimonials|Google Analytics|5 revisions|Priority support', de: 'Bis zu 10 Seiten|Premium-Design|Buchungssystem|Erweitertes SEO|Galerie + Referenzen|Google Analytics|5 Revisionen|Prioritärer Support' },
  'pricing.enterprise.name': { cs: 'Enterprise', en: 'Enterprise', de: 'Enterprise' },
  'pricing.enterprise.price': { cs: 'Na míru', en: 'Custom', de: 'Individuell' },
  'pricing.enterprise.hosting': { cs: '5 000 Kč/měs.', en: '5 000 Kč/mo', de: '5 000 Kč/Mon.' },
  'pricing.enterprise.desc': { cs: 'Individuální řešení na klíč s CMS, e-shopem a dedikovaným manažerem.', en: 'Custom turnkey solution with CMS, e-shop integration, and dedicated manager.', de: 'Individuelle Schlüssellösung mit CMS, E-Shop-Integration und dediziertem Manager.' },
  'pricing.enterprise.features': { cs: 'Neomezené stránky|Vlastní design|E-shop integrace|CMS systém|Vícejazyčnost|Dedikovaný manažer|Neomezené revize|24/7 podpora', en: 'Unlimited pages|Custom design|E-shop integration|CMS system|Multi-language|Dedicated manager|Unlimited revisions|24/7 support', de: 'Unbegrenzte Seiten|Individuelles Design|E-Shop-Integration|CMS-System|Mehrsprachigkeit|Dedizierter Manager|Unbegrenzte Revisionen|24/7 Support' },
  'pricing.hosting.label': { cs: 'Hosting', en: 'Hosting', de: 'Hosting' },

  // FAQ — questions match user search intent
  'faq.label': { cs: 'FAQ', en: 'FAQ', de: 'FAQ' },
  'faq.title': {
    cs: 'Často kladené otázky',
    en: 'Frequently Asked Questions',
    de: 'Häufig gestellte Fragen',
  },
  'faq.subtitle': {
    cs: 'Odpovědi na nejčastější dotazy o tvorbě webů pro řemeslníky a služby.',
    en: 'Answers to common questions about building websites for tradespeople and service businesses.',
    de: 'Antworten auf häufige Fragen zur Website-Erstellung für Handwerker und Dienstleister.',
  },
  'faq.q1': { cs: 'Jak dlouho trvá vytvoření webu?', en: 'How long does it take to build a website?', de: 'Wie lange dauert die Erstellung einer Website?' },
  'faq.a1': {
    cs: 'Standardní weby dodáváme za 5–10 pracovních dní od schválení návrhu. Komplexní projekty (Enterprise) trvají 2–4 týdny.',
    en: 'Standard websites are delivered within 5–10 business days after design approval. Complex projects (Enterprise) take 2–4 weeks.',
    de: 'Standardwebsites werden innerhalb von 5–10 Werktagen nach Designfreigabe geliefert. Komplexe Projekte (Enterprise) dauern 2–4 Wochen.',
  },
  'faq.q2': { cs: 'Co potřebuji dodat na začátku?', en: 'What do I need to provide to get started?', de: 'Was muss ich zu Beginn bereitstellen?' },
  'faq.a2': {
    cs: 'Logo, fotografie vašich prací, kontaktní údaje a popis služeb. S texty vám pomůžeme.',
    en: 'Your logo, photos of your work, contact details, and service descriptions. We help with copywriting.',
    de: 'Ihr Logo, Fotos Ihrer Arbeit, Kontaktdaten und Leistungsbeschreibungen. Wir helfen beim Texten.',
  },
  'faq.q3': { cs: 'Jsou texty a fotky zahrnuty v ceně?', en: 'Are texts and photos included in the price?', de: 'Sind Texte und Fotos im Preis enthalten?' },
  'faq.a3': {
    cs: 'Základní texty připravíme za vás. Profesionální fotografie nejsou zahrnuty, ale doporučíme osvědčené fotografy.',
    en: 'We prepare basic copywriting. Professional photography is not included, but we recommend trusted photographers.',
    de: 'Wir erstellen grundlegende Texte. Professionelle Fotografie ist nicht enthalten, aber wir empfehlen bewährte Fotografen.',
  },
  'faq.q4': { cs: 'Mohu si web upravovat sám?', en: 'Can I edit the website myself?', de: 'Kann ich die Website selbst bearbeiten?' },
  'faq.a4': {
    cs: 'Enterprise balíček obsahuje CMS pro vlastní úpravy. U ostatních balíčků úpravy provádíme za vás.',
    en: 'The Enterprise package includes a CMS for self-editing. For other packages, we handle all updates.',
    de: 'Das Enterprise-Paket enthält ein CMS zur Selbstbearbeitung. Bei anderen Paketen übernehmen wir die Aktualisierungen.',
  },
  'faq.q5': { cs: 'Je doména a hosting v ceně?', en: 'Is domain and hosting included?', de: 'Sind Domain und Hosting inklusive?' },
  'faq.a5': {
    cs: 'Doména není zahrnuta v jednorázové ceně. Měsíční hosting je součástí každého balíčku: Starter 1 500 Kč/měs., Basic 2 000 Kč/měs., Professional 3 500 Kč/měs., Enterprise 5 000 Kč/měs. Doménu zajistíme.',
    en: 'Domain is not included in the one-time price. Monthly hosting is part of each package: Starter 1,500 Kč/mo, Basic 2,000 Kč/mo, Professional 3,500 Kč/mo, Enterprise 5,000 Kč/mo. We arrange domains.',
    de: 'Domain ist nicht im Einmalpreis enthalten. Monatliches Hosting ist in jedem Paket enthalten: Starter 1.500 Kč/Mo., Basic 2.000 Kč/Mo., Professional 3.500 Kč/Mo., Enterprise 5.000 Kč/Mo. Domain organisieren wir.',
  },
  'faq.q6': { cs: 'Co když nebudu spokojený s návrhem?', en: 'What if I\'m not satisfied with the design?', de: 'Was wenn ich mit dem Design nicht zufrieden bin?' },
  'faq.a6': {
    cs: 'Každý balíček zahrnuje 1–5 revizí. Návrh schvalujete před programováním, takže vždy víte, co dostanete.',
    en: 'Each package includes 1–5 revisions. You approve the design before coding begins, so you always know what you\'ll get.',
    de: 'Jedes Paket beinhaltet 1–5 Revisionen. Sie genehmigen das Design vor der Programmierung.',
  },
  'faq.q7': { cs: 'Nabízíte údržbu webu?', en: 'Do you offer website maintenance?', de: 'Bieten Sie Website-Wartung an?' },
  'faq.a7': {
    cs: 'Ano. Měsíční údržba od 500 Kč/měsíc zahrnuje aktualizace, zálohy a drobné úpravy obsahu.',
    en: 'Yes. Monthly maintenance starts at 500 Kč/month and includes updates, backups, and minor content changes.',
    de: 'Ja. Monatliche Wartung ab 500 Kč/Monat umfasst Updates, Backups und kleinere Inhaltsänderungen.',
  },
  'faq.q8': { cs: 'Jak probíhá platba?', en: 'How does payment work?', de: 'Wie funktioniert die Bezahlung?' },
  'faq.a8': {
    cs: '50 % záloha před zahájením, 50 % po dokončení a schválení. Akceptujeme bankovní převod i fakturu.',
    en: '50% deposit before starting, 50% upon completion and approval. We accept bank transfer and invoice.',
    de: '50 % Anzahlung vor Beginn, 50 % nach Fertigstellung und Freigabe. Banküberweisung und Rechnung.',
  },

  // Consultant Section — specific expertise
  'consultant.label': { cs: 'Váš konzultant', en: 'Your Consultant', de: 'Ihr Berater' },
  'consultant.title': {
    cs: 'Seznamte se s vaší konzultantkou',
    en: 'Meet Your Consultant',
    de: 'Lernen Sie Ihre Beraterin kennen',
  },
  'consultant.subtitle': {
    cs: 'Osobní přístup a profesionální poradenství pro váš úspěch online.',
    en: 'Personal guidance and professional advice for your online success.',
    de: 'Persönliche Beratung und professionelle Unterstützung für Ihren Online-Erfolg.',
  },
  'consultant.role': { cs: 'Webová konzultantka & obchodní manažerka', en: 'Web Consultant & Business Manager', de: 'Web-Beraterin & Geschäftsleiterin' },
  'consultant.bio': {
    cs: 'Tereza pomáhá řemeslníkům a firmám najít ideální webové řešení. Díky zkušenostem v digitálním marketingu a webovém designu zajistí, že váš web bude funkční, přehledný a přinese zákazníky.',
    en: 'Tereza helps tradespeople and businesses find the right web solution. With experience in digital marketing and web design, she ensures your website is functional, clear, and drives customers.',
    de: 'Tereza hilft Handwerkern und Unternehmen, die richtige Web-Lösung zu finden. Mit Erfahrung in digitalem Marketing und Webdesign sorgt sie dafür, dass Ihre Website funktional und kundenorientiert ist.',
  },
  'consultant.stat1': { cs: '50+ spokojených klientů', en: '50+ happy clients', de: '50+ zufriedene Kunden' },
  'consultant.stat2': { cs: 'Odpověď do 24h', en: 'Reply within 24h', de: 'Antwort innerhalb 24h' },
  'consultant.cta': { cs: 'Zobrazit profil', en: 'View Profile', de: 'Profil ansehen' },
  'consultant.call': { cs: 'Zavolat', en: 'Call Now', de: 'Jetzt anrufen' },

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
  'trade.autorepair': { cs: 'Autoservis', en: 'Auto Repair', de: 'Autowerkstatt' },
  'trade.pestcontrol': { cs: 'Deratizace', en: 'Pest Control', de: 'Schädlingsbekämpfung' },
  'trade.photography': { cs: 'Fotografie', en: 'Photography', de: 'Fotografie' },
  'trade.catering': { cs: 'Catering', en: 'Catering', de: 'Catering' },
  'trade.fitness': { cs: 'Fitness', en: 'Fitness', de: 'Fitness' },
  'trade.beautysalon': { cs: 'Salon krásy', en: 'Beauty Salon', de: 'Schönheitssalon' },
  'trade.moving': { cs: 'Stěhování', en: 'Moving', de: 'Umzug' },
  'trade.itservices': { cs: 'IT služby', en: 'IT Services', de: 'IT-Dienste' },
  'trade.eshop': { cs: 'E-shop', en: 'E-shop', de: 'E-Shop' },
  'trade.womeninbusiness': { cs: 'Ženy v podnikání', en: 'Women in Business', de: 'Frauen im Business' },
  'trade.virtualassistant': { cs: 'Virtuální asistentka', en: 'Virtual Assistant', de: 'Virtuelle Assistentin' },
  'trade.weddingplanner': { cs: 'Svatební koordinátorka', en: 'Wedding Planner', de: 'Hochzeitsplanerin' },
  'trade.florist': { cs: 'Květinářství', en: 'Florist', de: 'Floristin' },
  'trade.bakery': { cs: 'Cukrárna & pekárna', en: 'Bakery & Café', de: 'Bäckerei & Café' },
  'trade.yoga': { cs: 'Yoga studio', en: 'Yoga Studio', de: 'Yoga-Studio' },
  'trade.nailsalon': { cs: 'Nehtové studio', en: 'Nail Salon', de: 'Nagelstudio' },
  'trade.massage': { cs: 'Masážní studio', en: 'Massage Therapy', de: 'Massagestudio' },
  'trade.petgrooming': { cs: 'Psí salon', en: 'Pet Grooming', de: 'Tierpflege' },
  'trade.nutritionist': { cs: 'Výživové poradenství', en: 'Nutritionist', de: 'Ernährungsberatung' },
  'trade.handmade': { cs: 'Handmade & řemesla', en: 'Handmade & Crafts', de: 'Handgemacht & Kunsthandwerk' },
  'trade.childcare': { cs: 'Hlídání dětí', en: 'Childcare', de: 'Kinderbetreuung' },

  // Calculator Showcase — clear value proposition
  'calculator_showcase.label': { cs: 'AI Nástroj', en: 'AI-Powered Tool', de: 'KI-gestütztes Tool' },
  'calculator_showcase.title': {
    cs: 'Zjistěte cenu svého webu za 60 sekund',
    en: 'Get Your Website Price in 60 Seconds',
    de: 'Erhalten Sie Ihren Website-Preis in 60 Sekunden',
  },
  'calculator_showcase.subtitle': {
    cs: 'AI kalkulačka sestaví nabídku na míru podle vašeho řemesla, požadovaných funkcí a rozsahu projektu.',
    en: 'Our AI calculator builds a custom quote based on your trade, required features, and project scope.',
    de: 'Unser KI-Rechner erstellt ein individuelles Angebot basierend auf Ihrem Gewerk, benötigten Funktionen und Projektumfang.',
  },
  'calculator_showcase.badge': { cs: 'AI doporučení', en: 'AI Recommendations', de: 'KI-Empfehlungen' },
  'calculator_showcase.badge2': { cs: 'Okamžitá nabídka', en: 'Instant Quote', de: 'Sofortangebot' },
  'calculator_showcase.heading': { cs: 'Chytrá kalkulačka pro váš web', en: 'Smart Calculator for Your Website', de: 'Intelligenter Rechner für Ihre Website' },
  'calculator_showcase.feature1': { cs: 'Vyberte funkce a sledujte cenu v reálném čase', en: 'Select features and see pricing update in real time', de: 'Wählen Sie Funktionen und sehen Sie den Preis in Echtzeit' },
  'calculator_showcase.feature2': { cs: 'AI doporučí nejlepší funkce pro váš obor', en: 'AI recommends the best features for your trade', de: 'KI empfiehlt die besten Funktionen für Ihr Gewerk' },
  'calculator_showcase.feature3': { cs: 'Zadejte vlastní požadavek a AI navrhne řešení', en: 'Enter a custom request and AI suggests solutions', de: 'Geben Sie eine Anfrage ein und KI schlägt Lösungen vor' },
  'calculator_showcase.feature4': { cs: 'Stáhněte si nabídku jako soubor', en: 'Download your quote as a file', de: 'Laden Sie Ihr Angebot als Datei herunter' },
  'calculator_showcase.cta': { cs: 'Spustit kalkulačku', en: 'Launch Calculator', de: 'Rechner starten' },

  // Admin Back-Office
  'admin.backoffice': { cs: 'Administrace', en: 'Admin Back-Office', de: 'Admin-Bereich' },
  'admin.main_menu': { cs: 'Hlavní menu', en: 'Main Menu', de: 'Hauptmenü' },
  'admin.content': { cs: 'Obsah', en: 'Content', de: 'Inhalt' },
  'admin.administration': { cs: 'Správa', en: 'Administration', de: 'Verwaltung' },
  'admin.system': { cs: 'Systém', en: 'System', de: 'System' },
  'admin.sign_out': { cs: 'Odhlásit se', en: 'Sign Out', de: 'Abmelden' },
  'admin.dashboard': { cs: 'Přehled', en: 'Dashboard', de: 'Dashboard' },
  'admin.leads': { cs: 'Poptávky', en: 'Leads', de: 'Anfragen' },
  'admin.bookings': { cs: 'Rezervace', en: 'Bookings', de: 'Buchungen' },
  'admin.newsletter': { cs: 'Newsletter', en: 'Newsletter', de: 'Newsletter' },
  'admin.homepage': { cs: 'Hlavní strana', en: 'Homepage', de: 'Startseite' },
  'admin.demo_pages': { cs: 'Demo stránky', en: 'Demo Pages', de: 'Demo-Seiten' },
  'admin.blog': { cs: 'Blog', en: 'Blog', de: 'Blog' },
  'admin.media': { cs: 'Média', en: 'Media', de: 'Medien' },
  'admin.seo': { cs: 'SEO', en: 'SEO', de: 'SEO' },
  'admin.sitemap': { cs: 'Mapa webu', en: 'Sitemap', de: 'Sitemap' },
  'admin.versions': { cs: 'Verze', en: 'Versions', de: 'Versionen' },
  'admin.users': { cs: 'Uživatelé', en: 'Users', de: 'Benutzer' },
  'admin.roles': { cs: 'Role', en: 'Roles', de: 'Rollen' },
  'admin.audit_logs': { cs: 'Protokoly', en: 'Audit Logs', de: 'Audit-Protokolle' },
  'admin.embed_codes': { cs: 'Embed kódy', en: 'Embed Codes', de: 'Embed-Codes' },
  'admin.settings': { cs: 'Nastavení', en: 'Settings', de: 'Einstellungen' },
  'admin.vbout': { cs: 'Vbout', en: 'Vbout', de: 'Vbout' },

  // AdminToolbar
  'admin.preview': { cs: 'Náhled', en: 'Preview', de: 'Vorschau' },
  'admin.preview_off': { cs: 'Náhled vypnout', en: 'Preview off', de: 'Vorschau aus' },
  'admin.preview_active': { cs: 'Režim náhledu aktivní', en: 'Preview mode active', de: 'Vorschau-Modus aktiv' },
  'admin.draft': { cs: 'koncept', en: 'draft', de: 'Entwurf' },
  'admin.drafts': { cs: 'konceptů', en: 'drafts', de: 'Entwürfe' },
  'admin.publish': { cs: 'Publikovat', en: 'Publish', de: 'Veröffentlichen' },
  'admin.publish_confirm': { cs: 'Publikovat změny?', en: 'Publish changes?', de: 'Änderungen veröffentlichen?' },
  'admin.publish_desc': { cs: '{count} konceptů bude viditelných pro všechny návštěvníky.', en: '{count} drafts will become visible to all visitors.', de: '{count} Entwürfe werden für alle Besucher sichtbar.' },
  'admin.cancel': { cs: 'Zrušit', en: 'Cancel', de: 'Abbrechen' },
  'admin.discard_all': { cs: 'Zahodit vše?', en: 'Discard all drafts?', de: 'Alle Entwürfe verwerfen?' },
  'admin.discard_desc': { cs: 'Všechny nepublikované změny budou nenávratně ztraceny.', en: 'All unpublished changes will be permanently lost.', de: 'Alle unveröffentlichten Änderungen gehen unwiderruflich verloren.' },
  'admin.discard': { cs: 'Zahodit', en: 'Discard', de: 'Verwerfen' },

  // Admin Dashboard
  'admin.total_leads': { cs: 'Celkem poptávek', en: 'Total Leads', de: 'Anfragen gesamt' },
  'admin.hot_priority': { cs: 'Horké / Prioritní', en: 'Hot / Priority', de: 'Heiß / Priorität' },
  'admin.admin_users': { cs: 'Admin uživatelé', en: 'Admin Users', de: 'Admin-Benutzer' },
  'admin.recent_actions': { cs: 'Poslední akce', en: 'Recent Actions', de: 'Letzte Aktionen' },

  // Admin Login
  'admin.portal': { cs: 'Administrace', en: 'Admin Portal', de: 'Admin-Portal' },
  'admin.sign_in_desc': { cs: 'Přihlaste se do správy webu.', en: 'Sign in to manage the back-office.', de: 'Anmelden zur Verwaltung des Back-Office.' },
  'admin.email': { cs: 'E-mailová adresa', en: 'Email Address', de: 'E-Mail-Adresse' },
  'admin.password': { cs: 'Heslo', en: 'Password', de: 'Passwort' },
  'admin.sign_in': { cs: 'Přihlásit se', en: 'Sign In', de: 'Anmelden' },
  'admin.forgot_password': { cs: 'Zapomenuté heslo?', en: 'Forgot password?', de: 'Passwort vergessen?' },
  'admin.reset_password': { cs: 'Obnovit heslo', en: 'Reset Password', de: 'Passwort zurücksetzen' },
  'admin.reset_desc': { cs: 'Zadejte e-mail a pošleme vám odkaz.', en: 'Enter your email and we\'ll send a reset link.', de: 'Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Link.' },
  'admin.send_link': { cs: 'Odeslat odkaz', en: 'Send Reset Link', de: 'Link senden' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fastmedia-language');
    return (saved === 'cs' || saved === 'en' || saved === 'de') ? saved : 'cs';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fastmedia-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation['cs'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
