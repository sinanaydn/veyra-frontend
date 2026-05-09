"use client";

/**
 * Ledger-style payment list.
 *
 * Layout pattern:
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │  TX                  TARİH                  TUTAR     DURUM    │
 *   ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
 *   │  TX·#00012           14 May 2026, 12:42    3.600 ₺  ✓ TAM.    │
 *   │  TX·#00011           02 May 2026, 09:15    2.400 ₺  ✓ TAM.    │
 *   └───────────────────────────────────────────────────────────────┘
 *
 * On mobile collapses into stacked cards.
 */

import Link from "next/link";
import { ArrowUpRight, Receipt } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { useMyPayments } from "@/lib/queries/usePayments";
import { PaymentStatusBadge } from "@/components/account/PaymentStatusBadge";
import { EmptyState } from "@/components/account/EmptyState";
import { ErrorState } from "@/components/account/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { currencyTRY, formatDateTime } from "@/lib/format";
import { t } from "@/messages/tr";

const PAGE_SIZE = 12;

export function PaymentsList() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(0).withOptions({ history: "push" }),
  );

  const payments = useMyPayments({
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc"],
  });

  if (payments.isLoading && !payments.data) {
    return (
      <div
        aria-hidden
        className="h-72 animate-pulse rounded-2xl border border-border bg-surface/60"
      />
    );
  }

  if (payments.isError && !payments.data) {
    return (
      <ErrorState error={payments.error} onRetry={() => payments.refetch()} />
    );
  }

  if (!payments.data || payments.data.content.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={t.account.paymentsEmpty}
        description={t.account.paymentsEmptySub}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <div
          aria-hidden
          className="grid grid-cols-[140px_1fr_140px_120px_44px] gap-4 border-b border-border/60 bg-surface-2/40 px-5 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <span>{t.account.paymentRef}</span>
          <span>{t.account.paymentDate}</span>
          <span className="text-right">{t.account.paymentAmount}</span>
          <span>{t.account.receiptStatus}</span>
          <span aria-hidden />
        </div>
        <ul>
          {payments.data.content.map((p) => {
            const padded = String(p.id).padStart(5, "0");
            return (
              <li
                key={p.id}
                className="border-b border-border/40 last:border-b-0"
              >
                <Link
                  href={`/account/payments/${p.id}`}
                  className="group/row grid grid-cols-[140px_1fr_140px_120px_44px] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/40"
                >
                  <span
                    className="font-mono text-[0.78rem] uppercase tracking-[0.14em]"
                    data-numeric
                  >
                    <span className="text-accent">TX</span>
                    <span aria-hidden className="mx-1 text-border">·</span>
                    <span className="text-foreground/85">#{padded}</span>
                  </span>
                  <span
                    className="font-mono text-[0.85rem] tabular-nums text-foreground/90"
                    data-numeric
                  >
                    {formatDateTime(p.createdAt)}
                  </span>
                  <span
                    className="text-right font-mono text-[0.95rem] font-semibold tabular-nums"
                    data-numeric
                  >
                    {currencyTRY(p.amount)}
                  </span>
                  <span>
                    <PaymentStatusBadge status={p.status} />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-all group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile stack */}
      <ul className="space-y-2 md:hidden">
        {payments.data.content.map((p) => {
          const padded = String(p.id).padStart(5, "0");
          return (
            <li key={p.id}>
              <Link
                href={`/account/payments/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40"
              >
                <div className="min-w-0">
                  <p
                    className="font-mono text-[0.75rem] uppercase tracking-[0.14em]"
                    data-numeric
                  >
                    <span className="text-accent">TX</span>
                    <span aria-hidden className="mx-1 text-border">·</span>
                    <span className="text-foreground/85">#{padded}</span>
                  </p>
                  <p
                    className="mt-1 font-mono text-[0.78rem] tabular-nums text-muted-foreground"
                    data-numeric
                  >
                    {formatDateTime(p.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-mono text-[1rem] font-semibold tabular-nums"
                    data-numeric
                  >
                    {currencyTRY(p.amount)}
                  </p>
                  <PaymentStatusBadge status={p.status} className="mt-1" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Pagination
        page={page}
        totalPages={payments.data.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
