/**
 * /booking/[rentalId]/confirmation — post-payment polling page (T-081).
 *
 * Server boundary only validates the id; the client owns the polling
 * lifecycle (every 2 s, max 15 s) per FR-PAY-4.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmationClient } from "./ConfirmationClient";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.booking.confirmedTitle,
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const { rentalId: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  return <ConfirmationClient rentalId={id} />;
}
