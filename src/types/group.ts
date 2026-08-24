// Group endpoints types

export interface GroupParticipant {
  AddRequest: null;
  DisplayName: string;
  Error: number;
  IsAdmin: boolean;
  IsSuperAdmin: boolean;
  JID: string;
  LID: string;
  PhoneNumber: string;
}

export interface GroupInfo {
  AddressingMode: string;
  AnnounceVersionID: string;
  CreatorCountryCode: string;
  DefaultMembershipApprovalMode: string;
  DisappearingTimer: number;
  GroupCreated: string;
  IsAnnounce: boolean;
  IsDefaultSubGroup: boolean;
  IsEphemeral: boolean;
  IsIncognito: boolean;
  IsJoinApprovalRequired: boolean;
  IsLocked: boolean;
  IsParent: boolean;
  JID: string;
  LinkedParentJID: string;
  MemberAddMode: string;
  Name: string;
  NameSetAt: string;
  NameSetBy: string;
  NameSetByPN: string;
  OwnerJID: string;
  OwnerPN: string;
  ParticipantVersionID: string;
  Participants: GroupParticipant[];
  Topic: string;
  TopicDeleted: boolean;
  TopicID: string;
  TopicSetAt: string;
  TopicSetBy: string;
  TopicSetByPN: string;
}

export interface GroupListResponse {
  Groups: GroupInfo[];
}

export interface GroupInviteLinkRequest {
  GroupJID: string;
  /** Revoke the current link and generate a fresh one. */
  Reset?: boolean;
}

export interface GroupInviteLinkResponse {
  InviteLink: string;
}

export interface GroupInfoRequest {
  GroupJID: string;
}

export interface GroupPhotoRequest {
  GroupJID: string;
  Image: string; // base64 encoded JPEG
}

export interface GroupPhotoResponse {
  Details: string;
  PictureID: string;
}

export interface GroupNameRequest {
  GroupJID: string;
  Name: string;
}

export interface GroupNameResponse {
  Details: string;
}

export interface GroupCreateRequest {
  Name: string;
  Participants: string[];
}

export type GroupCreateResponse = GroupInfo;

export interface GroupLockedRequest {
  GroupJID: string;
  Locked: boolean;
}

export interface GroupLockedResponse {
  Details: string;
}

export interface GroupEphemeralRequest {
  GroupJID: string;
  Duration: "24h" | "7d" | "90d" | "off";
}

export interface GroupEphemeralResponse {
  Details: string;
}

export interface GroupPhotoRemoveRequest {
  GroupJID: string;
}

export interface GroupPhotoRemoveResponse {
  Details: string;
}

export interface GroupLeaveRequest {
  GroupJID: string;
}

export interface GroupLeaveResponse {
  Details: string;
}

export interface GroupTopicRequest {
  GroupJID: string;
  Topic: string;
}

export interface GroupTopicResponse {
  Details: string;
}

export interface GroupAnnounceRequest {
  GroupJID: string;
  Announce: boolean;
}

export interface GroupAnnounceResponse {
  Details: string;
}

export interface GroupJoinRequest {
  Code: string;
}

export interface GroupJoinResponse {
  GroupJID: string;
  Details: string;
}

export interface GroupInviteInfoRequest {
  Code: string;
}

export interface GroupInviteInfoResponse {
  InviteInfo: {
    GroupName: string;
    GroupJID: string;
  };
}

export interface GroupUpdateParticipantsRequest {
  GroupJID: string;
  Action: "add" | "remove" | "promote" | "demote";
  Participants: string[];
}

export interface ParticipantUpdate {
  JID: string;
  Status: string;
  Code: number;
}

export interface GroupUpdateParticipantsResponse {
  Updates: ParticipantUpdate[];
}

export interface GroupRequestParticipant {
  JID: string;
  RequestedAt: string;
}

export type GroupRequestParticipantsResponse = GroupRequestParticipant[];

export interface UpdateGroupRequestParticipantsRequest {
  GroupJID: string;
  Action: "approve" | "reject";
  Phone: string[];
}

export interface UpdateGroupRequestParticipantsResponse {
  Details: string;
}

export interface SetGroupJoinApprovalModeRequest {
  groupjid: string;
  mode: boolean;
}

export interface SetGroupJoinApprovalModeResponse {
  Details: string;
}
