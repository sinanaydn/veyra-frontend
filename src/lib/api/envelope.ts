/**
 * Backend response envelope.
 * All Spring Boot responses follow this shape:
 *   { success, status, message?, errorCode?, data, timestamp }
 *
 * Reference: IMPLEMENTATION.md §4.1
 */

export interface ApiResult<T> {
  success: boolean;
  status: number;
  message?: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}

/**
 * Spring `Page<T>` shape returned by paginated endpoints
 * (e.g. `GET /cars`, `GET /rentals`, `GET /payments`).
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Error envelope — `success` is always `false` here.
 * `data` may carry a field-level validation map (FE shows under fields).
 */
export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  errorCode: string;
  data: unknown;
  timestamp: string;
}

/** Empty page placeholder for skeleton/initial state. */
export const EMPTY_PAGE: PageResponse<never> = {
  content: [],
  pageNumber: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};
