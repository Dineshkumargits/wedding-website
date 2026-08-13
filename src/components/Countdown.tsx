'use client';

import React, { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** `paper` is the variant used on the ivory book pages; `dark` is the navy site. */
type CountdownVariant = 'dark' | 'paper';

export default function Countdown({ variant = 'dark' }: { variant?: CountdownVariant }) {
  const targetDate = new Date('2026-09-13T10:30:00+05:30'); // Indian Standard Time (IST)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference <= 0) {
        setIsCompleted(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const isPaper = variant === 'paper';

  if (!timeLeft) {
    return (
      <div className="flex justify-center items-center h-24">
        <span
          className={`font-serif text-lg animate-pulse ${isPaper ? 'text-gold-dark' : 'text-gold'}`}
        >
          Initializing Countdown...
        </span>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center">
      {isCompleted ? (
        <div
          className={`text-center py-6 px-8 rounded-2xl max-w-md animate-bounce ${
            isPaper
              ? 'bg-gold-light/25 border border-gold/40'
              : 'glass-card border border-gold/40'
          }`}
        >
          <h3
            className={`font-serif text-2xl mb-2 ${isPaper ? 'text-gold-dark' : 'text-gold-light'}`}
          >
            The Celebration Has Begun!
          </h3>
          <p className={`text-sm ${isPaper ? 'text-ink-soft' : 'text-ivory'}`}>
            Join us in celebrating this beautiful bond of love.
          </p>
        </div>
      ) : (
        <div className={`flex justify-center items-center ${isPaper ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-6'}`}>
          {timeBlocks.map((block) => (
            <div
              key={block.label}
              className={
                isPaper
                  ? 'flex flex-col items-center justify-center w-16 h-18 sm:w-[72px] sm:h-20 rounded-lg bg-paper-deep/70 border border-gold/30 relative shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_2px_6px_rgba(26,39,64,0.12)] px-1'
                  : 'flex flex-col items-center justify-center w-16 h-20 sm:w-24 sm:h-28 rounded-2xl glass-card border border-gold/20 relative group hover:border-gold/50 transition-colors duration-300 shadow-xl'
              }
            >
              {/* Gold light glow at the top edge */}
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold-gradient rounded-full ${
                  isPaper ? 'w-6 opacity-80' : 'w-10 opacity-60 group-hover:opacity-100 transition-opacity'
                }`}
              />

              <span
                className={`font-serif font-semibold tracking-tight ${
                  isPaper
                    ? 'text-base sm:text-xl text-gold-foil'
                    : 'text-xl sm:text-3xl text-gold-gradient'
                }`}
              >
                {String(block.value).padStart(2, '0')}
              </span>
              <span
                className={`uppercase mt-0.5 font-sans ${
                  isPaper
                    ? 'text-[9px] sm:text-[10px] tracking-wide text-ink-soft'
                    : 'text-[10px] sm:text-xs tracking-widest text-gold-light/60 mt-1'
                }`}
              >
                {block.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
