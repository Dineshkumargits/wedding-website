'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import InvitationCard from './InvitationCard';
import Reveal from './Reveal';

/**
 * The typeset invitation on an ivory sheet, with the scanned original a tap
 * away. This carries the paper language the book used to provide.
 */
export default function InvitationSection() {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <Reveal className="w-full flex justify-center">
        {/* The sheet the invitation is printed on */}
        <div className="relative w-full max-w-[420px] paper-surface rounded-xl shadow-[0_24px_60px_-18px_rgba(0,0,0,0.75)] border border-gold/30 p-4 sm:p-5">
          <div className="absolute inset-2 border border-gold/20 rounded-lg pointer-events-none" />
          <div className="relative aspect-[10/16]">
            <InvitationCard onZoom={() => setIsZoomed(true)} />
          </div>
          {/* <p className="relative text-center font-sans text-[10px] tracking-[0.2em] uppercase text-ink-soft/80 mt-3">
            Tap the card to view the original
          </p> */}
        </div>
      </Reveal>

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
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
