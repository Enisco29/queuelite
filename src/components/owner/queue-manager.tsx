"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { callNext, completeCurrent, setQueueStatus, skipEntry, updateQueueSettings } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/browser";
import type { OwnerQueueState, QueueStatus } from "@/lib/types";
import { InlineAlert } from "@/components/inline-alert";
import { StatusBadge } from "@/components/status-badge";
import { QueueQrCode } from "./queue-qr-code";

export function QueueManager({ state, publicUrl }: { state: OwnerQueueState; publicUrl: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const refresh = () => router.refresh();
    const channel = supabase.channel(`owner-queue-${state.queue.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries", filter: `queue_id=eq.${state.queue.id}` }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "queues", filter: `id=eq.${state.queue.id}` }, refresh)
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => { void supabase.removeChannel(channel); };
  }, [router, state.queue.id]);

  function run(operation: () => Promise<{ error: string; empty?: boolean }>, success: string) {
    setError(""); setMessage("");
    startTransition(async () => {
      const result = await operation();
      if (result.error) setError(result.error);
      else setMessage(result.empty ? "No one is waiting right now." : success);
      router.refresh();
    });
  }

  function changeStatus(status: QueueStatus) {
    run(() => setQueueStatus(state.queue.id, status), status === "open" ? "Queue opened." : `Queue ${status}.`);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setMessage("Public link copied.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><div className="flex items-center gap-3"><h1 className="text-4xl font-black tracking-tight">{state.queue.name}</h1><StatusBadge status={state.queue.status} /></div><p className="mt-2 text-sm text-neutral-500">{state.waiting.length} waiting · {connected ? "Live" : "Realtime reconnecting"}</p></div>
        <div className="flex flex-wrap gap-2">
          {state.queue.status !== "open" && <button className="button" disabled={pending} onClick={() => changeStatus("open")}>Open</button>}
          {state.queue.status !== "paused" && <button className="button button-secondary" disabled={pending} onClick={() => changeStatus("paused")}>Pause</button>}
          {state.queue.status !== "closed" && <button className="button button-danger" disabled={pending} onClick={() => changeStatus("closed")}>Close</button>}
        </div>
      </div>
      {(error || message) && <div className="mt-5"><InlineAlert tone={error ? "error" : "success"}>{error || message}</InlineAlert></div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b border-black/8 px-6 py-4"><p className="eyebrow">Now serving</p></div>
            {state.serving ? (
              <div className="bg-green-900 p-7 text-white">
                <p className="text-3xl font-black">{state.serving.customer_name}</p><p className="mt-2 text-green-100">Called {new Date(state.serving.called_at ?? state.serving.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <div className="mt-7 flex flex-wrap gap-2"><button className="button bg-lime-300 text-green-950 hover:bg-lime-200" disabled={pending} onClick={() => run(() => completeCurrent(state.queue.id), "Customer completed.")}>Mark completed</button><button className="button bg-white/10 hover:bg-white/20" disabled={pending} onClick={() => { if (window.confirm(`Skip ${state.serving?.customer_name}?`)) run(() => skipEntry(state.queue.id, state.serving!.id), "Customer skipped."); }}>Skip</button></div>
              </div>
            ) : (
              <div className="p-7"><h2 className="text-xl font-black">No one is being served</h2><p className="mt-2 text-neutral-600">Call the first waiting customer when you’re ready.</p><button className="button mt-5" disabled={pending || state.waiting.length === 0} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</button></div>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/8 px-6 py-4"><div><p className="eyebrow">Waiting</p><h2 className="mt-1 text-xl font-black">{state.waiting.length} customer{state.waiting.length === 1 ? "" : "s"}</h2></div>{!state.serving && state.waiting.length > 0 && <button className="button" disabled={pending} onClick={() => run(() => callNext(state.queue.id), "Next customer called.")}>Call next</button>}</div>
            {state.waiting.length ? <ol className="divide-y divide-black/8">{state.waiting.map((entry, index) => <li key={entry.id} className="flex items-center gap-4 p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 font-black text-green-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-black">{entry.customer_name}</p><p className="mt-1 text-xs text-neutral-500">Joined {new Date(entry.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div><button className="text-sm font-bold text-red-700 hover:text-red-900" disabled={pending} onClick={() => run(() => skipEntry(state.queue.id, entry.id), "Customer skipped.")}>Skip</button></li>)}</ol> : <div className="p-9 text-center text-neutral-500">The waiting list is empty.</div>}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card p-6"><p className="eyebrow">Public link</p><p className="mt-3 break-all text-sm font-semibold">{publicUrl}</p><div className="mt-4 flex gap-2"><button className="button button-secondary flex-1" onClick={copyLink}>Copy link</button><a className="button flex-1" href={`/q/${state.queue.slug}`} target="_blank" rel="noreferrer">Open</a></div><div className="mt-6 flex justify-center"><QueueQrCode url={publicUrl} name={state.queue.name} /></div><p className="mt-3 text-center text-xs text-neutral-500">Tap the QR code to download it.</p></section>
          <details className="card p-6"><summary className="cursor-pointer font-black">Queue settings</summary><form className="mt-5 space-y-4" action={(formData) => run(() => updateQueueSettings(state.queue.id, formData), "Settings saved.")}><div><label className="label" htmlFor="queue-name">Name</label><input id="queue-name" name="name" className="input" defaultValue={state.queue.name} required /></div><div><label className="label" htmlFor="average">Average minutes</label><input id="average" name="averageServiceMinutes" className="input" type="number" min="1" max="240" defaultValue={state.queue.average_service_minutes} required /></div><button className="button w-full" disabled={pending}>Save settings</button></form></details>
          {state.recent.length > 0 && <section className="card p-6"><p className="eyebrow">Recent</p><ul className="mt-4 space-y-3">{state.recent.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-semibold">{entry.customer_name}</span><StatusBadge status={entry.status} /></li>)}</ul></section>}
        </aside>
      </div>
    </div>
  );
}
