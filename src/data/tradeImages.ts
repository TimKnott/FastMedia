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

// Gallery images
import plumbingGallery1 from '@/assets/trades/gallery/plumbing-1.jpg';
import plumbingGallery2 from '@/assets/trades/gallery/plumbing-2.jpg';
import electricalGallery1 from '@/assets/trades/gallery/electrical-1.jpg';
import electricalGallery2 from '@/assets/trades/gallery/electrical-2.jpg';
import roofingGallery1 from '@/assets/trades/gallery/roofing-1.jpg';
import roofingGallery2 from '@/assets/trades/gallery/roofing-2.jpg';

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

export const tradeGalleryImages: Record<string, string[]> = {
  plumbing: [plumberHero, plumbingGallery1, plumbingGallery2],
  electrical: [electricianHero, electricalGallery1, electricalGallery2],
  roofing: [rooferHero, roofingGallery1, roofingGallery2],
  building: [builderHero],
  painting: [painterHero],
  heatpumps: [heatpumpHero],
  solar: [solarHero],
  gardening: [gardenerHero],
  locksmith: [locksmithHero],
  carpentry: [carpenterHero],
  cleaning: [cleaningHero],
  interior: [interiorHero],
  exterior: [exteriorHero],
  drywall: [drywallHero],
  wells: [wellsHero],
  heating: [heatingHero],
};

export const getTradeImage = (tradeId: string): string => {
  return tradeImages[tradeId] || plumberHero;
};

export const getTradeGalleryImages = (tradeId: string): string[] => {
  return tradeGalleryImages[tradeId] || [plumberHero];
};
