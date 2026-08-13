'use client';

import React, { createContext, useContext, useEffect } from 'react';
import {
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

interface ParallaxContextValue {
  /** Pointer position normalised to -0.5 (left/top) .. 0.5 (right/bottom). */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  /** False on touch devices and when the user prefers reduced motion. */
  enabled: boolean;
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

/**
 * Holds the single source of truth for pointer-driven parallax.
 *
 * Every depth layer on the page subscribes to the same two MotionValues, so
 * there is exactly one `pointermove` listener for the whole site and one
 * rAF write per frame no matter how many layers are mounted.
 */
export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Heavy, liquid spring — a stiff one reads as twitchy rather than cinematic.
  const springConfig = { stiffness: 55, damping: 20, mass: 0.6 };
  const pointerX = useSpring(rawX, springConfig);
  const pointerY = useSpring(rawY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) return;
    // Coarse pointers (touch) would only ever fire on tap, which looks like a glitch.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const handleMove = (event: PointerEvent) => {
      nextX = event.clientX / window.innerWidth - 0.5;
      nextY = event.clientY / window.innerHeight - 0.5;

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        rawX.set(nextX);
        rawY.set(nextY);
      });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion, rawX, rawY]);

  const enabled = !prefersReducedMotion;

  return (
    <ParallaxContext.Provider value={{ pointerX, pointerY, enabled }}>
      {children}
    </ParallaxContext.Provider>
  );
}

/**
 * Converts the shared pointer position into a pixel offset for one layer.
 *
 * @param shiftX maximum horizontal travel in px across the full viewport width
 * @param shiftY maximum vertical travel in px (defaults to 60% of shiftX,
 *               since vertical parallax reads stronger than horizontal)
 */
export function useParallaxOffset(shiftX: number, shiftY = shiftX * 0.6) {
  const context = useContext(ParallaxContext);

  // Stable fallbacks keep the hook order and the MotionValue identity constant
  // even if a layer is rendered outside the provider.
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);

  const sourceX = context?.pointerX ?? fallbackX;
  const sourceY = context?.pointerY ?? fallbackY;

  const x = useTransform(sourceX, (value) => value * shiftX * 2);
  const y = useTransform(sourceY, (value) => value * shiftY * 2);

  return { x, y };
}

/** Raw pointer values, for layers that need rotation rather than translation. */
export function useParallaxPointer() {
  return useContext(ParallaxContext);
}
