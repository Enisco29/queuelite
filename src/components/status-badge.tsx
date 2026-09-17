import type { EntryStatus, QueueStatus } from "@/lib/types";

const styles: Record<EntryStatus | QueueStatus, string> = {
  open: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  closed: "bg-neutral-200 text-neutral-700",
  waiting: "bg-blue-100 text-blue-800",
  serving: "bg-lime-200 text-green-900",
  completed: "bg-green-100 text-green-800",
  skipped: "bg-orange-100 text-orange-800",
  left: "bg-neutral-200 text-neutral-700",
};

export function StatusBadge({ status }: { status: EntryStatus | QueueStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black capitalize ${styles[status]}`}>{status}</span>;
}
