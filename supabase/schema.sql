-- Wedding site schema — run once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- After running, both tables appear in Table Editor, where they can be
-- sorted, filtered and exported to CSV without touching SQL.

create table if not exists rsvps (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  attendance   text        not null check (attendance in ('yes', 'no')),
  guests_count integer     not null default 1 check (guests_count >= 0),
  dietary      text        not null default '',
  message      text        not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists wishes (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  message    text        not null,
  created_at timestamptz not null default now()
);

-- Salted hash of the submitter's IP, used only to rate limit the public
-- guestbook. The raw IP is never stored.
alter table wishes add column if not exists ip_hash text;

-- Both lists are always read newest-first.
create index if not exists rsvps_created_at_idx  on rsvps  (created_at desc);
create index if not exists wishes_created_at_idx on wishes (created_at desc);

-- Supports the rate-limit lookup: "how many wishes from this hash recently?"
create index if not exists wishes_ip_hash_idx on wishes (ip_hash, created_at desc);

-- Row Level Security is enabled with NO policies, which denies all access
-- through the public anon key. The site reaches these tables only from its
-- own API routes using the service role key, which bypasses RLS by design.
-- This is what stops a visitor from reading every guest's details straight
-- from the browser.
alter table rsvps  enable row level security;
alter table wishes enable row level security;
