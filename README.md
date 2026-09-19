# QueueLite

QueueLite is a lightweight digital waiting line for small walk-in businesses. Owners create and manage queues; customers join through a public link without making an account and see their position update live.

## What is included

- Next.js App Router, TypeScript, and Tailwind CSS
- Supabase Postgres, Google Auth, Row Level Security, and Realtime
- Transaction-safe join ordering and queue transitions in Postgres
- Secure anonymous customer identity using a random HttpOnly cookie and a stored SHA-256 hash
- Owner queue creation, pause/open/close, call next, complete, skip, and queue settings
- Public queue status, position, people ahead, estimated wait, leave, and live updates
- Copyable public links and downloadable QR codes
- A development-only demo admin at `/admin`
- Filtered realtime revision subscriptions with authoritative state refetches

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

Supabase Auth must allow both QueueLite callback URLs:

```text
http://localhost:3000/auth/callback
https://quelite.vercel.app/auth/callback
```

Set `NEXT_PUBLIC_APP_URL=https://quelite.vercel.app` in Vercel. The login page uses Google OAuth, while the existing server callback exchanges the authorization code and stores the Supabase session in cookies. A signed-in owner can create queues from `/dashboard`.

Follow [the Google OAuth setup guide](docs/google-oauth.md) before testing sign-in.

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

## Realtime behavior

Both customer and owner screens subscribe to the current queue's row in `queue_public_state`. Database triggers increment its revision whenever visible queue state changes. A realtime event invalidates the client view, which then refetches the authoritative state from a no-cache endpoint.

The clients also refetch after reconnecting, returning online, or becoming visible. They do not continuously poll. If a channel cannot reconnect, the UI marks the data as stale and exposes a manual refresh action.

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
| `/login` | Owner Google sign-in |
| `/dashboard` | Owner queue list |
| `/dashboard/queues/new` | Queue creation |
| `/dashboard/queues/[id]` | Live owner controls |
| `/q/[slug]` | Public customer queue |
| `/admin` | Development-only demo controls |
