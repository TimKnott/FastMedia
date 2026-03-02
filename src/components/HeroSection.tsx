import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Monitor, Users } from 'lucide-react';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';

const useCountUp = (end: number, duration: number, start: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Deterministic, monotonic easing to avoid jumpy/variable-looking values
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
};

const AnimatedStat = ({ icon: Icon, value, label, delay }: {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) setShouldAnimate(true);
  }, [isInView]);

  // Shorter fallback for mobile where IntersectionObserver can be unreliable
  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => setShouldAnimate(true), 800);
    return () => window.clearTimeout(fallbackTimer);
  }, []);

  const numericPart = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
  const safeNumericPart = Number.isFinite(numericPart) ? numericPart : 0;
  const suffix = value.replace(/[0-9]/g, '');
  const animatedValue = useCountUp(safeNumericPart, 1600, shouldAnimate);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.7, rotateX: 40 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{ duration: 0.8, delay, type: 'spring', stiffness: 120, damping: 14 }}
      className="relative flex flex-col items-center p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 group hover:bg-primary-foreground/10 transition-colors duration-300 overflow-hidden"
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent" />
      <motion.div
        animate={isInView ? { rotate: [0, -10, 10, -5, 0] } : {}}
        transition={{ duration: 0.6, delay: delay + 0.5 }}
      >
        <Icon className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform duration-300" />
      </motion.div>
      <span className="text-3xl font-display font-bold text-primary-foreground tabular-nums">
        {animatedValue}{suffix}
      </span>
      <span className="text-primary-foreground/70 text-sm mt-1">{label}</span>
    </motion.div>
  );
};

const HeroSection = () => {
  const { t, language } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const stats = [
    { icon: Monitor, value: '25+', label: { cs: 'Oborových šablon', en: 'Industry Templates', de: 'Branchenvorlagen' } },
    { icon: Users, value: '402+', label: { cs: 'Spokojených klientů', en: 'Satisfied Clients', de: 'Zufriedene Kunden' } },
    { icon: Sparkles, value: '56%', label: { cs: 'Dotazů vyřízeno automaticky', en: 'Inquiries Handled Automatically', de: 'Anfragen automatisch bearbeitet' } },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-10 w-20 h-20 bg-accent/20 rounded-2xl blur-sm hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl hidden lg:block"
      />

      <div className="container mx-auto px-4 lg:px-8 pt-24 lg:pt-32 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground/90 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            FastMedia.Pro
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6"
          >
            <EditableText
              contentKey="hero.title"
              defaultValue={t('hero.title')}
              value={getContent('hero.title', '') || undefined}
              onSave={invalidate}
              as="h1"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-primary-foreground leading-tight"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <EditableText
              contentKey="hero.subtitle"
              defaultValue={t('hero.subtitle')}
              value={getContent('hero.subtitle', '') || undefined}
              onSave={invalidate}
              as="p"
              className="text-lg sm:text-xl text-primary-foreground/80"
              multiline
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <a href="#contact">
              <Button size="lg" className="gradient-accent text-accent-foreground font-semibold text-lg px-8 py-6 shadow-glow hover:opacity-90 transition-all group">
                {t('hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#demos">
              <Button size="lg" className="bg-transparent border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6">
                {t('hero.cta2')}
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <AnimatedStat
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label[language]}
                delay={0.4 + index * 0.15}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
