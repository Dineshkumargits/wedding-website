'use client';

import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useParallaxOffset } from './ParallaxProvider';

interface Speck {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  /** Beyond the budget for small screens, so hidden below the md breakpoint. */
  desktopOnly: boolean;
}

/** mulberry32 — small, fast, and seeded. */
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Particle fields are generated deterministically at module scope: the server
 * and client produce identical markup, so there is no hydration mismatch and
 * no mount-time re-render. Small screens get a thinner field by hiding the
 * tail of the list in CSS rather than by re-generating it.
 */
function makeSpecks(count: number, mobileCount: number, maxSize: number, seed: number): Speck[] {
  const random = rng(seed);
  return Array.from({ length: count }).map((_, i) => ({
    id: seed + i,
    x: random() * 100,
    y: random() * 100,
    size: random() * maxSize + 1.5,
    opacity: random() * 0.5 + 0.2,
    duration: random() * 18 + 14,
    delay: random() * -30,
    desktopOnly: i >= mobileCount,
  }));
}

const STARS = makeSpecks(55, 26, 3.2, 1013);
const BOKEH = makeSpecks(8, 4, 3, 7717);
const MOTES = makeSpecks(11, 5, 6, 4231);

/**
 * One depth plane. `shift` is pointer travel in px, `drift` is the fraction of
 * page scroll the layer moves by (lower = further away).
 */
function Layer({
  shift,
  drift,
  className,
  children,
}: {
  shift: number;
  drift: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const { scrollY } = useScroll();
  const { x, y: pointerY } = useParallaxOffset(shift);
  // Pointer offset and scroll offset stack on the same axis.
  const y = useTransform(() => pointerY.get() + scrollY.get() * drift);

  return (
    <motion.div
      style={{ x, y, willChange: 'transform' }}
      className={`absolute pointer-events-none ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * The five-plane depth system that sits behind (and, for the nearest plane,
 * in front of) all page content.
 *
 * Planes 0-2 render here as a fixed backdrop; plane 3 is the content itself;
 * plane 4 is {@link ParallaxForeground}, mounted separately above the content.
 */
export default function ParallaxBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-navy-dark"
    >
      {/* PLANE 0 — the far nebula. Barely moves; it is the horizon. */}
      <Layer shift={8} drift={-0.04} className="-inset-[15%]">
        <div className="absolute inset-0 bg-navy-gradient opacity-90" />
        <div className="absolute top-[8%] left-[12%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(21,50,91,0.55)_0%,transparent_65%)] md:blur-3xl" />
        <div className="absolute bottom-[5%] right-[8%] w-[48vw] h-[48vw] rounded-full bg-[radial-gradient(circle,rgba(13,31,61,0.85)_0%,transparent_65%)] md:blur-3xl" />
        <div className="absolute top-[45%] left-[55%] w-[34vw] h-[34vw] rounded-full bg-[radial-gradient(circle,rgba(170,124,17,0.09)_0%,transparent_70%)] md:blur-3xl" />
      </Layer>

      {/* PLANE 1 — the star field. */}
      <Layer shift={22} drift={-0.11} className="-inset-[12%]">
        {STARS.map((star) => (
          <span
            key={star.id}
            className={`absolute rounded-full bg-gold-light ${
              star.desktopOnly ? 'hidden md:block' : ''
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow: '0 0 7px rgba(243, 229, 171, 0.75)',
              animation: prefersReducedMotion
                ? undefined
                : `twinkle ${star.duration / 3}s ease-in-out ${star.delay}s infinite alternate`,
            }}
          />
        ))}
      </Layer>

      {/* PLANE 2 — blurred gold bokeh, the mid-ground. */}
      <Layer shift={48} drift={-0.24} className="-inset-[20%]">
        {BOKEH.map((orb) => (
          <span
            key={orb.id}
            className={`absolute rounded-full bg-gold/25 blur-md md:blur-2xl ${
              orb.desktopOnly ? 'hidden md:block' : ''
            }`}
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size * 26}px`,
              height: `${orb.size * 26}px`,
              opacity: orb.opacity * 0.7,
              animation: prefersReducedMotion
                ? undefined
                : `float ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            }}
          />
        ))}
      </Layer>

      {/* Vignette, locked to the viewport so it frames rather than parallaxes. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,11,20,0.75)_100%)]" />

      <style jsx global>{`
        @keyframes twinkle {
          from {
            opacity: 0.15;
            transform: scale(0.85);
          }
          to {
            opacity: 0.85;
            transform: scale(1.15);
          }
        }
        @keyframes mote-drift {
          0% {
            transform: translate3d(0, 12vh, 0) scale(0.9);
          }
          100% {
            transform: translate3d(6vw, -22vh, 0) scale(1.25);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * PLANE 4 — out-of-focus motes crossing *in front of* the content. This is the
 * layer that makes the page feel like it was shot with a camera rather than
 * composited flat, so it is deliberately the fastest-moving plane.
 */
export function ParallaxForeground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden className="hidden md:block fixed inset-0 z-40 overflow-hidden pointer-events-none">
      <Layer shift={95} drift={-0.5} className="-inset-[25%]">
        {MOTES.map((mote) => (
          <span
            key={mote.id}
            className={`absolute rounded-full bg-gold-light/50 blur-[3px] ${
              mote.desktopOnly ? 'hidden md:block' : ''
            }`}
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              width: `${mote.size * 2.4}px`,
              height: `${mote.size * 2.4}px`,
              opacity: mote.opacity * 0.55,
              boxShadow: '0 0 14px rgba(245, 230, 196, 0.5)',
              animation: prefersReducedMotion
                ? undefined
                : `mote-drift ${mote.duration * 1.6}s ease-in-out ${mote.delay}s infinite alternate`,
            }}
          />
        ))}
      </Layer>
    </div>
  );
}
