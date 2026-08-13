'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Key, Star, X } from 'lucide-react';
import { useParallaxPointer } from '@/components/parallax/ParallaxProvider';
import BookSheet from './BookSheet';
import {
  ClosingPage,
  InvitationPage,
  LovePage,
  PageShell,
  ScripturePage,
  StoryPage,
  StoryTitlePage,
  TitlePage,
} from './BookPages';

type Side = 'left' | 'right';

/** Page numbers, assigned by position so the sequence never has gaps. */
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
const folioFor = (index: number) => ROMAN[index] ?? String(index + 1);

/** Fraction of the stage spent settling before the first page turns. */
const LEAD_IN = 0.06;
/** Fraction after which the book recedes and hands off to the rest of the site. */
const TURNS_END = 0.88;

/**
 * `mounted` matters as much as `isMobile`: the server cannot know the
 * breakpoint, so anything that changes the DOM shape must wait until the real
 * value is known. Rendering the desktop layout first and flipping to mobile a
 * frame later moved the book sideways and — worse — changed the scroll
 * target's height *after* useScroll had measured it, which broke the
 * scroll-to-page-turn mapping.
 */
function useViewport() {
  const [viewport, setViewport] = useState({ mounted: false, isMobile: false });

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => setViewport({ mounted: true, isMobile: query.matches });
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return viewport;
}

