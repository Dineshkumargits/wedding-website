'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import MusicPlayer from '@/components/MusicPlayer';
import Venue from '@/components/Venue';
import RSVPForm from '@/components/RSVPForm';
import Guestbook from '@/components/Guestbook';
import MouseTrail from '@/components/MouseTrail';
import TiltCard from '@/components/TiltCard';
import BookExperience from '@/components/book/BookExperience';
import ParallaxBackdrop, { ParallaxForeground } from '@/components/parallax/ParallaxBackdrop';
import { ParallaxProvider, useParallaxOffset } from '@/components/parallax/ParallaxProvider';
import { Heart } from 'lucide-react';

/**
 * Section heading that drifts against its own section as it scrolls, and
 * against the pointer, so the post-book sections share the depth language of
 * the book itself.
 *
 * Only the heading is transformed — a transformed ancestor would become the
 * containing block for the `position: fixed` modals inside Venue and the
 * music player, which would break them.
 */
function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { x, y: pointerY } = useParallaxOffset(prefersReducedMotion ? 0 : 14);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scrollDrift = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [40, -40],
  );
  const y = useTransform(() => pointerY.get() + scrollDrift.get());

  return (
    <div ref={ref} className="mb-12">
      <motion.div style={{ x, y }} className="text-center">
        <span className="text-gold font-serif text-sm tracking-widest uppercase block mb-1">
          {eyebrow}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gold-gradient">
          {title}
        </h2>
        <div className="flourish-divider" />
      </motion.div>
    </div>
  );
}

function PageBody() {
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = () => {
    setHasOpened(true);
    window.dispatchEvent(new CustomEvent('play-wedding-music'));
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-gold selection:text-navy-dark">
      {/* Depth planes 0-2 */}
      <ParallaxBackdrop />

      {hasOpened && <MouseTrail />}
      <MusicPlayer />

      {/* The book: cover opens on click, pages turn on scroll */}
      <BookExperience onOpen={handleOpen} />

      {/* --- VENUE DETAILS & MAPS --- */}
      <section
        id="venue"
        className="relative py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full"
      >
        <SectionHeading eyebrow="Directions &amp; Venues" title="Ceremony &amp; Reception Details" />
        <Venue />
      </section>

      {/* --- RSVP FORM --- */}
      {/* <section
        id="rsvp"
        className="relative py-24 px-4 sm:px-6 bg-navy-deep/20 border-y border-gold/10 w-full"
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Confirm Presence" title="Will You Celebrate With Us?" />
          <TiltCard maxTilt={5}>
            <RSVPForm />
          </TiltCard>
        </div>
      </section> */}

      {/* --- GUESTBOOK / BLESSINGS WALL --- */}
      {/* <section
        id="blessings"
        className="relative py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full"
      >
        <SectionHeading eyebrow="Shower Blessings" title="Guest Blessings Wall" />
        <Guestbook />
      </section> */}

      {/* --- FOOTER --- */}
      <footer className="relative pt-10 pb-16 px-4 bg-navy-dark/80 border-t border-gold/15 text-center mt-auto">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4 relative z-10">
          {/*
            The cutout has a transparent background, so the couple can stand
            free against the navy rather than sitting in a box. The glow behind
            and the soft ellipse beneath give them something to stand on.
          */}
          <div className="relative flex justify-center items-end w-full">
            <div
              aria-hidden
              className="absolute bottom-0 w-56 h-40 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.22)_0%,transparent_70%)]"
            />
            <Image
              src="/sanjay-fathima-cutout-casual.png"
              alt="J. Joseph Sanjay and B. Fathima Rani"
              width={909}
              height={2308}
              sizes="(max-width: 640px) 40vw, 200px"
              className="relative h-52 sm:h-64 w-auto object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.55)]"
            />
            <div
              aria-hidden
              className="absolute bottom-0 w-32 h-3 rounded-[100%] bg-[radial-gradient(ellipse,rgba(0,0,0,0.55)_0%,transparent_75%)]"
            />
          </div>

          <div className="flex gap-2 items-center justify-center text-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <Heart className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>

          <h3 className="font-serif text-lg text-gold-light tracking-widest uppercase">
            Sanjay &amp; Fathima Rani
          </h3>

          <p className="text-xs text-ivory/50 leading-relaxed font-sans px-8">
            Thank you for being an indispensable part of our lives, sharing our happiness, and
            sending your lovely blessings.
          </p>

          <div className="text-[10px] text-gold/40 uppercase tracking-widest mt-6 font-serif">
            September 13, 2026 • Krishnagiri, Tamil Nadu
          </div>
        </div>
      </footer>

      {/* Depth plane 4 — motes drifting in front of the content */}
      <ParallaxForeground />
    </div>
  );
}

export default function Home() {
  return (
    <ParallaxProvider>
      <PageBody />
    </ParallaxProvider>
  );
}
