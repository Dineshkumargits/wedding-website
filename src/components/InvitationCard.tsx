'use client';

import React from 'react';
import { ZoomIn } from 'lucide-react';

/**
 * The invitation itself, typeset in HTML so it stays crisp and readable at any
 * size. Rendered on a book page; tapping it opens the scanned original.
 */
export default function InvitationCard({ onZoom }: { onZoom?: () => void }) {
  return (
    <div
      onClick={onZoom}
      role={onZoom ? 'button' : undefined}
      tabIndex={onZoom ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onZoom) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onZoom();
        }
      }}
      className={`relative w-full h-full bg-[#FCFBF7] rounded-lg border-2 border-double border-gold/60 p-1.5 sm:p-2 shadow-[0_10px_30px_rgba(26,39,64,0.18)] flex flex-col ${
        onZoom ? 'cursor-zoom-in hover:-translate-y-1 transition-transform duration-300' : ''
      }`}
    >
      <div className="flex-1 border border-gold/30 rounded-md p-2 sm:p-3 flex flex-col justify-between items-center text-center relative overflow-hidden bg-[#FAF7F0] shadow-inner">
        {onZoom && (
          <div className="absolute top-1.5 right-1.5 text-gold/60 z-10">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}

        {/* Corner ornaments */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t border-l border-gold/40" />
        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t border-r border-gold/40" />
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b border-l border-gold/40" />
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b border-r border-gold/40" />

        <div className="relative w-full flex-1 flex flex-col justify-between py-1">
          {/* Header scripture */}
          <div className="text-[10px] sm:text-[12px] text-navy-medium font-serif italic border-b border-gold/20 pb-1 mx-3">
            &ldquo;This Thing Proceedeth from the Lord&rdquo;
            <span className="block text-[9px] sm:text-[10px] font-sans not-italic text-gold-dark">
              (Gen 24:50)
            </span>
          </div>

          <h4 className="font-serif text-[12px] sm:text-sm tracking-[0.2em] text-gold-dark uppercase font-semibold mt-1">
            Wedding Invitation
          </h4>

          {/* Parents */}
          <div className="text-[9px] sm:text-[10px] text-navy-dark/90 font-sans leading-normal my-1">
            <div className="flex justify-between px-1 gap-2">
              <div className="text-left w-1/2">
                <p className="font-semibold text-navy-medium">Mr. A. Joseph Loyola</p>
                <p>&amp; Mrs. A. Joseph Philominal</p>
                <p className="text-[9px] sm:text-[9px] text-navy-dark/75">Krishnagiri</p>
              </div>
              <span className="self-center font-serif text-gold-dark text-[10px]">and</span>
              <div className="text-right w-1/2">
                <p className="font-semibold text-navy-medium">Late Mr. A. Britto Thanishlas</p>
                <p>&amp; Mrs. J. Roobi Shantha</p>
                <p className="text-[9px] sm:text-[9px] text-navy-dark/75">Devakottai</p>
              </div>
            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] text-navy-dark/90 italic font-serif px-3 my-1 leading-relaxed">
            Cordially solicit your gracious presence, prayers &amp; blessings with family and
            friends on this marriage of
          </p>

          {/* Couple */}
          <div className="my-1 py-1 border-y border-gold/20">
            <h5 className="font-serif text-[13px] sm:text-base font-bold text-navy-medium tracking-wide">
              J. Joseph Sanjay,{' '}
              <span className="text-[10px] sm:text-[11px] font-normal">B.A., Viscom.</span>
            </h5>
            <span className="block font-serif text-[10px] sm:text-[11px] text-gold-dark italic my-0.5">
              weds
            </span>
            <h5 className="font-serif text-[13px] sm:text-base font-bold text-navy-medium tracking-wide">
              B. Fathima Rani,{' '}
              <span className="text-[10px] sm:text-[11px] font-normal">B.A., (French) MBA.</span>
            </h5>
          </div>

          {/* Schedule */}
          <div className="text-[9px] sm:text-[10px] text-navy-dark font-serif space-y-0.5 my-1">
            <p className="font-semibold text-gold-dark">On Sunday the 13th September 2026</p>
            <p className="text-[10px] sm:text-[11px]">between 10.30 am Onwards</p>
            <p className="italic">
              at <span className="font-semibold not-italic">St. Fathima Shrine, Krishnagiri</span>
            </p>
          </div>

          {/* Reception */}
          <div className="text-[9px] sm:text-[10px] text-navy-dark font-sans leading-tight bg-gold-light/25 p-1 rounded border border-gold/10">
            <p className="font-serif italic text-navy-medium font-semibold">
              Followed by Reception at
            </p>
            <p className="font-serif font-bold text-navy-medium">
              St. Fathima Shrine Campus, Krishnagiri
            </p>
            <p className="text-[9px] sm:text-[10px] text-gold-dark font-semibold">
              from 12.30 pm Onwards
            </p>
          </div>
        </div>

        <div className="text-[9px] sm:text-[10px] text-navy-dark/90 font-serif border-t border-gold/10 pt-1 w-full flex justify-between px-2">
          <span>With Best Compliments From:</span>
          <span className="font-semibold text-navy-medium">Friends &amp; Relatives</span>
        </div>
      </div>
    </div>
  );
}
