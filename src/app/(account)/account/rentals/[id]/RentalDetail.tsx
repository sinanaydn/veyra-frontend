"use client";

/**
 * Editorial rental detail.
 *
 * Layout:
 *   ┌───────────────────────────────────────────────────────────┐
 *   │  ← Kiralamalar          KIRALAMA · VR-#0042   [PENDING]    │
 *   │  Toyota · Corolla 2024                                     │
 *   │                                                            │
 *   │  ── Durum ────────────────────────────────────────────     │
 *   │  ●  PENDING  ◯  CONFIRMED  ◯  ACTIVE  ◯  COMPLETED         │
 *   │                                                            │
 *   │  ┌────────────────────────────┐ ┌─────────────────────┐    │
 *   │  │ Araç görseli + specs        │ │ Tarih/Süre/Toplam   │    │
 *   │  └────────────────────────────┘ │  + Aksiyonlar       │    │
 *   │                                  └─────────────────────┘    │
 *   │  Ödeme makbuzu (varsa)                                     │
 *   └───────────────────────────────────────────────────────────┘
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, ImageOff, Ticket } from "lucide-react";

import { useRental } from "@/lib/queries/useRentals";
import { useCar } from "@/lib/queries/useCars";
import { useMyPayments } from "@/lib/queries/usePayments";
import {
  currencyTRY,
  formatDate,
  formatDateTime,
  daysBetween,
} from "@/lib/format";
import { RentalRef } from "@/components/account/RentalRef";
import { RentalStatusBadge } from "@/components/account/RentalStatusBadge";
import { RentalTimeline } from "@/components/account/RentalTimeline";
import { CancelRentalButton } from "@/components/account/CancelRentalButton";
import { PaymentReceipt } from "@/components/account/PaymentReceipt";
import { EmptyState } from "@/components/account/EmptyState";
import { ErrorState } from "@/components/account/ErrorState";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  rentalId: number;
}

export function RentalDetail({ rentalId }: Props) {
  const rentalQuery = useRental(rentalId);
  const carQuery = useCar(rentalQuery.data?.carId ?? 0);
  // Pull a generous slice; backend has no /payments?rentalId=mine query
  const paymentsQuery = useMyPayments({ page: 0, size: 50 });

  if (rentalQuery.isLoading) return <RentalDetailSkeleton />;

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
        icon={Ticket}
        title={t.errors.notFoundTitle}
        description={t.errors.notFoundDescription}
        ctaHref="/account/rentals"
        ctaLabel={t.account.rentalsTitle}
      />
    );
  }

  const rental = rentalQuery.data;
  const car = carQuery.data;
  const payment = paymentsQuery.data?.content.find(
    (p) => p.rentalId === rentalId,
  );
  const days = daysBetween(new Date(rental.startDate), new Date(rental.endDate));

  const canCancel =
    rental.status !== "COMPLETED" && rental.status !== "CANCELLED";
  const canPay = rental.status === "PENDING";

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <Link
          href="/account/rentals"
          className="group/back inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            className="size-3 transition-transform group-hover/back:-translate-x-0.5"
            aria-hidden
          />
          {t.account.rentalsTitle}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <RentalRef id={rental.id} size="lg" />
            <h1 className="text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.15rem]">
              {car
                ? `${car.brandName} · ${car.modelName} ${car.year}`
                : t.account.rentalDetailTitle}
            </h1>
          </div>
          <RentalStatusBadge status={rental.status} className="text-[0.78rem]" />
        </div>
      </header>

      {/* Timeline */}
      <section className="rounded-2xl border border-border bg-surface px-5 py-6 sm:px-8">
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t.account.rentalTimelineTitle}
        </p>
        <RentalTimeline status={rental.status} />
      </section>

      {/* Two-column main */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* Left — car snapshot */}
        <article className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="relative aspect-[16/10] bg-surface-2">
            {car?.primaryImageUrl ? (
              <Image
                src={car.primaryImageUrl}
                alt={`${car.brandName} ${car.modelName}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-10" aria-hidden />
              </div>
            )}
            {/* Vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"
            />
          </div>
          <div className="px-6 py-5">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t.account.rentalCarSnapshot}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {car
                ? `${car.brandName} · ${car.modelName} ${car.year}`
                : "—"}
            </h2>
            {car && (
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <SpecRow label="Vites" value={mapTransmission(car.transmission)} />
                <SpecRow label="Yakıt" value={mapFuel(car.fuelType)} />
                <SpecRow label="Koltuk" value={String(car.seats)} />
                <SpecRow label="Bagaj" value={String(car.baggages)} />
                {car.color && <SpecRow label="Renk" value={car.color} />}
                <SpecRow
                  label="Günlük"
                  value={currencyTRY(car.dailyPrice)}
                  mono
                />
              </dl>
            )}
          </div>
          {car && (
            <Link
              href={`/cars/${car.id}`}
              className="block border-t border-border/40 px-6 py-3 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Araç sayfasına git
            </Link>
          )}
        </article>

        {/* Right — booking summary + actions */}
        <aside className="rounded-2xl border border-border bg-surface">
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Cell
                label="ALIŞ"
                value={formatDate(rental.startDate)}
                hint={dayName(rental.startDate)}
              />
              <Cell
                label="TESLİM"
                value={formatDate(rental.endDate)}
                hint={dayName(rental.endDate)}
              />
            </div>

            <div className="border-t border-dashed border-border/60 pt-5">
              <Cell
                label="SÜRE"
                value={t.account.rentalDays.replace("{n}", String(days))}
              />
            </div>

            <div className="border-t border-dashed border-border/60 pt-5">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
                TOPLAM
              </p>
              <p
                className="mt-1 font-mono text-[2.2rem] font-semibold leading-none tabular-nums tracking-[-0.02em]"
                data-numeric
              >
                {currencyTRY(rental.totalPrice)}
              </p>
            </div>

            <div className="border-t border-dashed border-border/60 pt-5">
              <Cell
                label="OLUŞTURULMA"
                value={formatDateTime(rental.createdAt)}
                hint=""
                mono
              />
            </div>
          </div>

          {/* Action bar */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 border-t border-border/40 px-6 py-4",
              !canCancel && !canPay && "justify-end",
            )}
          >
            {canPay && (
              <Link
                href={`/checkout/${rental.id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-[0.85rem] font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px"
              >
                <CreditCard className="size-3.5" aria-hidden />
                {t.account.payNow}
              </Link>
            )}
            <CancelRentalButton rentalId={rental.id} enabled={canCancel} />
            {!canCancel && !canPay && (
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                {rental.status === "COMPLETED"
                  ? t.account.rentalCompleted
                  : rental.status === "CANCELLED"
                    ? t.account.rentalCancelled
                    : ""}
              </span>
            )}
          </div>
        </aside>
      </div>

      {/* Payment receipt (if any) */}
      {payment && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3 border-b border-border/50 pb-3">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                ÖDEME
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {t.account.receiptTitle}
              </h2>
            </div>
          </div>
          <PaymentReceipt payment={payment} compact />
        </section>
      )}
    </div>
  );
}

// ============================================================
// Local primitives
// ============================================================

function Cell({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "tabular-nums",
          mono ? "font-mono text-sm text-foreground/90" : "text-base font-medium",
        )}
        data-numeric
      >
        {value}
      </p>
      {hint && (
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground/80">
          {hint}
        </p>
      )}
    </div>
  );
}

function SpecRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-2">
      <dt className="text-[0.78rem] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-[0.85rem]",
          mono && "font-mono tabular-nums",
        )}
        data-numeric={mono ? "" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function dayName(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleDateString("tr-TR", { weekday: "long" })
      .toUpperCase();
  } catch {
    return "";
  }
}

function mapTransmission(value: "MANUAL" | "AUTOMATIC"): string {
  return value === "AUTOMATIC" ? "Otomatik" : "Manuel";
}

function mapFuel(f: "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID"): string {
  return {
    GASOLINE: "Benzin",
    DIESEL: "Dizel",
    ELECTRIC: "Elektrik",
    HYBRID: "Hibrit",
  }[f];
}

function RentalDetailSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-9 w-64 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="h-96 animate-pulse rounded-2xl bg-surface" />
        <div className="h-96 animate-pulse rounded-2xl bg-surface" />
      </div>
    </div>
  );
}
