import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, ExternalLink, Building2, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { grantRegions, nationalPool, czechOutlinePath } from '@/data/grantRegions';

const copy = {
  cs: {
    seoTitle: 'Kreativní vouchery: regionální partneři podle kraje | FastMedia',
    seoDesc: 'Interaktivní mapa 14 krajů ČR s regionálními inovačními partnery, kteří administrují kreativní vouchery. Vyberte kraj a zjistěte, s kým budete jednat.',
    kicker: 'Kreativní vouchery',
    h1: 'Regionální partneři podle kraje',
    sub: 'Kreativní vouchery neadministruje jedno centrální místo. Každý kraj má vlastního inovačního partnera, který vypisuje výzvy a přijímá žádosti. Klikněte na kraj a uvidíte, s kým budete jednat.',
    mapNote: 'Mapa je schematická — slouží k orientaci, nikoli ke geografickému měření.',
    pick: 'Vyberte kraj na mapě nebo ze seznamu.',
    selected: 'Vybraný kraj',
    partner: 'Regionální partner',
    seat: 'Sídlo partnera',
    visit: 'Otevřít stránky partnera',
    nationalTitle: 'Národní úroveň',
    listTitle: 'Všech 14 krajů',
    ctaTitle: 'Nevíte, jestli na voucher dosáhnete?',
    ctaBody: 'Projděte pětikrokový navigátor. Za pár minut víte, jak silná je vaše žádost, kolik zaplatíte ze svého a s jakým partnerem budete jednat.',
    cta: 'Spustit navigátor',
    rules: 'Pravidla a podmínky',
    disclaimer: 'Kontakty na partnery uvádíme pro vaši orientaci. Nejsme poskytovatel dotace a nezastupujeme žádnou z uvedených organizací. Platí vždy aktuální text výzvy daného partnera.',
    switchLabel: 'English',
  },
  en: {
    seoTitle: 'Creative Vouchers: Regional Partners by Region | FastMedia',
    seoDesc: 'An interactive map of all 14 Czech regions and the regional innovation partners that administer the creative vouchers. Pick your region to see who handles your application.',
    kicker: 'Creative vouchers',
    h1: 'Regional partners by region',
    sub: 'Creative vouchers are not run from one central office. Each Czech region has its own innovation partner that publishes the calls and receives applications. Select a region to see who you will be dealing with.',
    mapNote: 'The map is schematic — it is for orientation, not geographic accuracy.',
    pick: 'Select a region on the map or from the list.',
    selected: 'Selected region',
    partner: 'Regional partner',
    seat: 'Partner base',
    visit: "Open the partner's website",
    nationalTitle: 'National level',
    listTitle: 'All 14 regions',
    ctaTitle: 'Not sure whether you qualify?',
    ctaBody: 'Run the five-step navigator. In a few minutes you will know how strong your application is, what you pay yourself, and which partner handles it.',
    cta: 'Start the navigator',
    rules: 'Rules and conditions',
    disclaimer: 'Partner details are listed for your orientation. We are not the grant provider and we do not represent any of these organisations. The current text of each partner call always applies.',
    switchLabel: 'Čeština',
  },
} as const;

const GrantHubs = () => {
  const { language, setLanguage } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];
  const [activeId, setActiveId] = useState<string>('jihomoravsky');
  const active = grantRegions.find((r) => r.id === activeId) ?? grantRegions[0];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/eugrants" />
      <Navbar />

      <header className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge variant="secondary" className="gap-1.5">
              <Landmark className="h-3.5 w-3.5" /> {t.kicker}
            </Badge>
            <button
              type="button"
              onClick={() => setLanguage(lang === 'cs' ? 'en' : 'cs')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t.switchLabel}
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{t.h1}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.sub}</p>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <svg
                  viewBox="0 0 100 66"
                  role="group"
                  aria-label={t.h1}
                  className="w-full"
                >
                  <path d={czechOutlinePath} className="fill-muted stroke-border" strokeWidth={0.6} />
                  {grantRegions.map((region) => {
                    const isActive = region.id === active.id;
                    return (
                      <g
                        key={region.id}
                        role="button"
                        tabIndex={0}
                        aria-label={region[lang]}
                        aria-pressed={isActive}
                        className="cursor-pointer focus:outline-none"
                        onClick={() => setActiveId(region.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveId(region.id);
                          }
                        }}
                      >
                        <circle
                          cx={region.x}
                          cy={region.y}
                          r={isActive ? 3.1 : 2.1}
                          className={isActive ? 'fill-primary' : 'fill-primary/40 hover:fill-primary/70'}
                        />
                        {isActive && (
                          <circle cx={region.x} cy={region.y} r={5} className="fill-none stroke-primary" strokeWidth={0.5} opacity={0.6} />
                        )}
                        <text
                          x={region.x}
                          y={region.y - 4}
                          textAnchor="middle"
                          className={isActive ? 'fill-foreground' : 'fill-muted-foreground'}
                          style={{ fontSize: '2.4px', fontWeight: isActive ? 700 : 500 }}
                        >
                          {region[lang]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="mt-3 text-xs text-muted-foreground">{t.mapNote}</p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-primary/40">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.selected}</p>
                  <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-bold">
                    <MapPin className="h-5 w-5 text-primary" /> {active[lang]}
                  </h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="font-semibold">{t.partner}</dt>
                      <dd className="text-muted-foreground">{active.hub}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t.seat}</dt>
                      <dd className="text-muted-foreground">{lang === 'cs' ? active.seatCs : active.seatEn}</dd>
                    </div>
                  </dl>
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <a href={active.hubUrl} target="_blank" rel="noopener noreferrer">
                      {t.visit} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                    <Building2 className="h-4 w-4 text-primary" /> {t.nationalTitle}
                  </h3>
                  <p className="mt-3 text-sm font-semibold">{nationalPool[lang].name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{nationalPool[lang].note}</p>
                  <a
                    href={nationalPool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    dpmk.cz <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 font-display text-2xl font-bold md:text-3xl">{t.listTitle}</h2>
            <p className="mb-8 text-sm text-muted-foreground">{t.pick}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grantRegions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setActiveId(region.id)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    region.id === active.id
                      ? 'border-primary bg-card'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <span className="block text-sm font-semibold">{region[lang]}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{region.hub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <Card className="border-primary/30">
            <CardContent className="p-6 md:p-10">
              <h2 className="font-display text-2xl font-bold md:text-3xl">{t.ctaTitle}</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">{t.ctaBody}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/grant-wizard">{t.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/grant-eligibility">{t.rules}</Link>
                </Button>
              </div>
              <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{t.disclaimer}</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GrantHubs;
