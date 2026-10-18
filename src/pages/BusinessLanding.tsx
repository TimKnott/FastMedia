import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, ShoppingCart, LayoutTemplate, Megaphone, Video, Bot, CheckCircle2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShowcaseCarousel from '@/components/ShowcaseCarousel';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import OfferEnquiryForm from '@/components/OfferEnquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import calculatorPreview from '@/assets/calculator-preview.jpg';

type Lang = 'cs' | 'en' | 'de';
type L3 = Record<Lang, string>;

const c = {
  seoTitle: { cs: 'Weby, e-shopy a marketing pro firmy | FastMedia.Pro', en: 'Websites, e-shops & marketing for businesses | FastMedia.Pro', de: 'Websites, Onlineshops & Marketing für Unternehmen | FastMedia.Pro' } as L3,
  seoDesc: { cs: 'Weby a e-shopy na míru, hotové weby, marketing, videa a automatizace poptávek pro řemesla, služby, obchody i pohostinství.', en: 'Custom websites and e-shops, ready-built sites, marketing, video promos and lead automation for trades, services, retail and hospitality.', de: 'Individuelle Websites und Onlineshops, fertige Websites, Marketing, Videos und Lead-Automatisierung für Handwerk, Dienstleistung, Handel und Gastronomie.' } as L3,
  eyebrow: { cs: 'Pro řemesla, služby, obchody a pohostinství', en: 'For trades, services, retail and hospitality', de: 'Für Handwerk, Dienstleistung, Handel und Gastronomie' } as L3,
  headline: { cs: 'Web, který vám přivádí zákazníky — ne jen vypadá hezky.', en: 'A website that brings you customers — not just one that looks nice.', de: 'Eine Website, die Kunden bringt — nicht nur gut aussieht.' } as L3,
  intro: { cs: 'Navrhneme a postavíme web nebo e-shop, pomůžeme s obsahem, videem a marketingem a propojíme formuláře a automatizace, aby žádná poptávka nezapadla.', en: 'We design and build your website or e-shop, help with content, video and marketing, and connect forms and automations so no enquiry slips through.', de: 'Wir gestalten und bauen Ihre Website oder Ihren Shop, helfen bei Inhalten, Video und Marketing und verbinden Formulare und Automatisierungen, damit keine Anfrage verloren geht.' } as L3,
  ctaCalc: { cs: 'Spočítat projekt v kalkulačce', en: 'Plan your project in the calculator', de: 'Projekt im Kalkulator planen' } as L3,
  ctaContact: { cs: 'Nezávazně se poradit', en: 'Talk to us', de: 'Unverbindlich beraten lassen' } as L3,
  ctaOffer: { cs: 'Zobrazit nabídku', en: 'See the offer', de: 'Angebot ansehen' } as L3,
  servicesTitle: { cs: 'Co pro vás uděláme', en: 'What we do for you', de: 'Was wir für Sie tun' } as L3,
  benefitsTitle: { cs: 'Proč to funguje', en: 'Why it works', de: 'Warum es funktioniert' } as L3,
  proofTitle: { cs: 'Ukázky naší práce', en: 'Examples of our work', de: 'Beispiele unserer Arbeit' } as L3,
  finalTitle: { cs: 'Pojďme probrat váš projekt', en: "Let's discuss your project", de: 'Lassen Sie uns Ihr Projekt besprechen' } as L3,
  finalText: { cs: 'Napište nám pár vět o své firmě. Odpovíme do jednoho pracovního dne.', en: 'Tell us a little about your business. We reply within one working day.', de: 'Erzählen Sie uns kurz von Ihrem Unternehmen. Wir antworten innerhalb eines Arbeitstages.' } as L3,
};

