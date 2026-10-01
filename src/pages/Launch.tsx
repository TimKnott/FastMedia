import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Film, Newspaper, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import launchVideo from '@/assets/fastmedia-launch.mp4.asset.json';

const monthlyThemes = [
  'New year, new trajectory', 'Ideas in orbit', 'Spring launch', 'Creative ignition',
  'Growth velocity', 'Summer lift-off', 'Bright horizons', 'Momentum',
  'Build for tomorrow', 'Mission control', 'Signals and stories', 'Year in flight',
];

const getNextMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
};

const Launch = () => {
  const target = useMemo(getNextMonth, []);
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const countdown = [
    { label: 'Days', value: Math.floor(totalSeconds / 86400) },
    { label: 'Hours', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 'Seconds', value: totalSeconds % 60 },
  ];
  const nextTheme = monthlyThemes[target.getMonth()];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="FastMedia launch" description="Watch the FastMedia launch film, follow the monthly creative programme and access the official press kit." canonical="/launch" pagePath="/launch" />
      <Navbar />
      <ScrollToTop />
      <main>
        <section className="relative min-h-[92svh] overflow-hidden bg-launch text-launch-foreground">
          <video autoPlay muted loop playsInline preload="metadata" poster="/pwa-512x512.png" className="absolute inset-0 h-full w-full object-cover" aria-label="FastMedia rocket launch film">
            <source src={launchVideo.url} type="video/mp4" />
          </video>
          <div className="launch-hero__shade absolute inset-0" />
          <div className="launch-hero__vignette absolute inset-0" />
          <div className="launch-smoke-bank" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <span key={index} style={{ '--smoke-index': index, '--smoke-left': `${(index % 9) * 12 - 10}%`, '--smoke-bottom': `${-10 + (index % 3) * 8}%`, '--smoke-drift': `${index % 2 === 0 ? -8 : 8}%` } as React.CSSProperties} />)}
          </div>
          <div className="container relative z-20 mx-auto flex min-h-[92svh] items-end px-5 pb-28 pt-32 sm:px-8 lg:px-12">
            <div className="max-w-4xl">
              <p className="mb-5 flex items-center gap-3 text-sm font-bold uppercase text-launch-accent"><Rocket className="h-4 w-4" /> FastMedia launch</p>
              <h1 className="text-5xl font-bold leading-none sm:text-7xl lg:text-8xl">Ideas take flight.</h1>
              <p className="mt-6 max-w-2xl text-lg text-launch-muted">A new creative theme takes over every month. Rockets remain our signature; the story, motion and showcase evolve.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link to="/case-studies">Explore our work <ArrowRight className="h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="border-launch-border bg-launch-surface text-launch-foreground hover:bg-launch-surface-strong hover:text-launch-foreground"><Link to="/media-kit">Open press kit <Newspaper className="h-4 w-4" /></Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div><p className="text-sm font-bold uppercase text-accent">Next monthly theme</p><h2 className="mt-2 text-3xl font-bold sm:text-5xl">{nextTheme}</h2></div>
              <div className="grid grid-cols-4 gap-2" aria-label="Countdown to next monthly theme">
                {countdown.map((item) => <div key={item.label} className="min-w-16 border-l border-border px-3 sm:min-w-24"><strong className="block text-2xl sm:text-4xl">{String(item.value).padStart(2, '0')}</strong><span className="text-xs text-muted-foreground">{item.label}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-5 py-20 sm:px-8 lg:px-12">
          <div className="mb-10 max-w-2xl"><p className="text-sm font-bold uppercase text-accent">Launch timeline</p><h2 className="mt-2 text-3xl font-bold sm:text-5xl">From ignition to a working website</h2></div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: CalendarDays, title: 'Plan', text: 'Define the audience, pages and practical tools the website needs.' },
              { icon: Film, title: 'Build', text: 'Shape the visual story, content and working customer journey.' },
              { icon: Rocket, title: 'Launch', text: 'Publish, measure and improve with the business as it grows.' },
            ].map(({ icon: Icon, title, text }, index) => <article key={title} className="border-t border-border pt-6"><span className="text-sm font-bold text-accent">0{index + 1}</span><Icon className="mt-8 h-8 w-8 text-accent" /><h3 className="mt-5 text-2xl font-bold">{title}</h3><p className="mt-3 text-muted-foreground">{text}</p></article>)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Launch;