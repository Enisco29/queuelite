"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { callNext, completeCurrent, setQueueStatus, skipEntry, updateQueueSettings } from "@/app/dashboard/actions";
import type { OwnerQueueState, QueueStatus } from "@/lib/types";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { InlineAlert } from "@/components/inline-alert";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RealtimeStatus } from "@/components/ui/realtime-status";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { QueueQrCode } from "./queue-qr-code";

type Result = { error: string; empty?: boolean };
type Confirmation = { title: string; description: string; label: string; success: string; danger?: boolean; action: () => Promise<Result> };

export function QueueManager({ state: initialState, publicUrl }: { state: OwnerQueueState; publicUrl: string }) {
  const [state, setState] = useState(initialState);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const refreshState = useCallback(async () => {
    const response = await fetch(`/api/owner/queues/${initialState.queue.id}/state`, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not refresh the queue.");
    setState(await response.json() as OwnerQueueState);
  }, [initialState.queue.id]);
  const { connection, refresh } = useQueueRealtime(initialState.queue.id, refreshState);

  function run(operation: () => Promise<Result>, success: string) {
    setError(""); setMessage("");
    startTransition(async () => {
      const result = await operation();
      if (result.error) setError(result.error);
      else setMessage(result.empty ? "No one is waiting right now." : success);
      try { await refresh(); } catch { setError("The action succeeded, but the latest queue could not be loaded."); }
    });
  }
  function changeStatus(status: QueueStatus) { run(() => setQueueStatus(state.queue.id, status), status === "open" ? "Queue opened." : `Queue ${status}.`); }
  function confirmAction() { if (!confirmation) return; const current = confirmation; setConfirmation(null); run(current.action, current.success); }
  async function copyLink() { try { await navigator.clipboard.writeText(publicUrl); setMessage("Public link copied."); } catch { setError("Could not copy the link. Select and copy it manually."); } }

  const estimatedWait = (state.waiting.length + (state.serving ? 1 : 0)) * state.queue.average_service_minutes;
  const primaryAction = state.serving
    ? <Button full disabled={pending} onClick={() => run(() => completeCurrent(state.queue.id), "Customer completed.")}>Complete service</Button>
    : <Button full disabled={pending || state.waiting.length === 0} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</Button>;

  return <div className="pb-24 lg:pb-0">
    <nav className="mb-6 flex items-center gap-2 text-sm text-[#667069]" aria-label="Breadcrumb"><Link className="interactive rounded hover:text-[#17201a] focus-visible:outline-none" href="/dashboard">Dashboard</Link><span aria-hidden="true">/</span><Link className="interactive rounded hover:text-[#17201a] focus-visible:outline-none" href="/dashboard#my-queues">My Queues</Link><span aria-hidden="true">/</span><span className="truncate" aria-current="page">{state.queue.name}</span></nav>
    <header className="flex flex-col gap-5 border-b border-[#dde3dd] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold tracking-[-.035em] text-[#17201a] sm:text-4xl">{state.queue.name}</h1><StatusBadge status={state.queue.status} /></div><div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#667069]"><span><strong className="font-semibold text-[#17201a]">{state.waiting.length}</strong> waiting</span><span>~{estimatedWait} min estimated</span><RealtimeStatus state={connection} onRefresh={() => void refresh().catch(() => setError("Could not refresh the latest queue state."))} /></div></div><Button variant="secondary" onClick={() => setShareOpen(true)}>Share queue</Button></header>
    {(error || message) && <div className="mt-5"><InlineAlert tone={error ? "error" : "success"}>{error || message}</InlineAlert></div>}

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card className="overflow-hidden"><SectionHeader eyebrow="Now serving" title={state.serving?.customer_name ?? "No one is being served"} />{state.serving ? <div className="border-l-4 border-[#17643a] px-5 py-6 sm:px-6"><p className="text-sm text-[#667069]">Called at {new Date(state.serving.called_at ?? state.serving.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p><div className="mt-5 flex items-center gap-2"><div className="hidden lg:block"><Button disabled={pending} onClick={() => run(() => completeCurrent(state.queue.id), "Customer completed.")}>Complete service</Button></div><Button variant="quiet" className="text-[#b42318] hover:bg-[#fef3f2]" disabled={pending} onClick={() => setConfirmation({ title: `Skip ${state.serving!.customer_name}?`, description: "They will leave the active queue and cannot be restored.", label: "Skip customer", success: "Customer skipped.", danger: true, action: () => skipEntry(state.queue.id, state.serving!.id) })}>Skip</Button></div></div> : <EmptyState title={state.waiting.length ? "Ready for the next customer" : "The queue is clear"} description={state.waiting.length ? "Call the first person when you are ready to begin service." : "New customers will appear here as soon as they join."} action={state.waiting.length ? <div className="hidden lg:block"><Button disabled={pending} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</Button></div> : undefined} />}</Card>

        <Card className="overflow-hidden"><SectionHeader eyebrow="Waiting" title={`${state.waiting.length} ${state.waiting.length === 1 ? "customer" : "customers"}`} />{state.waiting.length ? <ol className="divide-y divide-[#edf0ed]">{state.waiting.map((entry, index) => <li key={entry.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#edf6f0] text-sm font-semibold tabular-nums text-[#17643a]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#17201a] sm:text-base">{entry.customer_name}</p><p className="mt-0.5 text-xs text-[#667069]">Joined {new Date(entry.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div><Button size="small" variant="quiet" className="text-[#b42318] hover:bg-[#fef3f2]" disabled={pending} onClick={() => setConfirmation({ title: `Remove ${entry.customer_name}?`, description: "They will be removed from the waiting list and cannot be restored.", label: "Remove customer", success: "Customer removed.", danger: true, action: () => skipEntry(state.queue.id, entry.id) })}>Remove</Button></li>)}</ol> : <EmptyState title="No one is waiting" description="Share the public link or QR code so customers can join." action={<Button variant="secondary" onClick={() => setShareOpen(true)}>Share queue</Button>} />}</Card>
      </div>

      <aside className="space-y-5">
        <Card className="p-5"><h2 className="text-base font-semibold text-[#17201a]">Queue controls</h2><p className="mt-1 text-sm leading-6 text-[#667069]">Control whether new customers can join.</p><div className="mt-5 grid gap-2">{state.queue.status !== "open" && <Button full disabled={pending} onClick={() => changeStatus("open")}>Open queue</Button>}{state.queue.status !== "paused" && <Button full variant="secondary" disabled={pending} onClick={() => changeStatus("paused")}>Pause joining</Button>}{state.queue.status !== "closed" && <Button full variant="quiet" className="text-[#b42318] hover:bg-[#fef3f2]" disabled={pending} onClick={() => setConfirmation({ title: "Close this queue?", description: "New customers will not be able to join. Existing customers remain in the queue.", label: "Close queue", success: "Queue closed.", danger: true, action: () => setQueueStatus(state.queue.id, "closed") })}>Close queue</Button>}</div></Card>
        <Card className="p-5"><h2 className="text-base font-semibold text-[#17201a]">At a glance</h2><dl className="mt-4 divide-y divide-[#edf0ed]"><div className="flex items-center justify-between py-3"><dt className="text-sm text-[#667069]">Waiting</dt><dd className="font-semibold tabular-nums">{state.waiting.length}</dd></div><div className="flex items-center justify-between py-3"><dt className="text-sm text-[#667069]">Estimated wait</dt><dd className="font-semibold">~{estimatedWait} min</dd></div><div className="flex items-center justify-between py-3"><dt className="text-sm text-[#667069]">Average service</dt><dd className="font-semibold">{state.queue.average_service_minutes} min</dd></div></dl></Card>
        <details className="rounded-2xl border border-[#dde3dd] bg-white p-5"><summary className="interactive cursor-pointer rounded text-base font-semibold text-[#17201a] focus-visible:outline-none">Queue settings</summary><form className="mt-5 space-y-4" action={(formData) => run(() => updateQueueSettings(state.queue.id, formData), "Settings saved.")}><div><label className="field-label" htmlFor="queue-name">Name</label><input id="queue-name" name="name" className="text-input" defaultValue={state.queue.name} required /></div><div><label className="field-label" htmlFor="average">Average minutes</label><input id="average" name="averageServiceMinutes" className="text-input" type="number" min="1" max="240" defaultValue={state.queue.average_service_minutes} required /></div><Button full disabled={pending}>Save settings</Button></form></details>
        {state.recent.length > 0 && <Card className="p-5"><h2 className="text-base font-semibold text-[#17201a]">Recent activity</h2><ul className="mt-3 divide-y divide-[#edf0ed]">{state.recent.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="truncate font-medium text-[#3f4942]">{entry.customer_name}</span><StatusBadge status={entry.status} /></li>)}</ul></Card>}
      </aside>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#dde3dd] bg-white p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] lg:hidden"><div className="mx-auto max-w-xl">{primaryAction}</div></div>

    <ConfirmDialog open={confirmation !== null} title={confirmation?.title ?? "Confirm action"} description={confirmation?.description ?? ""} confirmLabel={confirmation?.label ?? "Confirm"} danger={confirmation?.danger} pending={pending} onClose={() => setConfirmation(null)} onConfirm={confirmAction} />
    <Modal open={shareOpen} title="Share this queue" description="Customers can open this link or scan the QR code to join." onClose={() => setShareOpen(false)} footer={<><Button variant="secondary" onClick={copyLink}>Copy link</Button><a className={buttonClass("primary")} href={`/q/${state.queue.slug}`} target="_blank" rel="noreferrer">Open public page</a></>}><p className="break-all rounded-xl border border-[#dde3dd] bg-[#f6f7f5] p-3 text-sm text-[#3f4942]">{publicUrl}</p><div className="mt-5 flex justify-center"><QueueQrCode url={publicUrl} name={state.queue.name} /></div></Modal>
  </div>;
}
