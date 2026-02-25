import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { trades } from '@/data/trades';
import { Check, Zap, Shield, Clock, Headphones, TrendingUp } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const ServicesSection = () => {
  const { t, language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const features = [
    { icon: Zap, title: { cs: 'Rychlá realizace', en: 'Fast Delivery', de: 'Schnelle Lieferung' }, desc: { cs: 'Web hotový do 7 dní', en: 'Website ready in 7 days', de: 'Website in 7 Tagen fertig' } },
    { icon: Shield, title: { cs: 'Bezpečnost', en: 'Security', de: 'Sicherheit' }, desc: { cs: 'SSL certifikát zdarma', en: 'Free SSL certificate', de: 'Kostenloses SSL-Zertifikat' } },
    { icon: Clock, title: { cs: '24/7 Dostupnost', en: '24/7 Availability', de: '24/7 Verfügbarkeit' }, desc: { cs: 'Vaše stránky nikdy nespí', en: 'Your site never sleeps', de: 'Ihre Website schläft nie' } },
    { icon: Headphones, title: { cs: 'Podpora', en: 'Support', de: 'Support' }, desc: { cs: 'Jsme tu pro vás', en: 'We are here for you', de: 'Wir sind für Sie da' } },
    { icon: TrendingUp, title: { cs: 'SEO optimalizace', en: 'SEO Optimization', de: 'SEO-Optimierung' }, desc: { cs: 'Vyšší pozice ve vyhledávání', en: 'Higher search rankings', de: 'Höhere Suchmaschinenplatzierungen' } },
    { icon: Check, title: { cs: 'Responzivní design', en: 'Responsive Design', de: 'Responsives Design' }, desc: { cs: 'Perfektní na všech zařízeních', en: 'Perfect on all devices', de: 'Perfekt auf allen Geräten' } },
  ];

  return (
    <section id="services" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Services</span>
          <EditableText
            contentKey="services.title"
            defaultValue={t('services.title')}
            value={getContent('services.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="services.subtitle"
            defaultValue={t('services.subtitle')}
            value={getContent('services.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
          />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                {feature.title[language]}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.desc[language]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trades List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-3xl p-8 lg:p-12 shadow-card"
        >
          <h3 className="font-display font-bold text-2xl text-foreground mb-8 text-center">
            {t('services.subtitle')}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {trades.map((trade) => (
              <span
                key={trade.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-default"
              >
                <span>{trade.icon}</span>
                {t(trade.nameKey)}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
