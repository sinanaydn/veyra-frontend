/**
 * Admin route group shell — wraps every /admin/** page.
 *
 * Server component. `requireRole('ADMIN')` returns notFound() for any
 * caller without the ADMIN role (FR-AUTH-7 — don't leak existence).
 * Middleware does the same at the edge; this is defensive.
 */

import { AdminShell } from "@/components/layout/AdminShell";
import { requireRole } from "@/lib/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN", "/admin");

  return <AdminShell>{children}</AdminShell>;
}
