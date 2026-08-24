import { ProxyConfigResponse, S3ConfigResponse } from "./common.js";
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
  hmac_configured: boolean;
  history: number;
  id: string;
  jid: string;
  loggedIn: boolean;
  name: string;
  passkeyPending: boolean;
  publicKey: PasskeyChallenge | null;
  proxy_config: ProxyConfigResponse;
  proxy_url: string;
  qrcode: string;
  s3_config: S3ConfigResponse;
  token: string;
  webhook: string;
}

/** Passkey pairing state, shared by `/session/qr`, `/session/status` and `/session/passkey-status`. */
export interface PasskeyPendingState {
  /** True if the device initiated passkey pairing instead of QR. */
  passkeyPending: boolean;
  /** WebAuthn challenge data, present when `passkeyPending` is true. */
  publicKey: PasskeyChallenge | null;
}

export type PasskeyStatusResponse = PasskeyPendingState;

export interface QRCodeResponse extends PasskeyPendingState {
  QRCode: string;
}

// Passkey pairing

/**
 * WebAuthn challenge delivered via `/session/qr`, `/session/passkey-status`
 * or the `PasskeyRequest` webhook while a device pairs through passkey.
 * Feed it to `navigator.credentials.get()` and POST the resulting
 * credential back via {@linkcode PasskeyResponseRequest}.
 */
export interface PasskeyChallenge {
  allowCredentials: PasskeyCredentialDescriptor[];
  challenge: string;
  extensions?: { uvm?: boolean };
  rpId: string;
  timeout: number;
  userVerification: "required" | "preferred" | "discouraged";
}

export interface PasskeyCredentialDescriptor {
  id?: string;
  transports?: string[];
  type?: string;
}

/** Authenticator assertion data returned by `navigator.credentials.get()`. */
export interface WebAuthnAssertionResponse {
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  userHandle?: string | null;
}

/** Body of `POST /session/passkey-response`. */
export interface PasskeyResponseRequest {
  response: {
    id: string;
    rawId: string;
    response: WebAuthnAssertionResponse;
    type: string;
  };
}

export interface PasskeyResponseResult {
  status: "passkey_response_sent";
}

/** Confirms the 8-character pairing code was displayed and matches the phone. Sent after a `PasskeyConfirmation` webhook. */
export interface PasskeyConfirmResult {
  status: "passkey_confirmed";
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
  /** Route webhook deliveries through this proxy. Omitted preserves the current per-user value. */
  webhook_use_proxy?: boolean;
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

export interface HmacConfigRequest {
  hmac_key: string;
}

export interface HmacConfigResponse {
  Details: string;
  configured?: boolean;
}

export interface HmacDeleteResponse {
  Details: string;
}
