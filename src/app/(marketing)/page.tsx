/**
 * Landing — composes Hero, SearchBar, FeaturedCars, BrandStrip, ValueProps.
 * Reference: TASKS.md T-050
 *
 * Server component. Sub-components fetch on the server when they can
 * (FeaturedCars, BrandStrip) for fastest first paint; SearchBar is a
 * client island for the form interaction.
 */

import { Hero } from "@/components/marketing/Hero";
import { SearchBar } from "@/components/marketing/SearchBar";
import { FeaturedCars } from "@/components/marketing/FeaturedCars";
import { BrandStrip } from "@/components/marketing/BrandStrip";
import { ValueProps } from "@/components/marketing/ValueProps";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <SearchBar />
      <FeaturedCars />
      <BrandStrip />
      <ValueProps />
    </main>
  );
}
