import { NextResponse } from "next/server";
import { isDemoAdminEnabled } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_QUEUE_ID } from "@/lib/server/demo";
import { apiError } from "@/lib/server/http";

export async function POST() {
  if (!isDemoAdminEnabled()) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    const { data, error } = await createAdminClient().rpc("service_complete_current", { p_queue_id: DEMO_QUEUE_ID });
    if (error) throw new Error(error.message);
    if (data === null) return NextResponse.json({ error: "No customer is currently being served." }, { status: 409 });
    return NextResponse.json({ completed: true });
  } catch (error) { return apiError(error, "Could not complete the customer."); }
}
