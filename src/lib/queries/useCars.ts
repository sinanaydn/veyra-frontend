"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { carsApi, carImagesApi } from "@/lib/api/resources";
import { keys } from "./keys";
import type { CarFilter, Pageable } from "@/lib/api/types";

export const useCars = (filter: CarFilter = {}, pageable: Pageable = {}) =>
  useQuery({
    queryKey: keys.cars.list(filter, pageable),
    queryFn: () => carsApi.list(filter, pageable),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const useCar = (id: number) =>
  useQuery({
    queryKey: keys.cars.byId(id),
    queryFn: () => carsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 30_000,
  });

export const useCarImages = (carId: number) =>
  useQuery({
    queryKey: keys.cars.images(carId),
    queryFn: () => carImagesApi.listByCar(carId),
    enabled: Number.isFinite(carId) && carId > 0,
    staleTime: 60_000,
  });
