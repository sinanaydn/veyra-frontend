"use client";

/**
 * The "Key ceremony" — central animated confirmation.
 *
 * Lifecycle:
 *  1. Mount → poll `useRental(id)` every 2s while status === PENDING.
 *  2. After 15 s without transition → stop polling, show graceful
 *     "still processing" copy with manual retry CTA.
 *  3. On status transition (CONFIRMED / ACTIVE / COMPLETED) → orchestrate
 *     a stroke-draw checkmark + headline reveal + CTA row.
 *  4. On CANCELLED / FAILED-equivalent (no status maps to a terminal
 *     failure for rentals; cancelled is treated as soft) → show neutral
 *     state with link back to rentals.
 *
 * Visual:
 *  - Centered ring with dashed perimeter that rotates while polling.
 *  - Background ambient glow that pulses while pending and locks on
 *    confirmed.
 *  - StepIndicator at top mirrors the journey (01 done → 02 active).
 */

import * as React from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, ImageOff, Receipt, RefreshCw } from "lucide-react";

import { useRental } from "@/lib/queries/useRentals";
import { useCar } from "@/lib/queries/useCars";
import { useMyPayments } from "@/lib/queries/usePayments";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/account/ErrorState";
import { EmptyState } from "@/components/account/EmptyState";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { RentalStatusBadge } from "@/components/account/RentalStatusBadge";
import {
  currencyTRY,
  formatDate,
  daysBetween,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

const POLL_MS = 2000;
const MAX_ATTEMPTS = 8; // 8 × 2s = 16s safety window

export function ConfirmationClient({ rentalId }: { rentalId: number }) {
  // Wall-clock start — anchored once at mount via lazy initializer.
  // Used to derive both the displayed attempt counter and the polling
  // timeout, without writing back into state on every fetch tick.
  const [startedAt, setStartedAt] = React.useState<number>(() => Date.now());
  const [timedOut, setTimedOut] = React.useState(false);
  const reduce = useReducedMotion();

  const rentalQuery = useRental(rentalId, {
    pollMs: timedOut ? 0 : POLL_MS,
    pollWhile: ["PENDING"],
  });

  // Hard stop after the budget elapses — single async timer, no
  // per-tick setState in effect.
  React.useEffect(() => {
    const id = setTimeout(
      () => setTimedOut(true),
      MAX_ATTEMPTS * POLL_MS,
    );
    return () => clearTimeout(id);
  }, [startedAt]);

  // Display-only counter derived from the query's last update time.
  // `dataUpdatedAt` is a stable timestamp on the query state that ticks
  // forward on every successful refetch, giving us a natural counter
  // without any setState-in-effect mirror.
  const tickRef = rentalQuery.dataUpdatedAt || startedAt;
  const attempts = Math.min(
    MAX_ATTEMPTS,
    Math.max(1, Math.floor((tickRef - startedAt) / POLL_MS) + 1),
  );

  // ----- States -----

  if (rentalQuery.isLoading) {
    return <CenterStage status="loading" />;
  }

  if (rentalQuery.isError) {
    return (
      <ErrorState
        error={rentalQuery.error}
        onRetry={() => rentalQuery.refetch()}
      />
    );
  }

  if (!rentalQuery.data) {
    return (
      <EmptyState
        icon={ImageOff}
        title={t.errors.notFoundTitle}
        description={t.errors.notFoundDescription}
        ctaHref="/account/rentals"
        ctaLabel={t.account.rentalsTitle}
      />
    );
  }

  const rental = rentalQuery.data;
  const isPending = rental.status === "PENDING";
  const stalled = isPending && timedOut;
  const success = !isPending && rental.status !== "CANCELLED";

  return (
    <div className="space-y-12">
      {/* Chrome */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.booking.confirmedEyebrow}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            VR-#{String(rentalId).padStart(5, "0")}
          </span>
        </div>
        <StepIndicator current="confirm" cardDone />
      </div>

      {/* Center stage */}
      <CenterStage
        status={success ? "success" : stalled ? "stalled" : "loading"}
        attempts={attempts}
        reduce={reduce ?? false}
      />

      {/* Headline + sub */}
      <div className="mx-auto max-w-xl text-center">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.4, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <RentalStatusBadge status={rental.status} />
              <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                {t.booking.confirmedTitle}
              </h1>
              <p className="text-[0.95rem] text-muted-foreground">
                {t.booking.confirmedSub}
              </p>
            </motion.div>
          ) : stalled ? (
            <motion.div
              key="stalled"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                {t.booking.pollTimeoutTitle}
              </h1>
              <p className="text-[0.95rem] text-muted-foreground">
                {t.booking.pollTimeoutSub}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                {t.booking.confirmingTitle}
              </h1>
              <p className="text-[0.95rem] text-muted-foreground">
                {t.booking.confirmingSub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail card revealed once we have a non-pending state OR stalled */}
      <AnimatePresence>
        {(success || stalled) && (
          <motion.section
            key="detail"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.55, duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <DetailCard rentalId={rentalId} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* CTAs */}
      <AnimatePresence>
        {(success || stalled) && (
          <motion.div
            key="ctas"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/account/rentals"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 px-6",
              )}
            >
              {t.booking.viewRentalsCta}
              <ArrowUpRight className="ml-1.5 size-4" aria-hidden />
            </Link>
            <ReceiptCTA rentalId={rentalId} />
            {stalled && (
              <Button
                variant="outline"
                onClick={() => {
                  setStartedAt(Date.now());
                  setTimedOut(false);
                  rentalQuery.refetch();
                }}
                className="h-11 px-5"
              >
                <RefreshCw className="mr-1.5 size-4" aria-hidden />
                {t.errors.retry}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Center stage — animated ring + checkmark
// ============================================================

interface StageProps {
  status: "loading" | "success" | "stalled";
  attempts?: number;
  reduce?: boolean;
}

function CenterStage({ status, attempts = 0, reduce }: StageProps) {
  const success = status === "success";

  return (
    <div className="relative mx-auto flex h-72 w-72 items-center justify-center">
      {/* Ambient glow — pulses while loading, locks on success */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl transition-opacity",
          success ? "bg-success/25 opacity-100" : "bg-accent/20",
        )}
        style={{
          animation: !reduce && !success ? "veyra-pulse 2.6s ease-in-out infinite" : undefined,
        }}
      />

      {/* Outer ring */}
      <svg
        viewBox="0 0 200 200"
        className={cn("size-64 transition-colors", success ? "text-success" : "text-accent")}
        aria-hidden
      >
        <defs>
          <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Static hairline */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="oklch(from var(--color-border) l c h / 0.5)"
          strokeWidth="1"
        />

        {/* Animated dashed ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="url(#ring-g)"
          strokeWidth={success ? 2.5 : 2}
          strokeDasharray="6 14"
          strokeLinecap="round"
          animate={
            reduce || success
              ? { rotate: 0 }
              : { rotate: 360 }
          }
          transition={
            reduce || success
              ? { duration: 0 }
              : { repeat: Infinity, duration: 8, ease: "linear" }
          }
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Inner solid ring on success */}
        {success && (
          <motion.circle
            cx="100"
            cy="100"
            r="68"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.35"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}

        {/* Checkmark on success */}
        {success && (
          <motion.path
            d="M70 102 L92 124 L132 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: reduce ? 0 : 0.25, duration: 0.55, ease: "easeOut" }}
          />
        )}
      </svg>

      {/* Polling counter — center text while loading */}
      {!success && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="font-mono text-[2rem] font-semibold tabular-nums text-foreground"
              data-numeric
            >
              {String(Math.min(attempts, MAX_ATTEMPTS)).padStart(2, "0")}
              <span className="text-muted-foreground/60"> / </span>
              {String(MAX_ATTEMPTS).padStart(2, "0")}
            </span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">
              {status === "stalled" ? "TIMEOUT" : "POLLING"}
            </span>
          </div>
        </div>
      )}

      {/* Local pulse keyframes */}
      <style jsx>{`
        @keyframes veyra-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Detail card — car snapshot + dates + total
// ============================================================

function DetailCard({ rentalId }: { rentalId: number }) {
  const rentalQuery = useRental(rentalId);
  const carQuery = useCar(rentalQuery.data?.carId ?? 0);

  if (!rentalQuery.data) return null;
  const r = rentalQuery.data;
  const c = carQuery.data;
  const days = daysBetween(r.startDate, r.endDate);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 -z-10 h-60 w-60 rounded-full bg-success/10 blur-3xl"
      />
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            ARAÇ
          </p>
          <p className="mt-1 truncate text-xl font-semibold tracking-[-0.01em]">
            {c ? `${c.brandName} · ${c.modelName}` : "—"}
          </p>
          <p className="mt-1 font-mono text-[0.78rem] tabular-nums text-muted-foreground">
            {formatDate(r.startDate)} — {formatDate(r.endDate)} ·{" "}
            {t.account.rentalDays.replace("{n}", String(days))}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.booking.summaryTotal}
          </p>
          <p
            className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground"
            data-numeric
          >
            {currencyTRY(r.totalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Receipt CTA — only renders when a payment row is found
// ============================================================

function ReceiptCTA({ rentalId }: { rentalId: number }) {
  const paymentsQuery = useMyPayments({ page: 0, size: 50 });
  const payment = paymentsQuery.data?.content.find(
    (p) => p.rentalId === rentalId,
  );
  if (!payment) return null;

  return (
    <Link
      href={`/account/payments/${payment.id}`}
      className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
    >
      <Receipt className="mr-1.5 size-4" aria-hidden />
      {t.booking.viewReceiptCta}
    </Link>
  );
}
