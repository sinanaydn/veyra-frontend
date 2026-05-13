"use client";

/**
 * Admin · Car Images — dropzone + reorder grid + delete confirm.
 *
 *  - useCarImages drives the grid (sorted by displayOrder)
 *  - useCar provides title chrome (brand/model)
 *  - 10-image cap enforced client-side (FR-ADM-4)
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageDropzone } from "@/components/admin/ImageDropzone";
import { ImageReorderGrid } from "@/components/admin/ImageReorderGrid";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyRow } from "@/components/admin/EmptyRow";
import { useCar, useCarImages } from "@/lib/queries/useCars";
import { useDeleteCarImage } from "@/lib/mutations/useImageMutations";
import { isApiError } from "@/lib/api/errors";
import type { CarImage } from "@/lib/api/types";
import { t } from "@/messages/tr";

const LIMIT = 10;

export default function AdminCarImagesPage() {
  const params = useParams<{ id: string }>();
  const carId = Number(params.id);
  const car = useCar(carId);
  const images = useCarImages(carId);
  const del = useDeleteCarImage(carId);
  const [toDelete, setToDelete] = useState<CarImage | null>(null);

  const count = images.data?.length ?? 0;
  const remaining = Math.max(0, LIMIT - count);
  const limitReached = count >= LIMIT;

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success(t.admin.imageDeleted);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={`/admin/cars/${carId}/edit`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t.admin.backToCar}
      </Link>

      <AdminPageHeader
        eyebrow={t.admin.eyebrowImages}
        title={
          car.data
            ? `${car.data.brandName} ${car.data.modelName}`
            : t.admin.sectionImages
        }
        description={t.admin.imagesSubtitle}
        actions={
          <span
            className="font-mono text-[0.72rem] tabular-nums text-muted-foreground"
            data-numeric
          >
            {t.admin.imagesLimit.replace("{count}", String(count))}
          </span>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div>
          {limitReached ? (
            <div className="rounded-2xl border border-warning/30 bg-warning/5 px-5 py-6 text-center text-[0.875rem] text-warning">
              {t.admin.imagesLimitReached}
            </div>
          ) : (
            <ImageDropzone
              carId={carId}
              disabled={limitReached}
              remainingSlots={remaining}
            />
          )}
        </div>

        <div>
          {images.isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-20 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </div>
          )}
          {!images.isLoading && count === 0 && (
            <div className="rounded-2xl border border-border bg-surface">
              <EmptyRow title={t.admin.imagesEmpty} />
            </div>
          )}
          {!images.isLoading && count > 0 && (
            <ImageReorderGrid
              carId={carId}
              images={images.data ?? []}
              onRequestDelete={setToDelete}
            />
          )}
        </div>
      </section>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={t.admin.confirmDeleteTitle}
        description={t.admin.deleteConfirmIrreversible}
        loading={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
