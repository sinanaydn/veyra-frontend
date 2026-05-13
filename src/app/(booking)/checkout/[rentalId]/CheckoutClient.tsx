"use client";

/**
 * Editorial checkout — split panel:
 *   ┌──────────────────────────────────────┬─────────────────────┐
 *   │  Step 01 → 02                          (full-width chrome)  │
 *   │  ┌──────────────────────────┐        ┌────────────────────┐ │
 *   │  │  CardPreview (live)       │        │  Booking ticket    │ │
 *   │  │  MockCardForm             │        │  Items / total     │ │
 *   │  │  Pay CTA                  │        │  Idempotency tag   │ │
 *   │  └──────────────────────────┘        └────────────────────┘ │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * - Idempotency UUID memoized to `rentalId` (FR-PAY-1).
 * - Same key for any retry within the session — safe to bail and resubmit.
 * - On success, hard-route to /booking/[id]/confirmation (server polls
 *   for status transition).
 * - Pre-payment guard: if rental is already paid (status moved out of
 *   PENDING), redirect to confirmation instead of letting the user pay
 *   twice.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useRental } from "@/lib/queries/useRentals";
import { usePay } from "@/lib/mutations/usePay";
import { useIdempotencyKey } from "@/hooks/useIdempotencyKey";
import { ApiError } from "@/lib/api/errors";

import { CardPreview, type CardBrand } from "@/components/booking/CardPreview";
import { MockCardForm } from "@/components/booking/MockCardForm";
import { CheckoutSummary } from "@/components/booking/CheckoutSummary";
import { StepIndicator } from "@/components/booking/StepIndicator";

import { ErrorState } from "@/components/account/ErrorState";
import { EmptyState } from "@/components/account/EmptyState";
import { t } from "@/messages/tr";

interface Props {
  rentalId: number;
}

interface PreviewState {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: CardBrand;
  flipped: boolean;
}

export function CheckoutClient({ rentalId }: Props) {
  const router = useRouter();
  const rentalQuery = useRental(rentalId);
  const idempotencyKey = useIdempotencyKey(rentalId);
  const pay = usePay({ rentalId, idempotencyKey });

  const [preview, setPreview] = React.useState<PreviewState>({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    brand: "generic",
    flipped: false,
  });

  // Per SPEC GAP-3: backend status enum is ACTIVE|COMPLETED|CANCELLED
  // (no PENDING). A freshly created rental returns ACTIVE — but the user
  // still needs to complete payment. Only redirect away from checkout
  // when the rental has reached a terminal state.
  React.useEffect(() => {
    const r = rentalQuery.data;
    if (!r) return;
    if (r.status === "COMPLETED") {
      router.replace(`/booking/${rentalId}/confirmation`);
    } else if (r.status === "CANCELLED") {
      router.replace(`/account/rentals/${rentalId}`);
    }
  }, [rentalQuery.data, rentalId, router]);

  const onSubmit = React.useCallback(() => {
    pay.mutate(undefined, {
      onSuccess: () => {
        toast.success(t.booking.confirmedSub);
        router.push(`/booking/${rentalId}/confirmation`);
      },
      onError: (err) => {
        const code = err instanceof ApiError ? err.tr : null;
        toast.error(code ?? t.errors.networkError);
      },
    });
  }, [pay, rentalId, router]);

  // ----- Loading / error / shape gates -----

  if (rentalQuery.isLoading) {
    return (
      <div className="space-y-8">
        <ChromeSkeleton />
        <BodySkeleton />
      </div>
    );
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

  if (rental.status === "COMPLETED" || rental.status === "CANCELLED") {
    // useEffect above will redirect; render a courteous interstitial.
    return (
      <EmptyState
        icon={ImageOff}
        title={t.booking.notPendingTitle}
        description={t.booking.notPendingSub}
        ctaHref={`/account/rentals/${rentalId}`}
        ctaLabel={t.account.rentalDetailTitle}
      />
    );
  }

  const errorText =
    pay.error instanceof ApiError
      ? pay.error.tr
      : pay.error
        ? t.errors.networkError
        : null;

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* ─── Chrome row ──────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/account/rentals/${rentalId}`}
            className="group inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            {t.account.rentalDetailTitle}
          </Link>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.booking.checkoutEyebrow}
          </span>
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {t.booking.checkoutTitle}
          </h1>
          <p className="max-w-xl text-[0.95rem] text-muted-foreground">
            {t.booking.checkoutSubtitle}
          </p>
        </header>

        <StepIndicator current="card" />
      </div>

      {/* ─── Body grid ──────────────────────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
        {/* Left: Card stage + form */}
        <section className="space-y-7">
          <div className="mx-auto max-w-md">
            <CardPreview
              number={preview.number}
              name={preview.name}
              expiry={preview.expiry}
              cvc={preview.cvc}
              brand={preview.brand}
              flipped={preview.flipped}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <MockCardForm
              onSubmit={onSubmit}
              pending={pay.isPending}
              errorText={errorText}
              onPreview={setPreview}
            />
          </div>
        </section>

        {/* Right: ticket */}
        <aside className="lg:sticky lg:top-24">
          <CheckoutSummary rental={rental} idempotencyKey={idempotencyKey} />
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// Skeletons
// ============================================================

function ChromeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-32 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="h-9 w-64 animate-pulse rounded bg-surface-2" />
      <div className="h-3 w-80 animate-pulse rounded bg-surface-2" />
      <div className="h-8 w-48 animate-pulse rounded-full bg-surface-2" />
    </div>
  );
}

function BodySkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-7">
        <div className="mx-auto aspect-[1.586/1] w-full max-w-md animate-pulse rounded-[1.4rem] bg-surface-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
      <div className="h-[26rem] animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
