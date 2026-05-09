/**
 * /account/payments/[id] — single payment receipt (T-073).
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PaymentReceiptPage } from "./PaymentReceiptPage";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.account.receiptTitle,
};

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  return <PaymentReceiptPage paymentId={id} />;
}
