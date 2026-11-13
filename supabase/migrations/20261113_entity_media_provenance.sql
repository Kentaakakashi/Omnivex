-- OMNIVEX version-specific artwork provenance.
-- Apply this after supabase/schema.sql in the intended Supabase project.
-- An image remains private to review until a moderator marks it approved.

alter table public.entity_versions
  add column if not exists is_primary_version boolean not null default false;
create unique index if not exists entity_versions_one_primary_idx
  on public.entity_versions(entity_id) where is_primary_version = true;

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

create index if not exists entity_media_version_idx
  on public.entity_media(entity_version_id, approval_status, is_primary);
create unique index if not exists entity_media_one_approved_primary_idx
  on public.entity_media(entity_version_id)
  where is_primary = true and approval_status = 'approved';

alter table public.entity_media enable row level security;
grant select on public.entity_media to anon, authenticated;
grant insert on public.entity_media to authenticated;
grant update, delete on public.entity_media to authenticated;

drop policy if exists "approved entity media is public" on public.entity_media;
create policy "approved entity media is public"
  on public.entity_media for select to anon, authenticated
  using (approval_status = 'approved' or submitted_by = (select auth.uid()));

drop policy if exists "contributors submit version media" on public.entity_media;
create policy "contributors submit version media"
  on public.entity_media for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and approval_status = 'submitted'
    and reviewed_by is null
    and reviewed_at is null
  );

drop policy if exists "moderators manage version media" on public.entity_media;
create policy "moderators manage version media"
  on public.entity_media for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'omnivex_role') in ('moderator','admin'));
