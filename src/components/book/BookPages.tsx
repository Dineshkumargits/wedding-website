'use client';

import React from 'react';
import { Compass, Gem, Heart, MessageSquare, Star } from 'lucide-react';
import Countdown from '@/components/Countdown';
import InvitationCard from '@/components/InvitationCard';

/**
 * A single leaf of the book. `side` decides which edge gets the gutter shadow,
 * so a left-hand page is bound on its right and vice versa.
 */
export function PageShell({
  side,
  folio,
  children,
  className = '',
}: {
  side: 'left' | 'right';
  folio?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full h-full paper-surface overflow-hidden ${
        side === 'right' ? 'gutter-left rounded-r-lg' : 'gutter-right rounded-l-lg'
      }`}
    >
      {/* Hairline rule framing the type block */}
      <div className="absolute inset-3 sm:inset-5 border border-gold/25 rounded-sm pointer-events-none" />
      <div className="absolute inset-4 sm:inset-6 border-[0.5px] border-gold/15 rounded-sm pointer-events-none" />

      <div
        className={`relative w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-9 py-8 ${className}`}
      >
        {children}
      </div>

      {folio && (
        <span
          className={`absolute bottom-3 text-[10px] font-serif tracking-[0.3em] text-ink-soft/65 uppercase ${
            side === 'right' ? 'right-6' : 'left-6'
          }`}
        >
          {folio}
        </span>
      )}
    </div>
  );
}

/** Small gold flourish used to break up the type on a page. */
function Flourish() {
  return (
    <div className="flex items-center justify-center gap-2 my-3 w-full max-w-[70%] mx-auto">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
      <Star className="w-2.5 h-2.5 text-gold/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 1 — the first thing seen when the cover swings open            */
/* ------------------------------------------------------------------ */

export function TitlePage({ side }: { side: 'left' | 'right' }) {
  return (
    <PageShell side={side} folio="i">
      <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center relative mb-4 bg-paper-deep/50 shadow-[inset_0_1px_3px_rgba(26,39,64,0.12)]">
        <span className="font-serif text-base font-bold text-gold-foil">S &amp; F</span>
        <Star className="w-3 h-3 text-gold absolute -top-1.5 left-1/2 -translate-x-1/2" />
      </div>

      <p className="font-playfair text-[11px] sm:text-xs tracking-[0.35em] uppercase text-gold-dark mb-3">
        Save the Date
      </p>

      <h1 className="font-serif font-extrabold leading-tight text-xl sm:text-3xl text-gold-foil">
        J. Joseph Sanjay
        <span className="block font-playfair font-normal italic text-ink-soft/85 text-base sm:text-xl my-1">
          &amp;
        </span>
        B. Fathima Rani
      </h1>

      <Flourish />

      <p className="font-serif text-[10px] sm:text-[12px] text-ink-soft italic tracking-wide leading-relaxed max-w-[90%]">
        &ldquo;What therefore God hath joined together, let not man put asunder.&rdquo;
        <span className="block text-[10px] sm:text-[10px] mt-1 text-gold-dark not-italic tracking-[0.2em] uppercase">
          Mark 10:9
        </span>
      </p>

      <div className="font-serif text-gold-dark tracking-[0.3em] text-sm sm:text-lg my-4">
        13 . 09 . 2026
      </div>

      <div className="w-full scale-90 sm:scale-100">
        <Countdown variant="paper" />
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 2 — the scripture facing the invitation                        */
/* ------------------------------------------------------------------ */

export function ScripturePage({ side }: { side: 'left' | 'right' }) {
  return (
    <PageShell side={side} folio="ii">
      <Heart className="w-5 h-5 text-gold/60 mb-4" />
      <blockquote className="font-playfair italic text-sm sm:text-lg text-ink leading-relaxed max-w-[92%]">
        &ldquo;This thing proceedeth from the Lord.&rdquo;
      </blockquote>
      <cite className="block font-serif text-[11px] tracking-[0.25em] text-gold-dark mt-3 not-italic uppercase">
        Genesis 24:50
      </cite>

      <Flourish />

      <p className="font-serif text-[11px] sm:text-xs text-ink-soft leading-relaxed max-w-[85%] italic">
        With hearts full of gratitude, two families come together to ask for your presence,
        your prayers, and your blessing.
      </p>

      <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-gold-dark mt-6">
        The invitation follows
      </span>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 3 — the invitation itself                                      */
/* ------------------------------------------------------------------ */

export function InvitationPage({
  side,
  onZoom,
}: {
  side: 'left' | 'right';
  onZoom: () => void;
}) {
  return (
    <PageShell side={side} folio="iii" className="!px-4 sm:!px-6 !py-6">
      <p className="font-serif text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold-dark mb-2">
        Our Invitation
      </p>
      {/* Widened to carry the larger type without crowding the ornament frame. */}
      <div className="flex-1 w-full max-w-[360px] min-h-0">
        <InvitationCard onZoom={onZoom} />
      </div>
      <p className="font-sans text-[10px] sm:text-[10px] text-ink-soft/85 tracking-widest uppercase mt-2">
        Tap the card to view the original
      </p>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 4 — the love scripture                                         */
/* ------------------------------------------------------------------ */

export function LovePage({ side }: { side: 'left' | 'right' }) {
  return (
    <PageShell side={side} folio="iv">
      <Heart className="w-5 h-5 text-gold/60 mb-4 animate-pulse" />
      <blockquote className="font-playfair italic text-sm sm:text-lg text-ink leading-relaxed max-w-[92%]">
        &ldquo;And now these three remain: faith, hope and love. But the greatest of these is
        love.&rdquo;
      </blockquote>
      <cite className="block font-serif text-[11px] tracking-[0.25em] text-gold-dark mt-3 not-italic uppercase">
        1 Corinthians 13:13
      </cite>
      <Flourish />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 5 — the story title                                            */
/* ------------------------------------------------------------------ */

export function StoryTitlePage({ side }: { side: 'left' | 'right' }) {
  return (
    <PageShell side={side} folio="v">
      <p className="font-serif text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-gold-dark mb-3">
        Our Story
      </p>
      <h2 className="font-serif text-xl sm:text-3xl font-bold text-gold-foil leading-tight">
        How Two
        <span className="block">Hearts Met</span>
      </h2>
      <Flourish />
      <p className="font-playfair italic text-[11px] sm:text-xs text-ink-soft leading-relaxed max-w-[85%]">
        Every love story is beautiful, but this one is ours — written slowly, over seasons, in
        conversations and quiet promises.
      </p>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGES 6 & 7 — the milestones                                        */
/* ------------------------------------------------------------------ */

const milestones = [
  {
    title: 'First Spark',
    date: 'Autumn 2023',
    description:
      'Amidst the bustling life of Chennai, two paths crossed. A simple conversation bloomed into hours of shared laughter.',
    icon: Compass,
  },
  {
    title: 'Deepening Bonds',
    date: 'Spring 2024',
    description:
      'Through coffee dates, shared dreams and long walks, friendship turned into love — a shared resonance of faith and family.',
    icon: MessageSquare,
  },
  {
    title: 'The Promise',
    date: 'Winter 2025',
    description:
      'With the blessings of parents and loved ones, a promise to walk together forever. An engagement sealed with rings and endless smiles.',
    icon: Gem,
  },
  {
    title: 'The Holy Matrimony',
    date: 'September 13, 2026',
    description:
      'Standing before God and their dearest family at St. Fathima Shrine, they will seal their vows and begin their greatest adventure.',
    icon: Heart,
  },
];

function Milestone({ index }: { index: number }) {
  const { title, date, description, icon: Icon } = milestones[index];
  return (
    <div className="flex gap-3 text-left w-full">
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full border border-gold/45 bg-paper-deep/60 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
          <Icon className="w-3.5 h-3.5 text-gold-dark" />
        </div>
      </div>
      <div className="min-w-0">
        <span className="font-serif text-[10px] sm:text-[10px] tracking-[0.25em] uppercase text-gold-dark font-semibold">
          {date}
        </span>
        <h4 className="font-serif text-sm sm:text-base font-bold text-ink leading-snug">
          {title}
        </h4>
        <p className="font-sans text-[10px] sm:text-[12px] text-ink-soft leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

export function StoryPage({
  side,
  from,
  folio,
}: {
  side: 'left' | 'right';
  from: 0 | 2;
  folio: string;
}) {
  return (
    <PageShell side={side} folio={folio} className="!justify-start gap-6 !pt-12">
      <Milestone index={from} />
      <span className="h-px w-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <Milestone index={from + 1} />
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 8 — the hand-off out of the book                               */
/* ------------------------------------------------------------------ */

export function ClosingPage({ side }: { side: 'left' | 'right' }) {
  return (
    <PageShell side={side} folio="viii">
      <div className="flex gap-2 items-center justify-center text-gold mb-4">
        <span className="w-1 h-1 rounded-full bg-gold" />
        <Heart className="w-4 h-4" />
        <span className="w-1 h-1 rounded-full bg-gold" />
      </div>
      <h3 className="font-serif text-base sm:text-xl text-gold-foil font-bold tracking-wide">
        The Celebration
        <span className="block">Continues</span>
      </h3>
      <Flourish />
      <p className="font-playfair italic text-[11px] sm:text-xs text-ink-soft leading-relaxed max-w-[85%]">
        Directions to the shrine, your RSVP, and a wall for your blessings are waiting just
        beyond these pages.
      </p>
      <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-gold-dark mt-6">
        Keep scrolling
      </span>
    </PageShell>
  );
}
