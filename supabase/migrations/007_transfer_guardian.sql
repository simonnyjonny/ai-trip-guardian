alter table public.risk_reports
add column if not exists transfer_plans jsonb not null default '[]'::jsonb;

create table if not exists public.trip_transfer_snapshots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  scenario text not null,
  provider text not null,
  origin text not null,
  destination text not null,
  route_options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trip_transfer_snapshots_trip_id_idx
on public.trip_transfer_snapshots(trip_id);

alter table public.trip_transfer_snapshots enable row level security;
