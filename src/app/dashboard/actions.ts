"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeQueueName, normalizeSlug, parseAverageMinutes } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";
import type { QueueStatus } from "@/lib/types";

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Your session has expired. Please sign in again.");
  return { supabase, user };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createQueue(formData: FormData) {
  const { supabase, user } = await authenticatedClient();
  const name = normalizeQueueName(formData.get("name"));
  const slug = normalizeSlug(formData.get("slug"));
  const average = parseAverageMinutes(formData.get("averageServiceMinutes"));
  const { data, error } = await supabase.from("queues").insert({
    owner_id: user.id, name, slug, average_service_minutes: average,
  }).select("id").single();
  if (error) {
    if (error.code === "23505") throw new Error("That public link is already taken.");
    throw new Error(error.message);
  }
  redirect(`/dashboard/queues/${data.id}`);
}

export async function setQueueStatus(queueId: string, status: QueueStatus) {
  if (!["open", "paused", "closed"].includes(status)) return { error: "Invalid queue status." };
  try {
    const { supabase } = await authenticatedClient();
    const { error } = await supabase.rpc("owner_set_queue_status", { p_queue_id: queueId, p_status: status });
    if (error) throw error;
    revalidatePath(`/dashboard/queues/${queueId}`);
    return { error: "" };
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not update the queue." }; }
}

export async function callNext(queueId: string) {
  try {
    const { supabase } = await authenticatedClient();
    const { data, error } = await supabase.rpc("owner_call_next", { p_queue_id: queueId });
    if (error) throw error;
    revalidatePath(`/dashboard/queues/${queueId}`);
    return { error: "", empty: data === null };
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not call the next customer.", empty: false }; }
}

export async function completeCurrent(queueId: string) {
  try {
    const { supabase } = await authenticatedClient();
    const { data, error } = await supabase.rpc("owner_complete_current", { p_queue_id: queueId });
    if (error) throw error;
    revalidatePath(`/dashboard/queues/${queueId}`);
    return { error: data === null ? "No customer is currently being served." : "" };
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not complete the customer." }; }
}

export async function skipEntry(queueId: string, entryId: string) {
  try {
    const { supabase } = await authenticatedClient();
    const { data, error } = await supabase.rpc("owner_skip_entry", { p_queue_id: queueId, p_entry_id: entryId });
    if (error) throw error;
    revalidatePath(`/dashboard/queues/${queueId}`);
    return { error: data ? "" : "This customer is no longer active." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not skip the customer." }; }
}

export async function updateQueueSettings(queueId: string, formData: FormData) {
  try {
    const { supabase } = await authenticatedClient();
    const name = normalizeQueueName(formData.get("name"));
    const average = parseAverageMinutes(formData.get("averageServiceMinutes"));
    const { error } = await supabase.from("queues").update({ name, average_service_minutes: average }).eq("id", queueId);
    if (error) throw error;
    revalidatePath(`/dashboard/queues/${queueId}`);
    return { error: "" };
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not save settings." }; }
}
