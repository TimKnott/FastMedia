import blogWebsiteTrends from '@/assets/blog/blog-website-trends.jpg';
import blogSeoTips from '@/assets/blog/blog-seo-tips.jpg';
import blogSocialMedia from '@/assets/blog/blog-social-media.jpg';
import blogRedesign from '@/assets/blog/blog-redesign.jpg';
import blogGoogleBusiness from '@/assets/blog/blog-google-business.jpg';
import blogMobileFirst from '@/assets/blog/blog-mobile-first.jpg';
import blogReviews from '@/assets/blog/blog-reviews.jpg';
import blogEmailMarketing from '@/assets/blog/blog-email-marketing.jpg';
import blogPhotography from '@/assets/blog/blog-photography.jpg';

export type BlogCategory = 'webdesign' | 'seo' | 'marketing' | 'business' | 'tips';

export interface BlogPost {
  id: string;
  slug: string;
  title: { cs: string; en: string; de: string };
  excerpt: { cs: string; en: string; de: string };
  content: { cs: string; en: string; de: string };
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
    content: {
      cs: 'Moderní web pro řemeslníky musí být rychlý, mobilní a vizuálně přitažlivý. V tomto článku prozkoumáme 7 klíčových trendů, které definují webdesign v roce 2026 – od tmavého režimu přes mikroanimace až po AI chatboty. Každý trend ilustrujeme na reálných příkladech z oboru a ukážeme, jak ho implementovat bez velkých nákladů.',
      en: 'A modern trade website must be fast, mobile-friendly, and visually appealing. In this article, we explore 7 key trends defining web design in 2026 — from dark mode to micro-animations to AI chatbots.',
      de: 'Eine moderne Handwerker-Website muss schnell, mobilfreundlich und visuell ansprechend sein. In diesem Artikel erkunden wir 7 Schlüsseltrends.',
    },
    category: 'webdesign',
    image: blogWebsiteTrends,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    content: {
      cs: 'SEO je klíčem k online viditelnosti. Pro řemeslníky je zvláště důležité lokální SEO – optimalizace pro vyhledávání v konkrétním regionu. Ukážeme vám, jak na klíčová slova, meta popisky, strukturovaná data a lokální citace.',
      en: 'SEO is the key to online visibility. For tradespeople, local SEO is especially important. We show you how to handle keywords, meta descriptions, structured data, and local citations.',
      de: 'SEO ist der Schlüssel zur Online-Sichtbarkeit. Für Handwerker ist lokales SEO besonders wichtig.',
    },
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
    content: {
      cs: 'Sociální sítě jsou mocným nástrojem pro řemeslníky. Ukážeme vám, jak vytvořit obsah, který zaujme – od fotek z realizací přes krátká videa až po příběhy spokojených zákazníků.',
      en: 'Social media is a powerful tool for tradespeople. We show you how to create engaging content from project photos to short videos to customer stories.',
      de: 'Social Media ist ein mächtiges Werkzeug für Handwerker.',
    },
    category: 'marketing',
    image: blogSocialMedia,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    content: {
      cs: 'Zastaralý web může stát vaše podnikání zákazníky. Podíváme se na konkrétní metriky a vizuální indikátory, které signalizují potřebu redesignu.',
      en: 'An outdated website can cost your business customers. We look at specific metrics and visual indicators signaling the need for a redesign.',
      de: 'Eine veraltete Website kann Ihr Unternehmen Kunden kosten.',
    },
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
    content: {
      cs: 'Google Moje firma je základní nástroj lokálního marketingu. Provedeme vás kompletním nastavením od verifikace přes optimalizaci fotografií až po strategii získávání recenzí.',
      en: 'Google My Business is a fundamental local marketing tool. We walk you through complete setup.',
      de: 'Google My Business ist ein grundlegendes lokales Marketing-Tool.',
    },
    category: 'business',
    image: blogGoogleBusiness,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
      de: 'Über 70 % Ihrer potenziellen Kunden suchen Sie mobil. Erfahren Sie, warum responsives Design ein Muss ist.',
    },
    content: {
      cs: 'Mobilní web není luxus, ale nutnost. Prezentujeme statistiky, case studies a praktické tipy pro optimalizaci vašeho webu pro mobilní zařízení.',
      en: 'A mobile website isn\'t a luxury, it\'s a necessity. We present statistics, case studies, and practical tips.',
      de: 'Eine mobile Website ist kein Luxus, sondern eine Notwendigkeit.',
    },
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
    content: {
      cs: 'Pozitivní recenze mohou dramaticky zvýšit vaše tržby. Ukážeme vám etické a efektivní strategie pro jejich získávání.',
      en: 'Positive reviews can dramatically increase your revenue. We show you ethical and effective strategies.',
      de: 'Positive Bewertungen können Ihren Umsatz dramatisch steigern.',
    },
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
    content: {
      cs: 'E-mail marketing zůstává jedním z nejvýnosnějších kanálů. Provedeme vás nastavením newsletteru, segmentací kontaktů a tvorbou šablon.',
      en: 'Email marketing remains one of the most profitable channels. We walk you through newsletter setup and template creation.',
      de: 'E-Mail-Marketing bleibt einer der profitabelsten Kanäle.',
    },
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
    content: {
      cs: 'Fotografie prodávají. Ukážeme vám osvětlení, kompozici a jednoduché úpravy, které z vašich fotek udělají profesionální prezentaci.',
      en: 'Photos sell. We show you lighting, composition, and simple edits that turn your photos into professional presentations.',
      de: 'Fotos verkaufen. Wir zeigen Ihnen Beleuchtung, Komposition und einfache Bearbeitungen.',
    },
    category: 'tips',
    image: blogPhotography,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    author: 'Martin Novák',
    authorRole: { cs: 'Hlavní designér', en: 'Lead Designer', de: 'Leitender Designer' },
    date: '2025-11-18',
    readTime: 6,
    featured: true,
    tags: ['fotografie', 'vizuální obsah', 'tipy'],
  },
];
