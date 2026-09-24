import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Award, FileCheck, Sparkles } from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';

const badges = [
  {
    icon: Shield,
    label: { cs: 'SSL & GDPR', en: 'SSL & GDPR', de: 'SSL & DSGVO' },
    desc: { cs: 'Zabezpečený web s plným souladu', en: 'Secured website in full compliance', de: 'Gesicherte Website in voller Übereinstimmung' },
  },
  {
    icon: Award,
    label: { cs: 'Technické SEO', en: 'Technical SEO', de: 'Technisches SEO' },
    desc: { cs: 'Sitemap, strukturovaná data a indexovatelný obsah', en: 'Sitemap, structured data and indexable content', de: 'Sitemap, strukturierte Daten und indexierbare Inhalte' },
  },
  {
    icon: FileCheck,
    label: { cs: 'Přístupnost', en: 'Accessibility', de: 'Barrierefreiheit' },
    desc: { cs: 'Navrženo s ohledem na kritéria WCAG 2.1 AA', en: 'Built with WCAG 2.1 AA criteria in mind', de: 'Unter Berücksichtigung der WCAG 2.1 AA-Kriterien gebaut' },
  },
  {
    icon: Sparkles,
    label: { cs: 'Core Web Vitals', en: 'Core Web Vitals', de: 'Core Web Vitals' },
    desc: { cs: 'Optimalizovaný výkon stránek', en: 'Optimised page performance', de: 'Optimierte Seitenleistung' },
  },
];

const learnMore = {
  title: { cs: 'Standardy, podle kterých stavíme', en: 'Standards we build to', de: 'Standards, nach denen wir bauen' },
  explanation: {
    cs: 'Toto jsou standardy, ke kterým se při stavbě webů hlásíme. Nejde o certifikace třetích stran.',
    en: 'These are the standards we build towards. They are not third-party certifications.',
    de: 'Dies sind die Standards, an denen wir uns orientieren. Es handelt sich nicht um Zertifizierungen Dritter.',
  },
  benefits: {
    cs: ['Bezpečné připojení (SSL)', 'Zpracování dat dle GDPR', 'Rychlé načítání stránek'],
    en: ['Secure connection (SSL)', 'GDPR-aware data handling', 'Fast-loading pages'],
    de: ['Sichere Verbindung (SSL)', 'DSGVO-konforme Datenverarbeitung', 'Schnell ladende Seiten'],
  },
};

const CertificationsSection = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const sectionTitle = {
    cs: 'Standardy, podle kterých stavíme',
    en: 'Standards We Build To',
    de: 'Standards, nach denen wir bauen',
  };
  const sectionSubtitle = {
    cs: 'Každý web stavíme s ohledem na bezpečnost, přístupnost a výkon.',
    en: 'Every website is built with security, accessibility and performance in mind.',
    de: 'Jede Website wird mit Blick auf Sicherheit, Barrierefreiheit und Leistung gebaut.',
  };

  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            {lang === 'cs' ? 'Certifikace' : lang === 'de' ? 'Zertifizierungen' : 'Certifications'}
            <LearnMoreModal
              title={learnMore.title[lang]}
              explanation={learnMore.explanation[lang]}
              benefits={learnMore.benefits[lang]}
            />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mt-3 mb-3">
            {sectionTitle[lang]}
          </h2>
          <p className="text-muted-foreground">{sectionSubtitle[lang]}</p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                <badge.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{badge.label[lang]}</p>
                <p className="text-muted-foreground text-xs">{badge.desc[lang]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
