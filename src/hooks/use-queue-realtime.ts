"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { RealtimeConnectionState } from "@/lib/types";

const RETRY_DELAYS = [1_000, 2_000, 5_000, 10_000, 30_000];

export function useQueueRealtime(queueId: string, onRefresh: () => Promise<void>) {
  const [connection, setConnection] = useState<RealtimeConnectionState>("connecting");
  const refreshRef = useRef(onRefresh);
  const refreshingRef = useRef(false);
  const refreshQueuedRef = useRef(false);

  useEffect(() => { refreshRef.current = onRefresh; }, [onRefresh]);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) {
      refreshQueuedRef.current = true;
      return;
    }
    refreshingRef.current = true;
    try {
      do {
        refreshQueuedRef.current = false;
        await refreshRef.current();
      } while (refreshQueuedRef.current);
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const refreshSafely = () => {
      void refresh().catch(() => {
        if (active) setConnection(navigator.onLine ? "reconnecting" : "offline");
      });
    };

    const connect = () => {
      if (!active) return;
      setConnection(attempt === 0 ? "connecting" : "reconnecting");
      channel = supabase
        .channel(`queue-state-${queueId}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "queue_public_state",
            filter: `queue_id=eq.${queueId}`,
          },
          refreshSafely,
        )
        .subscribe((status) => {
          if (!active) return;
          if (status === "SUBSCRIBED") {
            attempt = 0;
            setConnection("live");
            refreshSafely();
            return;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnection(navigator.onLine ? "reconnecting" : "offline");
            const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
            attempt += 1;
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(async () => {
              if (channel) await supabase.removeChannel(channel);
              connect();
            }, delay);
          }
        });
    };

    const handleOnline = () => { setConnection("reconnecting"); refreshSafely(); };
    const handleOffline = () => setConnection("offline");
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshSafely();
    };

    connect();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [queueId, refresh]);

  return { connection, refresh };
}
