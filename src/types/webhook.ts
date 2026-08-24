// Import types that are identical from other modules
import type { PasskeyChallenge } from "./session.js";
import type { VerifiedName } from "./user.js";

// Webhook endpoints types

// Webhook event types (events that can be subscribed to via webhooks)
export enum WebhookEventType {
  MESSAGE = "Message",
  UNDECRYPTABLE_MESSAGE = "UndecryptableMessage",
  RECEIPT = "Receipt",
  READ_RECEIPT = "ReadReceipt",
  MEDIA_RETRY = "MediaRetry",
  GROUP_INFO = "GroupInfo",
  JOINED_GROUP = "JoinedGroup",
  PICTURE = "Picture",
  BLOCKLIST_CHANGE = "BlocklistChange",
  BLOCKLIST = "Blocklist",
  CONNECTED = "Connected",
  DISCONNECTED = "Disconnected",
  CONNECT_FAILURE = "ConnectFailure",
  KEEP_ALIVE_RESTORED = "KeepAliveRestored",
  KEEP_ALIVE_TIMEOUT = "KeepAliveTimeout",
  LOGGED_OUT = "LoggedOut",
  CLIENT_OUTDATED = "ClientOutdated",
  TEMPORARY_BAN = "TemporaryBan",
  STREAM_ERROR = "StreamError",
  STREAM_REPLACED = "StreamReplaced",
  PAIR_SUCCESS = "PairSuccess",
  PAIR_ERROR = "PairError",
  PASSKEY_REQUEST = "PasskeyRequest",
  PASSKEY_CONFIRMATION = "PasskeyConfirmation",
  PAIR_PASSKEY_ERROR = "PairPasskeyError",
  QR = "QR",
  QR_SCANNED_WITHOUT_MULTIDEVICE = "QRScannedWithoutMultidevice",
  QR_TIMEOUT = "QRTimeout",
  PRIVACY_SETTINGS = "PrivacySettings",
  PUSH_NAME_SETTING = "PushNameSetting",
  USER_ABOUT = "UserAbout",
  APP_STATE = "AppState",
  APP_STATE_SYNC_COMPLETE = "AppStateSyncComplete",
  HISTORY_SYNC = "HistorySync",
  OFFLINE_SYNC_COMPLETED = "OfflineSyncCompleted",
  OFFLINE_SYNC_PREVIEW = "OfflineSyncPreview",
  CALL_OFFER = "CallOffer",
  CALL_ACCEPT = "CallAccept",
  CALL_TERMINATE = "CallTerminate",
  CALL_OFFER_NOTICE = "CallOfferNotice",
  CALL_RELAY_LATENCY = "CallRelayLatency",
  PRESENCE = "Presence",
  CHAT_PRESENCE = "ChatPresence",
  IDENTITY_CHANGE = "IdentityChange",
  CAT_REFRESH_ERROR = "CATRefreshError",
  NEWSLETTER_JOIN = "NewsletterJoin",
  NEWSLETTER_LEAVE = "NewsletterLeave",
  NEWSLETTER_MUTE_CHANGE = "NewsletterMuteChange",
  NEWSLETTER_LIVE_UPDATE = "NewsletterLiveUpdate",
  FB_MESSAGE = "FBMessage",
  ALL = "All",
}

// Helper to get all webhook event values as string array
export const WEBHOOK_EVENTS = Object.values(WebhookEventType);

// Type for webhook event names
export type WebhookEvent = keyof typeof WebhookEventType;

export interface SetWebhookRequest {
  /**
   * Webhook URL. Decoded from the `webhookurl` key by current WuzAPI
   * servers — older servers read `webhook`.
   */
  webhookurl: string;
  events: (WebhookEvent | string)[];
}

export interface SetWebhookResponse {
  WebhookURL: string;
  Events: string[];
}

export interface GetWebhookResponse {
  subscribe: string[];
  webhook: string;
}

