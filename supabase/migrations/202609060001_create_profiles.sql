-- Base de preferencias; no contiene preguntas ni respuestas reales.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  license_class text,
  commune_code text,
  goal_unit text not null default 'minutes' check (goal_unit in ('minutes', 'tests')),
  daily_target integer not null default 15 check (daily_target between 1 and 180),
  study_reminders_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

create policy "read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "insert own profile" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "update own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "delete own profile" on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

create function public.set_profile_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_profile_updated_at();
