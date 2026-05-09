"use client";

import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";

import { usePayment } from "@/lib/queries/usePayments";
import { PageHeader } from "@/components/account/PageHeader";
import { PaymentReceipt } from "@/components/account/PaymentReceipt";
import { EmptyState } from "@/components/account/EmptyState";
import { ErrorState } from "@/components/account/ErrorState";
import { t } from "@/messages/tr";

interface Props {
  paymentId: number;
}

export function PaymentReceiptPage({ paymentId }: Props) {
  const payment = usePayment(paymentId);

  if (payment.isLoading) {
    return (
      <div
        aria-hidden
        className="h-96 animate-pulse rounded-2xl border border-border bg-surface/60"
      />
    );
  }

  if (payment.isError) {
    return (
      <ErrorState error={payment.error} onRetry={() => payment.refetch()} />
    );
  }

  if (!payment.data) {
    return (
      <EmptyState
        icon={Receipt}
        title={t.errors.notFoundTitle}
        description={t.errors.notFoundDescription}
        ctaHref="/account/payments"
        ctaLabel={t.account.paymentsTitle}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/account/payments"
        className="group/back inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft
          className="size-3 transition-transform group-hover/back:-translate-x-0.5"
          aria-hidden
        />
        {t.account.paymentsTitle}
      </Link>

      <PageHeader
        eyebrow="MAKBUZ"
        title={t.account.receiptTitle}
        description={t.account.receiptSubtitle}
      />

      <PaymentReceipt payment={payment.data} />
    </div>
  );
}
