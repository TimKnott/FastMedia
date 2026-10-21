/**
 * Safe first-party analytics events.
 *
 * GA4 (gtag.js) is loaded in index.html with the configured measurement ID.
 * This wrapper is a no-op when gtag is unavailable (blocked script, tests,
 * or a future build without the ID), so callers never need to guard.
 * Cookie consent is handled by the existing CookieConsentBanner; gtag events
 * are anonymous page/click interactions and carry no personal data.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type TrackParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (name: string, params: TrackParams = {}): void => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch {
    // Analytics must never break the page.
  }
};