export interface UpdateWebhookRequest {
  webhook?: string;
  events?: (WebhookEvent | string)[];
  active?: boolean;
}

export interface UpdateWebhookResponse {
  WebhookURL: string;
  Events: string[];
  active: boolean;
}

export interface DeleteWebhookResponse {
  Details: string;
}

// Webhook payload types (what your webhook endpoint receives)

export interface S3MediaInfo {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
  fileName: string;
}

// Base interface that all webhook payloads extend from
export interface WebhookPayloadBase<T = unknown> {
  event: T;
  type: string;
  token: string;
  state?: string; // Optional state field (e.g., "Read" or "Delivered" for ReadReceipt events)
}

// Standard webhook payload with optional media
export interface WebhookPayload<T = unknown> extends WebhookPayloadBase<T> {
  s3?: S3MediaInfo;
  base64?: string;
  mimeType?: string;
  fileName?: string;
}

// Specific webhook payload types for different media delivery modes

// S3 only delivery
export interface S3OnlyWebhookPayload<T = unknown>
  extends WebhookPayloadBase<T> {
  s3: S3MediaInfo;
}

// Base64 only delivery
export interface Base64OnlyWebhookPayload<T = unknown>
  extends WebhookPayloadBase<T> {
  base64: string;
  mimeType: string;
  fileName: string;
}

// Both S3 and Base64 delivery
export interface BothMediaWebhookPayload<T = unknown>
  extends WebhookPayloadBase<T> {
  s3: S3MediaInfo;
  base64: string;
  mimeType: string;
  fileName: string;
}

// Union type for all possible webhook payloads
export type AnyWebhookPayload<T = unknown> =
  | WebhookPayload<T>
  | S3OnlyWebhookPayload<T>
  | Base64OnlyWebhookPayload<T>
  | BothMediaWebhookPayload<T>;

// Shared message and media interfaces for reusability across webhook events
//
// Note: Webhook events may have different structures than the corresponding
// WhatsApp events in events.ts. Webhook events use flat structures with
// string-based JIDs and ISO timestamp strings, while internal events use
// structured JID objects and Date objects.

// Common context info structures
export interface WebhookMessageContextInfo {
  deviceListMetadata?: WebhookDeviceListMetadata;
  deviceListMetadataVersion?: number;
  messageSecret?: string; // Encryption secret (string format for webhook)
  limitSharingV2?: {
    initiatedByMe: boolean;
    trigger: number;
  };
}

export interface WebhookDeviceListMetadata {
  senderKeyHash?: string; // Base64 string format for webhook (vs Uint8Array in message.ts)
  senderTimestamp?: number;
  recipientKeyHash?: string; // Base64 string format for webhook
  recipientTimestamp?: number;
  senderAccountType?: number; // Webhook-specific field
  receiverAccountType?: number; // Webhook-specific field
}

export interface WebhookContextInfo {
  disappearingMode?: {
    initiator: number;
    initiatedByMe?: boolean; // Webhook-specific field
    trigger?: number; // Webhook-specific field
  };
  ephemeralSettingTimestamp?: number;
  expiration?: number;
  forwardingScore?: number;
  isForwarded?: boolean;
  pairedMediaType?: number;
  statusSourceType?: number;
  featureEligibilities?: {
    canBeReshared?: boolean;
  };
}

// Common message types that are reused across different webhook events
export interface WebhookExtendedTextMessage {
  text: string;
  contextInfo?: WebhookContextInfo;
  inviteLinkGroupTypeV2?: number; // Webhook-specific field
  previewType?: number; // Webhook-specific field
}

