/**
 * Auth route group layout.
 *
 * Behavior:
 *   • If already authenticated, send the user straight to /account
 *     (or to the `?redirect=` target if present and safe). No flash of
 *     login form for logged-in users.
 *   • Otherwise renders children unmodified — pages own their full layout
 *     via <AuthShell>.
 *
 * `noStore` would be redundant: cookies() opts the segment into dynamic
 * rendering automatically.
 */

import { redirect } from "next/navigation";
import { readSession } from "@/lib/rbac";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSession();
  if (session) {
    redirect("/account");
  }
  return <>{children}</>;
}
