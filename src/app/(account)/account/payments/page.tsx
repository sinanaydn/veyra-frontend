/**
 * /account/payments — paged list of the user's payments (T-073).
 *
 * Dense ledger view with mono columns. Each row links to its receipt.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/account/PageHeader";
import { PaymentsList } from "./PaymentsList";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.account.paymentsTitle,
};

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ÖDEMELERIM"
        title={t.account.paymentsTitle}
        description={t.account.paymentsSubtitle}
      />
      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-72 animate-pulse rounded-2xl border border-border bg-surface/60"
          />
        }
      >
        <PaymentsList />
      </Suspense>
    </div>
  );
}
