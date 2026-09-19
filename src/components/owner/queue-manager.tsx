"use client";

import { useCallback, useState, useTransition } from "react";
import { callNext, completeCurrent, setQueueStatus, skipEntry, updateQueueSettings } from "@/app/dashboard/actions";
import type { OwnerQueueState, QueueStatus } from "@/lib/types";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { InlineAlert } from "@/components/inline-alert";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Metric } from "@/components/ui/metric";
import { RealtimeStatus } from "@/components/ui/realtime-status";
import { QueueQrCode } from "./queue-qr-code";

export function QueueManager({ state: initialState, publicUrl }: { state: OwnerQueueState; publicUrl: string }) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshState = useCallback(async () => {
    const response = await fetch(`/api/owner/queues/${initialState.queue.id}/state`, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not refresh the queue.");
    setState(await response.json() as OwnerQueueState);
  }, [initialState.queue.id]);

  const { connection, refresh } = useQueueRealtime(initialState.queue.id, refreshState);

  function run(operation: () => Promise<{ error: string; empty?: boolean }>, success: string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await operation();
      if (result.error) setError(result.error);
      else setMessage(result.empty ? "No one is waiting right now." : success);
      try { await refresh(); } catch { setError("The action succeeded, but the latest queue could not be loaded."); }
    });
  }

  function changeStatus(status: QueueStatus) {
    run(() => setQueueStatus(state.queue.id, status), status === "open" ? "Queue opened." : `Queue ${status}.`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("Public link copied.");
    } catch {
      setError("Could not copy the link. Select and copy it manually.");
    }
  }

  const primaryAction = state.serving
    ? <Button full disabled={pending} onClick={() => run(() => completeCurrent(state.queue.id), "Customer completed.")}>Complete service</Button>
    : <Button full disabled={pending || state.waiting.length === 0} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</Button>;

  return (
    <div className="pb-24 lg:pb-0">
      <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-[-.04em] text-neutral-950 sm:text-4xl">{state.queue.name}</h1>
            <StatusBadge status={state.queue.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm text-neutral-600"><strong className="font-bold text-neutral-950">{state.waiting.length}</strong> waiting</p>
            <RealtimeStatus state={connection} onRefresh={() => void refresh().catch(() => setError("Could not refresh the latest queue state."))} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.queue.status !== "open" && <Button disabled={pending} onClick={() => changeStatus("open")}>Open queue</Button>}
          {state.queue.status !== "paused" && <Button variant="secondary" disabled={pending} onClick={() => changeStatus("paused")}>Pause</Button>}
          {state.queue.status !== "closed" && <Button variant="quiet" disabled={pending} onClick={() => { if (window.confirm("Close this queue to new customers? People already waiting will remain.")) changeStatus("closed"); }}>Close</Button>}
        </div>
      </header>

      {(error || message) && <div className="mt-5"><InlineAlert tone={error ? "error" : "success"}>{error || message}</InlineAlert></div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <SectionHeader eyebrow="Now serving" title={state.serving ? state.serving.customer_name : "No one yet"} />
            {state.serving ? (
              <div className="bg-green-800 px-5 py-7 text-white sm:px-6">
                <p className="text-sm text-green-100">Called at {new Date(state.serving.called_at ?? state.serving.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button className="bg-white text-green-900 hover:bg-green-50" disabled={pending} onClick={() => run(() => completeCurrent(state.queue.id), "Customer completed.")}>Complete service</Button>
                  <Button className="border-white/25 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white" variant="secondary" disabled={pending} onClick={() => { if (window.confirm(`Skip ${state.serving?.customer_name}?`)) run(() => skipEntry(state.queue.id, state.serving!.id), "Customer skipped."); }}>Skip</Button>
                </div>
              </div>
            ) : (
              <EmptyState title="Ready for the next customer" description={state.waiting.length ? "Call the first person in the waiting list when you’re ready." : "New customers will appear here as soon as they join."} action={state.waiting.length ? <Button disabled={pending} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</Button> : undefined} />
            )}
          </Card>

          <Card className="overflow-hidden">
            <SectionHeader eyebrow="Waiting" title={`${state.waiting.length} ${state.waiting.length === 1 ? "customer" : "customers"}`} action={!state.serving && state.waiting.length > 0 ? <Button disabled={pending} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</Button> : undefined} />
            {state.waiting.length ? (
              <ol className="divide-y divide-neutral-200">
                {state.waiting.map((entry, index) => (
                  <li key={entry.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold tabular-nums text-green-800">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-950 sm:text-base">{entry.customer_name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">Joined {new Date(entry.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <Button variant="quiet" className="text-red-700 hover:bg-red-50" disabled={pending} onClick={() => { if (window.confirm(`Remove ${entry.customer_name} from the queue?`)) run(() => skipEntry(state.queue.id, entry.id), "Customer removed."); }}>Remove</Button>
                  </li>
                ))}
              </ol>
            ) : <EmptyState title="The queue is clear" description="Share the public link or QR code so customers can join." />}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-green-700">At a glance</p>
            <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-1">
              <Metric value={state.waiting.length} label="waiting" />
              <Metric value={`${state.queue.average_service_minutes} min`} label="average service" />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-[.12em] text-green-700">Share queue</p>
            <p className="mt-3 break-all text-sm leading-6 text-neutral-600">{publicUrl}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={copyLink}>Copy link</Button>
              <a className={buttonClass("primary")} href={`/q/${state.queue.slug}`} target="_blank" rel="noreferrer">Open</a>
            </div>
            <details className="mt-5 border-t border-neutral-200 pt-4">
              <summary className="cursor-pointer text-sm font-bold text-neutral-800">Show QR code</summary>
              <div className="mt-4 flex justify-center"><QueueQrCode url={publicUrl} name={state.queue.name} /></div>
            </details>
          </Card>

          <details className="rounded-2xl border border-neutral-200 bg-white p-5">
            <summary className="cursor-pointer text-sm font-bold text-neutral-950">Queue settings</summary>
            <form className="mt-5 space-y-4" action={(formData) => run(() => updateQueueSettings(state.queue.id, formData), "Settings saved.")}>
              <div><label className="field-label" htmlFor="queue-name">Name</label><input id="queue-name" name="name" className="text-input" defaultValue={state.queue.name} required /></div>
              <div><label className="field-label" htmlFor="average">Average minutes</label><input id="average" name="averageServiceMinutes" className="text-input" type="number" min="1" max="240" defaultValue={state.queue.average_service_minutes} required /></div>
              <Button full disabled={pending}>Save settings</Button>
            </form>
          </details>

          {state.recent.length > 0 && <Card className="p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-neutral-500">Recent</p><ul className="mt-4 space-y-3">{state.recent.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-neutral-800">{entry.customer_name}</span><StatusBadge status={entry.status} /></li>)}</ul></Card>}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto max-w-xl">{primaryAction}</div>
      </div>
    </div>
  );
}
