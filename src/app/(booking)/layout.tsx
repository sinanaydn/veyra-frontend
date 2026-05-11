/**
 * Booking route group shell — wraps /checkout/** and /booking/**
 *
 * Server component: edge-middleware already redirects unauthenticated
 * visitors, but we still call requireSession() so server components
 * downstream can read the session shape directly.
 *
 * Visual chrome: shared site Header (auth-aware), no sidebar, no footer.
 * The booking flow is intentionally focused — nothing competes with the
 * payment task.
 */

import { Header, HeaderSpacer } from "@/components/layout/Header";
import { requireSession } from "@/lib/rbac";

export default async function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession("/account/rentals");

  return (
    <>
      <Header />
      <HeaderSpacer />
      <main
        id="main"
        className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"
      >
        {/* Ambient stage glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[80rem] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]"
        />
        {children}
      </main>
    </>
  );
}
