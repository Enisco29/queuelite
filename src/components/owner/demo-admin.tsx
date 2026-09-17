"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { OwnerQueueState } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { InlineAlert } from "@/components/inline-alert";

export function DemoAdmin({ initialState }: { initialState: OwnerQueueState }) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const refresh = useCallback(async () => {
    const response = await fetch("/api/demo/state", { cache: "no-store" });
    if (response.ok) setState(await response.json() as OwnerQueueState);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("demo-admin")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "queue_public_state", filter: `queue_id=eq.${initialState.queue.id}` }, () => void refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [initialState.queue.id, refresh]);

  function mutate(path: string) {
    setError(""); setMessage("");
    startTransition(async () => {
      const response = await fetch(path, { method: "POST" });
      const body = await response.json() as { error?: string; empty?: boolean };
      if (!response.ok) setError(body.error ?? "Action failed.");
      else setMessage(body.empty ? "No one is waiting." : "Queue updated.");
      await refresh();
    });
  }

  return <main className="container-page max-w-4xl py-10">
    <div className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900">Development-only admin · Do not expose this route in production.</div>
    <div className="mt-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Demo admin</p><h1 className="mt-2 text-4xl font-black">{state.queue.name}</h1></div><a className="button button-secondary" href="/q/demo" target="_blank">Open customer page</a></div>
    {(error || message) && <div className="mt-5"><InlineAlert tone={error ? "error" : "success"}>{error || message}</InlineAlert></div>}
    <section className="card mt-8 overflow-hidden"><div className="border-b border-black/8 p-6"><p className="eyebrow">Now serving</p></div>{state.serving ? <div className="bg-green-900 p-7 text-white"><div className="flex items-center justify-between"><p className="text-3xl font-black">{state.serving.customer_name}</p><StatusBadge status="serving" /></div><button className="button mt-6 bg-lime-300 text-green-950 hover:bg-lime-200" disabled={pending} onClick={() => mutate("/api/demo/complete")}>Complete customer</button></div> : <div className="p-7"><p className="font-bold text-neutral-600">No customer is being served.</p><button className="button mt-5" disabled={pending || state.waiting.length === 0} onClick={() => mutate("/api/demo/call-next")}>Call next</button></div>}</section>
    <section className="card mt-6 overflow-hidden"><div className="border-b border-black/8 p-6"><p className="eyebrow">Waiting · {state.waiting.length}</p></div>{state.waiting.length ? <ol className="divide-y divide-black/8">{state.waiting.map((entry, index) => <li className="flex items-center gap-4 p-5" key={entry.id}><span className="flex size-9 items-center justify-center rounded-full bg-green-50 font-black text-green-800">{index + 1}</span><span className="font-black">{entry.customer_name}</span></li>)}</ol> : <p className="p-8 text-center text-neutral-500">No one is waiting.</p>}</section>
  </main>;
}
