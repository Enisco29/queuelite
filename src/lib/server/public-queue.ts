import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomerQueueState, Queue } from "@/lib/types";

export type PublicQueue = Pick<Queue, "id" | "name" | "slug" | "status" | "average_service_minutes">;

export async function findPublicQueue(slug: string): Promise<PublicQueue | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("queues")
    .select("id,name,slug,status,average_service_minutes")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as PublicQueue | null;
}

export async function getCustomerState(slug: string, tokenHash: string): Promise<CustomerQueueState | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("customer_queue_state", {
    p_slug: slug,
    p_token_hash: tokenHash,
  });
  if (error) throw error;
  return (data ?? null) as CustomerQueueState | null;
}
