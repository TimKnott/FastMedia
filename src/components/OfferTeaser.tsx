import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
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
import launchSky from '@/assets/launch-sky-moonlit.jpg';
import launchRocket from '@/assets/launch-rocket.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { revealLazySections } from '@/components/LazySection';

const services = [
  { slug: 'websites', icon: Globe2, cs: 'Weby, které získávají zákazníky', en: 'High-converting websites', position: 'left-[7%] top-[18%]' },
  { slug: 'ai-lead-assistant', icon: Bot, cs: 'AI asistent pro poptávky 24/7', en: '24/7 AI lead assistant', position: 'left-[15%] bottom-[18%]' },
  { slug: 'bookings', icon: CalendarCheck, cs: 'Rezervace a následná péče', en: 'Bookings & follow-up', position: 'right-[9%] top-[16%]' },
  { slug: 'seo-performance', icon: Gauge, cs: 'SEO a rychlost', en: 'SEO & performance', position: 'right-[6%] bottom-[20%]' },
  { slug: 'campaigns', icon: Megaphone, cs: 'Kampaně, které prodávají', en: 'Campaigns that convert', position: 'left-1/2 top-[7%] -translate-x-1/2' },
  { slug: 'managed-growth', icon: ShieldCheck, cs: 'Bezpečný řízený růst', en: 'Secure, managed growth', position: 'left-1/2 bottom-[7%] -translate-x-1/2' },
];

const heroCopy = {
  cs: {
    aria: 'Start vašeho podnikání s FastMedia', alt: 'Měsíční hvězdná obloha nad zářícím západem slunce', eyebrow: 'Vaše další kapitola je připravena',
    headline: ['Odstartujte', 'své podnikání', 'a překonejte běžné hranice.'], body: 'Krásné weby, chytrá automatizace a měřitelný růst — vše v jedné výkonné digitální startovací platformě.',
    primary: 'Zahájit start', secondary: 'Prohlédnout balíčky', control: 'Řídicí centrum', servicesTitle: 'Vše, co potřebujete k růstu.', servicesBody: 'Jeden propojený systém promění pozornost v poptávky a poptávky ve věrné zákazníky.', servicesCta: 'Prozkoumat všechny služby', previous: 'Předchozí scéna', next: 'Další scéna', launchScene: 'Zobrazit startovací scénu', servicesScene: 'Zobrazit scénu služeb', servicesAria: 'Služby FastMedia',
  },
  en: {
    aria: 'FastMedia launch', alt: 'A moonlit starry sky glowing above a distant sunset', eyebrow: 'Your next chapter is ready',
    headline: ['Launch', 'your business', 'beyond ordinary.'], body: 'Beautiful websites, intelligent automation and measurable growth — built into one powerful digital launchpad.',
    primary: 'Start your launch', secondary: 'Explore packages', control: 'Mission control', servicesTitle: 'Everything you need to grow in orbit.', servicesBody: 'One connected system turns attention into enquiries — and enquiries into loyal customers.', servicesCta: 'Explore every service', previous: 'Previous scene', next: 'Next scene', launchScene: 'Show launch scene', servicesScene: 'Show services scene', servicesAria: 'FastMedia services',
  },
} as const;

