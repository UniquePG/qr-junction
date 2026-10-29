import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { auth } from "@/lib/firebase";
import { ApiError, type ApiRequestConfig, type ApiResult } from "@/lib/api/types";

const NOT_SIGNED_IN = "Not signed in";

function requestId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeBody(data: unknown) {
  if (data == null || data === "") return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return { error: data };
    }
  }
  return data;
}

function logRequest(config: InternalAxiosRequestConfig) {
  if (process.env.NODE_ENV === "production") return;
  const id = config.metadata?.requestId ?? "-";
  console.debug(`[api] → ${id} ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
    auth: config.firebaseAuth !== false,
  });
}

function logResponse(config: InternalAxiosRequestConfig | undefined, status: number, data: unknown) {
  const startedAt = config?.metadata?.startedAt ?? Date.now();
  const id = config?.metadata?.requestId ?? "-";
  const duration = Date.now() - startedAt;
  const method = config?.method?.toUpperCase() ?? "GET";
  const url = config?.url ?? "";
  const failed = status === 0 || status >= 400;
  const summary = `[api] ← ${id} ${status} ${method} ${url} (${duration}ms)`;

  if (failed) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error ?? "")
        : undefined;
    console.error(summary, message || data);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(summary);
  }
}

export const apiClient = axios.create({
  headers: {
    Accept: "application/json",
  },
  validateStatus: () => true,
});

apiClient.interceptors.request.use(async (config) => {
  config.metadata = {
    startedAt: Date.now(),
    requestId: requestId(),
  };
  config.headers.set("X-Request-Id", config.metadata.requestId);

  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData) {
    config.headers.delete("Content-Type");
  }

  if (config.firebaseAuth !== false) {
    const user = auth.currentUser;
    if (config.requireAuth && !user) {
      throw new ApiError(NOT_SIGNED_IN, 401);
    }
    if (user) {
      const token = await user.getIdToken();
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  logRequest(config);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    response.data = normalizeBody(response.data);
    logResponse(response.config, response.status, response.data);
    return response;
  },
  (error: AxiosError) => {
    const data = normalizeBody(error.response?.data) as { error?: string };
    logResponse(error.config, error.response?.status ?? 0, data);
    const message = data.error || error.message || "Network error";
    return Promise.reject(new ApiError(message, error.response?.status ?? 0, data));
  },
);

export async function apiRequest<T = any>(config: ApiRequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await apiClient.request<T>(config);
    const data = (response.data ?? {}) as T;
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data,
      json: async () => data,
    };
  } catch (error) {
    if (error instanceof ApiError && error.message === NOT_SIGNED_IN) {
      throw error;
    }
    if (error instanceof ApiError) {
      const data = (error.data ?? { error: error.message }) as T;
      return {
        ok: false,
        status: error.status,
        data,
        json: async () => data,
      };
    }
    const message = error instanceof Error ? error.message : "Network error";
    const data = { error: message } as T;
    return {
      ok: false,
      status: 0,
      data,
      json: async () => data,
    };
  }
}

export async function apiData<T = any>(config: ApiRequestConfig): Promise<T> {
  const result = await apiRequest<T>(config);
  if (!result.ok) {
    const body = result.data as { error?: string };
    throw new ApiError(body?.error || "Request failed", result.status, result.data);
  }
  return result.data;
}
