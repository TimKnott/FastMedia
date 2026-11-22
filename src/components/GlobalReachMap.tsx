import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import './GlobalReachMap.css';

const copy = {
  en: {
    home: 'Based in Louny.', reach: 'Open to the world.',
    intro: 'We design and build bespoke websites and apps for businesses worldwide. You can brief us in your preferred language, and we’ll build for the languages your customers use.',
    base: 'Our base', routes: 'Illustrative connections', pause: 'Pause motion', play: 'Play motion',
    country: 'Czechia', description: 'Illustrative routes from our base in Louny to eight capital cities.',
  },
  cs: {
    home: 'Sídlíme v Lounech.', reach: 'Pracujeme pro celý svět.',
    intro: 'Navrhujeme a vytváříme weby a aplikace na míru firmám po celém světě. Své zadání nám můžete poslat v jazyce, který vám vyhovuje. Web či aplikaci připravíme v jazycích vašich zákazníků.',
    base: 'Naše sídlo', routes: 'Příklady spojení', pause: 'Pozastavit animaci', play: 'Spustit animaci',
    country: 'Česko', description: 'Ukázková spojení z našeho sídla v Lounech do osmi hlavních měst.',
  },
  de: {
    home: 'Unser Standort ist Louny.', reach: 'Wir arbeiten weltweit.',
    intro: 'Wir entwickeln individuelle Websites und Apps für Unternehmen weltweit. Beschreiben Sie Ihr Projekt in der Sprache Ihrer Wahl. Wir setzen es in den Sprachen Ihrer Kundschaft um.',
    base: 'Unser Standort', routes: 'Beispielverbindungen', pause: 'Animation pausieren', play: 'Animation starten',
    country: 'Tschechien', description: 'Beispielhafte Verbindungen von unserem Standort in Louny zu acht Hauptstädten.',
  },
} as const;

type Route = {
  city: string;
  point: [number, number];
  controls: string;
  label: [number, number, 'start' | 'end' | 'middle'];
  delay: number;
};

// All points use the same projection as the locally hosted world map.
const routes: Route[] = [
  { city: 'London', point: [584.6, 103.7], controls: '610.4 85 597.6 89.7', label: [576.6, 125.7, 'end'], delay: 1 },
  { city: 'Ottawa', point: [360.5, 121.2], controls: '536.4 11 410.5 63.2', label: [347.5, 113.2, 'end'], delay: 6.4 },
  { city: 'Washington, DC', point: [353.2, 139.9], controls: '529.4 54 422.2 107.9', label: [350.2, 170.9, 'start'], delay: 11.8 },
  { city: 'Brasília', point: [435.3, 297.5], controls: '500.4 143 464.3 201.5', label: [422.3, 308.5, 'end'], delay: 2.8 },
  { city: 'Cape Town', point: [641, 349.7], controls: '665.4 168 665 263.7', label: [654, 369.7, 'start'], delay: 8.2 },
  { city: 'Singapore', point: [913, 248.1], controls: '737.4 125 883 170.1', label: [903, 271.1, 'end'], delay: 4.6 },
  { city: 'Canberra', point: [1037.2, 353.6], controls: '832.4 96 1102.2 214.6', label: [1024.2, 358.6, 'end'], delay: 10 },
  { city: 'Wellington', point: [1108.3, 370.9], controls: '861 85 1156 157', label: [1123.3, 402.9, 'end'], delay: 13.6 },
];

export default function GlobalReachMap() {
  const { language } = useLanguage();
  const t = copy[language];
  const [viewBox, setViewBox] = useState('0 0 1170 437');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const small = window.matchMedia('(max-width: 550px)');
    const medium = window.matchMedia('(max-width: 760px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fit = () => setViewBox(small.matches ? '230 0 930 432' : medium.matches ? '125 -2 1035 432' : '0 0 1170 437');
    const prefer = () => setPlaying(!reduced.matches);
    fit();
    prefer();
    small.addEventListener('change', fit);
    medium.addEventListener('change', fit);
    reduced.addEventListener('change', prefer);
    return () => {
      small.removeEventListener('change', fit);
      medium.removeEventListener('change', fit);
      reduced.removeEventListener('change', prefer);
    };
  }, []);

  return (
    <section id="global-reach" aria-labelledby="reach-heading" className="container mx-auto scroll-mt-24 px-4 pb-12">
      <h2 id="reach-heading" className="text-2xl font-bold mb-3 md:text-3xl">{t.home} <span className="text-primary">{t.reach}</span></h2>
      <p className="mb-6 max-w-3xl text-muted-foreground">{t.intro}</p>
      <figure className="fm-global-map overflow-hidden rounded-xl border shadow-sm" data-playing={playing}>
        <div className="fm-map-chart">
          <svg viewBox={viewBox} role="img" aria-labelledby="reach-map-description" id="reach-world-map" className="block h-auto w-full">
            <title id="reach-map-description">{t.description} {routes.map(route => route.city).join(' · ')}.</title>
            <g aria-hidden="true">
              <image href="/maps/fastmedia-world.svg" x="0" y="0" width="1170" height="437" />
              {routes.map(({ city, point, controls, delay }) => {
                const path = 'M625.4 107C' + controls + ' ' + point.join(' ');
                return (
                  <g key={city}>
                    <path d={path} className="fm-map-track" />
                    <path d={path} pathLength="100" className="fm-map-pulse" style={{ animationDelay: '-' + delay + 's' }} />
                  </g>
                );
              })}
              {routes.map(({ city, point: [x,y], label: [lx,ly,anchor] }) => (
                <g key={city}>
                  <circle cx={x} cy={y} r="6.5" fill="#0e2b4a" stroke="#72bbef" />
                  <circle cx={x} cy={y} r="3" fill="#b8e5ff" />
                  <text x={lx} y={ly} textAnchor={anchor} className="fm-map-city">{city}</text>
                </g>
              ))}
              <g transform="translate(625.4 107)">
                <path d="M0 -10L8 -28L20 -28" fill="none" stroke="#ffb78f" strokeWidth="1.2" />
                <g className="fm-map-origin" transform="translate(19 -43)">
                  <rect width={language === 'de' ? 153 : 125} height="29" rx="5" fill="#ffac83" stroke="#ffd5ba" />
                  <text x="10" y="19" fill="#182536" fontSize="15" fontWeight="700">Louny<tspan dx="5" fontWeight="500">· {t.country}</tspan></text>
                </g>
                <circle r="15" fill="#fb733c" opacity=".23" />
                <circle r="9" fill="#172c46" stroke="#ffc5a2" strokeWidth="1.4" />
                <circle r="5" fill="#ff9764" />
              </g>
            </g>
          </svg>
        </div>
        <figcaption className="fm-map-footer">
          <div className="fm-map-legend">
            <span><i className="fm-map-key-home" aria-hidden="true" />{t.base}</span>
            <span><i className="fm-map-key-route" aria-hidden="true" />{t.routes}</span>
          </div>
          <button type="button" className="fm-map-button" aria-controls="reach-world-map" onClick={() => setPlaying(!playing)}>
            {playing ? <Pause aria-hidden="true" size={15} /> : <Play aria-hidden="true" size={15} />}
            {playing ? t.pause : t.play}
          </button>
        </figcaption>
      </figure>
    </section>
  );
}
