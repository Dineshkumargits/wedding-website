'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';

// useLayoutEffect warns during SSR; on the server there is no layout to read.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Fades content up as it scrolls into view.
 *
 * Two deliberate choices:
 *
 * 1. The hidden state is applied by JS *after* mount, not rendered into the
 *    HTML. Server-rendered markup is fully visible, so a guest on a slow
 *    connection reads the invitation before hydration rather than staring at
 *    blank sections — and if JS never runs at all, nothing is lost.
 *
 * 2. It uses a class and a CSS transition rather than a per-element animation
 *    library. It runs once, on the compositor, and costs nothing per frame
 *    afterwards. That is the whole difference from the scroll-driven book.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    // Applied before paint, so there is no flash of the visible state first.
    el.classList.add('reveal-hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.remove('reveal-hidden');
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: '-60px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