export interface WebhookImageMessage {
  URL: string; // Full WhatsApp media URL (uppercase for webhook)
  JPEGThumbnail?: string; // Base64 encoded JPEG thumbnail
  contextInfo?: WebhookContextInfo;
  directPath: string; // Direct path to media
  fileEncSHA256: string; // Encrypted file SHA256 hash (string format for webhook)
  fileLength: number; // File size in bytes
  fileSHA256: string; // File SHA256 hash (string format for webhook)
  height: number;
  imageSourceType: number; // Webhook-specific field
  mediaKey: string; // Media encryption key (string format for webhook)
  mediaKeyTimestamp: number; // Unix timestamp
  midQualityFileSHA256: string; // Mid quality file hash (webhook-specific)
  mimetype: string; // MIME type (e.g., "image/jpeg")
  scanLengths: number[]; // Progressive scan lengths (webhook-specific)
  scansSidecar: string; // Progressive scan sidecar data (webhook-specific)
  firstScanLength?: number; // First scan length (webhook-specific)
  firstScanSidecar?: string; // First scan sidecar (webhook-specific)
  width: number;
}

export interface WebhookVideoMessage {
  URL: string; // Full WhatsApp media URL (uppercase for webhook)
  JPEGThumbnail?: string; // Base64 encoded JPEG thumbnail
  accessibilityLabel?: string;
  caption?: string;
  contextInfo?: WebhookContextInfo;
  directPath: string; // Direct path to media
  externalShareFullVideoDurationInSeconds?: number; // Webhook-specific field
  fileEncSHA256: string; // Encrypted file SHA256 hash (string format for webhook)
  fileLength: number; // File size in bytes
  fileSHA256: string; // File SHA256 hash (string format for webhook)
  gifAttribution?: number; // GIF attribution type (0=none, 1=giphy, 2=tenor, etc.) (webhook-specific)
  gifPlayback?: boolean; // Whether this video should be played as a GIF (webhook-specific)
  height: number;
  mediaKey: string; // Media encryption key (string format for webhook)
  mediaKeyTimestamp: number; // Unix timestamp
  mimetype: string; // MIME type (e.g., "video/mp4")
  seconds: number; // Video duration in seconds
  streamingSidecar?: string; // Streaming sidecar data for video streaming
  thumbnailDirectPath?: string; // Thumbnail direct path (webhook-specific)
  thumbnailEncSHA256?: string; // Thumbnail encrypted SHA256 (webhook-specific)
  thumbnailSHA256?: string; // Thumbnail SHA256 (webhook-specific)
  videoSourceType?: number; // Webhook-specific field
  width: number;
}

export interface WebhookAudioMessage {
  URL?: string; // Uppercase for webhook
  contextInfo?: WebhookContextInfo;
  directPath?: string;
  fileEncSHA256?: string; // String format for webhook
  fileLength?: number;
  fileSHA256?: string; // String format for webhook
  mediaKey?: string; // String format for webhook
  mediaKeyTimestamp?: number;
  mimetype?: string;
  seconds?: number;
  ptt?: boolean; // Push to talk (voice message) - Note: payload uses uppercase "PTT"
  streamingSidecar?: string; // Streaming sidecar data for audio streaming (webhook-specific)
  waveform?: string; // Base64 encoded waveform for voice messages (webhook-specific)
}

export interface WebhookDocumentMessage {
  URL: string; // Full WhatsApp media URL (uppercase for webhook)
  contactVcard: boolean; // Whether this is a contact vCard (webhook-specific field)
  contextInfo?: WebhookContextInfo;
  directPath: string; // Direct path to media
  fileEncSHA256: string; // Encrypted file SHA256 hash (string format for webhook)
  fileLength: number; // File size in bytes
  fileName: string; // Original file name
  fileSHA256: string; // File SHA256 hash (string format for webhook)
  mediaKey: string; // Media encryption key (string format for webhook)
  mediaKeyTimestamp: number; // Unix timestamp
  mimetype: string; // MIME type (e.g., "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf")
  pageCount?: number; // Number of pages in the document (webhook-specific field)
  title: string; // Document title (usually filename without extension)
}

export interface WebhookContactMessage {
  contextInfo?: WebhookContextInfo;
  displayName: string; // Display name of the contact
  vcard: string; // vCard data in standard vCard format
}

