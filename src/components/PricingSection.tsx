import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Calculator, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface PricingTier {
  slug: string;
  nameKey: string;
  priceKey: string;
  hostingKey: string;
  descKey: string;
  featuresKey: string;
  popular?: boolean;
}

interface PricingTierExt extends PricingTier {
  priceId?: string;
  hostingPriceId?: string;
}

const tiers: PricingTierExt[] = [
  { slug: 'starter', nameKey: 'pricing.starter.name', priceKey: 'pricing.starter.price', hostingKey: 'pricing.starter.hosting', descKey: 'pricing.starter.desc', featuresKey: 'pricing.starter.features', priceId: 'pkg_starter', hostingPriceId: 'hosting_starter' },
  { slug: 'basic', nameKey: 'pricing.basic.name', priceKey: 'pricing.basic.price', hostingKey: 'pricing.basic.hosting', descKey: 'pricing.basic.desc', featuresKey: 'pricing.basic.features', priceId: 'pkg_basic', hostingPriceId: 'hosting_basic' },
  { slug: 'professional', nameKey: 'pricing.pro.name', priceKey: 'pricing.pro.price', hostingKey: 'pricing.pro.hosting', descKey: 'pricing.pro.desc', featuresKey: 'pricing.pro.features', popular: true, priceId: 'pkg_pro', hostingPriceId: 'hosting_pro' },
  { slug: 'enterprise', nameKey: 'pricing.enterprise.name', priceKey: 'pricing.enterprise.price', hostingKey: 'pricing.enterprise.hosting', descKey: 'pricing.enterprise.desc', featuresKey: 'pricing.enterprise.features' },
];

const pricingLearnMore = {
  title: { cs: 'Proč ukazovat ceny?', en: 'Why Show Prices?', de: 'Warum Preise zeigen?' },
  explanation: {
    cs: 'Transparentní ceník pomáhá zákazníkům rychleji se rozhodnout a buduje důvěru ve vaše služby.',
    en: 'Transparent pricing helps customers decide faster and builds trust in your services.',
    de: 'Transparente Preise helfen Kunden, sich schneller zu entscheiden und Vertrauen aufzubauen.',
  },
  benefits: {
    cs: ['Snižuje počet zbytečných dotazů', 'Zvyšuje konverze o 15–25%', 'Buduje profesionální důvěru'],
    en: ['Reduces unnecessary inquiries', 'Increases conversions by 15–25%', 'Builds professional trust'],
    de: ['Reduziert unnötige Anfragen', 'Steigert Konversionen um 15–25%', 'Baut professionelles Vertrauen auf'],
  },
};

const PricingSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { getContent, invalidate } = useSiteContent();
  const lang = language as 'cs' | 'en' | 'de';

  const viewPackage = (slug: string) => {
    navigate(`/package/${slug}`);
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
          <span className="text-accent font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-1.5">
            {t('pricing.label')}
            <LearnMoreModal
              title={pricingLearnMore.title[lang]}
              explanation={pricingLearnMore.explanation[lang]}
              benefits={pricingLearnMore.benefits[lang]}
            />
          </span>
          <EditableText
            contentKey="pricing.title"
            defaultValue={t('pricing.title')}
            value={getContent('pricing.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="pricing.subtitle"
            defaultValue={t('pricing.subtitle')}
            value={getContent('pricing.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
          />
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
                  <div className={`text-xs mt-1 ${tier.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    + {t('pricing.hosting.label')}: <span className="font-semibold">{t(tier.hostingKey)}</span>
                  </div>
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
                  onClick={() => viewPackage(tier.slug)}
                  variant={tier.popular ? 'secondary' : 'default'}
                  className="w-full font-semibold"
                >
                  {t('pricing.cta')}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            {t('pricing.calculator.hint')}
          </p>
          <Button
            onClick={() => navigate('/calculator')}
            variant="outline"
            size="lg"
            className="gap-2 font-semibold"
          >
            <Calculator className="w-5 h-5" />
            {t('pricing.calculator.cta')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
