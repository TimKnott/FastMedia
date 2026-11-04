import type { Benchmark } from './commercialScope';

/**
 * Curated PUBLIC market benchmarks by buyer country (ISO-2). Every entry is copied from the cited
 * public page with its publication/period and retrieval date. Nothing here is a FastMedia price.
 * Add entries only from a page you can cite; never estimate figures into this list.
 */
export interface MarketBenchmark extends Benchmark { country: string; period: string; retrieved: string; source: string; note: string }

export const MARKET_BENCHMARKS: MarketBenchmark[] = [
  {
    country: 'DE', currency: 'EUR', unit: 'day', kind: 'advertised_rate',
    label: 'Malt DE — front-end web developer day rate (0–2 yrs avg → 15+ yrs avg)',
    low_cents: 33300, high_cents: 68600,
    url: 'https://www.malt.de/t/tarifbarometer/it/frontend-webentwickler',
    date: '2026-11-04', period: 'Rates listed on Malt in the last 3 months', retrieved: '2026-11-04',
    source: 'Malt Tarifbarometer', note: 'Freelancer asking rates on one platform; experienced average €638/day. Not agency prices.',
  },
  {
    country: 'CZ', currency: 'CZK', unit: 'month', kind: 'salary_derived',
    label: 'CZSO — average gross monthly wage, software developers (2025)',
    low_cents: 11780000, high_cents: 11780000,
    url: 'https://csu.gov.cz/ict-specialists-and-their-wages',
    date: '2026-07-01', period: 'Year 2025', retrieved: '2026-11-04',
    source: 'Czech Statistical Office', note: 'Employee wage, not a market quote or agency rate. Context only.',
  },
  {
    country: 'CZ', currency: 'CZK', unit: 'month', kind: 'salary_derived',
    label: 'CZSO — average gross monthly wage, ICT professionals, business sphere (2025)',
    low_cents: 10172900, high_cents: 10172900,
    url: 'https://csu.gov.cz/ict-specialists-and-their-wages',
    date: '2026-07-01', period: 'Year 2025', retrieved: '2026-11-04',
    source: 'Czech Statistical Office', note: 'Employee wage, not a market quote or agency rate. Context only.',
  },
];

export const benchmarksFor = (country?: string | null) =>
  MARKET_BENCHMARKS.filter((b) => !!country && b.country === country.trim().toUpperCase());
