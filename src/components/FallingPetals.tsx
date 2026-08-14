import React from 'react';

/**
 * Jasmine petals drifting down the whole page.
 *
 * Jasmine (மல்லிகை) is the flower of a Tamil wedding, and its white-cream
 * colour sits naturally against the navy rather than fighting it the way
 * marigold orange or rose pink would.
 *
 * Performance is the whole design here. Every petal is two nested elements
 * running pure CSS keyframes on `transform` only — no JavaScript, no scroll
 * listener, nothing recalculated per frame. The outer element falls, the inner
 * one sways and turns; combining them on a single element is impossible since
 * one element can only run one `transform` timeline.
 *
 * This layer replaces the old gold-mote foreground plane rather than adding to
 * it, so the number of continuously animating elements does not grow.
 */

/** mulberry32 — deterministic, so server and client markup match exactly. */
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

const MOBILE_COUNT = 14;
const TOTAL = 30;

const random = rng(90210);
const PETALS = Array.from({ length: TOTAL }).map((_, i) => ({
  id: i,
  left: random() * 100,
  // Whole blossoms mostly, loose petals mixed in — as in a real flower shower.
  blossom: random() > 0.32,
  fallDuration: random() * 12 + 14, // 14–26s: slow enough to read as drifting
  swayDuration: random() * 2.5 + 2.5,
  delay: random() * -26, // negative, so the sky is already full on first paint
  opacity: random() * 0.3 + 0.4,
  sizeSeed: random(),
  gold: random() > 0.72, // a few catch the gold light
  desktopOnly: i >= MOBILE_COUNT,
}));

export default function FallingPetals() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {PETALS.map((petal) => {
        // Blossoms need more room than a single petal to read as a flower.
        const size = petal.blossom
          ? petal.sizeSeed * 10 + 20 // 20–30px
          : petal.sizeSeed * 8 + 14; // 14–22px
        const fill = petal.gold ? '#E8CE72' : '#F7EFD9';

        return (
        <span
          key={petal.id}
          className={`petal-fall absolute top-0 ${petal.desktopOnly ? 'hidden md:block' : ''}`}
          style={{
            left: `${petal.left}%`,
            animationDuration: `${petal.fallDuration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          <span
            className="petal-sway block"
            style={{
              animationDuration: `${petal.swayDuration}s`,
              animationDelay: `${petal.delay}s`,
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              style={{ opacity: petal.opacity }}
            >
              {/* The outline is what lets these read against the ivory
                  invitation as well as the navy — a pale fill alone disappears
                  on paper. A stroke rather than a CSS drop-shadow, which would
                  put a filter on an element that animates every frame. */}
              {petal.blossom ? (
                <>
                  {/* Jasminum sambac: six rounded petals, overlapping in a
                      pinwheel around a small centre. */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={i} transform={`rotate(${i * 60} 12 12)`}>
                      <ellipse
                        cx="12"
                        cy="5.4"
                        rx="3.1"
                        ry="5.2"
                        transform="rotate(18 12 5.4)"
                        fill={fill}
                        stroke="#AA7C11"
                        strokeOpacity="0.5"
                        strokeWidth="0.7"
                      />
                    </g>
                  ))}
                  <circle
                    cx="12"
                    cy="12"
                    r="1.9"
                    fill={petal.gold ? '#D4AF37' : '#E8CE72'}
                    stroke="#AA7C11"
                    strokeOpacity="0.45"
                    strokeWidth="0.6"
                  />
                </>
              ) : (
                <>
                  {/* A loose petal, shed from a blossom */}
                  <path
                    d="M12 1.8c3.4 3.2 5.3 6.6 5.3 10 0 4-2.4 6.9-5.3 8.4-2.9-1.5-5.3-4.4-5.3-8.4 0-3.4 1.9-6.8 5.3-10Z"
                    fill={fill}
                    stroke="#AA7C11"
                    strokeOpacity="0.5"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M12 3.4v15.6"
                    stroke="#AA7C11"
                    strokeOpacity="0.4"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </span>
        </span>
        );
      })}
    </div>
  );
}
