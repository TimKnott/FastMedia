import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { initialLanguage, languageLocales, localizedPath } from '@/lib/publicLanguage';

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
  'nav.grant': { cs: 'Žádost o grant', en: 'Apply for a grant', de: 'Förderung beantragen' },
  'nav.offer': { cs: 'Nabídka', en: 'Offer', de: 'Angebot' },
  'nav.grant_rules': { cs: 'Podmínky grantu', en: 'Grant rules', de: 'Förderbedingungen' },
  'nav.grant_hubs': { cs: 'Mapa krajů', en: 'Regional hubs', de: 'Regionale Zentren' },
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
  'demos.all.title': { cs: 'Prohlédněte si všech {n} ukázek podle oboru →', en: 'Explore all {n} industry demos →', de: 'Alle {n} Branchen-Demos ansehen →' },
  'demos.all.sub': { cs: 'Od instalatérů a květinářství po veterináře a účetní – živé ukázky s online rezervací.', en: 'From plumbers and florists to vets and accountants – live previews with online booking.', de: 'Vom Installateur und Floristen bis zu Tierärzten und Steuerberatern – Live-Vorschauen mit Online-Buchung.' },
  'demos.all.cta': { cs: 'Všechny ukázky', en: 'All demos', de: 'Alle Demos' },

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
  'trade.dental': { cs: 'Zubní klinika', en: 'Dental Clinic', de: 'Zahnarztpraxis' },
  'trade.realestate': { cs: 'Reality', en: 'Real Estate', de: 'Immobilien' },
  'trade.accounting': { cs: 'Účetnictví', en: 'Accounting', de: 'Buchhaltung' },
  'trade.veterinary': { cs: 'Veterinář', en: 'Veterinary', de: 'Tierarzt' },
  'trade.tattoo': { cs: 'Tetovací studio', en: 'Tattoo Studio', de: 'Tattoostudio' },
  'trade.musicschool': { cs: 'Hudební škola', en: 'Music School', de: 'Musikschule' },
  'trade.drivingschool': { cs: 'Autoškola', en: 'Driving School', de: 'Fahrschule' },
  'trade.laundry': { cs: 'Prádelna', en: 'Laundry', de: 'Wäscherei' },
  'trade.security': { cs: 'Bezpečnostní služby', en: 'Security Services', de: 'Sicherheitsdienste' },
  'trade.translation': { cs: 'Překlady', en: 'Translation', de: 'Übersetzung' },

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
  'admin.accounting': { cs: 'Účetnictví', en: 'Accounting', de: 'Buchhaltung' },
  'admin.emails': { cs: 'E-Maily', en: 'Emails', de: 'E-Mails' },
  'admin.hr': { cs: 'Personální', en: 'HR', de: 'Personal' },
  'admin.integrations': { cs: 'Integrace', en: 'Integrations', de: 'Integrationen' },
  'admin.export': { cs: 'Export dat', en: 'Data Export', de: 'Datenexport' },

  // Admin Bookings
  'bookings.title': { cs: 'Rezervace', en: 'Bookings', de: 'Buchungen' },
  'bookings.subtitle': { cs: 'Správa a sledování termínů.', en: 'Manage and track appointments.', de: 'Termine verwalten und nachverfolgen.' },
  'bookings.new': { cs: 'Nová rezervace', en: 'New Booking', de: 'Neue Buchung' },
  'bookings.create_title': { cs: 'Vytvořit novou rezervaci', en: 'Create New Booking', de: 'Neue Buchung erstellen' },
  'bookings.create_desc': { cs: 'Vyplňte údaje pro nový termín.', en: 'Fill in details to create a new appointment.', de: 'Füllen Sie die Details aus, um einen neuen Termin anzulegen.' },
  'bookings.all': { cs: 'Všechny rezervace', en: 'All Bookings', de: 'Alle Buchungen' },
  'bookings.entries': { cs: 'záznamů', en: 'entries', de: 'Einträge' },
  'bookings.none': { cs: 'Žádné rezervace.', en: 'No bookings found.', de: 'Keine Buchungen gefunden.' },
  'bookings.search': { cs: 'Hledat podle jména, emailu, služby…', en: 'Search by name, email, service…', de: 'Suche nach Name, E-Mail, Service…' },
  'bookings.status.pending': { cs: 'Čeká', en: 'Pending', de: 'Ausstehend' },
  'bookings.status.confirmed': { cs: 'Potvrzeno', en: 'Confirmed', de: 'Bestätigt' },
  'bookings.status.in_progress': { cs: 'Probíhá', en: 'In Progress', de: 'In Bearbeitung' },
  'bookings.status.completed': { cs: 'Dokončeno', en: 'Completed', de: 'Abgeschlossen' },
  'bookings.status.cancelled': { cs: 'Zrušeno', en: 'Cancelled', de: 'Storniert' },
  'bookings.customer': { cs: 'Zákazník', en: 'Customer', de: 'Kunde' },
  'bookings.service': { cs: 'Služba', en: 'Service', de: 'Service' },
  'bookings.appointment': { cs: 'Termín', en: 'Appointment', de: 'Termin' },
  'bookings.duration': { cs: 'Trvání', en: 'Duration', de: 'Dauer' },
  'bookings.assigned': { cs: 'Přiřazeno', en: 'Assigned', de: 'Zugewiesen' },
  'bookings.contact': { cs: 'Kontakt', en: 'Contact', de: 'Kontakt' },
  'bookings.details': { cs: 'Detaily rezervace', en: 'Booking Details', de: 'Buchungsdetails' },
  'bookings.created': { cs: 'Vytvořeno', en: 'Created', de: 'Erstellt' },
  'bookings.change_status': { cs: 'Změnit stav', en: 'Change Status', de: 'Status ändern' },
  'bookings.notes': { cs: 'Poznámky', en: 'Notes', de: 'Notizen' },
  'bookings.notes_placeholder': { cs: 'Přidat poznámky…', en: 'Add notes…', de: 'Notizen hinzufügen…' },
  'bookings.save': { cs: 'Uložit', en: 'Save', de: 'Speichern' },
  'bookings.close': { cs: 'Zavřít', en: 'Close', de: 'Schließen' },
  'bookings.email_task': { cs: 'Odeslat úkol e-mailem', en: 'Email Task', de: 'Aufgabe per E-Mail senden' },
  'bookings.email_recipient': { cs: 'E-mail příjemce (Admin/Editor)', en: 'Recipient email (Admin/Editor)', de: 'E-Mail des Empfängers (Admin/Editor)' },
  'bookings.send_task': { cs: 'Odeslat úkol', en: 'Send Task', de: 'Aufgabe senden' },
  'bookings.lead_id': { cs: 'Lead ID', en: 'Lead ID', de: 'Lead-ID' },
  'bookings.minutes': { cs: 'minut', en: 'minutes', de: 'Minuten' },
  'bookings.min': { cs: 'min', en: 'min', de: 'Min.' },
  'bookings.assigned_to': { cs: 'Přiřazeno komu', en: 'Assigned to', de: 'Zugewiesen an' },
  'bookings.assigned_placeholder': { cs: 'Jméno pracovníka', en: 'Employee name', de: 'Mitarbeiter-Name' },
  'bookings.optional_notes': { cs: 'Volitelné poznámky…', en: 'Optional notes…', de: 'Optionale Notizen…' },
  'bookings.cancel': { cs: 'Zrušit', en: 'Cancel', de: 'Abbrechen' },
  'bookings.create_btn': { cs: 'Vytvořit', en: 'Create', de: 'Erstellen' },
  'bookings.duration_min': { cs: 'Trvání (min.)', en: 'Duration (min.)', de: 'Dauer (Min.)' },
  'bookings.email_sent': { cs: 'Úkol odeslán e-mailem!', en: 'Task sent by email!', de: 'Aufgabe per E-Mail gesendet!' },
  'bookings.all_tab': { cs: 'Vše', en: 'All', de: 'Alle' },
  'bookings.select_date': { cs: 'Vybrat datum', en: 'Select date', de: 'Datum wählen' },
  'bookings.name_label': { cs: 'Jméno', en: 'Name', de: 'Name' },
  'bookings.email_label': { cs: 'E-mail', en: 'Email', de: 'E-Mail' },
  'bookings.phone_label': { cs: 'Telefon', en: 'Phone', de: 'Telefon' },
  'bookings.service_label': { cs: 'Služba', en: 'Service', de: 'Service' },
  'bookings.service_placeholder': { cs: 'např. Instalatérství – potrubí', en: 'e.g. Plumbing – pipe installation', de: 'z.B. Sanitär – Rohrleitungsinstallation' },
  'bookings.email_placeholder': { cs: 'jan@priklad.cz', en: 'john@example.com', de: 'max@beispiel.de' },
  'bookings.invalid_email': { cs: 'Zadejte platnou e-mailovou adresu.', en: 'Please enter a valid email address.', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
  'bookings.email_send_error': { cs: 'E-mail se nepodařilo odeslat.', en: 'Email could not be sent.', de: 'E-Mail konnte nicht gesendet werden.' },
  'leads.profile': { cs: 'Profil zákazníka', en: 'Customer Profile', de: 'Kundenprofil' },
  'leads.language_label': { cs: 'Jazyk', en: 'Language', de: 'Sprache' },
  'leads.source_label': { cs: 'Zdroj', en: 'Source', de: 'Quelle' },
  'leads.trade_label': { cs: 'Obor', en: 'Trade', de: 'Gewerk' },
  'leads.hot_priority': { cs: 'Hot / Prioritní', en: 'Hot / Priority', de: 'Hot / Priorität' },
  'leads.month_unit': { cs: '/měs.', en: '/mo.', de: '/Mon.' },

  // Admin Emails Dashboard
  'emails.title': { cs: 'E-mailový přehled', en: 'Email Dashboard', de: 'E-Mail Dashboard' },
  'emails.subtitle': { cs: 'Přehled všech odeslaných e-mailů', en: 'Overview of all sent emails', de: 'Übersicht aller gesendeten E-Mails' },
  'emails.total': { cs: 'Celkem', en: 'Total', de: 'Gesamt' },
  'emails.sent': { cs: 'Odesláno', en: 'Sent', de: 'Gesendet' },
  'emails.failed': { cs: 'Neúspěšné', en: 'Failed', de: 'Fehlgeschlagen' },
  'emails.suppressed': { cs: 'Potlačené', en: 'Suppressed', de: 'Unterdrückt' },
  'emails.all_templates': { cs: 'Všechny šablony', en: 'All Templates', de: 'Alle Vorlagen' },
  'emails.all_statuses': { cs: 'Všechny stavy', en: 'All Statuses', de: 'Alle Status' },
  'emails.template': { cs: 'Šablona', en: 'Template', de: 'Vorlage' },
  'emails.recipient': { cs: 'Příjemce', en: 'Recipient', de: 'Empfänger' },
  'emails.status': { cs: 'Stav', en: 'Status', de: 'Status' },
  'emails.timestamp': { cs: 'Čas', en: 'Timestamp', de: 'Zeitpunkt' },
  'emails.error': { cs: 'Chyba', en: 'Error', de: 'Fehler' },
  'emails.loading': { cs: 'Načítání…', en: 'Loading…', de: 'Lädt…' },
  'emails.none': { cs: 'Žádné e-maily ve zvoleném období', en: 'No emails in selected period', de: 'Keine E-Mails im gewählten Zeitraum' },
  'emails.page': { cs: 'Stránka', en: 'Page', de: 'Seite' },
  'emails.of': { cs: 'z', en: 'of', de: 'von' },
  'emails.24h': { cs: '24 hod', en: '24h', de: '24 Std' },
  'emails.7d': { cs: '7 dnů', en: '7 days', de: '7 Tage' },
  'emails.30d': { cs: '30 dnů', en: '30 days', de: '30 Tage' },

  // Admin Leads
  'leads.title': { cs: 'Správa leadů', en: 'Lead Management', de: 'Lead-Management' },
  'leads.subtitle': { cs: 'Správa kvalifikovaných leadů z AI kalkulačky.', en: 'Manage qualified leads from the AI calculator.', de: 'Qualifizierte Leads aus dem AI-Kalkulator verwalten.' },
  'leads.total': { cs: 'Celkem', en: 'Total', de: 'Gesamt' },
  'leads.new': { cs: 'Nové leady', en: 'New Leads', de: 'Neue Leads' },
  'leads.converted': { cs: 'Konvertováno', en: 'Converted', de: 'Konvertiert' },
  'leads.all': { cs: 'Všechny leady', en: 'All Leads', de: 'Alle Leads' },
  'leads.entries': { cs: 'záznamů', en: 'entries', de: 'Einträge' },
  'leads.search': { cs: 'Hledat podle jména, emailu, oboru…', en: 'Search by name, email, trade…', de: 'Suche nach Name, E-Mail, Gewerk…' },
  'leads.loading': { cs: 'Načítání…', en: 'Loading…', de: 'Laden…' },
  'leads.none': { cs: 'Žádné leady nenalezeny.', en: 'No leads found.', de: 'Keine Leads gefunden.' },
  'leads.trade': { cs: 'Obor', en: 'Trade', de: 'Gewerk' },
  'leads.classification': { cs: 'Klasifikace', en: 'Classification', de: 'Klassifizierung' },
  'leads.quote': { cs: 'Nabídka', en: 'Quote', de: 'Angebot' },
  'leads.contact': { cs: 'Kontakt', en: 'Contact', de: 'Kontakt' },
  'leads.quote_data': { cs: 'Údaje nabídky', en: 'Quote Data', de: 'Angebotsdaten' },
  'leads.one_time': { cs: 'Jednorázově', en: 'One-time', de: 'Einmalkosten' },
  'leads.monthly': { cs: 'Měsíčně', en: 'Monthly', de: 'Monatlich' },
  'leads.labor_hours': { cs: 'Pracovní hodiny', en: 'Labour Hours', de: 'Arbeitsstunden' },
  'leads.special_request': { cs: 'Speciální požadavek', en: 'Special Request', de: 'Sonderwunsch' },
  'leads.ai_analysis': { cs: 'AI analýza', en: 'AI Analysis', de: 'AI-Analyse' },
  'leads.strategy': { cs: 'Strategie', en: 'Strategy', de: 'Strategie' },
  'leads.workflow': { cs: 'Pracovní postup', en: 'Workflow', de: 'Workflow' },
  'leads.status.new': { cs: 'Nový', en: 'New', de: 'Neu' },
  'leads.status.contacted': { cs: 'Kontaktován', en: 'Contacted', de: 'Kontaktiert' },
  'leads.status.qualified': { cs: 'Kvalifikován', en: 'Qualified', de: 'Qualifiziert' },
  'leads.status.converted': { cs: 'Konvertován', en: 'Converted', de: 'Konvertiert' },
  'leads.status.lost': { cs: 'Ztracen', en: 'Lost', de: 'Verloren' },
  'leads.assigned': { cs: 'Přiřazeno', en: 'Assigned to', de: 'Zugewiesen an' },
  'leads.notes': { cs: 'Poznámky', en: 'Notes', de: 'Notizen' },
  'leads.add_note': { cs: 'Přidat poznámku…', en: 'Add note…', de: 'Notiz hinzufügen…' },
  'leads.activities': { cs: 'Aktivity', en: 'Activities', de: 'Aktivitäten' },
  'leads.no_activities': { cs: 'Žádné aktivity.', en: 'No activities.', de: 'Keine Aktivitäten.' },
  'leads.close': { cs: 'Zavřít', en: 'Close', de: 'Schließen' },
  'leads.hours': { cs: 'hod', en: 'hrs', de: 'Std' },

  // Admin Accounting
  'accounting.title': { cs: 'Účetnictví & Faktury', en: 'Accounting & Invoices', de: 'Buchhaltung & Rechnungen' },
  'accounting.subtitle': { cs: 'Vytváření, správa a opakované fakturace.', en: 'Create, manage, and set up recurring invoices.', de: 'Rechnungen erstellen, verwalten und wiederkehrende Rechnungen konfigurieren.' },
  'accounting.new_invoice': { cs: 'Nová faktura', en: 'New Invoice', de: 'Neue Rechnung' },
  'accounting.recurring': { cs: 'Opakované', en: 'Recurring', de: 'Wiederkehrend' },
  'accounting.create_invoice': { cs: 'Vytvořit fakturu', en: 'Create Invoice', de: 'Neue Rechnung erstellen' },
  'accounting.create_invoice_desc': { cs: 'Vytvořte jednorázovou fakturu pro zákazníka.', en: 'Create a one-time invoice for a customer.', de: 'Erstellen Sie eine Einmalrechnung für einen Kunden.' },
  'accounting.create_recurring': { cs: 'Vytvořit opakovanou fakturu', en: 'Create Recurring Invoice', de: 'Wiederkehrende Rechnung erstellen' },
  'accounting.create_recurring_desc': { cs: 'Automatická fakturace podle rozvrhu.', en: 'Automatic invoicing on schedule.', de: 'Automatische Rechnungserstellung nach Zeitplan.' },
  'accounting.customer': { cs: 'Zákazník', en: 'Customer', de: 'Kunde' },
  'accounting.address': { cs: 'Adresa', en: 'Address', de: 'Adresse' },
  'accounting.service_item': { cs: 'Služba', en: 'Service', de: 'Leistung' },
  'accounting.quantity': { cs: 'Množství', en: 'Quantity', de: 'Menge' },
  'accounting.price': { cs: 'Cena (CZK)', en: 'Price (CZK)', de: 'Preis (CZK)' },
  'accounting.vat': { cs: 'DPH (%)', en: 'VAT (%)', de: 'MwSt (%)' },
  'accounting.due_date': { cs: 'Splatnost', en: 'Due Date', de: 'Fällig am' },
  'accounting.frequency': { cs: 'Frekvence', en: 'Frequency', de: 'Häufigkeit' },
  'accounting.daily': { cs: 'Denně', en: 'Daily', de: 'Täglich' },
  'accounting.weekly': { cs: 'Týdně', en: 'Weekly', de: 'Wöchentlich' },
  'accounting.monthly_freq': { cs: 'Měsíčně', en: 'Monthly', de: 'Monatlich' },
  'accounting.notes': { cs: 'Poznámky', en: 'Notes', de: 'Notizen' },
  'accounting.invoices': { cs: 'Faktury', en: 'Invoices', de: 'Rechnungen' },
  'accounting.recurring_invoices': { cs: 'Opakované faktury', en: 'Recurring Invoices', de: 'Wiederkehrende Rechnungen' },
  'accounting.recurring_desc': { cs: 'Automatická fakturace podle rozvrhu.', en: 'Automatic invoicing on schedule.', de: 'Automatische Rechnungserstellung nach Zeitplan.' },
  'accounting.search': { cs: 'Hledat č. faktury, zákazníka…', en: 'Search invoice no., customer…', de: 'Suche Rechnungsnr., Kunde…' },
  'accounting.no_invoices': { cs: 'Žádné faktury.', en: 'No invoices found.', de: 'Keine Rechnungen gefunden.' },
  'accounting.no_recurring': { cs: 'Žádné opakované faktury.', en: 'No recurring invoices.', de: 'Keine wiederkehrenden Rechnungen.' },
  'accounting.status.draft': { cs: 'Koncept', en: 'Draft', de: 'Entwurf' },
  'accounting.status.sent': { cs: 'Odesláno', en: 'Sent', de: 'Gesendet' },
  'accounting.status.paid': { cs: 'Zaplaceno', en: 'Paid', de: 'Bezahlt' },
  'accounting.status.overdue': { cs: 'Po splatnosti', en: 'Overdue', de: 'Überfällig' },
  'accounting.status.cancelled': { cs: 'Zrušeno', en: 'Cancelled', de: 'Storniert' },
  'accounting.total': { cs: 'Celkem', en: 'Total', de: 'Gesamt' },
  'accounting.paid': { cs: 'Zaplaceno', en: 'Paid', de: 'Bezahlt' },
  'accounting.outstanding': { cs: 'Nezaplaceno', en: 'Outstanding', de: 'Ausstehend' },
  'accounting.overdue': { cs: 'Po splatnosti', en: 'Overdue', de: 'Überfällig' },
  'accounting.nr': { cs: 'Č.', en: 'No.', de: 'Nr.' },
  'accounting.amount': { cs: 'Částka', en: 'Amount', de: 'Betrag' },
  'accounting.issued': { cs: 'Vystaveno', en: 'Issued', de: 'Ausgestellt' },
  'accounting.due': { cs: 'Splatnost', en: 'Due', de: 'Fällig' },
  'accounting.next': { cs: 'Další', en: 'Next', de: 'Nächste' },
  'accounting.active': { cs: 'Aktivní', en: 'Active', de: 'Aktiv' },
  'accounting.inactive': { cs: 'Neaktivní', en: 'Inactive', de: 'Inaktiv' },
  'accounting.invoice': { cs: 'Faktura', en: 'Invoice', de: 'Rechnung' },
  'accounting.items': { cs: 'Položky', en: 'Items', de: 'Positionen' },
  'accounting.subtotal': { cs: 'Mezisoučet', en: 'Subtotal', de: 'Zwischensumme' },
  'accounting.dates': { cs: 'Data', en: 'Dates', de: 'Daten' },
  'accounting.change_status': { cs: 'Změnit stav', en: 'Change Status', de: 'Status ändern' },

  // Integrations
  'integrations.title': { cs: 'API integrace', en: 'API Integrations', de: 'API-Integrationen' },
  'integrations.subtitle': { cs: 'Připojení a správa externích služeb.', en: 'Connect and manage external services.', de: 'Externe Dienste verbinden und verwalten.' },
  'integrations.connected': { cs: 'Připojeno', en: 'Connected', de: 'Verbunden' },
  'integrations.available': { cs: 'Dostupné', en: 'Available', de: 'Verfügbar' },
  'integrations.configure': { cs: 'Konfigurovat', en: 'Configure', de: 'Konfigurieren' },
  'integrations.cat_marketing': { cs: 'Marketing', en: 'Marketing', de: 'Marketing' },
  'integrations.cat_payments': { cs: 'Platby', en: 'Payments', de: 'Zahlungen' },
  'integrations.cat_analytics': { cs: 'Analytika', en: 'Analytics', de: 'Analytics' },
  'integrations.cat_communication': { cs: 'Komunikace', en: 'Communication', de: 'Kommunikation' },
  'integrations.cat_email': { cs: 'E-mail', en: 'Email', de: 'E-Mail' },
  'integrations.cat_planning': { cs: 'Plánování', en: 'Planning', de: 'Planung' },
  'integrations.cat_automation': { cs: 'Automatizace', en: 'Automation', de: 'Automatisierung' },
  'integrations.cat_development': { cs: 'Vývoj', en: 'Development', de: 'Entwicklung' },
  'integrations.vbout_desc': { cs: 'Marketingová automatizace, e-mailové kampaně a sledování leadů.', en: 'Marketing automation, email campaigns and lead tracking.', de: 'Marketing-Automatisierung, E-Mail-Kampagnen und Lead-Tracking.' },
  'integrations.stripe_desc': { cs: 'Online zpracování plateb a fakturace.', en: 'Online payment processing and invoicing.', de: 'Online-Zahlungsabwicklung und Rechnungsstellung.' },
  'integrations.ga_desc': { cs: 'Analýza návštěvnosti a chování uživatelů.', en: 'Analyse website traffic and user behaviour.', de: 'Website-Traffic und Nutzerverhalten analysieren.' },
  'integrations.slack_desc': { cs: 'Týmová oznámení a interní komunikace.', en: 'Team notifications and internal communication.', de: 'Team-Benachrichtigungen und interne Kommunikation.' },
  'integrations.resend_desc': { cs: 'Odesílání transakčních e-mailů.', en: 'Send transactional emails.', de: 'Transaktions-E-Mails versenden.' },
  'integrations.calendar_desc': { cs: 'Synchronisace rezervací s kalendářem.', en: 'Sync bookings with calendar.', de: 'Terminbuchungen mit Kalender synchronisieren.' },
  'integrations.zapier_desc': { cs: 'Automatizované pracovní postupy mezi aplikacemi.', en: 'Automated workflows between apps.', de: 'Automatisierte Workflows zwischen Apps.' },
  'integrations.sentry_desc': { cs: 'Monitorování chyb a výkonu.', en: 'Error monitoring and performance tracking.', de: 'Fehler-Monitoring und Performance-Tracking.' },

  // Blog admin
  'blog.articles_published': { cs: 'článků publikováno', en: 'articles published', de: 'Artikel veröffentlicht' },
  'blog.new_article': { cs: 'Nový článek', en: 'New Article', de: 'Neuer Artikel' },

  // Admin Landing Page
  'landing.title': { cs: 'Úprava hlavní stránky', en: 'Edit Homepage', de: 'Startseite bearbeiten' },
  'landing.subtitle': { cs: 'Správa všech sekcí hlavní stránky.', en: 'Manage all sections of the landing page.', de: 'Verwalten Sie alle Abschnitte der Landing Page.' },
  'landing.edit': { cs: 'Upravit', en: 'Edit', de: 'Bearbeiten' },
  'landing.coming_soon': { cs: 'Inline úpravy budou brzy k dispozici.', en: 'Inline editing coming soon. You will be able to edit text and images directly here.', de: 'Inline-Bearbeitung kommt bald. Hier können Sie in Zukunft Texte und Bilder direkt bearbeiten.' },

  // Admin Demos
  'demos.admin_title': { cs: 'Demo stránky', en: 'Demo Pages', de: 'Demo-Seiten' },
  'demos.admin_subtitle': { cs: 'Správa textů, obrázků a služeb demo stránek.', en: 'Manage text, images, and services across demo pages.', de: 'Verwalten Sie Texte, Bilder und Services der Branchen-Demos.' },
  'demos.search': { cs: 'Hledat demo…', en: 'Search demo…', de: 'Demo suchen…' },
  'demos.shown': { cs: 'zobrazeno', en: 'shown', de: 'angezeigt' },
  'demos.of': { cs: 'z', en: 'of', de: 'von' },
  'demos.inline_soon': { cs: 'Inline úpravy budou brzy k dispozici.', en: 'Inline editing coming soon.', de: 'Inline-Bearbeitung kommt bald.' },

  // Admin Media
  'media.title': { cs: 'Knihovna médií', en: 'Media Library', de: 'Medienbibliothek' },
  'media.subtitle': { cs: 'Správa obrázků a souborů webu.', en: 'Manage images and files for the website.', de: 'Verwalten Sie Bilder und Dateien der gesamten Website.' },
  'media.upload': { cs: 'Nahrát', en: 'Upload', de: 'Hochladen' },
  'media.files': { cs: 'souborů', en: 'files', de: 'Dateien' },
  'media.coming_soon': { cs: 'Nahrávání a úprava obrázků budou brzy k dispozici.', en: 'Upload and image editing coming soon. Preview only for now.', de: 'Upload und Bildbearbeitung kommen bald. Zurzeit nur Vorschau verfügbar.' },

  // Admin Sitemap
  'sitemap.title': { cs: 'Správa sitemap', en: 'Sitemap Management', de: 'Sitemap-Verwaltung' },
  'sitemap.subtitle': { cs: 'XML sitemap pro vyhledávače.', en: 'Manage XML sitemap for search engines.', de: 'XML-Sitemap verwalten und für Suchmaschinen bereitstellen.' },
  'sitemap.url': { cs: 'URL sitemapy', en: 'Sitemap URL', de: 'Sitemap-URL' },
  'sitemap.submit_hint': { cs: 'Odešlete tuto URL v Google Search Console pod „Sitemap".', en: 'Submit this URL in Google Search Console under "Sitemaps".', de: 'Diese URL in Google Search Console unter „Sitemaps" einreichen.' },
  'sitemap.indexable': { cs: 'Indexovatelné stránky', en: 'Indexable Pages', de: 'Indexierbare Seiten' },
  'sitemap.excluded': { cs: 'Vyloučené stránky', en: 'Excluded Pages', de: 'Ausgeschlossene Seiten' },
  'sitemap.copy_xml': { cs: 'Kopírovat XML', en: 'Copy XML', de: 'XML kopieren' },

  // Common admin
  'common.name': { cs: 'Jméno', en: 'Name', de: 'Name' },
  'common.email': { cs: 'E-mail', en: 'Email', de: 'E-Mail' },
  'common.phone': { cs: 'Telefon', en: 'Phone', de: 'Telefon' },
  'common.status': { cs: 'Stav', en: 'Status', de: 'Status' },
  'common.created': { cs: 'Vytvořeno', en: 'Created', de: 'Erstellt' },
  'common.save': { cs: 'Uložit', en: 'Save', de: 'Speichern' },
  'common.cancel': { cs: 'Zrušit', en: 'Cancel', de: 'Abbrechen' },
  'common.create': { cs: 'Vytvořit', en: 'Create', de: 'Erstellen' },
  'common.close': { cs: 'Zavřít', en: 'Close', de: 'Schließen' },
  'common.all': { cs: 'Vše', en: 'All', de: 'Alle' },
  'common.select_date': { cs: 'Vybrat datum', en: 'Select date', de: 'Datum wählen' },
  'common.required_fields': { cs: 'Vyplňte všechna povinná pole.', en: 'Please fill in all required fields.', de: 'Bitte füllen Sie alle Pflichtfelder aus.' },
  'common.error_generic': { cs: 'Nastala chyba. Zkuste to prosím znovu.', en: 'An error occurred. Please try again.', de: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
  'common.success_created': { cs: 'Úspěšně vytvořeno.', en: 'Successfully created.', de: 'Erfolgreich erstellt.' },
  'common.success_updated': { cs: 'Úspěšně aktualizováno.', en: 'Successfully updated.', de: 'Erfolgreich aktualisiert.' },
  'common.success_saved': { cs: 'Uloženo.', en: 'Saved.', de: 'Gespeichert.' },
  'common.deleted': { cs: 'Smazáno.', en: 'Deleted.', de: 'Gelöscht.' },
  'common.activated': { cs: 'Aktivováno.', en: 'Activated.', de: 'Aktiviert.' },
  'common.deactivated': { cs: 'Deaktivováno.', en: 'Deactivated.', de: 'Deaktiviert.' },
  'common.email_sent': { cs: 'E-mail odeslán!', en: 'Email sent!', de: 'E-Mail gesendet!' },
  'common.email_error': { cs: 'E-mail se nepodařilo odeslat.', en: 'Failed to send email.', de: 'E-Mail konnte nicht gesendet werden.' },
  'common.invalid_email': { cs: 'Zadejte platnou e-mailovou adresu.', en: 'Please enter a valid email address.', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
  'common.url_copied': { cs: 'URL zkopírována', en: 'URL copied', de: 'URL kopiert' },
  'common.xml_copied': { cs: 'XML zkopírováno', en: 'XML copied', de: 'XML kopiert' },

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
  'admin.dashboard_subtitle': { cs: 'Přehled administrace.', en: 'Overview of your admin portal.', de: 'Übersicht des Admin-Portals.' },
  'admin.newsletter_subscribers': { cs: 'Odběratelé newsletteru', en: 'Newsletter Subscribers', de: 'Newsletter-Abonnenten' },
  'admin.audit_entries': { cs: 'Záznamy auditu', en: 'Audit Entries', de: 'Audit-Einträge' },
  'admin.recent_activity': { cs: 'Poslední aktivita', en: 'Recent Activity', de: 'Letzte Aktivität' },
  'admin.recent_activity_desc': { cs: 'Poslední změny a události v systému.', en: 'Latest changes and events in the system.', de: 'Letzte Änderungen und Ereignisse im System.' },
  'admin.no_activity': { cs: 'Zatím žádná aktivita', en: 'No activity yet', de: 'Noch keine Aktivität' },
  'admin.no_activity_desc': { cs: 'Vytvořte záznamy pro zobrazení dat v reálném čase.', en: 'Create audit and booking records to see real-time data.', de: 'Erstellen Sie Audit- und Buchungsdatensätze für Echtzeitdaten.' },

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

  // HR Module
  'hr.title': { cs: 'Personální správa', en: 'HR Management', de: 'Personalverwaltung' },
  'hr.active_employees': { cs: 'Aktivní zaměstnanci', en: 'Active Employees', de: 'Aktive Mitarbeiter' },
  'hr.shifts_today': { cs: 'Směny dnes', en: 'Shifts Today', de: 'Schichten heute' },
  'hr.present_today': { cs: 'Přítomni dnes', en: 'Present Today', de: 'Anwesend heute' },
  'hr.employees': { cs: 'Zaměstnanci', en: 'Employees', de: 'Mitarbeiter' },
  'hr.shifts': { cs: 'Směny', en: 'Shifts', de: 'Schichtplan' },
  'hr.attendance': { cs: 'Docházka', en: 'Attendance', de: 'Anwesenheit' },
  'hr.search': { cs: 'Hledat…', en: 'Search…', de: 'Suchen…' },
  'hr.add': { cs: 'Přidat', en: 'Add', de: 'Hinzufügen' },
  'hr.position': { cs: 'Pozice', en: 'Position', de: 'Position' },
  'hr.department': { cs: 'Oddělení', en: 'Department', de: 'Abteilung' },
  'hr.hired': { cs: 'Nastoupil/a', en: 'Hired', de: 'Eingestellt' },
  'hr.loading': { cs: 'Načítání…', en: 'Loading…', de: 'Laden…' },
  'hr.no_employees': { cs: 'Žádní zaměstnanci', en: 'No employees', de: 'Keine Mitarbeiter' },
  'hr.add_employee': { cs: 'Přidat zaměstnance', en: 'Add Employee', de: 'Mitarbeiter hinzufügen' },
  'hr.name_email_required': { cs: 'Jméno a e-mail jsou povinné', en: 'Name and email required', de: 'Name und E-Mail erforderlich' },
  'hr.employee_added': { cs: 'Zaměstnanec přidán', en: 'Employee added', de: 'Mitarbeiter hinzugefügt' },
  'hr.employee_deleted': { cs: 'Zaměstnanec smazán', en: 'Employee deleted', de: 'Mitarbeiter gelöscht' },
  'hr.hire_date': { cs: 'Datum nástupu', en: 'Hire Date', de: 'Einstellungsdatum' },
  'hr.status.active': { cs: 'Aktivní', en: 'Active', de: 'Aktiv' },
  'hr.status.on_leave': { cs: 'Na dovolené', en: 'On Leave', de: 'Abwesend' },
  'hr.status.inactive': { cs: 'Neaktivní', en: 'Inactive', de: 'Inaktiv' },
  'hr.create_shift': { cs: 'Vytvořit směnu', en: 'Create Shift', de: 'Schicht erstellen' },
  'hr.employee': { cs: 'Zaměstnanec', en: 'Employee', de: 'Mitarbeiter' },
  'hr.date': { cs: 'Datum', en: 'Date', de: 'Datum' },
  'hr.from': { cs: 'Od', en: 'From', de: 'Von' },
  'hr.to': { cs: 'Do', en: 'To', de: 'Bis' },
  'hr.type': { cs: 'Typ', en: 'Type', de: 'Typ' },
  'hr.no_shifts': { cs: 'Žádné směny', en: 'No shifts', de: 'Keine Schichten' },
  'hr.select_employee': { cs: 'Vybrat zaměstnance', en: 'Select employee', de: 'Mitarbeiter auswählen' },
  'hr.shift_added': { cs: 'Směna přidána', en: 'Shift added', de: 'Schicht hinzugefügt' },
  'hr.select': { cs: 'Vybrat…', en: 'Select…', de: 'Auswählen…' },
  'hr.shift_type.regular': { cs: 'Běžná', en: 'Regular', de: 'Regulär' },
  'hr.shift_type.overtime': { cs: 'Přesčas', en: 'Overtime', de: 'Überstunden' },
  'hr.shift_type.holiday': { cs: 'Svátek', en: 'Holiday', de: 'Feiertag' },
  'hr.shift_type.sick': { cs: 'Nemoc', en: 'Sick', de: 'Krankheit' },
  'hr.record_attendance': { cs: 'Zaznamenat docházku', en: 'Record Attendance', de: 'Anwesenheit erfassen' },
  'hr.checkin': { cs: 'Příchod', en: 'Check-in', de: 'Check-in' },
  'hr.checkout': { cs: 'Odchod', en: 'Check-out', de: 'Check-out' },
  'hr.no_records': { cs: 'Žádné záznamy', en: 'No records', de: 'Keine Einträge' },
  'hr.attendance_recorded': { cs: 'Docházka zaznamenána', en: 'Attendance recorded', de: 'Anwesenheit erfasst' },
  'hr.status.present': { cs: 'Přítomen', en: 'Present', de: 'Anwesend' },
  'hr.status.absent': { cs: 'Nepřítomen', en: 'Absent', de: 'Abwesend' },
  'hr.status.late': { cs: 'Pozdě', en: 'Late', de: 'Verspätet' },
  'hr.status.excused': { cs: 'Omluveno', en: 'Excused', de: 'Entschuldigt' },
  'hr.record': { cs: 'Zaznamenat', en: 'Record', de: 'Erfassen' },

  // Export Module
  'export.title': { cs: 'Zálohování & Export dat', en: 'Backup & Data Export', de: 'Backup & Datenexport' },
  'export.subtitle': { cs: 'Export dat jako CSV pro audity a účetnictví.', en: 'Export business data as CSV for audits and accounting.', de: 'Geschäftsdaten als CSV exportieren für Audits und Buchhaltung.' },
  'export.leads': { cs: 'Poptávky', en: 'Leads', de: 'Leads' },
  'export.leads_desc': { cs: 'Export všech kvalifikovaných poptávek.', en: 'Export all qualified leads.', de: 'Alle qualifizierten Leads exportieren.' },
  'export.bookings': { cs: 'Rezervace', en: 'Bookings', de: 'Buchungen' },
  'export.bookings_desc': { cs: 'Export rezervací a jejich stavů.', en: 'Export bookings and their statuses.', de: 'Terminbuchungen und Status exportieren.' },
  'export.invoices': { cs: 'Faktury', en: 'Invoices', de: 'Rechnungen' },
  'export.invoices_desc': { cs: 'Export fakturačních dat pro účetnictví.', en: 'Export invoice data for accounting.', de: 'Rechnungsdaten für Buchhaltung exportieren.' },
  'export.employees_label': { cs: 'Zaměstnanci', en: 'Employees', de: 'Mitarbeiter' },
  'export.employees_desc': { cs: 'Export personálních dat.', en: 'Export employee data.', de: 'Personaldaten exportieren.' },
  'export.newsletter': { cs: 'Newsletter', en: 'Newsletter', de: 'Newsletter' },
  'export.newsletter_desc': { cs: 'Export seznamu odběratelů.', en: 'Export subscriber list.', de: 'Abonnentenliste exportieren.' },
  'export.no_data': { cs: 'Žádná data k exportu', en: 'No data to export', de: 'Keine Daten zum Exportieren' },
  'export.success': { cs: 'úspěšně exportováno', en: 'successfully exported', de: 'erfolgreich exportiert' },
  'export.entries': { cs: 'záznamů', en: 'entries', de: 'Einträge' },
  'export.failed': { cs: 'Export se nezdařil', en: 'Export failed', de: 'Export fehlgeschlagen' },
  'export.exporting': { cs: 'Exportuji…', en: 'Exporting…', de: 'Exportiere…' },
  'export.re_export': { cs: 'Exportovat znovu', en: 'Re-export', de: 'Erneut exportieren' },
  'export.csv_export': { cs: 'Exportovat CSV', en: 'Export CSV', de: 'CSV exportieren' },
  'export.last_export': { cs: 'Poslední export', en: 'Last export', de: 'Letzter Export' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'cs';
    try {
      return initialLanguage(window.location.pathname, localStorage.getItem('fastmedia-language'));
    } catch {
      return initialLanguage(window.location.pathname, null);
    }
  });

  const handleSetLanguage = (nextLanguage: Language) => {
    const target = localizedPath(window.location.pathname, nextLanguage);
    setLanguageState(nextLanguage);
    try { localStorage.setItem('fastmedia-language', nextLanguage); } catch { /* Optional persistence. */ }
    if (target !== window.location.pathname) window.location.assign(`${target}${window.location.search}${window.location.hash}`);
  };

  useEffect(() => {
    document.documentElement.lang = languageLocales[language];
    try {
      localStorage.setItem('fastmedia-language', language);
    } catch {
      /* Browsing can continue when storage is unavailable. */
    }
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.cs || translation.en || key;
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
