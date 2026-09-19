"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { InlineAlert } from "@/components/inline-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoginForm({ oauthFailed = false }: { oauthFailed?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "openid email profile",
        },
      });
      if (oauthError) throw oauthError;
    } catch {
      setError("Google sign-in could not be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <Card className="p-5 sm:p-8">
      <div>
        <p className="text-sm font-semibold text-green-700">Business owners</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-neutral-950">Sign in to QueueLite</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Use your Google account to securely access and manage your queues.</p>
        {(oauthFailed || error) && (
          <div className="mt-5">
            <InlineAlert>{error || "Google sign-in did not complete. Please try again."}</InlineAlert>
          </div>
        )}
        <Button
          className="mt-6"
          variant="secondary"
          full
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={signInWithGoogle}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z" />
            <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
          </svg>
          {pending ? "Connecting to Google…" : "Continue with Google"}
        </Button>
      </div>
    </Card>
  );
}
