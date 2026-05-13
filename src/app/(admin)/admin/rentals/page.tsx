"use client";

/**
 * Admin · Rentals — filter by userId/status, complete + cancel actions.
 *
 * userId filter is a numeric input (debounced); status is a select. Both
 * sync via local state — admin rentals is task-driven, no URL share.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Check, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, IdCell, NumCell } from "@/components/admin/DataTable";
import { Pager } from "@/components/admin/Pager";
import { RowActions, RowIconButton } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RentalStatusBadge } from "@/components/account/RentalStatusBadge";
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
import { useAllRentals } from "@/lib/queries/useRentals";
import {
  useCompleteRentalAdmin,
  useCancelRentalAdmin,
} from "@/lib/mutations/useAdminRentalActions";
import { isApiError } from "@/lib/api/errors";
import { currencyTRY, formatDate } from "@/lib/format";
import {
  RENTAL_STATUSES,
  type Rental,
  type RentalFilter,
  type RentalStatus,
} from "@/lib/api/types";
import { t } from "@/messages/tr";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING: t.account.statusPending,
  CONFIRMED: t.account.statusConfirmed,
  ACTIVE: t.account.statusActive,
  COMPLETED: t.account.statusCompleted,
  CANCELLED: t.account.statusCancelled,
};

export default function AdminRentalsPage() {
  const [filter, setFilter] = useState<RentalFilter>({});
  const [userIdInput, setUserIdInput] = useState("");
  const [page, setPage] = useState(0);

  // Debounce the userId input → filter.
  useEffect(() => {
    const id = setTimeout(() => {
      const parsed = userIdInput.trim() === "" ? undefined : Number(userIdInput);
      if (parsed !== undefined && Number.isNaN(parsed)) return;
      setFilter((f) => ({ ...f, userId: parsed }));
      setPage(0);
    }, 350);
    return () => clearTimeout(id);
  }, [userIdInput]);

  const rentals = useAllRentals(filter, {
    page,
    size: PAGE_SIZE,
    sort: ["createdAt,desc"],
  });

  const complete = useCompleteRentalAdmin();
  const cancel = useCancelRentalAdmin();
  const [toComplete, setToComplete] = useState<Rental | null>(null);
  const [toCancel, setToCancel] = useState<Rental | null>(null);

  const onComplete = async () => {
    if (!toComplete) return;
    try {
      await complete.mutateAsync(toComplete.id);
      toast.success(t.admin.rentalCompletedTitle);
      setToComplete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const onCancel = async () => {
    if (!toCancel) return;
    try {
      await cancel.mutateAsync(toCancel.id);
      toast.success(t.admin.rentalCancelledTitle);
      setToCancel(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const columns: ColumnDef<Rental>[] = [
    {
      accessorKey: "id",
      header: t.admin.tableId,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      accessorKey: "userId",
      header: t.admin.tableCustomer,
      cell: ({ row }) => <NumCell>user #{row.original.userId}</NumCell>,
    },
    {
      accessorKey: "carId",
      header: "Araç",
      cell: ({ row }) => <NumCell>car #{row.original.carId}</NumCell>,
    },
    {
      id: "dates",
      header: t.admin.tableDates,
      cell: ({ row }) => (
        <NumCell>
          {formatDate(row.original.startDate)} → {formatDate(row.original.endDate)}
        </NumCell>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: t.admin.tableTotal,
      cell: ({ row }) => <NumCell>{currencyTRY(row.original.totalPrice)}</NumCell>,
    },
    {
      accessorKey: "status",
      header: t.admin.tableStatus,
      cell: ({ row }) => <RentalStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t.admin.tableActions}</span>,
      cell: ({ row }) => {
        const isActive = row.original.status === "ACTIVE";
        const isTerminal =
          row.original.status === "COMPLETED" ||
          row.original.status === "CANCELLED";
        return (
          <RowActions>
            {isActive && (
              <RowIconButton
                label={t.admin.completeRental}
                tone="accent"
                onClick={() => setToComplete(row.original)}
              >
                <Check className="size-4" aria-hidden />
              </RowIconButton>
            )}
            {!isTerminal && (
              <RowIconButton
                label={t.admin.cancelRentalAdmin}
                tone="danger"
                onClick={() => setToCancel(row.original)}
              >
                <Ban className="size-4" aria-hidden />
              </RowIconButton>
            )}
            {isTerminal && (
              <span className="px-2 text-xs text-muted-foreground">—</span>
            )}
          </RowActions>
        );
      },
    },
  ];

  const hasFilter = !!filter.userId || !!filter.status;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowRentals}
        title={t.admin.sectionRentals}
        description={t.admin.rentalsAdminSubtitle}
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
                status: v === "all" ? undefined : (v as RentalStatus),
              }));
            }}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
              {RENTAL_STATUSES.map((s) => (
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
          data={rentals.data?.content ?? []}
          isLoading={rentals.isLoading}
          emptyTitle={t.admin.rentalsEmpty}
          className="rounded-none border-0"
        />
        <Pager
          page={rentals.data?.pageNumber ?? page}
          totalPages={rentals.data?.totalPages ?? 0}
          totalElements={rentals.data?.totalElements}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!toComplete}
        onOpenChange={(v) => !v && setToComplete(null)}
        variant="default"
        title={t.admin.completeRental}
        description={t.admin.rentalCompleteConfirm}
        confirmLabel={t.common.confirm}
        loading={complete.isPending}
        onConfirm={onComplete}
      />
      <ConfirmDialog
        open={!!toCancel}
        onOpenChange={(v) => !v && setToCancel(null)}
        title={t.admin.cancelRentalAdmin}
        description={t.admin.rentalCancelConfirmAdmin}
        loading={cancel.isPending}
        onConfirm={onCancel}
      />
    </div>
  );
}
