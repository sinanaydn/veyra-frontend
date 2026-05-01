/**
 * Server-side fetch helper for public endpoints (brands, models, cars).
 *
 * Server components run inside the same Next process as the proxy, so
 * going through `/api/proxy` would add a needless hop. We hit Spring
 * directly and apply Next.js's built-in fetch cache.
 *
 * Authenticated server fetches would need to forward `veyra_at` from
 * `cookies()` — for now we only expose public reads here.
 */

import { ApiError } from "./errors";
import type { ApiResult, PageResponse } from "./envelope";
import type {
  Brand,
  Car,
  CarFilter,
  CarImage,
  CarModel,
  Pageable,
} from "./types";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

interface ServerFetchOpts {
  /** Tag for on-demand revalidation. */
  tag?: string;
  /** ISR seconds. Defaults to 60. Pass 0 for no cache. */
  revalidate?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else {
      sp.set(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function serverGet<T>(
  path: string,
  opts: ServerFetchOpts = {},
): Promise<T> {
  const res = await fetch(`${BACKEND}/api/v1${path}`, {
    next: {
      revalidate: opts.revalidate ?? 60,
      tags: opts.tag ? [opts.tag] : undefined,
    },
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.errorCode,
      body?.data,
      body?.message ?? `Backend ${res.status}`,
    );
  }
  const json = (await res.json()) as ApiResult<T>;
  return json.data;
}

// ============================================================
// Public reads (Brands · Models · Cars · CarImages)
// ============================================================

export const serverApi = {
  brands: {
    list: () => serverGet<Brand[]>("/brands", { tag: "brands" }),
    byId: (id: number) =>
      serverGet<Brand>(`/brands/${id}`, { tag: `brand-${id}` }),
  },
  models: {
    list: (params: { brandId?: number } = {}) =>
      serverGet<CarModel[]>(`/models${buildQuery(params)}`, { tag: "models" }),
    byId: (id: number) => serverGet<CarModel>(`/models/${id}`),
  },
  cars: {
    list: (filter: CarFilter = {}, pageable: Pageable = {}) =>
      serverGet<PageResponse<Car>>(
        `/cars${buildQuery({ ...filter, ...pageable })}`,
        { tag: "cars", revalidate: 30 },
      ),
    byId: (id: number) =>
      serverGet<Car>(`/cars/${id}`, { tag: `car-${id}` }),
  },
  carImages: {
    listByCar: (carId: number) =>
      serverGet<CarImage[]>(`/cars/${carId}/images`, {
        tag: `car-images-${carId}`,
      }),
  },
};
