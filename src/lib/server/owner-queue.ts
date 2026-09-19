import { createClient } from "@/lib/supabase/server";
import type { OwnerQueueState, Queue, QueueEntry } from "@/lib/types";

export async function getOwnerQueueState(queueId: string): Promise<OwnerQueueState | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: queue, error: queueError }, { data: entries, error: entriesError }] = await Promise.all([
    supabase.from("queues").select("*").eq("id", queueId).maybeSingle(),
    supabase
      .from("queue_entries")
      .select("id,queue_id,customer_name,join_order,status,joined_at,called_at,finished_at,updated_at")
      .eq("queue_id", queueId)
      .order("join_order"),
  ]);

  if (queueError || entriesError) throw new Error(queueError?.message ?? entriesError?.message);
  if (!queue) return null;

  const list = (entries ?? []) as QueueEntry[];
  return {
    queue: queue as Queue,
    serving: list.find((entry) => entry.status === "serving") ?? null,
    waiting: list.filter((entry) => entry.status === "waiting"),
    recent: list
      .filter((entry) => ["completed", "skipped", "left"].includes(entry.status))
      .slice(-8)
      .reverse(),
  };
}
