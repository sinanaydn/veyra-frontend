"use client";

/**
 * Stable idempotency key per scope.
 * Reference: SPECIFICATION.md FR-PAY-1, IMPLEMENTATION.md §4.12
 *
 * `useMemo(() => crypto.randomUUID(), [scope])` — every retry within the
 * same checkout session reuses the same UUID, so the backend dedups on
 * X-Idempotency-Key. Crossing to a different rental yields a fresh UUID.
 *
 * SSR safe: `crypto.randomUUID()` is supported in Node 19+ and the modern
 * browser. Falls back to a less-strong UUID v4 if needed (defensive only).
 */

import { useMemo } from "react";

function uuidv4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (RFC 4122 v4) — only hit on ancient runtimes
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function useIdempotencyKey(scope: string | number): string {
  return useMemo(() => uuidv4(), [scope]);
}
