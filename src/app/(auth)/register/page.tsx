/**
 * /register — T-061
 *
 * Full RegisterRequest form: firstName, lastName, email, password, phone(opt).
 * Surfaces EMAIL_ALREADY_EXISTS inline on the email field, RATE_LIMIT_EXCEEDED
 * via countdown banner. On success, BFF auto-logs in → redirect to /account.
 */

import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: "Hesap oluştur",
  description: t.auth.registerSubtitle,
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="02 — KAYIT"
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      footerPrompt={t.auth.haveAccount}
      footerLinkText={t.auth.signInCta}
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthShell>
  );
}
