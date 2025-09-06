import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  WuzapiConfig,
  WuzapiResponse,
  RequestOptions,
} from "./types/common.js";
import { logger } from "./utils/logger.js";

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
          const data = error.response.data;
          throw new WuzapiError(
            data.code || error.response.status,
            data.message || error.message,
            data
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
   * Resolve the token from request options or instance config
   * Throws an error if no token is available
   */
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const token = options?.token || this.config.token;
    const headers = {
      ...this.defaultHeaders,
    };
    if (!token) {
      throw new WuzapiError(
        401,
        "No authentication token provided. Either set a token in the client config or provide one in the request options."
      );
    }
    if (options?.token && options.token !== this.config.token) {
      headers.Token = options.token;
    }
    if (this.config.token) {
      headers.Authorization = this.config.token;
    }
    return headers;
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

    if (!response.data.success) {
      throw new WuzapiError(
        response.data.code,
        "API request failed",
        response.data
      );
    }

    if (response.data.code <= 200 && response.data.code >= 300) {
      throw new WuzapiError(
        response.data.code,
        response.data.error || "API request failed",
        response.data
      );
    }

    return response.data.data;
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
