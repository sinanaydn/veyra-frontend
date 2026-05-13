"use client";

/**
 * Admin · Cars — list with brand + status filters, plus row actions
 * (Düzenle / Görseller / Sil).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  DataTable,
  IdCell,
  NumCell,
} from "@/components/admin/DataTable";
import { Pager } from "@/components/admin/Pager";
import { RowActions, RowIconButton } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCars } from "@/lib/queries/useCars";
import { useBrands } from "@/lib/queries/useBrands";
import { useDeleteCar } from "@/lib/mutations/useCarMutations";
import { isApiError } from "@/lib/api/errors";
import { currencyTRY, formatDate } from "@/lib/format";
import {
  CAR_STATUSES,
  type Car,
  type CarFilter,
  type CarStatus,
} from "@/lib/api/types";
import { t } from "@/messages/tr";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<CarStatus, string> = {
  AVAILABLE: t.admin.statusAvailable,
  RENTED: t.admin.statusRented,
  MAINTENANCE: t.admin.statusMaintenance,
};

const STATUS_TONE: Record<CarStatus, "success" | "accent" | "warning"> = {
  AVAILABLE: "success",
  RENTED: "accent",
  MAINTENANCE: "warning",
};

export default function AdminCarsPage() {
  const router = useRouter();
  const brands = useBrands();
  const [filter, setFilter] = useState<CarFilter>({});
  const [page, setPage] = useState(0);
  const cars = useCars(filter, { page, size: PAGE_SIZE, sort: ["createdAt,desc"] });
  const deleteCar = useDeleteCar();
  const [toDelete, setToDelete] = useState<Car | null>(null);

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCar.mutateAsync(toDelete.id);
      toast.success(t.admin.carDeletedTitle);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const columns: ColumnDef<Car>[] = [
    {
      accessorKey: "id",
      header: t.admin.tableId,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      id: "name",
      header: t.admin.tableName,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {row.original.brandName} {row.original.modelName}
          </p>
          <p className="font-mono text-[0.72rem] tabular-nums text-muted-foreground">
            {row.original.year}
            {row.original.color ? ` · ${row.original.color}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "fuelType",
      header: t.admin.tableFuel,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.fuelType}</span>
      ),
    },
    {
      accessorKey: "transmission",
      header: t.admin.tableTransmission,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.transmission}
        </span>
      ),
    },
    {
      accessorKey: "dailyPrice",
      header: t.admin.tablePrice,
      cell: ({ row }) => <NumCell>{currencyTRY(row.original.dailyPrice)}</NumCell>,
    },
    {
      accessorKey: "status",
      header: t.admin.tableStatus,
      cell: ({ row }) => (
        <StatusPill tone={STATUS_TONE[row.original.status]}>
          {STATUS_LABELS[row.original.status]}
        </StatusPill>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t.admin.tableCreatedAt,
      cell: ({ row }) => (
        <NumCell>{formatDate(row.original.createdAt)}</NumCell>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t.admin.tableActions}</span>,
      cell: ({ row }) => (
        <RowActions>
          <RowIconButton
            label={t.admin.manageImages}
            onClick={() => router.push(`/admin/cars/${row.original.id}/images`)}
          >
            <ImageIcon className="size-4" aria-hidden />
          </RowIconButton>
          <RowIconButton
            label={t.common.edit}
            tone="accent"
            onClick={() => router.push(`/admin/cars/${row.original.id}/edit`)}
          >
            <Pencil className="size-4" aria-hidden />
          </RowIconButton>
          <RowIconButton
            label={t.common.delete}
            tone="danger"
            onClick={() => setToDelete(row.original)}
          >
            <Trash2 className="size-4" aria-hidden />
          </RowIconButton>
        </RowActions>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowCars}
        title={t.admin.sectionCars}
        description={t.admin.carsSubtitle}
        actions={
          <Button nativeButton={false} render={<Link href="/admin/cars/new" />}>
            <Plus className="mr-1.5 size-4" aria-hidden />
            {t.admin.addCar}
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.admin.tableBrand}
          </Label>
          <Select
            value={filter.brandId ? String(filter.brandId) : "all"}
            onValueChange={(v) => {
              setPage(0);
              setFilter((f) => ({
                ...f,
                brandId: v === "all" ? undefined : Number(v),
                modelId: undefined,
              }));
            }}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
              {(brands.data ?? []).map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.admin.filterByStatus}
          </Label>
          <Select
            value={filter.available === undefined ? "all" : filter.available ? "true" : "false"}
            onValueChange={(v) => {
              setPage(0);
              setFilter((f) => ({
                ...f,
                available: v === "all" ? undefined : v === "true",
              }));
            }}
          >
            <SelectTrigger className="min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
              <SelectItem value="true">{t.admin.statusAvailable}</SelectItem>
              <SelectItem value="false">{t.admin.statusRented}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(filter.brandId || filter.available !== undefined) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter({});
              setPage(0);
            }}
          >
            {t.admin.filterReset}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <DataTable
          columns={columns}
          data={cars.data?.content ?? []}
          isLoading={cars.isLoading}
          emptyTitle={t.admin.carsEmpty}
          className="rounded-none border-0"
        />
        <Pager
          page={cars.data?.pageNumber ?? page}
          totalPages={cars.data?.totalPages ?? 0}
          totalElements={cars.data?.totalElements}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={t.admin.confirmDeleteTitle}
        description={t.admin.deleteConfirmIrreversible}
        loading={deleteCar.isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
