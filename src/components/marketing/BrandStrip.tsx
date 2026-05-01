/**
 * Brand directory strip — typographic, no logos.
 * Each brand is a name link; hover reveals accent rule and chevron.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { serverApi } from "@/lib/api/server";

export async function BrandStrip() {
  let brands: Awaited<ReturnType<typeof serverApi.brands.list>> = [];
  try {
    brands = await serverApi.brands.list();
  } catch {
    brands = [];
  }
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <header className="md:col-span-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              Markalar
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Premium üreticiler tek çatı altında.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Avrupa, Asya ve Amerika menşeli {brands.length}+ markadan oluşan filomuz, her sürüş zevkine hitap edecek seçenekler sunar.
            </p>
            <Link
              href="/brands"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Tüm markaları gör
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </header>

          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/60 md:col-span-8 md:grid-cols-3 lg:grid-cols-4">
            {brands.slice(0, 12).map((b) => (
              <li key={b.id}>
                <Link
                  href={`/brands/${b.id}`}
                  className="group/brand flex h-full items-center justify-between bg-background px-5 py-5 transition-colors hover:bg-surface"
                >
                  <span className="text-sm font-medium tracking-tight text-foreground">
                    {b.name}
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground/50 transition-all group-hover/brand:translate-x-0.5 group-hover/brand:text-accent"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
