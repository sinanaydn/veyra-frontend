"use client";

/**
 * Hero search bar — Stripe Atlas vibe.
 * Submit pushes /cars?brandId=&minPrice=&...
 *
 * Brand list comes from useBrands() (5min stale). Empty/loading falls
 * back to a generic "Tüm markalar" option.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Search } from "lucide-react";
import { useBrands } from "@/lib/queries/useBrands";

export function SearchBar() {
  const router = useRouter();
  const { data } = useBrands();
  const brands = data ?? [];
  const [brandId, setBrandId] = useState<string>("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brandId) params.set("brandId", brandId);
    const qs = params.toString();
    router.push(qs ? `/cars?${qs}` : "/cars");
  };

  return (
    <section className="relative -mt-6 mb-16 px-4 md:px-6 lg:px-8">
      <form
        onSubmit={submit}
        className="mx-auto flex max-w-4xl items-stretch gap-2 rounded-2xl border border-border bg-background/85 p-2 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-3"
      >
        {/* Brand select */}
        <label className="group/field flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors hover:bg-surface md:px-4">
          <CarFront
            className="size-4 shrink-0 text-muted-foreground/70 transition-colors group-focus-within/field:text-accent"
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col py-2.5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Marka
            </span>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-foreground outline-none"
              aria-label="Marka seç"
            >
              <option value="">Tüm markalar</option>
              {brands.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Divider */}
        <span aria-hidden className="hidden w-px self-stretch bg-border md:block" />

        {/* Submit */}
        <button
          type="submit"
          className="group/btn inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 active:translate-y-px md:px-6"
        >
          <Search className="size-4" aria-hidden />
          <span className="hidden sm:inline">Ara</span>
        </button>
      </form>
    </section>
  );
}
