-- Sprint 1: Product Capability Upgrade

-- 1.1 给 risk_reports 增加字段
alter table public.risk_reports
add column if not exists dimension_scores jsonb not null default '{}'::jsonb;

alter table public.risk_reports
add column if not exists optimized_itinerary jsonb not null default '[]'::jsonb;

-- 1.2 风险反馈表
create table if not exists public.risk_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  risk_report_id uuid references public.risk_reports(id) on delete cascade,

  risk_key text,
  feedback_type text not null check (
    feedback_type in ('useful', 'inaccurate', 'adopted', 'not_relevant')
  ),

  comment text,
  created_at timestamptz not null default now()
);

create index if not exists risk_feedback_trip_id_idx
on public.risk_feedback(trip_id);

create index if not exists risk_feedback_report_id_idx
on public.risk_feedback(risk_report_id);

-- 1.3 报告分享表
create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  risk_report_id uuid not null references public.risk_reports(id) on delete cascade,

  share_token text not null unique,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists report_shares_token_idx
on public.report_shares(share_token);

-- 1.4 RLS (API routes use service_role, bypasses RLS)
alter table public.risk_feedback enable row level security;
alter table public.report_shares enable row level security;
