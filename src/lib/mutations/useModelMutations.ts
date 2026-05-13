"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modelsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type {
  CarModel,
  CreateCarModelRequest,
  UpdateCarModelRequest,
} from "@/lib/api/types";

export function useCreateModel() {
  const qc = useQueryClient();
  return useMutation<CarModel, Error, CreateCarModelRequest>({
    mutationFn: (body) => modelsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.models.all }),
  });
}

export function useUpdateModel(id: number) {
  const qc = useQueryClient();
  return useMutation<CarModel, Error, UpdateCarModelRequest>({
    mutationFn: (body) => modelsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.models.all }),
  });
}

export function useDeleteModel() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => modelsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.models.all }),
  });
}
