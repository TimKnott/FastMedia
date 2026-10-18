import { describe, it, expect } from 'vitest';
import { activateFast20, fast20RemainingMs, readFast20, FAST20_WINDOW_MS, FAST20_KEY } from './fast20Offer';

const mk = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };

describe('FAST20 24-hour offer', () => {
  it('offer lasts exactly 24 hours from first activation', () => {
    expect(fast20RemainingMs(1000, 1000)).toBe(24 * 60 * 60 * 1000);
    expect(fast20RemainingMs(1000, 1000 + FAST20_WINDOW_MS)).toBe(0);
  });
  it('activating again (refresh) does not reset the deadline', () => {
    const s = mk();
    expect(activateFast20(s, 5000)).toBe(5000);
    expect(activateFast20(s, 999999)).toBe(5000);
  });
  it('expired offer stays expired', () => {
    const s = mk();
    activateFast20(s, 0 + 1);
    expect(fast20RemainingMs(readFast20(s), 1 + FAST20_WINDOW_MS + 1)).toBe(0);
  });
  it('a future/garbage stored value is replaced', () => {
    const s = mk(); s.setItem(FAST20_KEY, 'abc');
    expect(activateFast20(s, 42)).toBe(42);
  });
  it('not shown yet means no active offer', () => {
    expect(fast20RemainingMs(readFast20(mk()), 10)).toBe(0);
  });
});
