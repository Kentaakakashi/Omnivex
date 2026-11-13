-- AI-generated relationships are review leads, never verified contradictions by default.
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