export interface WebhookPollCreationMessageV3 {
  contextInfo?: WebhookContextInfo;
  name: string; // Poll question/title
  options: Array<{
    optionHash: string; // Hash for the option
    optionName: string; // Display text for the option
  }>;
  pollContentType: number; // Type of poll content
  selectableOptionsCount: number; // Number of options that can be selected (0 = single choice, >0 = multiple choice)
}

export interface WebhookLocationMessage {
  JPEGThumbnail?: string; // Base64 encoded JPEG thumbnail of the location (webhook-specific field)
  contextInfo?: WebhookContextInfo;
  degreesLatitude: number; // Latitude coordinate
  degreesLongitude: number; // Longitude coordinate
}

export interface WebhookStickerMessage {
  URL: string; // Full WhatsApp media URL (uppercase for webhook)
  contextInfo?: WebhookContextInfo;
  directPath: string; // Direct path to media
  fileEncSHA256: string; // Encrypted file SHA256 hash (string format for webhook)
  fileLength: number; // File size in bytes
  fileSHA256: string; // File SHA256 hash (string format for webhook)
  firstFrameLength?: number; // First frame length for animated stickers (webhook-specific)
  firstFrameSidecar?: string; // First frame sidecar data (webhook-specific)
  height: number; // Sticker height
  isAiSticker?: boolean; // Whether this is an AI-generated sticker (webhook-specific)
  isAnimated?: boolean; // Whether this is an animated sticker (webhook-specific)
  isAvatar?: boolean; // Whether this is an avatar sticker (webhook-specific)
  isLottie?: boolean; // Whether this is a Lottie sticker (webhook-specific)
  mediaKey: string; // Media encryption key (string format for webhook)
  mediaKeyTimestamp: number; // Unix timestamp
  mimetype: string; // MIME type (typically "image/webp" for stickers)
  stickerSentTS?: number; // Sticker sent timestamp (webhook-specific field)
  width: number; // Sticker width
}

export interface WebhookReactionMessage {
  key: WebhookMessageKey; // Key of the message being reacted to
  senderTimestampMS?: number; // Timestamp when reaction was sent
  text?: string; // The reaction emoji/text
}

export interface WebhookEditedMessage {
  message?: unknown; // The edited message content
  timestampMS?: string; // Edit timestamp
  editedMessageID?: string; // ID of original message being edited
}

// Message key structure
export interface WebhookMessageKey {
  ID: string; // Uppercase field name for webhook (vs lowercase 'id' in message.ts)
  fromMe: boolean; // Required in webhook (vs optional in message.ts)
  participant?: string; // JID in string format
  remoteJID: string; // Uppercase JID field name for webhook (vs 'remoteJid' in message.ts)
}

// User receipt structure
export interface UserReceipt {
  userJID?: string;
  receiptTimestamp?: number;
  readTimestamp?: number;
  playedTimestamp?: number;
}

// Reaction structure
export interface WebhookReaction {
  key?: WebhookMessageKey;
  text?: string;
  senderTimestampMS?: number;
}

// Generic message wrapper for webhook payloads
export interface WebhookGenericMessage {
  messageContextInfo?: WebhookMessageContextInfo;
  conversation?: string; // Simple text message
  extendedTextMessage?: WebhookExtendedTextMessage;
  imageMessage?: WebhookImageMessage;
  videoMessage?: WebhookVideoMessage;
  audioMessage?: WebhookAudioMessage;
  documentMessage?: WebhookDocumentMessage;
  contactMessage?: WebhookContactMessage;
  locationMessage?: WebhookLocationMessage;
  stickerMessage?: WebhookStickerMessage;
  reactionMessage?: WebhookReactionMessage;
  editedMessage?: WebhookEditedMessage;

  // Interactive messages
  // TODO: define proper interfaces
  buttonsMessage?: unknown;
  listMessage?: unknown;
  templateMessage?: unknown;

  // Response messages
  buttonsResponseMessage?: unknown;
  listResponseMessage?: unknown;

