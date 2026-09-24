// Thin `fetch` wrapper that mirrors the subset of the axios API used in this app.
// Use `getApiError(e)` to read a failed request's status and message.

import { useAuthStore } from "./auth.store";

const API_URL: string = import.meta.env.VITE_API_URL ?? "";
const SESSION_EXPIRED_MESSAGE = "Invalid session, redirecting to sign in page...";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestConfig {
  params?: QueryParams;
  headers?: Record<string, string>;
  responseType?: "json" | "blob";
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError<T = any> extends Error {
  status?: number;
  response?: ApiResponse<T>;
  isSessionExpired = false;

  constructor(message: string, response?: ApiResponse<T>, name = "ApiError") {
    super(message);
    this.name = name;
    this.status = response?.status;
    this.response = response;
  }
}

/** Normalize anything thrown by an API call into the backend's `{ status, message }` error shape. */
export const getApiError = (e: unknown): { status?: number; message: string } => {
  if (e instanceof ApiError) {
    if (e.isSessionExpired) {
      return { status: 401, message: SESSION_EXPIRED_MESSAGE };
    }
    const body = e.response?.data?.error;
    return { status: body?.status ?? e.status, message: body?.message ?? e.message };
  }
  return { message: e instanceof Error ? e.message : String(e) };
};

let isSessionExpiring = false;

// Give the UI a moment to show SESSION_EXPIRED_MESSAGE, then sign out and do a full load
// of the sign-in page (which also picks up a new deployment). Signing out any earlier
// would make the private routes redirect to /not-found before the message is seen.
const expireSession = () => {
  if (isSessionExpiring) return;
  isSessionExpiring = true;
  setTimeout(() => {
    useAuthStore.getState().signOut();
    location.assign("/sign-in");
  }, 2000);
};

const isAbsoluteURL = (url: string) => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

const buildURL = (url: string, params?: QueryParams) => {
  let fullURL = isAbsoluteURL(url) ? url : url ? `${API_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}` : API_URL;

  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        search.append(key, String(value));
      }
    }
    const query = search.toString();
    if (query) {
      fullURL += (fullURL.includes("?") ? "&" : "?") + query;
    }
  }
  return fullURL;
};

const isVisitable = (value: unknown) =>
  Array.isArray(value) || (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype);

/**
 * Same encoding as axios' `postForm`: nested keys use brackets (`items[0][name]`),
 * arrays of primitives use `key[]`, null/undefined are skipped.
 */
export const toFormData = (obj: object, formData = new FormData()) => {
  const convertValue = (value: unknown) => {
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Blob) return value;
    return String(value);
  };

  const build = (value: object, path: string[]) => {
    Object.entries(value).forEach(([key, el]) => {
      if (el === null || el === undefined) return;
      const keyPath = [...path, key];
      const name = keyPath.map((token, i) => (i ? `[${token}]` : token)).join("");

      if (path.length === 0 && Array.isArray(el) && !el.some(isVisitable)) {
        el.forEach((item) => {
          if (item !== null && item !== undefined) {
            formData.append(`${key}[]`, convertValue(item));
          }
        });
      } else if (isVisitable(el)) {
        build(el, keyPath);
      } else {
        formData.append(name, convertValue(el));
      }
    });
  };

  build(obj, []);
  return formData;
};

const parseBody = async (res: Response, responseType: RequestConfig["responseType"]) => {
  if (responseType === "blob") {
    return res.blob();
  }
  // Like axios: parse JSON when possible, fall back to raw text ("" for empty bodies).
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : text;
  } catch {
    return text;
  }
};

const request = async <T = any>(method: string, url: string, data?: unknown, config: RequestConfig = {}): Promise<ApiResponse<T>> => {
  const headers = new Headers({ Accept: "application/json, text/plain, */*" });
  const token = localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (data instanceof FormData) {
    // Let the browser set the multipart boundary.
    body = data;
  } else if (data !== undefined && data !== null) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(data);
  }

  Object.entries(config.headers ?? {}).forEach(([key, value]) => headers.set(key, value));

  let res: Response;
  try {
    res = await fetch(buildURL(url, config.params), {
      method,
      headers,
      body,
      signal: config.signal,
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new ApiError("canceled", undefined, "CanceledError");
    }
    throw new ApiError("Network Error");
  }

  const response: ApiResponse<T> = {
    data: await parseBody(res, config.responseType),
    status: res.status,
    headers: res.headers,
  };

  if (!res.ok) {
    // A 401 without a token, or from sign-in itself (wrong credentials), is not an expired session.
    const error = new ApiError(`Request failed with status code ${res.status}`, response);
    if (res.status === 401 && token && !/^\/?auth\//.test(url)) {
      error.isSessionExpired = true;
      expireSession();
    }
    throw error;
  }
  return response;
};

const api = {
  get: <T = any>(url: string, config?: RequestConfig) => request<T>("GET", url, undefined, config),
  delete: <T = any>(url: string, config?: RequestConfig) => request<T>("DELETE", url, undefined, config),
  post: <T = any>(url: string, data?: unknown, config?: RequestConfig) => request<T>("POST", url, data, config),
  put: <T = any>(url: string, data?: unknown, config?: RequestConfig) => request<T>("PUT", url, data, config),
  patch: <T = any>(url: string, data?: unknown, config?: RequestConfig) => request<T>("PATCH", url, data, config),
  postForm: <T = any>(url: string, data: object, config?: RequestConfig) => request<T>("POST", url, toFormData(data), config),
  putForm: <T = any>(url: string, data: object, config?: RequestConfig) => request<T>("PUT", url, toFormData(data), config),
};

export default api;
