-- Stability Sprint 2: Analysis Reliability

-- 1. analysis stage tracking
alter table public.trips
add column if not exists analysis_stage text not null default 'not_started';

alter table public.trips
add column if not exists analysis_error text;

alter table public.trips
add column if not exists analysis_started_at timestamptz;

alter table public.trips
add column if not exists analysis_completed_at timestamptz;

alter table public.trips
add column if not exists analysis_attempt_count int not null default 0;

alter table public.trips
add column if not exists last_analyzed_input_hash text;

-- 2. agent_runs enhancement
alter table public.agent_runs
add column if not exists duration_ms int;

alter table public.agent_runs
add column if not exists model text;

alter table public.agent_runs
add column if not exists provider text;
