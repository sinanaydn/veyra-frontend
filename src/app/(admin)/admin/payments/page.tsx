"use client";

/**
 * Admin · Payments — read-only audit table with userId filter.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, IdCell, NumCell } from "@/components/admin/DataTable";
import { Pager } from "@/components/admin/Pager";
import { PaymentStatusBadge } from "@/components/account/PaymentStatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPayments } from "@/lib/queries/useAdminPayments";
import { currencyTRY, formatDate } from "@/lib/format";
import {
  PAYMENT_STATUSES,
  type Payment,
  type PaymentFilter,
  type PaymentStatus,
} from "@/lib/api/types";
import { t } from "@/messages/tr";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: t.account.paymentPending,
  COMPLETED: t.account.paymentCompleted,
  FAILED: t.account.paymentFailed,
  REFUNDED: t.account.paymentRefunded,
};

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState<PaymentFilter>({});
  const [userIdInput, setUserIdInput] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      const parsed = userIdInput.trim() === "" ? undefined : Number(userIdInput);
      if (parsed !== undefined && Number.isNaN(parsed)) return;
      setFilter((f) => ({ ...f, userId: parsed }));
      setPage(0);
    }, 350);
    return () => clearTimeout(id);
  }, [userIdInput]);

  const payments = useAdminPayments(filter, {
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc"],
  });

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "id",
      header: t.admin.paymentRefShort,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      accessorKey: "rentalId",
      header: t.admin.paymentRentalShort,
      cell: ({ row }) => <NumCell>#{row.original.rentalId}</NumCell>,
    },
    {
      accessorKey: "createdAt",
      header: t.admin.tableCreatedAt,
      cell: ({ row }) => <NumCell>{formatDate(row.original.createdAt)}</NumCell>,
    },
    {
      accessorKey: "amount",
      header: t.admin.tableAmount,
      cell: ({ row }) => <NumCell>{currencyTRY(row.original.amount)}</NumCell>,
    },
    {
      accessorKey: "status",
      header: t.admin.tableStatus,
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
  ];

  const hasFilter = !!filter.userId || !!filter.status;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowPayments}
        title={t.admin.sectionPayments}
        description={t.admin.paymentsAdminSubtitle}
      />

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.admin.filterByUserId}
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="12"
            className="w-32 font-mono tabular-nums"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.admin.filterByStatus}
          </Label>
          <Select
            value={filter.status ?? "all"}
            onValueChange={(v) => {
              setPage(0);
              setFilter((f) => ({
                ...f,
                status: v === "all" ? undefined : (v as PaymentStatus),
              }));
            }}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter({});
              setUserIdInput("");
              setPage(0);
            }}
          >
            <X className="mr-1.5 size-3.5" aria-hidden />
            {t.admin.filterReset}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <DataTable
          columns={columns}
          data={payments.data?.content ?? []}
          isLoading={payments.isLoading}
          emptyTitle={t.admin.paymentsEmpty}
          className="rounded-none border-0"
        />
        <Pager
          page={payments.data?.pageNumber ?? page}
          totalPages={payments.data?.totalPages ?? 0}
          totalElements={payments.data?.totalElements}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
