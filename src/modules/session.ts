import { BaseClient } from "../client.js";
import {
  ConnectRequest,
  ConnectResponse,
  DisconnectResponse,
  LogoutResponse,
  StatusResponse,
  QRCodeResponse,
  S3TestResponse,
  PairPhoneRequest,
  PairPhoneResponse,
  HistoryResponse,
  ProxyRequest,
  ProxyResponse,
  HistoryCountRequest,
  HistoryCountResponse,
  HmacConfigRequest,
  HmacConfigResponse,
  HmacDeleteResponse,
  PasskeyStatusResponse,
  PasskeyResponseRequest,
  PasskeyResponseResult,
  PasskeyConfirmResult,
} from "../types/session.js";
import { S3Config, RequestOptions, S3ConfigResponse } from "../types/common.js";

export class SessionModule extends BaseClient {
  /**
   * Connect to WhatsApp servers
   */
  async connect(
    request: ConnectRequest,
    options?: RequestOptions
  ): Promise<ConnectResponse> {
    return this.post<ConnectResponse>("/session/connect", request, options);
  }

  /**
   * Disconnect from WhatsApp servers.
   * @param clear also clear the stored event subscriptions (the server keeps them by default)
   */
  async disconnect(
    clear?: boolean,
    options?: RequestOptions
  ): Promise<DisconnectResponse> {
    const path = clear
      ? "/session/disconnect?clear=true"
      : "/session/disconnect";
    return this.post<DisconnectResponse>(path, undefined, options);
  }

  /**
   * Logout and finish the session
   */
  async logout(options?: RequestOptions): Promise<LogoutResponse> {
    return this.post<LogoutResponse>("/session/logout", undefined, options);
  }

  /**
   * Get session status
   */
  async getStatus(options?: RequestOptions): Promise<StatusResponse> {
    return this.get<StatusResponse>("/session/status", options);
  }

  /**
   * Get QR code for scanning
   */
  async getQRCode(options?: RequestOptions): Promise<QRCodeResponse> {
    return this.get<QRCodeResponse>("/session/qr", options);
  }

  /**
   * Configure S3 storage
   */
  async configureS3(
    config: S3Config,
    options?: RequestOptions
  ): Promise<S3ConfigResponse> {
    return this.post<S3ConfigResponse>("/session/s3/config", config, options);
  }

  /**
   * Get S3 configuration
   */
  async getS3Config(options?: RequestOptions): Promise<S3ConfigResponse> {
    return this.get<S3ConfigResponse>("/session/s3/config", options);
  }

  /**
   * Test S3 connection
   */
  async testS3(options?: RequestOptions): Promise<S3TestResponse> {
    return this.post<S3TestResponse>("/session/s3/test", undefined, options);
  }

  /**
   * Delete S3 configuration
   */
  async deleteS3Config(options?: RequestOptions): Promise<{ Details: string }> {
    return this.delete<{ Details: string }>("/session/s3/config", options);
  }

  /**
   * Pair phone using verification code
   */
  async pairPhone(
    phone: string,
    options?: RequestOptions
  ): Promise<PairPhoneResponse> {
    const request: PairPhoneRequest = { Phone: phone };
    return this.post<PairPhoneResponse>("/session/pairphone", request, options);
  }

  /**
   * Get pending passkey pairing status. Returns the WebAuthn challenge when
   * the device initiated passkey pairing instead of QR.
   */
  async getPasskeyStatus(
    options?: RequestOptions
  ): Promise<PasskeyStatusResponse> {
    return this.get<PasskeyStatusResponse>(
      "/session/passkey-status",
      options
    );
  }

  /**
   * Complete passkey pairing by sending the WebAuthn response from the
   * authenticator, after receiving a `PasskeyRequest` webhook.
   */
  async sendPasskeyResponse(
    request: PasskeyResponseRequest,
    options?: RequestOptions
  ): Promise<PasskeyResponseResult> {
    return this.post<PasskeyResponseResult>(
      "/session/passkey-response",
      request,
      options
    );
  }

  /**
   * Confirm that the 8-character pairing code was displayed to the user and
   * matches the phone, after receiving a `PasskeyConfirmation` webhook.
   */
  async confirmPasskey(
    options?: RequestOptions
  ): Promise<PasskeyConfirmResult> {
    return this.post<PasskeyConfirmResult>(
      "/session/passkey-confirm",
      undefined,
      options
    );
  }

  /**
   * Request history sync from WhatsApp servers
   */
  async requestHistory(options?: RequestOptions): Promise<HistoryResponse> {
    return this.get<HistoryResponse>("/session/history", options);
  }

  /**
   * Set history count for WhatsApp synchronization
   */
  async setHistoryCount(
    history: number,
    options?: RequestOptions
  ): Promise<HistoryCountResponse> {
    const request: HistoryCountRequest = { history };
    return this.post<HistoryCountResponse>(
      "/session/history",
      request,
      options
    );
  }

  /**
   * Set proxy configuration
   * @param webhookUseProxy route webhook deliveries through this proxy; omitted preserves the current per-user value
   */
  async setProxy(
    proxyURL: string,
    enable: boolean = true,
    webhookUseProxy?: boolean,
    options?: RequestOptions
  ): Promise<ProxyResponse> {
    const request: ProxyRequest = {
      proxy_url: proxyURL,
      enable,
      ...(webhookUseProxy !== undefined && { webhook_use_proxy: webhookUseProxy }),
    };
    return this.post<ProxyResponse>("/session/proxy", request, options);
  }

  /**
   * Configure HMAC key for webhook signing
   */
  async configureHmac(
    hmacKey: string,
    options?: RequestOptions
  ): Promise<HmacConfigResponse> {
    const request: HmacConfigRequest = { hmac_key: hmacKey };
    return this.post<HmacConfigResponse>("/session/hmac/config", request, options);
  }

  /**
   * Get HMAC configuration status
   */
  async getHmacConfig(options?: RequestOptions): Promise<HmacConfigResponse> {
    return this.get<HmacConfigResponse>("/session/hmac/config", options);
  }

  /**
   * Delete HMAC configuration
   */
  async deleteHmacConfig(options?: RequestOptions): Promise<HmacDeleteResponse> {
    return this.delete<HmacDeleteResponse>("/session/hmac/config", options);
  }
}
