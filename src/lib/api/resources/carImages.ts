/**
 * Car images resource.
 *   GET    /cars/{carId}/images                          public
 *   POST   /cars/{carId}/images                          ADMIN, multipart
 *   PUT    /cars/{carId}/images/reorder                  ADMIN
 *   PUT    /cars/{carId}/images/{imageId}/primary        ADMIN
 *   DELETE /cars/{carId}/images/{imageId}                ADMIN
 *
 * Constraints (FR-ADM-4): max 5 MB per file, jpeg/png/webp, max 10 per car.
 */

import { http } from "../client";
import type { ApiResult } from "../envelope";
import type { CarImage, ReorderImagesRequest } from "../types";

export const carImagesApi = {
  listByCar: async (carId: number): Promise<CarImage[]> => {
    const res = await http.get<ApiResult<CarImage[]>>(
      `/cars/${carId}/images`,
    );
    return res.data.data;
  },

  /** Single-file upload. Caller wraps multiple uploads in a queue. */
  upload: async (
    carId: number,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<CarImage> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await http.post<ApiResult<CarImage>>(
      `/cars/${carId}/images`,
      fd,
      {
        headers: { "content-type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      },
    );
    return res.data.data;
  },

  reorder: async (
    carId: number,
    body: ReorderImagesRequest,
  ): Promise<CarImage[]> => {
    const res = await http.put<ApiResult<CarImage[]>>(
      `/cars/${carId}/images/reorder`,
      body,
    );
    return res.data.data;
  },

  setPrimary: async (carId: number, imageId: number): Promise<CarImage> => {
    const res = await http.put<ApiResult<CarImage>>(
      `/cars/${carId}/images/${imageId}/primary`,
    );
    return res.data.data;
  },

  remove: async (carId: number, imageId: number): Promise<void> => {
    await http.delete(`/cars/${carId}/images/${imageId}`);
  },
};
