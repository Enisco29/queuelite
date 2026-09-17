import { describe, expect, it } from "vitest";
import { normalizeCustomerName, normalizeSlug, parseAverageMinutes, waitEstimate } from "./domain";

describe("customer names", () => {
  it("trims and collapses whitespace", () => expect(normalizeCustomerName("  Ada   Lovelace ")).toBe("Ada Lovelace"));
  it("rejects empty and control-character names", () => {
    expect(() => normalizeCustomerName("  ")).toThrow();
    expect(() => normalizeCustomerName("Ada\nLovelace")).toThrow();
  });
});

describe("queue settings", () => {
  it("normalizes valid slugs", () => expect(normalizeSlug("My-Queue")).toBe("my-queue"));
  it("rejects malformed slugs", () => expect(() => normalizeSlug("my--queue")).toThrow());
  it("accepts only bounded whole-minute averages", () => {
    expect(parseAverageMinutes("15")).toBe(15);
    expect(() => parseAverageMinutes("2.5")).toThrow();
    expect(() => parseAverageMinutes("241")).toThrow();
  });
});

describe("wait estimates", () => {
  it("multiplies people ahead by the queue average", () => expect(waitEstimate(3, 10)).toBe(30));
  it("never returns a negative estimate", () => expect(waitEstimate(-1, 10)).toBe(0));
});
