import { SimpleContextInfo } from "./common.js";

// Chat endpoints types

export interface SendMessageResponse {
  Details: string;
  Id: string;
  Timestamp: string;
}

/**
 * Custom reply preview for a text message. The server renders it as an
 * `extendedTextMessage` quote — no real message is linked, it only shapes
 * the preview shown above the reply.
 */
export interface QuotedMessagePreview {
  extendedTextMessage: {
    text: string;
  };
}

export interface SendTextRequest {
  Phone: string;
  Body: string;
  Id?: string;
  /** Let the server generate a link preview for the first URL in `Body` (default true server-side). */
  LinkPreview?: boolean;
  ContextInfo?: SimpleContextInfo;
  QuotedText?: string;
  QuotedMessage?: QuotedMessagePreview;
}

export interface TemplateButton {
  DisplayText: string;
  Id?: string;
  Type: "quickreply" | "url" | "call";
  Url?: string;
  PhoneNumber?: string;
}

export interface SendTemplateRequest {
  Phone: string;
  Content: string;
  Footer?: string;
  Buttons: TemplateButton[];
  ContextInfo?: SimpleContextInfo;
}

export interface SendAudioRequest {
  Phone: string;
  Audio: string; // base64 encoded
  Id?: string;
  Caption?: string;
  /** Send as voice note. */
  ptt?: boolean;
  mimetype?: string;
  /** Audio duration in seconds. */
  Seconds?: number;
  /** Raw waveform samples shown in the voice-note UI. */
  Waveform?: number[];
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendImageRequest {
  Phone: string;
  Image: string; // base64 encoded
  Id?: string;
  Caption?: string;
  MimeType?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendDocumentRequest {
  Phone: string;
  Document: string; // base64 encoded
  FileName: string;
  Id?: string;
  Caption?: string;
  MimeType?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendVideoRequest {
  Phone: string;
  Video: string; // base64 encoded
  Id?: string;
  Caption?: string;
  JpegThumbnail?: string;
  MimeType?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendStickerRequest {
  Phone: string;
  Sticker: string; // base64 encoded
  Id?: string;
  PngThumbnail?: string;
  MimeType?: string;
  /** Sticker pack metadata, surfaced in WhatsApp's sticker tray. */
  PackId?: string;
  PackName?: string;
  PackPublisher?: string;
  Emojis?: string[];
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendLocationRequest {
  Phone: string;
  Latitude: number;
  Longitude: number;
  Name?: string;
  Id?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface SendContactRequest {
  Phone: string;
  Name: string;
  Vcard: string;
  Id?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface ChatPresenceRequest {
  Phone: string;
  State: "composing" | "paused";
  Media?: "audio";
}

export interface MarkReadRequest {
  id: string[];
  Chat: string;
  Sender?: string;
  /** Phone number of the chat — preferred over the `Chat` JID by current servers. */
  ChatPhone?: string;
  /** Phone number of the sender — preferred over the `Sender` JID by current servers. */
  SenderPhone?: string;
}

export interface MarkReadResponse {
  Details: string;
  success: boolean;
}

export interface ReactRequest {
  Phone: string;
  Body: string;
  Id: string;
  /** Participant JID of the message author when reacting inside a group. */
  Participant?: string;
}

export interface DownloadMediaRequest {
  Url: string;
  DirectPath: string;
  MediaKey: string;
  Mimetype: string;
  FileEncSHA256: string;
  FileSHA256: string;
  FileLength: number;
}

export interface DownloadMediaResponse {
  Data: string;
  Mimetype: string;
}

export interface DeleteMessageRequest {
  Phone: string;
  Id: string;
}

export interface DeleteMessageResponse {
  Details: string;
}

/**
 * One button of a SendButtons message. WhatsApp caps button titles at
 * 20 characters; the server truncates longer titles. The server also
 * honors legacy alias fields (`text`, `buttonText`, `buttonId`) — prefer
 * the canonical ones here.
 */
export type SendButton =
  | { type?: "reply"; title: string; id?: string }
  | { type: "cta_url"; title: string; url: string }
  | { type: "cta_call"; title: string; phone_number: string }
  | { type: "copy"; title: string; copy_code: string };

export interface SendButtonsRequest {
  Phone: string;
  /** Main body text. */
  Body: string;
  Buttons: SendButton[];
  Title?: string;
  Text?: string;
  Footer?: string;
  Image?: string;
  Id?: string;
  ContextInfo?: SimpleContextInfo;
  QuotedMessage?: QuotedMessagePreview;
}

export interface PinMessageRequest {
  /** Chat JID where the message lives (phone number or group JID). */
  Chat: string;
  /** Message ID to pin or unpin. */
  Id: string;
  /**
   * Author JID of the message. Required when pinning inside a group,
   * ignored for direct chats.
   */
  Sender?: string;
  /**
   * Pin duration in seconds: 86400 (24h), 604800 (7d) or 2592000 (30d).
   * Defaults to 604800 server-side. Ignored when unpinning.
   */
  DurationSeconds?: 86400 | 604800 | 2592000;
  /** Pin the message (default true); pass false to unpin. */
  Pin?: boolean;
}

export interface PinMessageResponse {
  Details: string;
}

export interface ListItem {
  Title: string;
  Desc?: string;
  RowId: string;
}

export interface ListSection {
  Title: string;
  Rows: ListItem[];
}

export interface SendListRequest {
  Phone: string;
  ButtonText: string;
  Desc: string;
  TopText: string;
  Sections?: ListSection[];
  List?: ListItem[]; // For compatibility
  FooterText?: string;
  Id?: string;
}

export interface ChatPollOption {
  Name: string;
}

export interface SendPollRequest {
  Group: string;
  Header: string;
  Options: string[];
  Id?: string;
}

export interface EditMessageRequest {
  Id: string;
  Phone: string;
  Body: string;
  ContextInfo?: SimpleContextInfo;
}

export interface GetChatHistoryRequest {
  Chat: string; // chat_jid parameter
  Limit?: number;
}

export interface HistoryMessage {
  chat_jid: string;
  id: number;
  media_link: string;
  message_id: string;
  message_type: string;
  sender_jid: string;
  text_content: string;
  timestamp: string;
  user_id: string;
}

export type GetChatHistoryResponse = HistoryMessage[];

export interface RequestUnavailableMessageRequest {
  chat: string;
  sender: string;
  id: string;
}

export interface RequestUnavailableMessageResponse {
  Details: string;
}

export interface ArchiveChatRequest {
  jid: string;
  archive: boolean;
}

export interface ArchiveChatResponse {
  Details: string;
}
