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
import { ConfirmDialog } from "@/components/ui/modal";

const terminalCopy = {
  completed: "Your visit is complete. You can join again whenever you need to.",
  skipped: "You were removed from this queue. You can join again if the queue is open.",
  left: "You left this queue. You can join again if you still need service.",
};

export function CustomerQueue({ initialState }: { initialState: CustomerQueueState }) {
  const [state, setState] = useState(initialState);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const refresh = useCallback(async () => { try { const response = await fetch(`/api/public/queues/${initialState.queue.slug}/me`, { cache: "no-store" }); if (!response.ok) throw new Error("Could not refresh your queue status."); setState(await response.json() as CustomerQueueState); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not refresh your queue status."); } }, [initialState.queue.slug]);
  const { connection, refresh: refreshNow } = useQueueRealtime(initialState.queue.id, refresh);

  function join(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); startTransition(async () => { const response = await fetch(`/api/public/queues/${initialState.queue.slug}/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }); const body = await response.json() as CustomerQueueState & { error?: string }; if (!response.ok) return setError(body.error ?? "Could not join the queue."); setState(body); }); }
  function leave() { setLeaveOpen(false); setError(""); startTransition(async () => { const response = await fetch(`/api/public/queues/${initialState.queue.slug}/leave`, { method: "POST" }); const body = await response.json() as CustomerQueueState & { error?: string }; if (!response.ok) return setError(body.error ?? "Could not leave the queue."); setState(body); }); }

  const active = state.entry?.status === "waiting" || state.entry?.status === "serving";
  const preJoinEstimate = state.waitingCount * state.queue.average_service_minutes;
  return <main className="container-narrow py-7 sm:py-12">
    <header className="mb-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-[#667069]">Public queue</p><h1 className="mt-1 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">{state.queue.name}</h1></div><StatusBadge status={state.queue.status} /></div><div className="mt-4 flex items-center justify-between border-t border-[#dde3dd] pt-4"><p className="text-sm text-[#667069]"><strong className="font-semibold text-[#17201a]">{state.waitingCount}</strong> {state.waitingCount === 1 ? "person" : "people"} waiting</p><RealtimeStatus state={connection} onRefresh={() => void refreshNow()} /></div></header>
    {error && <div className="mb-4"><InlineAlert>{error}</InlineAlert></div>}

    {active && state.entry ? <Card className="overflow-hidden">{state.entry.status === "serving" ? <div className="border-l-4 border-[#17643a] bg-[#edf6f0] px-6 py-9 sm:px-8 sm:py-11"><div className="flex items-center justify-between gap-4"><p className="text-sm font-medium text-[#3f4942]">Hi, {state.entry.customer_name}</p><StatusBadge status="serving" /></div><p className="mt-10 text-sm font-semibold uppercase tracking-[.1em] text-[#17643a]">Now serving</p><h2 className="mt-2 text-4xl font-bold tracking-[-.04em] text-[#17201a] sm:text-5xl">It’s your turn</h2><p className="mt-3 max-w-sm text-base leading-7 text-[#3f4942]">Please make your way to the service point.</p></div> : <><div className="px-6 py-8 sm:px-8 sm:py-10"><div className="flex items-center justify-between gap-4"><p className="text-sm font-medium text-[#667069]">Hi, {state.entry.customer_name}</p><StatusBadge status="waiting" /></div><p className="mt-9 text-xs font-semibold uppercase tracking-[.1em] text-[#17643a]">Your position</p><p className="mt-1 text-7xl font-bold tabular-nums tracking-[-.06em] text-[#17201a] sm:text-8xl">{state.position}</p><p className="mt-3 text-sm text-[#667069]">We’ll update this page automatically as the line moves.</p></div><div className="grid grid-cols-2 border-t border-[#dde3dd] bg-[#f6f7f5]"><div className="border-r border-[#dde3dd] p-5 sm:p-6"><Metric value={state.peopleAhead ?? 0} label="people ahead" /></div><div className="p-5 sm:p-6"><Metric value={`~${state.estimatedWaitMinutes ?? 0} min`} label="estimated wait" /></div></div></>}<div className="border-t border-[#dde3dd] px-5 py-4 text-right"><Button variant="quiet" className="text-[#b42318] hover:bg-[#fef3f2]" disabled={pending} onClick={() => setLeaveOpen(true)}>Leave queue</Button></div></Card> : <Card className="p-5 sm:p-8">{state.entry && <div className="mb-6"><InlineAlert tone={state.entry.status === "completed" ? "success" : "neutral"}>{terminalCopy[state.entry.status as keyof typeof terminalCopy] ?? `Your previous visit is ${state.entry.status}.`}</InlineAlert></div>}{state.queue.status === "open" ? <><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#dde3dd] bg-[#dde3dd]"><div className="bg-[#f6f7f5] p-4"><Metric value={state.waitingCount} label="waiting now" /></div><div className="bg-[#f6f7f5] p-4"><Metric value={`~${preJoinEstimate} min`} label="estimated wait" /></div></div><form onSubmit={join} className="mt-7"><h2 className="text-2xl font-semibold tracking-[-.025em] text-[#17201a]">Join the queue</h2><p className="mt-2 text-sm leading-6 text-[#667069]">Enter your name to hold your place. No account is needed.</p><label className="field-label mt-6" htmlFor="customer-name">Your name</label><input className="text-input" id="customer-name" maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ada" required /><Button className="mt-4" full disabled={pending}>{pending ? "Joining…" : "Join Queue"}</Button><p className="mt-4 text-center text-xs leading-5 text-[#667069]">Estimate based on {state.queue.average_service_minutes} minutes per person.</p></form></> : <div className="py-5 text-center"><StatusBadge status={state.queue.status} /><h2 className="mt-5 text-2xl font-semibold tracking-[-.025em] text-[#17201a]">This queue is {state.queue.status}</h2><p className="mt-2 text-sm leading-6 text-[#667069]">The business is not accepting new customers right now. Keep this page open and we’ll update it when that changes.</p></div>}</Card>}
    <p className="mt-6 text-center text-xs text-[#667069]">Powered by QueueLite</p>
    <ConfirmDialog open={leaveOpen} title="Leave this queue?" description="You will lose your current place and cannot restore it." confirmLabel="Leave queue" danger pending={pending} onClose={() => setLeaveOpen(false)} onConfirm={leave} />
  </main>;
}
