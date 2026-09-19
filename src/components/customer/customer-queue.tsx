"use client";

import { useCallback, useState, useTransition } from "react";
import type { CustomerQueueState } from "@/lib/types";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { StatusBadge } from "@/components/status-badge";
import { InlineAlert } from "@/components/inline-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { RealtimeStatus } from "@/components/ui/realtime-status";

export function CustomerQueue({ initialState }: { initialState: CustomerQueueState }) {
  const [state, setState] = useState(initialState);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/queues/${initialState.queue.slug}/me`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not refresh your queue status.");
      setState(await response.json() as CustomerQueueState);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh your queue status.");
    }
  }, [initialState.queue.slug]);

  const { connection, refresh: refreshNow } = useQueueRealtime(initialState.queue.id, refresh);

  function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/public/queues/${initialState.queue.slug}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await response.json() as CustomerQueueState & { error?: string };
      if (!response.ok) return setError(body.error ?? "Could not join the queue.");
      setState(body);
    });
  }

  function leave() {
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/public/queues/${initialState.queue.slug}/leave`, { method: "POST" });
      const body = await response.json() as CustomerQueueState & { error?: string };
      if (!response.ok) return setError(body.error ?? "Could not leave the queue.");
      setState(body);
    });
  }

  const active = state.entry?.status === "waiting" || state.entry?.status === "serving";

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:py-14">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-500">Public queue</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-neutral-950 sm:text-4xl">{state.queue.name}</h1>
          </div>
          <StatusBadge status={state.queue.status} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
          <p className="text-sm text-neutral-600"><strong className="font-bold text-neutral-950">{state.waitingCount}</strong> {state.waitingCount === 1 ? "person" : "people"} waiting</p>
          <RealtimeStatus state={connection} onRefresh={() => void refreshNow()} />
        </div>
      </header>

      {error && <div className="mb-4"><InlineAlert>{error}</InlineAlert></div>}

      {active && state.entry ? (
        <Card className="overflow-hidden">
          {state.entry.status === "serving" ? (
            <div className="bg-green-800 px-6 py-10 text-white sm:px-8 sm:py-12">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-green-100">Hi, {state.entry.customer_name}</p>
                <StatusBadge status="serving" inverse />
              </div>
              <p className="mt-12 text-sm font-bold uppercase tracking-[.14em] text-green-200">Now serving</p>
              <h2 className="mt-2 text-4xl font-bold tracking-[-.045em] sm:text-5xl">It’s your turn</h2>
              <p className="mt-3 max-w-sm text-base leading-7 text-green-100">Please make your way to the service point.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-neutral-600">Hi, {state.entry.customer_name}</p>
                  <StatusBadge status="waiting" />
                </div>
                <p className="mt-10 text-xs font-bold uppercase tracking-[.14em] text-green-700">Your position</p>
                <p className="mt-1 text-8xl font-bold tabular-nums tracking-[-.07em] text-neutral-950">{state.position}</p>
              </div>
              <div className="grid grid-cols-2 border-t border-neutral-200 bg-neutral-50/60">
                <div className="border-r border-neutral-200 p-5 sm:p-6"><Metric value={state.peopleAhead ?? 0} label="people ahead" /></div>
                <div className="p-5 sm:p-6"><Metric value={`~${state.estimatedWaitMinutes ?? 0} min`} label="estimated wait" /></div>
              </div>
            </>
          )}
          <div className="border-t border-neutral-200 px-5 py-4 text-right">
            <Button variant="quiet" disabled={pending} onClick={leave}>Leave queue</Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 sm:p-8">
          {state.entry && <div className="mb-6"><InlineAlert tone="success">Your previous visit is {state.entry.status}. You can join again when you’re ready.</InlineAlert></div>}
          {state.queue.status === "open" ? (
            <form onSubmit={join}>
              <h2 className="text-2xl font-bold tracking-[-.03em] text-neutral-950">Join the queue</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Enter your name to hold your place. No account is needed.</p>
              <label className="field-label mt-7" htmlFor="customer-name">Your name</label>
              <input className="text-input" id="customer-name" maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ada" required />
              <Button className="mt-4" full disabled={pending}>{pending ? "Joining…" : "Join queue"}</Button>
              <p className="mt-4 text-center text-xs leading-5 text-neutral-500">Typical service time is about {state.queue.average_service_minutes} minutes per person.</p>
            </form>
          ) : (
            <div className="py-5 text-center">
              <StatusBadge status={state.queue.status} />
              <h2 className="mt-5 text-2xl font-bold tracking-[-.03em] text-neutral-950">This queue is {state.queue.status}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">The business is not accepting new customers right now. Keep this page open and we’ll update it when the queue changes.</p>
            </div>
          )}
        </Card>
      )}
      <p className="mt-6 text-center text-xs text-neutral-500">Powered by QueueLite</p>
    </main>
  );
}
