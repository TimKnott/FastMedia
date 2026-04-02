import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Globe, Languages, Camera, Video, Server, Palette, Bot,
  Search, BarChart3, ShieldCheck, Smartphone, Clock, Headphones,
} from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';

const services = [
  {
    icon: Globe,
    label: { cs: 'Celosvětové pokrytí', en: 'Worldwide Service', de: 'Weltweiter Service' },
    desc: {
      cs: 'Tvoříme weby pro klienty po celém světě — bez geografických omezení.',
      en: 'We build websites for clients across the globe — no geographic limits.',
      de: 'Wir erstellen Websites für Kunden weltweit — ohne geografische Grenzen.',
    },
  },
  {
    icon: Languages,
    label: { cs: 'Neomezený počet jazyků', en: 'Any Language', de: 'Jede Sprache' },
    desc: {
      cs: 'Váš web dodáme v jakémkoli jazyce — čeština, angličtina, němčina, španělština a další.',
      en: 'We deliver your site in any language — English, Czech, German, Spanish, and more.',
      de: 'Ihre Website in jeder Sprache — Englisch, Tschechisch, Deutsch, Spanisch und mehr.',
    },
  },
  {
    icon: Palette,
    label: { cs: 'Grafika & design', en: 'Graphics & Design', de: 'Grafik & Design' },
    desc: {
      cs: 'Kompletní grafický návrh — loga, bannery, infografiky, vizuální identita.',
      en: 'Full graphic design — logos, banners, infographics, and visual identity.',
      de: 'Komplettes Grafikdesign — Logos, Banner, Infografiken und visuelle Identität.',
    },
  },
  {
    icon: Camera,
    label: { cs: 'Profesionální fotografie', en: 'Professional Photography', de: 'Professionelle Fotografie' },
    desc: {
      cs: 'Dodáváme kvalitní fotografický obsah pro váš web i marketing.',
      en: 'We provide professional photo content for your website and marketing.',
      de: 'Wir liefern professionelle Fotoinhalte für Ihre Website und Ihr Marketing.',
    },
  },
  {
    icon: Video,
    label: { cs: 'Video obsah', en: 'Video Production', de: 'Videoproduktion' },
    desc: {
      cs: 'Promo videa, klientské reference, produktové záběry — vše na klíč.',
      en: 'Promo videos, client testimonials, product shots — all done for you.',
      de: 'Promo-Videos, Kundenreferenzen, Produktaufnahmen — alles aus einer Hand.',
    },
  },
  {
    icon: Server,
    label: { cs: 'Hosting & správa', en: 'Hosting & Maintenance', de: 'Hosting & Wartung' },
    desc: {
      cs: 'Rychlý, bezpečný hosting s SSL, zálohy a průběžná údržba.',
      en: 'Fast, secure hosting with SSL, backups, and ongoing maintenance.',
      de: 'Schnelles, sicheres Hosting mit SSL, Backups und laufender Wartung.',
    },
  },
  {
    icon: Bot,
    label: { cs: 'AI chatbot & automatizace', en: 'AI Chatbot & Automation', de: 'AI-Chatbot & Automatisierung' },
    desc: {
      cs: 'Inteligentní chatbot pro zákaznický servis a automatizaci poptávek.',
      en: 'Smart chatbot for customer service and automated lead capture.',
      de: 'Intelligenter Chatbot für Kundenservice und automatisierte Lead-Erfassung.',
    },
  },
  {
    icon: Search,
    label: { cs: 'SEO optimalizace', en: 'SEO Optimization', de: 'SEO-Optimierung' },
    desc: {
      cs: 'On-page SEO, rychlé načítání, strukturovaná data pro lepší pozice.',
      en: 'On-page SEO, fast load times, structured data for better rankings.',
      de: 'On-Page-SEO, schnelle Ladezeiten, strukturierte Daten für bessere Rankings.',
    },
  },
  {
    icon: BarChart3,
    label: { cs: 'Analytics & reporting', en: 'Analytics & Reporting', de: 'Analyse & Berichte' },
    desc: {
      cs: 'Přehledné statistiky návštěvnosti, konverzí a výkonu webu.',
      en: 'Clear traffic, conversion, and performance analytics dashboards.',
      de: 'Übersichtliche Traffic-, Konversions- und Leistungsanalysen.',
    },
  },
  {
    icon: ShieldCheck,
    label: { cs: 'GDPR & zabezpečení', en: 'GDPR & Security', de: 'DSGVO & Sicherheit' },
    desc: {
      cs: 'Plný soulad s GDPR, cookie consent, SSL šifrování.',
      en: 'Full GDPR compliance, cookie consent, SSL encryption.',
      de: 'Volle DSGVO-Konformität, Cookie-Zustimmung, SSL-Verschlüsselung.',
    },
  },
  {
    icon: Smartphone,
    label: { cs: 'Responzivní design', en: 'Responsive Design', de: 'Responsives Design' },
    desc: {
      cs: 'Dokonalé zobrazení na mobilu, tabletu i desktopu.',
      en: 'Perfect display on mobile, tablet, and desktop devices.',
      de: 'Perfekte Darstellung auf Mobil, Tablet und Desktop.',
    },
  },
  {
    icon: Headphones,
    label: { cs: 'Podpora & konzultace', en: 'Support & Consulting', de: 'Support & Beratung' },
    desc: {
      cs: 'Osobní podpora, strategické konzultace a průběžné vylepšování.',
      en: 'Personal support, strategic consulting, and continuous improvement.',
      de: 'Persönlicher Support, strategische Beratung und kontinuierliche Verbesserung.',
    },
  },
];

