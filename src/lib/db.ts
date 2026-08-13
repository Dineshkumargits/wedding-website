import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side data access for RSVPs and guestbook wishes.
 *
 * These functions are called only from route handlers under `src/app/api`.
 * They use the service role key, which bypasses Row Level Security, so this
 * module must never be imported into a Client Component.
 */

export interface RSVP {
  id: string;
  name: string;
  attendance: 'yes' | 'no';
  guestsCount: number;
  dietary?: string;
  message?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

/** Shape of the `rsvps` table, which uses snake_case column names. */
interface RSVPRow {
  id: string;
  name: string;
  attendance: 'yes' | 'no';
  guests_count: number;
  dietary: string | null;
  message: string | null;
  created_at: string;
}

interface WishRow {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

let client: SupabaseClient | null = null;

/**
 * Created lazily rather than at module scope so that importing this file
 * during a build (where the env vars may be absent) does not throw.
 */
function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  // `sb_secret_...` is the current key type. The legacy service_role key still
  // works but Supabase deprecates it at the end of 2026, so it is only a
  // fallback here.
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY ' +
        '(see .env.example).',
    );
  }

  // Easy mistake: pasting the dashboard address from the browser bar. Requests
  // then hit the dashboard app and return an HTML page, which surfaces as an
  // unreadable parse error deep in the client. Catch it here instead.
  if (url.includes('supabase.com/dashboard')) {
    const ref = url.match(/project\/([a-z0-9]+)/i)?.[1];
    throw new Error(
      'SUPABASE_URL is set to the Supabase dashboard address, not the project ' +
        'API URL. Use ' +
        (ref ? `https://${ref}.supabase.co` : 'https://<project-ref>.supabase.co') +
        ' instead.',
    );
  }

  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function toRSVP(row: RSVPRow): RSVP {
  return {
    id: row.id,
    name: row.name,
    attendance: row.attendance,
    guestsCount: row.guests_count,
    dietary: row.dietary ?? '',
    message: row.message ?? '',
    createdAt: row.created_at,
  };
}

function toWish(row: WishRow): Wish {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function getRSVPs(): Promise<RSVP[]> {
  const { data, error } = await getClient()
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to read RSVPs: ${error.message}`);
  return (data as RSVPRow[]).map(toRSVP);
}

export async function saveRSVP(rsvp: Omit<RSVP, 'id' | 'createdAt'>): Promise<RSVP> {
  // A single INSERT, so simultaneous submissions cannot overwrite each other
  // the way the previous read-modify-write of a JSON file could.
  const { data, error } = await getClient()
    .from('rsvps')
    .insert({
      name: rsvp.name,
      attendance: rsvp.attendance,
      guests_count: rsvp.guestsCount,
      dietary: rsvp.dietary ?? '',
      message: rsvp.message ?? '',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save RSVP: ${error.message}`);
  return toRSVP(data as RSVPRow);
}

export async function getWishes(): Promise<Wish[]> {
  const { data, error } = await getClient()
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to read wishes: ${error.message}`);
  return (data as WishRow[]).map(toWish);
}

/**
 * Set once we learn the `ip_hash` column is absent, so a database that has not
 * had the rate-limit migration applied still accepts blessings — it just does
 * not rate limit them. Losing guests' messages is a worse outcome than losing
 * the limiter.
 */
let ipHashColumnMissing = false;

/** PostgREST's code for "column not found in schema cache". */
const UNKNOWN_COLUMN = 'PGRST204';

export async function saveWish(
  wish: Omit<Wish, 'id' | 'createdAt'>,
  ipHash?: string,
): Promise<Wish> {
  const base = { name: wish.name, message: wish.message };

  if (!ipHashColumnMissing) {
    const { data, error } = await getClient()
      .from('wishes')
      .insert({ ...base, ip_hash: ipHash ?? null })
      .select()
      .single();

    if (!error) return toWish(data as WishRow);

    if (error.code !== UNKNOWN_COLUMN) {
      throw new Error(`Failed to save wish: ${error.message}`);
    }

    console.warn(
      'wishes.ip_hash is missing — guestbook rate limiting is disabled. ' +
        'Run supabase/schema.sql to enable it.',
    );
    ipHashColumnMissing = true;
  }

  const { data, error } = await getClient().from('wishes').insert(base).select().single();

  if (error) throw new Error(`Failed to save wish: ${error.message}`);
  return toWish(data as WishRow);
}

/**
 * How many wishes this submitter has posted since `since`.
 *
 * Counted in the database rather than in memory because serverless instances
 * are not shared — an in-process counter would reset on every cold start and
 * be trivially bypassed.
 */
export async function countRecentWishes(ipHash: string, since: Date): Promise<number> {
  if (ipHashColumnMissing) return 0;

  const { count, error } = await getClient()
    .from('wishes')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since.toISOString());

  if (error) {
    // Fail open. The limiter is a guard, not the feature — if the check itself
    // is broken the guest should still be able to leave their blessing.
    console.warn(`Rate-limit check unavailable, allowing the wish: ${error.message}`);
    return 0;
  }

  return count ?? 0;
}
