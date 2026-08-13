'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    name: '',
    attendance: 'yes',
    guestsCount: '1',
    dietary: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendanceChange = (att: 'yes' | 'no') => {
    setFormData((prev) => ({ ...prev, attendance: att }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        // Trigger celebratory confetti blast
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFF6D6', '#AA7C11', '#15325B', '#FDFBF7'],
        });
      } else {
        setErrorMessage(result.error || 'Failed to submit RSVP. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      console.error('RSVP submission error:', err);
      setErrorMessage('A network error occurred. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-2">
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gold/25 relative overflow-hidden shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-navy-medium/30 rounded-full blur-2xl" />

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center py-8 px-4 flex flex-col items-center justify-center min-h-[300px]"
            >
              <CheckCircle2 className="w-16 h-16 text-gold mb-4 animate-bounce" />
              <h4 className="font-serif text-xl sm:text-2xl text-gold-light font-bold mb-2">
                Thank You for Responding!
              </h4>
              <p className="text-sm text-ivory/80 max-w-sm mb-6 leading-relaxed font-sans">
                Your RSVP details have been successfully recorded. {formData.attendance === 'yes' ? "We are thrilled to celebrate with you!" : "We will miss you, but we thank you for your kind wishes."}
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setFormData({ name: '', attendance: 'yes', guestsCount: '1', dietary: '', message: '' });
                }}
                className="text-xs font-serif uppercase tracking-widest text-gold hover:text-gold-light transition-colors border border-gold/30 hover:border-gold/80 px-4 py-2 rounded-full"
              >
                Submit another response
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6 relative z-10"
            >
              <div className="text-center mb-6">
                <h4 className="font-serif text-xl sm:text-2xl text-gold-light font-bold">
                  RSVP Registration
                </h4>
                <p className="text-xs text-ivory/60 mt-1">
                  Please respond by September 1, 2026, so we can finalize arrangements.
                </p>
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rsvp-name" className="text-xs font-serif uppercase tracking-widest text-gold-light/80 font-medium">
                  Your Full Name
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30"
                  required
                />
              </div>

              {/* Attendance */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-serif uppercase tracking-widest text-gold-light/80 font-medium">
                  Will you attend?
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleAttendanceChange('yes')}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                      formData.attendance === 'yes'
                        ? 'bg-gold-gradient text-navy-dark border-gold'
                        : 'bg-navy-dark/40 text-ivory/70 border-gold/15 hover:border-gold/40'
                    }`}
                  >
                    Joyfully Attend
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttendanceChange('no')}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                      formData.attendance === 'no'
                        ? 'bg-gold-gradient text-navy-dark border-gold'
                        : 'bg-navy-dark/40 text-ivory/70 border-gold/15 hover:border-gold/40'
                    }`}
                  >
                    Regretfully Decline
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {formData.attendance === 'yes' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Number of Guests */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="rsvp-guests" className="text-xs font-serif uppercase tracking-widest text-gold-light/80 font-medium">
                          Number of Guests
                        </label>
                        <select
                          id="rsvp-guests"
                          name="guestsCount"
                          value={formData.guestsCount}
                          onChange={handleChange}
                          className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-3 text-sm text-ivory outline-none transition-colors"
                        >
                          {Array.from({ length: 10 }).map((_, i) => (
                            <option key={i + 1} value={i + 1} className="bg-navy-deep text-ivory">
                              {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dietary preferences */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="rsvp-dietary" className="text-xs font-serif uppercase tracking-widest text-gold-light/80 font-medium">
                          Dietary Preferences
                        </label>
                        <select
                          id="rsvp-dietary"
                          name="dietary"
                          value={formData.dietary}
                          onChange={handleChange}
                          className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-3 text-sm text-ivory outline-none transition-colors"
                        >
                          <option value="" className="bg-navy-deep text-ivory">No Preferences</option>
                          <option value="veg" className="bg-navy-deep text-ivory">Vegetarian</option>
                          <option value="non-veg" className="bg-navy-deep text-ivory">Non-Vegetarian</option>
                          <option value="vegan" className="bg-navy-deep text-ivory">Vegan</option>
                          <option value="halal" className="bg-navy-deep text-ivory">Halal</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rsvp-message" className="text-xs font-serif uppercase tracking-widest text-gold-light/80 font-medium">
                  Message to the Couple
                </label>
                <textarea
                  id="rsvp-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Leave a lovely blessing or request..."
                  rows={3}
                  className="w-full bg-navy-dark/60 border border-gold/20 focus:border-gold rounded-xl px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-gold-gradient text-navy-dark font-serif font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed shadow-xl cursor-pointer"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Response...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit RSVP
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
