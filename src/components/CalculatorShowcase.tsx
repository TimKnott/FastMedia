import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calculator, Sparkles, ArrowRight, Zap } from 'lucide-react';
import calculatorPreview from '@/assets/calculator-preview.jpg';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const CalculatorShowcase = () => {
  const { t } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {t('calculator_showcase.label')}
          </span>
          <EditableText
            contentKey="calculator_showcase.title"
            defaultValue={t('calculator_showcase.title')}
            value={getContent('calculator_showcase.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="calculator_showcase.subtitle"
            defaultValue={t('calculator_showcase.subtitle')}
            value={getContent('calculator_showcase.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border/50 flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative group overflow-hidden">
              <img loading="lazy" decoding="async" src={calculatorPreview} alt="AI Website Calculator Preview" className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 gradient-hero opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="w-20 h-20 gradient-accent rounded-2xl flex items-center justify-center shadow-glow">
                  <Calculator className="w-10 h-10 text-accent-foreground" />
                </motion.div>
              </div>
            </div>
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {t('calculator_showcase.badge')}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  {t('calculator_showcase.badge2')}
                </div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                {t('calculator_showcase.heading')}
              </h3>
              <ul className="space-y-3 mb-8">
                {['feature1', 'feature2', 'feature3', 'feature4'].map((key) => (
                  <li key={key} className="flex items-start gap-3 text-muted-foreground">
                    <div className="w-5 h-5 rounded-full gradient-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-foreground text-xs">✓</span>
                    </div>
                    {t(`calculator_showcase.${key}`)}
                  </li>
                ))}
              </ul>
              <Link to="/calculator">
                <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity gap-2 h-12 px-8 w-full sm:w-auto">
                  {t('calculator_showcase.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CalculatorShowcase;
