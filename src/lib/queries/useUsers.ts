"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/resources";
import { keys } from "./keys";
import type { Pageable } from "@/lib/api/types";

export const useUsers = (pageable: Pageable = {}) =>
  useQuery({
    queryKey: [...keys.users.list(), pageable] as const,
    queryFn: () => usersApi.list(pageable),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const useUser = (id: number) =>
  useQuery({
    queryKey: keys.users.byId(id),
    queryFn: () => usersApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60_000,
  });
