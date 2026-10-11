import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Sparkles, ShieldCheck, Zap, MessageCircle, ShoppingCart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Helmet } from 'react-helmet-async';
import ScrollToTop from '@/components/ScrollToTop';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackageData {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  hosting: string;
  description: string;
  bestFor: string[];
  features: string[];
  deliverables: string[];
  examples: { title: string; description: string; link?: string }[];
  timeline: string;
  popular?: boolean;
  faqs: { q: string; a: string }[];
}

const PACKAGES: Record<string, PackageData> = {
  starter: {
    slug: 'starter',
    name: 'Starter',
    tagline: 'A polished single-page website to establish your online presence fast.',
    price: '4 990 Kč',
    hosting: '1 500 Kč/month',
    description:
      'The Starter package is perfect for tradespeople, freelancers, and new businesses who need a professional online presence without the complexity of a multi-page site. We design a beautiful single-page website that showcases who you are, what you do, and how customers can reach you — optimised to convert visitors into enquiries.',
    bestFor: [
      'Solo tradespeople and freelancers',
      'New businesses validating an offer',
      'Anyone replacing a Facebook-only presence',
    ],
    features: [
      'Single-page responsive website',
      'Mobile-first, retina-ready design',
      'Contact form with spam protection',
      'Basic on-page SEO (meta, schema, sitemap)',
      'Google Maps embed for your service area',
      'WhatsApp & click-to-call buttons',
      'SSL certificate & secure hosting',
      '1 round of revisions',
    ],
    deliverables: [
      'Custom-designed homepage with hero, services, testimonials and CTA',
      'Domain connection and DNS setup',
      'Performance-optimised assets (Lighthouse 90+)',
      'Google Business Profile alignment',
    ],
    examples: [
      { title: 'Plumbing demo', description: 'See how a one-page plumber site converts.', link: '/demo/plumbing' },
      { title: 'Cleaning demo', description: 'Local cleaning business with booking CTA.', link: '/demo/cleaning' },
    ],
    timeline: '5–7 working days',
    faqs: [
      { q: 'Can I add more pages later?', a: 'Yes — you can upgrade to Basic or Professional at any time and we credit your Starter spend.' },
      { q: 'Do I own the website?', a: 'Absolutely. The code, content and domain are yours.' },
    ],
  },
  basic: {
    slug: 'basic',
    name: 'Basic',
    tagline: 'A multi-page professional site with gallery, SEO and clear conversion paths.',
    price: '9 990 Kč',
    hosting: '2 000 Kč/month',
    description:
      'The Basic package gives growing businesses the depth and SEO horsepower of a true multi-page site. You get up to five custom-designed pages, a professional project/gallery section, and an SEO foundation that helps you rank for local searches in your industry.',
    bestFor: [
      'Established trades & services',
      'Studios, salons and clinics',
      'Businesses with 2–10 services to showcase',
    ],
    features: [
      'Up to 5 fully designed pages',
      'Responsive premium design',
      'Project / portfolio gallery',
      'Multi-step contact form',
      'Advanced on-page SEO + schema.org',
      'Blog-ready structure',
      'Google Analytics & Search Console setup',
      'WhatsApp, call and email integrations',
      'SSL, CDN and daily backups',
      '3 rounds of revisions',
    ],
    deliverables: [
      'Custom information architecture and sitemap',
      'Copy guidance and on-brand imagery curation',
      'Page speed score 90+ on mobile & desktop',
      '30-day post-launch support',
    ],
    examples: [
      { title: 'Electrical demo', description: 'Multi-page electrician with services & gallery.', link: '/demo/electrical' },
      { title: 'Photography demo', description: 'Portfolio-led service site.', link: '/demo/photography' },
    ],
    timeline: '10–14 working days',
    faqs: [
      { q: 'Can I edit content myself?', a: 'Yes — Basic includes a lightweight inline editor for text and images.' },
      { q: 'Is a blog included?', a: 'The structure is included. Articles can be added at any time or written by our team.' },
    ],
  },
  professional: {
    slug: 'professional',
    name: 'Professional',
    popular: true,
    tagline: 'The complete business website with booking, analytics and priority support.',
    price: '19 990 Kč',
    hosting: '3 500 Kč/month',
    description:
      'Our most popular package. The Professional build delivers a complete business website with up to ten pages, an integrated booking system, premium design, advanced SEO and detailed analytics. Built for service businesses that take customers, appointments and revenue seriously.',
    bestFor: [
      'Service businesses taking online bookings',
      'Clinics, salons, studios, agencies',
      'Brands competing in saturated local markets',
    ],
    features: [
      'Up to 10 fully designed pages',
      'Premium custom design system',
      'Integrated booking / appointment system',
      'Advanced SEO, schema and internal linking',
      'Gallery + verified testimonials',
      'Google Analytics 4 + conversion tracking',
      'Newsletter signup & lead magnet',
      'Live chat ready',
      'Priority support (next business day)',
      '5 rounds of revisions',
    ],
    deliverables: [
      'Bespoke UX & wireframes before design',
      'On-brand iconography and motion design',
      'Booking workflow tailored to your schedule',
      '90-day post-launch optimisation window',
    ],
    examples: [
      { title: 'Dental demo', description: 'Clinic with appointment booking & team page.', link: '/demo/dental' },
      { title: 'Real estate demo', description: 'Portfolio site with lead capture.', link: '/demo/realestate' },
      { title: 'Massage demo', description: 'Wellness brand with online booking.', link: '/demo/massage' },
    ],
    timeline: '3–4 weeks',
    faqs: [
      { q: 'Which booking system do you use?', a: 'We integrate the best fit for you — Calendly, Cal.com, Reservio or a fully custom system.' },
      { q: 'Do you handle copywriting?', a: 'Yes, professional British-English copy for every page is included.' },
    ],
  },
  enterprise: {
    slug: 'enterprise',
    name: 'Enterprise',
    tagline: 'A bespoke turnkey platform with CMS, e-shop and a dedicated project manager.',
    price: 'Custom',
    hosting: 'from 5 000 Kč/month',
    description:
      'When your business needs more than a website — unlimited pages, custom integrations, e-commerce, multi-language content and a dedicated team — the Enterprise package delivers a tailor-made digital platform with the support structure to match.',
    bestFor: [
      'Multi-location and multi-language brands',
      'E-commerce and subscription businesses',
      'Companies replacing legacy platforms',
    ],
    features: [
      'Unlimited pages and content types',
      'Fully bespoke design language',
      'Full e-shop / e-commerce integration',
      'Headless CMS with role-based editing',
      'Multi-language and multi-region support',
      'Custom API & 3rd-party integrations',
      'Dedicated project manager',
      'SLA-backed 24/7 support',
      'Unlimited revisions during build',
      'Quarterly strategy reviews',
    ],
    deliverables: [
      'Discovery workshop and roadmap',
      'Custom design system & component library',
      'Migration of existing content and SEO equity',
      'Training and documentation for your team',
    ],
    examples: [
      { title: 'E-shop demo', description: 'Full multi-stage checkout with wishlist.', link: '/demo/eshop' },
      { title: 'Building demo', description: 'Multi-service construction platform.', link: '/demo/building' },
    ],
    timeline: '6–12 weeks (scope dependent)',
    faqs: [
      { q: 'How is pricing calculated?', a: 'After a free scoping call we provide a fixed-price proposal with milestone billing.' },
      { q: 'Can you migrate from WordPress / Shopify?', a: 'Yes — we handle full migrations with zero SEO loss.' },
    ],
  },
};

