/**
 * Centralized query key factory.
 *
 * Single source of truth for cache keys. Keep arrays homogeneous and
 * hierarchical — invalidation patterns become cheap:
 *   qc.invalidateQueries({ queryKey: keys.cars.all })   // all car queries
 *   qc.invalidateQueries({ queryKey: keys.cars.list() }) // only list queries
 */

import type { CarFilter, Pageable, RentalFilter } from "@/lib/api/types";
import type { ModelFilter } from "@/lib/api/resources/models";

export const keys = {
  brands: {
    all: ["brands"] as const,
    list: () => [...keys.brands.all, "list"] as const,
    byId: (id: number) => [...keys.brands.all, "byId", id] as const,
  },
  models: {
    all: ["models"] as const,
    list: (f: ModelFilter = {}) =>
      [...keys.models.all, "list", f] as const,
    byId: (id: number) => [...keys.models.all, "byId", id] as const,
  },
  cars: {
    all: ["cars"] as const,
    list: (f: CarFilter = {}, p: Pageable = {}) =>
      [...keys.cars.all, "list", f, p] as const,
    byId: (id: number) => [...keys.cars.all, "byId", id] as const,
    images: (carId: number) =>
      [...keys.cars.all, "images", carId] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    list: (f: RentalFilter = {}, p: Pageable = {}) =>
      [...keys.rentals.all, "list", f, p] as const,
    my: (p: Pageable = {}) => [...keys.rentals.all, "my", p] as const,
    byId: (id: number) => [...keys.rentals.all, "byId", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: () => [...keys.payments.all, "list"] as const,
    my: () => [...keys.payments.all, "my"] as const,
    byId: (id: number) => [...keys.payments.all, "byId", id] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...keys.users.all, "list"] as const,
    byId: (id: number) => [...keys.users.all, "byId", id] as const,
  },
} as const;
