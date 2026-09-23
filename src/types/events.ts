// WhatsApp events types based on whatsmeow package
// Reference: https://pkg.go.dev/go.mau.fi/whatsmeow@v0.0.0-20250829123043-72d2ed58e998/types/events

import { Message } from "./message.js";

// Event types enum for all possible WhatsApp events
export enum EventType {
  // Core message and communication events
  MESSAGE = "Message",
  RECEIPT = "Receipt",
  PRESENCE = "Presence",
  CHAT_PRESENCE = "ChatPresence",

  // Connection and session events
  CONNECTED = "Connected",
  DISCONNECTED = "Disconnected",
  LOGGED_OUT = "LoggedOut",
  QR = "QR",
  QR_SCANNED_WITHOUT_MULTIDEVICE = "QRScannedWithoutMultidevice",
  PAIR_SUCCESS = "PairSuccess",
  PAIR_ERROR = "PairError",
  MANUAL_LOGIN_RECONNECT = "ManualLoginReconnect",
  KEEP_ALIVE_RESTORED = "KeepAliveRestored",
  KEEP_ALIVE_TIMEOUT = "KeepAliveTimeout",

  // Group events
  GROUP_INFO = "GroupInfo",
  JOINED_GROUP = "JoinedGroup",

  // Contact and user events
  CONTACT = "Contact",
  PUSH_NAME = "PushName",
  PUSH_NAME_SETTING = "PushNameSetting",
  PICTURE = "Picture",
  USER_ABOUT = "UserAbout",
  USER_STATUS_MUTE = "UserStatusMute",
  PRIVACY_SETTINGS = "PrivacySettings",

  // App state and sync events
  APP_STATE = "AppState",
  APP_STATE_SYNC_COMPLETE = "AppStateSyncComplete",
  HISTORY_SYNC = "HistorySync",
  OFFLINE_SYNC_COMPLETED = "OfflineSyncCompleted",
  OFFLINE_SYNC_PREVIEW = "OfflineSyncPreview",
  IDENTITY_CHANGE = "IdentityChange",

  // Chat management events
  ARCHIVE = "Archive",
  UNARCHIVE_CHATS_SETTING = "UnarchiveChatsSetting",
  CLEAR_CHAT = "ClearChat",
  DELETE_CHAT = "DeleteChat",
  DELETE_FOR_ME = "DeleteForMe",
  MARK_CHAT_AS_READ = "MarkChatAsRead",
  MUTE = "Mute",
  PIN = "Pin",
  STAR = "Star",

  // Label events
  LABEL_ASSOCIATION_CHAT = "LabelAssociationChat",
  LABEL_ASSOCIATION_MESSAGE = "LabelAssociationMessage",
  LABEL_EDIT = "LabelEdit",

  // Media events
  MEDIA_RETRY = "MediaRetry",
  MEDIA_RETRY_ERROR = "MediaRetryError",

  // Newsletter events
  NEWSLETTER_JOIN = "NewsletterJoin",
  NEWSLETTER_LEAVE = "NewsletterLeave",
  NEWSLETTER_LIVE_UPDATE = "NewsletterLiveUpdate",
  NEWSLETTER_MESSAGE_META = "NewsletterMessageMeta",
  NEWSLETTER_MUTE_CHANGE = "NewsletterMuteChange",

  // Error and system events
  UNDECRYPTABLE_MESSAGE = "UndecryptableMessage",
  STREAM_ERROR = "StreamError",
  STREAM_REPLACED = "StreamReplaced",
  CONNECT_FAILURE = "ConnectFailure",
  CLIENT_OUTDATED = "ClientOutdated",
  TEMPORARY_BAN = "TemporaryBan",
  CAT_REFRESH_ERROR = "CATRefreshError",
  PERMANENT_DISCONNECT = "PermanentDisconnect",

  // Blocklist events
  BLOCKLIST = "Blocklist",
  BLOCKLIST_ACTION = "BlocklistAction",
  BLOCKLIST_CHANGE = "BlocklistChange",

  // Business events
  BUSINESS_NAME = "BusinessName",

