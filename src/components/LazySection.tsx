import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

// Renders children only when near the viewport (or after the page has settled),
// so below-the-fold sections don't slow the first paint on mobile.
export default function LazySection({ children, minHeight = 400 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) setShow(true); }, { rootMargin: '800px 0px' });
    io.observe(el);
    // Fallback: render everything once the page is idle, so crawlers and anchor links see full content.
    const t = window.setTimeout(() => setShow(true), 6000);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [show]);
  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? <Suspense fallback={<div style={{ minHeight }} />}>{children}</Suspense> : null}
    </div>
  );
}