  // Group messages
  groupInviteMessage?: unknown;

  // Poll messages
  pollCreationMessage?: unknown;
  pollCreationMessageV3?: WebhookPollCreationMessageV3;
  pollUpdateMessage?: unknown;

  // Special messages
  viewOnceMessage?: unknown;

  protocolMessage?: {
    type?: number;
    editedMessage?: WebhookGenericMessage; // Nested edited message in protocol messages
    key?: WebhookMessageKey; // Message key for protocol messages
    timestampMS?: number; // Edit timestamp
    historySyncNotification?: WebhookHistorySyncNotification;
    initialSecurityNotificationSettingSync?: {
      securityNotificationEnabled: boolean;
    };
  };
  deviceSentMessage?: {
    destinationJID: string;
    message: WebhookGenericMessage;
  };
}

// Message types enum for easier handling of different message types
export enum MessageType {
  TEXT = "conversation",
  EXTENDED_TEXT = "extendedTextMessage",
  IMAGE = "imageMessage",
  VIDEO = "videoMessage",
  AUDIO = "audioMessage",
  DOCUMENT = "documentMessage",
  CONTACT = "contactMessage",
  LOCATION = "locationMessage",
  STICKER = "stickerMessage",
  REACTION = "reactionMessage",
  EDITED = "editedMessage",
  PROTOCOL = "protocolMessage",
  DEVICE_SENT = "deviceSentMessage",

  // Interactive messages
  BUTTONS = "buttonsMessage",
  LIST = "listMessage",
  TEMPLATE = "templateMessage",

  // Response messages
  BUTTONS_RESPONSE = "buttonsResponseMessage",
  LIST_RESPONSE = "listResponseMessage",

  // Group messages
  GROUP_INVITE = "groupInviteMessage",

  // Poll messages
  POLL = "pollCreationMessage",
  POLL_CREATION = "pollCreationMessageV3",
  POLL_UPDATE = "pollUpdateMessage",

  // Special messages
  VIEW_ONCE = "viewOnceMessage",

  UNKNOWN = "unknown",
}
// History sync notification structure
export interface WebhookHistorySyncNotification {
  chunkOrder?: number;
  directPath: string;
  encHandle: string; // Webhook-specific field
  fileEncSHA256: string; // String format for webhook
  fileLength: number;
  fileSHA256: string; // String format for webhook
  mediaKey: string; // String format for webhook
  progress?: number;
  syncType: number;
}

// Using VerifiedName imported from user.ts (identical interface)

// Specific webhook event data interfaces

// QR webhook event data (based on observed webhook payload)
// Note: For QR events, the event field is actually just the string "code"
// We represent this as an empty interface since the real data is at payload level
export interface QRWebhookEvent {
  // The event field contains just the string "code"
  // The actual QR code data is in qrCodeBase64 at the payload level
}

// QRTimeout webhook event data (based on observed webhook payload)
// Fired when the QR code scan window expires without being scanned
export interface QRTimeoutWebhookEvent {
  // The event field contains just the string "timeout"
  // No additional data is provided beyond the timeout indication
}

// Connected webhook event data (based on observed webhook payload)
// Note: For Connected events, the event field is an empty object {}
export interface ConnectedWebhookEvent {
  // The event field contains an empty object {}
  // No additional data is provided for Connected events
}

// ReadReceipt webhook event data (based on observed webhook payload)
// Maps to Receipt event type but with webhook-specific structure
export interface ReadReceiptWebhookEvent {
  AddressingMode: string;
  BroadcastListOwner: string;
  Chat: string; // JID in string format (e.g., "554198387899-1431900789@g.us")
  IsFromMe: boolean;
  IsGroup: boolean;
  MessageIDs: string[];
  MessageSender: string;
  RecipientAlt: string;
  Sender: string; // JID in string format (e.g., "554198387899@s.whatsapp.net")
  SenderAlt: string;
  Timestamp: string; // ISO string timestamp
  Type: string; // Receipt type (e.g., "read")
}

