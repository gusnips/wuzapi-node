import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  WuzapiConfig,
  WuzapiResponse,
  RequestOptions,
} from "./types/common.js";
import { logger } from "./utils/logger.js";

/**
 * WuzAPI reports a failure reason in `error`, or occasionally as a bare string
 * `data`. `message` only appears on responses that are not WuzAPI envelopes.
 */
function resolveErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) return fallback;
  const { error, message, data } = body as Record<string, unknown>;
  if (typeof error === "string") return error;
  if (typeof message === "string") return message;
  if (typeof data === "string") return data;
  return fallback;
}

export class WuzapiError extends Error {
  public code: number;
  public details?: unknown;

  constructor(code: number, message: string, details?: unknown) {
    super(message);
    this.name = "WuzapiError";
    this.code = code;
    this.details = details;
  }
}

export class BaseClient {
  protected axios: AxiosInstance;
  protected config: WuzapiConfig;
  protected defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  /**
   * Which credential this module's endpoints authenticate with. Overridden to
   * `"admin"` by `AdminModule`; every other module is on user auth.
   */
  protected readonly authScheme: "user" | "admin" = "user";

  constructor(config: WuzapiConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.apiUrl,
      headers: this.defaultHeaders,
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const body = error.response.data;
          throw new WuzapiError(
            body?.code || error.response.status,
            resolveErrorMessage(body, error.message),
            body
          );
        } else if (error.request) {
          // Request was made but no response received
          throw new WuzapiError(0, "Network error: No response from server");
        } else {
          // Something else happened
          throw new WuzapiError(0, error.message);
        }
      }
    );
  }

  /**
   * Build the auth header the endpoint requires. WuzAPI reads `token` on user
   * routes and `Authorization` on `/admin/*`, and never falls back from one to
   * the other — so the header is fixed by the module's scheme, and
   * `options.token` only overrides which credential goes in it.
   */
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const isAdmin = this.authScheme === "admin";
    const token =
      options?.token ?? (isAdmin ? this.config.adminToken : this.config.token);

    if (!token) {
      throw new WuzapiError(
        401,
        isAdmin
          ? "No admin token provided. Set `adminToken` in the client config, or pass `{ token }` in the request options."
          : "No user token provided. Set `token` in the client config, or pass `{ token }` in the request options."
      );
    }

    return {
      ...this.defaultHeaders,
      [isAdmin ? "Authorization" : "token"]: token,
    };
  }

  protected async request<T>(
    method: "GET" | "POST" | "DELETE" | "PUT",
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const headers = this.buildHeaders(options);
    if (this.config.debug) {
      logger.request(`[${method}] ${endpoint}`, { headers, data });
    }

    const response = await this.axios.request<WuzapiResponse<T>>({
      method,
      url: endpoint,
      data,
      headers,
    });

    if (this.config.debug) {
      logger.response(`[${method}] ${endpoint}`, {
        status: response.status,
        data: response.data,
      });
    }

    // The body carries its own status: a failure can arrive over HTTP 200 with
    // success:false and a non-2xx code, so the envelope is what decides.
    const { code, data: payload, success } = response.data;
    if (!success || code < 200 || code >= 300) {
      throw new WuzapiError(
        code,
        resolveErrorMessage(response.data, "API request failed"),
        response.data
      );
    }

    return payload;
  }

  protected async get<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  protected async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  protected async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  protected async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}
