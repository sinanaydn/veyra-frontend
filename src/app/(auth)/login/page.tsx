/**
 * /login — T-060
 *
 * Client component. Handles:
 *   - email + password form (RHF + zod)
 *   - INVALID_CREDENTIALS → inline form error
 *   - ACCOUNT_LOCKED → persistent banner (clears on successful submit)
 *   - RATE_LIMIT_EXCEEDED → 60-s countdown banner
 *   - Successful login → router.replace(?redirect= ?? /account)
 *
 * Wrapped in <Suspense> because useSearchParams suspends.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm, LoginFormSkeleton } from "./LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: "Giriş yap",
  description: t.auth.loginSubtitle,
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="01 — GİRİŞ"
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      footerPrompt={t.auth.noAccountYet}
      footerLinkText={t.auth.signUpCta}
      footerLinkHref="/register"
    >
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
