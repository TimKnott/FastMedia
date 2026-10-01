import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

// Custom event fired before a hash-scroll so the target section mounts immediately.
export const REVEAL_LAZY_EVENT = 'fastmedia:reveal-lazy';
export const revealLazySections = () => window.dispatchEvent(new Event(REVEAL_LAZY_EVENT));

// Renders children only when near the viewport (or after the page has settled),
// so below-the-fold sections don't slow the first paint on mobile.
export default function LazySection({ children, minHeight = 400 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // If the page was opened with a hash (e.g. /#contact), the target may live inside
  // a lazy section — mount everything right away so the scroll can find it.
  const [show, setShow] = useState(() => typeof window !== 'undefined' && !!window.location.hash);
  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) setShow(true); }, { rootMargin: '800px 0px' });
    io.observe(el);
    // Fallback: render everything once the page is idle, so crawlers and anchor links see full content.
    const t = window.setTimeout(() => setShow(true), 6000);
    // A hash-scroll (navbar "Contact", "See our services", …) needs the target in the DOM now.
    const reveal = () => setShow(true);
    window.addEventListener(REVEAL_LAZY_EVENT, reveal);
    return () => { io.disconnect(); window.clearTimeout(t); window.removeEventListener(REVEAL_LAZY_EVENT, reveal); };
  }, [show]);
  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense> : null}
    </div>
  );
}
