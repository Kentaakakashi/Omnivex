-- Entity-level source links keep character dossiers inside OMNIVEX while preserving citations.
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
