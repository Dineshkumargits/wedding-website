'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MusicPlayer from '@/components/MusicPlayer';
import Venue from '@/components/Venue';
import MouseTrail from '@/components/MouseTrail';
import Countdown from '@/components/Countdown';
import InvitationHero from '@/components/InvitationHero';
import InvitationSection from '@/components/InvitationSection';
import Reveal from '@/components/Reveal';
import ParallaxBackdrop from '@/components/parallax/ParallaxBackdrop';
import FallingPetals from '@/components/FallingPetals';
import { ParallaxProvider, useParallaxOffset } from '@/components/parallax/ParallaxProvider';
import { Heart, Star } from 'lucide-react';
import { WeddingProvider, useWeddingConfig } from '@/components/WeddingProvider';
import { WeddingConfig } from '@/data/wedding';

/**
 * Section heading. It drifts with the pointer only — no scroll-linked
 * transform, so it costs nothing while scrolling.
 */
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const { x, y } = useParallaxOffset(prefersReducedMotion ? 0 : 12);

  return (
    <Reveal className="mb-12">
      <motion.div style={{ x, y }} className="text-center">
        <span className="text-gold font-serif text-sm tracking-widest uppercase block mb-1">
          {eyebrow}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gold-gradient">
          {title}
        </h2>
        <div className="flourish-divider" />
      </motion.div>
    </Reveal>
  );
}

function PageBody() {
  const weddingConfig = useWeddingConfig();

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-gold selection:text-navy-dark">
      {/* Depth planes 0-2 */}
      <ParallaxBackdrop />

      <MouseTrail />
      <MusicPlayer />

      {/* --- THE INVITATION CARD, filling the first screen --- */}
      <InvitationHero />

      {/* --- SAVE THE DATE & COUNTDOWN --- */}
      <section
        id="celebration"
        className="relative py-24 px-4 sm:px-6 w-full border-y border-gold/10 bg-navy-deep/20"
      >
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center relative mx-auto mb-5 bg-navy-deep/60">
              <span className="font-serif text-base font-bold text-gold-gradient">
                {weddingConfig.couple.initials}
              </span>
              <Star className="w-3 h-3 text-gold absolute -top-1.5 left-1/2 -translate-x-1/2" />
            </div>
          </Reveal>

          <SectionHeading
            eyebrow={weddingConfig.sections.countdown.eyebrow}
            title={weddingConfig.wedding.dateFormatted}
          />

          <Reveal delay={0.05}>
            <p className="font-serif text-xs sm:text-sm text-ivory/70 italic tracking-wide leading-relaxed max-w-md mx-auto mb-10">
              &ldquo;{weddingConfig.wedding.scripture.quote.replace(/^[“"']|[”"']$/g, '')}&rdquo;
              <span className="block text-[10px] mt-2 text-gold-light not-italic tracking-[0.25em] uppercase">
                {weddingConfig.wedding.scripture.reference}
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Countdown />
          </Reveal>
        </div>
      </section>

      {/* --- THE INVITATION --- */}
      <section
        id="invitation"
        className="relative py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full"
      >
        <SectionHeading
          eyebrow={weddingConfig.sections.invitation.eyebrow}
          title={weddingConfig.sections.invitation.title}
        />
        <InvitationSection />
      </section>

      {/* --- VENUE DETAILS & MAPS --- */}
      <section
        id="venue"
        className="relative py-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full"
      >
        <SectionHeading
          eyebrow={weddingConfig.sections.venue.eyebrow}
          title={weddingConfig.sections.venue.title}
        />
        <Reveal>
          <Venue />
        </Reveal>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative pt-10 pb-16 px-4 bg-navy-dark/80 border-t border-gold/15 text-center mt-auto">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4 relative z-10">
          <div className="flex gap-2 items-center justify-center text-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <Heart className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>

          <h3 className="font-serif text-lg text-gold-light tracking-widest uppercase">
            {weddingConfig.couple.displayNames}
          </h3>

          <p className="text-xs text-ivory/50 leading-relaxed font-sans px-8">
            {weddingConfig.sections.footer.message}
          </p>

          <div className="text-[10px] text-gold/40 uppercase tracking-widest mt-6 font-serif">
            {weddingConfig.wedding.dateShort} • {weddingConfig.wedding.summaryLocation}
          </div>
        </div>
      </footer>

      {/* Depth plane 4 — jasmine drifting in front of the content */}
      <FallingPetals />
    </div>
  );
}

export default function WeddingClient({
  initialConfig,
}: {
  initialConfig?: WeddingConfig;
}) {
  return (
    <WeddingProvider initialConfig={initialConfig}>
      <ParallaxProvider>
        <PageBody />
      </ParallaxProvider>
    </WeddingProvider>
  );
}