const CZECH_PACKAGES: Record<string, Partial<PackageData>> = {
  starter: {
    tagline: 'Profesionální jednostránkový web pro rychlý start na internetu.', hosting: '1 500 Kč/měsíc', description: 'Balíček Starter je ideální pro řemeslníky, živnostníky a nové firmy, které potřebují profesionální prezentaci bez složitosti rozsáhlého webu.',
    bestFor: ['Živnostníci a freelanceři', 'Nové firmy ověřující nabídku', 'Náhrada samotné stránky na sociálních sítích'],
    features: ['Responzivní jednostránkový web', 'Mobilní design pro ostré displeje', 'Kontaktní formulář s ochranou proti spamu', 'Základní SEO, strukturovaná data a mapa webu', 'Mapa oblasti působnosti', 'WhatsApp a tlačítko pro volání', 'SSL a bezpečný hosting', 'Jedno kolo úprav'],
    deliverables: ['Domovská stránka na míru s nabídkou, referencemi a výzvou k akci', 'Připojení domény a nastavení DNS', 'Optimalizace výkonu', 'Sladění s firemním profilem Google'], timeline: '5–7 pracovních dnů',
    faqs: [{ q: 'Mohu později přidat další stránky?', a: 'Ano. Kdykoliv můžete přejít na vyšší balíček.' }, { q: 'Bude web můj?', a: 'Ano. Kód, obsah i doména patří vám.' }],
  },
  basic: {
    tagline: 'Profesionální vícestránkový web s galerií, SEO a jasnou cestou k poptávce.', hosting: '2 000 Kč/měsíc', description: 'Balíček Basic nabízí rostoucím firmám až pět stránek na míru, galerii realizací a kvalitní SEO základ pro místní vyhledávání.',
    bestFor: ['Zavedená řemesla a služby', 'Studia, salony a kliniky', 'Firmy se dvěma až deseti službami'],
    features: ['Až 5 navržených stránek', 'Prémiový responzivní design', 'Galerie projektů', 'Vícekrokový kontaktní formulář', 'Pokročilé SEO a schema.org', 'Příprava pro blog', 'Google Analytics a Search Console', 'WhatsApp, telefon a e-mail', 'SSL, CDN a denní zálohy', 'Tři kola úprav'],
    deliverables: ['Informační architektura a mapa webu', 'Doporučení textů a výběr obrazového materiálu', 'Cílové skóre rychlosti 90+ na mobilu i počítači', '30 dnů podpory po spuštění'], timeline: '10–14 pracovních dnů',
    faqs: [{ q: 'Mohu obsah upravovat sám?', a: 'Ano. Balíček obsahuje jednoduchou úpravu textů a obrázků.' }, { q: 'Je součástí blog?', a: 'Ano, připravíme jeho strukturu a články lze kdykoliv doplnit.' }],
  },
  professional: {
    tagline: 'Kompletní firemní web s rezervacemi, analytikou a přednostní podporou.', hosting: '3 500 Kč/měsíc', description: 'Náš nejoblíbenější balíček přináší až deset stránek, integrované rezervace, prémiový design, pokročilé SEO a podrobnou analytiku.',
    bestFor: ['Služby přijímající online rezervace', 'Kliniky, salony, studia a agentury', 'Značky v konkurenčních místních oborech'],
    features: ['Až 10 navržených stránek', 'Prémiový designový systém', 'Integrovaný rezervační systém', 'Pokročilé SEO a interní prolinkování', 'Galerie a ověřené reference', 'GA4 a měření konverzí', 'Newsletter a magnet na kontakty', 'Příprava pro živý chat', 'Přednostní podpora', 'Pět kol úprav'],
    deliverables: ['UX návrh a wireframy', 'Ikony a animace v souladu se značkou', 'Rezervace podle vašeho provozu', '90 dnů optimalizace po spuštění'], timeline: '3–4 týdny',
    faqs: [{ q: 'Jaký rezervační systém používáte?', a: 'Vybereme nejvhodnější řešení, například Calendly, Cal.com, Reservio nebo systém na míru.' }, { q: 'Připravíte také texty?', a: 'Ano, profesionální texty v češtině nebo britské angličtině jsou součástí.' }],
  },
  enterprise: {
    tagline: 'Řešení na míru s CMS, e-shopem a vlastním projektovým manažerem.', price: 'Na míru', hosting: 'od 5 000 Kč/měsíc', description: 'Pro firmy, které potřebují víc než web: neomezené stránky, integrace na míru, e-shop, více jazyků a vyhrazený tým.',
    bestFor: ['Firmy s více pobočkami a jazyky', 'E-shopy a předplatitelské služby', 'Společnosti nahrazující starší systémy'],
    features: ['Neomezené stránky a typy obsahu', 'Design zcela na míru', 'Kompletní e-shop', 'CMS s uživatelskými rolemi', 'Více jazyků a oblastí', 'API a integrace třetích stran', 'Vlastní projektový manažer', 'Podpora 24/7 podle SLA', 'Neomezené úpravy během tvorby', 'Čtvrtletní strategické konzultace'],
    deliverables: ['Úvodní workshop a plán', 'Designový systém a knihovna komponent', 'Migrace obsahu se zachováním SEO', 'Školení a dokumentace'], timeline: '6–12 týdnů podle rozsahu',
    faqs: [{ q: 'Jak se počítá cena?', a: 'Po bezplatné konzultaci dostanete nabídku s pevnou cenou a platbami po etapách.' }, { q: 'Umíte migraci z WordPressu nebo Shopify?', a: 'Ano, provedeme kompletní migraci se zachováním SEO.' }],
  },
};

const PackageDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const en = language === 'en';
  const sourcePkg = slug ? PACKAGES[slug] : undefined;
  const pkg = sourcePkg && !en ? { ...sourcePkg, ...CZECH_PACKAGES[sourcePkg.slug] } as PackageData : sourcePkg;

  if (!pkg) return <Navigate to="/" replace />;

  const buyNow = () => navigate(`/calculator?package=${pkg.slug}`);
  const bookConsult = () => navigate('/consultant/tereza');

  const CTARow = ({ variant = 'default' as 'default' | 'inverse' }) => (
    <div className={`flex flex-col sm:flex-row gap-3 ${variant === 'inverse' ? 'justify-center' : ''}`}>
      <Button onClick={buyNow} size="lg" className="font-semibold gap-2">
         <ShoppingCart className="w-5 h-5" /> {en ? `Buy ${pkg.name} now` : `Objednat ${pkg.name}`}
      </Button>
      <Button onClick={bookConsult} size="lg" variant="outline" className="font-semibold gap-2">
         <MessageCircle className="w-5 h-5" /> {en ? 'Book a consultation' : 'Rezervovat konzultaci'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
         title={`${pkg.name} ${en ? 'Website Package' : '— balíček webu'} — FastMedia`}
        description={pkg.tagline}
        pagePath={`/package/${pkg.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: `${pkg.name} Website Package`,
              description: pkg.tagline,
              serviceType: 'Website design and development',
              url: `https://www.fastmedia.pro/package/${pkg.slug}`,
              provider: { '@type': 'Organization', name: 'FastMedia.Pro', url: 'https://www.fastmedia.pro' },
              ...(/\d/.test(pkg.price) ? { offers: { '@type': 'Offer', price: pkg.price.replace(/[^\d]/g, ''), priceCurrency: 'CZK' } } : {}),
            },
            {
              '@type': 'FAQPage',
              mainEntity: pkg.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            },
          ],
        })}</script>
      </Helmet>
      <ScrollToTop />
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <Link to="/#pricing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
               <ArrowLeft className="w-4 h-4 mr-2" /> {en ? 'Back to all packages' : 'Zpět na všechny balíčky'}
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {pkg.popular && (
                <Badge className="mb-4 bg-accent text-accent-foreground gap-1">
                   <Star className="w-3 h-3 fill-current" /> {en ? 'Most Popular' : 'Nejoblíbenější'}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
                 {pkg.name} {en ? 'Package' : 'balíček'}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{pkg.tagline}</p>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-8">
                <div>
                  <div className="text-4xl font-display font-bold text-foreground">{pkg.price}</div>
                   <div className="text-sm text-muted-foreground">{en ? 'one-time build' : 'jednorázová tvorba'}</div>
                </div>
                <div className="text-muted-foreground">
                   + {en ? 'Hosting & care' : 'Hosting a péče'}: <span className="font-semibold text-foreground">{pkg.hosting}</span>
                </div>
                <div className="text-muted-foreground">
                   {en ? 'Delivery' : 'Dodání'}: <span className="font-semibold text-foreground">{pkg.timeline}</span>
                </div>
              </div>
              <CTARow />
            </motion.div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
               <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">{en ? 'What you get' : 'Co získáte'}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{pkg.description}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {pkg.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside>
              <Card className="bg-secondary/40 border-border">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-accent" /> {en ? 'Best for' : 'Ideální pro'}
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {pkg.bestFor.map((b) => (
                      <li key={b} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-accent">•</span> {b}
                      </li>
                    ))}
                  </ul>
                  <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-accent" /> {en ? 'Included' : 'Součástí balíčku'}
                  </h3>
                  <ul className="space-y-2">
                    {pkg.deliverables.map((d) => (
                      <li key={d} className="text-sm text-muted-foreground flex gap-2">
                        <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        {/* Mid CTA */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
               {en ? `Ready to launch with the ${pkg.name} package?` : `Chcete odstartovat s balíčkem ${pkg.name}?`}
            </h2>
            <p className="text-primary-foreground/80 mb-6">
               {en ? 'Secure your project today — or talk it through with our team first. No pressure.' : 'Zajistěte si projekt ještě dnes, nebo ho nejprve nezávazně proberte s naším týmem.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={buyNow} size="lg" variant="secondary" className="font-semibold gap-2">
                 <ShoppingCart className="w-5 h-5" /> {en ? `Buy ${pkg.name} now` : `Objednat ${pkg.name}`}
              </Button>
              <Button
                onClick={bookConsult}
                size="lg"
                variant="outline"
                className="font-semibold gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                 <MessageCircle className="w-5 h-5" /> {en ? 'Book a consultation' : 'Rezervovat konzultaci'}
              </Button>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2 flex items-center gap-2">
               <Zap className="w-6 h-6 text-accent" /> {en ? 'Live examples' : 'Živé ukázky'}
            </h2>
            <p className="text-muted-foreground mb-8">
               {en ? `Real demo sites built in the ${pkg.name} tier. Explore each one to see the quality you can expect.` : `Skutečné ukázkové weby v balíčku ${pkg.name}. Prohlédněte si kvalitu, kterou můžete očekávat.`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.examples.map((ex) => (
                <Card key={ex.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-lg mb-2">{ex.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{ex.description}</p>
                    {ex.link && (
                      <Link to={ex.link}>
                         <Button variant="outline" size="sm">{en ? 'View demo' : 'Zobrazit ukázku'}</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6 flex items-center gap-2">
               <HelpCircle className="w-6 h-6 text-accent" /> {en ? 'Frequently asked questions' : 'Časté dotazy'}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {pkg.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
               {en ? `Let's build your ${pkg.name} website` : `Pojďme vytvořit váš web ${pkg.name}`}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
               {en ? `Buy the ${pkg.name} package now and we'll start within 24 hours. Still have questions? Book a free 20-minute consultation.` : `Objednejte balíček ${pkg.name} a začneme do 24 hodin. Máte otázky? Rezervujte si bezplatnou dvacetiminutovou konzultaci.`}
            </p>
            <CTARow variant="inverse" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PackageDetail;