// HistorySync webhook event data (based on observed webhook payload)
// Contains different types of historical data - can be pastParticipants, statusV3Messages, conversations, etc.
export interface HistorySyncWebhookEvent {
  Data: {
    // Variant 1: Past participants data (groups and stickers)
    pastParticipants?: Array<{
      groupJID: string; // JID in string format (e.g., "120363388053770128@g.us")
      pastParticipants: Array<{
        leaveReason: number; // 0 = left voluntarily, 1 = kicked/removed
        leaveTS: number; // Unix timestamp
        userJID: string; // JID in string format
      }>;
    }>;
    recentStickers?: Array<{
      URL: string; // Full WhatsApp media URL
      directPath: string; // Direct path to media
      fileEncSHA256: string; // Encrypted file SHA256 hash
      fileLength: number; // File size in bytes
      fileSHA256: string; // File SHA256 hash
      height: number;
      isLottie: boolean; // Whether it's an animated Lottie sticker
      lastStickerSentTS: number; // Unix timestamp of last usage
      mediaKey: string; // Media encryption key
      mimetype: string; // MIME type (e.g., "image/webp")
      weight: number; // Usage weight/frequency
      width: number;
    }>;

    // Variant 2: Status messages data (stories/status updates)
    statusV3Messages?: Array<{
      key: WebhookMessageKey;
      message: WebhookGenericMessage;
      messageTimestamp: number; // Unix timestamp
      participant: string; // JID in string format
      reportingTokenInfo?: {
        reportingTag: string;
      };
    }>;

    // Variant 3: Conversation histories data
    conversations?: Array<{
      ID: string; // JID in string format (chat identifier)
      messages: Array<{
        message: {
          key: WebhookMessageKey;
          message: WebhookGenericMessage;
          messageTimestamp: number; // Unix timestamp
          messageC2STimestamp?: number; // Client to server timestamp
          ephemeralStartTimestamp?: number; // Ephemeral message start timestamp
          originalSelfAuthorUserJIDString?: string; // Original author for messages sent by self
          status?: number; // Message status (3=delivered, 4=read, 5=played)
          userReceipt?: UserReceipt[];
          reactions?: WebhookReaction[];
          reportingTokenInfo?: {
            reportingTag: string;
          };
        };
        msgOrderID: number; // Message order ID
      }>;
    }>;
    phoneNumberToLidMappings?: Array<{
      lidJID: string; // LID JID (e.g., "165434221441206@lid")
      pnJID: string; // Phone number JID (e.g., "554199392033@s.whatsapp.net")
    }>;

    // Common fields for all variants
    chunkOrder?: number; // Chunk order for paginated sync
    progress?: number; // Sync progress
    syncType: number; // Sync operation type
  };
}

// Message webhook event data (based on observed webhook payload)
// Complex structure similar to MessageEvent in events.ts but with webhook-specific format
export interface MessageWebhookEvent {
  Info: {
    AddressingMode: string;
    BroadcastListOwner: string;
    Category: string;
    Chat: string; // JID in string format
    DeviceSentMeta: {
      DestinationJID: string;
      Phash: string;
    } | null;
    Edit: string;
    ID: string;
    IsFromMe: boolean;
    IsGroup: boolean;
    MediaType: string;
    MsgBotInfo: {
      EditSenderTimestampMS: string; // ISO timestamp
      EditTargetID: string;
      EditType: string;
    };
    MsgMetaInfo: {
      DeprecatedLIDSession: unknown | null;
      TargetID: string;
      TargetSender: string;
      ThreadMessageID: string;
      ThreadMessageSenderJID: string;
    };
    Multicast: boolean;
    PushName: string;
    RecipientAlt: string;
    Sender: string; // JID in string format
    SenderAlt: string;
    ServerID: number;
    Timestamp: string; // ISO string timestamp
    Type: string; // Message type (e.g., "text")
    VerifiedName: VerifiedName | null;
  };
  IsDocumentWithCaption: boolean;
  IsEdit: boolean;
  IsEphemeral: boolean;
  IsLottieSticker: boolean;
  IsViewOnce: boolean;
  IsViewOnceV2: boolean;
  IsViewOnceV2Extension: boolean;
  Message: WebhookGenericMessage; // Using webhook-specific message structure
  NewsletterMeta: unknown | null;
  RawMessage: WebhookGenericMessage; // Using webhook-specific message structure
  RetryCount: number;
  SourceWebMsg: unknown | null;
  UnavailableRequestID: string;
}

