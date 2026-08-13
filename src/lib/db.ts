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

export async function saveWish(wish: Omit<Wish, 'id' | 'createdAt'>): Promise<Wish> {
  const { data, error } = await getClient()
    .from('wishes')
    .insert({ name: wish.name, message: wish.message })
    .select()
    .single();

  if (error) throw new Error(`Failed to save wish: ${error.message}`);
  return toWish(data as WishRow);
}
