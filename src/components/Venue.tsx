'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Calendar, Clock, Map, Compass, QrCode, X } from 'lucide-react';
import TiltCard from '@/components/TiltCard';
import { useWeddingConfig } from './WeddingProvider';

export default function Venue() {
  const [showQRModal, setShowQRModal] = useState(false);
  const weddingConfig = useWeddingConfig();

  const eventList = React.useMemo(() => {
    if (Array.isArray(weddingConfig.events)) {
      return weddingConfig.events;
    }
    const eventsObj = weddingConfig.events || {};
    if (Array.isArray(eventsObj.list)) {
      return eventsObj.list;
    }
    const list: any[] = [];
    if (eventsObj.ceremony) list.push(eventsObj.ceremony);
    if (eventsObj.reception) list.push(eventsObj.reception);
    Object.keys(eventsObj).forEach((k) => {
      if (k !== 'ceremony' && k !== 'reception' && k !== 'list') {
        const val = eventsObj[k];
        if (val && typeof val === 'object' && val.title && val.date) {
          list.push(val);
        }
      }
    });
    return list.filter(Boolean);
  }, [weddingConfig.events]);

  const { location, sections } = weddingConfig;
  const googleMapsUrl = location.googleMapsUrl;
  const mapEmbedSrc = location.mapEmbedSrc;

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Left column: Event cards */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {eventList.map((event, index) => {
            const isReception =
              event.tag?.toLowerCase().includes('reception') ||
              event.title?.toLowerCase().includes('reception') ||
              event.title?.includes('விருந்து');
            const Icon = isReception ? Map : Compass;

            return (
              <TiltCard key={event.title || index} maxTilt={8} className="flex-1 flex flex-col">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-2xl border border-gold/15 relative overflow-hidden flex-1 flex flex-col justify-between group h-full w-full"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-full flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                    <Icon className="w-8 h-8 text-gold/40 group-hover:text-gold/70 transition-colors" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gold-gradient text-navy-dark text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                        {event.tag}
                      </span>
                    </div>
                    <h4 className="font-serif text-xl sm:text-2xl text-gold-light font-bold mb-3">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-ivory/80 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-gold/10 pt-4 mt-4 text-xs sm:text-sm text-ivory/70 font-sans">
                    {event.date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gold shrink-0" />
                        <span>{event.date}</span>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gold shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {(event.venueName || event.venueLocation) && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gold shrink-0" />
                        <span>
                          {[event.venueName, event.venueLocation].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>

        {/* Right column: Map and QR code */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Map Preview */}
          <div className="glass-card p-4 rounded-2xl border border-gold/15 overflow-hidden h-[240px] sm:h-[280px] relative group shadow-lg">
            <iframe
              src={mapEmbedSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-500"
            />
            <div className="absolute bottom-6 right-6">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-dark border border-gold/40 text-gold-light hover:bg-gold-gradient hover:text-navy-dark px-4 py-2 rounded-full text-xs font-serif uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-all duration-300"
              >
                <MapPin className="w-3.5 h-3.5" /> {sections.venue.navigateButton}
              </a>
            </div>
          </div>

          {/* QR Code trigger */}
          <TiltCard maxTilt={10}>
            <div
              onClick={() => setShowQRModal(true)}
              className="glass-card p-5 rounded-2xl border border-gold/15 flex items-center justify-between gap-4 cursor-pointer hover:border-gold/50 transition-colors group shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gold-gradient/10 border border-gold/30 rounded-xl flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <h5 className="font-serif text-sm sm:text-base text-gold-light font-bold">
                    {sections.venue.qrCardTitle}
                  </h5>
                  <p className="text-xs text-ivory/60 mt-0.5 font-sans">
                    {sections.venue.qrCardSubtitle}
                  </p>
                </div>
              </div>
              <span className="text-xs font-serif uppercase text-gold/60 group-hover:text-gold transition-colors tracking-widest hidden sm:inline">
                {sections.venue.qrCardBadge}
              </span>
            </div>
          </TiltCard>
        </div>

      </div>

      {/* QR CODE POPUP MODAL */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-dark/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-navy-deep border border-gold rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(212,175,55,0.25)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-3 right-3 text-gold/70 hover:text-gold transition-colors focus:outline-none"
                onClick={() => setShowQRModal(false)}
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-serif text-xl text-gold-light font-bold mb-2">
                {sections.venue.qrModalTitle}
              </h4>
              <p className="text-xs text-ivory/70 mb-6 font-sans">
                {sections.venue.qrModalSubtitle}
              </p>

              {/* QR Image Frame */}
              <div className="relative w-48 h-48 mx-auto bg-white p-3 rounded-xl shadow-inner border border-gold-light/40 flex items-center justify-center">
                <Image
                  src={location.qrImage.src}
                  alt={location.qrImage.alt}
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <p className="text-[11px] text-gold/60 uppercase tracking-widest font-serif">
                  {location.addressTitle}
                </p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-gradient text-navy-dark py-2.5 rounded-full text-xs font-serif uppercase tracking-widest font-bold shadow-lg hover:scale-105 active:scale-95 transition-all mt-2"
                >
                  {sections.venue.qrModalButton}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
