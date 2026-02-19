import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Star, MessageCircle } from 'lucide-react';
import jitkaPhoto from '@/assets/team/jitka-listanska.jpg';

const ConsultantSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {t('consultant.label')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            {t('consultant.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('consultant.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-3xl shadow-card overflow-hidden flex flex-col md:flex-row">
            {/* Photo */}
            <div className="md:w-2/5 relative">
              <img
                src={jitkaPhoto}
                alt="Jitka Listanská – FastMedia.Pro Consultant"
                className="w-full h-64 md:h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent" />
            </div>

            {/* Content */}
            <div className="md:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-1">
                Jitka Listanská
              </h3>
              <p className="text-accent font-semibold mb-4">
                {t('consultant.role')}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t('consultant.bio')}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{t('consultant.stat1')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  <span>{t('consultant.stat2')}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/consultant/jitka">
                  <Button className="gradient-accent text-accent-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity gap-2">
                    {t('consultant.cta')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="tel:+420123456789">
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    {t('consultant.call')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultantSection;
