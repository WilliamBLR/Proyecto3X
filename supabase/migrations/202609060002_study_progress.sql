-- Public application API; only the owner can read their state.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.question_keys (
  id text primary key, correct integer not null check (correct between 0 and 2), double_eligible boolean not null default false
);
insert into private.question_keys(id, correct, double_eligible) values
('b001',0,false),('b002',1,false),('b003',2,false),('b004',0,false),('b005',1,false),('b006',2,false),('b007',0,false),
('b008',1,false),('b009',2,false),('b010',0,false),('b011',1,false),('b012',2,false),('b013',0,false),('b014',1,false),
('b015',2,true),('b016',0,true),('b017',1,true),('b018',2,true),('b019',0,true),('b020',1,true),('b021',2,true),
('b022',0,true),('b023',1,true),('b024',2,true),('b025',0,false),('b026',1,false),('b027',2,false),('b028',0,false),
('b029',1,true),('b030',2,false),('b031',0,false),('b032',1,false),('b033',2,false),('b034',0,false),('b035',1,false),
('b036',2,false),('b037',0,false),('b038',1,false),('b039',2,false),('b040',0,false),('b041',1,false),('b042',2,false);
alter table private.question_keys enable row level security;

create table public.study_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.study_states enable row level security;
revoke all on public.study_states from public, anon, authenticated;
grant select on public.study_states to authenticated;
create policy "read own study state" on public.study_states for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.sync_study_state(p_state jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); saved jsonb; output jsonb; corrected jsonb := '[]'; a jsonb;
  qid text; expected integer; eligible boolean; points integer; maximum integer; weight integer;
  total integer; doubles integer; field text; ts numeric := extract(epoch from now()) * 1000;
