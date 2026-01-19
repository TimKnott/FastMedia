import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { trades } from '@/data/trades';
import { getTradeImage } from '@/data/tradeImages';
import { ArrowRight } from 'lucide-react';

const DemosSection = () => {
  const { t } = useLanguage();

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            {t('demos.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('demos.subtitle')}
          </p>
        </motion.div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trades.map((trade, index) => (
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
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={getTradeImage(trade.id)} 
                    alt={t(trade.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 ${trade.gradient} opacity-75 group-hover:opacity-85 transition-opacity`} />
                
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="relative p-6 h-48 flex flex-col justify-between">
                  <span className="text-5xl drop-shadow-lg">{trade.icon}</span>
                  
                  <div>
                    <h3 className="text-white font-display font-bold text-xl mb-2 drop-shadow-md">
                      {t(trade.nameKey)}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                      {t('demos.explore')}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemosSection;
