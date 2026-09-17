import { notFound } from "next/navigation";
import { isDemoAdminEnabled } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OwnerQueueState, Queue, QueueEntry } from "@/lib/types";

export const DEMO_QUEUE_ID = "00000000-0000-4000-8000-000000000001";

export function assertDemoEnabled() {
  if (!isDemoAdminEnabled()) notFound();
}

export async function getDemoState(): Promise<OwnerQueueState> {
  const supabase = createAdminClient();
  const [{ data: queue, error: queueError }, { data: entries, error: entriesError }] = await Promise.all([
    supabase.from("queues").select("*").eq("id", DEMO_QUEUE_ID).single(),
    supabase.from("queue_entries").select("id,queue_id,customer_name,join_order,status,joined_at,called_at,finished_at,updated_at").eq("queue_id", DEMO_QUEUE_ID).order("join_order"),
  ]);
  if (queueError || entriesError) throw new Error(queueError?.message ?? entriesError?.message);
  const list = (entries ?? []) as QueueEntry[];
  return {
    queue: queue as Queue,
    serving: list.find((entry) => entry.status === "serving") ?? null,
    waiting: list.filter((entry) => entry.status === "waiting"),
    recent: list.filter((entry) => ["completed", "skipped", "left"].includes(entry.status)).slice(-8).reverse(),
  };
}
