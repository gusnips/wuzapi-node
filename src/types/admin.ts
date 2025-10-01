// Admin endpoints types
import { S3ConfigResponse } from "./common.js";
import { WebhookEvent } from "./webhook.js";

export interface User {
  connected: boolean;
  events: WebhookEvent | string;
  expiration: number;
  id: string;
  jid: string;
  loggedIn: boolean;
  name: string;
  proxy_config: {
    enabled: boolean;
    proxy_url: string;
  };
  proxy_url: string;
  qrcode: string;
  s3_config: S3ConfigResponse;
  token: string;
  webhook: string;
  history: number;
}

export interface CreateUserRequest {
  name: string;
  token: string;
  webhook?: string;
  events?: string;
  proxyConfig?: {
    enabled: boolean;
    proxyURL: string;
  };
  s3Config?: {
    enabled: boolean;
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    pathStyle: boolean;
    publicURL?: string;
    mediaDelivery: "base64" | "s3" | "both";
    retentionDays: number;
  };
  history?: number; // Number of messages to save in the database, defaults to 0, which is disabled
}

export interface CreateUserResponse {
  id: string;
  name: string;
  token: string;
  webhook?: string;
  events?: string;
  proxy_config: {
    enabled: boolean;
    proxy_url: string;
  };
  s3_config: {
    access_key: string;
    bucket: string;
    enabled: boolean;
    endpoint: string;
    media_delivery: string;
    path_style: boolean;
    public_url: string;
    region: string;
    retention_days: number;
  };
  history?: number; // Number of messages to save in the database, defaults to 0, which is disabled
}

export interface DeleteUserResponse {
  Details: string;
}
