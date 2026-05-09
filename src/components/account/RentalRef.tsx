/**
 * Mono booking-reference stamp — "VR-#0042". Used as a header eyebrow
 * on rental cards & detail pages to give every rental a "boarding pass"
 * identity.
 *
 * Pure layout primitive — no state, no client-only deps.
 */

import { cn } from "@/lib/utils";

interface Props {
  id: number;
  className?: string;
  /** Larger variant — used on detail pages. */
  size?: "sm" | "md" | "lg";
}

export function RentalRef({ id, size = "sm", className }: Props) {
  const padded = String(id).padStart(4, "0");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.18em] text-muted-foreground",
        size === "sm" && "text-[0.68rem]",
        size === "md" && "text-[0.78rem]",
        size === "lg" && "text-[0.85rem]",
        className,
      )}
      data-numeric
    >
      <span className="text-accent">VR</span>
      <span aria-hidden className="text-border">·</span>
      <span className="text-foreground/80">#{padded}</span>
    </span>
  );
}
