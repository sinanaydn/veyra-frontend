/**
 * Frosted status pill for rentals, mirroring CarStatusBadge.
 * Palette per BRANDING.md §10:
 *   PENDING / MAINTENANCE → warning
 *   CONFIRMED / AVAILABLE → success
 *   ACTIVE / RENTED       → accent
 *   COMPLETED             → muted
 *   CANCELLED / FAILED    → danger
 */

import { cn } from "@/lib/utils";
import type { RentalStatus } from "@/lib/api/types";
import { t } from "@/messages/tr";

const STATUS_STYLES: Record<RentalStatus, string> = {
  PENDING: "bg-warning/15 text-warning ring-warning/25",
  CONFIRMED: "bg-success/15 text-success ring-success/25",
  ACTIVE: "bg-accent/15 text-accent ring-accent/25",
  COMPLETED: "bg-muted/40 text-muted-foreground ring-muted-foreground/25",
  CANCELLED: "bg-destructive/15 text-destructive ring-destructive/25",
};

const STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING: t.account.statusPending,
  CONFIRMED: t.account.statusConfirmed,
  ACTIVE: t.account.statusActive,
  COMPLETED: t.account.statusCompleted,
  CANCELLED: t.account.statusCancelled,
};

export function RentalStatusBadge({
  status,
  className,
}: {
  status: RentalStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium ring-1 ring-inset backdrop-blur-md",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
