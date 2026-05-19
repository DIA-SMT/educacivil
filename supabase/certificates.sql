create extension if not exists pgcrypto;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  certificate_code text not null,
  issued_at timestamptz not null default timezone('utc', now()),
  student_name_snapshot text not null,
  course_title_snapshot text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (certificate_code),
  unique (user_id, course_slug)
);

alter table public.certificates enable row level security;

drop policy if exists "Users can view their own certificates" on public.certificates;
create policy "Users can view their own certificates"
  on public.certificates
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own certificates" on public.certificates;
create policy "Users can insert their own certificates"
  on public.certificates
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.verify_certificate(p_code text)
returns table (
  certificate_code text,
  issued_at timestamptz,
  student_name_snapshot text,
  course_title_snapshot text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.certificate_code,
    c.issued_at,
    c.student_name_snapshot,
    c.course_title_snapshot
  from public.certificates c
  where c.certificate_code = p_code
  limit 1
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
