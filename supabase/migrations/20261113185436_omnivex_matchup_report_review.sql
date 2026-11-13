alter table public.matchup_reports
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text;

create index if not exists matchup_reports_verification_idx
  on public.matchup_reports(verification_status, created_at desc);
