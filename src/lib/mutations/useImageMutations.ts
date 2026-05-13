"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { carImagesApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { CarImage, ReorderImagesRequest } from "@/lib/api/types";

interface UploadVars {
  file: File;
  onProgress?: (pct: number) => void;
}

export function useUploadCarImage(carId: number) {
  const qc = useQueryClient();
  return useMutation<CarImage, Error, UploadVars>({
    mutationFn: ({ file, onProgress }) =>
      carImagesApi.upload(carId, file, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.cars.images(carId) });
      qc.invalidateQueries({ queryKey: keys.cars.byId(carId) });
    },
  });
}

export function useReorderCarImages(carId: number) {
  const qc = useQueryClient();
  return useMutation<CarImage[], Error, ReorderImagesRequest, { prev?: CarImage[] }>({
    mutationFn: (body) => carImagesApi.reorder(carId, body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: keys.cars.images(carId) });
      const prev = qc.getQueryData<CarImage[]>(keys.cars.images(carId));
      if (prev) {
        const orderMap = new Map(body.items.map((i) => [i.imageId, i.displayOrder]));
        const next = [...prev]
          .map((img) =>
            orderMap.has(img.id)
              ? { ...img, displayOrder: orderMap.get(img.id)! }
              : img,
          )
          .sort((a, b) => a.displayOrder - b.displayOrder);
        qc.setQueryData<CarImage[]>(keys.cars.images(carId), next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.cars.images(carId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.cars.images(carId) });
    },
  });
}

export function useSetPrimaryImage(carId: number) {
  const qc = useQueryClient();
  return useMutation<CarImage, Error, number, { prev?: CarImage[] }>({
    mutationFn: (imageId) => carImagesApi.setPrimary(carId, imageId),
    onMutate: async (imageId) => {
      await qc.cancelQueries({ queryKey: keys.cars.images(carId) });
      const prev = qc.getQueryData<CarImage[]>(keys.cars.images(carId));
      if (prev) {
        qc.setQueryData<CarImage[]>(
          keys.cars.images(carId),
          prev.map((img) => ({ ...img, primary: img.id === imageId })),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.cars.images(carId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.cars.images(carId) });
      qc.invalidateQueries({ queryKey: keys.cars.byId(carId) });
    },
  });
}

export function useDeleteCarImage(carId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number, { prev?: CarImage[] }>({
    mutationFn: (imageId) => carImagesApi.remove(carId, imageId),
    onMutate: async (imageId) => {
      await qc.cancelQueries({ queryKey: keys.cars.images(carId) });
      const prev = qc.getQueryData<CarImage[]>(keys.cars.images(carId));
      if (prev) {
        qc.setQueryData<CarImage[]>(
          keys.cars.images(carId),
          prev.filter((img) => img.id !== imageId),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.cars.images(carId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.cars.images(carId) });
      qc.invalidateQueries({ queryKey: keys.cars.byId(carId) });
    },
  });
}
