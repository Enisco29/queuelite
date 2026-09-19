import type { RealtimeConnectionState } from "@/lib/types";

export function RealtimeStatus({ state, onRefresh }: { state: RealtimeConnectionState; onRefresh?: () => void }) {
  const live = state === "live";
  return <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600" role="status">
    <span className={`size-2 rounded-full ${live ? "bg-green-600" : state === "offline" ? "bg-red-500" : "bg-amber-500"}`} />
    <span>{live ? "Live" : state === "offline" ? "Offline" : state === "connecting" ? "Connecting" : "Reconnecting"}</span>
    {!live && onRefresh && <button type="button" onClick={onRefresh} className="ml-1 underline underline-offset-2">Refresh</button>}
  </div>;
}
