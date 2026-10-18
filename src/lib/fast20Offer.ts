/**
 * FAST20 campaign offer: 24 hours from the first time this browser sees the offer.
 * The start time is stored once (localStorage, falling back to sessionStorage, then memory)
 * and never overwritten, so refreshes and route changes don't reset the deadline.
 * The discount itself is validated server-side by the coupon system; this only governs display.
 */
export const FAST20_CODE = 'FAST20';
export const FAST20_KEY = 'fm-fast20-activated-at';
export const FAST20_WINDOW_MS = 24 * 60 * 60 * 1000;

type Store = Pick<Storage, 'getItem' | 'setItem'>;
let memory: string | null = null;
const memoryStore: Store = { getItem: () => memory, setItem: (_k, v) => { memory = v; } };

export function pickStore(): { store: Store; kind: 'local' | 'session' | 'memory' } {
  for (const [kind, get] of [['local', () => window.localStorage], ['session', () => window.sessionStorage]] as const) {
    try {
      const s = get();
      s.setItem('__fm_probe', '1');
      return { store: s, kind };
    } catch { /* storage blocked */ }
  }
  return { store: memoryStore, kind: 'memory' };
}

/** Returns the activation timestamp, creating it on first call only. */
export function activateFast20(store: Store, now = Date.now()): number {
  const raw = store.getItem(FAST20_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= now) return parsed;
  store.setItem(FAST20_KEY, String(now));
  return now;
}

/** Read-only: activation time if the offer was already shown, else null. */
export function readFast20(store: Store): number | null {
  const n = Number(store.getItem(FAST20_KEY));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function fast20RemainingMs(activatedAt: number | null, now = Date.now()): number {
  if (!activatedAt) return 0;
  return Math.max(0, activatedAt + FAST20_WINDOW_MS - now);
}
