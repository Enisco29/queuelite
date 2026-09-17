import type { EntryStatus } from "@/lib/types";

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCustomerName(value: unknown): string {
  if (typeof value !== "string") throw new Error("Please enter your name.");
  if (CONTROL_CHARACTERS.test(value)) throw new Error("Name contains unsupported characters.");
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) throw new Error("Please enter your name.");
  if (name.length > 80) throw new Error("Name must be 80 characters or fewer.");
  return name;
}

export function normalizeSlug(value: unknown): string {
  if (typeof value !== "string") throw new Error("Enter a queue link.");
  const slug = value.trim().toLowerCase();
  if (slug.length < 3 || slug.length > 60 || !SLUG_PATTERN.test(slug)) {
    throw new Error("Use 3–60 lowercase letters, numbers, or single hyphens.");
  }
  return slug;
}

export function normalizeQueueName(value: unknown): string {
  if (typeof value !== "string") throw new Error("Enter a queue name.");
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 100) throw new Error("Queue name must be 2–100 characters.");
  return name;
}

export function parseAverageMinutes(value: unknown): number {
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
    throw new Error("Average service time must be between 1 and 240 minutes.");
  }
  return minutes;
}

export function isTerminalStatus(status: EntryStatus): boolean {
  return status === "completed" || status === "skipped" || status === "left";
}

export function waitEstimate(peopleAhead: number, averageMinutes: number): number {
  return Math.max(0, peopleAhead) * Math.max(1, averageMinutes);
}
