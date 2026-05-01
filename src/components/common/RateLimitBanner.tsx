"use client";

/**
 * Rate-limit banner with auto-retry countdown.
 * Reference: SPECIFICATION.md FR-CAT-7
 *
 * When the catalog query 429s, mount this banner with a 60-second
 * countdown; when it hits zero, fire `onRetry()`.
 */

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/messages/tr";

interface RateLimitBannerProps {
  onRetry: () => void;
  /** Seconds to wait. Defaults to 60. */
  seconds?: number;
}

export function RateLimitBanner({ onRetry, seconds = 60 }: RateLimitBannerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onRetry();
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onRetry]);

  const message = t.cars.rateLimitBanner.replace("{n}", String(left));

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
    >
      <Clock className="size-4 shrink-0" aria-hidden />
      <p className="flex-1">{message}</p>
      <span className="font-mono text-xs tabular-nums" data-numeric>
        {left}s
      </span>
    </div>
  );
}