export default function BookExperience({ onOpen }: { onOpen: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const { mounted, isMobile } = useViewport();

  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const wrapperRef = useRef<HTMLElement | null>(null);

  /* ---- the pages, in reading order ----------------------------------
     Page numbers are not written here: each page receives its folio from its
     position below, so commenting one out renumbers the rest. */
  const pages = useMemo(() => {
    const openZoom = () => setIsZoomed(true);
    return [
      (side: Side, folio: string, last: boolean) => (
        <TitlePage side={side} folio={folio} showScrollCue={last} />
      ),
      // (side: Side, folio: string, last: boolean) => (
      //   <ScripturePage side={side} folio={folio} showScrollCue={last} />
      // ),
      (side: Side, folio: string, last: boolean) => (
        <InvitationPage side={side} folio={folio} showScrollCue={last} onZoom={openZoom} />
      ),
      // (side: Side, folio: string, last: boolean) => (
      //   <LovePage side={side} folio={folio} showScrollCue={last} />
      // ),
      // (side: Side, folio: string, last: boolean) => (
      //   <StoryTitlePage side={side} folio={folio} showScrollCue={last} />
      // ),
      // (side: Side, folio: string, last: boolean) => (
      //   <StoryPage side={side} folio={folio} showScrollCue={last} from={0} />
      // ),
      // (side: Side, folio: string, last: boolean) => (
      //   <StoryPage side={side} folio={folio} showScrollCue={last} from={2} />
      // ),
      // (side: Side, folio: string, last: boolean) => (
      //   <ClosingPage side={side} folio={folio} showScrollCue={last} />
      // ),
    ];
  }, []);

  /* ---- sheets: one page per sheet, always on the right ----------------
     Every page is the front of its own sheet, so all content sits on the
     right-hand side and each turn reveals blank paper on the left. */
  const sheets = useMemo(
    () =>
      pages.map((page, index) => ({
        front: page('right', folioFor(index), index === pages.length - 1),
        // Blank backs carry no folio — unnumbered, as in a real book.
        back: <PageShell side="left">{null}</PageShell>,
      })),
    [pages],
  );

  /* Previously the desktop layout paired pages into spreads, so odd pages sat
     on the right and even pages on the left:

     const spreads = [];
     for (let i = 0; i < pages.length; i += 2) {
       spreads.push({
         front: pages[i]('right'),
         back: pages[i + 1] ? pages[i + 1]('left') : <PageShell side="left">{null}</PageShell>,
       });
     }
  */

  /* ---- scroll progress across the whole stage ------------------------ */
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  const turnSpan = (TURNS_END - LEAD_IN) / Math.max(sheets.length, 1);

  /* ---- the book recedes once the last page has turned ---------------- */
  const bookScale = useTransform(scrollYProgress, [TURNS_END, 1], [1, 0.82], { clamp: true });
  const bookOpacity = useTransform(scrollYProgress, [TURNS_END, 0.99], [1, 0], { clamp: true });
  const bookLift = useTransform(scrollYProgress, [TURNS_END, 1], [0, -90], { clamp: true });
  const hintOpacity = useTransform(scrollYProgress, [0, LEAD_IN * 1.4], [1, 0], { clamp: true });
  // Once faded out, the book must stop intercepting clicks meant for the
  // sections scrolling up behind it.
  const bookEvents = useTransform(bookOpacity, (o) => (o < 0.05 ? 'none' : 'auto'));

  /* ---- mouse tilt on the book itself (plane 3 of the depth system) ---
     Pitch is kept much smaller than yaw: the pointer usually rests in the
     lower half of the screen, so a strong rotateX left the book permanently
     facing away from the reader and made the pages hard to read. */
  const parallax = useParallaxPointer();
  const fallback = useMotionValue(0);
  const tiltY = useTransform(parallax?.pointerX ?? fallback, (v) => v * 5);
  const tiltX = useTransform(parallax?.pointerY ?? fallback, (v) => -v * 2);

  /* ---- hold the page still until the reader opens the book -----------
     iOS Safari ignores `overflow: hidden` on html/body for scroll prevention,
     so the previous lock did nothing on iPhone: readers could scroll past the
     closed cover, and because the cover never opened they scrolled the whole
     stage looking at a book that never turned.

     Pinning the body with `position: fixed` is the technique WebKit does
     honour. It collapses the body out of flow, so the scroll offset has to be
     captured first and restored on release. */
  useEffect(() => {
    if (isOpen) return;

    // The book is only ever locked before it has been opened, so the reader
    // must start at the very top. Disabling scroll restoration stops the
    // browser putting them back mid-stage after a refresh.
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: document.documentElement.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = '0';
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    // Still set for non-iOS browsers, where it is the cheaper path.
    document.documentElement.style.overflow = 'hidden';

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      document.documentElement.style.overflow = previous.overflow;
      history.scrollRestoration = previousRestoration;
      // Un-fixing the body drops the page back to offset 0, which is exactly
      // where the newly opened book should be.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();

    if (prefersReducedMotion) return;
    // A gold burst timed to the cover clearing the spine.
    window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#D4AF37', '#FFF6D6', '#AA7C11', '#FDFBF7'],
      });
    }, 500);
  };

  const lightbox = (
    <AnimatePresence>
      {isZoomed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-navy-dark/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            aria-label="Close invitation"
            className="absolute top-4 right-4 text-gold hover:text-gold-light bg-navy-deep/80 p-2.5 rounded-full border border-gold/20 z-10"
            onClick={() => setIsZoomed(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            initial={{ scale: 0.92, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 15 }}
            className="relative w-full max-w-lg aspect-[10/21] sm:aspect-[9/18] rounded-xl overflow-hidden border-2 border-gold bg-[#FAF7F0] shadow-[0_0_50px_rgba(212,175,55,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/invitation.jpeg"
              alt="Sanjay & Fathima Rani wedding invitation"
              fill
              className="object-contain p-1"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ---- reduced motion: the same pages, simply stacked ---------------- */
  if (prefersReducedMotion) {
    return (
      <section className="relative w-full px-4 py-16 flex flex-col items-center gap-8">
        {pages.map((page, i) => (
          <div
            key={i}
            className="w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border border-gold/20"
          >
            {page('right', folioFor(i), i === pages.length - 1)}
          </div>
        ))}
        {lightbox}
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      // svh, not vh: on iOS `vh` is the *large* viewport (toolbars hidden), so
      // the stage would be taller than the screen whenever the toolbar shows.
      //
      // Before mount the stage is exactly one screen tall — there are no sheets
      // to turn yet, and the page is locked at the top regardless.
      style={{
        height: mounted ? `${sheets.length * (isMobile ? 78 : 112) + 130}svh` : '100svh',
      }}
    >
      {/*
        h-[100svh] rather than h-screen. `100vh` on iOS Safari is the height
        with the toolbars hidden, so the pinned stage sat taller than the
        visible area and the book drifted vertically as Safari slid its toolbar
        in and out. `svh` is constant regardless of toolbar state; `dvh` would
        resize mid-scroll and make the sticky stage reflow continuously.
      */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex items-center justify-center">
        {/* Warm bloom that opens out of the spine as the cover swings */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.4 }}
          animate={isOpen ? { opacity: 0.55, scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_62%)] pointer-events-none"
        />

        {/* 3D stage */}
        <div
          className="relative w-[92vw] md:w-[min(94vw,1080px)] h-[74svh] md:h-[min(82svh,700px)]"
          // Deeper perspective = gentler foreshortening, so type near the
          // outer edges of the spread stays square-on and legible.
          style={{ perspective: 3200 }}
        >
          {/*
            The closed book occupies only the right half of the spread, so on
            desktop it is nudged right to sit centred. That offset is done in
            CSS at the `md` breakpoint rather than from JS: driving it from
            `isMobile` meant the very first client render put the book in the
            desktop position on phones, then snapped it sideways once the media
            query resolved.
          */}
          <div
            className={`w-full h-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.65,0,0.2,1)] ${
              isOpen ? 'translate-x-0' : 'translate-x-0 md:translate-x-[25%]'
            }`}
          >
          <motion.div
            style={{
              scale: bookScale,
              opacity: bookOpacity,
              y: bookLift,
              rotateX: tiltX,
              rotateY: tiltY,
              pointerEvents: bookEvents,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
            className="relative w-full h-full"
          >
            {/* Board the pages are bound to */}
            <div className="absolute inset-0 rounded-lg bg-navy-deep/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]" />

            {/* Inside of the left board — the endpaper the cover lies on */}
            <div className="absolute top-0 left-0 h-full w-full md:w-1/2 endpaper-surface rounded-l-lg gutter-right overflow-hidden">
              <div className="absolute inset-4 border border-gold/20 rounded-sm" />
            </div>

            {/* Inside of the right board — revealed once every page has turned */}
            <div className="absolute top-0 right-0 h-full w-full md:w-1/2 endpaper-surface rounded-r-lg gutter-left overflow-hidden">
              <div className="absolute inset-4 border border-gold/20 rounded-sm" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
                <Heart className="w-5 h-5 text-gold-dark/60" />
                <p className="font-serif text-[11px] tracking-[0.3em] uppercase text-gold-dark">
                  Sanjay &amp; Fathima Rani
                </p>
                <p className="font-playfair italic text-[11px] text-ink-soft max-w-[80%]">
                  Thank you for sharing our happiness.
                </p>
              </div>
            </div>

            {/* The turning pages */}
            {sheets.map((sheet, i) => (
              <BookSheet
                key={i}
                index={i}
                total={sheets.length}
                progress={scrollYProgress}
                range={[LEAD_IN + i * turnSpan, LEAD_IN + (i + 1) * turnSpan]}
                front={sheet.front}
                back={sheet.back}
              />
            ))}

            {/* Fore-edge: the stack of unturned page edges */}
            <div className="absolute top-1 bottom-1 right-0 w-[6px] page-edges rounded-r-sm shadow-[1px_0_3px_rgba(0,0,0,0.4)] z-[1] hidden md:block" />

            {/* FRONT COVER */}
            <motion.div
              initial={false}
              animate={isOpen ? { rotateY: -172 } : { rotateY: 0 }}
              transition={{ duration: 1.6, ease: [0.6, 0, 0.15, 1] }}
              // Closed, the cover is above everything; open, it sits beneath the
              // pages that have turned onto it.
              style={{ originX: 0, transformStyle: 'preserve-3d', zIndex: isOpen ? 5 : 100 }}
              className="absolute top-0 right-0 h-full w-full md:w-1/2"
            >
              {/* Outside of the cover */}
              <div className="absolute inset-0 backface-hidden cover-surface rounded-r-lg border border-gold/40 shadow-[6px_10px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col items-center justify-center px-6 text-center">
                <div className="absolute inset-3 border-2 border-double border-gold/45 rounded-md pointer-events-none" />
                <div className="absolute inset-5 border border-gold/25 rounded-sm pointer-events-none" />

                <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-gold-dark mb-4">
                  The Matrimony of
                </span>

                {/* Gold seal */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-gold flex items-center justify-center bg-paper-deep/70 shadow-[0_0_30px_rgba(212,175,55,0.35),inset_0_1px_4px_rgba(255,255,255,0.8)] mb-5">
                  <div
                    className="absolute inset-2 rounded-full border border-dashed border-gold/45 animate-spin"
                    style={{ animationDuration: '14s' }}
                  />
                  <div className="flex flex-col items-center text-center">
                    <Heart className="w-5 h-5 text-gold-dark mb-1" />
                    <span className="font-serif text-[11px] sm:text-[12px] tracking-[0.2em] uppercase font-bold text-gold-dark">
                      September 13
                    </span>
                    <span className="font-sans text-[10px] text-ink-soft/85 uppercase tracking-widest">
                      2026
                    </span>
                  </div>
                  <Star className="w-3 h-3 text-gold absolute -top-1.5 left-1/2 -translate-x-1/2" />
                </div>

                <h2 className="font-serif text-lg sm:text-2xl font-extrabold text-gold-foil leading-tight">
                  J. Joseph Sanjay
                  <span className="block font-playfair font-normal italic text-ink-soft/85 text-sm sm:text-base my-0.5">
                    weds
                  </span>
                  B. Fathima Rani
                </h2>

                <p className="font-playfair italic text-[11px] sm:text-xs text-ink-soft leading-relaxed max-w-[85%] mt-4">
                  &ldquo;A celebration of faith, hope, and love. Join us as we begin our
                  forever.&rdquo;
                </p>

                <button
                  onClick={handleOpen}
                  className="mt-6 bg-gold-gradient text-navy-dark font-serif font-bold py-3 px-7 rounded-full uppercase tracking-[0.2em] text-[11px] sm:text-xs flex items-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 transition-transform duration-300 relative overflow-hidden group cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white/25 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Key className="w-3.5 h-3.5" /> Enter Celebration
                </button>

                {/* Spine shading down the hinge edge */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-navy-dark/25 to-transparent pointer-events-none" />
              </div>

              {/* Inside of the cover */}
              <div
                className="absolute inset-0 backface-hidden endpaper-surface rounded-l-lg overflow-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="absolute inset-4 border border-gold/25 rounded-sm" />
                <div className="absolute inset-0 bg-gradient-to-l from-navy-dark/35 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
          </div>
        </div>

        {/* Scroll cue, only once the book is open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              style={{ opacity: hintOpacity }}
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
            >
              <span className="text-[11px] uppercase font-serif tracking-[0.3em] text-gold-light">
                Scroll to turn the page
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-6 bg-gold rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {lightbox}
    </section>
  );
}
