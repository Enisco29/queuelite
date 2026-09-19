import { NextResponse } from "next/server";
import { getOwnerQueueState } from "@/lib/server/owner-queue";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const state = await getOwnerQueueState(id);
    if (!state) return NextResponse.json({ error: "Queue not found." }, { status: 404 });
    return NextResponse.json(state, {
      headers: { "cache-control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json({ error: "Could not load queue state." }, { status: 500 });
  }
}
