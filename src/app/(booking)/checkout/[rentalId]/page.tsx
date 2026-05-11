/**
 * /checkout/[rentalId] — payment surface (T-080).
 *
 * Server boundary: validates the rentalId, hands off to the client view
 * which owns the rental query, idempotency UUID and payment mutation.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.booking.checkoutTitle,
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const { rentalId: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return <CheckoutClient rentalId={id} />;
}