  // Call events
  CALL_ACCEPT = "CallAccept",
  CALL_OFFER = "CallOffer",
  CALL_OFFER_NOTICE = "CallOfferNotice",
  CALL_PRE_ACCEPT = "CallPreAccept",
  CALL_REJECT = "CallReject",
  CALL_RELAY_LATENCY = "CallRelayLatency",
  CALL_TERMINATE = "CallTerminate",
  CALL_TRANSPORT = "CallTransport",
  UNKNOWN_CALL_EVENT = "UnknownCallEvent",

  // FB/Meta specific events
  FB_MESSAGE = "FBMessage",
}

// Additional specific types from whatsmeow
export interface WaBinaryNode {
  Tag: string;
  Attrs: Record<string, string>;
  Content: unknown;
}

export interface SyncAction {
  timestamp: Date;
  action: unknown;
}

export interface StarAction extends SyncAction {
  starred: boolean;
}

export interface ArchiveAction extends SyncAction {
  archived: boolean;
}

export interface ClearChatAction extends SyncAction {
  messageRange?: {
    lastMessageTimestamp?: Date;
    lastSystemMessageTimestamp?: Date;
  };
}

export interface DeleteChatAction extends SyncAction {}

export interface DeleteMessageForMeAction extends SyncAction {}

export interface MarkChatAsReadAction extends SyncAction {
  read: boolean;
  messageRange?: {
    lastMessageTimestamp?: Date;
    lastSystemMessageTimestamp?: Date;
  };
}

export interface MuteAction extends SyncAction {
  muted: boolean;
  muteEndTimestamp?: Date;
}

export interface PinAction extends SyncAction {
  pinned: boolean;
}

export interface PushNameSettingAction extends SyncAction {
  name: string;
}

export interface UnarchiveChatsSettingAction extends SyncAction {
  unarchiveChats: boolean;
}

export interface LabelAssociationAction extends SyncAction {
  labeled: boolean;
}

export interface LabelEditAction extends SyncAction {
  name: string;
  color: number;
  predefinedId?: string;
  deleted: boolean;
}

export interface BusinessNameAction extends SyncAction {
  businessName: string;
  verified: number;
}

export interface UserStatusMuteAction extends SyncAction {
  muted: boolean;
}

export interface Armadillo {
  payload?: unknown;
}

export interface ConsumerApplication {
  metadata?: unknown;
}

export interface BasicCallMeta {
  from: JID;
  timestamp: Date;
  callId: string;
  callCreator: JID;
}

export interface CallRemoteMeta {
  remoteJid: JID;
  fromMe: boolean;
}

export interface EventGroupParticipant {
  JID: JID;
  IsAdmin: boolean;
  IsSuperAdmin: boolean;
}

export interface HistorySyncData {
  conversations?: unknown[];
  messages?: unknown[];
}

// Common types used in events
export interface JID {
  User: string;
  Agent: number;
  Device: number;
  Integrator: number;
  Server: string;
  AD: boolean;
}

export interface MessageInfo {
  ID: string;
  Type: string;
  PushName: string;
  Timestamp: Date;
  Source: MessageSource;
  DeviceSentMeta?: DeviceSentMeta;
  ServerID?: number;
  Status?: MessageStatus;
}

export interface MessageSource {
  Chat: JID;
  Sender: JID;
  IsFromMe: boolean;
  IsGroup: boolean;
  BroadcastListOwner?: JID;
}

export interface DeviceSentMeta {
  DestinationJID: string;
  Phash: string;
}

export enum MessageStatus {
  ERROR = "ERROR",
  PENDING = "PENDING",
  SERVER_ACK = "SERVER_ACK",
  DELIVERY_ACK = "DELIVERY_ACK",
  READ = "READ",
  PLAYED = "PLAYED",
}

export enum ReceiptType {
  UNKNOWN = "",
  DELIVERY = "delivery",
  READ = "read",
  READ_SELF = "read-self",
  PLAYED = "played",
  SENDER = "sender",
  INACTIVE = "inactive",
  PEER_MSG = "peer_msg",
}

export enum DecryptFailMode {
  UNAVAILABLE = "unavailable",
  DECRYPT_FAIL = "decrypt_fail",
}

export enum UnavailableType {
  UNKNOWN = "",
  VIEW_ONCE = "view_once",
}

/**
 * The code WhatsApp gives when it refuses a connection or ends a session
 * (whatsmeow's `ConnectFailureReason`). `ConnectFailure` and `LoggedOut` carry
 * it as `Reason`. After 401, 403 or 406 the number has to pair again.
 */
