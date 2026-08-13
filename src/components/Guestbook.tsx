'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquarePlus, PenTool, Loader2, Send } from 'lucide-react';
import { Wish } from '@/lib/db';

export default function Guestbook() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch all wishes on mount
  useEffect(() => {
    async function fetchWishes() {
      try {
        const res = await fetch('/api/wishes');
        const data = await res.json();
        if (data.success) {
          setWishes(data.wishes);
        }
      } catch (err) {
        console.error('Error fetching wishes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please fill in both name and message.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setWishes((prev) => [data.wish, ...prev]);
        setName('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit your blessing.');
      }
    } catch (err) {
      console.error('Error submitting wish:', err);
      setError('A network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Submit Wish Form */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="glass-card p-6 rounded-2xl border border-gold/15 relative shadow-lg">
            <h4 className="font-serif text-lg sm:text-xl text-gold-light font-bold mb-2 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-gold" /> Leave a Blessing
            </h4>
            <p className="text-xs text-ivory/60 mb-6 font-sans">
              Share your love, congratulations, or special prayers for Sanjay & Fathima Rani.
            </p>

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="wish-name" className="text-xs font-serif uppercase tracking-wider text-gold-light/70 font-semibold">
                  Your Name
                </label>
                <input
                  id="wish-name"
                  type="text"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah & Michael"
                  className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="wish-msg" className="text-xs font-serif uppercase tracking-wider text-gold-light/70 font-semibold">
                  Your Blessing
                </label>
                <textarea
                  id="wish-msg"
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a sweet message..."
                  rows={4}
                  className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-2.5 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 resize-none font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold-gradient text-navy-dark font-serif font-bold py-2.5 rounded-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Blessing
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Masonry Wish Board */}
        <div className="lg:col-span-8">
          <div className="glass-card p-6 rounded-2xl border border-gold/15 min-h-[300px] flex flex-col shadow-lg">
            <h4 className="font-serif text-lg sm:text-xl text-gold-light font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold animate-pulse" /> The Blessings Wall
            </h4>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
                <span className="text-xs text-gold-light font-serif">Unrolling scroll...</span>
              </div>
            ) : wishes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-gold/10 rounded-xl">
                <MessageSquarePlus className="w-12 h-12 text-gold/20 mb-3" />
                <p className="text-sm text-gold-light font-serif">No messages on the wall yet</p>
                <p className="text-xs text-ivory/50 mt-1 font-sans">Be the first to leave a beautiful wish!</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                <AnimatePresence>
                  {wishes.map((w, idx) => (
                    <motion.div
                      key={w.id}
                      initial={{ scale: 0.9, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                      className="break-inside-avoid glass-card p-4 rounded-xl border border-gold/10 flex flex-col justify-between hover:border-gold/30 transition-colors shadow-md relative bg-gradient-to-br from-navy-deep/60 to-navy-dark/40"
                    >
                      {/* Heart flourish ornament */}
                      <Heart className="w-3 h-3 text-gold/20 absolute top-3 right-3" />

                      <p className="text-sm text-ivory/80 font-serif italic leading-relaxed pr-4 mb-3 font-medium">
                        &ldquo;{w.message}&rdquo;
                      </p>

                      <div className="flex items-center justify-between border-t border-gold/5 pt-2.5 text-[10px] sm:text-xs">
                        <span className="font-serif font-bold text-gold-light tracking-wide">
                          — {w.name}
                        </span>
                        <span className="text-ivory/40 font-sans">
                          {formatDate(w.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
