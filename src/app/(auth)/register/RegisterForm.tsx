"use client";

/**
 * Register form — full RegisterRequest schema, password meter, EMAIL_ALREADY_EXISTS
 * surfaced inline on the email field, RATE_LIMIT_EXCEEDED via countdown.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

import { FloatingField } from "@/components/auth/FloatingField";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordMeter } from "@/components/auth/PasswordMeter";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRegister } from "@/lib/mutations/useRegister";
import { useCountdown } from "@/hooks/useCountdown";
import { isApiError } from "@/lib/api/errors";
import { registerSchema, type RegisterFormValues } from "@/lib/validators";
import type { RegisterRequest } from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const countdown = useCountdown();

  const [emailTaken, setEmailTaken] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
    mode: "onSubmit",
  });

  const password =
    useWatch({ control: form.control, name: "password" }) ?? "";

  const onSubmit = form.handleSubmit(async (values) => {
    if (countdown.isActive) return;

    // Strip empty phone — backend treats undefined as "no phone"
    const body: RegisterRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      ...(values.phone && values.phone.trim().length > 0
        ? { phone: values.phone.trim() }
        : {}),
    };

    try {
      await register.mutateAsync(body);
      toast.success(t.auth.registerTitle);
      router.replace("/account");
    } catch (err) {
      if (!isApiError(err)) {
        toast.error(t.errors.networkError);
        return;
      }

      switch (err.errorCode) {
        case "EMAIL_ALREADY_EXISTS":
          setEmailTaken(err.tr);
          form.setFocus("email");
          return;
        case "RATE_LIMIT_EXCEEDED":
          countdown.start(60);
          return;
        case "VALIDATION_ERROR":
          // Map any field-level errors from server, fallback to toast
          if (err.hasFieldErrors) {
            for (const [field, messages] of Object.entries(err.fieldErrors)) {
              form.setError(field as keyof RegisterFormValues, {
                message: messages[0],
              });
            }
          } else {
            toast.error(err.tr);
          }
          return;
        default:
          toast.error(err.tr);
      }
    }
  });

  const submitting = register.isPending;
  const blocked = countdown.isActive;

  // Email error: prefer server-side (taken) over client-side (format)
  const emailError = emailTaken ?? form.formState.errors.email?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {countdown.isActive && (
        <div
          role="alert"
          className={cn(
            "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-[0.85rem] leading-snug",
            "border-warning/30 bg-warning/10",
          )}
        >
          <ShieldAlert
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden
          />
          <span className="flex-1 text-foreground/90">
            {t.auth.rateLimitedPrefix}
            <span
              className="font-mono font-semibold text-warning"
              data-numeric
            >
              {countdown.secondsLeft}
            </span>
            {t.auth.rateLimitedSuffix}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FloatingField
          label={t.auth.firstName}
          autoComplete="given-name"
          autoFocus
          spellCheck={false}
          error={form.formState.errors.firstName?.message}
          {...form.register("firstName")}
        />
        <FloatingField
          label={t.auth.lastName}
          autoComplete="family-name"
          spellCheck={false}
          error={form.formState.errors.lastName?.message}
          {...form.register("lastName")}
        />
      </div>

      <FloatingField
        label={t.auth.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        error={emailError}
        {...form.register("email", { onChange: () => setEmailTaken(null) })}
      />

      <div className="space-y-2">
        <PasswordField
          label={t.auth.password}
          autoComplete="new-password"
          hint={
            !form.formState.errors.password
              ? t.auth.passwordRules
              : undefined
          }
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <PasswordMeter value={password} />
      </div>

      <FloatingField
        label={`${t.auth.phone}`}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        hint={t.auth.phoneHint}
        error={form.formState.errors.phone?.message}
        {...form.register("phone")}
      />

      <SubmitButton
        loading={submitting}
        loadingText={t.auth.signingUp}
        disabled={blocked}
      >
        {t.auth.signUpCta}
      </SubmitButton>
    </form>
  );
}
