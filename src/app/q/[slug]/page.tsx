import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CustomerQueue } from "@/components/customer/customer-queue";
import { customerCookieName, hashCustomerToken } from "@/lib/server/customer-token";
import { findPublicQueue, getCustomerState } from "@/lib/server/public-queue";
import type { CustomerQueueState } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const queue = await findPublicQueue(slug);
  if (!queue) notFound();
  const token = (await cookies()).get(customerCookieName(queue.id))?.value;
  const savedState = token && /^[a-f0-9]{64}$/.test(token)
    ? await getCustomerState(slug, hashCustomerToken(token))
    : null;
  const initialState: CustomerQueueState = savedState ?? {
    queue, entry: null, position: null, peopleAhead: null, estimatedWaitMinutes: null,
  };
  return <CustomerQueue initialState={initialState} />;
}
