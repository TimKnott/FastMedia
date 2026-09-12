import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Star, Rocket, MapPin, Mail, Phone, Globe, Clock, Layers, Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { reviews } from '@/data/reviews';
import logo from '@/assets/logo.jpeg';

const copy = {
  cs: {
    seoTitle: 'Média kit | Kdo jsme, ukázky prací a reference | FastMedia.Pro',
    seoDesc: 'Oficiální média kit FastMedia.Pro: profil společnosti, klíčová fakta, ukázky webů pro řemesla a služby a reference od českých podnikatelů.',
    switchLabel: 'English',
    badge: 'Média kit',
    h1: 'FastMedia.Pro ve zkratce',
    sub: 'Všechno, co potřebujete znát o naší práci — profil společnosti, fakta, ukázky webů a reference — na jednom místě pro novináře, partnery a zvídavé klienty.',
    bioBadge: 'Profil společnosti',
    bioTitle: 'Kdo jsme',
    bio: [
      'FastMedia.Pro je digitální studio, které navrhuje a provozuje moderní weby pro řemeslníky, živnostníky a malé firmy v Česku i v zahraničí. Založil ho britský podnikatel a spojuje britskou důslednost v servisu s lokální znalostí českého trhu.',
      'Každý projekt stavíme mobile-first a dvojjazyčně (česky a britskou angličtinou), s důrazem na rychlost načítání, SEO a nástroje, které z webu dělají aktivní prodejní kanál — od cenových kalkulaček přes online rezervace po AI asistenta pro vedení zákazníků.',
      'Nepíšeme jen kód. Pomáháme firmám získat více poptávek, automatizovat podnikání a prezentovat se profesionálně — s jasnou cenou, jasnými termíny a podporou v češtině i angličtině.',
    ],
    factsTitle: 'Klíčová fakta',
    facts: [
      { icon: Rocket, label: 'Založeno', value: 'Britským podnikatelem pro český trh' },
      { icon: Layers, label: 'Šablony řemesel', value: '47+ specializovaných odvětví' },
      { icon: Languages, label: 'Jazyky', value: 'Čeština (výchozí) a britská angličtina' },
      { icon: Globe, label: 'Působnost', value: 'ČR a dodávky do celého světa' },
      { icon: Clock, label: 'Dodání', value: 'Rychlé spuštění, typicky v týdnech' },
      { icon: MapPin, label: 'Sídlo služeb', value: 'Česká republika, online provoz' },
    ],
    portfolioBadge: 'Portfolio',
    portfolioTitle: 'Ukázky naší práce',
    portfolioSub: 'Každá živá ukázka je plně funkční web s rezervacemi, kalkulačkou a kontakty. Klikněte a projděte si ji.',
    portfolio: [
      { href: '/demo/plumbing', name: 'Instalatérství', tag: 'Řemeslo', desc: 'Web s rezervací havarijních výjezdů a kalkulačkou ceny.' },
      { href: '/demo/eshop', name: 'E-shop', tag: 'Obchod', desc: 'Kompletní e-commerce se 24 produkty a vícekrokovým nákupem.' },
      { href: '/demo/autorepair', name: 'Autoservis', tag: 'Auto-moto', desc: 'Online objednávky na servis s výběrem služeb.' },
      { href: '/demo/photography', name: 'Fotografka', tag: 'Kreativa', desc: 'Portfolio s galeriemi, ceníkem a poptávkovým formulářem.' },
      { href: '/demo/beautysalon', name: 'Beauty salon', tag: 'Krása', desc: 'Rezervace termínů, ceník služeb a dárkové poukazy.' },
      { href: '/demo/realestate', name: 'Realitní kancelář', tag: 'Profese', desc: 'Katalog nemovitostí s filtry a kontaktními formuláři.' },
    ],
    viewDemo: 'Otevřít živou ukázku',
    allDemos: 'Všechny ukázky',
    testimonialsBadge: 'Reference',
    testimonialsTitle: 'Co říkají naši klienti',
    brandBadge: 'Značka',
    brandTitle: 'Logo a kontakt pro média',
    brandText: 'Logo níže můžete použít v článcích o nás. Pro fotografie týmu, vyjádření nebo rozhovor nás kontaktujte — odpovídáme do jednoho pracovního dne.',
    pressContact: 'Kontakt pro média',
    ctaTitle: 'Chcete o nás psát, nebo s námi spolupracovat?',
    ctaSub: 'Napište nám — rádi poskytneme citace, podklady nebo rozhovor.',
    ctaContact: 'Kontaktovat nás',
    ctaOffer: 'Naše nabídka',
  },
  en: {
    seoTitle: 'Media Kit | Who We Are, Portfolio & Testimonials | FastMedia.Pro',
    seoDesc: 'The official FastMedia.Pro media kit: company bio, key facts, live website showcases for trades and services, and testimonials from Czech business owners.',
    switchLabel: 'Česky',
    badge: 'Media kit',
    h1: 'FastMedia.Pro at a glance',
    sub: 'Everything you need to know about our work — company bio, facts, live website showcases and client testimonials — in one place for journalists, partners and curious clients.',
    bioBadge: 'Company bio',
    bioTitle: 'Who we are',
    bio: [
      'FastMedia.Pro is a digital studio designing and running modern websites for tradespeople, sole traders and small businesses in Czechia and beyond. Founded by a British national, it pairs British standards of service with local knowledge of the Czech market.',
      'Every project is built mobile-first and bilingual (Czech and British English), with a focus on load speed, SEO and tools that turn a website into an active sales channel — from price calculators and online booking to an AI lead assistant.',
      'We do more than write code. We help businesses win more enquiries, automate their admin and present themselves professionally — with clear pricing, clear timelines and support in Czech and English.',
    ],
    factsTitle: 'Key facts',
    facts: [
      { icon: Rocket, label: 'Founded by', value: 'A British entrepreneur for the Czech market' },
      { icon: Layers, label: 'Trade templates', value: '47+ specialised industries' },
      { icon: Languages, label: 'Languages', value: 'Czech (default) and British English' },
      { icon: Globe, label: 'Coverage', value: 'Czechia with worldwide delivery' },
      { icon: Clock, label: 'Delivery', value: 'Fast launches, typically in weeks' },
      { icon: MapPin, label: 'Base', value: 'Czech Republic, operating online' },
    ],
    portfolioBadge: 'Portfolio',
    portfolioTitle: 'Selected work',
    portfolioSub: 'Every showcase below is a fully working website with bookings, calculators and contact forms. Click through and explore.',
    portfolio: [
      { href: '/demo/plumbing', name: 'Plumbing', tag: 'Trade', desc: 'Site with emergency callout booking and a price calculator.' },
      { href: '/demo/eshop', name: 'Online shop', tag: 'Retail', desc: 'Complete e-commerce with 24 products and multi-stage checkout.' },
      { href: '/demo/autorepair', name: 'Auto repair', tag: 'Automotive', desc: 'Online service booking with selectable work packages.' },
      { href: '/demo/photography', name: 'Photographer', tag: 'Creative', desc: 'Portfolio with galleries, pricing and an enquiry form.' },
      { href: '/demo/beautysalon', name: 'Beauty salon', tag: 'Beauty', desc: 'Appointment booking, service pricing and gift vouchers.' },
      { href: '/demo/realestate', name: 'Estate agency', tag: 'Professional', desc: 'Property catalogue with filters and contact forms.' },
    ],
    viewDemo: 'Open live demo',
    allDemos: 'All demos',
    testimonialsBadge: 'Testimonials',
    testimonialsTitle: 'What our clients say',
    brandBadge: 'Brand',
    brandTitle: 'Logo & press contact',
    brandText: 'Feel free to use the logo below in articles about us. For team photos, a comment or an interview, get in touch — we reply within one working day.',
    pressContact: 'Press contact',
    ctaTitle: 'Writing about us, or want to work with us?',
    ctaSub: 'Drop us a line — we are happy to provide quotes, background or an interview.',
    ctaContact: 'Contact us',
    ctaOffer: 'Our offer',
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

const MediaKit = () => {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const t = copy[language as 'cs' | 'en'] ?? copy.cs;
  const pickedReviews = reviews.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/media-kit" />

      {/* Top bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="FastMedia.Pro" className="w-7 h-7 rounded-md object-cover" />
            <span className="font-display font-bold">
              Fast<span className="text-accent">Media</span>.Pro
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-5" variant="secondary">{t.badge}</Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-5">{t.h1}</h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">{t.sub}</p>
          </motion.div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4">{t.bioBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">{t.bioTitle}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {t.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h3 className="text-xl font-display font-semibold mb-5">{t.factsTitle}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {t.facts.map(({ icon: Icon, label, value }) => (
                <Card key={label} className="border-border/60">
                  <CardContent className="p-4 flex gap-3">
                    <div className="mt-0.5 rounded-lg bg-accent/10 text-accent p-2 h-fit">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-14 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4">{t.portfolioBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">{t.portfolioTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.portfolioSub}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.portfolio.map((item, i) => (
              <motion.div key={item.href} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.06 }}>
                <Link to={item.href} className="block group h-full">
                  <Card className="h-full border-border/60 hover:border-accent/50 hover:shadow-lg transition-all">
                    <CardContent className="p-5 flex flex-col h-full">
                      <Badge variant="secondary" className="w-fit mb-3">{item.tag}</Badge>
                      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-accent transition-colors">{item.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                        {t.viewDemo} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/#demos">{t.allDemos} <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge variant="outline" className="mb-4">{t.testimonialsBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold">{t.testimonialsTitle}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pickedReviews.map((r, i) => (
              <motion.div key={r.id} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.06 }}>
                <Card className="h-full border-border/60">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-3" aria-label={`${r.rating}/5`}>
                      {Array.from({ length: r.rating }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      “{r.text[isEnglish ? 'en' : 'cs']}”
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/60">
                      <div className="w-9 h-9 rounded-full bg-accent/15 text-accent font-semibold text-xs flex items-center justify-center">
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.trade}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand & press contact */}
      <section className="py-14 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4">{t.brandBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t.brandTitle}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t.brandText}</p>
            <Card className="border-border/60 w-fit">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.pressContact}</p>
                <a href="mailto:support@fastmedia.pro" className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
                  <Mail className="w-4 h-4 text-accent" /> support@fastmedia.pro
                </a>
                <a href="tel:+420797864432" className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
                  <Phone className="w-4 h-4 text-accent" /> +420 797 864 432
                </a>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeUp} className="flex justify-center">
            <div className="rounded-2xl border border-border/60 bg-card p-10 shadow-lg">
              <img src={logo} alt="FastMedia.Pro logo" className="w-40 h-40 rounded-xl object-cover" />
              <p className="text-center font-display font-bold mt-5 text-lg">
                Fast<span className="text-accent">Media</span>.Pro
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t.ctaTitle}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">{t.ctaSub}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/contact">{t.ctaContact} <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/offer">{t.ctaOffer}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MediaKit;
