-- ARC site agent — conversation log schema.
-- Run once in the Supabase SQL editor (or via psql) on a fresh project.

create extension if not exists pgcrypto;

create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  ts timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  tool_events jsonb,
  visitor_email text,
  scheduled_call_at timestamptz,
  lang text,
  user_agent text
);

create index if not exists conversation_messages_session_ts_idx
  on conversation_messages (session_id, ts);

create index if not exists conversation_messages_ts_desc_idx
  on conversation_messages (ts desc);

create index if not exists conversation_messages_visitor_email_idx
  on conversation_messages (visitor_email)
  where visitor_email is not null;

-- Convenience view: one row per session with first/last seen, message count,
-- visitor email if captured, scheduled call timestamp if any.
create or replace view conversation_sessions as
select
  session_id,
  min(ts) as first_seen,
  max(ts) as last_seen,
  count(*)::int as message_count,
  max(visitor_email) as visitor_email,
  max(scheduled_call_at) as scheduled_call_at,
  max(lang) as lang
from conversation_messages
group by session_id;

-- Row-level security: deny all by default. Netlify functions use the
-- service role key (which bypasses RLS), so nothing else needs to read.
alter table conversation_messages enable row level security;
