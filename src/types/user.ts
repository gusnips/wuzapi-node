// User endpoints types

export interface UserInfoRequest {
  Phone: string[];
}

export interface VerifiedName {
  Certificate: {
    details: string;
    signature: string;
  };
  Details: {
    issuer: string;
    serial: number;
    verifiedName: string;
  };
}

export interface UserInfo {
  Devices: string[];
  PictureID: string;
  Status: string;
  VerifiedName: VerifiedName | null;
}

export interface UserInfoResponse {
  Users: Record<string, UserInfo>;
}

export interface UserCheckRequest {
  Phone: string[];
}

export interface UserCheck {
  IsInWhatsapp: boolean;
  JID: string;
  Query: string;
  VerifiedName: string;
}

export interface UserCheckResponse {
  Users: UserCheck[];
}

export interface UserAvatarRequest {
  Phone: string;
  Preview: boolean;
}

export interface UserAvatarResponse {
  URL: string;
  ID: string;
  Type: string;
  DirectPath: string;
}

export interface Contact {
  BusinessName: string;
  FirstName: string;
  Found: boolean;
  FullName: string;
  PushName: string;
}

export interface ContactsResponse {
  [jid: string]: Contact;
}

export interface UserPresenceRequest {
  type: "available" | "unavailable";
}

export interface UserPresenceResponse {
  Details: string;
}

export interface SubscribePresenceRequest {
  /** Phone number (country code, no +) or JID of the contact to subscribe to. */
  Phone: string;
}

/** Presence updates for subscribed contacts arrive via `Presence` webhooks. */
export interface SubscribePresenceResponse {
  Details: string;
}

export interface UserLidResponse {
  LID: string;
  Phone: string;
}

export interface UserPrivacySettings {
  GroupAdd?: string;
  LastSeen?: string;
  Status?: string;
  Profile?: string;
  ReadReceipts?: string;
  CallAdd?: string;
  Online?: string;
  Messages?: string;
  Defense?: string;
  Stickers?: string;
}

export interface PrivacySettingValueMap {
  groupadd: "all" | "contacts" | "contact_blacklist" | "none";
  last: "all" | "contacts" | "contact_blacklist" | "none";
  status: "all" | "contacts" | "contact_blacklist" | "none";
  profile: "all" | "contacts" | "contact_blacklist" | "none";
  readreceipts: "all" | "none";
  online: "all" | "match_last_seen";
  calladd: "all" | "known";
}

export type UserPrivacyRequest = {
  [K in keyof PrivacySettingValueMap]: {
    Name: K;
    Value: PrivacySettingValueMap[K];
  };
}[keyof PrivacySettingValueMap];

export interface UserBlockRequest {
  Phone?: string;
  JID?: string;
}

export interface UserBlockResponse {
  Details: string;
  JID: string;
  Blocklist: string[];
  DHash: string;
}

export type UserUnblockResponse = UserBlockResponse;

export interface UserBlocklistResponse {
  Blocklist: string[];
  DHash: string;
}
