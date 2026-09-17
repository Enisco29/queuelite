import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "Something went wrong.") {
  const message = error instanceof Error ? error.message : fallback;
  const normalized = message.toLowerCase();
  const status = normalized.includes("not found") ? 404
    : normalized.includes("not accepting") || normalized.includes("already") ? 409
      : normalized.includes("invalid") ? 400
        : 500;
  return NextResponse.json({ error: status === 500 ? fallback : message }, { status });
}
