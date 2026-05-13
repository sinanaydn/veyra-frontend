"use client";

/**
 * Admin · Models — DataTable + brand filter + create/edit dialog.
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, IdCell, NumCell } from "@/components/admin/DataTable";
import { RowActions, RowIconButton } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ModelFormDialog } from "@/components/admin/ModelFormDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useBrands } from "@/lib/queries/useBrands";
import { useModels } from "@/lib/queries/useModels";
import { useDeleteModel } from "@/lib/mutations/useModelMutations";
import { isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { CarModel } from "@/lib/api/types";
import { t } from "@/messages/tr";

export default function AdminModelsPage() {
  const brands = useBrands();
  const [brandFilter, setBrandFilter] = useState<number | "all">("all");
  const models = useModels(
    brandFilter === "all" ? {} : { brandId: brandFilter },
  );
  const deleteModel = useDeleteModel();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CarModel | null>(null);
  const [toDelete, setToDelete] = useState<CarModel | null>(null);

  const data = useMemo(() => models.data ?? [], [models.data]);

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteModel.mutateAsync(toDelete.id);
      toast.success(t.admin.modelDeletedTitle);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const columns: ColumnDef<CarModel>[] = [
    {
      accessorKey: "id",
      header: t.admin.tableId,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      accessorKey: "brandName",
      header: t.admin.tableBrand,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.brandName}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t.admin.tableModel,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
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
        eyebrow={t.admin.eyebrowModels}
        title={t.admin.sectionModels}
        description={t.admin.modelsSubtitle}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 size-4" aria-hidden />
            {t.admin.addModel}
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t.admin.tableBrand}
          </Label>
          <Select
            value={String(brandFilter)}
            onValueChange={(v) =>
              setBrandFilter(v === "all" ? "all" : Number(v))
            }
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
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={models.isLoading}
        emptyTitle={t.admin.modelsEmpty}
      />

      <ModelFormDialog
        open={creating}
        onOpenChange={setCreating}
        model={null}
        defaultBrandId={brandFilter === "all" ? undefined : brandFilter}
      />
      <ModelFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        model={editing}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={t.admin.confirmDeleteTitle}
        description={t.admin.deleteConfirmIrreversible}
        loading={deleteModel.isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
