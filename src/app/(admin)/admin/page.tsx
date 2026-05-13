/**
 * Admin dashboard — at-a-glance fleet + operations snapshot.
 *
 * Layout:
 *  - Editorial page header
 *  - 4-col stat grid (rentals total/active, completed payments, fleet count)
 *  - Two parallel feed cards: latest rentals + latest payments
 *
 * Data: parallel admin list calls (`rentals.list?size=5`, `payments.list?size=5`,
 * `cars.list?size=1` for fleet total, `brands.list`, `models.list`, `users.list`).
 */

"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Car,
  CarFront,
  CircleDollarSign,
  CreditCard,
  Ticket,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RentalStatusBadge } from "@/components/account/RentalStatusBadge";
import { PaymentStatusBadge } from "@/components/account/PaymentStatusBadge";
import {
  brandsApi,
  carsApi,
  modelsApi,
  paymentsApi,
  rentalsApi,
  usersApi,
} from "@/lib/api/resources";
import { currencyTRY, formatDate } from "@/lib/format";
import { t } from "@/messages/tr";

export default function AdminDashboardPage() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["admin-dash", "rentals-recent"],
        queryFn: () =>
          rentalsApi.list({}, { page: 0, size: 5, sort: ["createdAt,desc"] }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin-dash", "rentals-active"],
        queryFn: () =>
          rentalsApi.list({ status: "ACTIVE" }, { page: 0, size: 1 }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin-dash", "payments-recent"],
        queryFn: () =>
          paymentsApi.list({}, { page: 0, size: 5, sort: ["createdAt,desc"] }),
        staleTime: 30_000,
      },
      {
        queryKey: ["admin-dash", "payments-completed"],
        queryFn: () =>
          paymentsApi.list({ status: "COMPLETED" }, { page: 0, size: 1 }),
        staleTime: 30_000,
      },
      {
        // Revenue feed — pulls a generous slice of COMPLETED payments
        // so the dashboard headline figure means "total revenue" rather
        // than "last 5 receipts". Backend has no aggregate endpoint;
        // this is the pragmatic substitute. If the fleet ever crosses
        // 500 payments we'll wire a `/payments/revenue` SUM endpoint
        // server-side instead of paginating further.
        queryKey: ["admin-dash", "payments-revenue-slice"],
        queryFn: () =>
          paymentsApi.list(
            { status: "COMPLETED" },
            { page: 0, size: 500, sort: ["createdAt,desc"] },
          ),
        staleTime: 60_000,
      },
      {
        queryKey: ["admin-dash", "cars-total"],
        queryFn: () => carsApi.list({}, { page: 0, size: 1 }),
        staleTime: 60_000,
      },
      {
        queryKey: ["admin-dash", "brands"],
        queryFn: () => brandsApi.list(),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["admin-dash", "models"],
        queryFn: () => modelsApi.list(),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["admin-dash", "users-total"],
        queryFn: () => usersApi.list({ page: 0, size: 1 }),
        staleTime: 60_000,
      },
    ],
  });

  const [
    recentRentals,
    activeRentals,
    recentPayments,
    completedPayments,
    revenueSlice,
    carsTotal,
    brands,
    models,
    usersTotal,
  ] = results;

  // Revenue = sum over the COMPLETED slice (≤500 rows). Covers the full
  // dataset for any realistic dev/demo size; for production scale we'll
  // swap in a backend aggregate endpoint.
  const totalRevenue =
    revenueSlice.data?.content?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalRevenueCount = revenueSlice.data?.totalElements ?? 0;
  const slicePartial =
    !!revenueSlice.data?.content &&
    revenueSlice.data.content.length < totalRevenueCount;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowDashboard}
        title={t.admin.dashboardTitle}
        description={t.admin.dashboardSubtitle}
      />

      {/* Stat grid */}
      <section
        aria-label="Özet"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <AdminStatCard
          icon={Ticket}
          label={t.admin.statTotalRentals}
          value={
            recentRentals.isLoading
              ? "…"
              : String(recentRentals.data?.totalElements ?? 0)
          }
        />
        <AdminStatCard
          icon={Activity}
          tone="accent"
          label={t.admin.statActiveRentals}
          value={
            activeRentals.isLoading
              ? "…"
              : String(activeRentals.data?.totalElements ?? 0)
          }
        />
        <AdminStatCard
          icon={CreditCard}
          tone="success"
          label={t.admin.statTotalPayments}
          value={
            completedPayments.isLoading
              ? "…"
              : String(completedPayments.data?.totalElements ?? 0)
          }
        />
        <AdminStatCard
          icon={CircleDollarSign}
          label={t.admin.statRevenue}
          value={revenueSlice.isLoading ? "…" : currencyTRY(totalRevenue)}
          hint={
            revenueSlice.isLoading
              ? undefined
              : totalRevenueCount === 0
                ? "Henüz tamamlanmış ödeme yok"
                : slicePartial
                  ? `Son ${revenueSlice.data?.content.length ?? 0} / ${totalRevenueCount} ödeme`
                  : `${totalRevenueCount} tamamlanmış ödeme`
          }
        />
      </section>

      {/* Catalog snapshot — secondary row */}
      <section
        aria-label="Katalog"
        className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <AdminStatCard
          icon={CarFront}
          label={t.admin.statFleet}
          value={carsTotal.isLoading ? "…" : String(carsTotal.data?.totalElements ?? 0)}
        />
        <AdminStatCard
          icon={Building2}
          label={t.admin.statBrands}
          value={brands.isLoading ? "…" : String(brands.data?.length ?? 0)}
        />
        <AdminStatCard
          icon={Car}
          label={t.admin.statModels}
          value={models.isLoading ? "…" : String(models.data?.length ?? 0)}
        />
        <AdminStatCard
          icon={Users}
          label={t.admin.statUsers}
          value={
            usersTotal.isLoading
              ? "…"
              : String(usersTotal.data?.totalElements ?? 0)
          }
        />
      </section>

      {/* Recent feeds */}
      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <FeedCard
          eyebrow="// 01"
          title={t.admin.recentRentals}
          href="/admin/rentals"
        >
          {recentRentals.isLoading && <FeedSkeleton rows={4} />}
          {!recentRentals.isLoading &&
            (recentRentals.data?.content.length ?? 0) === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t.admin.rentalsEmpty}
              </p>
            )}
          {!recentRentals.isLoading &&
            recentRentals.data?.content.map((r) => (
              <Link
                key={r.id}
                href={`/admin/rentals?userId=${r.userId}`}
                className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 transition-colors first:border-t-0 hover:bg-surface-2/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[0.78rem] tabular-nums text-muted-foreground">
                    #{r.id} · user {r.userId}
                  </p>
                  <p className="mt-0.5 text-[0.825rem] text-foreground">
                    {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-sm tabular-nums"
                    data-numeric
                  >
                    {currencyTRY(r.totalPrice)}
                  </span>
                  <RentalStatusBadge status={r.status} />
                </div>
              </Link>
            ))}
        </FeedCard>

        <FeedCard
          eyebrow="// 02"
          title={t.admin.recentPayments}
          href="/admin/payments"
        >
          {recentPayments.isLoading && <FeedSkeleton rows={4} />}
          {!recentPayments.isLoading &&
            (recentPayments.data?.content.length ?? 0) === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t.admin.paymentsEmpty}
              </p>
            )}
          {!recentPayments.isLoading &&
            recentPayments.data?.content.map((p) => (
              <Link
                key={p.id}
                href={`/admin/payments`}
                className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 transition-colors first:border-t-0 hover:bg-surface-2/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[0.78rem] tabular-nums text-muted-foreground">
                    #{p.id} · rental {p.rentalId}
                  </p>
                  <p className="mt-0.5 text-[0.825rem] text-foreground">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-sm tabular-nums"
                    data-numeric
                  >
                    {currencyTRY(p.amount)}
                  </span>
                  <PaymentStatusBadge status={p.status} />
                </div>
              </Link>
            ))}
        </FeedCard>
      </section>
    </div>
  );
}

function FeedCard({
  eyebrow,
  title,
  href,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground/80">
            {eyebrow}
          </span>
          <span aria-hidden className="h-px w-4 bg-border" />
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
        </div>
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          {t.admin.viewAll}
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
      <div>{children}</div>
    </div>
  );
}

function FeedSkeleton({ rows }: { rows: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5 first:border-t-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
