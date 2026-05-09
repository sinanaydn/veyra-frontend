/**
 * /account/rentals/[id] — rental detail + cancel + pay-now (T-072).
 *
 * Server boundary: awaits params, validates id, renders the client view.
 * The client component owns the queries (rental + car + matching payment).
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RentalDetail } from "./RentalDetail";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.account.rentalDetailTitle,
};

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return <RentalDetail rentalId={id} />;
}
