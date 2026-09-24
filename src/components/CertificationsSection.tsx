import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Award, BadgeCheck, FileCheck, Sparkles } from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';

const badges = [
  {
    icon: Shield,
    label: { cs: 'SSL & GDPR', en: 'SSL & GDPR', de: 'SSL & DSGVO' },
    desc: { cs: 'Zabezpečený web s plným souladu', en: 'Secured website in full compliance', de: 'Gesicherte Website in voller Übereinstimmung' },
  },
  {
    icon: Award,
    label: { cs: 'Google Partner', en: 'Google Partner', de: 'Google Partner' },
    desc: { cs: 'Certifikovaný partner Google Ads', en: 'Certified Google Ads Partner', de: 'Zertifizierter Google Ads Partner' },
  },
  {
    icon: FileCheck,
    label: { cs: 'WCAG 2.1 AA', en: 'WCAG 2.1 AA', de: 'WCAG 2.1 AA' },
    desc: { cs: 'Přístupnost pro všechny uživatele', en: 'Accessibility for all users', de: 'Barrierefreiheit für alle Nutzer' },
  },
  {
    icon: Sparkles,
    label: { cs: 'Core Web Vitals', en: 'Core Web Vitals', de: 'Core Web Vitals' },
    desc: { cs: 'Optimalizovaný výkon stránek', en: 'Optimized page performance', de: 'Optimierte Seitenleistung' },
  },
];

const learnMore = {
  title: { cs: 'Certifikace a licence', en: 'Certifications & Licenses', de: 'Zertifizierungen & Lizenzen' },
  explanation: {
    cs: 'Naše certifikace prokazují, že dodržujeme nejvyšší standardy kvality, bezpečnosti a přístupnosti. Každý web, který vytvoříme, splňuje tyto normy.',
    en: 'Our certifications prove we follow the highest standards of quality, security, and accessibility. Every website we build meets these standards.',
    de: 'Unsere Zertifizierungen beweisen, dass wir die höchsten Standards für Qualität, Sicherheit und Barrierefreiheit einhalten.',
  },
  benefits: {
    cs: ['Buduje důvěru a profesionalitu', 'Prokazuje dodržování standardů', 'Odlišuje od konkurence'],
    en: ['Builds trust and professionalism', 'Proves compliance with standards', 'Differentiates from competition'],
    de: ['Baut Vertrauen und Professionalität auf', 'Beweist Einhaltung von Standards', 'Hebt sich von der Konkurrenz ab'],
  },
};

const CertificationsSection = () => {
  const { language } = useLanguage();
  const lang = language as 'cs' | 'en' | 'de';

  const sectionTitle = {
    cs: 'Důvěryhodnost potvrzená certifikacemi',
    en: 'Trust Backed by Certifications',
    de: 'Vertrauen durch Zertifizierungen',
  };
  const sectionSubtitle = {
    cs: 'Každý web splňuje mezinárodní standardy bezpečnosti, přístupnosti a výkonu.',
    en: 'Every website meets international standards for security, accessibility, and performance.',
    de: 'Jede Website erfüllt internationale Standards für Sicherheit, Barrierefreiheit und Leistung.',
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
