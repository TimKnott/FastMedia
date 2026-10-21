/** Owner-confirmed campaign service scope. Not a payment/checkout configuration. */
export const businessSubscription = {
  currency: 'EUR',
  monthlyPriceCents: 2000,
  setupFeeCents: 0,
  designFeeCents: 0,
  requestedEditingMinutesPerMonth: 60,
  includesTemplateWebsite: true,
  includesBookingCalendar: true,
  includesHosting: true,
  proactiveChecksEveryMonths: 1,
} as const;