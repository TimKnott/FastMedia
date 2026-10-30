import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { trades } from '@/data/trades';
import { getTradeImage } from '@/data/tradeImages';
import { ArrowRight } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const FEATURED = ['plumbing','electrical','beautysalon','catering'];

const DemosSection = ({ limit }: { limit?: number }) => {
  const list = limit ? [...trades].sort((a, b) => (FEATURED.includes(b.id) ? 1 : 0) - (FEATURED.includes(a.id) ? 1 : 0)).slice(0, limit) : trades;
  const { t } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  return (
    <section id="demos" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Demos</span>
          <EditableText
            contentKey="demos.title"
            defaultValue={t('demos.title')}
            value={getContent('demos.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4"
          />
          <EditableText
            contentKey="demos.subtitle"
            defaultValue={t('demos.subtitle')}
            value={getContent('demos.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground text-lg"
          />
        </motion.div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link
                to={trade.demoPath}
                className="group block relative overflow-hidden rounded-2xl shadow-card hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0">
                  <img loading="lazy" decoding="async" 
                    src={getTradeImage(trade.id)} 
                    alt={t(trade.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className={`absolute inset-0 ${trade.gradient} opacity-75 group-hover:opacity-85 transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
                <div className="relative p-6 h-48 flex flex-col justify-between">
                  <span className="text-5xl drop-shadow-lg">{trade.icon}</span>
                  <div>
                    <h3 className="text-primary-foreground font-display font-bold text-xl mb-2 drop-shadow-md">
                      {t(trade.nameKey)}
                    </h3>
                    <div className="flex items-center gap-2 text-primary-foreground/90 text-sm font-medium group-hover:text-primary-foreground transition-colors">
                      {t('demos.explore')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
        {limit && (
          <Link to="/demos" className="mt-10 group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-gradient-to-r from-primary to-accent/80 p-6 sm:p-8 shadow-card hover:shadow-glow transition-shadow">
            <div className="text-center sm:text-left">
              <p className="text-primary-foreground font-display font-bold text-xl sm:text-2xl">{t('demos.all.title').replace('{n}', String(trades.length))}</p>
              <p className="text-primary-foreground/85 text-sm mt-1">{t('demos.all.sub')}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-3 font-semibold text-sm">
              {t('demos.all.cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default DemosSection;