export enum ConnectFailureReason {
  GENERIC = 400,
  /** The device was removed: from the phone, or by WhatsApp. */
  LOGGED_OUT = 401,
  TEMP_BANNED = 402,
  /**
   * WhatsApp Web calls this LOCKED. It comes when WhatsApp restricts the
   * number, and also when its owner switches phones.
   */
  MAIN_DEVICE_GONE = 403,
  CLIENT_OUTDATED = 405,
  /** WhatsApp Web calls this BANNED. */
  UNKNOWN_LOGOUT = 406,
  BAD_USER_AGENT = 409,
  CAT_EXPIRED = 413,
  CAT_INVALID = 414,
  NOT_FOUND = 415,
  CLIENT_UNKNOWN = 418,
  INTERNAL_SERVER_ERROR = 500,
  EXPERIMENTAL = 501,
  SERVICE_UNAVAILABLE = 503,
}

export enum TempBanReason {
  SENT_TO_TOO_MANY_PEOPLE = 101,
  BLOCKED_BY_USERS = 102,
  CREATED_TOO_MANY_GROUPS = 103,
  SENT_TOO_MANY_SAME_MESSAGE = 104,
  BROADCAST_LIST = 106,
}

// Event types
export interface AppState {
  name: string;
  version: number;
  hash: string[];
}

export interface AppStateSyncComplete {
  name: string;
}

export interface Archive {
  JID: JID;
  Timestamp: Date;
  Action: ArchiveAction;
  FromFullSync: boolean;
}

export interface Blocklist {
  JID: JID;
  action: string;
  dhash: string;
}

export interface BlocklistAction {
  action: string;
}

export interface BlocklistChange {
  JID: JID;
  action: BlocklistChangeAction;
}

export interface BlocklistChangeAction {
  action: string;
}

export interface BusinessName {
  BusinessJID: JID;
  PushName: string;
  VerifiedName: string;
  VerifiedLevel: string;
  Action: BusinessNameAction;
  FromFullSync: boolean;
}

export interface CATRefreshError {
  code: string;
  text: string;
}

export interface CallAccept {
  BasicCallMeta: BasicCallMeta;
}

export interface CallOffer {
  BasicCallMeta: BasicCallMeta;
  CallRemoteMeta: CallRemoteMeta;
  Data: string;
}

export interface CallOfferNotice {
  BasicCallMeta: BasicCallMeta;
  Media: string;
  Type: string;
  Data: string;
}

export interface CallPreAccept {
  BasicCallMeta: BasicCallMeta;
  CallRemoteMeta: CallRemoteMeta;
}

export interface CallReject {
  BasicCallMeta: BasicCallMeta;
}

export interface CallRelayLatency {
  BasicCallMeta: BasicCallMeta;
  Latency: number;
}

export interface CallTerminate {
  BasicCallMeta: BasicCallMeta;
  Reason: string;
}

export interface CallTransport {
  BasicCallMeta: BasicCallMeta;
}

export interface ChatPresence {
  MessageSource: MessageSource;
  State: string;
  Media: string;
}

export interface ClearChat {
  ChatJID: JID;
  Timestamp: Date;
  Action: ClearChatAction;
  FromFullSync: boolean;
}

export interface ClientOutdated {
  // Event indicating the client version is outdated
}

export interface ConnectFailure {
  Reason: ConnectFailureReason;
  Raw: WaBinaryNode;
}

export interface Connected {
  // Event indicating successful connection
}

export interface EventContact {
  JID: JID;
  Found: boolean;
  FirstName: string;
  FullName: string;
  PushName: string;
  BusinessName: string;
}

export interface DeleteChat {
  ChatJID: JID;
  Timestamp: Date;
  Action: DeleteChatAction;
  FromFullSync: boolean;
}

export interface DeleteForMe {
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  MessageID: string;
  Timestamp: Date;
  Action: DeleteMessageForMeAction;
  FromFullSync: boolean;
}

export interface Disconnected {
  // Event indicating disconnection
}

export interface FBMessage {
  Info: MessageInfo;
  IsEphemeral: boolean;
  IsViewOnce: boolean;
  IsDocumentWithCaption: boolean;
  IsEdit: boolean;
  Message: Armadillo;
}

