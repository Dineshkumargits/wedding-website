# Sanjay & Fathima Rani — Wedding Invitation

Next.js 16 app for the wedding of J. Joseph Sanjay & B. Fathima Rani,
13 September 2026 at St. Fathima Shrine, Krishnagiri.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Project **API** URL, e.g. `https://<ref>.supabase.co`. Not the dashboard address. |
| `SUPABASE_SECRET_KEY` | yes | The `sb_secret_...` key. Bypasses RLS — server-only, never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin for share-preview image URLs. Defaults to Vercel's production URL. |
| `RATE_LIMIT_SALT` | no | Salt for the hashed-IP guestbook rate limit. Falls back to the secret key. |

`.env.local` is gitignored. `.env.example` is committed, so keep placeholders
only in it.

## Database

Supabase Postgres. Run [`supabase/schema.sql`](supabase/schema.sql) in the
Supabase SQL Editor — it is idempotent, so re-running it is safe and is how you
apply later additions (such as the `wishes.ip_hash` column used for rate
limiting).

RLS is enabled with no policies, so the public anon key can read nothing. The
app reaches the tables only from its own route handlers using the secret key.

To read RSVPs, use the Supabase dashboard → **Table Editor** → `rsvps`, which
supports sorting, filtering and CSV export.

## Deploying to Vercel

1. Push the repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
   The framework preset is detected automatically — no build settings to change.
2. Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` under
   **Project Settings → Environment Variables** (Production *and* Preview).
3. Deploy, then check:
   - the book cover opens and pages turn on scroll
   - an RSVP submits and appears in the `rsvps` table
   - a blessing submits and appears on the wall
   - the QR modal opens on the venue section
   - pasting the URL into WhatsApp shows the gold share card

Note: the API routes use `node:crypto` and therefore need the **Node.js
runtime**, which is the default. Do not add `export const runtime = 'edge'` to
anything under `src/app/api`.

## Optional: background music

The music player renders only when a track exists at
`public/wedding-song.mp3`. Add one to enable it — and make sure the recording
is licensed for this use, since the site is public.

## Content that still needs the couple's input

The first three love-story milestones in
[`src/components/book/BookPages.tsx`](src/components/book/BookPages.tsx) are
deliberately non-specific placeholders. Replace their `date` and `description`
values with the real story before launch.
