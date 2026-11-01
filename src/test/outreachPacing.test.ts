import { describe, it, expect } from 'vitest';
import {
  canSendNow,
  clampPacing,
  DEFAULT_PACING,
  inSendWindow,
  nextGapMinutes,
} from '../../supabase/functions/_shared/send-pacing';
import { sanitizeEmailHtml, htmlToPlainText } from '../../supabase/functions/_shared/email-html';

// Fri 30 Oct 2026 is CET (UTC+1): 10:00 Prague = 09:00 UTC
const fridayTenPrague = new Date('2026-10-30T09:00:00Z');
const saturdayTenPrague = new Date('2026-10-31T09:00:00Z');
const fridayEarly = new Date('2026-10-30T07:30:00Z'); // 08:30 Prague
const fridayLate = new Date('2026-10-30T15:45:00Z'); // 16:45 Prague

describe('outreach pacing', () => {
  it('starts at 25 emails a day', () => {
    expect(DEFAULT_PACING.dailyCap).toBe(25);
  });

  it('sends only between 09:00 and 16:30 Prague time', () => {
    expect(inSendWindow(fridayTenPrague, DEFAULT_PACING)).toBe(true);
    expect(inSendWindow(fridayEarly, DEFAULT_PACING)).toBe(false);
    expect(inSendWindow(fridayLate, DEFAULT_PACING)).toBe(false);
  });

  it('does not send at weekends', () => {
    expect(inSendWindow(saturdayTenPrague, DEFAULT_PACING)).toBe(false);
  });

  it('stops once the daily cap is reached', () => {
    expect(canSendNow(fridayTenPrague, DEFAULT_PACING, { sentToday: 25, sentLastHour: 0 }, null)).toEqual({
      send: false,
      reason: 'daily_cap',
    });
    expect(canSendNow(fridayTenPrague, DEFAULT_PACING, { sentToday: 24, sentLastHour: 0 }, null)).toEqual({ send: true });
  });

  it('waits for the random gap before the next email', () => {
    const later = new Date(fridayTenPrague.getTime() + 60_000);
    expect(canSendNow(fridayTenPrague, DEFAULT_PACING, { sentToday: 1, sentLastHour: 1 }, later)).toEqual({
      send: false,
      reason: 'gap',
    });
  });
  it('enforces the configured eight-per-hour cap', () => {
    expect(canSendNow(fridayTenPrague, DEFAULT_PACING, { sentToday: 8, sentLastHour: 8 }, null)).toEqual({send:false,reason:'hourly_cap'});
    expect(canSendNow(fridayTenPrague, DEFAULT_PACING, { sentToday: 8, sentLastHour: 7 }, null)).toEqual({send:true});
  });
  it('allows the next slot exactly when its four-minute gap expires', () => {
    const slot = new Date(fridayTenPrague.getTime() + 4 * 60000);
    expect(canSendNow(new Date(slot.getTime()-1), DEFAULT_PACING, {sentToday:1,sentLastHour:1},slot)).toEqual({send:false,reason:'gap'});
    expect(canSendNow(slot, DEFAULT_PACING, {sentToday:1,sentLastHour:1},slot)).toEqual({send:true});
  });

  it('spaces emails 4 to 7 minutes apart', () => {
    expect(nextGapMinutes(DEFAULT_PACING, () => 0)).toBe(4);
    expect(nextGapMinutes(DEFAULT_PACING, () => 0.9999)).toBe(7);
  });

  it('never allows more than 100 a day even if saved higher', () => {
    expect(clampPacing({ dailyCap: 300 }).dailyCap).toBe(100);
  });
});

describe('email html sanitiser', () => {
  it('removes scripts and event handlers', () => {
    const out = sanitizeEmailHtml('<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:x">bad</a>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('javascript:');
  });

  it('keeps links and images', () => {
    const out = sanitizeEmailHtml('<p><a href="https://www.fastmedia.pro">Site</a><img src="https://x.test/a.png" alt="a"></p>');
    expect(out).toContain('href="https://www.fastmedia.pro"');
    expect(out).toContain('src="https://x.test/a.png"');
    expect(htmlToPlainText(out)).toContain('Site (https://www.fastmedia.pro)');
  });
});
