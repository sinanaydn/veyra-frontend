"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type {
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
} from "@/lib/api/types";

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation<Brand, Error, CreateBrandRequest>({
    mutationFn: (body) => brandsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.brands.all }),
  });
}

export function useUpdateBrand(id: number) {
  const qc = useQueryClient();
  return useMutation<Brand, Error, UpdateBrandRequest>({
    mutationFn: (body) => brandsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.brands.all }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => brandsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.brands.all }),
  });
}
