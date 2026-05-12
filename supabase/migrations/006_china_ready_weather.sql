-- Sprint 6: China-ready Weather & Packing Guardian

alter table public.trips
add column if not exists trip_region text not null default 'auto';

alter table public.trips
add column if not exists primary_transport text not null default 'unknown';

alter table public.risk_reports
add column if not exists weather_summary jsonb not null default '{}'::jsonb;

alter table public.risk_reports
add column if not exists packing_recommendations jsonb not null default '{}'::jsonb;

create table if not exists public.trip_weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  destination text not null,
  provider text not null,
  forecast_source text not null,
  forecast_reliability text not null,
  forecast jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trip_weather_snapshots_trip_id_idx
on public.trip_weather_snapshots(trip_id);

alter table public.trip_weather_snapshots enable row level security;
