"use client";

/**
 * Admin · Brands — CRUD on a single-column dataset.
 *
 * Backend brand list is not paginated; we render the full list. Search
 * is purely client-side because the dataset is small.
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  DataTable,
  IdCell,
  NumCell,
} from "@/components/admin/DataTable";
import { RowActions, RowIconButton } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { BrandFormDialog } from "@/components/admin/BrandFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrands } from "@/lib/queries/useBrands";
import { useDeleteBrand } from "@/lib/mutations/useBrandMutations";
import { isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { Brand } from "@/lib/api/types";
import { t } from "@/messages/tr";

export default function AdminBrandsPage() {
  const brands = useBrands();
  const deleteBrand = useDeleteBrand();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Brand | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return brands.data ?? [];
    return (brands.data ?? []).filter((b) =>
      b.name.toLowerCase().includes(term),
    );
  }, [brands.data, search]);

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteBrand.mutateAsync(toDelete.id);
      toast.success(t.admin.brandDeletedTitle);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "id",
      header: t.admin.tableId,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: t.admin.tableName,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t.admin.tableCreatedAt,
      cell: ({ row }) => <NumCell>{formatDate(row.original.createdAt)}</NumCell>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t.admin.tableActions}</span>,
      cell: ({ row }) => (
        <RowActions>
          <RowIconButton
            label={t.common.edit}
            onClick={() => setEditing(row.original)}
            tone="accent"
          >
            <Pencil className="size-4" aria-hidden />
          </RowIconButton>
          <RowIconButton
            label={t.common.delete}
            onClick={() => setToDelete(row.original)}
            tone="danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </RowIconButton>
        </RowActions>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowBrands}
        title={t.admin.sectionBrands}
        description={t.admin.brandsSubtitle}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 size-4" aria-hidden />
            {t.admin.addBrand}
          </Button>
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label={t.common.search}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={brands.isLoading}
        emptyTitle={t.admin.brandsEmpty}
      />

      <BrandFormDialog
        open={creating}
        onOpenChange={setCreating}
        brand={null}
      />
      <BrandFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        brand={editing}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={t.admin.confirmDeleteTitle}
        description={t.admin.deleteConfirmIrreversible}
        loading={deleteBrand.isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
