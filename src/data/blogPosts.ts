import { industryBlogPosts } from './industryBlogPosts';
import { performanceBlogPosts } from './performanceBlogPosts';
import blogWebsiteTrends from '@/assets/blog/blog-website-trends.jpg';
import blogSeoTips from '@/assets/blog/blog-seo-tips.jpg';
import blogSocialMedia from '@/assets/blog/blog-social-media.jpg';
import blogRedesign from '@/assets/blog/blog-redesign.jpg';
import blogGoogleBusiness from '@/assets/blog/blog-google-business.jpg';
import blogMobileFirst from '@/assets/blog/blog-mobile-first.jpg';
import blogReviews from '@/assets/blog/blog-reviews.jpg';
import blogEmailMarketing from '@/assets/blog/blog-email-marketing.jpg';
import blogPhotography from '@/assets/blog/blog-photography.jpg';
import blogBranding from '@/assets/blog/blog-branding.jpg';
import blogSpeed from '@/assets/blog/blog-speed.jpg';
import blogBookingSystem from '@/assets/blog/blog-booking-system.jpg';
import inlineAnalytics from '@/assets/blog/inline-analytics.jpg';
import inlineTradesmanDigital from '@/assets/blog/inline-tradesman-digital.jpg';
import inlineWireframe from '@/assets/blog/inline-wireframe.jpg';
import inlineContentStrategy from '@/assets/blog/inline-content-strategy.jpg';

export type BlogCategory = 'webdesign' | 'seo' | 'marketing' | 'business' | 'tips';

export type ContentBlock =
  | { type: 'paragraph'; text: { cs: string; en: string; de: string } }
  | { type: 'heading'; text: { cs: string; en: string; de: string } }
  | { type: 'list'; items: { cs: string; en: string; de: string }[] }
  | { type: 'image'; src: string; alt: { cs: string; en: string; de: string }; caption?: { cs: string; en: string; de: string } }
  | { type: 'quote'; text: { cs: string; en: string; de: string }; author?: string }
  | { type: 'callout'; text: { cs: string; en: string; de: string } }
  | { type: 'video-embed'; url: string; caption: { cs: string; en: string; de: string } }
  | { type: 'cta'; text: { cs: string; en: string; de: string }; href: string; trackingLabel?: string }
  | { type: 'download'; href: string; label: { cs: string; en: string; de: string } };

export interface BlogPost {
  id: string;
  slug: string;
  title: { cs: string; en: string; de: string };
  excerpt: { cs: string; en: string; de: string };
  sections: ContentBlock[];
  category: BlogCategory;
  image: string;
  videoUrl?: string;
  author: string;
  authorRole: { cs: string; en: string; de: string };
  date: string;
  readTime: number;
  featured?: boolean;
  tags: string[];
}

