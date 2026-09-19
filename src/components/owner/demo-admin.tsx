"use client";

import { useCallback, useState, useTransition } from "react";
import type { OwnerQueueState } from "@/lib/types";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { StatusBadge } from "@/components/status-badge";
import { InlineAlert } from "@/components/inline-alert";
import { RealtimeStatus } from "@/components/ui/realtime-status";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function DemoAdmin({ initialState }: { initialState: OwnerQueueState }) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const refresh = useCallback(async () => { const response = await fetch("/api/demo/state", { cache: "no-store" }); if (response.ok) setState(await response.json() as OwnerQueueState); }, []);
  const { connection, refresh: refreshNow } = useQueueRealtime(initialState.queue.id, refresh);
  function mutate(path: string) { setError(""); setMessage(""); startTransition(async () => { const response = await fetch(path, { method: "POST" }); const body = await response.json() as { error?: string; empty?: boolean }; if (!response.ok) setError(body.error ?? "Action failed."); else setMessage(body.empty ? "No one is waiting." : "Queue updated."); await refresh(); }); }
  return <main className="container-app max-w-4xl py-8 sm:py-10"><div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Development-only admin · Never expose this route in production.</div><header className="mt-7 flex flex-col gap-4 border-b border-[#dde3dd] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[#17643a]">Demo admin</p><h1 className="mt-1 text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">{state.queue.name}</h1><div className="mt-3"><RealtimeStatus state={connection} onRefresh={() => void refreshNow().catch(() => setError("Could not refresh the queue."))} /></div></div><a className={buttonClass("secondary")} href="/q/demo" target="_blank" rel="noreferrer">Open customer page</a></header>{(error || message) && <div className="mt-5"><InlineAlert tone={error ? "error" : "success"}>{error || message}</InlineAlert></div>}<div className="mt-6 space-y-6"><Card className="overflow-hidden"><SectionHeader eyebrow="Now serving" title={state.serving?.customer_name ?? "No one is being served"} />{state.serving ? <div className="border-l-4 border-[#17643a] p-6"><Button disabled={pending} onClick={() => mutate("/api/demo/complete")}>Complete service</Button></div> : <EmptyState title="Ready for the next customer" description={state.waiting.length ? "Call the first person when you are ready." : "No one is waiting right now."} action={state.waiting.length ? <Button disabled={pending} onClick={() => mutate("/api/demo/call-next")}>Call next</Button> : undefined} />}</Card><Card className="overflow-hidden"><SectionHeader eyebrow="Waiting" title={`${state.waiting.length} customers`} />{state.waiting.length ? <ol className="divide-y divide-[#edf0ed]">{state.waiting.map((entry, index) => <li className="flex items-center gap-4 p-5" key={entry.id}><span className="flex size-9 items-center justify-center rounded-lg bg-[#edf6f0] text-sm font-semibold text-[#17643a]">{index + 1}</span><span className="font-semibold text-[#17201a]">{entry.customer_name}</span><StatusBadge status="waiting" /></li>)}</ol> : <EmptyState title="No one is waiting" description="Open the customer page to test the join flow." />}</Card></div></main>;
}
