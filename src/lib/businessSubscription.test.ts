import { describe, expect, it } from 'vitest';
import { businessSubscription as offer } from './businessSubscription';

describe('confirmed business subscription scope', () => {
  it('costs €20 per month, stored in cents', () => {
    expect(offer.currency).toBe('EUR');
    expect(offer.monthlyPriceCents).toBe(2000);
  });
  it('has no setup fee', () => expect(offer.setupFeeCents).toBe(0));
  it('has no design fee', () => expect(offer.designFeeCents).toBe(0));
  it('includes the template website', () => expect(offer.includesTemplateWebsite).toBe(true));
  it('includes the booking calendar', () => expect(offer.includesBookingCalendar).toBe(true));
  it('includes hosting as part of the service', () => expect(offer.includesHosting).toBe(true));
  it('includes proactive checks each month', () => expect(offer.proactiveChecksEveryMonths).toBe(1));
  it('caps customer-requested editing at one hour each month', () => expect(offer.requestedEditingMinutesPerMonth).toBe(60));
});