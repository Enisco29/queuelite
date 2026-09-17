import { NextResponse } from "next/server";
import { isDemoAdminEnabled } from "@/lib/env";
import { apiError } from "@/lib/server/http";
import { getDemoState } from "@/lib/server/demo";

export async function GET() {
  if (!isDemoAdminEnabled()) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try { return NextResponse.json(await getDemoState()); }
  catch (error) { return apiError(error, "Could not load the demo queue."); }
}
