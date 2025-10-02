import { S3ConfigResponse } from "./common.js";
import { WebhookEvent } from "./webhook.js";

// Session endpoints types

export interface ConnectRequest {
  Subscribe: string[];
  Immediate?: boolean;
}

export interface ConnectResponse {
  details: string;
  events: string;
  jid: string;
  webhook: string;
}

export interface DisconnectResponse {
  Details: string;
}

export interface LogoutResponse {
  Details: string;
}

export interface StatusResponse {
  connected: boolean;
  events: (WebhookEvent | string)[];
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
}

export interface QRCodeResponse {
  QRCode: string;
}

export interface S3TestResponse {
  Details: string;
  Bucket: string;
  Region: string;
}

export interface PairPhoneRequest {
  Phone: string;
}

export interface PairPhoneResponse {
  LinkingCode: string;
}

export interface HistoryResponse {
  Details: string;
}

export interface ProxyRequest {
  proxy_url: string;
  enable: boolean;
}

export interface ProxyResponse {
  Details: string;
}

export interface HistoryCountRequest {
  history: number;
}

export interface HistoryCountResponse {
  Details: string;
  History: number;
}
