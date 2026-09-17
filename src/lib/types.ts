export type QueueStatus = "open" | "paused" | "closed";
export type EntryStatus = "waiting" | "serving" | "completed" | "skipped" | "left";

export interface Queue {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  status: QueueStatus;
  average_service_minutes: number;
  next_join_order: number;
  created_at: string;
  updated_at: string;
}

export interface QueueEntry {
  id: string;
  queue_id: string;
  customer_name: string;
  join_order: number;
  status: EntryStatus;
  joined_at: string;
  called_at: string | null;
  finished_at: string | null;
  updated_at: string;
}

export interface CustomerQueueState {
  queue: Pick<Queue, "id" | "name" | "slug" | "status" | "average_service_minutes">;
  entry: Pick<QueueEntry, "id" | "customer_name" | "status" | "joined_at"> | null;
  position: number | null;
  peopleAhead: number | null;
  estimatedWaitMinutes: number | null;
}

export interface OwnerQueueState {
  queue: Queue;
  serving: QueueEntry | null;
  waiting: QueueEntry[];
  recent: QueueEntry[];
}
