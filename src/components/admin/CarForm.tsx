"use client";

/**
 * Reusable Car form — used by /admin/cars/new and /admin/cars/[id]/edit.
 *
 * On create: omits `status` (backend defaults to AVAILABLE).
 * On edit: requires `status` per UpdateCarRequest.
 *
 * Brand → Model cascade: model select resets whenever brand changes.
 */

import { useEffect, useMemo } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrands } from "@/lib/queries/useBrands";
import { useModels } from "@/lib/queries/useModels";
import { useCreateCar, useUpdateCar } from "@/lib/mutations/useCarMutations";
import { carFormSchema, type CarFormValues } from "@/lib/validators";
import { isApiError } from "@/lib/api/errors";
import {
  CAR_STATUSES,
  FUEL_TYPES,
  TRANSMISSIONS,
  type Car,
  type CreateCarRequest,
  type FuelType,
  type Transmission,
  type CarStatus,
} from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  /** When set, form is in edit mode. */
  car?: Car;
}

const FUEL_LABELS: Record<FuelType, string> = {
  GASOLINE: t.cars.fuelGasoline,
  DIESEL: t.cars.fuelDiesel,
  ELECTRIC: t.cars.fuelElectric,
  HYBRID: t.cars.fuelHybrid,
};

const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: t.cars.transmissionManual,
  AUTOMATIC: t.cars.transmissionAutomatic,
};

const STATUS_LABELS: Record<CarStatus, string> = {
  AVAILABLE: t.admin.statusAvailable,
  RENTED: t.admin.statusRented,
  MAINTENANCE: t.admin.statusMaintenance,
};

type FormShape = CarFormValues;

export function CarForm({ car }: Props) {
  const router = useRouter();
  const isEdit = !!car;
  const brands = useBrands();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar(car?.id ?? 0);
  const pending = createCar.isPending || updateCar.isPending;

  const defaults: FormShape = useMemo(
    () => ({
      brandId: car?.brandId ?? 0,
      modelId: car?.modelId ?? 0,
      year: car?.year ?? new Date().getFullYear(),
      doors: car?.doors ?? 4,
      baggages: car?.baggages ?? 2,
      seats: car?.seats ?? 5,
      dailyPrice: car?.dailyPrice ?? 1000,
      fuelType: car?.fuelType ?? "GASOLINE",
      transmission: car?.transmission ?? "AUTOMATIC",
      color: car?.color ?? "",
      mileage: car?.mileage ?? 0,
      description: car?.description ?? "",
      status: car?.status ?? "AVAILABLE",
    }),
    [car],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormShape>({
    resolver: zodResolver(carFormSchema) as unknown as Resolver<FormShape>,
    defaultValues: defaults,
  });

  const brandId = watch("brandId");
  const models = useModels(brandId ? { brandId } : {});

  // Reset modelId when brand changes (unless it's the initial render of an
  // existing car whose model already matches).
  useEffect(() => {
    if (!isEdit) return;
    if (car?.brandId === brandId) return;
    setValue("modelId", 0);
  }, [brandId, car?.brandId, isEdit, setValue]);

  const onSubmit = async (values: FormShape) => {
    try {
      if (isEdit && car) {
        await updateCar.mutateAsync({
          modelId: values.modelId,
          dailyPrice: values.dailyPrice,
          fuelType: values.fuelType,
          transmission: values.transmission,
          status: values.status ?? "AVAILABLE",
          year: values.year,
          doors: values.doors,
          baggages: values.baggages,
          seats: values.seats,
          color: values.color || undefined,
          mileage: values.mileage,
          description: values.description || undefined,
        });
        toast.success(t.admin.carUpdatedTitle);
        router.push(`/admin/cars`);
      } else {
        const body: CreateCarRequest = {
          modelId: values.modelId,
          year: values.year,
          doors: values.doors,
          baggages: values.baggages,
          seats: values.seats,
          dailyPrice: values.dailyPrice,
          fuelType: values.fuelType,
          transmission: values.transmission,
          color: values.color || undefined,
          mileage: values.mileage,
          description: values.description || undefined,
        };
        const created = await createCar.mutateAsync(body);
        toast.success(t.admin.carCreatedTitle);
        router.push(`/admin/cars/${created.id}/images`);
      }
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {/* Section: Identity */}
      <Fieldset eyebrow="// 01" title="Kimlik">
        <Row>
          <FieldGroup
            label={t.admin.fieldBrand}
            error={errors.brandId?.message}
          >
            <Controller
              control={control}
              name="brandId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
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
          </FieldGroup>

          <FieldGroup
            label={t.admin.fieldModel}
            error={errors.modelId?.message}
          >
            <Controller
              control={control}
              name="modelId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                  disabled={!brandId || models.isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t.admin.fieldModelPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(models.data ?? []).map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>
        </Row>

        <Row>
          <FieldGroup
            label={t.admin.fieldYear}
            error={errors.year?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              aria-invalid={!!errors.year}
              className={cn(errors.year && "border-destructive")}
              {...register("year")}
            />
          </FieldGroup>
          <FieldGroup
            label={t.admin.fieldColor}
            error={errors.color?.message}
          >
            <Input
              placeholder="Örn. Lacivert"
              {...register("color")}
            />
          </FieldGroup>
        </Row>
      </Fieldset>

      {/* Section: Mechanics */}
      <Fieldset eyebrow="// 02" title="Mekanik">
        <Row>
          <FieldGroup
            label={t.admin.fieldFuel}
            error={errors.fuelType?.message}
          >
            <Controller
              control={control}
              name="fuelType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {FUEL_LABELS[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>
          <FieldGroup
            label={t.admin.fieldTransmission}
            error={errors.transmission?.message}
          >
            <Controller
              control={control}
              name="transmission"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((tr) => (
                      <SelectItem key={tr} value={tr}>
                        {TRANSMISSION_LABELS[tr]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>
        </Row>

        <Row cols={4}>
          <FieldGroup
            label={t.admin.fieldDoors}
            error={errors.doors?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              {...register("doors")}
            />
          </FieldGroup>
          <FieldGroup
            label={t.admin.fieldSeats}
            error={errors.seats?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              {...register("seats")}
            />
          </FieldGroup>
          <FieldGroup
            label={t.admin.fieldBaggages}
            error={errors.baggages?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              {...register("baggages")}
            />
          </FieldGroup>
          <FieldGroup
            label={t.admin.fieldMileage}
            error={errors.mileage?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              {...register("mileage")}
            />
          </FieldGroup>
        </Row>
      </Fieldset>

      {/* Section: Commerce */}
      <Fieldset eyebrow="// 03" title="Ticaret">
        <Row>
          <FieldGroup
            label={t.admin.fieldDailyPrice}
            error={errors.dailyPrice?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              className="font-mono tabular-nums"
              {...register("dailyPrice")}
            />
          </FieldGroup>
          {isEdit && (
            <FieldGroup
              label={t.admin.fieldStatus}
              error={errors.status?.message}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "AVAILABLE"}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldGroup>
          )}
        </Row>

        <FieldGroup
          label={t.admin.fieldDescription}
          error={errors.description?.message}
        >
          <Textarea
            rows={4}
            placeholder="Aracın öne çıkan özelliklerini birkaç cümleyle anlat."
            {...register("description")}
          />
        </FieldGroup>
      </Fieldset>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
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
      </div>
    </form>
  );
}

// ------ Internal helpers ------

function Fieldset({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <header className="mb-5 flex items-center gap-2.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground/80">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px w-4 bg-border" />
        <h2 className="text-[0.95rem] font-semibold">{title}</h2>
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Row({
  cols = 2,
  children,
}: {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
