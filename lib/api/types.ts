import type { AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Attach the signed-in Firebase ID token. Defaults to true. */
    firebaseAuth?: boolean;
    /** Fail before the request when nobody is signed in. */
    requireAuth?: boolean;
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
