import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { showcaseSites, SHOWCASE_HUB_URL } from '@/data/showcaseSites';

const ShowcaseCarousel = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const loop = [...showcaseSites, ...showcaseSites];

  return (
    <section aria-labelledby="showcase-heading" className="overflow-hidden bg-background py-14">
      <div className="container mx-auto mb-8 flex flex-col items-center gap-4 px-4 text-center">
        <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
          {en ? 'Live portfolio' : 'Živé portfolio'}
        </span>
        <h2 id="showcase-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {en ? 'Websites we have built — see them on myname.co.uk' : 'Weby, které jsme vytvořili — prohlédněte si je na myname.co.uk'}
        </h2>
        <a
          href={SHOWCASE_HUB_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {en ? 'Visit the showcase' : 'Navštívit ukázky'} <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="showcase-marquee group relative">
        <ul className="showcase-track flex w-max gap-5 group-hover:[animation-play-state:paused]">
          {loop.map((site, i) => (
            <li key={`${site.name}-${i}`} aria-hidden={i >= showcaseSites.length} className="w-64 shrink-0 sm:w-72">
              <a
                href={site.url}
                target="_blank"
                rel="noopener"
                tabIndex={i >= showcaseSites.length ? -1 : 0}
                className="block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={site.image} alt={site.name} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                </div>
                <p className="px-4 py-3 text-sm font-medium text-card-foreground">{site.name}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ShowcaseCarousel;
