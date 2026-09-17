# QueueLite

QueueLite is a lightweight digital waiting line for small walk-in businesses. Owners create and manage queues; customers join through a public link without making an account and see their position update live.

## What is included

- Next.js App Router, TypeScript, and Tailwind CSS
- Supabase Postgres, email magic-link Auth, Row Level Security, and Realtime
- Transaction-safe join ordering and queue transitions in Postgres
- Secure anonymous customer identity using a random HttpOnly cookie and a stored SHA-256 hash
- Owner queue creation, pause/open/close, call next, complete, skip, and queue settings
- Public queue status, position, people ahead, estimated wait, leave, and live updates
- Copyable public links and downloadable QR codes
- A development-only demo admin at `/admin`

## Local setup

Requirements: Node.js 20+, npm, Docker, and the Supabase CLI.

1. Install packages:

   ```bash
   npm install
   ```

2. Start local Supabase and apply the migration:

   ```bash
   supabase start
   supabase db reset
   ```

3. Copy `.env.example` to `.env.local`. Fill in the API URL, anon key, and service-role key printed by `supabase status`.

4. Start the web app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000/q/demo` for the customer page and `http://localhost:3000/admin` for the prototype admin.

The demo admin requires `ENABLE_DEMO_ADMIN=true` and is always disabled when `NODE_ENV=production`.

## Owner authentication

Supabase email auth must allow this callback URL:

```text
http://localhost:3000/auth/callback
```

Set the matching production URL in Supabase Auth settings and `NEXT_PUBLIC_APP_URL` when deploying. The login page uses email magic links. A signed-in owner can create queues from `/dashboard`.

## Database and security model

The migration in `supabase/migrations` is the source of truth. It creates:

- `queues`, `queue_entries`, and `queue_public_state`
- RLS policies that isolate each owner’s data
- privacy-safe public realtime revisions
- RPCs for joins, leaving, and owner transitions
- a partial unique index that permits only one serving entry per queue

Anonymous web endpoints use the service role only on the server. Never prefix the service-role variable with `NEXT_PUBLIC_` and never expose it in browser code.

The initial schema permits a null owner only for the fixed `demo` slug. Before a production launch that does not need the demo data, remove the demo row and make `queues.owner_id` non-null in a new migration:

```sql
delete from public.queues where slug = 'demo';
alter table public.queues drop constraint queues_owner_required_except_demo;
alter table public.queues alter column owner_id set not null;
```

The included rate limiter is intentionally small and process-local. For a multi-instance public deployment, replace it with a shared edge/Redis-backed limiter.

## Verification

```bash
npm run test
npm run typecheck
npm run lint
npm run build
supabase test db
```

Core manual acceptance check:

1. Join `/q/demo` from two separate browser profiles.
2. Confirm stable positions 1 and 2.
3. Call next from `/admin`; the first customer should see “It’s your turn.”
4. Complete the first customer; the second should move to position 1.
5. Refresh both customer pages and verify their state persists.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Owner magic-link sign-in |
| `/dashboard` | Owner queue list |
| `/dashboard/queues/new` | Queue creation |
| `/dashboard/queues/[id]` | Live owner controls |
| `/q/[slug]` | Public customer queue |
| `/admin` | Development-only demo controls |
