"use client";

import { useQuery } from "@tanstack/react-query";
import { modelsApi, type ModelFilter } from "@/lib/api/resources";
import { keys } from "./keys";

export const useModels = (filter: ModelFilter = {}) =>
  useQuery({
    queryKey: keys.models.list(filter),
    queryFn: () => modelsApi.list(filter),
    staleTime: 5 * 60_000,
  });

export const useModel = (id: number) =>
  useQuery({
    queryKey: keys.models.byId(id),
    queryFn: () => modelsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 5 * 60_000,
  });
