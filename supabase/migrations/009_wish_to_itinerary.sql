alter table public.trips add column if not exists input_mode text not null default 'itinerary';
alter table public.trips add column if not exists wish_input jsonb not null default '{}'::jsonb;
alter table public.trips add column if not exists generated_itinerary jsonb not null default '[]'::jsonb;
create index if not exists trips_input_mode_idx on public.trips(input_mode);
