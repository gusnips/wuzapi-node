# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.11.1] - 2026-08-24

### Fixed

- `SendAudioRequest.Waveform` is now `string` (base64), not `number[]`. The server decodes the field as Go `[]byte`, which JSON binds only from a base64 string — a number array failed unmarshal on the real server. The vendored spec documented this wrongly too (`array` of integers); corrected to OpenAPI `string`/`format: byte`

## [1.11.0] - 2026-08-24

> **Upgrading:** `setWebhook` now sends the URL as `webhookurl` — current WuzAPI
> servers silently ignore requests carrying the old `webhook` key on
> `POST /webhook`. `session.disconnect()` takes an optional `clear` flag as its
> first argument; move per-request tokens (`disconnect({ token })`) to the
> second argument. `SendButtonsRequest.Buttons` uses the server's new button
> shape.

Synced against WuzAPI upstream `919c72c` (release v1.0.8).

### Added

- **Passkey pairing** (upstream PR #343): `client.session.getPasskeyStatus()`, `sendPasskeyResponse(request)` and `confirmPasskey()`, plus `PasskeyChallenge` / WebAuthn types. `/session/qr` and `/session/status` responses now expose `passkeyPending` and `publicKey`
- `client.chat.pinMessage(request)` — pin/unpin messages for all participants (`POST /chat/pin`; routed upstream but missing from their spec, transcribed from handlers)
- `client.user.subscribePresence(phone)` — subscribe to a contact's presence updates (`POST /user/presence/subscribe`)
- New webhook events `PasskeyRequest`, `PasskeyConfirmation` and `PairPasskeyError` with typed payloads; Presence webhook payloads expose optional `last_seen` (unix seconds)
- `POST /chat/pin` and `POST /user/presence/subscribe` documented in the vendored `openapi-spec.yml`, which upstream still omits

### Changed

- **BREAKING — `SetWebhookRequest.webhook` renamed to `webhookurl`.** Upstream changed the request key of `POST /webhook` from `webhook` to `webhookurl`; the old key no longer reaches the server. `updateWebhook` (PUT) keeps `webhook`
- **BREAKING — `UpdateWebhookRequest.Active` renamed to `active`** to match the wire field verbatim
- **BREAKING — `session.disconnect(clear?, options?)`.** Pass `true` to also clear stored event subscriptions (upstream keeps them by default since #305); per-request options moved to the second argument
- **BREAKING — `ChatButton` replaced by `SendButton`**, a union discriminated on `type`: `"reply"` | `"cta_url"` | `"cta_call"` | `"copy"`, matching the shapes the server actually parses
- Send requests accept every field the server decodes but we didn't type before: `LinkPreview`, `QuotedText`/`QuotedMessage` on text; `Id`/`Caption`/`ptt`/`mimetype`/`Seconds`/`Waveform` on audio; `Id` on image/video/location/contact/sticker; `MimeType` where supported; sticker pack metadata (`PackId`, `PackName`, `PackPublisher`, `Emojis`); `Participant` on reactions; `ContextInfo` on edits; phone-number fields on markRead (`ChatPhone`/`SenderPhone`, preferred by current servers over JIDs)
- Admin create/update user accepts `expiration` and `hmacKey`, and `proxyConfig.webhookUseProxy` routes that user's webhook deliveries through their proxy (upstream #339). Status-style `proxy_config` objects expose `webhook_use_proxy` in responses
- `session.setProxy(url, enable, webhookUseProxy?, options?)` forwards the new per-user `webhook_use_proxy` flag
- Re-vendored `openapi-spec.yml` from upstream `static/api/spec.yml`

### Fixed

- Examples passed per-request options to `session.disconnect(options)`; under the new signature that object would have been read as `clear=true` and wiped event subscriptions

## [1.10.1] - 2026-08-18

> **Upgrading:** this release changes which auth header each endpoint sends. If
> you passed an admin token as `config.token`, move it to `config.adminToken` —
> otherwise `client.admin.*` will throw `WuzapiError(401)`. Everything else
> keeps working, and a client built with only a user token now authenticates
> user endpoints correctly for the first time.

### Changed

- **BREAKING — auth headers are now chosen by the endpoint, not by the token value.** WuzAPI reads the user token from the `token` header and the admin token from `Authorization`, and never falls back between them. `BaseClient` previously sent `config.token` as `Authorization` on *every* endpoint and only added `Token` when a per-request token differed from it, so a client constructed with a user token authenticated no user endpoint. Each module now declares its own scheme (`AdminModule` is `"admin"`, all others `"user"`) and exactly one header is sent
- **BREAKING — `WuzapiConfig` gained `adminToken`.** `token` is now unambiguously the *user* token (header `token`); `adminToken` is the admin credential (header `Authorization`). Callers who put an admin token in `config.token` must move it to `adminToken` — `client.admin.*` no longer falls back to `config.token` and throws `WuzapiError(401)` naming the missing field
- `RequestOptions.token` still overrides the credential for a single call, but no longer influences which header carries it
- **BREAKING — `SystemModule.getHealth()` no longer takes `RequestOptions`.** `/health` is mounted outside both auth middlewares; it was sending `Token` *and* `Authorization` for nothing

### Fixed

- Server error messages are no longer discarded. `WuzapiError.message` now reports the envelope's `error` field (or a bare string `data` payload) instead of axios's generic "Request failed with status code N"
- Restored the non-2xx body-status check in `BaseClient`. Its condition (`code <= 200 && code >= 300`) could never be true, so a failure returned over HTTP 200 with a non-2xx envelope `code` was unwrapped as if it had succeeded
- `modules/status`, `modules/call` and `modules/system` are now emitted as deep-import entry points — the hand-maintained Vite entry list had omitted them, so they shipped only bundled inside `index.js`

### Added

- `bun run test` now runs `check_response_handling.ts`, a dependency-free check covering response unwrapping and both error paths; it also runs on `prepublishOnly`

### Removed

- `spec.yml`, a stale duplicate of `openapi-spec.yml` (which is a strict superset of it)

## [1.10.0] - 2026-06-07

### Added

- **System Module** (`client.system`)
  - `getHealth()` - Retrieve API health and service statistics
- **User Module** (`client.user`)
  - `blockUser(request)` - Block a WhatsApp user
  - `unblockUser(request)` - Unblock a WhatsApp user
  - `getBlocklist()` - Get the current blocklist
  - `getPrivacy()` and `setPrivacy()` methods to User module for managing WhatsApp privacy settings
- **Group Module** (`client.group`)
  - `getRequestParticipants(groupJID)` - List pending join requests
  - `updateRequestParticipants(groupJID, action, phones)` - Approve or reject pending join requests
  - `setJoinApprovalMode(groupJID, mode)` - Enable or disable group join approval mode

## [1.9.3] - 2026-06-05

### Fixed

- `deleteMessage` now sends the required `Phone` field to the server — the previous implementation only sent `Id` which caused a 400 "missing Phone in Payload" error

### Changed

- **Breaking:** `deleteMessage(messageId)` signature changed to `deleteMessage(messageId, phone)` to match server requirements (the old single-arg form was non-functional, so nothing real depends on it)

## [1.9.2] - 2026-05-31

### Fixed

- Restricted chat presence `Media` to `"audio"` and corrected the README examples for typing and recording indicators

### Changed

- Standardized development and release workflows on Bun

## [1.9.1] - 2026-05-27

### Added

- **QR Timeout Event** (`WebhookEventType.QR_TIMEOUT` / `"QRTimeout"`)
  - New webhook event type fired when the QR code scan window expires without being scanned
  - Includes `QRTimeoutWebhookEvent` interface and `QRTimeoutWebhookPayload` type
  - Added to `WebhookEventMap` and `SpecificWebhookPayload` union for type-safe handling

## [1.9.0] - 2026-02-01

### Added

#### New Modules
- **Status Module** (`client.status`)
  - `setStatusText(body)` - Set WhatsApp status text message

- **Call Module** (`client.call`)
  - `rejectCall(callFrom, callId)` - Reject an incoming call

#### Admin Module
- `getUser(id)` - Get a specific user by ID
- `updateUser(id, data)` - Update/edit user settings

#### Session Module
- `configureHmac(hmacKey)` - Configure HMAC key for webhook signing
- `getHmacConfig()` - Get HMAC configuration status
- `deleteHmacConfig()` - Delete HMAC configuration

#### Chat Module
- `requestUnavailableMessage(chat, sender, messageId)` - Request a copy of a message that couldn't be decrypted
- `archiveChat(jid, archive)` - Archive or unarchive a chat
- `downloadSticker(request)` - Download sticker media from a message

#### User Module
- `getLid(phone)` - Get LID (Linked ID) from phone number or JID

### Changed
- Updated README with documentation for all new methods
- Added new type definitions for all new endpoints

## [1.8.5] - Previous Release

### Features
- Chat History endpoint
- Phone Pairing (alternative to QR code login)
- Interactive Messages (buttons, lists, polls)
- Message Management (edit and delete)
- Advanced Group Management
- Newsletter Support
- Enhanced Webhooks (update and delete)
- Proxy Support
- History Sync

## [1.7.0] - Earlier Release

### Features
- Full TypeScript support
- Modular architecture
- Promise-based async/await
- Comprehensive error handling
- Tree shakable imports
- S3 storage configuration
- Webhook event types and utilities

---

For more details, see the [README](README.md).
