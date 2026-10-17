import { describe, it, expect } from 'vitest';
import {
  STUDIO_STAGES, ALL_TOOLS, toolHref, draftFromCampaign, canTransition, calcCommissionCents, referralLink, stageProgress,
} from './campaignStudio';

const campaign = { id: 'c1', name: 'Plumbers spring', industry: 'plumbing', audience: 'Louny', offer: 'New site 6 900 Kč', cta: 'Book a call', destination_url: 'https://www.fastmedia.pro/offer', hero_image_url: 'https://x/hero.jpg' };

describe('Campaign Studio navigation', () => {
  it('has five stages in order PLAN, FIND, CREATE, SEND & PUBLISH, TRACK & IMPROVE', () => {
    expect(STUDIO_STAGES.map((s) => s.title)).toEqual(['PLAN', 'FIND', 'CREATE', 'SEND & PUBLISH', 'TRACK & IMPROVE']);
  });
  it('numbers tools 1A–5B exactly as approved', () => {
    expect(ALL_TOOLS.map((t) => t.code)).toEqual(['1A', '1B', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B']);
  });
  it('tool codes start with their stage number', () => {
    STUDIO_STAGES.forEach((s) => s.tools.forEach((t) => expect(t.code.startsWith(String(s.number))).toBe(true)));
  });
  it('carries the campaign into existing tools', () => {
    const finder = ALL_TOOLS.find((t) => t.code === '2A')!;
    expect(toolHref(finder, campaign)).toBe('/admin/finder?campaign=c1&industry=plumbing&audience=Louny');
  });
  it('keeps studio tabs in-page', () => {
    expect(toolHref(ALL_TOOLS.find((t) => t.code === '3C')!, campaign)).toBe('#drafts');
  });
});

describe('Hand-offs', () => {
  it('drafts inherit hero image, CTA and destination', () => {
    const d = draftFromCampaign(campaign, 'email');
    expect(d.image_url).toBe('https://x/hero.jpg');
    expect(d.destination_url).toBe('https://www.fastmedia.pro/offer');
    expect(d.body).toContain('Book a call: https://www.fastmedia.pro/offer');
    expect(d.status).toBe('draft');
  });
  it('cannot send or publish without approval', () => {
    expect(canTransition('draft', 'sent')).toBe(false);
    expect(canTransition('draft', 'published')).toBe(false);
    expect(canTransition('approved', 'sent')).toBe(true);
  });
  it('progress reflects stage', () => {
    expect(stageProgress('planning')).toBe(0);
    expect(stageProgress('done')).toBe(100);
  });
});

describe('Partner commissions', () => {
  const base = { commission_type: 'percent' as const, commission_rate_bps: null, fixed_commission_cents: null, min_project_value_cents: 0 };
  it('returns null when no rate is configured (no invented rates)', () => {
    expect(calcCommissionCents(base, 690000)).toBeNull();
  });
  it('applies configured percent in cents', () => {
    expect(calcCommissionCents({ ...base, commission_rate_bps: 1000 }, 690000)).toBe(69000);
  });
  it('respects minimum project value', () => {
    expect(calcCommissionCents({ ...base, commission_rate_bps: 1000, min_project_value_cents: 1000000 }, 690000)).toBeNull();
  });
  it('builds referral links on www', () => {
    expect(referralLink('AB12CD34')).toBe('https://www.fastmedia.pro/partners?ref=AB12CD34');
  });
});
