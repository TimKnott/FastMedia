import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Globe2,
  Megaphone,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import launchSky from '@/assets/launch-sky.jpg';
import launchRocket from '@/assets/launch-rocket.png';

const services = [
  { icon: Globe2, label: 'High-converting websites', position: 'left-[7%] top-[18%]' },
  { icon: Bot, label: '24/7 AI lead assistant', position: 'left-[15%] bottom-[18%]' },
  { icon: CalendarCheck, label: 'Bookings & follow-up', position: 'right-[9%] top-[16%]' },
  { icon: Gauge, label: 'SEO & performance', position: 'right-[6%] bottom-[20%]' },
  { icon: Megaphone, label: 'Campaigns that convert', position: 'left-1/2 top-[7%] -translate-x-1/2' },
  { icon: ShieldCheck, label: 'Secure, managed growth', position: 'left-1/2 bottom-[7%] -translate-x-1/2' },
];

const headlineWords = ['Launch', 'your business', 'beyond ordinary.'];

const OfferTeaser = () => {
  const reduceMotion = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setScene((current) => (current + 1) % 2), 8500);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const selectScene = (nextScene: number) => setScene(nextScene);

  return (
    <section
      aria-label="FastMedia launch"
      className="launch-hero relative min-h-[92svh] overflow-hidden bg-launch text-launch-foreground"
    >
      <img
        src={launchSky}
        alt="A moonlit starry sky glowing above a distant sunset"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />
      <div className="launch-hero__shade absolute inset-0" />
      <div className="launch-hero__vignette absolute inset-0" />
      <div className="launch-stars absolute inset-0" aria-hidden="true" />

      <div className="container relative z-10 mx-auto flex min-h-[92svh] items-center px-5 pb-24 pt-28 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          {scene === 0 ? (
            <motion.div
              key="launch"
              initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -30 }}
              transition={{ duration: 0.7 }}
              className="relative z-20 w-full max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6 flex items-center gap-3 text-sm font-bold uppercase text-launch-accent"
              >
                <span className="h-px w-12 bg-launch-accent" />
                Your next chapter is ready
              </motion.div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-8xl">
                {headlineWords.map((line, index) => (
                  <motion.span
                    key={line}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 38 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.16, duration: 0.65, ease: 'easeOut' }}
                    className={index === 2 ? 'block text-launch-accent' : 'block'}
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-7 max-w-xl text-base leading-relaxed text-launch-muted sm:text-lg"
              >
                Beautiful websites, intelligent automation and measurable growth—built into one powerful digital launchpad.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Button asChild size="lg" className="h-13 bg-accent px-7 text-accent-foreground shadow-glow hover:bg-accent/90">
                  <Link to="/calculator">
                    Start your launch <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 border-launch-border bg-launch-surface text-launch-foreground backdrop-blur-md hover:bg-launch-surface-strong hover:text-launch-foreground">
                  <a href="#pricing">Explore packages</a>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="services"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75 }}
              className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
            >
              <div className="mb-4 flex items-center gap-3 text-sm font-bold uppercase text-launch-accent">
                <span className="h-px w-10 bg-launch-accent" /> Mission control <span className="h-px w-10 bg-launch-accent" />
              </div>
              <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                Everything you need to <span className="text-launch-accent">grow in orbit.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base text-launch-muted sm:text-lg">
                One connected system turns attention into enquiries—and enquiries into loyal customers.
              </p>

              <div className="relative mt-9 hidden h-72 w-full md:block" aria-label="FastMedia services">
                <motion.div
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="launch-orbit absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
                <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-launch-border bg-launch-surface-strong backdrop-blur-md">
                  <span className="font-display text-xl font-bold">Fast<span className="text-launch-accent">Media</span>.Pro</span>
                </div>
                {services.map((service, index) => (
                  <motion.div
                    key={service.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, y: reduceMotion ? 0 : [0, -6, 0] }}
                    transition={{ opacity: { delay: 0.18 + index * 0.08 }, scale: { delay: 0.18 + index * 0.08 }, y: { duration: 3 + index * 0.22, repeat: Infinity, ease: 'easeInOut' } }}
                    className={`absolute ${service.position} flex items-center gap-3 rounded-md border border-launch-border bg-launch-surface px-4 py-3 text-left shadow-lg backdrop-blur-md`}
                  >
                    <service.icon className="h-5 w-5 text-launch-accent" />
                    <span className="text-sm font-semibold text-launch-foreground">{service.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid w-full grid-cols-2 gap-2 md:hidden">
                {services.map((service) => (
                  <div key={service.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-launch-border bg-launch-surface p-3 backdrop-blur-md">
                    <service.icon className="h-5 w-5 text-launch-accent" />
                    <span className="text-xs font-semibold">{service.label}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#services">Explore every service <ArrowRight className="h-4 w-4" /></a>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={scene === 0
          ? { opacity: 1, x: reduceMotion ? 0 : [0, 7, -5, 0], y: reduceMotion ? 0 : [0, -8, 0], rotate: reduceMotion ? -7 : [-8, -5, -9, -8] }
          : { opacity: 0, x: '28vw', y: '-85vh', rotate: 10 }}
        transition={scene === 0
          ? { duration: 4.2, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }
          : { duration: reduceMotion ? 0.2 : 1.45, ease: [0.55, 0.02, 0.32, 1] }}
        className="absolute bottom-[2%] right-[3%] z-[15] w-[48vw] max-w-[580px] min-w-[270px] origin-bottom"
      >
        <div className="launch-flame absolute bottom-[7%] left-[12%] h-[18%] w-[28%] -rotate-45" />
        <img src={launchRocket} alt="" width={1024} height={1024} className="relative h-auto w-full drop-shadow-2xl" />
      </motion.div>

      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-launch-border bg-launch-surface px-3 py-2 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={() => selectScene((scene + 1) % 2)} className="h-8 w-8 rounded-full text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground" aria-label="Previous scene">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {[0, 1].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectScene(item)}
            className={`h-1.5 rounded-full transition-all ${scene === item ? 'w-9 bg-launch-accent' : 'w-3 bg-launch-muted/50'}`}
            aria-label={`Show ${item === 0 ? 'launch' : 'services'} scene`}
            aria-current={scene === item ? 'true' : undefined}
          />
        ))}
        <Button variant="ghost" size="icon" onClick={() => selectScene((scene + 1) % 2)} className="h-8 w-8 rounded-full text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground" aria-label="Next scene">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Play className="ml-1 h-3.5 w-3.5 text-launch-muted" aria-hidden="true" />
      </div>
    </section>
  );
};

export default OfferTeaser;