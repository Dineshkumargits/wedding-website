'use client';

import React from 'react';
import { MotionValue, motion, useTransform } from 'framer-motion';

interface BookSheetProps {
  /** Position in the stack, 0 = the sheet nearest the front cover. */
  index: number;
  total: number;
  /** 0..1 progress across the whole book stage. */
  progress: MotionValue<number>;
  /** The [start, end] slice of `progress` during which this sheet turns. */
  range: [number, number];
  front: React.ReactNode;
  back: React.ReactNode;
}

/**
 * One leaf of the book, hinged on its left edge.
 *
 * Scroll drives `rotateY` from 0 to -180deg. Two shading overlays track the
 * angle — the front face darkens as it swings away from the light, the back
 * face brightens as it comes in — which is what stops the turn from reading as
 * a flat rectangle flipping over.
 */
export default function BookSheet({
  index,
  total,
  progress,
  range,
  front,
  back,
}: BookSheetProps) {
  const rotateY = useTransform(progress, range, [0, -180], { clamp: true });

  // Past the halfway point the sheet belongs at the bottom of the left-hand
  // stack; before it, at the top of the right-hand stack.
  // The +10 keeps every sheet above the opened front cover, which the turned
  // pages have to stack on top of.
  const zIndex = useTransform(rotateY, (angle) =>
    angle < -90 ? index + 10 : total - index + 10,
  );

  // Front face: lit at rest, shadowed as it turns edge-on.
  const frontShade = useTransform(rotateY, [0, -90], [0, 0.42], { clamp: true });
  // Back face: shadowed only while it is still edge-on. This clears well
  // before the page lands so the left-hand page is at full contrast for most
  // of the turn instead of reading as a slow fade-in.
  const backShade = useTransform(rotateY, [-90, -122], [0.38, 0], { clamp: true });

  // Only the face actually pointing at the viewer should take clicks.
  const frontEvents = useTransform(rotateY, (angle) => (angle > -90 ? 'auto' : 'none'));
  const backEvents = useTransform(rotateY, (angle) => (angle <= -90 ? 'auto' : 'none'));

  // A soft cast shadow that sweeps across the page beneath the turning sheet.
  const liftShadow = useTransform(
    rotateY,
    [0, -30, -90, -150, -180],
    [0, 0.28, 0.4, 0.28, 0],
    { clamp: true },
  );

  return (
    <motion.div
      style={{ rotateY, zIndex, originX: 0, transformStyle: 'preserve-3d', willChange: 'transform' }}
      className="absolute top-0 right-0 h-full w-full md:w-1/2"
    >
      {/* FRONT FACE — the right-hand page before the turn */}
      <motion.div
        style={{ pointerEvents: frontEvents }}
        className="absolute inset-0 backface-hidden overflow-hidden rounded-r-lg shadow-[2px_2px_10px_rgba(0,0,0,0.28)]"
      >
        {front}
        <motion.div
          style={{ opacity: frontShade }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-l from-navy-dark/85 via-navy-dark/30 to-transparent"
        />
        <motion.div
          style={{ opacity: liftShadow }}
          className="absolute inset-y-0 left-0 w-16 pointer-events-none bg-gradient-to-r from-navy-dark/50 to-transparent"
        />
      </motion.div>

      {/* BACK FACE — becomes the left-hand page once turned */}
      <motion.div
        style={{ transform: 'rotateY(180deg)', pointerEvents: backEvents }}
        className="absolute inset-0 backface-hidden overflow-hidden rounded-l-lg shadow-[-2px_2px_10px_rgba(0,0,0,0.28)]"
      >
        {back}
        <motion.div
          style={{ opacity: backShade }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-navy-dark/85 via-navy-dark/30 to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}
