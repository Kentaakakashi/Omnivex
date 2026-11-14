create table if not exists public.entity_profiles (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  catalog_source_key text not null,
  official_profile_url text not null,
  source_record_id uuid not null references public.source_records(id) on delete restrict,
  profile_language text,
  profile_data jsonb not null default '{}'::jsonb check (jsonb_typeof(profile_data) = 'object'),
  sourced_field_count integer not null default 0 check (sourced_field_count >= 0),
  source_checked_at timestamptz not null default now(),
  source_content_hash text,
  status text not null default 'submitted' check (status in ('submitted','needs_review','verified','disputed','rejected','outdated')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, catalog_source_key)
);

create table if not exists public.entity_profile_facts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  entity_version_id uuid references public.entity_versions(id) on delete cascade,
  source_record_id uuid not null references public.source_records(id) on delete restrict,
  fact_key text not null,
  fact_value jsonb not null,
  source_locator text,
  source_language text,
  review_status text not null default 'submitted' check (review_status in ('submitted','needs_review','verified','disputed','rejected','outdated')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_id, source_record_id, fact_key)
);

create index if not exists entity_profiles_entity_idx on public.entity_profiles(entity_id);
create index if not exists entity_profiles_source_idx on public.entity_profiles(catalog_source_key, status);
create index if not exists entity_profile_facts_entity_idx on public.entity_profile_facts(entity_id, fact_key);
create index if not exists entity_profile_facts_version_idx on public.entity_profile_facts(entity_version_id);
create index if not exists entity_profile_facts_source_idx on public.entity_profile_facts(source_record_id);

alter table public.entity_profiles enable row level security;
alter table public.entity_profile_facts enable row level security;

drop policy if exists "public read entity profiles" on public.entity_profiles;
create policy "public read entity profiles" on public.entity_profiles for select to anon, authenticated using (true);
drop policy if exists "profile contributor insert" on public.entity_profiles;
create policy "profile contributor insert" on public.entity_profiles for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "profile contributor update own draft" on public.entity_profiles;
create policy "profile contributor update own draft" on public.entity_profiles for update to authenticated
using (created_by = (select auth.uid()) and status in ('submitted','needs_review'))
with check (created_by = (select auth.uid()) and status in ('submitted','needs_review'));
drop policy if exists "profile moderator manage" on public.entity_profiles;
create policy "profile moderator manage" on public.entity_profiles for all to authenticated
using (((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') = any (array['moderator','admin'])))
with check (((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') = any (array['moderator','admin'])));

drop policy if exists "public read profile facts" on public.entity_profile_facts;
create policy "public read profile facts" on public.entity_profile_facts for select to anon, authenticated using (true);
drop policy if exists "profile fact contributor insert" on public.entity_profile_facts;
create policy "profile fact contributor insert" on public.entity_profile_facts for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists "profile fact contributor update own draft" on public.entity_profile_facts;
create policy "profile fact contributor update own draft" on public.entity_profile_facts for update to authenticated
using (created_by = (select auth.uid()) and review_status in ('submitted','needs_review'))
with check (created_by = (select auth.uid()) and review_status in ('submitted','needs_review'));
drop policy if exists "profile fact moderator manage" on public.entity_profile_facts;
create policy "profile fact moderator manage" on public.entity_profile_facts for all to authenticated
using (((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') = any (array['moderator','admin'])))
with check (((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') = any (array['moderator','admin'])));

grant select on public.entity_profiles, public.entity_profile_facts to anon, authenticated;
grant insert, update on public.entity_profiles, public.entity_profile_facts to authenticated;