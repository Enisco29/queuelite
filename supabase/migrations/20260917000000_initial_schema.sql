create extension if not exists pgcrypto with schema extensions;

create type public.queue_status as enum ('open', 'paused', 'closed');
create type public.queue_entry_status as enum ('waiting', 'serving', 'completed', 'skipped', 'left');

create table public.queues (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  status public.queue_status not null default 'open',
  average_service_minutes integer not null default 10 check (average_service_minutes between 1 and 240),
  next_join_order bigint not null default 0 check (next_join_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.queues add constraint queues_owner_required_except_demo
check (owner_id is not null or slug = 'demo');

create table public.queue_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  queue_id uuid not null references public.queues(id) on delete restrict,
  customer_name text not null check (
    char_length(btrim(customer_name)) between 1 and 80
    and customer_name !~ '[[:cntrl:]]'
  ),
  customer_token_hash text not null unique check (customer_token_hash ~ '^[a-f0-9]{64}$'),
  join_order bigint not null check (join_order > 0),
  status public.queue_entry_status not null default 'waiting',
  joined_at timestamptz not null default now(),
  called_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (queue_id, join_order)
);

create index queue_entries_order_idx on public.queue_entries (queue_id, status, join_order);
create unique index queue_entries_one_serving_idx on public.queue_entries (queue_id) where status = 'serving';

create table public.queue_public_state (
  queue_id uuid primary key references public.queues(id) on delete cascade,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger queues_touch_updated_at before update on public.queues
for each row execute function public.touch_updated_at();

create trigger entries_touch_updated_at before update on public.queue_entries
for each row execute function public.touch_updated_at();

create function public.bump_queue_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_queue_id uuid;
begin
  target_queue_id := case when tg_table_name = 'queues' then new.id else new.queue_id end;
  insert into public.queue_public_state (queue_id, revision, updated_at)
  values (target_queue_id, 1, now())
  on conflict (queue_id) do update
    set revision = public.queue_public_state.revision + 1, updated_at = now();
  return new;
end;
$$;

create trigger queues_bump_revision after insert or update on public.queues
for each row execute function public.bump_queue_revision();

create trigger entries_bump_revision after insert or update on public.queue_entries
for each row execute function public.bump_queue_revision();

create function public.join_queue(p_slug text, p_customer_name text, p_token_hash text)
returns public.queue_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_queue public.queues;
  joined public.queue_entries;
begin
  if p_customer_name is null or char_length(btrim(p_customer_name)) not between 1 and 80
     or p_customer_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid customer name';
  end if;
  if p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid customer token';
  end if;

  select * into target_queue from public.queues where slug = p_slug for update;
  if not found then raise exception using errcode = 'P0002', message = 'Queue not found'; end if;
  if target_queue.status <> 'open' then
    raise exception using errcode = 'P0001', message = 'Queue is not accepting customers';
  end if;

  update public.queues set next_join_order = next_join_order + 1 where id = target_queue.id
  returning next_join_order into target_queue.next_join_order;

  insert into public.queue_entries (queue_id, customer_name, customer_token_hash, join_order)
  values (target_queue.id, btrim(p_customer_name), p_token_hash, target_queue.next_join_order)
  returning * into joined;
  return joined;
end;
$$;

create function public.customer_queue_state(p_slug text, p_token_hash text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with selected as (
    select e.*, q.name as queue_name, q.slug, q.status as queue_status, q.average_service_minutes
    from public.queue_entries e
    join public.queues q on q.id = e.queue_id
    where q.slug = p_slug and e.customer_token_hash = p_token_hash
    limit 1
  ), calculated as (
    select selected.*,
      case when selected.status = 'waiting' then (
        select count(*)::integer from public.queue_entries ahead
        where ahead.queue_id = selected.queue_id
          and (ahead.status = 'serving' or (ahead.status = 'waiting' and ahead.join_order < selected.join_order))
      ) else null end as people_ahead
    from selected
  )
  select jsonb_build_object(
    'queue', jsonb_build_object(
      'id', queue_id, 'name', queue_name, 'slug', slug,
      'status', queue_status, 'average_service_minutes', average_service_minutes
    ),
    'entry', jsonb_build_object(
      'id', id, 'customer_name', customer_name, 'status', status, 'joined_at', joined_at
    ),
    'position', case when status = 'waiting' then people_ahead + 1 else null end,
    'peopleAhead', people_ahead,
    'estimatedWaitMinutes', case when status = 'waiting' then people_ahead * average_service_minutes else null end
  ) from calculated;
$$;

create function public.leave_queue(p_slug text, p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  update public.queue_entries e
  set status = 'left', finished_at = now()
  from public.queues q
  where e.queue_id = q.id and q.slug = p_slug and e.customer_token_hash = p_token_hash
    and e.status in ('waiting', 'serving');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create function public.owner_call_next(p_queue_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  perform 1 from public.queues where id = p_queue_id and owner_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'Queue not found or forbidden'; end if;
  if exists (select 1 from public.queue_entries where queue_id = p_queue_id and status = 'serving') then
    raise exception using errcode = 'P0001', message = 'A customer is already being served';
  end if;
  select id into target_id from public.queue_entries
    where queue_id = p_queue_id and status = 'waiting'
    order by join_order limit 1 for update skip locked;
  if target_id is null then return null; end if;
  update public.queue_entries set status = 'serving', called_at = now() where id = target_id;
  return target_id;
end;
$$;

create function public.owner_complete_current(p_queue_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  perform 1 from public.queues where id = p_queue_id and owner_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'Queue not found or forbidden'; end if;
  update public.queue_entries set status = 'completed', finished_at = now()
    where queue_id = p_queue_id and status = 'serving' returning id into target_id;
  return target_id;
end;
$$;

create function public.owner_skip_entry(p_queue_id uuid, p_entry_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  perform 1 from public.queues where id = p_queue_id and owner_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'Queue not found or forbidden'; end if;
  update public.queue_entries set status = 'skipped', finished_at = now()
    where id = p_entry_id and queue_id = p_queue_id and status in ('waiting', 'serving');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create function public.owner_set_queue_status(p_queue_id uuid, p_status public.queue_status)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.queues set status = p_status where id = p_queue_id and owner_id = auth.uid();
  get diagnostics changed = row_count;
  if changed = 0 then raise exception using errcode = '42501', message = 'Queue not found or forbidden'; end if;
  return true;
end;
$$;

create function public.service_call_next(p_queue_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  perform 1 from public.queues where id = p_queue_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Queue not found'; end if;
  if exists (select 1 from public.queue_entries where queue_id = p_queue_id and status = 'serving') then
    raise exception using errcode = 'P0001', message = 'A customer is already being served';
  end if;
  select id into target_id from public.queue_entries
    where queue_id = p_queue_id and status = 'waiting'
    order by join_order limit 1 for update skip locked;
  if target_id is null then return null; end if;
  update public.queue_entries set status = 'serving', called_at = now() where id = target_id;
  return target_id;
end;
$$;

create function public.service_complete_current(p_queue_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  perform 1 from public.queues where id = p_queue_id for update;
  update public.queue_entries set status = 'completed', finished_at = now()
    where queue_id = p_queue_id and status = 'serving' returning id into target_id;
  return target_id;
end;
$$;

alter table public.queues enable row level security;
alter table public.queue_entries enable row level security;
alter table public.queue_public_state enable row level security;

create policy "owners select queues" on public.queues for select to authenticated
using (owner_id = auth.uid());
create policy "owners create queues" on public.queues for insert to authenticated
with check (owner_id = auth.uid());
create policy "owners update queues" on public.queues for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "owners select entries" on public.queue_entries for select to authenticated
using (exists (select 1 from public.queues q where q.id = queue_id and q.owner_id = auth.uid()));

create policy "public reads revisions" on public.queue_public_state for select to anon, authenticated
using (true);

revoke all on public.queues, public.queue_entries, public.queue_public_state from anon, authenticated;
grant select on public.queue_public_state to anon, authenticated;
grant select, insert, update on public.queues to authenticated;
grant select on public.queue_entries to authenticated;

revoke all on function public.join_queue(text, text, text) from public, anon, authenticated;
revoke all on function public.customer_queue_state(text, text) from public, anon, authenticated;
revoke all on function public.leave_queue(text, text) from public, anon, authenticated;
revoke all on function public.service_call_next(uuid) from public, anon, authenticated;
revoke all on function public.service_complete_current(uuid) from public, anon, authenticated;
grant execute on function public.join_queue(text, text, text) to service_role;
grant execute on function public.customer_queue_state(text, text) to service_role;
grant execute on function public.leave_queue(text, text) to service_role;
grant execute on function public.service_call_next(uuid) to service_role;
grant execute on function public.service_complete_current(uuid) to service_role;

revoke all on function public.owner_call_next(uuid) from public, anon;
revoke all on function public.owner_complete_current(uuid) from public, anon;
revoke all on function public.owner_skip_entry(uuid, uuid) from public, anon;
revoke all on function public.owner_set_queue_status(uuid, public.queue_status) from public, anon;
grant execute on function public.owner_call_next(uuid) to authenticated;
grant execute on function public.owner_complete_current(uuid) to authenticated;
grant execute on function public.owner_skip_entry(uuid, uuid) to authenticated;
grant execute on function public.owner_set_queue_status(uuid, public.queue_status) to authenticated;

insert into public.queues (id, owner_id, name, slug, average_service_minutes)
values ('00000000-0000-4000-8000-000000000001', null, 'QueueLite Demo', 'demo', 10);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'queue_public_state'
  ) then alter publication supabase_realtime add table public.queue_public_state; end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'queue_entries'
  ) then alter publication supabase_realtime add table public.queue_entries; end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'queues'
  ) then alter publication supabase_realtime add table public.queues; end if;
end $$;
