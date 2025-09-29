import { BaseClient } from "../client.js";
import { RequestOptions } from "../types/common.js";
import {
  SendMessageResponse,
  SendTextRequest,
  SendTemplateRequest,
  SendAudioRequest,
  SendImageRequest,
  SendDocumentRequest,
  SendVideoRequest,
  SendStickerRequest,
  SendLocationRequest,
  SendContactRequest,
  ChatPresenceRequest,
  MarkReadRequest,
  ReactRequest,
  DownloadMediaRequest,
  DownloadMediaResponse,
  DeleteMessageRequest,
  DeleteMessageResponse,
  SendButtonsRequest,
  SendListRequest,
  SendPollRequest,
  EditMessageRequest,
  ListSection,
  GetChatHistoryResponse,
} from "../types/chat.js";

export class ChatModule extends BaseClient {
  /**
   * Send a text message
   */
  async sendText(
    request: SendTextRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>("/chat/send/text", request, options);
  }

  /**
   * Send a template message with buttons
   */
  async sendTemplate(
    request: SendTemplateRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/template",
      request,
      options
    );
  }

  /**
   * Send an audio message
   */
  async sendAudio(
    request: SendAudioRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>("/chat/send/audio", request, options);
  }

  /**
   * Send an image message
   */
  async sendImage(
    request: SendImageRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>("/chat/send/image", request, options);
  }

  /**
   * Send a document message
   */
  async sendDocument(
    request: SendDocumentRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/document",
      request,
      options
    );
  }

  /**
   * Send a video message
   */
  async sendVideo(
    request: SendVideoRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>("/chat/send/video", request, options);
  }

  /**
   * Send a sticker message
   */
  async sendSticker(
    request: SendStickerRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/sticker",
      request,
      options
    );
  }

  /**
   * Send a location message
   */
  async sendLocation(
    request: SendLocationRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/location",
      request,
      options
    );
  }

  /**
   * Send a contact message
   */
  async sendContact(
    request: SendContactRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/contact",
      request,
      options
    );
  }

  /**
   * Send chat presence indication (typing indicator)
   */
  async sendPresence(
    request: ChatPresenceRequest,
    options?: RequestOptions
  ): Promise<void> {
    await this.post<void>("/chat/presence", request, options);
  }

  /**
   * Mark messages as read
   */
  async markRead(
    request: MarkReadRequest,
    options?: RequestOptions
  ): Promise<void> {
    await this.post<void>("/chat/markread", request, options);
  }

  /**
   * React to a message
   */
  async react(
    request: ReactRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>("/chat/react", request, options);
  }

  /**
   * Download an image from a message
   */
  async downloadImage(
    request: DownloadMediaRequest,
    options?: RequestOptions
  ): Promise<DownloadMediaResponse> {
    return this.post<DownloadMediaResponse>(
      "/chat/downloadimage",
      request,
      options
    );
  }

  /**
   * Download a video from a message
   */
  async downloadVideo(
    request: DownloadMediaRequest,
    options?: RequestOptions
  ): Promise<DownloadMediaResponse> {
    return this.post<DownloadMediaResponse>(
      "/chat/downloadvideo",
      request,
      options
    );
  }

  /**
   * Download an audio from a message
   */
  async downloadAudio(
    request: DownloadMediaRequest,
    options?: RequestOptions
  ): Promise<DownloadMediaResponse> {
    return this.post<DownloadMediaResponse>(
      "/chat/downloadaudio",
      request,
      options
    );
  }

  /**
   * Download a document from a message
   */
  async downloadDocument(
    request: DownloadMediaRequest,
    options?: RequestOptions
  ): Promise<DownloadMediaResponse> {
    return this.post<DownloadMediaResponse>(
      "/chat/downloaddocument",
      request,
      options
    );
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    messageId: string,
    options?: RequestOptions
  ): Promise<DeleteMessageResponse> {
    const request: DeleteMessageRequest = { Id: messageId };
    return this.post<DeleteMessageResponse>("/chat/delete", request, options);
  }

  /**
   * Send interactive buttons message
   */
  async sendButtons(
    request: SendButtonsRequest,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(
      "/chat/send/buttons",
      request,
      options
    );
  }

  /**
   * Send list message
   */
  async sendList(
    phone: string,
    buttonText: string,
    description: string,
    topText: string,
    sections?: ListSection[],
    footerText?: string,
    id?: string,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    const request: SendListRequest = {
      Phone: phone,
      ButtonText: buttonText,
      Desc: description,
      TopText: topText,
      Sections: sections,
      FooterText: footerText,
      Id: id,
    };
    return this.post<SendMessageResponse>("/chat/send/list", request, options);
  }

  /**
   * Send poll message
   */
  async sendPoll(
    groupJID: string,
    header: string,
    options: string[],
    id?: string,
    requestOptions?: RequestOptions
  ): Promise<SendMessageResponse> {
    const request: SendPollRequest = {
      Group: groupJID,
      Header: header,
      Options: options,
      Id: id,
    };
    return this.post<SendMessageResponse>(
      "/chat/send/poll",
      request,
      requestOptions
    );
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: string,
    phone: string,
    newBody: string,
    options?: RequestOptions
  ): Promise<SendMessageResponse> {
    const request: EditMessageRequest = {
      Id: messageId,
      Phone: phone,
      Body: newBody,
    };
    return this.post<SendMessageResponse>("/chat/send/edit", request, options);
  }

  /**
   * Get chat message history
   */
  async getChatHistory(
    chatJid: string,
    limit?: number,
    options?: RequestOptions
  ): Promise<GetChatHistoryResponse> {
    const queryParams: string[] = [`chat_jid=${encodeURIComponent(chatJid)}`];

    if (limit !== undefined) {
      queryParams.push(`limit=${limit}`);
    }

    return this.get<GetChatHistoryResponse>(
      `/chat/history?${queryParams.join("&")}`,
      options
    );
  }
}
