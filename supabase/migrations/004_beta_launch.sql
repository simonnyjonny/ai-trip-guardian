-- Sprint 3: Beta Launch Readiness

-- Product events
create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete set null,
  event_name text not null,
  event_properties jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists product_events_trip_id_idx on public.product_events(trip_id);
create index if not exists product_events_event_name_idx on public.product_events(event_name);
create index if not exists product_events_created_at_idx on public.product_events(created_at);
alter table public.product_events enable row level security;

-- Beta feedback
create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  rating text not null check (rating in ('very_useful', 'somewhat_useful', 'not_accurate', 'not_trustworthy')),
  comment text,
  email text,
  created_at timestamptz not null default now()
);
create index if not exists beta_feedback_trip_id_idx on public.beta_feedback(trip_id);
alter table public.beta_feedback enable row level security;

-- Waitlist
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  travel_interest text,
  created_at timestamptz not null default now()
);
create index if not exists waitlist_signups_email_idx on public.waitlist_signups(email);
alter table public.waitlist_signups enable row level security;
