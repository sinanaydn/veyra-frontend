/**
 * Status pill — frosted background per BRANDING.md §10.
 */

import { cn } from "@/lib/utils";
import type { CarStatus } from "@/lib/api/types";
import { t } from "@/messages/tr";

const STATUS_STYLES: Record<CarStatus, string> = {
  AVAILABLE:
    "bg-success/15 text-success ring-success/25",
  RENTED: "bg-accent/15 text-accent ring-accent/25",
  MAINTENANCE: "bg-warning/15 text-warning ring-warning/25",
};

const STATUS_LABEL: Record<CarStatus, string> = {
  AVAILABLE: t.cars.statusAvailable,
  RENTED: t.cars.statusRented,
  MAINTENANCE: t.cars.statusMaintenance,
};

export function CarStatusBadge({
  status,
  className,
}: {
  status: CarStatus;
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
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current"
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
