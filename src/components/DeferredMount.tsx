import { Suspense, useEffect, useState, type ReactNode } from 'react';

// Mounts non-essential site-wide extras (chat bubble, cookie bar, tracking codes…)
// only after the page has loaded and gone idle, so they don't slow the first view.
export default function DeferredMount({ children, delay = 2500 }: { children: ReactNode; delay?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let t: number | undefined;
    const go = () => {
      const w = window as any;
      t = window.setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(() => setReady(true), { timeout: 3000 }) : setReady(true)), delay);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    const early = () => setReady(true);
    window.addEventListener('pointerdown', early, { once: true, passive: true });
    window.addEventListener('keydown', early, { once: true });
    return () => {
      window.removeEventListener('load', go);
      window.removeEventListener('pointerdown', early);
      window.removeEventListener('keydown', early);
      if (t) window.clearTimeout(t);
    };
  }, [delay]);
  return ready ? <Suspense fallback={null}>{children}</Suspense> : null;
}
