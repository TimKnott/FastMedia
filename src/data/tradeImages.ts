// Trade hero images mapping
import plumberHero from '@/assets/trades/plumber-hero.jpg';
import electricianHero from '@/assets/trades/electrician-hero.jpg';
import rooferHero from '@/assets/trades/roofer-hero.jpg';
import builderHero from '@/assets/trades/builder-hero.jpg';
import painterHero from '@/assets/trades/painter-hero.jpg';
import heatpumpHero from '@/assets/trades/heatpump-hero.jpg';
import solarHero from '@/assets/trades/solar-hero.jpg';
import gardenerHero from '@/assets/trades/gardener-hero.jpg';
import locksmithHero from '@/assets/trades/locksmith-hero.jpg';
import carpenterHero from '@/assets/trades/carpenter-hero.jpg';
import cleaningHero from '@/assets/trades/cleaning-hero.jpg';
import interiorHero from '@/assets/trades/interior-hero.jpg';
import exteriorHero from '@/assets/trades/exterior-hero.jpg';
import drywallHero from '@/assets/trades/drywall-hero.jpg';
import wellsHero from '@/assets/trades/wells-hero.jpg';
import heatingHero from '@/assets/trades/heating-hero.jpg';

export const tradeImages: Record<string, string> = {
  plumbing: plumberHero,
  electrical: electricianHero,
  roofing: rooferHero,
  building: builderHero,
  painting: painterHero,
  heatpumps: heatpumpHero,
  solar: solarHero,
  gardening: gardenerHero,
  locksmith: locksmithHero,
  carpentry: carpenterHero,
  cleaning: cleaningHero,
  interior: interiorHero,
  exterior: exteriorHero,
  drywall: drywallHero,
  wells: wellsHero,
  heating: heatingHero,
};

export const getTradeImage = (tradeId: string): string => {
  return tradeImages[tradeId] || plumberHero;
};
