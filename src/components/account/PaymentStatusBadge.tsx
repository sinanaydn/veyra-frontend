/**
 * Frosted status pill for payments — same idiom as RentalStatusBadge.
 */

import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/api/types";
import { t } from "@/messages/tr";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-warning/15 text-warning ring-warning/25",
  COMPLETED: "bg-success/15 text-success ring-success/25",
  FAILED: "bg-destructive/15 text-destructive ring-destructive/25",
  REFUNDED: "bg-muted/40 text-muted-foreground ring-muted-foreground/25",
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: t.account.paymentPending,
  COMPLETED: t.account.paymentCompleted,
  FAILED: t.account.paymentFailed,
  REFUNDED: t.account.paymentRefunded,
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
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
