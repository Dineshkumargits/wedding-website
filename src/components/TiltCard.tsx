'use client';

import React, { useCallback, useEffect, useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees (default: 12)
}

/**
 * Pointer-following 3D tilt.
 *
 * The transform is written straight to the DOM inside a rAF rather than held
 * in React state. Two reasons, both of which broke interactive children:
 *
 *  1. setState on every mousemove re-rendered the whole subtree (an entire
 *     form, in the RSVP case) dozens of times a second.
 *  2. With a CSS transition running, the card was still easing while the
 *     pointer was over it. If the content shifted between mousedown and
 *     mouseup the browser dispatched `click` on the nearest common ancestor
 *     instead of the button under the cursor, so clicks were silently lost.
 *
 * Now the card only transitions when resetting on leave, and geometry is
 * stable while the pointer is down.
 */
export default function TiltCard({ children, className = '', maxTilt = 12 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);

  const cancelFrame = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);

  useEffect(() => cancelFrame, [cancelFrame]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const { clientX, clientY } = e;

    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;

      const node = cardRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Normalised to -0.5 .. 0.5
      const normX = x / rect.width - 0.5;
      const normY = y / rect.height - 0.5;

      const rotX = normY * maxTilt;
      const rotY = -normX * maxTilt;

      // No transition while tracking: the card must sit exactly where the
      // pointer expects it, or clicks land on the wrong element.
      node.style.transition = 'none';
      node.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      const glare = glareRef.current;
      if (glare) {
        glare.style.opacity = '1';
        glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${
          (y / rect.height) * 100
        }%, rgba(255, 246, 214, 0.22) 0%, transparent 55%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    cancelFrame();

    const node = cardRef.current;
    if (node) {
      node.style.transition = 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)';
      node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }

    const glare = glareRef.current;
    if (glare) glare.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none ${className}`}
      style={{
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Glare layer */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none rounded-2xl z-10 transition-opacity duration-300"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle at 0% 0%, rgba(255, 246, 214, 0.15) 0%, transparent 60%)',
          mixBlendMode: 'overlay',
        }}
      />

      {children}
    </div>
  );
}
