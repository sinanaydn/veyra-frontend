"use client";

/**
 * Model create/edit dialog. Brand-required.
 */

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modelFormSchema, type ModelFormValues } from "@/lib/validators";
import {
  useCreateModel,
  useUpdateModel,
} from "@/lib/mutations/useModelMutations";
import { useBrands } from "@/lib/queries/useBrands";
import { isApiError } from "@/lib/api/errors";
import type { CarModel } from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model?: CarModel | null;
  defaultBrandId?: number;
}

export function ModelFormDialog({
  open,
  onOpenChange,
  model,
  defaultBrandId,
}: Props) {
  const isEdit = !!model;
  const brands = useBrands();
  const create = useCreateModel();
  const update = useUpdateModel(model?.id ?? 0);
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema) as unknown as Resolver<ModelFormValues>,
    defaultValues: {
      name: model?.name ?? "",
      brandId: model?.brandId ?? defaultBrandId ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: model?.name ?? "",
        brandId: model?.brandId ?? defaultBrandId ?? 0,
      });
    }
  }, [open, model, defaultBrandId, reset]);

  const onSubmit = async (values: ModelFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values);
        toast.success(t.admin.modelUpdatedTitle);
      } else {
        await create.mutateAsync(values);
        toast.success(t.admin.modelCreatedTitle);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t.admin.modelFormEdit : t.admin.modelFormCreate}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Model adını ya da bağlı markayı güncelle."
              : "Bir markaya yeni model ekle."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="model-brand">{t.admin.modelBrandLabel}</Label>
            <Controller
              control={control}
              name="brandId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger
                    id="model-brand"
                    aria-invalid={!!errors.brandId}
                    className={cn(errors.brandId && "border-destructive")}
                  >
                    <SelectValue
                      placeholder={t.admin.fieldBrandPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(brands.data ?? []).map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.brandId && (
              <p className="text-xs text-destructive">
                {errors.brandId.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model-name">{t.admin.modelNameLabel}</Label>
            <Input
              id="model-name"
              autoFocus
              placeholder={t.admin.modelNamePlaceholder}
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