begin
  if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if coalesce((p_state->>'version'), '') <> '1' or jsonb_typeof(p_state) <> 'object' then raise exception 'Invalid state version'; end if;
  if octet_length(p_state::text) > 4000000 then raise exception 'State too large'; end if;
  foreach field in array array['attempts','chapters','signs','checklist','events'] loop
    if coalesce(jsonb_typeof(p_state->field), '') <> 'array' then raise exception 'Invalid state array'; end if;
  end loop;
  if jsonb_array_length(p_state->'attempts') > 2000 or jsonb_array_length(p_state->'events') > 10000 then raise exception 'History limit exceeded'; end if;
  if coalesce(jsonb_typeof(p_state->'updatedAt'), '') <> 'number' then raise exception 'Invalid timestamp'; end if;
  if p_state->'profile' is distinct from 'null'::jsonb then
    if coalesce(p_state#>>'{profile,licenseClass}', '') <> 'B'
      or coalesce(p_state#>>'{profile,goalUnit}', '') not in ('minutes','tests')
      or coalesce(length(trim(p_state#>>'{profile,name}')), 0) not between 1 and 40
      or coalesce(length(trim(p_state#>>'{profile,commune}')), 0) not between 2 and 80
      or coalesce((p_state#>>'{profile,dailyTarget}')::integer, 0) not between 1 and 180
      or coalesce((p_state#>>'{profile,reminderHour}')::integer, -1) not between 0 and 23
      or coalesce(jsonb_typeof(p_state#>'{profile,reminders}'), '') <> 'boolean'
      then raise exception 'Invalid profile'; end if;
  end if;
  for a in select value from jsonb_array_elements(p_state->'attempts') loop
    if coalesce(length(a->>'id'),0) not between 1 and 80 or coalesce(a->>'mode','') not in ('daily','simulation','reinforcement')
      or coalesce(jsonb_typeof(a->'questionIds'),'') <> 'array'
      or coalesce(jsonb_typeof(a->'doubleIds'),'') <> 'array'
      or coalesce(jsonb_typeof(a->'answers'),'') <> 'object'
      then raise exception 'Invalid attempt'; end if;
    total := jsonb_array_length(a->'questionIds'); doubles := jsonb_array_length(a->'doubleIds');
    if total not between 1 and 35 or total <> (select count(distinct value) from jsonb_array_elements_text(a->'questionIds'))
      or doubles <> (select count(distinct value) from jsonb_array_elements_text(a->'doubleIds')) then raise exception 'Invalid question selection'; end if;
    if a->>'mode' = 'simulation' then
      if total <> 35 or doubles <> 3 then raise exception 'Invalid simulation'; end if;
    elsif total > 10 or doubles <> 0 then raise exception 'Invalid practice'; end if;
    for qid in select value from jsonb_array_elements_text(a->'doubleIds') loop
      if not (a->'questionIds' ? qid) then raise exception 'Double question outside selection'; end if;
    end loop;
    points := 0; maximum := 0;
    for qid in select value from jsonb_array_elements_text(a->'questionIds') loop
      select correct, double_eligible into expected, eligible from private.question_keys where id = qid;
      if not found then raise exception 'Unknown question'; end if;
      weight := case when a->'doubleIds' ? qid then 2 else 1 end;
      if weight = 2 and not eligible then raise exception 'Ineligible double question'; end if;
      if a->'answers' ? qid and coalesce(a->'answers'->>qid,'') !~ '^[0-2]$' then raise exception 'Invalid answer'; end if;
      maximum := maximum + weight;
      if (a->'answers'->>qid)::integer = expected then points := points + weight; end if;
    end loop;
    if coalesce(jsonb_typeof(a->'startedAt'),'') <> 'number' or coalesce(jsonb_typeof(a->'finishedAt'),'') <> 'number'
      or coalesce(jsonb_typeof(a->'activeSeconds'),'') <> 'number' then raise exception 'Invalid attempt timestamps'; end if;
    if (a->>'startedAt')::numeric < 0 or (a->>'finishedAt')::numeric < (a->>'startedAt')::numeric then raise exception 'Invalid time order'; end if;
    a := a || jsonb_build_object('score', points, 'maxScore', maximum,
      'passed', case when a->>'mode' = 'simulation' then points >= 33 else points::numeric / maximum >= 0.8 end,
      'activeSeconds', greatest(0, least(86400, (a->>'activeSeconds')::numeric, ((a->>'finishedAt')::numeric - (a->>'startedAt')::numeric) / 1000)));
    corrected := corrected || jsonb_build_array(a);
  end loop;
  -- Create then lock so concurrent devices do not overwrite each other's history.
  insert into public.study_states(user_id, state) values (uid, jsonb_build_object('version',1,'updatedAt',0,'profile',null,'attempts','[]'::jsonb,'events','[]'::jsonb,'chapters','[]'::jsonb,'signs','[]'::jsonb,'checklist','[]'::jsonb,'draft',null)) on conflict do nothing;
  select state into saved from public.study_states where user_id = uid for update;
  output := case when (p_state->>'updatedAt')::numeric > (saved->>'updatedAt')::numeric then p_state else saved end;
  output := output || jsonb_build_object('draft', null);
  output := jsonb_set(output, '{attempts}', (select coalesce(jsonb_agg(value order by (value->>'finishedAt')::numeric), '[]') from (
    select distinct on (value->>'id') value from (
      select value, 0 as priority from jsonb_array_elements(saved->'attempts')
      union all select value, 1 from jsonb_array_elements(corrected)
    ) all_attempts order by value->>'id', priority
  ) merged));
  output := jsonb_set(output, '{events}', (select coalesce(jsonb_agg(value), '[]') from (
    select distinct on (value->>'id') value from (
      select value, 0 as priority from jsonb_array_elements(saved->'events')
      union all select value, 1 from jsonb_array_elements(p_state->'events')
    ) all_events order by value->>'id', priority
  ) merged));
  update public.study_states set state = output, updated_at = now() where user_id = uid;
  if output->'profile' is distinct from 'null'::jsonb then
    insert into public.profiles(id, license_class, commune_code, goal_unit, daily_target, study_reminders_enabled)
    values (uid, 'B', output#>>'{profile,commune}', output#>>'{profile,goalUnit}', (output#>>'{profile,dailyTarget}')::integer, (output#>>'{profile,reminders}')::boolean)
    on conflict (id) do update set license_class = excluded.license_class, commune_code = excluded.commune_code,
      goal_unit = excluded.goal_unit, daily_target = excluded.daily_target, study_reminders_enabled = excluded.study_reminders_enabled;
  end if;
  return output;
end;
$$;
revoke all on function public.sync_study_state(jsonb) from public, anon;
grant execute on function public.sync_study_state(jsonb) to authenticated;
