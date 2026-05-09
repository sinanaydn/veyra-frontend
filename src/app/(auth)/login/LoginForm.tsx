"use client";

/**
 * Login form — handles validation, error mapping, and post-submit routing.
 *
 * Error states:
 *   - INVALID_CREDENTIALS → inline ApiError banner (clears on next change)
 *   - ACCOUNT_LOCKED → sticky banner with lockout copy
 *   - RATE_LIMIT_EXCEEDED → countdown banner; submit button disabled while active
 *   - Network / 5xx → toast via sonner
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";

import { FloatingField } from "@/components/auth/FloatingField";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useLogin } from "@/lib/mutations/useLogin";
import { useCountdown } from "@/hooks/useCountdown";
import { type ApiError, isApiError } from "@/lib/api/errors";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

/** Only allow same-origin paths as redirect targets — prevents open-redirect. */
function safeRedirect(value: string | null): string {
  if (!value) return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));

  const login = useLogin();
  const countdown = useCountdown();

  const [locked, setLocked] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const clearCredentialError = () => setCredentialError(null);

  const onSubmit = form.handleSubmit(async (values) => {
    if (countdown.isActive) return;

    try {
      await login.mutateAsync(values);
      // Hard nav so server components see the cookie immediately
      router.replace(redirectTo);
    } catch (err) {
      if (!isApiError(err)) {
        toast.error(t.errors.networkError);
        return;
      }
      handleApiError(err);
    }
  });

  function handleApiError(err: ApiError) {
    switch (err.errorCode) {
      case "INVALID_CREDENTIALS":
        setCredentialError(err.tr);
        // Don't reveal which field — focus password & clear it
        form.resetField("password", { defaultValue: "" });
        form.setFocus("password");
        return;

      case "ACCOUNT_LOCKED":
        setLocked(true);
        return;

      case "RATE_LIMIT_EXCEEDED":
        countdown.start(60);
        return;

      default:
        toast.error(err.tr);
    }
  }

  const submitting = login.isPending;
  const blocked = locked || countdown.isActive;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby="login-status"
    >
      {/* Sticky banners — render before fields so SR users hear them first */}
      <div id="login-status" className="space-y-3">
        {locked && (
          <Banner tone="warning" icon={Lock}>
            {t.auth.accountLockedBanner}
          </Banner>
        )}
        {countdown.isActive && (
          <Banner tone="warning" icon={ShieldAlert}>
            <span>
              {t.auth.rateLimitedPrefix}
              <span
                className="font-mono font-semibold text-warning"
                data-numeric
              >
                {countdown.secondsLeft}
              </span>
              {t.auth.rateLimitedSuffix}
            </span>
          </Banner>
        )}
        {credentialError && !locked && !countdown.isActive && (
          <Banner tone="danger" icon={AlertTriangle}>
            {credentialError}
          </Banner>
        )}
      </div>

      {/* Fields — staggered reveal */}
      <div
        className="space-y-4 motion-reduce:[&>*]:animate-none"
        style={{
          // Tiny CSS-only stagger — shows polish without a motion lib
          animation: "none",
        }}
      >
        <FloatingField
          label={t.auth.email}
          type="email"
          autoComplete="email"
          autoFocus
          inputMode="email"
          spellCheck={false}
          error={form.formState.errors.email?.message}
          {...form.register("email", { onChange: clearCredentialError })}
        />

        <PasswordField
          label={t.auth.password}
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register("password", { onChange: clearCredentialError })}
        />
      </div>

      {/* Forgot password — placeholder per spec (no backend) */}
      <div className="flex justify-end">
        <Link
          href="#"
          aria-disabled
          onClick={(e) => {
            e.preventDefault();
            toast.info(t.auth.forgotPasswordSoon);
          }}
          className="text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.auth.forgotPassword}
        </Link>
      </div>

      <SubmitButton
        loading={submitting}
        loadingText={t.auth.signingIn}
        disabled={blocked}
      >
        {t.auth.signInCta}
      </SubmitButton>
    </form>
  );
}

export function LoginFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-14 animate-pulse rounded-xl bg-surface" />
      <div className="h-14 animate-pulse rounded-xl bg-surface" />
      <div className="h-12 animate-pulse rounded-full bg-surface" />
    </div>
  );
}

// ============================================================
// Banner — local primitive (only used here & on register)
// ============================================================

interface BannerProps {
  tone: "danger" | "warning";
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function Banner({ tone, icon: Icon, children }: BannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-[0.85rem] leading-snug",
        tone === "danger" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1 text-foreground/90">{children}</div>
    </div>
  );
}
