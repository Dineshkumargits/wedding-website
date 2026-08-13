import { createHash } from 'node:crypto';

/**
 * Server-side input limits. The client sets matching `maxLength` attributes for
 * a better typing experience, but those are only a hint — anything can POST to
 * these endpoints directly, so these values are the real boundary.
 */
export const LIMITS = {
  name: 60,
  wishMessage: 500,
  rsvpMessage: 500,
  dietary: 200,
  maxGuests: 20,
} as const;

/** Wishes allowed from one submitter inside {@link RATE_LIMIT_WINDOW_MS}. */
export const RATE_LIMIT_MAX = 3;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Collapses runs of whitespace and trims. Stops a wall of blank lines being
 * used to push other guests' blessings off the screen.
 */
export function normalise(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

/** Returns an error message, or null when the field is acceptable. */
export function checkText(
  value: string,
  field: string,
  max: number,
  required = true,
): string | null {
  if (required && value.length === 0) return `${field} is required.`;
  if (value.length > max) return `${field} must be ${max} characters or fewer.`;
  return null;
}

/**
 * Identifies a submitter for rate limiting without storing their IP address.
 *
 * The salt means the stored digest cannot be checked against a guessed IP, so
 * the table holds no personal data even if it leaks.
 */
export function hashIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  if (!ip) return null;

  const salt =
    process.env.RATE_LIMIT_SALT ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    '';

  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}
