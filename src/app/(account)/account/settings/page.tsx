/**
 * /account/settings — read-only profile (per GAP-1) + danger zone (T-074).
 *
 * GAP-1: backend has no customer self-update endpoint. Profile fields are
 * shown as read-only with a support note. The danger zone allows hard
 * delete via DELETE /users/me through <DeleteAccountDialog>.
 */

import type { Metadata } from "next";
import { Info, ShieldAlert } from "lucide-react";

import { readSession } from "@/lib/rbac";
import { PageHeader } from "@/components/account/PageHeader";
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog";
import { t } from "@/messages/tr";

export const metadata: Metadata = {
  title: t.account.settingsTitle,
};

export default async function SettingsPage() {
  const session = await readSession();
  if (!session) return null;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="AYARLAR"
        title={t.account.settingsTitle}
        description={t.account.settingsSubtitle}
      />

      {/* Read-only profile */}
      <section className="rounded-2xl border border-border bg-surface">
        <header className="flex items-center gap-2 border-b border-border/60 px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          <Info className="size-3.5 text-accent" aria-hidden />
          {t.account.profileTitle}
        </header>

        <dl className="divide-y divide-border/50">
          <Row label={t.account.profileEmail} value={session.email} mono />
          <Row label="Rol" value={session.role === "ADMIN" ? "Yönetici" : "Kullanıcı"} />
          <Row
            label={t.account.profileFullName}
            value={t.account.profilePhoneEmpty}
            muted
          />
          <Row
            label={t.account.profilePhone}
            value={t.account.profilePhoneEmpty}
            muted
          />
        </dl>

        <footer className="flex items-start gap-3 border-t border-border/60 bg-surface-2/30 px-6 py-4 text-[0.78rem] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
          <p>{t.account.settingsReadOnlyNote}</p>
        </footer>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5">
        <header className="flex items-center gap-2 border-b border-destructive/20 px-6 py-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-destructive">
          <ShieldAlert className="size-3.5" aria-hidden />
          {t.account.dangerZone}
        </header>

        <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl space-y-1.5">
            <h3 className="text-base font-semibold text-foreground">
              {t.account.deleteAccount}
            </h3>
            <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
              {t.account.deleteAccountWarning}
            </p>
          </div>
          <DeleteAccountDialog email={session.email} />
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-6">
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={[
          "text-[0.92rem] font-medium tabular-nums",
          mono && "font-mono",
          muted && "text-muted-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
        data-numeric={mono ? "" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
