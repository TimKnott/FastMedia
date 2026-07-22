import { useEffect, useRef, useState } from 'react';

/**
 * Fabled cursor effect: a soft aurora glow that follows the pointer, a crisp
 * accent ring, and a trail of coral sparks that drift outward on movement.
 * Automatically disables on touch devices and when reduced-motion is preferred.
 */
const CursorFX = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let lastSparkAt = 0;
    let lastMoveX = mouseX;
    let lastMoveY = mouseY;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Spawn sparks proportional to movement speed, throttled.
      const now = performance.now();
      const dx = mouseX - lastMoveX;
      const dy = mouseY - lastMoveY;
      const dist = Math.hypot(dx, dy);
      if (dist > 6 && now - lastSparkAt > 40 && sparksRef.current) {
        lastSparkAt = now;
        const spark = document.createElement('span');
        spark.className = 'cursorfx-spark';
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9;
        const drift = 24 + Math.random() * 32;
        spark.style.setProperty('--sx', `${mouseX}px`);
        spark.style.setProperty('--sy', `${mouseY}px`);
        spark.style.setProperty('--dx', `${Math.cos(angle) * drift}px`);
        spark.style.setProperty('--dy', `${Math.sin(angle) * drift}px`);
        spark.style.setProperty('--size', `${4 + Math.random() * 4}px`);
        sparksRef.current.appendChild(spark);
        window.setTimeout(() => spark.remove(), 700);
        lastMoveX = mouseX;
        lastMoveY = mouseY;
      }
    };

    const onDown = () => {
      ringRef.current?.classList.add('cursorfx-ring--pressed');
    };
    const onUp = () => {
      ringRef.current?.classList.remove('cursorfx-ring--pressed');
    };

    // Grow ring when hovering interactive elements.
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]');
      if (interactive) ringRef.current?.classList.add('cursorfx-ring--hover');
      else ringRef.current?.classList.remove('cursorfx-ring--hover');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let raf = 0;
    const tick = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="cursorfx-root" aria-hidden="true">
      <div ref={glowRef} className="cursorfx-glow" />
      <div ref={ringRef} className="cursorfx-ring" />
      <div ref={sparksRef} className="cursorfx-sparks" />
    </div>
  );
};

export default CursorFX;
