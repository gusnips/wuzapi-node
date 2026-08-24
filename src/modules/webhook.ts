import { BaseClient } from "../client.js";
import { RequestOptions } from "../types/common.js";
import {
  SetWebhookRequest,
  SetWebhookResponse,
  GetWebhookResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
  DeleteWebhookResponse,
  WebhookEventType,
  WebhookEvent,
  WEBHOOK_EVENTS,
} from "../types/webhook.js";

export class WebhookModule extends BaseClient {
  /**
   * Set webhook URL and events to subscribe to
   */
  async setWebhook(
    webhookURL: string,
    events: (WebhookEvent | string)[] = ["All"],
    options?: RequestOptions
  ): Promise<SetWebhookResponse> {
    const request: SetWebhookRequest = { webhookurl: webhookURL, events };
    return this.post<SetWebhookResponse>("/webhook", request, options);
  }

  /**
   * Get current webhook configuration
   */
  async getWebhook(options?: RequestOptions): Promise<GetWebhookResponse> {
    return this.get<GetWebhookResponse>("/webhook", options);
  }

  /**
   * Update webhook URL, events, and activation status
   */
  async updateWebhook(
    webhookURL?: string,
    events?: (WebhookEvent | string)[],
    active?: boolean,
    options?: RequestOptions
  ): Promise<UpdateWebhookResponse> {
    const request: UpdateWebhookRequest = {
      webhook: webhookURL,
      events,
      active,
    };
    return this.put<UpdateWebhookResponse>("/webhook", request, options);
  }

  /**
   * Delete webhook configuration
   */
  async deleteWebhook(
    options?: RequestOptions
  ): Promise<DeleteWebhookResponse> {
    return this.delete<DeleteWebhookResponse>("/webhook", options);
  }

  /**
   * Get all available webhook event types
   */
  static getAvailableEvents(): string[] {
    return WEBHOOK_EVENTS;
  }

  /**
   * Get webhook event types enum for type-safe access
   */
  static get EventTypes(): typeof WebhookEventType {
    return WebhookEventType;
  }
}
