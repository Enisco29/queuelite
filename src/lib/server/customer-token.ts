import { createHash, randomBytes } from "node:crypto";

export function createCustomerToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashCustomerToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function customerCookieName(queueId: string): string {
  return `ql_entry_${queueId.replaceAll("-", "")}`;
}

export const customerCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
