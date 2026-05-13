"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { carsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type {
  Car,
  CreateCarRequest,
  UpdateCarRequest,
} from "@/lib/api/types";

export function useCreateCar() {
  const qc = useQueryClient();
  return useMutation<Car, Error, CreateCarRequest>({
    mutationFn: (body) => carsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.cars.all }),
  });
}

export function useUpdateCar(id: number) {
  const qc = useQueryClient();
  return useMutation<Car, Error, UpdateCarRequest>({
    mutationFn: (body) => carsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.cars.all }),
  });
}

export function useDeleteCar() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => carsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.cars.all }),
  });
}
