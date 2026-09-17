import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeCustomerName } from "@/lib/domain";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCustomerToken,
  customerCookieName,
  customerCookieOptions,
  hashCustomerToken,
} from "@/lib/server/customer-token";
import { apiError } from "@/lib/server/http";
import { findPublicQueue, getCustomerState } from "@/lib/server/public-queue";
import { allowJoin } from "@/lib/server/rate-limit";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const queue = await findPublicQueue(slug);
    if (!queue) return NextResponse.json({ error: "Queue not found." }, { status: 404 });

    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!allowJoin(`${ip}:${queue.id}`)) {
      return NextResponse.json({ error: "Too many join attempts. Try again in a minute." }, { status: 429 });
    }

    const cookieStore = await cookies();
    const cookieName = customerCookieName(queue.id);
    const existingToken = cookieStore.get(cookieName)?.value;
    if (existingToken && /^[a-f0-9]{64}$/.test(existingToken)) {
      const existing = await getCustomerState(slug, hashCustomerToken(existingToken));
      if (existing?.entry && (existing.entry.status === "waiting" || existing.entry.status === "serving")) {
        return NextResponse.json(existing);
      }
    }

    const body = (await request.json()) as { name?: unknown };
    const name = normalizeCustomerName(body.name);
    const token = createCustomerToken();
    const tokenHash = hashCustomerToken(token);
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("join_queue", {
      p_slug: slug,
      p_customer_name: name,
      p_token_hash: tokenHash,
    });
    if (error) throw new Error(error.message);
    const state = await getCustomerState(slug, tokenHash);
    const response = NextResponse.json(state, { status: 201 });
    response.cookies.set(cookieName, token, customerCookieOptions);
    return response;
  } catch (error) {
    return apiError(error, "Could not join the queue.");
  }
}
