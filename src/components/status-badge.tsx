import type { EntryStatus, QueueStatus } from "@/lib/types";

const styles: Record<EntryStatus | QueueStatus, string> = {
  open: "border-green-200 bg-green-50 text-green-800",
  paused: "border-amber-200 bg-amber-50 text-amber-800",
  closed: "border-neutral-300 bg-neutral-100 text-neutral-700",
  waiting: "border-blue-200 bg-blue-50 text-blue-800",
  serving: "border-green-200 bg-green-100 text-green-900",
  completed: "border-green-200 bg-green-50 text-green-800",
  skipped: "border-orange-200 bg-orange-50 text-orange-800",
  left: "border-neutral-300 bg-neutral-100 text-neutral-700",
};

export function StatusBadge({ status, inverse = false }: { status: EntryStatus | QueueStatus; inverse?: boolean }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${inverse ? "border-white/20 bg-white/10 text-white" : styles[status]}`}>{status}</span>;
}