export interface EventGroupInfo {
  JID: JID;
  GroupName: string;
  GroupTopic: string;
  GroupLocked: boolean;
  GroupAnnounce: boolean;
  GroupEphemeral: boolean;
  GroupParent?: JID;
  GroupLinkedParent?: JID;
  GroupIsDefaultSub: boolean;
  GroupCreated: Date;
  ParticipantVersionID: string;
  Participants: EventGroupParticipant[];
  PendingParticipants: EventGroupParticipant[];
  JoinedAt: Date;
  CreateKey: string;
  Sender: JID;
  Timestamp: Date;
}

export interface HistorySync {
  Data: HistorySyncData;
}

export interface IdentityChange {
  JID: JID;
  Timestamp: Date;
  Implicit: boolean;
}

export interface JoinedGroup {
  Reason: string;
  Type: string;
  CreateKey: string;
  Participants: EventGroupParticipant[];
}

export interface KeepAliveRestored {
  // Event indicating keep-alive connection restored
}

export interface KeepAliveTimeout {
  // Event indicating keep-alive timeout
}

export interface LabelAssociationChat {
  ChatJID: JID;
  LabelID: string;
  Labeled: boolean;
  Timestamp: Date;
  Action: LabelAssociationAction;
  FromFullSync: boolean;
}

export interface LabelAssociationMessage {
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  MessageID: string;
  LabelID: string;
  Labeled: boolean;
  Timestamp: Date;
  Action: LabelAssociationAction;
  FromFullSync: boolean;
}

export interface LabelEdit {
  ID: string;
  Name: string;
  Color: number;
  Deleted: boolean;
  Timestamp: Date;
  Action: LabelEditAction;
  FromFullSync: boolean;
}

/**
 * The server may never deliver this event: see "When LoggedOut never arrives"
 * in the README.
 */
export interface LoggedOut {
  /** true: WhatsApp refused a reconnect. false: it ended a live connection. */
  OnConnect: boolean;
  Reason: ConnectFailureReason;
}

export interface ManualLoginReconnect {
  // Event indicating manual login reconnection required
}

export interface MarkChatAsRead {
  ChatJID: JID;
  Timestamp: Date;
  Action: MarkChatAsReadAction;
  FromFullSync: boolean;
}

export interface MediaRetry {
  MessageID: string;
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  Timestamp: Date;
}

export interface MediaRetryError {
  MessageID: string;
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  Timestamp: Date;
  Error: string;
}

export interface MessageEvent {
  Info: MessageInfo;
  Message: Message;
  IsEphemeral: boolean;
  IsViewOnce: boolean;
  IsDocumentWithCaption: boolean;
  IsEdit: boolean;
  RawMessage: WaBinaryNode;
}

export interface Mute {
  ChatJID: JID;
  Timestamp: Date;
  Action: MuteAction;
  FromFullSync: boolean;
}

export interface NewsletterJoin {
  ID: JID;
  NewsletterMeta: {
    name: string;
    description?: string;
    invite?: string;
    creationTime?: Date;
  };
}

export interface NewsletterLeave {
  ID: JID;
}

export interface NewsletterLiveUpdate {
  ID: JID;
  Time: Date;
  Messages: unknown[];
}

export interface NewsletterMessageMeta {
  ID: JID;
  MessageServerID: number;
  MessageID: string;
  ReactionCounts: Record<string, number>;
  Views: number;
}

export interface NewsletterMuteChange {
  ID: JID;
  Mute: string;
}

export interface OfflineSyncCompleted {
  Count: number;
}

export interface OfflineSyncPreview {
  Messages: unknown[];
  IsLatest: boolean;
}

export interface PairError {
  ID: string;
  Error: string;
}

export interface PairSuccess {
  ID: string;
  BusinessName: string;
  Platform: string;
}

export interface PermanentDisconnect {
  // Event indicating permanent disconnection
}

export interface Picture {
  JID: JID;
  Author: JID;
  Timestamp: Date;
  Remove: boolean;
  NewPicture?: {
    id: string;
    type: string;
    directPath: string;
  };
  OldPicture?: {
    id: string;
    type: string;
    directPath: string;
  };
}

export interface Pin {
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  MessageID: string;
  Timestamp: Date;
  Action: PinAction;
  FromFullSync: boolean;
}

