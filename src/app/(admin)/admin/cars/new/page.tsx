"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CarForm } from "@/components/admin/CarForm";
import { t } from "@/messages/tr";

export default function AdminCarNewPage() {
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
        title={t.admin.carFormCreate}
        description={t.admin.carFormSubtitleCreate}
      />
      <CarForm />
    </div>
  );
}
