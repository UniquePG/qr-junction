import type { AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * Soft client hint only. Session cookies are always sent via withCredentials;
     * the server enforces auth. Prefer false for intentionally public endpoints.
     */
    requireAuth?: boolean;
    /** One-shot Firebase ID token for Google exchange only (`/api/auth/google`). */
    firebaseIdToken?: string;
  }

  export interface InternalAxiosRequestConfig {
    metadata?: {
      startedAt: number;
      requestId: string;
    };
  }
}

export type ApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
  json: () => Promise<T>;
};

export type ApiRequestConfig = AxiosRequestConfig;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
