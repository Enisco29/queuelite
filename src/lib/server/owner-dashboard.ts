import { requireOwnerSession } from "@/lib/server/auth";
import type { OwnerQueueSummary, Queue, QueueEntry } from "@/lib/types";

export async function getOwnerQueueSummaries(): Promise<OwnerQueueSummary[]> {
  const { supabase } = await requireOwnerSession();
  const { data: queueRows, error: queueError } = await supabase.from("queues").select("*").order("created_at", { ascending: false });
  if (queueError) throw new Error(queueError.message);
  const queues = (queueRows ?? []) as Queue[];
  if (!queues.length) return [];
  const { data: entryRows, error: entryError } = await supabase.from("queue_entries").select("id,queue_id,customer_name,status,join_order").in("queue_id", queues.map((queue) => queue.id)).in("status", ["waiting", "serving"]).order("join_order");
  if (entryError) throw new Error(entryError.message);
  const entries = (entryRows ?? []) as Pick<QueueEntry, "id" | "queue_id" | "customer_name" | "status" | "join_order">[];
  const summaries = queues.map((queue) => {
    const active = entries.filter((entry) => entry.queue_id === queue.id);
    const waitingCount = active.filter((entry) => entry.status === "waiting").length;
    const serving = active.find((entry) => entry.status === "serving") ?? null;
    return { queue, waitingCount, serving: serving ? { id: serving.id, customer_name: serving.customer_name } : null, estimatedWaitMinutes: (waitingCount + (serving ? 1 : 0)) * queue.average_service_minutes };
  });
  const statusOrder = { open: 0, paused: 1, closed: 2 };
  return summaries.sort((a, b) => statusOrder[a.queue.status] - statusOrder[b.queue.status]);
}
