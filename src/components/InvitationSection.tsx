'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import InvitationCard from './InvitationCard';
import Reveal from './Reveal';
import { useWeddingConfig } from './WeddingProvider';

/**
 * The typeset invitation on an ivory sheet, with the scanned original a tap
 * away. This carries the paper language the book used to provide.
 */
export default function InvitationSection() {
  const [isZoomed, setIsZoomed] = useState(false);
  const weddingConfig = useWeddingConfig();

  return (
    <>
      <Reveal className="w-full flex justify-center">
        {/* The sheet the invitation is printed on */}
        <div className="relative w-full max-w-[420px] paper-surface rounded-xl shadow-[0_24px_60px_-18px_rgba(0,0,0,0.75)] border border-gold/30 p-4 sm:p-5">
          <div className="absolute inset-2 border border-gold/20 rounded-lg pointer-events-none" />
          <div className="relative aspect-[10/16]">
            <InvitationCard onZoom={() => setIsZoomed(true)} />
          </div>
          <p
            onClick={() => setIsZoomed(true)}
            className="relative text-center font-sans text-[11px] tracking-[0.15em] uppercase text-navy-medium/80 font-medium mt-3 flex items-center justify-center gap-1.5 cursor-pointer hover:text-gold-dark transition-colors"
          >
            <span>🔍</span> Tap to view original invitation &amp; guest list
          </p>
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
              className="relative w-full max-w-2xl max-h-[88vh] aspect-[1037/1517] rounded-xl overflow-hidden border-2 border-gold bg-[#FAF7F0] shadow-[0_0_50px_rgba(212,175,55,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={weddingConfig.invitationCard.scannedImage.src}
                alt={weddingConfig.invitationCard.scannedImage.alt}
                fill
                className="object-contain p-1"
                sizes="(max-width: 640px) 100vw, 768px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
