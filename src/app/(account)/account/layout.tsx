/**
 * Account route group shell — wraps every /account/** page.
 *
 * Server component: enforces the authenticated session at the edge of
 * the segment. Unauthenticated visitors get a 307 redirect to /login
 * with the original path stashed in `?redirect=`.
 *
 * Visual chrome: shared site Header (auth-aware avatar dropdown lives
 * there) + sticky sidebar from <AccountShell>. Footer omitted — the
 * customer surface is task-focused, not marketing.
 */

import { Header, HeaderSpacer } from "@/components/layout/Header";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireSession } from "@/lib/rbac";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession("/account");

  return (
    <>
      <Header />
      <HeaderSpacer />
      <AccountShell>{children}</AccountShell>
    </>
  );
}
