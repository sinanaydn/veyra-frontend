"use client";

/**
 * Booking widget — sticky right rail (desktop) / inline (mobile).
 * Reference: SPECIFICATION.md FR-CD-3..6
 *
 * Flow:
 *   1. Pick date range
 *   2. Live total = dailyPrice × days
 *   3. Click "Kirala" →
 *        - unauth → /login?redirect=/cars/[id]
 *        - auth   → POST /rentals → push /checkout/[rentalId]
 *   4. Surface 422 errors inline (RENTAL_DATE_CONFLICT etc.)
 */

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { Loader2, ShieldCheck } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { useCreateRental } from "@/lib/mutations/useCreateRental";
import { useAuth } from "@/store/auth";
import { ApiError } from "@/lib/api/errors";
import { currencyTRY, daysBetween, toIsoDate } from "@/lib/format";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";
import type { Car } from "@/lib/api/types";

interface BookingWidgetProps {
  car: Car;
  className?: string;
}

export function BookingWidget({ car, className }: BookingWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuth((s) => s.role);
  const hydrated = useAuth((s) => s.hydrated);

  const [range, setRange] = useState<DateRange | undefined>();
  const create = useCreateRental();

  const days = useMemo(
    () =>
      range?.from && range?.to ? daysBetween(range.from, range.to) : 0,
    [range],
  );
  const total = days > 0 ? car.dailyPrice * days : 0;

  const datesValid = !!(range?.from && range?.to && days >= 1);
  const carUnavailable = car.status !== "AVAILABLE";

  const errorMessage = useMemo(() => {
    if (!create.error) return null;
    if (create.error instanceof ApiError) return create.error.tr;
    return "Kiralama oluşturulamadı.";
  }, [create.error]);

  const submit = () => {
    if (!datesValid || !range?.from || !range?.to) return;

    if (hydrated && !role) {
      const redirect = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    create.reset();
    create.mutate({
      carId: car.id,
      startDate: toIsoDate(range.from),
      endDate: toIsoDate(range.to),
    });
  };

  const ctaLabel = !hydrated
    ? t.common.loading
    : !role
      ? t.booking.loginRequired
      : carUnavailable
        ? t.cars.statusRented
        : create.isPending
          ? t.booking.booking
          : t.booking.bookCta;

  const disabled =
    !hydrated ||
    create.isPending ||
    (hydrated && !!role && (!datesValid || carUnavailable));

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 md:p-6",
        className,
      )}
      aria-label={t.booking.widgetTitle}
    >
      {/* Price headline */}
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.booking.dailyRate}
          </p>
          <p
            className="mt-1 font-mono text-3xl font-semibold tracking-tight text-foreground"
            data-numeric
          >
            {currencyTRY(car.dailyPrice)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{t.common.perDay}</p>
      </div>

      <div className="mt-6 space-y-3">
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* Live computation */}
      <dl className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            <span data-numeric>{currencyTRY(car.dailyPrice)}</span>{" "}
            <span>×</span>{" "}
            <span data-numeric>{days || 0}</span>{" "}
            <span>{t.booking.days}</span>
          </dt>
          <dd
            className="font-mono tabular-nums text-foreground"
            data-numeric
          >
            {currencyTRY(total)}
          </dd>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <dt className="text-base font-semibold">{t.booking.total}</dt>
          <dd
            className="font-mono text-lg font-semibold tabular-nums text-foreground"
            data-numeric
          >
            {currencyTRY(total)}
          </dd>
        </div>
      </dl>

      {/* Error */}
      {errorMessage && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorMessage}
        </p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        className={cn(
          "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all",
          "hover:brightness-110 active:translate-y-px",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
        )}
      >
        {create.isPending && (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        )}
        {ctaLabel}
      </button>

      {/* Trust line */}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden />
        Esnek iptal · 24 saat öncesine kadar ücretsiz
      </p>
    </aside>
  );
}
