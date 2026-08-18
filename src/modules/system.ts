import { BaseClient } from "../client.js";
import { HealthResponse } from "../types/system.js";

export class SystemModule extends BaseClient {
  /**
   * Health check
   * Endpoint to verify if the API is running correctly and retrieve service statistics.
   *
   * Takes no credentials: `/health` is mounted outside both auth middlewares.
   * It also returns bare JSON rather than the standard WuzapiResponse wrapper,
   * so this bypasses `this.request()`.
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await this.axios.get<HealthResponse>("/health");
    return response.data;
  }
}
