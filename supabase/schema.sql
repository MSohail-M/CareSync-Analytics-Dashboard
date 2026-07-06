-- ============================================================
-- Retell Call Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- CLINICS  (one row per client)
-- ============================================================
create table clinics (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,        -- e.g. "primcoastal-fl"
  name          text not null,               -- "PrimCoastal Primary Care"
  retell_agent_id text,                      -- links calls to this clinic
  phone_number  text,                        -- clinic's inbound DID
  plan_tier     text not null default 'starter',
  status        text not null default 'active',
  created_at    timestamptz default now()
);

-- ============================================================
-- CALLS  (one row per Retell call — written by webhook)
-- ============================================================
create table calls (
  id                  uuid primary key default uuid_generate_v4(),
  clinic_id           uuid references clinics(id) on delete cascade,

  -- Retell identifiers
  retell_call_id      text unique not null,
  retell_agent_id     text,

  -- Timing
  started_at          timestamptz,
  ended_at            timestamptz,
  duration_seconds    int,

  -- Caller
  from_number         text,   -- stored masked

  -- Retell call_analysis (AI fills these automatically)
  call_summary        text,                            -- AI-generated summary
  user_sentiment      text,                            -- Positive | Neutral | Negative
  call_successful     boolean,                         -- did call achieve its goal?
  in_voicemail        boolean default false,
  disconnection_reason text,                           -- user_hangup | agent_hangup | etc

  -- Custom analysis fields (you configure in Retell agent settings)
  outcome             text,                            -- booked | rescheduled | transferred | failed
  patient_name        text,
  provider_name       text,
  visit_type          text,

  -- Transcript & recording
  transcript          text,                            -- plain text full conversation
  recording_url       text,                            -- Retell-hosted MP3

  created_at          timestamptz default now()
);

create index calls_clinic_id_idx   on calls(clinic_id);
create index calls_started_at_idx  on calls(started_at desc);
create index calls_outcome_idx     on calls(outcome);

-- ============================================================
-- USERS  (clinic staff — linked to Supabase auth.users)
-- ============================================================
-- role values:
--   'dev'     → Sohail / engineers  — sees call_traces, error codes, patient IDs
--   'owner'   → clinic owner        — sees calls + summaries, no technical detail
--   'manager' → clinic manager      — same as owner
--   'staff'   → front desk          — sees calls only
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  clinic_id   uuid references clinics(id) on delete cascade,
  role        text not null default 'staff',   -- dev | owner | manager | staff
  name        text,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY  (clients see only their clinic)
-- ============================================================
alter table clinics enable row level security;
alter table calls   enable row level security;
alter table users   enable row level security;

create policy "Users see own clinic"
  on clinics for select
  using (id = (select clinic_id from users where id = auth.uid()));

create policy "Users see own calls"
  on calls for select
  using (clinic_id = (select clinic_id from users where id = auth.uid()));

create policy "Users see own user row"
  on users for select
  using (id = auth.uid());

-- service_role (used by webhook + ecw-connector) bypasses RLS by default.

-- ============================================================
-- CALL TRACES  (one row per tool call — written by ecw-connector)
-- ============================================================
-- Visible to 'dev' role only. Clinic users never see this table.
--
-- call_id       → Retell call_id (from x-retell-call-id header passed by n8n)
-- tool_name     → Retell tool name (searchPatient, bookAppointment, etc.)
-- status        → success | error
-- http_status   → HTTP response code returned by the connector
-- duration_ms   → connector processing time (not including Retell/n8n overhead)
-- patient_id    → eCW opaque base64 ID — not direct PHI, safe to store
-- error_code    → connector error code (VALIDATION_ERROR, EHR_ERROR, etc.)
-- error_message → sanitised error message (no PHI values)
-- request_params  → PHI-masked request body
-- response_summary → structural summary only (success, count, has_data) — no PHI values
create table call_traces (
  id               uuid primary key default uuid_generate_v4(),
  call_id          text not null,
  tool_name        text not null,
  status           text not null check (status in ('success', 'error')),
  http_status      int  not null,
  duration_ms      int  not null,
  patient_id       text,
  error_code       text,
  error_message    text,
  request_params   jsonb,
  response_summary jsonb,
  created_at       timestamptz default now() not null
);

create index call_traces_call_id_idx    on call_traces(call_id);
create index call_traces_created_at_idx on call_traces(created_at desc);
create index call_traces_status_idx     on call_traces(status);
create index call_traces_tool_idx       on call_traces(tool_name);

alter table call_traces enable row level security;

-- Only 'dev' users can read call traces
create policy "Dev users see call traces"
  on call_traces for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and role = 'dev'
    )
  );

-- ============================================================
-- ============================================================
-- CLINIC_AGENTS  (multiple agents per clinic — v2 spaces, chat agents, etc.)
-- ============================================================
-- The clinics.retell_agent_id column handles the primary/legacy agent.
-- This table handles additional agents (new spaces, chat widgets, parallel rollouts).
-- The webhook route checks clinics first, then falls back to this table.
create table if not exists clinic_agents (
  id               uuid primary key default uuid_generate_v4(),
  clinic_id        uuid references clinics(id) on delete cascade not null,
  retell_agent_id  text unique not null,
  label            text,
  created_at       timestamptz default now()
);

create index if not exists clinic_agents_agent_id_idx on clinic_agents(retell_agent_id);

alter table clinic_agents enable row level security;

-- ============================================================
-- SEED: first clinic (edit values, then uncomment + run)
-- ============================================================
-- insert into clinics (slug, name, retell_agent_id, phone_number, plan_tier)
-- values (
--   'primcoastal-fl',
--   'PrimCoastal Primary Care',
--   'agent_xxxxxxxxxxxx',   -- from Retell dashboard
--   '+19045550199',
--   'growth'
-- );
