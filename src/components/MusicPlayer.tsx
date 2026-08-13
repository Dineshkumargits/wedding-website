'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

/** Drop an audio file at this path in `public/` to enable the music player. */
const TRACK_SRC = '/wedding-song.mp3';

type TrackStatus = 'loading' | 'ready' | 'unavailable';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [status, setStatus] = useState<TrackStatus>('loading');
  /** Set when something asks to play before the source has resolved. */
  const wantsPlayRef = useRef(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
    audioRef.current = audio;

    // A src that 404s or cannot be decoded surfaces here rather than as an
    // unhandled rejection from play().
    const handleError = () => {
      setStatus('unavailable');
      setIsPlaying(false);
    };
    audio.addEventListener('error', handleError);

    let cancelled = false;

    // Confirm the track exists before assigning it. Assigning a missing src
    // makes every later play() reject with NotSupportedError.
    fetch(TRACK_SRC, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        const contentType = res.headers.get('content-type') ?? '';
        const isAudio =
          res.ok &&
          (contentType.includes('audio') || contentType.includes('application/octet-stream'));

        if (!isAudio) {
          setStatus('unavailable');
          return;
        }

        audio.src = TRACK_SRC;
        setStatus('ready');

        // Honour a play request that arrived while the check was in flight.
        if (wantsPlayRef.current) {
          wantsPlayRef.current = false;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setHasInteracted(true);
            })
            .catch(() => {
              /* Autoplay policy, not a broken file — leave it paused. */
            });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });

    return () => {
      cancelled = true;
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Play automatically on first user click/scroll anywhere on the page
  useEffect(() => {
    if (status === 'unavailable') return;

    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        if (status === 'loading') {
          // Source not resolved yet — remember the intent and play once it is.
          wantsPlayRef.current = true;
          return;
        }
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            console.log('Autoplay blocked by browser:', err);
          });
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('scroll', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasInteracted, status]);

  // Listen for the custom trigger fired when the book cover is opened
  useEffect(() => {
    if (status === 'unavailable') return;

    const handleTriggerPlay = () => {
      if (!audioRef.current || isPlaying) return;

      if (status === 'loading') {
        wantsPlayRef.current = true;
        return;
      }

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          /* Autoplay policy — the reader can still press the button. */
        });
    };

    window.addEventListener('play-wedding-music', handleTriggerPlay);

    return () => {
      window.removeEventListener('play-wedding-music', handleTriggerPlay);
    };
  }, [isPlaying, status]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering other clicks
    if (!audioRef.current || status !== 'ready') return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          // A rejection here is the browser's autoplay policy, not a broken
          // file — a decode failure arrives on the audio 'error' event.
          setIsPlaying(false);
        });
    }
  };

  // With no track present there is nothing to control, and a dead button reads
  // worse than no button.
  if (status !== 'ready') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Visual tooltip */}
      <span className="hidden sm:inline-block glass-card border border-gold/30 px-3 py-1.5 rounded-full text-xs text-gold font-serif animate-pulse">
        {isPlaying ? 'Now Playing 🎵' : 'Play Background Music 🎵'}
      </span>

      <div className="relative flex items-center justify-center">
        {/* Pulsating Visualizer Rings (Ripples) behind the button */}
        {isPlaying && (
          <>
            <span className="absolute w-12 h-12 rounded-full bg-gold/35 animate-visualizer-pulse pointer-events-none" style={{ animationDelay: '0s' }} />
            <span className="absolute w-12 h-12 rounded-full bg-gold/20 animate-visualizer-pulse pointer-events-none" style={{ animationDelay: '0.6s' }} />
            <span className="absolute w-12 h-12 rounded-full bg-gold/10 animate-visualizer-pulse pointer-events-none" style={{ animationDelay: '1.2s' }} />
          </>
        )}

        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gold-gradient text-navy-dark flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-300 relative border border-gold-light focus:outline-none z-10"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Spinning background vinyl lines */}
              <span className="absolute inset-1.5 rounded-full border border-navy-dark/10 animate-spin" style={{ animationDuration: '4s' }} />
              <Volume2 className="w-5 h-5 relative z-10 animate-bounce" />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <VolumeX className="w-5 h-5" />
            </div>
          )}

          {/* Floating musical note elements when playing */}
          {isPlaying && (
            <>
              <Music className="w-3.5 h-3.5 text-gold absolute -top-2 -left-1 animate-ping" style={{ animationDuration: '2s' }} />
              <Music className="w-3 h-3 text-gold absolute -top-1 -right-2 animate-ping" style={{ animationDuration: '3s' }} />
            </>
          )}
        </button>
      </div>

      <style jsx global>{`
        @keyframes visualizer-pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