export interface Presence {
  From: JID;
  Unavailable: boolean;
  LastSeen: Date;
}

export interface PrivacySettings {
  GroupAddChanged: boolean;
  LastSeenChanged: boolean;
  StatusChanged: boolean;
  ProfileChanged: boolean;
  ReadReceiptsChanged: boolean;
  OnlineChanged: boolean;
  CallAddChanged: boolean;
}

export interface PushName {
  JID: JID;
  Message: MessageInfo;
  OldPushName: string;
  NewPushName: string;
}

export interface PushNameSetting {
  Timestamp: Date;
  Action: PushNameSettingAction;
  FromFullSync: boolean;
}

export interface QR {
  Codes: string[];
}

export interface QRScannedWithoutMultidevice {
  // Event indicating QR was scanned but multidevice not enabled
}

export interface Receipt {
  MessageSource: MessageSource;
  MessageIDs: string[];
  Timestamp: Date;
  Type: ReceiptType;
  MessageSender: JID;
}

export interface Star {
  ChatJID: JID;
  SenderJID: JID;
  IsFromMe: boolean;
  MessageID: string;
  Timestamp: Date;
  Action: StarAction;
  FromFullSync: boolean;
}

export interface StreamError {
  Code: string;
  Raw: WaBinaryNode;
}

export interface StreamReplaced {
  // Event indicating stream was replaced by another connection
}

export interface TemporaryBan {
  Code: TempBanReason;
  Expire: number; // Duration in seconds
}

export interface UnarchiveChatsSetting {
  Timestamp: Date;
  Action: UnarchiveChatsSettingAction;
  FromFullSync: boolean;
}

export interface UndecryptableMessage {
  Info: MessageInfo;
  IsUnavailable: boolean;
  UnavailableType: UnavailableType;
  DecryptFailMode: DecryptFailMode;
}

export interface UnknownCallEvent {
  Node: WaBinaryNode;
}

export interface UserAbout {
  JID: JID;
  Status: string;
  Timestamp: Date;
}

export interface UserStatusMute {
  JID: JID;
  Timestamp: Date;
  Action: UserStatusMuteAction;
  FromFullSync: boolean;
}

// Union type for all possible events
export type WhatsAppEvent =
  | AppState
  | AppStateSyncComplete
  | Archive
  | Blocklist
  | BlocklistAction
  | BlocklistChange
  | BusinessName
  | CATRefreshError
  | CallAccept
  | CallOffer
  | CallOfferNotice
  | CallPreAccept
  | CallReject
  | CallRelayLatency
  | CallTerminate
  | CallTransport
  | ChatPresence
  | ClearChat
  | ClientOutdated
  | ConnectFailure
  | Connected
  | EventContact
  | DeleteChat
  | DeleteForMe
  | Disconnected
  | FBMessage
  | EventGroupInfo
  | HistorySync
  | IdentityChange
  | JoinedGroup
  | KeepAliveRestored
  | KeepAliveTimeout
  | LabelAssociationChat
  | LabelAssociationMessage
  | LabelEdit
  | LoggedOut
  | ManualLoginReconnect
  | MarkChatAsRead
  | MediaRetry
  | MediaRetryError
  | MessageEvent
  | Mute
  | NewsletterJoin
  | NewsletterLeave
  | NewsletterLiveUpdate
  | NewsletterMessageMeta
  | NewsletterMuteChange
  | OfflineSyncCompleted
  | OfflineSyncPreview
  | PairError
  | PairSuccess
  | PermanentDisconnect
  | Picture
  | Pin
  | Presence
  | PrivacySettings
  | PushName
  | PushNameSetting
  | QR
  | QRScannedWithoutMultidevice
  | Receipt
  | Star
  | StreamError
  | StreamReplaced
  | TemporaryBan
  | UnarchiveChatsSetting
  | UndecryptableMessage
  | UnknownCallEvent
  | UserAbout
  | UserStatusMute;

// Event handler type
export type EventHandler<T extends WhatsAppEvent = WhatsAppEvent> = (
  event: T
) => void | Promise<void>;

// Event emitter interface
export interface EventEmitter {
  on<T extends WhatsAppEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;
  off<T extends WhatsAppEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;
  emit<T extends WhatsAppEvent>(eventType: string, event: T): void;
}
