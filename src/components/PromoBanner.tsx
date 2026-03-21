import { motion } from 'framer-motion';
import { Globe, MessageSquare, ArrowRight, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface PromoBannerProps {
  variant?: 'full' | 'compact';
}

const content = {
  cs: {
    headline: 'Sídlíme v České republice. Mluvíme anglicky. Pracujeme po celém světě.',
    description: 'FastMedia.Pro je český tým rodilých mluvčích angličtiny, kteří pracují na dálku pro firmy po celém světě. Kvalitní weby bez jazykové bariéry.',
    cta: 'Poptat projekt',
    calcText: 'Nebo si sestavte projekt pomocí naší AI kalkulačky — vše lze kdykoliv změnit.',
    calcCta: 'Zkusit kalkulačku',
  },
  en: {
    headline: 'Based in Czech Republic. Native English. Working Worldwide.',
    description: 'FastMedia.Pro is a Czech-based team of native English speakers working remotely for businesses across the globe. World-class websites, zero language barriers.',
    cta: 'Inquire About Your Project',
    calcText: "Or build your project using our AI calculator — don't worry, everything can be changed later.",
    calcCta: 'Try the Calculator',
  },
  de: {
    headline: 'Sitz in Tschechien. Englische Muttersprachler. Weltweit tätig.',
    description: 'FastMedia.Pro ist ein tschechisches Team englischer Muttersprachler, das remote für Unternehmen weltweit arbeitet. Erstklassige Websites, keine Sprachbarriere.',
    cta: 'Projekt anfragen',
    calcText: 'Oder stellen Sie Ihr Projekt mit unserem AI-Kalkulator zusammen — alles kann später angepasst werden.',
    calcCta: 'Kalkulator testen',
  },
};

const PromoBanner = ({ variant = 'full' }: PromoBannerProps) => {
  const { language } = useLanguage();
  const t = content[language];

  if (variant === 'compact') {
    return (
      <section className="py-6 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{t.headline}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/inquiry"
                className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/calculator"
                className="inline-flex items-center gap-1.5 border border-primary-foreground/30 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" /> {t.calcCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-primary via-primary to-[hsl(220_80%_40%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-8 h-8 text-accent" />
            <MessageSquare className="w-6 h-6 text-accent/70" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
            {t.headline}
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            {t.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              to="/inquiry"
              className="inline-flex items-center gap-2 gradient-accent text-accent-foreground px-8 py-3.5 rounded-xl text-lg font-semibold shadow-glow hover:opacity-90 transition-opacity"
            >
              {t.cta} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-primary-foreground/60 text-sm">
            <Calculator className="w-4 h-4" />
            <span>{t.calcText}</span>
            <Link to="/calculator" className="text-accent font-semibold underline underline-offset-2 hover:text-accent/80 ml-1">
              {t.calcCta} →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoBanner;
