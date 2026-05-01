"use client";

import { useQuery } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/resources";
import { keys } from "./keys";

export const useBrands = () =>
  useQuery({
    queryKey: keys.brands.list(),
    queryFn: () => brandsApi.list(),
    staleTime: 5 * 60_000, // brands rarely change
  });

export const useBrand = (id: number) =>
  useQuery({
    queryKey: keys.brands.byId(id),
    queryFn: () => brandsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 5 * 60_000,
  });
