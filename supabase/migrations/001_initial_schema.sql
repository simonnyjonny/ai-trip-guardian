create extension if not exists "pgcrypto";

do $$ begin
  create type trip_status as enum ('draft', 'analyzing', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type traveler_type as enum ('solo', 'couple', 'friends', 'family', 'with_children', 'with_parents', 'business', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type trip_pace as enum ('relaxed', 'normal', 'packed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type language_level as enum ('strong', 'medium', 'weak');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type itinerary_category as enum ('flight', 'hotel', 'activity', 'restaurant', 'transport', 'shopping', 'rest', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type risk_level as enum ('low', 'medium', 'medium_high', 'high');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type agent_run_status as enum ('pending', 'running', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,

  title text,
  destination text not null,
  start_date date,
  end_date date,

  traveler_type traveler_type not null default 'other',
  pace trip_pace not null default 'normal',
  language_level language_level not null default 'medium',

  special_needs jsonb not null default '[]'::jsonb,
  raw_input text,

  status trip_status not null default 'draft',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_status_idx on public.trips(status);
create index if not exists trips_destination_idx on public.trips(destination);

create table if not exists public.trip_documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  file_url text not null,
  file_name text,
  file_type text,
  file_size_bytes bigint,
  extracted_text text,

  created_at timestamptz not null default now()
);

create index if not exists trip_documents_trip_id_idx on public.trip_documents(trip_id);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  day_index int not null check (day_index >= 1),
  start_time time,
  end_time time,

  title text not null,
  location_name text,
  address text,

  category itinerary_category not null default 'other',

  notes text,
  risk_level risk_level not null default 'low',
  risk_reasons jsonb not null default '[]'::jsonb,

  sort_order int not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists itinerary_items_trip_id_idx on public.itinerary_items(trip_id);
create index if not exists itinerary_items_trip_day_idx on public.itinerary_items(trip_id, day_index);
create index if not exists itinerary_items_category_idx on public.itinerary_items(category);

create table if not exists public.risk_reports (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,

  overall_score int not null check (overall_score >= 0 and overall_score <= 100),
  overall_level risk_level not null,

  summary text not null,

  top_risks jsonb not null default '[]'::jsonb,
  daily_analysis jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  contingency_plans jsonb not null default '[]'::jsonb,
  communication_scripts jsonb not null default '[]'::jsonb,

  raw_ai_output jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists risk_reports_trip_id_idx on public.risk_reports(trip_id);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,

  agent_type text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,

  status agent_run_status not null default 'pending',
  error_message text,

  created_at timestamptz not null default now()
);

create index if not exists agent_runs_trip_id_idx on public.agent_runs(trip_id);
create index if not exists agent_runs_agent_type_idx on public.agent_runs(agent_type);
create index if not exists agent_runs_status_idx on public.agent_runs(status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_trips_updated_at on public.trips;

create trigger set_trips_updated_at
before update on public.trips
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('trip-documents', 'trip-documents', false)
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.trip_documents enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.risk_reports enable row level security;
alter table public.agent_runs enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "Users can read own trips" on public.trips;
create policy "Users can read own trips"
on public.trips
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own trips" on public.trips;
create policy "Users can insert own trips"
on public.trips
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own trips" on public.trips;
create policy "Users can update own trips"
on public.trips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own trip documents" on public.trip_documents;
create policy "Users can read own trip documents"
on public.trip_documents
for select
using (
  exists (
    select 1 from public.trips
    where trips.id = trip_documents.trip_id
    and trips.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own itinerary items" on public.itinerary_items;
create policy "Users can read own itinerary items"
on public.itinerary_items
for select
using (
  exists (
    select 1 from public.trips
    where trips.id = itinerary_items.trip_id
    and trips.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own risk reports" on public.risk_reports;
create policy "Users can read own risk reports"
on public.risk_reports
for select
using (
  exists (
    select 1 from public.trips
    where trips.id = risk_reports.trip_id
    and trips.user_id = auth.uid()
  )
);
