import { notFound } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { QueueManager } from "@/components/owner/queue-manager";
import { getOwnerQueueState } from "@/lib/server/owner-queue";
import { requireOwnerSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function QueuePage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwnerSession();
  const { id } = await params;
  const state = await getOwnerQueueState(id);
  if (!state) notFound();
  return <QueueManager state={state} publicUrl={`${serverEnv().appUrl}/q/${state.queue.slug}`} />;
}