const learnMore = {
  title: { cs: 'Co vše dodáváme', en: 'What We Deliver', de: 'Was wir liefern' },
  explanation: {
    cs: 'FastMedia.Pro je kompletní řešení — od návrhu přes obsah až po hosting a podporu. Nemusíte řešit nic sami.',
    en: 'FastMedia.Pro is a complete solution — from design through content to hosting and support. You don\'t have to handle anything yourself.',
    de: 'FastMedia.Pro ist eine Komplettlösung — von Design über Inhalte bis hin zu Hosting und Support.',
  },
  benefits: {
    cs: ['Vše na jednom místě', 'Žádné skryté náklady', 'Globální dosah bez omezení'],
    en: ['Everything in one place', 'No hidden costs', 'Global reach without limits'],
    de: ['Alles an einem Ort', 'Keine versteckten Kosten', 'Globale Reichweite ohne Grenzen'],
  },
};

const ServiceAreaMap = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const title = {
    cs: 'Naše služby po celém světě',
    en: 'Serving Clients Worldwide',
    de: 'Weltweit für unsere Kunden da',
  };

  const subtitle = {
    cs: 'Tvoříme profesionální weby bez geografických nebo jazykových omezení. Dodáváme vše — design, obsah, hosting i podporu.',
    en: 'We create professional websites with no geographic or language limits. We deliver everything — design, content, hosting, and support.',
    de: 'Wir erstellen professionelle Websites ohne geografische oder sprachliche Grenzen. Wir liefern alles — Design, Inhalte, Hosting und Support.',
  };

  return (
    <section id="global-reach" className="py-16 lg:py-24 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            {lang === 'cs' ? 'Globální dosah' : lang === 'de' ? 'Globale Reichweite' : 'Global Reach'}
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-3">
            {title[lang]}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{subtitle[lang]}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1.5 text-sm">
                  {svc.label[lang]}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {svc.desc[lang]}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-full px-6 py-3">
            <Clock className="w-4 h-4 text-accent" />
            {lang === 'cs'
              ? 'Dodání do 10 pracovních dní — odkudkoli na světě'
              : lang === 'de'
                ? 'Lieferung innerhalb von 10 Werktagen — von überall auf der Welt'
                : 'Delivery within 10 business days — from anywhere in the world'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceAreaMap;
