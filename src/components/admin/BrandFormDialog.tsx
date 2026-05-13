"use client";

/**
 * Brand create/edit dialog. Single field, single submit.
 *
 * Uses RHF + zod (brandFormSchema). Surfaces ApiError.tr inline.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { brandFormSchema, type BrandFormValues } from "@/lib/validators";
import { useCreateBrand, useUpdateBrand } from "@/lib/mutations/useBrandMutations";
import { isApiError } from "@/lib/api/errors";
import type { Brand } from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

export function BrandFormDialog({ open, onOpenChange, brand }: Props) {
  const isEdit = !!brand;
  const create = useCreateBrand();
  const update = useUpdateBrand(brand?.id ?? 0);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: brand?.name ?? "" },
  });

  useEffect(() => {
    if (open) reset({ name: brand?.name ?? "" });
  }, [open, brand, reset]);

  const onSubmit = async (values: BrandFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values);
        toast.success(t.admin.brandUpdatedTitle);
      } else {
        await create.mutateAsync(values);
        toast.success(t.admin.brandCreatedTitle);
      }
      onOpenChange(false);
    } catch (err) {
      const msg = isApiError(err) ? err.tr : t.errors.networkError;
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.admin.brandFormEdit : t.admin.brandFormCreate}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Marka adını güncelle."
              : "Filona yeni bir marka ekle."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">{t.admin.brandNameLabel}</Label>
            <Input
              id="brand-name"
              autoFocus
              placeholder={t.admin.brandNamePlaceholder}
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