// Presence webhook event data
// Fired for contacts subscribed via POST /user/presence/subscribe (and for the account itself)
export interface PresenceWebhookEvent {
  /** JID of the contact whose presence changed. */
  from: string;
  state: "online" | "offline";
  /**
   * Unix timestamp of the contact's last seen. Only present when the
   * contact went offline and WhatsApp reported a timestamp.
   */
  last_seen?: number;
}

// PasskeyRequest webhook event data — the device initiated passkey pairing.
// Complete the flow by POSTing the authenticator's response to /session/passkey-response.
export interface PasskeyRequestWebhookEvent {
  publicKey: PasskeyChallenge;
}

// PasskeyConfirmation webhook event data — an 8-character pairing code was
// generated. Show it to the user, then POST /session/passkey-confirm once confirmed.
export interface PasskeyConfirmationWebhookEvent {
  code: string;
  skipHandoffUX: boolean;
}

// PairPasskeyError webhook event data — passkey pairing failed.
export interface PairPasskeyErrorWebhookEvent {
  error: string;
  /** Whether the pairing ceremony can continue with another method. */
  continuation: boolean;
}

// Typed webhook payloads for specific events
export type QRWebhookPayload = AnyWebhookPayload<QRWebhookEvent> & {
  qrCodeBase64: string; // QR code as base64 data URL
};
export type QRTimeoutWebhookPayload =
  AnyWebhookPayload<QRTimeoutWebhookEvent>;
export type ConnectedWebhookPayload = AnyWebhookPayload<ConnectedWebhookEvent>;
export type ReadReceiptWebhookPayload =
  AnyWebhookPayload<ReadReceiptWebhookEvent>;
export type HistorySyncWebhookPayload =
  AnyWebhookPayload<HistorySyncWebhookEvent>;
export type MessageWebhookPayload = AnyWebhookPayload<MessageWebhookEvent>;
export type PresenceWebhookPayload = AnyWebhookPayload<PresenceWebhookEvent>;
export type PasskeyRequestWebhookPayload =
  AnyWebhookPayload<PasskeyRequestWebhookEvent>;
export type PasskeyConfirmationWebhookPayload =
  AnyWebhookPayload<PasskeyConfirmationWebhookEvent>;
export type PairPasskeyErrorWebhookPayload =
  AnyWebhookPayload<PairPasskeyErrorWebhookEvent>;

// Webhook event mapping types for type-safe handling
export interface WebhookEventMap {
  QR: QRWebhookEvent;
  QRTimeout: QRTimeoutWebhookEvent;
  Connected: ConnectedWebhookEvent;
  ReadReceipt: ReadReceiptWebhookEvent;
  HistorySync: HistorySyncWebhookEvent;
  Message: MessageWebhookEvent;
  Presence: PresenceWebhookEvent;
  PasskeyRequest: PasskeyRequestWebhookEvent;
  PasskeyConfirmation: PasskeyConfirmationWebhookEvent;
  PairPasskeyError: PairPasskeyErrorWebhookEvent;
  // Add more webhook event mappings here as they are discovered
}

// Type-safe webhook handler function type
export type WebhookEventHandler<T extends keyof WebhookEventMap> = (
  payload: AnyWebhookPayload<WebhookEventMap[T]>
) => void | Promise<void>;

