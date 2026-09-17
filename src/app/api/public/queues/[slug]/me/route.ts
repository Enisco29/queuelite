import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { customerCookieName, hashCustomerToken } from "@/lib/server/customer-token";
import { apiError } from "@/lib/server/http";
import { findPublicQueue, getCustomerState } from "@/lib/server/public-queue";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const queue = await findPublicQueue(slug);
    if (!queue) return NextResponse.json({ error: "Queue not found." }, { status: 404 });

    const token = (await cookies()).get(customerCookieName(queue.id))?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json({ queue, entry: null, position: null, peopleAhead: null, estimatedWaitMinutes: null });
    }
    const state = await getCustomerState(slug, hashCustomerToken(token));
    return NextResponse.json(state ?? { queue, entry: null, position: null, peopleAhead: null, estimatedWaitMinutes: null });
  } catch (error) {
    return apiError(error);
  }
}
