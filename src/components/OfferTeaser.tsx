import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfferTeaser = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/10 to-accent/20">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/30 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/15 text-destructive border border-destructive/30 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            The Reality Check
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto"
          >
            <strong className="text-foreground">92% of local business website leads are lost</strong> because nobody responds within the first 5 minutes. Let's fix that.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.05]"
          >
            A Rebuilt, High-Converting Website{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              + Your Own 24/7 AI Lead Assistant
            </span>
            . Just €297/mo.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-3xl mx-auto"
          >
            We completely redesign and rebuild your entire website from scratch for{' '}
            <strong className="text-foreground">zero upfront cost</strong>. Then we plug in an automated follow-up system that instantly texts and emails every single person who inquires — keeping them warm until you're free to call. You just wake up to an organised list of hot leads ready to buy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button asChild size="lg" className="text-base px-8 h-14 shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
              <Link to="/offer">
                See How the System Works
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <a href="#main-site" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
              Skip to main site ↓
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: Clock, label: 'Instant text-back', desc: 'Within 30 seconds' },
              { icon: TrendingUp, label: 'Zero upfront cost', desc: 'Just €297/mo' },
              { icon: Zap, label: 'Month-to-month', desc: 'No long contracts' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card/60 backdrop-blur border border-border"
              >
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OfferTeaser;
