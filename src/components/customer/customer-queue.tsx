"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { CustomerQueueState, Queue } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { InlineAlert } from "@/components/inline-alert";

type SafeQueue = Pick<Queue, "id" | "name" | "slug" | "status" | "average_service_minutes">;

export function CustomerQueue({ initialState }: { initialState: CustomerQueueState }) {
  const initialQueue: SafeQueue = initialState.queue;
  const [state, setState] = useState<CustomerQueueState>(initialState);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/queues/${initialQueue.slug}/me`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not refresh your queue status.");
      setState(await response.json() as CustomerQueueState);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh your queue status.");
    }
  }, [initialQueue.slug]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`queue-public-${initialQueue.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "queue_public_state", filter: `queue_id=eq.${initialQueue.id}` }, () => void refresh())
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") void refresh();
      });
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [initialQueue.id, refresh]);

  function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/public/queues/${initialQueue.slug}/join`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }),
      });
      const body = await response.json() as CustomerQueueState & { error?: string };
      if (!response.ok) return setError(body.error ?? "Could not join the queue.");
      setState(body);
    });
  }

  function leave() {
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/public/queues/${initialQueue.slug}/leave`, { method: "POST" });
      const body = await response.json() as CustomerQueueState & { error?: string };
      if (!response.ok) return setError(body.error ?? "Could not leave the queue.");
      setState(body);
    });
  }

  const active = state.entry?.status === "waiting" || state.entry?.status === "serving";

  return (
    <main className="container-page max-w-2xl py-10 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="eyebrow">Public queue</p><h1 className="mt-2 text-3xl font-black tracking-tight">{state.queue.name}</h1></div>
        <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${connected ? "bg-green-500" : "bg-amber-500"}`} /><span className="text-xs font-bold text-neutral-500">{connected ? "Live" : "Reconnecting"}</span></div>
      </div>
      {error && <div className="mb-4"><InlineAlert>{error}</InlineAlert></div>}

      {active && state.entry ? (
        <section className="card overflow-hidden">
          <div className="bg-green-900 p-7 text-white sm:p-9">
            <div className="flex items-center justify-between gap-4"><p className="font-bold text-green-100">Hi, {state.entry.customer_name}</p><StatusBadge status={state.entry.status} /></div>
            {state.entry.status === "serving" ? (
              <><h2 className="mt-8 text-4xl font-black tracking-tight">It’s your turn</h2><p className="mt-3 text-green-100">Please make your way to the service point.</p></>
            ) : (
              <><p className="mt-8 text-sm font-bold uppercase tracking-wider text-green-200">Your position</p><p className="mt-1 text-7xl font-black">{state.position}</p></>
            )}
          </div>
          {state.entry.status === "waiting" && (
            <div className="grid grid-cols-2 divide-x divide-black/8">
              <div className="p-6"><p className="text-2xl font-black">{state.peopleAhead}</p><p className="mt-1 text-sm text-neutral-500">people ahead</p></div>
              <div className="p-6"><p className="text-2xl font-black">~{state.estimatedWaitMinutes} min</p><p className="mt-1 text-sm text-neutral-500">estimated wait</p></div>
            </div>
          )}
          <div className="border-t border-black/8 p-5 text-right"><button className="button button-secondary" disabled={pending} onClick={leave}>Leave queue</button></div>
        </section>
      ) : (
        <section className="card p-6 sm:p-8">
          {state.entry && <div className="mb-6"><InlineAlert tone="success">Your previous entry is {state.entry.status}. You can join again when you’re ready.</InlineAlert></div>}
          {state.queue.status === "open" ? (
            <form onSubmit={join}>
              <h2 className="text-2xl font-black">Join the line</h2>
              <p className="mt-2 text-neutral-600">No account needed. We’ll remember this entry on this device.</p>
              <label className="label mt-7" htmlFor="customer-name">Your name</label>
              <input className="input" id="customer-name" maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ada" required />
              <button className="button mt-4 w-full" disabled={pending}>{pending ? "Joining…" : "Join queue"}</button>
              <p className="mt-4 text-center text-xs text-neutral-500">Average service time: {state.queue.average_service_minutes} minutes</p>
            </form>
          ) : (
            <div className="py-5 text-center"><StatusBadge status={state.queue.status} /><h2 className="mt-5 text-2xl font-black">Joining is {state.queue.status}</h2><p className="mt-2 text-neutral-600">Please check back later.</p></div>
          )}
        </section>
      )}
    </main>
  );
}
