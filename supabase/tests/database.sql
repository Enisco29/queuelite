begin;
select plan(9);

select has_table('public', 'queues', 'queues exists');
select has_table('public', 'queue_entries', 'entries exists');
select has_table('public', 'queue_public_state', 'public state exists');
select has_index('public', 'queue_entries', 'queue_entries_one_serving_idx', 'single serving index exists');
select col_is_null('public', 'queues', 'owner_id', 'owner is nullable for demo migration');
select function_returns('public', 'join_queue', array['text', 'text', 'text'], 'queue_entries', 'join RPC exists');
select policies_are('public', 'queue_entries', array['owners select entries'], 'entries expose only owner selection policy');
select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'queue_entries'
  ),
  'entries are in the realtime publication'
);
select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'queue_public_state'
  ),
  'public state is in the realtime publication'
);

select * from finish();
rollback;
