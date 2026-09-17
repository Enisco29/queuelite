"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";
import { InlineAlert } from "@/components/inline-alert";

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, { message: "", error: "" });
  return (
    <form action={action} className="card p-7 sm:p-9">
      <h1 className="text-3xl font-black tracking-tight">Owner sign in</h1>
      <p className="mt-2 text-neutral-600">We’ll email you a magic link. No password needed.</p>
      <label className="label mt-7" htmlFor="email">Email address</label>
      <input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="you@business.com" />
      <button className="button mt-4 w-full" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
      {state.error && <div className="mt-4"><InlineAlert>{state.error}</InlineAlert></div>}
      {state.message && <div className="mt-4"><InlineAlert tone="success">{state.message}</InlineAlert></div>}
    </form>
  );
}
