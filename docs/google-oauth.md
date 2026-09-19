# Google OAuth for Supabase Auth

QueueLite uses Google OAuth through Supabase Auth. The browser starts the OAuth flow, Google returns to Supabase, and Supabase redirects to QueueLite so the server can exchange the authorization code for a cookie-backed session.

## 1. Configure Google Auth Platform

Create a **Web application** OAuth client with an **External** audience. Publish it for production access and request only the standard `openid`, email, and profile scopes.

Authorized JavaScript origins:

```text
http://localhost:3000
https://quelite.vercel.app
```

For the authorized redirect URI, copy the exact callback displayed in Supabase Dashboard under Authentication → Providers → Google. It normally has this shape:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Do not register QueueLite's `/auth/callback` as Google's redirect URI. Google returns to Supabase first.

## 2. Enable Google in Supabase

In Supabase Dashboard, open Authentication → Providers → Google:

1. Enable the provider.
2. Enter the Google OAuth client ID and client secret.
3. Save the provider configuration.

In Authentication → URL Configuration, set:

```text
Site URL: https://quelite.vercel.app

Redirect URLs:
http://localhost:3000/auth/callback
https://quelite.vercel.app/auth/callback
```

Supabase redirects to one of these application callbacks after Google authentication. QueueLite then calls `exchangeCodeForSession()` on the server and redirects to `/dashboard` only after a successful exchange.

## 3. Configure deployment

Set this Vercel production environment variable and redeploy:

```text
NEXT_PUBLIC_APP_URL=https://quelite.vercel.app
```

The Google client secret belongs only in Supabase and Google Cloud. Do not add it to QueueLite or expose it through a `NEXT_PUBLIC_*` variable.

## 4. Verify authentication

- Sign in with a new Google account and confirm `/dashboard` loads.
- Cancel consent and confirm QueueLite shows a friendly sign-in error.
- Sign out, refresh, and confirm `/dashboard` redirects to `/login`.
- Test both production and localhost callbacks.
- For an email previously used with magic-link authentication, record the Supabase user ID and owned queue IDs before signing in with Google. Confirm the same user ID and queues remain afterward. If a duplicate user appears, diagnose Supabase identity linking instead of changing queue ownership, schema, or RLS.
