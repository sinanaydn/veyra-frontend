/**
 * Marketing route group shell — used by /, /cars, /cars/[id], /brands, /brands/[id].
 * Reference: SPECIFICATION.md §4.1
 */

import { Header, HeaderSpacer } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <HeaderSpacer />
      {children}
      <Footer />
    </>
  );
}