const services = [
  { icon: Globe, t: { cs: 'Weby na míru', en: 'Custom websites', de: 'Individuelle Websites' }, d: { cs: 'Rychlé, mobilní a připravené pro vyhledávače.', en: 'Fast, mobile-first and search-ready.', de: 'Schnell, mobil optimiert und suchmaschinenbereit.' } },
  { icon: ShoppingCart, t: { cs: 'E-shopy', en: 'E-shops', de: 'Onlineshops' }, d: { cs: 'Katalog, košík a objednávky přehledně na jednom místě.', en: 'Catalogue, cart and orders, clearly in one place.', de: 'Katalog, Warenkorb und Bestellungen übersichtlich an einem Ort.' } },
  { icon: LayoutTemplate, t: { cs: 'Hotové weby', en: 'Ready-built websites', de: 'Fertige Websites' }, d: { cs: 'Oborové šablony pro rychlý start, přizpůsobené vaší značce.', en: 'Industry templates for a fast start, adapted to your brand.', de: 'Branchenvorlagen für einen schnellen Start, an Ihre Marke angepasst.' } },
  { icon: Megaphone, t: { cs: 'Marketing a obsah', en: 'Marketing & content', de: 'Marketing & Inhalte' }, d: { cs: 'Texty, příspěvky a reklamy připravené ke schválení.', en: 'Copy, posts and adverts prepared for your approval.', de: 'Texte, Beiträge und Anzeigen zur Freigabe vorbereitet.' } },
  { icon: Video, t: { cs: 'Video promo', en: 'Video promos', de: 'Werbevideos' }, d: { cs: 'Krátká videa pro web a sociální sítě.', en: 'Short videos for your site and social media.', de: 'Kurze Videos für Website und soziale Medien.' } },
  { icon: Bot, t: { cs: 'Poptávky a automatizace', en: 'Lead capture & automation', de: 'Anfragen & Automatisierung' }, d: { cs: 'Formuláře, rezervace a chat, které poptávky zachytí a roztřídí.', en: 'Forms, bookings and chat that capture and sort enquiries.', de: 'Formulare, Buchungen und Chat, die Anfragen erfassen und sortieren.' } },
];

const benefits: L3[] = [
  { cs: 'Jasné výzvy k akci na každé stránce', en: 'Clear calls to action on every page', de: 'Klare Handlungsaufforderungen auf jeder Seite' },
  { cs: 'Česky, anglicky i německy', en: 'Czech, English and German', de: 'Tschechisch, Englisch und Deutsch' },
  { cs: 'Vy schvalujete — nic se neodesílá automaticky', en: 'You approve — nothing is sent automatically', de: 'Sie geben frei — nichts wird automatisch versendet' },
  { cs: 'Výsledky se liší podle oboru, lokality a nabídky', en: 'Results vary by industry, location and offer', de: 'Ergebnisse variieren je nach Branche, Standort und Angebot' },
];

const BusinessLanding = () => {
  const { language } = useLanguage();
  const lang = (['cs', 'en', 'de'].includes(language) ? language : 'cs') as Lang;

  const Ctas = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild size="lg" className="gradient-accent text-accent-foreground font-semibold shadow-glow">
        <Link to="/calculator"><Calculator className="mr-2 h-4 w-4" />{c.ctaCalc[lang]}</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href="#enquiry">{c.ctaContact[lang]} <ArrowRight className="ml-2 h-4 w-4" /></a>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle[lang]} description={c.seoDesc[lang]} pagePath="/business" />
      <Navbar />
      <main>
        <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden gradient-hero">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{c.eyebrow[lang]}</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mt-4 mb-6">{c.headline[lang]}</h1>
              <p className="text-lg text-primary-foreground/80 mb-8">{c.intro[lang]}</p>
              <Ctas />
            </motion.div>
            <img src={calculatorPreview} alt="" className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]" />
          </div>
        </section>

        <section className="py-20 container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center mb-12">{c.servicesTitle[lang]}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.t.en} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4"><s.icon className="w-6 h-6 text-accent-foreground" /></div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{s.t[lang]}</h3>
                <p className="text-muted-foreground">{s.d[lang]}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center"><Button asChild variant="outline"><Link to="/offer">{c.ctaOffer[lang]} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">{c.benefitsTitle[lang]}</h2>
            <ul className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {benefits.map(b => <li key={b.en} className="flex gap-3 text-foreground"><CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />{b[lang]}</li>)}
            </ul>
          </div>
        </section>

        <section className="pt-20">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-center mb-4">{c.proofTitle[lang]}</h2>
          <ShowcaseCarousel />
          <CaseStudiesSection />
        </section>

        <section id="enquiry" className="py-20 container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-3">{c.finalTitle[lang]}</h2>
          <p className="text-muted-foreground text-center mb-8">{c.finalText[lang]}</p>
          <div className="flex justify-center mb-10"><Ctas /></div>
          <OfferEnquiryForm lang={lang} source="Business landing page (/business)" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessLanding;