export const categoryLabels: Record<BlogCategory, { cs: string; en: string; de: string }> = {
  webdesign: { cs: 'Webdesign', en: 'Web Design', de: 'Webdesign' },
  seo: { cs: 'SEO', en: 'SEO', de: 'SEO' },
  marketing: { cs: 'Marketing', en: 'Marketing', de: 'Marketing' },
  business: { cs: 'Podnikání', en: 'Business', de: 'Geschäft' },
  tips: { cs: 'Tipy & Triky', en: 'Tips & Tricks', de: 'Tipps & Tricks' },
};

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'trendy-webdesignu-2026',
    title: {
      cs: '7 trendů v webdesignu pro řemeslníky v roce 2026',
      en: '7 Web Design Trends for Tradespeople in 2026',
      de: '7 Webdesign-Trends für Handwerker im Jahr 2026',
    },
    excerpt: {
      cs: 'Zjistěte, jaké moderní prvky by měl mít každý řemeslnický web, aby přitáhl více zákazníků a vybudoval důvěru.',
      en: 'Discover what modern elements every trade website needs to attract more customers and build trust.',
      de: 'Erfahren Sie, welche modernen Elemente jede Handwerker-Website braucht, um mehr Kunden anzuziehen.',
    },
    sections: [
      {
        type: 'paragraph',
        text: {
          cs: 'Moderní web pro řemeslníky musí být rychlý, mobilní a vizuálně přitažlivý. V tomto článku prozkoumáme 7 klíčových trendů, které definují webdesign v roce 2026 – od tmavého režimu přes mikroanimace až po AI chatboty.',
          en: 'A modern trade website must be fast, mobile-friendly, and visually appealing. In this article, we explore 7 key trends defining web design in 2026 — from dark mode to micro-animations to AI chatbots.',
          de: 'Eine moderne Handwerker-Website muss schnell, mobilfreundlich und visuell ansprechend sein. In diesem Artikel erkunden wir 7 Schlüsseltrends, die das Webdesign 2026 definieren.',
        },
      },
      {
        type: 'heading',
        text: { cs: '1. Tmavý režim jako standard', en: '1. Dark Mode as Standard', de: '1. Dark Mode als Standard' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Tmavý režim již není jen trendy doplněk – je to očekávání. Moderní weby nabízejí automatický přepínač mezi světlým a tmavým režimem na základě preferencí systému návštěvníka. Pro řemeslníky to znamená, že jejich web bude pohodlný k prohlížení v jakékoli situaci.',
          en: 'Dark mode is no longer just a trendy add-on — it\'s an expectation. Modern websites offer an automatic toggle between light and dark themes based on the visitor\'s system preferences. For tradespeople, this means their site will be comfortable to browse in any situation.',
          de: 'Der Dark Mode ist kein trendiges Extra mehr – er ist eine Erwartung. Moderne Websites bieten einen automatischen Wechsel zwischen hellem und dunklem Theme basierend auf den Systemeinstellungen des Besuchers.',
        },
      },
      { type: 'image', src: inlineWireframe, alt: { cs: 'Wireframy moderního webu', en: 'Modern website wireframes', de: 'Wireframes einer modernen Website' }, caption: { cs: 'Plánování responzivního designu začíná wireframy', en: 'Planning responsive design starts with wireframes', de: 'Die Planung von responsivem Design beginnt mit Wireframes' } },
      {
        type: 'heading',
        text: { cs: '2. Mikroanimace pro lepší UX', en: '2. Micro-Animations for Better UX', de: '2. Mikroanimationen für bessere UX' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Jemné animace při scrollování, najetí myší nebo kliknutí vytvářejí pocit kvality a profesionality. Nemusí být složité – stačí plynulý přechod u tlačítek, animovaný vstup sekcí při scrollování nebo pulsující CTA tlačítko.',
          en: 'Subtle animations on scroll, hover, or click create a sense of quality and professionalism. They don\'t need to be complex — a smooth button transition, animated section entrance on scroll, or a pulsating CTA button is enough.',
          de: 'Subtile Animationen beim Scrollen, Hover oder Klicken erzeugen ein Gefühl von Qualität und Professionalität.',
        },
      },
      {
        type: 'list',
        items: [
          { cs: 'Plynulé přechody u hover efektů na tlačítkách a kartách', en: 'Smooth hover transitions on buttons and cards', de: 'Sanfte Hover-Übergänge bei Buttons und Karten' },
          { cs: 'Animovaný vstup sekcí při scrollování (fade-in, slide-up)', en: 'Animated section entrance on scroll (fade-in, slide-up)', de: 'Animierter Sektionseingang beim Scrollen (Fade-in, Slide-up)' },
          { cs: 'Načítací animace pro lepší vnímání rychlosti', en: 'Loading animations for better perceived performance', de: 'Ladeanimationen für bessere wahrgenommene Leistung' },
          { cs: 'Parallax efekty u hero sekcí', en: 'Parallax effects on hero sections', de: 'Parallax-Effekte bei Hero-Sektionen' },
        ],
      },
      {
        type: 'heading',
        text: { cs: '3. AI chatboty a automatizace', en: '3. AI Chatbots and Automation', de: '3. KI-Chatbots und Automatisierung' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Umělá inteligence mění způsob, jakým řemeslníci komunikují se zákazníky online. AI chatbot na vašem webu může automaticky odpovídat na běžné dotazy o cenách, dostupnosti a službách – 24 hodin denně, 7 dní v týdnu.',
          en: 'Artificial intelligence is changing how tradespeople communicate with customers online. An AI chatbot on your website can automatically answer common questions about pricing, availability, and services — 24/7.',
          de: 'Künstliche Intelligenz verändert die Art und Weise, wie Handwerker online mit Kunden kommunizieren.',
        },
      },
      { type: 'quote', text: { cs: 'Po nasazení chatbotu na web jsme zaznamenali 40% nárůst poptávek mimo pracovní dobu.', en: 'After deploying a chatbot on our site, we saw a 40% increase in inquiries outside business hours.', de: 'Nach der Einführung eines Chatbots auf unserer Website verzeichneten wir einen 40%igen Anstieg der Anfragen außerhalb der Geschäftszeiten.' }, author: 'Jan Kovář, instalatér z Prahy' },
      {
        type: 'heading',
        text: { cs: '4. Lokální SEO integrace', en: '4. Local SEO Integration', de: '4. Lokale SEO-Integration' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Web v roce 2026 musí být navržen s ohledem na lokální vyhledávání od samého začátku. To znamená strukturovaná data (Schema.org), správné meta značky a integraci s Google Moje firma přímo ve struktuře webu.',
          en: 'A 2026 website must be designed with local search in mind from the start. This means structured data (Schema.org), proper meta tags, and Google My Business integration built into the site structure.',
          de: 'Eine Website im Jahr 2026 muss von Anfang an mit Blick auf lokale Suche gestaltet werden.',
        },
      },
      { type: 'image', src: inlineAnalytics, alt: { cs: 'Analytika webového provozu', en: 'Website traffic analytics', de: 'Website-Traffic-Analytik' }, caption: { cs: 'Sledování klíčových metrik pomáhá optimalizovat výkon webu', en: 'Tracking key metrics helps optimize website performance', de: 'Die Verfolgung wichtiger Metriken hilft bei der Optimierung der Website-Leistung' } },
      {
        type: 'heading',
        text: { cs: '5. Video jako primární obsah', en: '5. Video as Primary Content', de: '5. Video als primärer Inhalt' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Krátká videa z realizací, time-lapse záběry a video testimonials zákazníků se stávají standardem. Weby s videem mají až 80% vyšší konverzní poměr a návštěvníci na nich stráví průměrně 2,6× více času.',
          en: 'Short project videos, time-lapse clips, and video testimonials are becoming the standard. Websites with video have up to 80% higher conversion rates, and visitors spend an average of 2.6× more time on them.',
          de: 'Kurze Projektvideos, Time-Lapse-Aufnahmen und Video-Testimonials werden zum Standard.',
        },
      },
      {
        type: 'heading',
        text: { cs: '6. Bezpečnost a důvěra', en: '6. Security and Trust', de: '6. Sicherheit und Vertrauen' },
      },
      {
        type: 'list',
        items: [
          { cs: 'SSL certifikát je naprostá nutnost (HTTPS)', en: 'SSL certificate is an absolute must (HTTPS)', de: 'SSL-Zertifikat ist ein absolutes Muss (HTTPS)' },
          { cs: 'Zobrazení recenzí z Google a sociálních sítí', en: 'Display of reviews from Google and social media', de: 'Anzeige von Bewertungen aus Google und sozialen Medien' },
          { cs: 'Transparentní ceník a kontaktní informace', en: 'Transparent pricing and contact information', de: 'Transparente Preisliste und Kontaktinformationen' },
          { cs: 'GDPR-kompatibilní formuláře a cookie lišta', en: 'GDPR-compliant forms and cookie banner', de: 'DSGVO-konforme Formulare und Cookie-Banner' },
        ],
      },
      {
        type: 'heading',
        text: { cs: '7. Přístupnost pro všechny', en: '7. Accessibility for Everyone', de: '7. Barrierefreiheit für alle' },
      },
      {
        type: 'paragraph',
        text: {
          cs: 'Přístupnost webu (a11y) není jen právní požadavek – je to obchodní příležitost. Web optimalizovaný pro přístupnost osloví širší publikum a zároveň získá lepší hodnocení ve vyhledávačích.',
          en: 'Web accessibility (a11y) isn\'t just a legal requirement — it\'s a business opportunity. An accessibility-optimized site reaches a wider audience and also earns better search engine rankings.',
          de: 'Web-Barrierefreiheit (a11y) ist nicht nur eine rechtliche Anforderung – es ist eine Geschäftsmöglichkeit.',
        },
      },
      { type: 'callout', text: { cs: '💡 Tip: Začněte audit přístupnosti pomocí bezplatného nástroje Lighthouse v prohlížeči Chrome. Zaměřte se na kontrastní poměry, alt texty obrázků a klávesovou navigaci.', en: '💡 Tip: Start an accessibility audit using the free Lighthouse tool in Chrome. Focus on contrast ratios, image alt text, and keyboard navigation.', de: '💡 Tipp: Starten Sie ein Barrierefreiheits-Audit mit dem kostenlosen Lighthouse-Tool in Chrome.' } },
    ],
    category: 'webdesign',
    image: blogWebsiteTrends,
    videoUrl: 'https://www.youtube.com/watch?v=rFyOIWMwRdg',
    author: 'Martin Novák',
    authorRole: { cs: 'Hlavní designér', en: 'Lead Designer', de: 'Leitender Designer' },
    date: '2026-02-05',
    readTime: 8,
    featured: true,
    tags: ['webdesign', 'trendy', 'UX'],
  },
  {
    id: '2',
    slug: 'seo-tipy-remeslnici',
    title: {
      cs: 'SEO pro řemeslníky: 10 tipů jak se dostat na první stránku Google',
      en: 'SEO for Tradespeople: 10 Tips to Reach Google\'s First Page',
      de: 'SEO für Handwerker: 10 Tipps für die erste Google-Seite',
    },
    excerpt: {
      cs: 'Praktický průvodce optimalizací pro vyhledávače, který vám pomůže získat více zákazníků z organického vyhledávání.',
      en: 'A practical guide to search engine optimization to help you gain more customers from organic search.',
      de: 'Ein praktischer Leitfaden zur Suchmaschinenoptimierung für mehr Kunden aus der organischen Suche.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'SEO je klíčem k online viditelnosti. Pro řemeslníky je zvláště důležité lokální SEO – optimalizace pro vyhledávání v konkrétním regionu. V tomto komplexním průvodci vám ukážeme 10 osvědčených strategií.', en: 'SEO is the key to online visibility. For tradespeople, local SEO is especially important — optimization for searches in specific regions. In this comprehensive guide, we show you 10 proven strategies.', de: 'SEO ist der Schlüssel zur Online-Sichtbarkeit. Für Handwerker ist lokales SEO besonders wichtig.' } },
      { type: 'heading', text: { cs: 'Klíčová slova: Základ úspěchu', en: 'Keywords: The Foundation of Success', de: 'Schlüsselwörter: Die Grundlage des Erfolgs' } },
      { type: 'paragraph', text: { cs: 'Výzkum klíčových slov je první a nejdůležitější krok. Zaměřte se na long-tail klíčová slova specifická pro váš obor a region – například „instalatér Praha 5 nonstop" místo pouhého „instalatér".', en: 'Keyword research is the first and most important step. Focus on long-tail keywords specific to your trade and region — for example, "emergency plumber London SE1" instead of just "plumber".', de: 'Die Keyword-Recherche ist der erste und wichtigste Schritt.' } },
      { type: 'list', items: [
        { cs: 'Používejte Google Keyword Planner pro výzkum klíčových slov', en: 'Use Google Keyword Planner for keyword research', de: 'Verwenden Sie den Google Keyword Planner' },
        { cs: 'Zaměřte se na lokální modifikátory (město, čtvrť, PSČ)', en: 'Focus on local modifiers (city, neighborhood, zip code)', de: 'Konzentrieren Sie sich auf lokale Modifikatoren' },
        { cs: 'Analyzujte konkurenci – jaká slova používají úspěšní řemeslníci', en: 'Analyze competitors — what keywords do successful tradespeople use', de: 'Analysieren Sie die Konkurrenz' },
        { cs: 'Sledujte trendy vyhledávání pomocí Google Trends', en: 'Track search trends using Google Trends', de: 'Verfolgen Sie Suchtrends mit Google Trends' },
      ] },
      { type: 'image', src: inlineContentStrategy, alt: { cs: 'Plánování obsahové strategie', en: 'Content strategy planning', de: 'Planung der Content-Strategie' }, caption: { cs: 'Obsahová strategie je klíčem k dlouhodobému SEO úspěchu', en: 'Content strategy is key to long-term SEO success', de: 'Content-Strategie ist der Schlüssel zum langfristigen SEO-Erfolg' } },
      { type: 'heading', text: { cs: 'Technické SEO: Co nesmíte přehlédnout', en: 'Technical SEO: What You Must Not Overlook', de: 'Technisches SEO: Was Sie nicht übersehen dürfen' } },
      { type: 'paragraph', text: { cs: 'Technické SEO zahrnuje všechny aspekty webu, které ovlivňují jeho indexaci vyhledávači. Od rychlosti načítání přes mobilní optimalizaci až po správnou strukturu URL adres.', en: 'Technical SEO encompasses all aspects of a website that affect its indexing by search engines. From loading speed to mobile optimization to proper URL structure.', de: 'Technisches SEO umfasst alle Aspekte einer Website, die ihre Indexierung durch Suchmaschinen beeinflussen.' } },
      { type: 'callout', text: { cs: '⚡ Rychlost webu je kritický faktor. Google od roku 2024 penalizuje weby, které se načítají déle než 3 sekundy. Investice do rychlého hostingu a optimalizace obrázků se mnohonásobně vrátí.', en: '⚡ Website speed is a critical factor. Google since 2024 penalizes sites that take longer than 3 seconds to load. Investment in fast hosting and image optimization pays off many times over.', de: '⚡ Website-Geschwindigkeit ist ein kritischer Faktor.' } },
      { type: 'heading', text: { cs: 'Lokální citace a NAP konzistence', en: 'Local Citations and NAP Consistency', de: 'Lokale Zitierungen und NAP-Konsistenz' } },
      { type: 'paragraph', text: { cs: 'NAP znamená Name, Address, Phone (Jméno, Adresa, Telefon). Konzistentní NAP údaje napříč všemi online platformami – od vašeho webu přes Google Moje firma po Firmy.cz – jsou zásadní pro lokální SEO.', en: 'NAP stands for Name, Address, Phone. Consistent NAP information across all online platforms — from your website to Google My Business to directory listings — is crucial for local SEO.', de: 'NAP steht für Name, Adresse, Telefon. Konsistente NAP-Informationen über alle Online-Plattformen hinweg sind entscheidend für lokales SEO.' } },
    ],
    category: 'seo',
    image: blogSeoTips,
    author: 'Petra Dvořáková',
    authorRole: { cs: 'SEO specialistka', en: 'SEO Specialist', de: 'SEO-Spezialistin' },
    date: '2026-01-28',
    readTime: 12,
    featured: true,
    tags: ['SEO', 'Google', 'lokální SEO'],
  },
  {
    id: '3',
    slug: 'socialni-site-remeslnici',
    title: {
      cs: 'Jak využít sociální sítě pro řemeslnické podnikání',
      en: 'How to Leverage Social Media for Your Trade Business',
      de: 'Wie Sie Social Media für Ihr Handwerksunternehmen nutzen',
    },
    excerpt: {
      cs: 'Facebook, Instagram, TikTok – kde a jak prezentovat své řemeslnické služby na sociálních sítích pro maximální dosah.',
      en: 'Facebook, Instagram, TikTok — where and how to showcase your trade services on social media for maximum reach.',
      de: 'Facebook, Instagram, TikTok — wo und wie Sie Ihre Handwerksleistungen in sozialen Medien präsentieren.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Sociální sítě jsou mocným nástrojem pro řemeslníky. V roce 2026 už nestačí mít jen web – musíte být tam, kde jsou vaši zákazníci. A ti jsou na sociálních sítích.', en: 'Social media is a powerful tool for tradespeople. In 2026, having just a website isn\'t enough — you need to be where your customers are. And they\'re on social media.', de: 'Social Media ist ein mächtiges Werkzeug für Handwerker.' } },
      { type: 'heading', text: { cs: 'Kde být přítomen?', en: 'Where Should You Be Present?', de: 'Wo sollten Sie präsent sein?' } },
      { type: 'list', items: [
        { cs: 'Facebook – stále nejsilnější pro lokální podnikání a skupiny', en: 'Facebook — still strongest for local business and groups', de: 'Facebook — immer noch am stärksten für lokale Unternehmen' },
        { cs: 'Instagram – ideální pro vizuální prezentaci realizací (fotky, Reels)', en: 'Instagram — ideal for visual project showcases (photos, Reels)', de: 'Instagram — ideal für visuelle Projektpräsentationen' },
        { cs: 'TikTok – rostoucí platforma pro krátká „how-to" a „behind the scenes" videa', en: 'TikTok — growing platform for short how-to and behind-the-scenes videos', de: 'TikTok — wachsende Plattform für kurze How-to-Videos' },
        { cs: 'LinkedIn – pro B2B řemeslníky a spolupráce s developery', en: 'LinkedIn — for B2B tradespeople and developer partnerships', de: 'LinkedIn — für B2B-Handwerker und Entwicklerpartnerschaften' },
      ] },
      { type: 'image', src: inlineTradesmanDigital, alt: { cs: 'Řemeslník pracující na digitální strategii', en: 'Tradesman working on digital strategy', de: 'Handwerker arbeitet an digitaler Strategie' }, caption: { cs: 'Moderní řemeslník kombinuje tradiční dovednosti s digitálním marketingem', en: 'The modern tradesperson combines traditional skills with digital marketing', de: 'Der moderne Handwerker kombiniert traditionelle Fähigkeiten mit digitalem Marketing' } },
      { type: 'heading', text: { cs: 'Obsah, který funguje', en: 'Content That Works', de: 'Inhalte, die funktionieren' } },
      { type: 'paragraph', text: { cs: 'Nejúspěšnější obsah pro řemeslníky na sociálních sítích jsou fotky a videa z realizací – „before & after" příspěvky, time-lapse záběry a příběhy spokojených zákazníků.', en: 'The most successful content for tradespeople on social media includes project photos and videos — before & after posts, time-lapse clips, and satisfied customer stories.', de: 'Die erfolgreichsten Inhalte für Handwerker sind Projekt-Fotos und -Videos.' } },
      { type: 'quote', text: { cs: 'Jeden TikTok s přeměnou staré koupelny nám přinesl více než 50 poptávek za týden. Organický dosah krátkých videí je obrovský.', en: 'One TikTok of a bathroom transformation brought us more than 50 inquiries in a week. The organic reach of short videos is enormous.', de: 'Ein TikTok einer Badrenovierung brachte uns mehr als 50 Anfragen in einer Woche.' }, author: 'Tomáš Fiala, koupelnový specialista' },
    ],
    category: 'marketing',
    image: blogSocialMedia,
    videoUrl: 'https://www.youtube.com/watch?v=9wuzxFGxxJ8',
    author: 'Jakub Procházka',
    authorRole: { cs: 'Marketing manažer', en: 'Marketing Manager', de: 'Marketing Manager' },
    date: '2026-01-20',
    readTime: 6,
    tags: ['sociální sítě', 'marketing', 'Instagram'],
  },
  {
    id: '4',
    slug: 'redesign-webu-kdy-a-proc',
    title: {
      cs: 'Kdy je čas na redesign webu? 5 varovných signálů',
      en: 'When Is It Time for a Website Redesign? 5 Warning Signs',
      de: 'Wann ist es Zeit für ein Website-Redesign? 5 Warnsignale',
    },
    excerpt: {
      cs: 'Poznáte, kdy váš web potřebuje modernizaci? Představujeme 5 klíčových signálů, že je čas investovat do nového designu.',
      en: 'Know when your website needs modernization? We present 5 key signs that it\'s time to invest in a new design.',
      de: 'Wissen Sie, wann Ihre Website modernisiert werden muss? 5 wichtige Signale.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Zastaralý web může stát vaše podnikání zákazníky. První dojem se tvoří během 0,05 sekundy – a pokud váš web vypadá jako z roku 2015, návštěvníci odejdou dříve, než si přečtou vaši nabídku.', en: 'An outdated website can cost your business customers. First impressions are formed in 0.05 seconds — and if your site looks like it\'s from 2015, visitors will leave before reading your offer.', de: 'Eine veraltete Website kann Ihr Unternehmen Kunden kosten.' } },
      { type: 'heading', text: { cs: '1. Vysoká míra okamžitého opuštění', en: '1. High Bounce Rate', de: '1. Hohe Absprungrate' } },
      { type: 'paragraph', text: { cs: 'Pokud více než 60 % návštěvníků opouští váš web během prvních 30 sekund, je to jasný signál problému. Příčinou může být pomalé načítání, neatraktivní design nebo matoucí navigace.', en: 'If more than 60% of visitors leave your site within the first 30 seconds, it\'s a clear signal of a problem. The cause could be slow loading, unattractive design, or confusing navigation.', de: 'Wenn mehr als 60 % der Besucher Ihre Website innerhalb der ersten 30 Sekunden verlassen, ist das ein klares Warnsignal.' } },
      { type: 'heading', text: { cs: '2. Web není responzivní', en: '2. The Site Isn\'t Responsive', de: '2. Die Website ist nicht responsiv' } },
      { type: 'paragraph', text: { cs: 'V roce 2026 přichází přes 75 % návštěvníků řemeslnických webů z mobilních zařízení. Pokud váš web není plně responzivní, přicházíte o tři čtvrtiny potenciálních zákazníků.', en: 'In 2026, over 75% of trade website visitors come from mobile devices. If your site isn\'t fully responsive, you\'re losing three-quarters of potential customers.', de: 'Im Jahr 2026 kommen über 75 % der Besucher von Handwerker-Websites über mobile Geräte.' } },
      { type: 'heading', text: { cs: '3. Nízký konverzní poměr', en: '3. Low Conversion Rate', de: '3. Niedrige Konversionsrate' } },
      { type: 'paragraph', text: { cs: 'Pokud váš web generuje návštěvnost, ale málo poptávek, problém je v designu konverzního tunelu. Chybí jasné CTA (výzvy k akci), kontaktní formulář je příliš složitý nebo nejsou viditelné recenze.', en: 'If your website generates traffic but few inquiries, the problem is in the conversion funnel design. Clear CTAs are missing, the contact form is too complex, or reviews aren\'t visible.', de: 'Wenn Ihre Website Traffic generiert, aber wenige Anfragen, liegt das Problem im Conversion-Funnel-Design.' } },
      { type: 'callout', text: { cs: '📊 Průměrný konverzní poměr řemeslnických webů je 2–5 %. Pokud je váš pod 1 %, je čas na zásadní změny. Moderní web s optimalizovanými CTA může dosáhnout 5–8 %.', en: '📊 The average conversion rate for trade websites is 2–5%. If yours is below 1%, it\'s time for major changes. A modern site with optimized CTAs can achieve 5–8%.', de: '📊 Die durchschnittliche Konversionsrate von Handwerker-Websites liegt bei 2–5 %.' } },
      { type: 'heading', text: { cs: '4. Zastaralý vizuální styl', en: '4. Outdated Visual Style', de: '4. Veralteter visueller Stil' } },
      { type: 'paragraph', text: { cs: 'Weby stárnou vizuálně rychleji, než si myslíte. Trendy jako skeuomorfismus, stíny s ostrými hranami nebo neon barvy z roku 2018 dnes působí amatérsky. Investice do moderního, čistého designu je investicí do důvěry zákazníků.', en: 'Websites age visually faster than you think. Trends like skeuomorphism, hard-edge shadows, or neon colors from 2018 look amateurish today. Investing in modern, clean design is investing in customer trust.', de: 'Websites altern visuell schneller, als Sie denken.' } },
      { type: 'heading', text: { cs: '5. Složitá správa obsahu', en: '5. Difficult Content Management', de: '5. Schwierige Inhaltsverwaltung' } },
      { type: 'paragraph', text: { cs: 'Pokud musíte kvůli každé drobné změně na webu volat vývojáře, je čas na moderní řešení. Současné weby nabízejí intuitivní správu obsahu, kde můžete sami aktualizovat texty, fotky a ceníky.', en: 'If you have to call a developer for every minor website change, it\'s time for a modern solution. Today\'s websites offer intuitive content management where you can update texts, photos, and pricing yourself.', de: 'Wenn Sie für jede kleine Website-Änderung einen Entwickler anrufen müssen, ist es Zeit für eine moderne Lösung.' } },
    ],
    category: 'webdesign',
    image: blogRedesign,
    author: 'Martin Novák',
    authorRole: { cs: 'Hlavní designér', en: 'Lead Designer', de: 'Leitender Designer' },
    date: '2026-01-15',
    readTime: 5,
    tags: ['redesign', 'modernizace', 'UX'],
  },
  {
    id: '5',
    slug: 'google-moje-firma',
    title: {
      cs: 'Google Moje firma: Kompletní průvodce pro řemeslníky',
      en: 'Google My Business: Complete Guide for Tradespeople',
      de: 'Google My Business: Kompletter Leitfaden für Handwerker',
    },
    excerpt: {
      cs: 'Nastavte si Google Moje firma profil správně a získejte více lokálních zákazníků. Krok za krokem včetně tipů na recenze.',
      en: 'Set up your Google My Business profile correctly and gain more local customers. Step by step including review tips.',
      de: 'Richten Sie Ihr Google My Business Profil richtig ein und gewinnen Sie mehr lokale Kunden.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Google Moje firma (Google Business Profile) je nejdůležitější bezplatný nástroj pro lokální marketing řemeslníků. Správně nastavený profil vás umístí na mapu Google, do lokálních výsledků vyhledávání a dá zákazníkům možnost vás hodnotit.', en: 'Google My Business (Google Business Profile) is the most important free local marketing tool for tradespeople. A properly set up profile puts you on Google Maps, in local search results, and gives customers the ability to review you.', de: 'Google My Business ist das wichtigste kostenlose lokale Marketing-Tool für Handwerker.' } },
      { type: 'heading', text: { cs: 'Krok 1: Registrace a verifikace', en: 'Step 1: Registration and Verification', de: 'Schritt 1: Registrierung und Verifizierung' } },
      { type: 'paragraph', text: { cs: 'Prvním krokem je vytvoření profilu na business.google.com a verifikace vaší firmy. Google obvykle pošle pohlednici s kódem na vaši adresu, což trvá 5–14 dní. Bez verifikace profil nebude viditelný ve vyhledávání.', en: 'The first step is creating a profile at business.google.com and verifying your business. Google usually sends a postcard with a code to your address, which takes 5–14 days.', de: 'Der erste Schritt ist die Erstellung eines Profils auf business.google.com und die Verifizierung Ihres Unternehmens.' } },
      { type: 'heading', text: { cs: 'Krok 2: Optimalizace profilu', en: 'Step 2: Profile Optimization', de: 'Schritt 2: Profiloptimierung' } },
      { type: 'list', items: [
        { cs: 'Vyplňte všechny dostupné kategorie a podkategorie', en: 'Fill in all available categories and subcategories', de: 'Füllen Sie alle verfügbaren Kategorien und Unterkategorien aus' },
        { cs: 'Nahrajte minimálně 10 kvalitních fotografií vašich realizací', en: 'Upload at least 10 quality photos of your projects', de: 'Laden Sie mindestens 10 Qualitätsfotos Ihrer Projekte hoch' },
        { cs: 'Napište popis firmy s klíčovými slovy (750 znaků)', en: 'Write a business description with keywords (750 characters)', de: 'Schreiben Sie eine Firmenbeschreibung mit Schlüsselwörtern' },
        { cs: 'Nastavte přesné otevírací hodiny včetně svátků', en: 'Set precise opening hours including holidays', de: 'Legen Sie genaue Öffnungszeiten einschließlich Feiertagen fest' },
        { cs: 'Přidejte všechny nabízené služby s cenami', en: 'Add all offered services with prices', de: 'Fügen Sie alle angebotenen Dienstleistungen mit Preisen hinzu' },
      ] },
      { type: 'quote', text: { cs: 'Od optimalizace Google profilu jsme zaznamenali 3× více telefonních hovorů přímo z vyhledávání. Lidé nás najdou, aniž by museli navštívit náš web.', en: 'Since optimizing our Google profile, we\'ve seen 3× more phone calls directly from search. People find us without even needing to visit our website.', de: 'Seit der Optimierung unseres Google-Profils verzeichnen wir 3× mehr Telefonanrufe direkt aus der Suche.' }, author: 'Pavel Horák, elektrikář' },
    ],
    category: 'business',
    image: blogGoogleBusiness,
    videoUrl: 'https://www.youtube.com/watch?v=5cT9-kQQNaA',
    author: 'Petra Dvořáková',
    authorRole: { cs: 'SEO specialistka', en: 'SEO Specialist', de: 'SEO-Spezialistin' },
    date: '2026-01-08',
    readTime: 10,
    tags: ['Google', 'lokální marketing', 'recenze'],
  },
  {
    id: '6',
    slug: 'mobilni-web-proc',
    title: {
      cs: 'Proč musí být váš web mobilní? Čísla, která přesvědčí',
      en: 'Why Must Your Website Be Mobile? Numbers That Convince',
      de: 'Warum muss Ihre Website mobilfreundlich sein? Überzeugende Zahlen',
    },
    excerpt: {
      cs: 'Více než 70 % vašich potenciálních zákazníků vás hledá na mobilu. Zjistěte, proč je responzivní design nutností.',
      en: 'Over 70% of your potential customers search for you on mobile. Find out why responsive design is a must.',
      de: 'Über 70 % Ihrer potenziellen Kunden suchen Sie mobil.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Mobilní web není luxus, ale nutnost. Statistiky za rok 2025 jasně ukazují: více než 73 % vyhledávání řemeslnických služeb probíhá na mobilních zařízeních.', en: 'A mobile website isn\'t a luxury, it\'s a necessity. 2025 statistics clearly show: over 73% of searches for trade services happen on mobile devices.', de: 'Eine mobile Website ist kein Luxus, sondern eine Notwendigkeit.' } },
      { type: 'heading', text: { cs: 'Statistiky, které mluví jasně', en: 'Statistics That Speak Clearly', de: 'Statistiken, die klar sprechen' } },
      { type: 'list', items: [
        { cs: '73 % vyhledávání řemeslnických služeb je z mobilních zařízení', en: '73% of trade service searches are from mobile devices', de: '73 % der Suchen nach Handwerkerleistungen stammen von Mobilgeräten' },
        { cs: '53 % uživatelů opustí stránku, pokud se načítá déle než 3 sekundy na mobilu', en: '53% of users abandon a page if it takes longer than 3 seconds to load on mobile', de: '53 % der Nutzer verlassen eine Seite, wenn sie auf dem Handy länger als 3 Sekunden lädt' },
        { cs: '61 % uživatelů se nikdy nevrátí na web s špatným mobilním zážitkem', en: '61% of users never return to a site with a poor mobile experience', de: '61 % der Nutzer kehren nie zu einer Website mit schlechter mobiler Erfahrung zurück' },
        { cs: 'Google od 2021 používá mobile-first indexing', en: 'Google has been using mobile-first indexing since 2021', de: 'Google verwendet seit 2021 Mobile-First-Indexierung' },
      ] },
      { type: 'image', src: inlineAnalytics, alt: { cs: 'Mobilní vs. desktopový provoz', en: 'Mobile vs. desktop traffic', de: 'Mobiler vs. Desktop-Traffic' }, caption: { cs: 'Podíl mobilního provozu roste každým rokem', en: 'Mobile traffic share grows every year', de: 'Der Anteil des mobilen Traffics wächst jedes Jahr' } },
      { type: 'callout', text: { cs: '📱 Test mobilní přívětivosti: Otevřete si vlastní web na telefonu. Můžete snadno najít kontaktní číslo? Odeslat formulář? Pokud ne, přicházíte o zakázky každý den.', en: '📱 Mobile-friendliness test: Open your own website on your phone. Can you easily find the contact number? Submit a form? If not, you\'re losing business every day.', de: '📱 Test der Mobilfreundlichkeit: Öffnen Sie Ihre eigene Website auf dem Handy.' } },
    ],
    category: 'webdesign',
    image: blogMobileFirst,
    author: 'Jakub Procházka',
    authorRole: { cs: 'Marketing manažer', en: 'Marketing Manager', de: 'Marketing Manager' },
    date: '2025-12-20',
    readTime: 7,
    tags: ['mobilní', 'responzivní', 'UX'],
  },
  {
    id: '7',
    slug: 'online-recenze-strategie',
    title: {
      cs: 'Jak získat více online recenzí: Strategie pro řemeslníky',
      en: 'How to Get More Online Reviews: Strategies for Tradespeople',
      de: 'Mehr Online-Bewertungen erhalten: Strategien für Handwerker',
    },
    excerpt: {
      cs: 'Online recenze jsou nový word-of-mouth marketing. Naučte se systematicky získávat pozitivní hodnocení od zákazníků.',
      en: 'Online reviews are the new word-of-mouth marketing. Learn how to systematically gain positive ratings.',
      de: 'Online-Bewertungen sind das neue Mundpropaganda-Marketing.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Pozitivní recenze mohou dramaticky zvýšit vaše tržby. Studie ukazují, že 88 % spotřebitelů důvěřuje online recenzím stejně jako osobním doporučením.', en: 'Positive reviews can dramatically increase your revenue. Studies show that 88% of consumers trust online reviews as much as personal recommendations.', de: 'Positive Bewertungen können Ihren Umsatz dramatisch steigern.' } },
      { type: 'heading', text: { cs: 'Kdy požádat o recenzi?', en: 'When to Ask for a Review?', de: 'Wann sollte man um eine Bewertung bitten?' } },
      { type: 'paragraph', text: { cs: 'Nejlepší okamžik pro žádost o recenzi je ihned po dokončení práce, kdy je zákazník nadšený z výsledku. Nečekejte dny ani týdny – emocionalní moment rychle vyprchá.', en: 'The best moment to ask for a review is immediately after completing the work, when the customer is excited about the result. Don\'t wait days or weeks — the emotional moment fades quickly.', de: 'Der beste Moment für eine Bewertungsanfrage ist direkt nach Abschluss der Arbeit.' } },
      { type: 'list', items: [
        { cs: 'Požádejte osobně po dokončení práce', en: 'Ask in person after completing the work', de: 'Bitten Sie persönlich nach Abschluss der Arbeit' },
        { cs: 'Pošlete SMS s přímým odkazem na Google recenzi do 24 hodin', en: 'Send an SMS with a direct Google review link within 24 hours', de: 'Senden Sie eine SMS mit direktem Google-Bewertungslink innerhalb von 24 Stunden' },
        { cs: 'Přidejte QR kód na fakturu nebo vizitku', en: 'Add a QR code to your invoice or business card', de: 'Fügen Sie einen QR-Code auf Ihre Rechnung oder Visitenkarte hinzu' },
        { cs: 'Reagujte na každou recenzi – pozitivní i negativní', en: 'Respond to every review — positive and negative', de: 'Reagieren Sie auf jede Bewertung — positiv und negativ' },
      ] },
      { type: 'quote', text: { cs: 'Systém automatických SMS připomínek nám zvýšil počet recenzí o 300 %. Teď máme přes 150 pětihvězdičkových hodnocení.', en: 'The automated SMS reminder system increased our reviews by 300%. We now have over 150 five-star ratings.', de: 'Das automatische SMS-Erinnerungssystem steigerte unsere Bewertungen um 300 %.' }, author: 'Marek Novotný, malíř' },
    ],
    category: 'marketing',
    image: blogReviews,
    author: 'Petra Dvořáková',
    authorRole: { cs: 'SEO specialistka', en: 'SEO Specialist', de: 'SEO-Spezialistin' },
    date: '2025-12-12',
    readTime: 9,
    tags: ['recenze', 'reputace', 'důvěra'],
  },
  {
    id: '8',
    slug: 'email-marketing-remeslnici',
    title: {
      cs: 'E-mail marketing pro řemeslníky: Jak udržet zákazníky',
      en: 'Email Marketing for Tradespeople: How to Retain Customers',
      de: 'E-Mail-Marketing für Handwerker: So behalten Sie Kunden',
    },
    excerpt: {
      cs: 'Newsletters a automatizované e-maily mohou výrazně zvýšit opakované zakázky. Praktický průvodce pro začátečníky.',
      en: 'Newsletters and automated emails can significantly increase repeat business. A practical beginner\'s guide.',
      de: 'Newsletter und automatisierte E-Mails können die Stammkundenquote erhöhen.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'E-mail marketing zůstává jedním z nejvýnosnějších kanálů s průměrnou návratností 42 Kč na každou investovanou 1 Kč. Pro řemeslníky představuje skvělou příležitost pro budování dlouhodobých vztahů se zákazníky.', en: 'Email marketing remains one of the most profitable channels with an average return of $36 for every $1 spent. For tradespeople, it represents a great opportunity for building long-term customer relationships.', de: 'E-Mail-Marketing bleibt einer der profitabelsten Kanäle.' } },
      { type: 'heading', text: { cs: 'Typy e-mailů, které fungují', en: 'Types of Emails That Work', de: 'Arten von E-Mails, die funktionieren' } },
      { type: 'list', items: [
        { cs: 'Uvítací e-mail po první zakázce s poděkováním a žádostí o recenzi', en: 'Welcome email after first job with thanks and review request', de: 'Willkommens-E-Mail nach dem ersten Auftrag mit Dank und Bewertungsanfrage' },
        { cs: 'Sezonní připomínky (kontrola topení před zimou, čištění okapů na jaře)', en: 'Seasonal reminders (heating check before winter, gutter cleaning in spring)', de: 'Saisonale Erinnerungen (Heizungskontrolle vor dem Winter)' },
        { cs: 'Newsletter s tipy a radami pro údržbu domácnosti', en: 'Newsletter with tips and advice for home maintenance', de: 'Newsletter mit Tipps und Ratschlägen für die Hauspflege' },
        { cs: 'Speciální nabídky pro stávající zákazníky', en: 'Special offers for existing customers', de: 'Sonderangebote für bestehende Kunden' },
      ] },
      { type: 'callout', text: { cs: '💌 Tip: Nezapomeňte na segmentaci. Zákazníkovi, kterému jste opravovali topení, pošlete připomínku na roční servis – ne nabídku na novou kuchyň.', en: '💌 Tip: Don\'t forget about segmentation. Send the customer whose heating you fixed a reminder for annual service — not an offer for a new kitchen.', de: '💌 Tipp: Vergessen Sie die Segmentierung nicht.' } },
    ],
    category: 'marketing',
    image: blogEmailMarketing,
    author: 'Jakub Procházka',
    authorRole: { cs: 'Marketing manažer', en: 'Marketing Manager', de: 'Marketing Manager' },
    date: '2025-12-01',
    readTime: 11,
    tags: ['e-mail', 'newsletter', 'retence'],
  },
  {
    id: '9',
    slug: 'fotografie-pro-web',
    title: {
      cs: 'Jak fotit své práce pro web: Průvodce pro řemeslníky',
      en: 'How to Photograph Your Work for the Web: A Trade Guide',
      de: 'Wie Sie Ihre Arbeit für das Web fotografieren: Ein Handwerker-Guide',
    },
    excerpt: {
      cs: 'Kvalitní fotografie jsou základ úspěšného webu. Naučte se jednoduché triky, jak nafotit své realizace profesionálně i mobilem.',
      en: 'Quality photos are the foundation of a successful website. Learn simple tricks to photograph your projects professionally.',
      de: 'Qualitätsfotos sind die Grundlage einer erfolgreichen Website.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Fotografie prodávají. Podle studií mají weby s kvalitními fotografiemi o 94 % vyšší návštěvnost a návštěvníci jim důvěřují 2× více. A přitom nepotřebujete drahý fotoaparát – moderní smartphone stačí.', en: 'Photos sell. According to studies, websites with quality photos get 94% more traffic, and visitors trust them 2× more. And you don\'t need an expensive camera — a modern smartphone is enough.', de: 'Fotos verkaufen. Laut Studien erhalten Websites mit Qualitätsfotos 94 % mehr Traffic.' } },
      { type: 'heading', text: { cs: 'Základní pravidla fotografie realizací', en: 'Basic Rules for Project Photography', de: 'Grundregeln für Projektfotografie' } },
      { type: 'list', items: [
        { cs: 'Foťte vždy „before & after" – kontrast je nejsilnější prodejní nástroj', en: 'Always shoot before & after — contrast is the strongest sales tool', de: 'Fotografieren Sie immer Vorher & Nachher' },
        { cs: 'Využívejte přirozené světlo – foťte přes den u okna nebo venku', en: 'Use natural light — shoot during the day near windows or outside', de: 'Nutzen Sie natürliches Licht — fotografieren Sie tagsüber am Fenster' },
        { cs: 'Udržujte prostředí čisté a uklizené před fotografováním', en: 'Keep the environment clean and tidy before photographing', de: 'Halten Sie die Umgebung sauber und aufgeräumt vor dem Fotografieren' },
        { cs: 'Používejte kompoziční pravidlo třetin', en: 'Use the rule of thirds for composition', de: 'Verwenden Sie die Drittelregel für die Komposition' },
        { cs: 'Foťte z více úhlů – celkový záběr i detaily', en: 'Shoot from multiple angles — overall shots and details', de: 'Fotografieren Sie aus mehreren Winkeln' },
      ] },
      { type: 'image', src: inlineTradesmanDigital, alt: { cs: 'Řemeslník dokumentuje svou práci', en: 'Tradesman documenting his work', de: 'Handwerker dokumentiert seine Arbeit' }, caption: { cs: 'Dokumentujte svou práci průběžně – nejlepší záběry vznikají spontánně', en: 'Document your work continuously — the best shots happen spontaneously', de: 'Dokumentieren Sie Ihre Arbeit fortlaufend' } },
      { type: 'heading', text: { cs: 'Úprava fotek zdarma', en: 'Free Photo Editing', de: 'Kostenlose Fotobearbeitung' } },
      { type: 'paragraph', text: { cs: 'Pro základní úpravy stačí vestavěný editor v telefonu. Pro pokročilejší úpravy doporučujeme Snapseed (Google) nebo Lightroom Mobile – obě aplikace jsou zdarma a nabízejí profesionální nástroje.', en: 'For basic edits, the built-in phone editor is sufficient. For more advanced editing, we recommend Snapseed (Google) or Lightroom Mobile — both are free and offer professional tools.', de: 'Für grundlegende Bearbeitungen reicht der eingebaute Telefoneditor.' } },
    ],
    category: 'tips',
    image: blogPhotography,
    videoUrl: 'https://www.youtube.com/watch?v=kzRlDGHpnro',
    author: 'Martin Novák',
    authorRole: { cs: 'Hlavní designér', en: 'Lead Designer', de: 'Leitender Designer' },
    date: '2025-11-18',
    readTime: 6,
    featured: true,
    tags: ['fotografie', 'vizuální obsah', 'tipy'],
  },
  // ── New articles ──
  {
    id: '10',
    slug: 'branding-pro-remeslniky',
    title: {
      cs: 'Firemní identita pro řemeslníky: Proč nestačí jen logo',
      en: 'Brand Identity for Tradespeople: Why a Logo Isn\'t Enough',
      de: 'Markenidentität für Handwerker: Warum ein Logo nicht ausreicht',
    },
    excerpt: {
      cs: 'Silná značka odlišuje úspěšné řemeslníky od konkurence. Zjistěte, jak vybudovat konzistentní firemní identitu od barev přes typografii až po tón komunikace.',
      en: 'A strong brand sets successful tradespeople apart. Learn how to build a consistent brand identity from colors to typography to tone of voice.',
      de: 'Eine starke Marke unterscheidet erfolgreiche Handwerker von der Konkurrenz.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Většina řemeslníků považuje branding za záležitost velkých firem. Ale pravda je, že konzistentní firemní identita je jedním z nejsilnějších nástrojů, jak se odlišit od konkurence a budovat důvěru zákazníků.', en: 'Most tradespeople consider branding a big company thing. But the truth is, consistent brand identity is one of the most powerful tools to differentiate from competition and build customer trust.', de: 'Die meisten Handwerker betrachten Branding als eine Angelegenheit großer Unternehmen.' } },
      { type: 'heading', text: { cs: 'Co tvoří firemní identitu?', en: 'What Makes Up Brand Identity?', de: 'Was macht eine Markenidentität aus?' } },
      { type: 'list', items: [
        { cs: 'Logo a jeho varianty (plnobarevné, jednobarevné, ikona)', en: 'Logo and its variants (full color, monochrome, icon)', de: 'Logo und seine Varianten' },
        { cs: 'Firemní barvy – primární, sekundární a akcentní', en: 'Brand colors — primary, secondary, and accent', de: 'Markenfarben — primär, sekundär und Akzent' },
        { cs: 'Typografie – výběr písem pro nadpisy a tělo textu', en: 'Typography — font selection for headings and body text', de: 'Typografie — Schriftauswahl für Überschriften und Fließtext' },
        { cs: 'Tón komunikace – jak mluvíte se zákazníky', en: 'Tone of voice — how you speak to customers', de: 'Tonalität — wie Sie mit Kunden sprechen' },
        { cs: 'Vizuální styl fotografií a ilustrací', en: 'Visual style of photos and illustrations', de: 'Visueller Stil von Fotos und Illustrationen' },
      ] },
      { type: 'image', src: inlineWireframe, alt: { cs: 'Plánování firemní identity', en: 'Planning brand identity', de: 'Planung der Markenidentität' }, caption: { cs: 'Brand manuál definuje všechny vizuální a komunikační prvky vaší značky', en: 'A brand manual defines all visual and communication elements of your brand', de: 'Ein Markenhandbuch definiert alle visuellen und kommunikativen Elemente' } },
      { type: 'heading', text: { cs: 'Konzistence je klíč', en: 'Consistency Is Key', de: 'Konsistenz ist der Schlüssel' } },
      { type: 'paragraph', text: { cs: 'Vaše logo, barvy a styl komunikace musí být stejné na webu, na sociálních sítích, na vizitkách, na firemním autě i na pracovním oblečení. Konzistentní branding zvyšuje rozpoznatelnost značky až o 80 %.', en: 'Your logo, colors, and communication style must be consistent on your website, social media, business cards, company vehicle, and work clothing. Consistent branding increases brand recognition by up to 80%.', de: 'Ihr Logo, Farben und Kommunikationsstil müssen überall konsistent sein.' } },
      { type: 'quote', text: { cs: 'Investice do profesionálního loga a brand manuálu byla jedna z nejlepších obchodních rozhodnutí. Zákazníci nás teď poznají okamžitě.', en: 'Investing in a professional logo and brand manual was one of our best business decisions. Customers now recognize us instantly.', de: 'Die Investition in ein professionelles Logo und Markenhandbuch war eine unserer besten Geschäftsentscheidungen.' }, author: 'Karel Svoboda, truhlář' },
    ],
    category: 'business',
    image: blogBranding,
    author: 'Martin Novák',
    authorRole: { cs: 'Hlavní designér', en: 'Lead Designer', de: 'Leitender Designer' },
    date: '2025-11-05',
    readTime: 8,
    tags: ['branding', 'identita', 'logo'],
  },
  {
    id: '11',
    slug: 'rychlost-webu',
    title: {
      cs: 'Rychlost webu: Jak každá sekunda navíc stojí zákazníky',
      en: 'Website Speed: How Every Extra Second Costs You Customers',
      de: 'Website-Geschwindigkeit: Wie jede zusätzliche Sekunde Kunden kostet',
    },
    excerpt: {
      cs: 'Pomalý web zabíjí konverze. Naučte se optimalizovat rychlost načítání a zlepšit Core Web Vitals skóre.',
      en: 'A slow website kills conversions. Learn how to optimize loading speed and improve your Core Web Vitals score.',
      de: 'Eine langsame Website tötet Konversionen.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Rychlost webu není jen technická záležitost – přímo ovlivňuje vaše tržby. Výzkumy ukazují, že 1 sekunda zpoždění v načítání snižuje konverze o 7 %. Pro řemeslníka s měsíčním obratem 200 000 Kč to znamená ztrátu 14 000 Kč měsíčně.', en: 'Website speed isn\'t just a technical matter — it directly impacts your revenue. Research shows that a 1-second delay in loading reduces conversions by 7%.', de: 'Website-Geschwindigkeit ist nicht nur eine technische Angelegenheit — sie beeinflusst direkt Ihren Umsatz.' } },
      { type: 'heading', text: { cs: 'Core Web Vitals: Co měřit', en: 'Core Web Vitals: What to Measure', de: 'Core Web Vitals: Was messen' } },
      { type: 'list', items: [
        { cs: 'LCP (Largest Contentful Paint) – měří čas načtení největšího prvku, cíl: pod 2,5s', en: 'LCP (Largest Contentful Paint) — measures load time of the largest element, target: under 2.5s', de: 'LCP — misst die Ladezeit des größten Elements, Ziel: unter 2,5s' },
        { cs: 'FID (First Input Delay) – měří odezvu na první interakci, cíl: pod 100ms', en: 'FID (First Input Delay) — measures response to first interaction, target: under 100ms', de: 'FID — misst die Reaktion auf die erste Interaktion, Ziel: unter 100ms' },
        { cs: 'CLS (Cumulative Layout Shift) – měří vizuální stabilitu, cíl: pod 0,1', en: 'CLS (Cumulative Layout Shift) — measures visual stability, target: under 0.1', de: 'CLS — misst die visuelle Stabilität, Ziel: unter 0,1' },
      ] },
      { type: 'heading', text: { cs: 'Praktické optimalizace', en: 'Practical Optimizations', de: 'Praktische Optimierungen' } },
      { type: 'paragraph', text: { cs: 'Většina problémů s rychlostí řemeslnických webů pramení z neoptimalizovaných obrázků. Fotografie z mobilu mají často 5–10 MB. Po optimalizaci (správný formát, rozlišení a komprese) lze velikost snížit na 100–300 KB bez viditelné ztráty kvality.', en: 'Most speed problems on trade websites stem from unoptimized images. Phone photos are often 5–10 MB. After optimization (proper format, resolution, and compression), size can be reduced to 100–300 KB without visible quality loss.', de: 'Die meisten Geschwindigkeitsprobleme auf Handwerker-Websites stammen von nicht optimierten Bildern.' } },
      { type: 'callout', text: { cs: '🚀 Rychlý test: Otevřete PageSpeed Insights (pagespeed.web.dev) a zadejte URL svého webu. Skóre pod 50 bodů znamená vážné problémy – skóre nad 90 je výborné.', en: '🚀 Quick test: Open PageSpeed Insights (pagespeed.web.dev) and enter your website URL. A score below 50 means serious problems — a score above 90 is excellent.', de: '🚀 Schnelltest: Öffnen Sie PageSpeed Insights und geben Sie Ihre Website-URL ein.' } },
    ],
    category: 'seo',
    image: blogSpeed,
    author: 'Petra Dvořáková',
    authorRole: { cs: 'SEO specialistka', en: 'SEO Specialist', de: 'SEO-Spezialistin' },
    date: '2025-10-25',
    readTime: 7,
    tags: ['rychlost', 'Core Web Vitals', 'optimalizace'],
  },
  {
    id: '12',
    slug: 'online-rezervacni-system',
    title: {
      cs: 'Online rezervační systém: Proč ho potřebuje každý řemeslník',
      en: 'Online Booking System: Why Every Tradesperson Needs One',
      de: 'Online-Buchungssystem: Warum jeder Handwerker eines braucht',
    },
    excerpt: {
      cs: 'Automatizujte příjem zakázek a ušetřete hodiny času s online rezervačním systémem integrovaným do vašeho webu.',
      en: 'Automate your job intake and save hours of time with an online booking system integrated into your website.',
      de: 'Automatisieren Sie die Auftragsannahme und sparen Sie Stunden mit einem Online-Buchungssystem.',
    },
    sections: [
      { type: 'paragraph', text: { cs: 'Kolik hodin týdně strávíte na telefonu dohodováním termínů? Většina řemeslníků odhaduje 5–10 hodin. Online rezervační systém tento čas redukuje na minimum a zároveň zvyšuje profesionální dojem vaší firmy.', en: 'How many hours per week do you spend on the phone scheduling appointments? Most tradespeople estimate 5–10 hours. An online booking system reduces this time to a minimum while enhancing your professional image.', de: 'Wie viele Stunden pro Woche verbringen Sie am Telefon mit der Terminplanung?' } },
      { type: 'heading', text: { cs: 'Výhody online rezervací', en: 'Benefits of Online Booking', de: 'Vorteile der Online-Buchung' } },
      { type: 'list', items: [
        { cs: 'Zákazníci si mohou zarezervovat termín 24/7 bez čekání', en: 'Customers can book 24/7 without waiting', de: 'Kunden können rund um die Uhr buchen' },
        { cs: 'Automatické potvrzovací e-maily a SMS připomínky', en: 'Automatic confirmation emails and SMS reminders', de: 'Automatische Bestätigungs-E-Mails und SMS-Erinnerungen' },
        { cs: 'Snížení počtu neuskutečněných zakázek (no-shows) o 30–50 %', en: 'Reduction of no-shows by 30–50%', de: 'Reduzierung von No-Shows um 30–50 %' },
        { cs: 'Přehledný kalendář s plánováním tras a kapacit', en: 'Clear calendar with route planning and capacity management', de: 'Übersichtlicher Kalender mit Routenplanung und Kapazitätsmanagement' },
        { cs: 'Integrace s Google Kalendářem a dalšími nástroji', en: 'Integration with Google Calendar and other tools', de: 'Integration mit Google Kalender und anderen Tools' },
      ] },
      { type: 'image', src: inlineContentStrategy, alt: { cs: 'Plánování rezervačního systému', en: 'Booking system planning', de: 'Planung des Buchungssystems' }, caption: { cs: 'Správně nastavený rezervační systém šetří čas vám i zákazníkům', en: 'A properly configured booking system saves time for you and your customers', de: 'Ein richtig konfiguriertes Buchungssystem spart Zeit für Sie und Ihre Kunden' } },
      { type: 'heading', text: { cs: 'Jak vybrat správný systém?', en: 'How to Choose the Right System?', de: 'Wie wählt man das richtige System?' } },
      { type: 'paragraph', text: { cs: 'Při výběru rezervačního systému se zaměřte na jednoduchost pro zákazníka, mobilní kompatibilitu, možnost úpravy formuláře podle vašich služeb a integraci s vaším webem a kalendářem.', en: 'When choosing a booking system, focus on customer simplicity, mobile compatibility, form customization for your services, and integration with your website and calendar.', de: 'Achten Sie bei der Wahl eines Buchungssystems auf Einfachheit für den Kunden und mobile Kompatibilität.' } },
      { type: 'quote', text: { cs: 'Online rezervace nám ušetřily přibližně 8 hodin týdně na telefonu. Zákazníci si mohou vybrat termín, který jim vyhovuje, a celý proces je automatický.', en: 'Online bookings saved us approximately 8 hours per week on the phone. Customers can choose a convenient time, and the whole process is automatic.', de: 'Online-Buchungen sparten uns ca. 8 Stunden pro Woche am Telefon.' }, author: 'Lucie Marková, úklidová firma' },
    ],
    category: 'business',
    image: blogBookingSystem,
    author: 'Jakub Procházka',
    authorRole: { cs: 'Marketing manažer', en: 'Marketing Manager', de: 'Marketing Manager' },
    date: '2025-10-10',
    readTime: 9,
    tags: ['rezervace', 'automatizace', 'produktivita'],
  },
  ...industryBlogPosts,
  ...performanceBlogPosts,
];
