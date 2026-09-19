-- Reconcile the deployed realtime setup without rewriting migration history.

create or replace function public.bump_queue_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_queue_id uuid;
begin
  if tg_table_name = 'queues' then
    target_queue_id := new.id;
  elsif tg_table_name = 'queue_entries' then
    target_queue_id := new.queue_id;
  else
    raise exception 'bump_queue_revision called from unexpected table: %', tg_table_name;
  end if;

  insert into public.queue_public_state (queue_id, revision, updated_at)
  values (target_queue_id, 1, now())
  on conflict (queue_id) do update
    set revision = public.queue_public_state.revision + 1,
        updated_at = now();
  return new;
end;
$$;

-- next_join_order is an internal counter. An entry insert already signals the
-- public queue, so do not emit a second revision for that internal update.
drop trigger if exists queues_bump_revision on public.queues;
create trigger queues_bump_revision
after insert or update of name, status, average_service_minutes on public.queues
for each row execute function public.bump_queue_revision();

drop trigger if exists entries_bump_revision on public.queue_entries;
create trigger entries_bump_revision
after insert or update on public.queue_entries
for each row execute function public.bump_queue_revision();

create or replace function public.customer_queue_state(p_slug text, p_token_hash text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with selected as (
    select e.*, q.name as queue_name, q.slug, q.status as queue_status,
      q.average_service_minutes
    from public.queue_entries e
    join public.queues q on q.id = e.queue_id
    where q.slug = p_slug and e.customer_token_hash = p_token_hash
    limit 1
  ), calculated as (
    select selected.*,
      (
        select count(*)::integer from public.queue_entries waiting
        where waiting.queue_id = selected.queue_id and waiting.status = 'waiting'
      ) as waiting_count,
      case when selected.status = 'waiting' then (
        select count(*)::integer from public.queue_entries ahead
        where ahead.queue_id = selected.queue_id
          and (
            ahead.status = 'serving'
            or (ahead.status = 'waiting' and ahead.join_order < selected.join_order)
          )
      ) else null end as people_ahead
    from selected
  )
  select jsonb_build_object(
    'queue', jsonb_build_object(
      'id', queue_id,
      'name', queue_name,
      'slug', slug,
      'status', queue_status,
      'average_service_minutes', average_service_minutes
    ),
    'entry', jsonb_build_object(
      'id', id,
      'customer_name', customer_name,
      'status', status,
      'joined_at', joined_at
    ),
    'waitingCount', waiting_count,
    'position', case when status = 'waiting' then people_ahead + 1 else null end,
    'peopleAhead', people_ahead,
    'estimatedWaitMinutes',
      case when status = 'waiting' then people_ahead * average_service_minutes else null end
  ) from calculated;
$$;

grant select on public.queue_public_state to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'queue_public_state'
  ) then
    alter publication supabase_realtime add table public.queue_public_state;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'queue_entries'
  ) then
    alter publication supabase_realtime add table public.queue_entries;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'queues'
  ) then
    alter publication supabase_realtime add table public.queues;
  end if;
end $$;
