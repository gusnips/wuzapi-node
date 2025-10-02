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
   * Disconnect from WhatsApp servers
   */
  async disconnect(options?: RequestOptions): Promise<DisconnectResponse> {
    return this.post<DisconnectResponse>(
      "/session/disconnect",
      undefined,
      options
    );
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
   */
  async setProxy(
    proxyURL: string,
    enable: boolean = true,
    options?: RequestOptions
  ): Promise<ProxyResponse> {
    const request: ProxyRequest = { proxy_url: proxyURL, enable: enable };
    return this.post<ProxyResponse>("/session/proxy", request, options);
  }
}
