'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

/**
 * The opening screen: the couple lit on a dark stage.
 *
 * No card, no paper, no frame — the hero shares the navy-and-gold language of
 * the rest of the page rather than sitting on top of it as a cream rectangle.
 * The cutout's transparency is what makes this work: the couple stand directly
 * in the starfield, lit from behind, reflected in the floor beneath them.
 *
 * Nothing here is scroll-linked and nothing rotates in 3D, so the screen costs
 * nothing to hold.
 */
export default function InvitationHero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden flex flex-col">
      {/* Stage light blooming from behind the couple */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 w-[135vw] max-w-[820px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.20)_0%,rgba(212,175,55,0.07)_38%,transparent_68%)]"
      />

      {/* --- The names --- */}
      <div className="relative z-10 shrink-0 px-6 pt-[6svh] text-center">
        <span className="font-serif text-[10px] sm:text-xs tracking-[0.45em] uppercase text-gold-light/70">
          The Matrimony of
        </span>

        <h1 className="mt-4 font-serif font-extrabold leading-[1.1] text-[1.75rem] sm:text-5xl text-gold-gradient">
          J. Joseph Sanjay
          <span className="block font-playfair font-normal italic text-ivory/45 text-base sm:text-2xl my-1 sm:my-2">
            weds
          </span>
          B. Fathima Rani
        </h1>

        {/* Hairline with a gold lozenge, the divider used elsewhere on the page */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold/60" />
          <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
          <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold/60" />
        </div>

        <p className="mt-4 font-serif text-sm sm:text-lg tracking-[0.3em] text-gold-light">
          13 . 09 . 2026
        </p>
        <p className="mt-1.5 font-sans text-[10px] sm:text-xs tracking-[0.25em] uppercase text-ivory/45">
          St. Fathima Shrine, Krishnagiri
        </p>
      </div>

      {/* --- The couple, standing on a lit floor --- */}
      <div className="relative z-10 flex-1 min-h-0 flex items-end justify-center pb-[11svh]">
        {/* Shrink-wraps the figure, so the reflection below anchors exactly at
            their feet rather than at the bottom of a taller flex box. */}
        <div className="relative">
          {/* Pool of light they stand in */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(78vw,320px)] h-24 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.30)_0%,transparent_70%)]"
          />

          <Image
            src="/sanjay-fathima-cutout.png"
            alt="J. Joseph Sanjay and B. Fathima Rani"
            width={909}
            height={2308}
            priority
            sizes="(max-width: 640px) 60vw, 300px"
            className="relative block h-[48svh] max-h-[440px] w-auto object-contain drop-shadow-[0_0_45px_rgba(212,175,55,0.22)]"
          />

          {/* Reflection in the floor. Masked so it fades as it falls away from
              their feet; the flip means the mask runs bottom-up in local space. */}
          <Image
            src="/sanjay-fathima-cutout.png"
            alt=""
            aria-hidden
            width={909}
            height={2308}
            sizes="(max-width: 640px) 60vw, 300px"
            className="absolute left-0 top-full h-[48svh] max-h-[440px] w-auto object-contain -scale-y-100 opacity-20 blur-[1.5px] pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.85) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.85) 100%)',
            }}
          />

          {/* The floor edge itself */}
          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-[min(90vw,400px)] bg-gradient-to-r from-transparent via-gold/45 to-transparent"
          />
        </div>
      </div>

      {/* --- Scroll cue --- */}
      <div
        aria-hidden
        className="cue-enter absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-gold-light/60"
      >
        <span className="font-serif text-[9px] tracking-[0.35em] uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
