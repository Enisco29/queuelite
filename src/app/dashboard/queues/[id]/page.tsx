import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { QueueManager } from "@/components/owner/queue-manager";
import type { OwnerQueueState, Queue, QueueEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: queue, error: queueError }, { data: entries, error: entriesError }] = await Promise.all([
    supabase.from("queues").select("*").eq("id", id).maybeSingle(),
    supabase.from("queue_entries").select("id,queue_id,customer_name,join_order,status,joined_at,called_at,finished_at,updated_at").eq("queue_id", id).order("join_order"),
  ]);
  if (queueError || entriesError) throw new Error(queueError?.message ?? entriesError?.message);
  if (!queue) notFound();
  const typedEntries = (entries ?? []) as QueueEntry[];
  const state: OwnerQueueState = {
    queue: queue as Queue,
    serving: typedEntries.find((entry) => entry.status === "serving") ?? null,
    waiting: typedEntries.filter((entry) => entry.status === "waiting"),
    recent: typedEntries.filter((entry) => ["completed", "skipped", "left"].includes(entry.status)).slice(-8).reverse(),
  };
  return <QueueManager state={state} publicUrl={`${serverEnv().appUrl}/q/${state.queue.slug}`} />;
}
