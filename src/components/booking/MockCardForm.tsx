"use client";

/**
 * MockCardForm — cosmetic card form (FR-PAY-2). Submission triggers
 * `onSubmit()` from parent which calls usePay(); the card values are
 * NEVER sent to the backend (only `{ rentalId }` + idempotency header).
 *
 * This form drives the live <CardPreview/>. The preview lives at the
 * parent level so the layout can choose composition (side-by-side on
 * desktop, stacked on mobile).
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";
import {
  detectBrand,
  formatCardNumber,
  type CardBrand,
} from "./CardPreview";

// ============================================================
// Schema — cosmetic, just format-validates so the user feels grounded
// ============================================================

const expiryRe = /^(0[1-9]|1[0-2])\/(\d{2})$/;

const schema = z.object({
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 13 && v.length <= 19, {
      message: t.booking.cardNumberInvalid,
    }),
  cardName: z
    .string()
    .trim()
    .min(2, { message: t.booking.cardNameInvalid })
    .max(40),
  cardExpiry: z
    .string()
    .regex(expiryRe, { message: t.booking.cardExpiryInvalid })
    .refine(
      (v) => {
        const [mm, yy] = v.split("/").map(Number);
        const now = new Date();
        const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
        return exp.getTime() >= now.getTime();
      },
      { message: t.booking.cardExpiryPast },
    ),
  cardCvc: z
    .string()
    .regex(/^\d{3,4}$/, { message: t.booking.cardCvcInvalid }),
});

export type CardFormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: () => void;
  pending: boolean;
  errorText?: string | null;
  /** Reports current card-side state to parent (for the live preview). */
  onPreview?: (state: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
    brand: CardBrand;
    flipped: boolean;
  }) => void;
}

export function MockCardForm({ onSubmit, pending, errorText, onPreview }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CardFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const [cvcFocused, setCvcFocused] = React.useState(false);

  const number = watch("cardNumber") ?? "";
  const name = watch("cardName") ?? "";
  const expiry = watch("cardExpiry") ?? "";
  const cvc = watch("cardCvc") ?? "";
  const brand = React.useMemo(() => detectBrand(number), [number]);

  // Keep parent in sync for the live preview
  React.useEffect(() => {
    onPreview?.({
      number,
      name,
      expiry,
      cvc,
      brand,
      flipped: cvcFocused,
    });
  }, [number, name, expiry, cvc, brand, cvcFocused, onPreview]);

  const submit = handleSubmit(() => onSubmit());
  const busy = pending || isSubmitting;

  // Formatters that rewrite the field as the user types
  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value, detectBrand(e.target.value));
    setValue("cardNumber", formatted, { shouldValidate: false });
  };
  const onExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const out =
      digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setValue("cardExpiry", out, { shouldValidate: false });
  };
  const onCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue("cardCvc", digits, { shouldValidate: false });
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FieldRow>
        <Field
          label={t.booking.cardNumber}
          error={errors.cardNumber?.message}
          numeric
          full
        >
          <input
            {...register("cardNumber")}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            onChange={onNumberChange}
            maxLength={brand === "amex" ? 17 : 23}
            className={inputClass}
            aria-invalid={!!errors.cardNumber}
          />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field label={t.booking.cardName} error={errors.cardName?.message} full>
          <input
            {...register("cardName")}
            autoComplete="cc-name"
            placeholder="AD SOYAD"
            className={cn(inputClass, "uppercase tracking-[0.05em]")}
            aria-invalid={!!errors.cardName}
          />
        </Field>
      </FieldRow>

      <FieldRow>
        <Field
          label={t.booking.cardExpiry}
          error={errors.cardExpiry?.message}
          numeric
          half
        >
          <input
            {...register("cardExpiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder={t.booking.cardExpiryPlaceholder}
            onChange={onExpiryChange}
            maxLength={5}
            className={inputClass}
            aria-invalid={!!errors.cardExpiry}
          />
        </Field>
        <Field
          label={t.booking.cardCvc}
          error={errors.cardCvc?.message}
          numeric
          half
        >
          <input
            {...register("cardCvc")}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={t.booking.cardCvcPlaceholder}
            onChange={onCvcChange}
            onFocus={() => setCvcFocused(true)}
            onBlur={() => setCvcFocused(false)}
            maxLength={4}
            className={inputClass}
            aria-invalid={!!errors.cardCvc}
          />
        </Field>
      </FieldRow>

      {errorText && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[0.85rem] text-destructive"
        >
          {errorText}
        </p>
      )}

      <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
        <Lock className="size-3" aria-hidden />
        {t.booking.checkoutSecureLine}
      </p>

      <Button
        type="submit"
        disabled={busy}
        className="group relative h-12 w-full overflow-hidden text-[0.95rem] font-medium"
      >
        <span
          className={cn(
            "inline-flex items-center gap-2 transition-transform",
            busy && "translate-y-6 opacity-0",
          )}
        >
          <Lock className="size-4" aria-hidden />
          {t.booking.payCta}
        </span>
        <span
          className={cn(
            "absolute inset-0 inline-flex items-center justify-center gap-2 transition-transform",
            busy ? "translate-y-0" : "-translate-y-6 opacity-0",
          )}
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t.booking.paying}
        </span>
      </Button>

      <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground/80">
        {t.booking.cardSecureNote}
      </p>
    </form>
  );
}

// ============================================================
// Field primitives — floating label, mono numerals, accent ring
// ============================================================

const inputClass = cn(
  "peer w-full bg-transparent pb-2 pt-5 text-[0.95rem] text-foreground placeholder:text-muted-foreground/40",
  "outline-none focus:placeholder:text-muted-foreground/30",
  "[font-feature-settings:'ss01','tnum'] tabular-nums",
);

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-5">{children}</div>;
}

function Field({
  label,
  error,
  children,
  half,
  full,
  numeric,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  half?: boolean;
  full?: boolean;
  numeric?: boolean;
}) {
  return (
    <label
      className={cn(
        "group relative block min-w-0 flex-1",
        full && "basis-full",
        half && "basis-[calc(50%-0.5rem)]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0 top-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors",
          numeric && "tabular-nums",
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "relative border-b transition-colors",
          error
            ? "border-destructive"
            : "border-border focus-within:border-accent",
        )}
      >
        {children}
        {/* Animated accent underline */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-300",
            "group-focus-within:scale-x-100",
            error && "bg-destructive scale-x-100",
          )}
        />
      </div>
      {error && (
        <span className="mt-1 block text-[0.72rem] text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
