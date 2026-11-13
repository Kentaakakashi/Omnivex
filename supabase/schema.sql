-- OMNIVEX core schema
-- Run once in Supabase SQL Editor for project brbeqauwzvuruvjdjnud.
-- All browser-accessible tables have RLS enabled. No service-role key is used by the client.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_path text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (username is null or char_length(username) between 3 and 24)
);

create table if not exists public.universes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'fictional',
  description text,
  status text not null default 'provisional' check (status in ('provisional','submitted','verified','disputed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_works (
  id uuid primary key default gen_random_uuid(),
  universe_id uuid references public.universes(id) on delete set null,
  title text not null,
  medium text,
  creator_credit text,
  publisher text,
  release_year integer,
  source_url text,
  canon_label text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  entity_type text not null default 'character',
  primary_universe_id uuid references public.universes(id) on delete set null,
  short_description text,
  status text not null default 'provisional' check (status in ('provisional','submitted','verified','disputed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entity_versions (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  slug text not null,
  label text not null,
  continuity text,
  source_work_id uuid references public.source_works(id) on delete set null,
  form_name text,
  canon_status text not null default 'canon' check (canon_status in ('canon','alternate','non_canon','composite','unknown')),
  version_notes text,
  is_composite boolean not null default false,
  is_primary_version boolean not null default false,
  status text not null default 'provisional' check (status in ('provisional','submitted','verified','disputed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(entity_id, slug)
);

create table if not exists public.entity_media (
  id uuid primary key default gen_random_uuid(),
  entity_version_id uuid not null references public.entity_versions(id) on delete cascade,
  media_kind text not null default 'character_artwork'
    check (media_kind in ('character_artwork','official_still','cover_art','promotional_art','user_owned_art')),
  asset_url text not null,
  source_url text not null,
  source_title text not null,
  source_creator text,
  usage_basis text not null
    check (usage_basis in ('public_domain','cc0','cc_by','cc_by_sa','licensed','publisher_authorized','user_owned')),
  license_name text,
  attribution_text text,
  alt_text text,
  is_primary boolean not null default false,
  approval_status text not null default 'submitted'
    check (approval_status in ('submitted','needs_review','approved','rejected','outdated')),
  submitted_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entity_aliases (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  alias text not null,
  alias_type text not null default 'alternate_name',
  locale text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(entity_id, alias)
);

create table if not exists public.source_records (
  id uuid primary key default gen_random_uuid(),
  source_work_id uuid references public.source_works(id) on delete set null,
  title text not null,
  source_type text not null default 'primary',
  publisher_or_host text,
  author_or_creator text,
  url text,
  locator text,
  published_at date,
  accessed_at timestamptz not null default now(),
  reliability_grade text check (reliability_grade in ('A','B','C','D','E')),
  source_notes text,
  submitted_by uuid references auth.users(id) on delete set null,
  review_status text not null default 'submitted' check (review_status in ('submitted','needs_review','verified','disputed','rejected','outdated')),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  entity_version_id uuid not null references public.entity_versions(id) on delete cascade,
  source_record_id uuid references public.source_records(id) on delete set null,
  summary text not null,
  context text,
  locator text,
  evidence_type text not null default 'shown' check (evidence_type in ('shown','stated','inferred')),
  canon_status text not null default 'canon' check (canon_status in ('canon','alternate','non_canon','composite','unknown')),
  reliability_grade text check (reliability_grade in ('A','B','C','D','E')),
  interpretation_quality smallint check (interpretation_quality between 1 and 5),
  limitations text,
  counter_evidence_notes text,
  review_status text not null default 'submitted' check (review_status in ('submitted','needs_review','verified','disputed','rejected','outdated')),
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_relations (
  id uuid primary key default gen_random_uuid(),
  from_evidence_id uuid not null references public.evidence_records(id) on delete cascade,
  to_evidence_id uuid not null references public.evidence_records(id) on delete cascade,
  relation_type text not null check (relation_type in ('supports','contradicts','qualifies','same_event','context_for','supersedes')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(from_evidence_id, to_evidence_id, relation_type),
  check (from_evidence_id <> to_evidence_id)
);

create table if not exists public.capabilities (
  id uuid primary key default gen_random_uuid(),
  entity_version_id uuid not null references public.entity_versions(id) on delete cascade,
  capability_name text not null,
  dimension text not null,
  mechanism text,
  activation_requirements text,
  range_or_scope text,
  limitations text,
  counters_and_resistances text,
  supporting_evidence_id uuid references public.evidence_records(id) on delete set null,
  status text not null default 'submitted' check (status in ('submitted','needs_review','verified','disputed','rejected','outdated')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.feat_claims (
  id uuid primary key default gen_random_uuid(),
  entity_version_id uuid not null references public.entity_versions(id) on delete cascade,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  claim text not null,
  claim_type text not null default 'shown' check (claim_type in ('shown','stated','inferred')),
  limitations text,
  confidence numeric(4,3) check (confidence between 0 and 1),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.matchups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  configuration jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft','published','under_review','archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matchup_participants (
  id uuid primary key default gen_random_uuid(),
  matchup_id uuid not null references public.matchups(id) on delete cascade,
  entity_version_id uuid not null references public.entity_versions(id) on delete restrict,
  side text not null,
  participant_order smallint not null default 1,
  team_label text,
  unique(matchup_id, side, participant_order)
);

create table if not exists public.matchup_reports (
  id uuid primary key default gen_random_uuid(),
  matchup_id uuid not null references public.matchups(id) on delete cascade,
  report_version integer not null default 1,
  analysis_mode text not null default 'standard',
  verdict_type text not null default 'inconclusive' check (verdict_type in ('canon_confirmed','evidence_prediction','inconclusive')),
  verdict_summary text,
  uncertainty_notes text,
  evidence_quality jsonb not null default '{}'::jsonb,
  analysis_completeness jsonb not null default '{}'::jsonb,
  verdict_confidence jsonb not null default '{}'::jsonb,
  report_body jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','needs_review','passed','rejected')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(matchup_id, report_version)
);

create table if not exists public.matchup_report_evidence (
  report_id uuid not null references public.matchup_reports(id) on delete cascade,
  evidence_record_id uuid not null references public.evidence_records(id) on delete restrict,
  relevance_note text,
  primary key(report_id, evidence_record_id)
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  matchup_id uuid references public.matchups(id) on delete cascade,
  title text not null,
  body text,
  status text not null default 'open' check (status in ('open','locked','archived')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arguments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  parent_id uuid references public.arguments(id) on delete cascade,
  side text not null default 'neutral',
  body text not null,
  status text not null default 'visible' check (status in ('visible','hidden','under_review','removed')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.argument_evidence (
  argument_id uuid not null references public.arguments(id) on delete cascade,
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  note text,
  primary key(argument_id, evidence_record_id)
);

create table if not exists public.community_votes (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  choice text not null check (choice in ('side_a','side_b','neutral')),
  created_at timestamptz not null default now(),
  unique(discussion_id, user_id)
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('argument','evidence','discussion')),
  target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'support' check (reaction in ('support','insightful','needs_source')),
  created_at timestamptz not null default now(),
  unique(target_type, target_id, user_id, reaction)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('entity','universe','member','matchup','discussion')),
  target_id uuid not null,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, target_type, target_id)
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('entity','universe','matchup','evidence','discussion')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, target_type, target_id)
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  linked_entity_version_id uuid references public.entity_versions(id) on delete set null,
  linked_matchup_id uuid references public.matchups(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  target_type text,
  target_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  event_type text not null default 'community',
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','completed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create table if not exists public.ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  ranking_type text not null,
  period text not null default 'all_time',
  subject_type text not null,
  subject_id uuid not null,
  position integer not null,
  score numeric,
  methodology jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  unique(ranking_type, period, subject_type, subject_id, captured_at)
);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id) on delete restrict,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists entities_name_search_idx on public.entities using gin (to_tsvector('simple', coalesce(name,'')));
create index if not exists entities_universe_idx on public.entities(primary_universe_id);
create index if not exists entity_versions_entity_idx on public.entity_versions(entity_id);
create unique index if not exists entity_versions_one_primary_idx
  on public.entity_versions(entity_id) where is_primary_version = true;
create index if not exists entity_media_version_idx on public.entity_media(entity_version_id, approval_status, is_primary);
create unique index if not exists entity_media_one_approved_primary_idx
  on public.entity_media(entity_version_id)
  where is_primary = true and approval_status = 'approved';
create index if not exists evidence_version_status_idx on public.evidence_records(entity_version_id, review_status);
create index if not exists evidence_source_idx on public.evidence_records(source_record_id);
create index if not exists matchup_created_idx on public.matchups(created_at desc);
create index if not exists discussions_matchup_idx on public.discussions(matchup_id, created_at desc);
create index if not exists arguments_discussion_idx on public.arguments(discussion_id, created_at);
create index if not exists notes_owner_updated_idx on public.research_notes(user_id, updated_at desc);
create index if not exists notifications_owner_created_idx on public.notifications(user_id, created_at desc);

-- Profile bootstrap. Authorization never trusts user-editable metadata.
create or replace function public.omnivex_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.omnivex_handle_new_user() from public, anon, authenticated;
drop trigger if exists omnivex_on_auth_user_created on auth.users;
create trigger omnivex_on_auth_user_created
after insert on auth.users
for each row execute procedure public.omnivex_handle_new_user();

-- Atomic matchup creation; the function runs as the caller and remains subject to RLS.
create or replace function public.create_matchup(
  matchup_title text,
  matchup_configuration jsonb,
  participant_version_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
  version_id uuid;
  idx integer := 0;
  clean_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if coalesce(cardinality(participant_version_ids), 0) < 2 then
    raise exception 'At least two version-specific participants are required';
  end if;
  clean_slug := trim(both '-' from regexp_replace(lower(coalesce(matchup_title, 'matchup')), '[^a-z0-9]+', '-', 'g'));
  insert into public.matchups (slug, title, configuration, created_by, status)
  values (coalesce(nullif(clean_slug, ''), 'matchup') || '-' || left(gen_random_uuid()::text, 8),
          coalesce(nullif(trim(matchup_title), ''), 'Untitled matchup'),
          coalesce(matchup_configuration, '{}'::jsonb), auth.uid(), 'published')
  returning id into new_id;
  foreach version_id in array participant_version_ids loop
    idx := idx + 1;
    insert into public.matchup_participants (matchup_id, entity_version_id, side, participant_order)
    values (new_id, version_id, case when idx = 1 then 'side_a' when idx = 2 then 'side_b' else 'side_' || idx::text end, 1);
  end loop;
  return new_id;
end;
$$;
revoke all on function public.create_matchup(text, jsonb, uuid[]) from public, anon;
grant execute on function public.create_matchup(text, jsonb, uuid[]) to authenticated;

-- Enable RLS on every public table in this schema.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- Data API exposure is explicitly granted. RLS below still controls every row.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- Public reference data.
drop policy if exists "public profiles readable" on public.profiles;
create policy "public profiles readable" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "profile owner insert" on public.profiles;
create policy "profile owner insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['universes','source_works','entities','entity_versions','entity_aliases','source_records','evidence_records','evidence_relations','capabilities','feat_claims','matchups','matchup_participants','matchup_reports','matchup_report_evidence','discussions','arguments','argument_evidence','community_votes','reactions','events','ranking_snapshots'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- Version-specific media is visible only after an explicit approval decision.
drop policy if exists "approved entity media is public" on public.entity_media;
create policy "approved entity media is public" on public.entity_media
for select to anon, authenticated using (approval_status = 'approved' or submitted_by = (select auth.uid()));
drop policy if exists "contributors submit version media" on public.entity_media;
create policy "contributors submit version media" on public.entity_media
for insert to authenticated with check (
  submitted_by = (select auth.uid())
  and approval_status = 'submitted'
  and reviewed_by is null
  and reviewed_at is null
);
drop policy if exists "moderators manage version media" on public.entity_media;
create policy "moderators manage version media" on public.entity_media
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'))
with check ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'));

-- Authenticated contributions retain authorship and remain unverified until reviewed.
drop policy if exists "universe contributor insert" on public.universes;
create policy "universe contributor insert" on public.universes for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "entity contributor insert" on public.entities;
create policy "entity contributor insert" on public.entities for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "version contributor insert" on public.entity_versions;
create policy "version contributor insert" on public.entity_versions for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "alias contributor insert" on public.entity_aliases;
create policy "alias contributor insert" on public.entity_aliases for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "source contributor insert" on public.source_records;
create policy "source contributor insert" on public.source_records for insert to authenticated with check (submitted_by = (select auth.uid()));
drop policy if exists "evidence contributor insert" on public.evidence_records;
create policy "evidence contributor insert" on public.evidence_records for insert to authenticated with check (submitted_by = (select auth.uid()) and review_status = 'submitted');
drop policy if exists "evidence author correction" on public.evidence_records;
create policy "evidence author correction" on public.evidence_records for update to authenticated using (submitted_by = (select auth.uid()) and review_status in ('submitted','needs_review')) with check (submitted_by = (select auth.uid()) and review_status in ('submitted','needs_review'));
drop policy if exists "capability contributor insert" on public.capabilities;
create policy "capability contributor insert" on public.capabilities for insert to authenticated with check (created_by = (select auth.uid()) and status = 'submitted');
drop policy if exists "feat contributor insert" on public.feat_claims;
create policy "feat contributor insert" on public.feat_claims for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "matchup owner insert" on public.matchups;
create policy "matchup owner insert" on public.matchups for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "matchup owner update" on public.matchups;
create policy "matchup owner update" on public.matchups for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
drop policy if exists "participant owner insert" on public.matchup_participants;
create policy "participant owner insert" on public.matchup_participants for insert to authenticated with check (exists (select 1 from public.matchups m where m.id = matchup_id and m.created_by = (select auth.uid())));
drop policy if exists "report owner insert" on public.matchup_reports;
create policy "report owner insert" on public.matchup_reports for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "discussion owner insert" on public.discussions;
create policy "discussion owner insert" on public.discussions for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "discussion owner update" on public.discussions;
create policy "discussion owner update" on public.discussions for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
drop policy if exists "argument owner insert" on public.arguments;
create policy "argument owner insert" on public.arguments for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "argument owner update" on public.arguments;
create policy "argument owner update" on public.arguments for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- Owner-private data. Saved, followed and subscribed relationships are intentionally separate.
do $$
declare t text;
begin
  foreach t in array array['follows','saved_items','research_notes','notifications','event_registrations'] loop
    execute format('drop policy if exists "owner read" on public.%I', t);
    execute format('create policy "owner read" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;
drop policy if exists "follow owner insert" on public.follows;
create policy "follow owner insert" on public.follows for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "follow owner update" on public.follows;
create policy "follow owner update" on public.follows for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "follow owner delete" on public.follows;
create policy "follow owner delete" on public.follows for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "saved owner insert" on public.saved_items;
create policy "saved owner insert" on public.saved_items for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "saved owner delete" on public.saved_items;
create policy "saved owner delete" on public.saved_items for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "notes owner insert" on public.research_notes;
create policy "notes owner insert" on public.research_notes for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "notes owner update" on public.research_notes;
create policy "notes owner update" on public.research_notes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "notes owner delete" on public.research_notes;
create policy "notes owner delete" on public.research_notes for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "notifications owner update" on public.notifications;
create policy "notifications owner update" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "registration owner insert" on public.event_registrations;
create policy "registration owner insert" on public.event_registrations for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "registration owner delete" on public.event_registrations;
create policy "registration owner delete" on public.event_registrations for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "reporter insert" on public.user_reports;
create policy "reporter insert" on public.user_reports for insert to authenticated with check (reporter_id = (select auth.uid()));
drop policy if exists "reporter read" on public.user_reports;
create policy "reporter read" on public.user_reports for select to authenticated using (reporter_id = (select auth.uid()));

-- Votes/reactions can be written/deleted only by their owner and never edited into another account.
drop policy if exists "vote owner insert" on public.community_votes;
create policy "vote owner insert" on public.community_votes for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "vote owner delete" on public.community_votes;
create policy "vote owner delete" on public.community_votes for delete to authenticated using (user_id = (select auth.uid()));
drop policy if exists "reaction owner insert" on public.reactions;
create policy "reaction owner insert" on public.reactions for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "reaction owner delete" on public.reactions;
create policy "reaction owner delete" on public.reactions for delete to authenticated using (user_id = (select auth.uid()));

-- Staff access comes only from server-controlled app_metadata, never user_metadata.
do $$
declare t text;
begin
  foreach t in array array['universes','source_works','entities','entity_versions','entity_aliases','source_records','evidence_records','evidence_relations','capabilities','feat_claims','matchups','matchup_participants','matchup_reports','discussions','arguments','events','ranking_snapshots','user_reports','moderation_actions'] loop
    execute format('drop policy if exists "moderator manage" on public.%I', t);
    execute format('create policy "moderator manage" on public.%I for all to authenticated using ((auth.jwt() -> ''app_metadata'' ->> ''omnivex_role'') in (''moderator'',''admin'')) with check ((auth.jwt() -> ''app_metadata'' ->> ''omnivex_role'') in (''moderator'',''admin''))', t);
  end loop;
end $$;

-- Avatars are public to read, but uploads are isolated to each authenticated user's folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('omnivex-avatars', 'omnivex-avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "avatar owner upload" on storage.objects;
create policy "avatar owner upload" on storage.objects for insert to authenticated
with check (bucket_id = 'omnivex-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar owner update" on storage.objects for update to authenticated
using (bucket_id = 'omnivex-avatars' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'omnivex-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "avatar owner delete" on storage.objects;
create policy "avatar owner delete" on storage.objects for delete to authenticated
using (bucket_id = 'omnivex-avatars' and owner_id = (select auth.uid())::text);
 
-- Contributor-safe writes for evidence relationship records.
drop policy if exists "evidence relation contributor insert" on public.evidence_relations;
create policy "evidence relation contributor insert"
  on public.evidence_relations for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.evidence_records e where e.id = from_evidence_id)
    and exists (select 1 from public.evidence_records e where e.id = to_evidence_id)
  );
drop policy if exists "evidence relation author delete" on public.evidence_relations;
create policy "evidence relation author delete"
  on public.evidence_relations for delete to authenticated
  using (created_by = (select auth.uid()));

-- An argument author may attach or detach evidence from their own argument only.
drop policy if exists "argument author link evidence" on public.argument_evidence;
create policy "argument author link evidence"
  on public.argument_evidence for insert to authenticated
  with check (
    exists (
      select 1 from public.arguments a
      where a.id = argument_id and a.created_by = (select auth.uid())
    )
  );
drop policy if exists "argument author unlink evidence" on public.argument_evidence;
create policy "argument author unlink evidence"
  on public.argument_evidence for delete to authenticated
  using (
    exists (
      select 1 from public.arguments a
      where a.id = argument_id and a.created_by = (select auth.uid())
    )
  );
drop policy if exists "argument evidence moderator manage" on public.argument_evidence;
create policy "argument evidence moderator manage"
  on public.argument_evidence for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'));

-- A report author may attach or detach evidence from their own report only.
drop policy if exists "report author link evidence" on public.matchup_report_evidence;
create policy "report author link evidence"
  on public.matchup_report_evidence for insert to authenticated
  with check (
    exists (
      select 1 from public.matchup_reports r
      where r.id = report_id and r.created_by = (select auth.uid())
    )
  );
drop policy if exists "report author unlink evidence" on public.matchup_report_evidence;
create policy "report author unlink evidence"
  on public.matchup_report_evidence for delete to authenticated
  using (
    exists (
      select 1 from public.matchup_reports r
      where r.id = report_id and r.created_by = (select auth.uid())
    )
  );
drop policy if exists "report evidence moderator manage" on public.matchup_report_evidence;
create policy "report evidence moderator manage"
  on public.matchup_report_evidence for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'));


-- Entity-level source references for internal character and entity dossiers.
create table if not exists public.entity_source_links (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  source_record_id uuid not null references public.source_records(id) on delete cascade,
  relationship_type text not null default 'official_profile',
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_id, source_record_id, relationship_type)
);
create index if not exists entity_source_links_entity_idx
  on public.entity_source_links(entity_id, created_at desc);
create index if not exists entity_source_links_source_idx
  on public.entity_source_links(source_record_id);
create index if not exists entity_source_links_created_by_idx
  on public.entity_source_links(created_by);

alter table public.entity_source_links enable row level security;
grant select on public.entity_source_links to anon, authenticated;
grant insert, delete on public.entity_source_links to authenticated;

drop policy if exists "public entity source links readable" on public.entity_source_links;
create policy "public entity source links readable"
  on public.entity_source_links for select to anon, authenticated using (true);

drop policy if exists "entity source link contributor insert" on public.entity_source_links;
create policy "entity source link contributor insert"
  on public.entity_source_links for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (select 1 from public.entities e where e.id = entity_id)
    and exists (select 1 from public.source_records s where s.id = source_record_id)
  );

drop policy if exists "entity source link author delete" on public.entity_source_links;
create policy "entity source link author delete"
  on public.entity_source_links for delete to authenticated
  using (created_by = (select auth.uid()));

drop policy if exists "entity source link moderator manage" on public.entity_source_links;
create policy "entity source link moderator manage"
  on public.entity_source_links for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'));


-- AI research findings and contradictions remain reviewable submissions.
alter table public.evidence_relations
  add column if not exists review_status text not null default 'submitted',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='evidence_relations_review_status_check'
      and conrelid='public.evidence_relations'::regclass
  ) then
    alter table public.evidence_relations
      add constraint evidence_relations_review_status_check
      check (review_status in ('submitted','needs_review','verified','disputed','rejected'));
  end if;
end $$;

create index if not exists evidence_relations_review_status_idx
  on public.evidence_relations(review_status, created_at desc);
create index if not exists evidence_records_version_status_idx
  on public.evidence_records(entity_version_id, review_status, created_at desc);
create index if not exists capabilities_version_status_idx
  on public.capabilities(entity_version_id, status, created_at desc);
create index if not exists feat_claims_version_idx
  on public.feat_claims(entity_version_id, created_at desc);
create index if not exists source_records_url_idx
  on public.source_records(url);


-- Moderator review metadata for reproducible matchup reports.
alter table public.matchup_reports
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text;

create index if not exists matchup_reports_verification_idx
  on public.matchup_reports(verification_status, created_at desc);
