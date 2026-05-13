"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CarForm } from "@/components/admin/CarForm";
import { useCar } from "@/lib/queries/useCars";
import { t } from "@/messages/tr";

export default function AdminCarEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const car = useCar(id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/cars"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        {t.admin.sectionCars}
      </Link>
      <AdminPageHeader
        eyebrow={t.admin.eyebrowCars}
        title={
          car.data
            ? `${car.data.brandName} ${car.data.modelName}`
            : t.admin.carFormEdit
        }
        description={t.admin.carFormSubtitleEdit}
      />

      {car.isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
        </div>
      )}
      {car.data && <CarForm car={car.data} />}
    </div>
  );
}