const OfferTeaser = () => {
  const { language } = useLanguage();
  const { getContent } = useSiteContent();
  const lang = language === 'en' ? 'en' : 'cs';
  const base = heroCopy[lang];
  const headlineOverride = getContent('hero.headline', '');
  const copy = {
    ...base,
    eyebrow: getContent('hero.eyebrow', base.eyebrow),
    headline: headlineOverride
      ? headlineOverride.split('\n').map((line) => line.trim()).filter(Boolean)
      : base.headline,
    body: getContent('hero.body', base.body),
    primary: getContent('hero.cta_primary', base.primary),
    secondary: getContent('hero.cta_secondary', base.secondary),
    servicesTitle: getContent('hero.services_title', base.servicesTitle),
    servicesBody: getContent('hero.services_body', base.servicesBody),
  };
  const reduceMotion = useReducedMotion();
  const lite = reduceMotion || (typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse), (max-width: 767px)").matches);
  const [scene, setScene] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse-follow offset for the rocket (springy, desktop pointers only)
  const rocketX = useMotionValue(0);
  const rocketY = useMotionValue(0);
  const rocketSpringX = useSpring(rocketX, { stiffness: 60, damping: 14, mass: 0.6 });
  const rocketSpringY = useSpring(rocketY, { stiffness: 60, damping: 14, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    if (!section || !window.matchMedia('(pointer: fine)').matches) return;

    const handleMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      rocketX.set(relX * 56);
      rocketY.set(relY * 40);
    };
    const handleLeave = () => {
      rocketX.set(0);
      rocketY.set(0);
    };

    section.addEventListener('mousemove', handleMove);
    section.addEventListener('mouseleave', handleLeave);
    return () => {
      section.removeEventListener('mousemove', handleMove);
      section.removeEventListener('mouseleave', handleLeave);
    };
  }, [reduceMotion, rocketX, rocketY]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setScene((current) => (current + 1) % 2), 8500);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const selectScene = (nextScene: number) => setScene(nextScene);

  return (
    <section
      ref={sectionRef}
      aria-label={copy.aria}
      className="launch-hero relative min-h-[92svh] overflow-hidden bg-launch text-launch-foreground"
    >
      <img decoding="async"
        src={launchSky}
        alt={copy.alt}
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />
      <div className="launch-hero__shade absolute inset-0" />
      <div className="launch-hero__vignette absolute inset-0" />
      <div className="launch-stars absolute inset-0" aria-hidden="true" />
      <div className="shooting-star shooting-star--one absolute z-[5]" aria-hidden="true" />
      <div className="shooting-star shooting-star--two absolute z-[5]" aria-hidden="true" />

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
                 {copy.eyebrow}
              </motion.div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-8xl">
                 {copy.headline.map((line, index) => (
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
                 {copy.body}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Button asChild size="lg" className="h-13 bg-accent px-7 text-accent-foreground shadow-glow hover:bg-accent/90">
                  <Link to="/calculator">
                     {copy.primary} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 border-launch-border bg-launch-surface text-launch-foreground backdrop-blur-md hover:bg-launch-surface-strong hover:text-launch-foreground">
                   <a href="#pricing" onClick={() => revealLazySections()}>{copy.secondary}</a>
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
                 <span className="h-px w-10 bg-launch-accent" /> {copy.control} <span className="h-px w-10 bg-launch-accent" />
              </div>
              <h2 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                 {copy.servicesTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-base text-launch-muted sm:text-lg">
                 {copy.servicesBody}
              </p>

               <div className="relative mt-9 hidden h-72 w-full md:block" aria-label={copy.servicesAria}>
                <motion.div
                  animate={lite ? undefined : { rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="launch-orbit absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
                <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-launch-border bg-launch-surface-strong backdrop-blur-md">
                  <span className="font-display text-xl font-bold">Fast<span className="text-launch-accent">Media</span>.Pro</span>
                </div>
                {services.map((service, index) => (
                  <motion.div
                     key={service.en}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, y: lite ? 0 : [0, -6, 0] }}
                    transition={{ opacity: { delay: 0.18 + index * 0.08 }, scale: { delay: 0.18 + index * 0.08 }, y: { duration: 3 + index * 0.22, repeat: Infinity, ease: 'easeInOut' } }}
                    className={`absolute ${service.position}`}
                  >
                    <Link
                      to={`/service/${service.slug}`}
                      className="flex items-center gap-3 rounded-md border border-launch-border bg-launch-surface px-4 py-3 text-left shadow-lg backdrop-blur-md transition-colors hover:bg-launch-surface-strong"
                    >
                      <service.icon className="h-5 w-5 text-launch-accent" />
                      <span className="text-sm font-semibold text-launch-foreground">{service[lang]}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid w-full grid-cols-2 gap-2 md:hidden">
                {services.map((service) => (
                   <Link key={service.en} to={`/service/${service.slug}`} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border border-launch-border bg-launch-surface p-3 text-center backdrop-blur-md transition-colors hover:bg-launch-surface-strong">
                    <service.icon className="h-5 w-5 text-launch-accent" />
                     <span className="text-xs font-semibold">{service[lang]}</span>
                  </Link>
                ))}
              </div>

              <Button asChild size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90">
                 <a href="#services" onClick={() => revealLazySections()}>{copy.servicesCta} <ArrowRight className="h-4 w-4" /></a>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={scene === 0
          ? { opacity: 1, x: lite ? 0 : [0, 7, -5, 0], y: lite ? 0 : [0, -8, 0], rotate: lite ? -7 : [-8, -5, -9, -8] }
          : { opacity: 0, x: '28vw', y: '-85vh', rotate: 10 }}
        transition={scene === 0
          ? { duration: 4.2, repeat: lite ? 0 : Infinity, ease: 'easeInOut' }
          : { duration: lite ? 0.2 : 1.45, ease: [0.55, 0.02, 0.32, 1] }}
        className="absolute bottom-[2%] right-[3%] z-[15] w-[48vw] max-w-[580px] min-w-[270px] origin-bottom"
      >
        <motion.div style={{ x: rocketSpringX, y: rocketSpringY }}>
          <div className="launch-flame absolute bottom-[7%] left-[12%] h-[18%] w-[28%] -rotate-45" />
          {!lite && (
            <div className="absolute inset-0" aria-hidden="true">
              <div className="launch-smoke launch-smoke--1" />
              <div className="launch-smoke launch-smoke--2" />
              <div className="launch-smoke launch-smoke--3" />
              <div className="launch-smoke launch-smoke--4" />
              <div className="launch-smoke launch-smoke--5" />
              <div className="launch-smoke launch-smoke--6" />
            </div>
          )}
          <img decoding="async" src={launchRocket} alt="" width={1024} height={1024} className="relative h-auto w-full drop-shadow-2xl" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-launch-border bg-launch-surface px-3 py-2 backdrop-blur-md">
         <Button variant="ghost" size="icon" onClick={() => selectScene((scene + 1) % 2)} className="h-8 w-8 rounded-full text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground" aria-label={copy.previous}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {[0, 1].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectScene(item)}
            className={`h-1.5 rounded-full transition-all ${scene === item ? 'w-9 bg-launch-accent' : 'w-3 bg-launch-muted/50'}`}
             aria-label={item === 0 ? copy.launchScene : copy.servicesScene}
            aria-current={scene === item ? 'true' : undefined}
          />
        ))}
         <Button variant="ghost" size="icon" onClick={() => selectScene((scene + 1) % 2)} className="h-8 w-8 rounded-full text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground" aria-label={copy.next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Play className="ml-1 h-3.5 w-3.5 text-launch-muted" aria-hidden="true" />
      </div>
    </section>
  );
};

export default OfferTeaser;