// Union type for all specific webhook payloads
export type SpecificWebhookPayload =
  | QRWebhookPayload
  | QRTimeoutWebhookPayload
  | ConnectedWebhookPayload
  | ReadReceiptWebhookPayload
  | HistorySyncWebhookPayload
  | MessageWebhookPayload
  | PresenceWebhookPayload
  | PasskeyRequestWebhookPayload
  | PasskeyConfirmationWebhookPayload
  | PairPasskeyErrorWebhookPayload;

// Type guard to check if payload is a specific webhook event type
export function isWebhookEventType<T extends keyof WebhookEventMap>(
  payload: WebhookPayloadBase,
  eventType: T
): payload is AnyWebhookPayload<WebhookEventMap[T]> {
  return payload.type === eventType;
}

// Helper type guards
export function hasS3Media(
  payload: WebhookPayloadBase
): payload is S3OnlyWebhookPayload | BothMediaWebhookPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(payload as any).s3;
}

export function hasBase64Media(
  payload: WebhookPayloadBase
): payload is Base64OnlyWebhookPayload | BothMediaWebhookPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(payload as any).base64;
}

export function hasBothMedia(
  payload: WebhookPayloadBase
): payload is BothMediaWebhookPayload {
  return hasS3Media(payload) && hasBase64Media(payload);
}

// Helper type guard to check if payload has token (all webhook payloads should)
export function isValidWebhookPayload(
  payload: unknown
): payload is WebhookPayloadBase {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "event" in payload &&
    "type" in payload &&
    "token" in payload
  );
}

/**
 * Utility function to discover the type of a GenericMessage
 * @param message - The GenericMessage to analyze
 * @returns MessageType enum value indicating the message type
 *
 * @example
 * ```typescript
 * import { discoverMessageType, MessageType } from "wuzapi";
 *
 * const messageType = discoverMessageType(webhookPayload.event.Message);
 *
 * switch (messageType) {
 *   case MessageType.IMAGE:
 *     console.log("Received an image message");
 *     break;
 *   case MessageType.EXTENDED_TEXT:
 *     console.log("Received a text message");
 *     break;
 *   // ... handle other types
 * }
 * ```
 */
export function discoverMessageType(
  message: WebhookGenericMessage
): MessageType {
  if (!message) return MessageType.UNKNOWN;

  // Check for each message type in order of most common to least common
  if (message.conversation) return MessageType.TEXT;
  if (message.extendedTextMessage) return MessageType.EXTENDED_TEXT;
  if (message.imageMessage) return MessageType.IMAGE;
  if (message.videoMessage) return MessageType.VIDEO;
  if (message.audioMessage) return MessageType.AUDIO;
  if (message.documentMessage) return MessageType.DOCUMENT;
  if (message.contactMessage) return MessageType.CONTACT;
  if (message.locationMessage) return MessageType.LOCATION;
  if (message.stickerMessage) return MessageType.STICKER;
  if (message.reactionMessage) return MessageType.REACTION;

  // Interactive messages
  if (message.buttonsMessage) return MessageType.BUTTONS;
  if (message.listMessage) return MessageType.LIST;
  if (message.templateMessage) return MessageType.TEMPLATE;

  // Response messages
  if (message.buttonsResponseMessage) return MessageType.BUTTONS_RESPONSE;
  if (message.listResponseMessage) return MessageType.LIST_RESPONSE;

  // Group messages
  if (message.groupInviteMessage) return MessageType.GROUP_INVITE;

  // Poll messages
  if (message.pollCreationMessage) return MessageType.POLL;
  if (message.pollCreationMessageV3) return MessageType.POLL_CREATION;
  if (message.pollUpdateMessage) return MessageType.POLL_UPDATE;

  // Special messages
  if (message.viewOnceMessage) return MessageType.VIEW_ONCE;

  // System messages
  if (message.editedMessage) return MessageType.EDITED;
  if (message.protocolMessage) return MessageType.PROTOCOL;
  if (message.deviceSentMessage) return MessageType.DEVICE_SENT;

  return MessageType.UNKNOWN;
}
