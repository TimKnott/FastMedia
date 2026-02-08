import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingTier {
  nameKey: string;
  priceKey: string;
  descKey: string;
  featuresKey: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  { nameKey: 'pricing.starter.name', priceKey: 'pricing.starter.price', descKey: 'pricing.starter.desc', featuresKey: 'pricing.starter.features' },
  { nameKey: 'pricing.basic.name', priceKey: 'pricing.basic.price', descKey: 'pricing.basic.desc', featuresKey: 'pricing.basic.features' },
  { nameKey: 'pricing.pro.name', priceKey: 'pricing.pro.price', descKey: 'pricing.pro.desc', featuresKey: 'pricing.pro.features', popular: true },
  { nameKey: 'pricing.enterprise.name', priceKey: 'pricing.enterprise.price', descKey: 'pricing.enterprise.desc', featuresKey: 'pricing.enterprise.features' },
];

const PricingSection = () => {
  const { t } = useLanguage();

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {t('pricing.label')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const features = t(tier.featuresKey).split('|');
            return (
              <motion.div
                key={tier.nameKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  tier.popular
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02] ring-2 ring-accent'
                    : 'bg-card text-card-foreground shadow-card border border-border'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    {t('pricing.popular')}
                  </span>
                )}

                <h3 className="font-display font-bold text-xl mb-1">{t(tier.nameKey)}</h3>
                <p className={`text-sm mb-4 ${tier.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {t(tier.descKey)}
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-display font-bold">{t(tier.priceKey)}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.popular ? 'text-accent' : 'text-accent'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={scrollToBooking}
                  variant={tier.popular ? 'secondary' : 'default'}
                  className="w-full font-semibold"
                >
                  {t('pricing.cta')}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
