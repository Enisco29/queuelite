import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerCookieName, hashCustomerToken } from "@/lib/server/customer-token";
import { apiError } from "@/lib/server/http";
import { findPublicQueue, getCustomerState } from "@/lib/server/public-queue";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const queue = await findPublicQueue(slug);
    if (!queue) return NextResponse.json({ error: "Queue not found." }, { status: 404 });
    const token = (await cookies()).get(customerCookieName(queue.id))?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json({ error: "Queue entry not found." }, { status: 404 });
    }
    const tokenHash = hashCustomerToken(token);
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("leave_queue", { p_slug: slug, p_token_hash: tokenHash });
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: "This entry is no longer active." }, { status: 409 });
    return NextResponse.json(await getCustomerState(slug, tokenHash));
  } catch (error) {
    return apiError(error, "Could not leave the queue.");
  }
}
