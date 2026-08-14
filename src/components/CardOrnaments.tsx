import React from 'react';

/**
 * A shrine archway drawn in gold line, sitting behind the couple on the card.
 *
 * It solves a compositional problem: the cutout is tall and narrow, so it left
 * wide empty margins and nothing for the figures to stand in. The arch fills
 * that width, frames them, and echoes both the carved doorway in the couple's
 * portrait and the shrine itself.
 *
 * Pure SVG — no image asset, and it scales cleanly to any cover size.
 */
export function CardArch() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 top-[13%] flex items-end justify-center pointer-events-none"
    >
      <svg
        viewBox="0 0 200 330"
        preserveAspectRatio="xMidYMax meet"
        className="h-full w-auto max-w-[92%]"
      >
        <defs>
          {/* Fades toward the floor so the arch never competes with the type */}
          <linearGradient id="archStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#AA7C11" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#AA7C11" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id="archLight" cx="50%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#FFF6D6" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#F5E6C4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F5E6C4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Daylight through the opening, so the couple read against something */}
        <path d="M38 330 V126 A62 62 0 0 1 162 126 V330 Z" fill="url(#archLight)" />

        {/* Outer and inner arch mouldings */}
        <path
          d="M24 330 V122 A76 76 0 0 1 176 122 V330"
          fill="none"
          stroke="url(#archStroke)"
          strokeWidth="1.7"
        />
        <path
          d="M38 330 V126 A62 62 0 0 1 162 126 V330"
          fill="none"
          stroke="url(#archStroke)"
          strokeWidth="0.9"
        />

        {/* Capitals where the arch springs from the columns */}
        <line x1="18" y1="122" x2="44" y2="122" stroke="url(#archStroke)" strokeWidth="1.4" />
        <line x1="156" y1="122" x2="182" y2="122" stroke="url(#archStroke)" strokeWidth="1.4" />

        {/* Keystone at the apex */}
        <g transform="translate(100 46)">
          <rect
            x="-4.5"
            y="-4.5"
            width="9"
            height="9"
            transform="rotate(45)"
            fill="#C9A227"
            opacity="0.6"
          />
          <line x1="-14" y1="0" x2="-8" y2="0" stroke="#C9A227" strokeWidth="0.9" opacity="0.5" />
          <line x1="8" y1="0" x2="14" y2="0" stroke="#C9A227" strokeWidth="0.9" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

const CORNER_PLACEMENT = {
  tl: 'top-6 left-6',
  tr: 'top-6 right-6 -scale-x-100',
  bl: 'bottom-6 left-6 -scale-y-100',
  br: 'bottom-6 right-6 -scale-x-100 -scale-y-100',
} as const;

/**
 * A small gold flourish for the corners of the card. One drawing, mirrored
 * into each corner, so the four always match.
 */
export function CornerFlourish({ position }: { position: keyof typeof CORNER_PLACEMENT }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 60"
      className={`absolute w-9 h-9 sm:w-11 sm:h-11 pointer-events-none text-gold-dark/45 ${CORNER_PLACEMENT[position]}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      {/* Quarter-round bracket, with an inner echo and a small curl. Two
          curves springing from the same point read as a leaf rather than a
          corner, so the bracket is a single arc with tails along each edge. */}
      <path d="M2 30 C 2 12, 12 2, 30 2" />
      <path d="M9 30 C 9 16, 16 9, 30 9" strokeWidth="0.75" />
      <path d="M30 2 C 40 2, 47 6, 50 13" />
      <path d="M2 30 C 2 40, 6 47, 13 50" />
      <path d="M16 16 C 20 11, 27 11, 29 16 C 30.5 20, 26 23, 23.5 20" strokeWidth="0.8" />
      <circle cx="50" cy="13" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="13" cy="50" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
