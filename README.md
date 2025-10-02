# WuzAPI Client

A comprehensive TypeScript client library for the [WuzAPI WhatsApp API](https://github.com/asternic/wuzapi). This library provides a simple and intuitive interface to interact with WhatsApp through the WuzAPI service.

## 🚀 Features

- 🔥 **Full TypeScript Support** - Complete type definitions for all API endpoints
- 🏗️ **Modular Architecture** - Organized by functionality (admin, session, chat, user, group, webhook)
- 🚀 **Promise-based** - Modern async/await support
- 🛡️ **Error Handling** - Comprehensive error handling with detailed error types
- 📦 **Tree Shakable** - Import only what you need
- 🔧 **Easy Configuration** - Simple setup with minimal configuration
- 📖 **Well Documented** - Extensive documentation and examples

## 📦 Installation

```bash
npm install wuzapi
```

or

```bash
yarn add wuzapi
```

## ⚡ Quick Start

### Basic Setup

```typescript
import WuzapiClient from "wuzapi";

const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
  token: "your-user-token",
});

// Connect to WhatsApp
await client.session.connect({
  Subscribe: ["Message", "ReadReceipt"],
  Immediate: false,
});

// Send a message
await client.chat.sendText({
  Phone: "5491155554444",
  Body: "Hello from WuzAPI! 🎉",
});
```

### Login Options

#### Option 1: QR Code (Traditional)

```typescript
// Get QR code for scanning
const qr = await client.session.getQRCode();
console.log("Scan this QR code:", qr.QRCode);
```

#### Option 2: Phone Pairing (New!)

```typescript
// Pair using phone number (generates verification code)
await client.session.pairPhone("5491155554444");
```

## 🔧 Configuration

```typescript
interface WuzapiConfig {
  apiUrl: string; // Your WuzAPI server URL
  token?: string; // Authentication token (can be provided per request)
}

// Global token approach
const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
  token: "your-token",
});

// Flexible token approach
const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
});

// Use different tokens for different operations
await client.chat.sendText(
  { Phone: "123", Body: "Hello" },
  { token: "user-specific-token" }
);
```

## 💬 Essential Chat Operations

```typescript
// Send text message
await client.chat.sendText({
  Phone: "5491155554444",
  Body: "Hello World!",
});

// Send image
await client.chat.sendImage({
  Phone: "5491155554444",
  Image: "data:image/jpeg;base64,/9j/4AAQ...",
  Caption: "Check this out!",
});

// Send interactive buttons
await client.chat.sendButtons({
  Phone: "5491155554444",
  Body: "Choose an option:",
  Buttons: [
    { ButtonId: "yes", ButtonText: { DisplayText: "Yes" }, Type: 1 },
    { ButtonId: "no", ButtonText: { DisplayText: "No" }, Type: 1 },
  ],
});

// Send list menu
await client.chat.sendList(
  "5491155554444", // Phone
  "View Menu", // Button text
  "Select from menu:", // Description
  "Options", // Top text/title
  [
    {
      // Sections
      Title: "Main Options",
      Rows: [
        { Title: "Option 1", Desc: "First choice", RowId: "opt1" },
        { Title: "Option 2", Desc: "Second choice", RowId: "opt2" },
      ],
    },
  ]
);

// Send poll (for groups only)
await client.chat.sendPoll(
  "120362023605733675@g.us", // Group JID
  "What's your favorite color?", // Header
  ["Red", "Blue", "Green"] // Options array
);
```

## 👥 Group Management

```typescript
// Create group
const group = await client.group.create("My Group", [
  "5491155553934",
  "5491155553935",
]);

// Get group info
const info = await client.group.getInfo(group.JID);

// Add participants
await client.group.updateParticipants(group.JID, "add", ["5491155553936"]);

// Set group settings
await client.group.setName(group.JID, "New Group Name");
await client.group.setTopic(group.JID, "Welcome message");
await client.group.setAnnounce(group.JID, true); // Only admins can send
```

## 👤 User Operations

```typescript
// Check if numbers are WhatsApp users
const check = await client.user.check(["5491155554444"]);

// Get user info
const info = await client.user.getInfo(["5491155554444"]);

// Get contacts
const contacts = await client.user.getContacts();

// Send presence status
await client.user.sendPresence("available");
```

## 🔗 Webhook Setup

```typescript
// Set webhook URL with events
await client.webhook.setWebhook("https://your-server.com/webhook", [
  "Message",
  "ReadReceipt",
]);

// Get webhook config
const config = await client.webhook.getWebhook();

// Update webhook with new URL, events, and status
await client.webhook.updateWebhook(
  "https://new-server.com/webhook",
  ["Message", "ReadReceipt"],
  true
);
```

## 📚 Examples

Check out the complete examples in the `examples/` directory:

- **[basic-usage.js](examples/basic-usage.js)** - Getting started, connection, basic operations
- **[advanced-features.js](examples/advanced-features.js)** - Phone pairing, interactive messages, advanced group management
- **[chatbot-example.js](examples/chatbot-example.js)** - Complete bot with commands and auto-replies
- **[webhook-events-example.js](examples/webhook-events-example.js)** - Comprehensive webhook event handling
- **[webhook-types-example.js](examples/webhook-types-example.js)** - ⭐ **NEW!** Complete webhook types with message discovery utilities

### Run Examples

```bash
# Basic usage
node examples/basic-usage.js

# Advanced features
node examples/advanced-features.js

# Start chatbot
node examples/chatbot-example.js

# Webhook types example (with complete type safety)
node examples/webhook-types-example.js
```

## 🤖 Simple Bot Example

```typescript
import WuzapiClient from "wuzapi";

const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
  token: "your-token",
});

// Connect and wait for messages
await client.session.connect({ Subscribe: ["Message"] });
await client.webhook.setWebhook("https://your-server.com/webhook", ["Message"]);

// In your webhook handler:
app.post("/webhook", async (req, res) => {
  const webhookPayload = req.body;

  // Validate payload structure
  if (webhookPayload.token !== "your-expected-token") {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Handle by event type
  switch (webhookPayload.type) {
    case "Message":
      const { event } = webhookPayload;
      if (event.Message?.conversation) {
        const message = event.Message.conversation;
        const from = event.Info.RemoteJid.replace("@s.whatsapp.net", "");

        if (message.toLowerCase().includes("hello")) {
          await client.chat.sendText({
            Phone: from,
            Body: "Hello! 👋 How can I help you?",
          });
        }
      }
      break;

    case "Connected":
      console.log("✅ WhatsApp connected");
      break;

    case "QR":
      console.log("📱 QR Code:", webhookPayload.event.Codes);
      break;
  }

  res.json({ success: true });
});
```

---

## 📖 Complete API Reference

<details>
<summary><strong>📱 Session Module</strong> - Connection and authentication</summary>

### Connection

```typescript
// Connect to WhatsApp
await client.session.connect({
  Subscribe: ["Message", "ReadReceipt", "HistorySync"],
  Immediate: false,
});

// Get connection status
const status = await client.session.getStatus();

// Disconnect (keeps session)
await client.session.disconnect();

// Logout (destroys session)
await client.session.logout();
```

### Authentication

```typescript
// Get QR code for scanning
const qr = await client.session.getQRCode();

// Pair phone using phone number (generates verification code)
await client.session.pairPhone("5491155554444");

// Request message history sync
await client.session.requestHistory();

// Configure proxy
await client.session.setProxy("socks5://user:pass@proxy:port", true);

// Set historyfor user
await client.session.setHistoryCount(100); // use 0 for disabled
```

### S3 Storage

```typescript
// Configure S3 storage
await client.session.configureS3({
  enabled: true,
  endpoint: "https://s3.amazonaws.com",
  region: "us-east-1",
  bucket: "my-bucket",
  accessKey: "AKIAIOSFODNN7EXAMPLE",
  secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  pathStyle: false,
  mediaDelivery: "both",
  retentionDays: 30,
});

// Get S3 configuration
const s3Config = await client.session.getS3Config();

// Test S3 connection
await client.session.testS3();

// Delete S3 configuration
await client.session.deleteS3Config();
```

</details>

<details>
<summary><strong>💬 Chat Module</strong> - Send and manage messages</summary>

### Basic Messages

```typescript
// Send text message
await client.chat.sendText({
  Phone: "5491155554444",
  Body: "Hello World!",
  Id: "optional-message-id",
});

// Reply to a message
await client.chat.sendText({
  Phone: "5491155554444",
  Body: "This is a reply",
  ContextInfo: {
    StanzaId: "original-message-id",
    Participant: "5491155553935@s.whatsapp.net",
  },
});
```

### Media Messages

```typescript
// Send image
await client.chat.sendImage({
  Phone: "5491155554444",
  Image: "data:image/jpeg;base64,/9j/4AAQ...",
  Caption: "Check this out!",
});

// Send audio
await client.chat.sendAudio({
  Phone: "5491155554444",
  Audio: "data:audio/ogg;base64,T2dnUw...",
});

// Send video
await client.chat.sendVideo({
  Phone: "5491155554444",
  Video: "data:video/mp4;base64,AAAAIGZ0eXA...",
  Caption: "Video caption",
});

// Send document
await client.chat.sendDocument({
  Phone: "5491155554444",
  Document: "data:application/pdf;base64,JVBERi0x...",
  FileName: "document.pdf",
});

// Send sticker
await client.chat.sendSticker({
  Phone: "5491155554444",
  Sticker: "data:image/webp;base64,UklGRuI...",
});
```

### Interactive Messages

```typescript
// Send buttons
await client.chat.sendButtons({
  Phone: "5491155554444",
  Body: "Choose an option:",
  Footer: "Select one:",
  Buttons: [
    { ButtonId: "option1", ButtonText: { DisplayText: "Option 1" }, Type: 1 },
    { ButtonId: "option2", ButtonText: { DisplayText: "Option 2" }, Type: 1 },
  ],
});

// Send list message
await client.chat.sendList(
  "5491155554444", // Phone
  "View Menu", // Button text
  "Please select from the menu:", // Description
  "Menu Options", // Top text/title
  [
    {
      // Sections
      Title: "Main Course",
      Rows: [
        { Title: "Pizza", Desc: "Delicious pizza", RowId: "pizza" },
        { Title: "Burger", Desc: "Tasty burger", RowId: "burger" },
      ],
    },
  ]
);

// Send poll (for groups only)
await client.chat.sendPoll(
  "120362023605733675@g.us", // Group JID
  "What's your favorite color?", // Header
  ["Red", "Blue", "Green"] // Options array
);
```

### Message Management

```typescript
// Delete a message
await client.chat.deleteMessage("message-id-to-delete");

// Edit a message
await client.chat.editMessage(
  "message-id-to-edit",
  "5491155554444",
  "This is the updated message text"
);

// React to message
await client.chat.react({
  Phone: "5491155554444",
  Body: "❤️",
  id: "message-id-to-react-to",
});

// Mark messages as read
await client.chat.markRead({
  id: ["message-id-1", "message-id-2"],
  Chat: "5491155553934@s.whatsapp.net",
});

// Send chat presence (typing indicator)
await client.chat.sendPresence({
  Phone: "5491155554444",
  State: "composing", // or "paused"
  Media: "text",
});
```

### Chat History

```typescript
// Get chat message history (requires message history to be enabled on server)
const history = await client.chat.getChatHistory(
  "5491155553333@s.whatsapp.net", // Chat JID
  100 // Optional: limit (default 50, max 1000)
);

// History contains array of messages in reverse chronological order (newest first)
history.data.forEach((message) => {
  console.log(`Message ${message.id}:`);
  console.log(`From: ${message.sender_jid}`);
  console.log(`Time: ${message.timestamp}`);
  console.log(`Type: ${message.message_type}`);
  console.log(`Content: ${message.text_content}`);
  if (message.media_link) {
    console.log(`Media: ${message.media_link}`);
  }
});
```

### Location and Contacts

```typescript
// Send location
await client.chat.sendLocation({
  Phone: "5491155554444",
  Latitude: 48.85837,
  Longitude: 2.294481,
  Name: "Eiffel Tower, Paris",
});

// Send contact
await client.chat.sendContact({
  Phone: "5491155554444",
  Name: "John Doe",
  Vcard:
    "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nTEL:+1234567890\nEND:VCARD",
});
```

### Media Download

```typescript
// Download media
const media = await client.chat.downloadImage({
  Url: "https://mmg.whatsapp.net/d/f/...",
  MediaKey: "media-key...",
  Mimetype: "image/jpeg",
  FileSHA256: "file-hash...",
  FileLength: 2039,
});
```

</details>

<details>
<summary><strong>👤 User Module</strong> - User information and contacts</summary>

```typescript
// Check if numbers are WhatsApp users
const check = await client.user.check(["5491155554444", "5491155554445"]);

// Get user information
const info = await client.user.getInfo(["5491155554444"]);

// Get user avatar
const avatar = await client.user.getAvatar("5491155554444", true); // true for preview

// Get all contacts
const contacts = await client.user.getContacts();

// Send user presence (online/offline status)
await client.user.sendPresence("available"); // or "unavailable"
```

</details>

<details>
<summary><strong>👥 Group Module</strong> - Group management</summary>

### Basic Group Operations

```typescript
// List all groups
const groups = await client.group.list();

// Create a group
const newGroup = await client.group.create("My New Group", [
  "5491155553934",
  "5491155553935",
]);

// Get group info
const groupInfo = await client.group.getInfo("120362023605733675@g.us");

// Leave a group
await client.group.leave("120362023605733675@g.us");
```

### Group Settings

```typescript
// Set group name
await client.group.setName("120362023605733675@g.us", "New Group Name");

// Set group topic/description
await client.group.setTopic(
  "120362023605733675@g.us",
  "Welcome to our group! Please read the rules."
);

// Set group announcement setting (only admins can send messages)
await client.group.setAnnounce("120362023605733675@g.us", true);

// Set group locked (only admins can modify info)
await client.group.setLocked("120362023605733675@g.us", true);

// Set disappearing messages
await client.group.setEphemeral("120362023605733675@g.us", "24h"); // '24h', '7d', '90d', or 'off'
```

### Group Media

```typescript
// Set group photo (JPEG only)
await client.group.setPhoto(
  "120362023605733675@g.us",
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
);

// Remove group photo
await client.group.removePhoto("120362023605733675@g.us");
```

### Invites and Participants

```typescript
// Get invite link
const invite = await client.group.getInviteLink("120362023605733675@g.us");

// Join a group using invite link
const joinResult = await client.group.join(
  "https://chat.whatsapp.com/XXXXXXXXX"
);

// Get group invite information
const inviteInfo = await client.group.getInviteInfo(
  "https://chat.whatsapp.com/XXXXXXXXX"
);

// Update group participants (add, remove, promote, demote)
await client.group.updateParticipants(
  "120362023605733675@g.us",
  "add", // "add", "remove", "promote", "demote"
  ["5491155553936", "5491155553937"]
);
```

</details>

<details>
<summary><strong>👨‍💼 Admin Module</strong> - User management (requires admin token)</summary>

```typescript
// List all users
const users = await client.admin.listUsers({ token: "admin-token" });

// Add new user
const newUser = await client.admin.addUser(
  {
    name: "John Doe",
    token: "user-token-123",
    webhook: "https://example.com/webhook",
    events: "Message,ReadReceipt", // optional
    proxyConfig: {
      enabled: true,
      proxyURL: "socks5://user:pass@proxy:port",
    },
    s3Config: {
      enabled: true,
      endpoint: "https://s3.amazonaws.com",
      region: "us-east-1",
      bucket: "user-media-bucket",
      accessKey: "AKIA...",
      secretKey: "secret...",
      pathStyle: false,
      mediaDelivery: "both",
      retentionDays: 30,
    },
    history: 20, // Number of messages to save in the database, defaults to 0, which is disabled
  },
  { token: "admin-token" }
);

// Delete user by ID (ID is a string)
await client.admin.deleteUser("user-id-string", { token: "admin-token" });

// Delete user completely (full deletion including all data)
await client.admin.deleteUserComplete("user-id-string", {
  token: "admin-token",
});
```

</details>

<details>
<summary><strong>🔗 Webhook Module</strong> - Webhook configuration</summary>

```typescript
// Set webhook URL with specific events
await client.webhook.setWebhook("https://my-server.com/webhook", [
  "Message",
  "Receipt",
  "Connected",
  "Disconnected",
]);

// Get current webhook configuration
const webhookConfig = await client.webhook.getWebhook();
console.log("Webhook URL:", webhookConfig.webhook);
console.log("Subscribed events:", webhookConfig.subscribe);

// Update webhook URL, events, and status
await client.webhook.updateWebhook(
  "https://my-new-server.com/webhook",
  ["Message", "Receipt", "Presence"],
  true
);

// Delete webhook configuration
await client.webhook.deleteWebhook();

// Get all available events
const availableEvents = client.webhook.constructor.getAvailableEvents();
console.log("Available events:", availableEvents);

// Use the enum for type safety (TypeScript)
import { WebhookEventType } from "wuzapi";
await client.webhook.setWebhook("https://my-server.com/webhook", [
  WebhookEventType.MESSAGE,
  WebhookEventType.RECEIPT,
  WebhookEventType.CONNECTED,
]);
```

### 📋 Complete Webhook Events List

WuzAPI supports **45 different webhook events**. Here's the complete list:

#### 🔧 **Connection & Session Events**

```typescript
WebhookEventType.CONNECTED; // "Connected"
WebhookEventType.DISCONNECTED; // "Disconnected"
WebhookEventType.CONNECT_FAILURE; // "ConnectFailure"
WebhookEventType.LOGGED_OUT; // "LoggedOut"
WebhookEventType.KEEP_ALIVE_RESTORED; // "KeepAliveRestored"
WebhookEventType.KEEP_ALIVE_TIMEOUT; // "KeepAliveTimeout"
WebhookEventType.CLIENT_OUTDATED; // "ClientOutdated"
WebhookEventType.TEMPORARY_BAN; // "TemporaryBan"
WebhookEventType.STREAM_ERROR; // "StreamError"
WebhookEventType.STREAM_REPLACED; // "StreamReplaced"
```

#### 🔐 **Authentication Events**

```typescript
WebhookEventType.QR; // "QR"
WebhookEventType.QR_SCANNED_WITHOUT_MULTIDEVICE; // "QRScannedWithoutMultidevice"
WebhookEventType.PAIR_SUCCESS; // "PairSuccess"
WebhookEventType.PAIR_ERROR; // "PairError"
```

#### 💬 **Message Events**

```typescript
WebhookEventType.MESSAGE; // "Message"
WebhookEventType.UNDECRYPTABLE_MESSAGE; // "UndecryptableMessage"
WebhookEventType.RECEIPT; // "Receipt"
WebhookEventType.MEDIA_RETRY; // "MediaRetry"
```

#### 👥 **Group Events**

```typescript
WebhookEventType.GROUP_INFO; // "GroupInfo"
WebhookEventType.JOINED_GROUP; // "JoinedGroup"
```

#### 👤 **User & Contact Events**

```typescript
WebhookEventType.PICTURE; // "Picture"
WebhookEventType.USER_ABOUT; // "UserAbout"
WebhookEventType.PUSH_NAME_SETTING; // "PushNameSetting"
WebhookEventType.PRIVACY_SETTINGS; // "PrivacySettings"
WebhookEventType.PRESENCE; // "Presence"
WebhookEventType.CHAT_PRESENCE; // "ChatPresence"
WebhookEventType.IDENTITY_CHANGE; // "IdentityChange"
```

#### 🚫 **Blocklist Events**

```typescript
WebhookEventType.BLOCKLIST; // "Blocklist"
WebhookEventType.BLOCKLIST_CHANGE; // "BlocklistChange"
```

#### 📱 **App State & Sync Events**

```typescript
WebhookEventType.APP_STATE; // "AppState"
WebhookEventType.APP_STATE_SYNC_COMPLETE; // "AppStateSyncComplete"
WebhookEventType.HISTORY_SYNC; // "HistorySync"
WebhookEventType.OFFLINE_SYNC_COMPLETED; // "OfflineSyncCompleted"
WebhookEventType.OFFLINE_SYNC_PREVIEW; // "OfflineSyncPreview"
```

#### 📞 **Call Events**

```typescript
WebhookEventType.CALL_OFFER; // "CallOffer"
WebhookEventType.CALL_ACCEPT; // "CallAccept"
WebhookEventType.CALL_TERMINATE; // "CallTerminate"
WebhookEventType.CALL_OFFER_NOTICE; // "CallOfferNotice"
WebhookEventType.CALL_RELAY_LATENCY; // "CallRelayLatency"
```

#### 📰 **Newsletter Events**

```typescript
WebhookEventType.NEWSLETTER_JOIN; // "NewsletterJoin"
WebhookEventType.NEWSLETTER_LEAVE; // "NewsletterLeave"
WebhookEventType.NEWSLETTER_MUTE_CHANGE; // "NewsletterMuteChange"
WebhookEventType.NEWSLETTER_LIVE_UPDATE; // "NewsletterLiveUpdate"
```

#### 🔧 **System Events**

```typescript
WebhookEventType.CAT_REFRESH_ERROR; // "CATRefreshError"
WebhookEventType.FB_MESSAGE; // "FBMessage"
```

### 📦 **Webhook Payload Structure**

All webhook payloads follow this structure:

```typescript
{
  "event": { /* Event-specific data */ },
  "type": "Message",  // Event type from the list above
  "token": "YOUR_TOKEN",  // Your authentication token

  // Optional media fields (when media is involved)
  "s3": {
    "url": "https://bucket.s3.amazonaws.com/media/file.jpg",
    "key": "media/file.jpg",
    "bucket": "your-bucket",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "fileName": "file.jpg"
  },
  "base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "mimeType": "image/jpeg",
  "fileName": "image.jpg"
}
```

### 🎯 **Event Subscription Examples**

```typescript
// Subscribe to all message-related events
await client.webhook.setWebhook("https://your-server.com/webhook", [
  "Message",
  "UndecryptableMessage",
  "Receipt",
  "MediaRetry",
]);

// Subscribe to connection events only
await client.webhook.setWebhook("https://your-server.com/webhook", [
  "Connected",
  "Disconnected",
  "LoggedOut",
  "QR",
]);

// Subscribe to group events
await client.webhook.setWebhook("https://your-server.com/webhook", [
  "GroupInfo",
  "JoinedGroup",
]);

// Subscribe to all events
await client.webhook.setWebhook("https://your-server.com/webhook", ["All"]);

// TypeScript: Use enum for type safety
import { WebhookEventType } from "wuzapi";
await client.webhook.setWebhook("https://your-server.com/webhook", [
  WebhookEventType.MESSAGE,
  WebhookEventType.RECEIPT,
  WebhookEventType.CONNECTED,
  WebhookEventType.QR,
]);
```

</details>

<details>
<summary><strong>📰 Newsletter Module</strong> - Newsletter management (Business accounts only)</summary>

```typescript
// List all subscribed newsletters
const newsletters = await client.newsletter.list();

newsletters.Newsletters.forEach((newsletter) => {
  console.log(`Newsletter: ${newsletter.Name}`);
  console.log(`Description: ${newsletter.Description}`);
  console.log(`Handle: ${newsletter.Handle}`);
  console.log(`State: ${newsletter.State}`);
});
```

</details>

---

## 🎣 Webhook Event Handling

WuzAPI sends real-time events to your webhook endpoint. Here's how to handle them:

### 🆕 Type-Safe Message Discovery

The library now includes comprehensive TypeScript types and utilities for handling webhook messages:

```typescript
import WuzapiClient, {
  discoverMessageType,
  MessageType,
  hasS3Media,
  hasBase64Media,
} from "wuzapi";

// Discover message type automatically
const messageType = discoverMessageType(webhookPayload.event.Message);

switch (messageType) {
  case MessageType.TEXT:
    console.log("Text:", webhookPayload.event.Message.conversation);
    break;

  case MessageType.EXTENDED_TEXT:
    console.log("Text:", webhookPayload.event.Message.extendedTextMessage.text);
    break;

  case MessageType.IMAGE:
    const imageMsg = webhookPayload.event.Message.imageMessage;
    console.log("Image:", imageMsg.mimetype, imageMsg.fileLength);
    break;

  case MessageType.VIDEO:
    const videoMsg = webhookPayload.event.Message.videoMessage;
    console.log("Video:", `${videoMsg.seconds}s`, videoMsg.caption);
    break;

  case MessageType.AUDIO:
    const audioMsg = webhookPayload.event.Message.audioMessage;
    console.log(audioMsg.ptt ? "Voice message" : "Audio file");
    break;

  case MessageType.DOCUMENT:
    const docMsg = webhookPayload.event.Message.documentMessage;
    console.log("Document:", docMsg.fileName, `${docMsg.pageCount} pages`);
    break;

  case MessageType.CONTACT:
    const contactMsg = webhookPayload.event.Message.contactMessage;
    console.log("Contact:", contactMsg.displayName);
    break;

  case MessageType.LOCATION:
    const locationMsg = webhookPayload.event.Message.locationMessage;
    console.log(
      "Location:",
      locationMsg.degreesLatitude,
      locationMsg.degreesLongitude
    );
    break;

  case MessageType.STICKER:
    const stickerMsg = webhookPayload.event.Message.stickerMessage;
    console.log(
      "Sticker:",
      stickerMsg.isAnimated ? "Animated" : "Static",
      stickerMsg.mimetype
    );
    break;

  case MessageType.REACTION:
    const reactionMsg = webhookPayload.event.Message.reactionMessage;
    console.log(
      "Reaction:",
      reactionMsg.text,
      "to message",
      reactionMsg.key.ID
    );
    break;

  case MessageType.POLL_CREATION:
    const pollMsg = webhookPayload.event.Message.pollCreationMessageV3;
    console.log("Poll:", pollMsg.name, `${pollMsg.options.length} options`);
    break;

  case MessageType.BUTTONS_RESPONSE:
    const buttonResponse = webhookPayload.event.Message.buttonsResponseMessage;
    console.log("Button clicked:", buttonResponse.selectedButtonId);
    break;

  case MessageType.LIST_RESPONSE:
    const listResponse = webhookPayload.event.Message.listResponseMessage;
    console.log(
      "List item selected:",
      listResponse.singleSelectReply.selectedRowId
    );
    break;

  case MessageType.GROUP_INVITE:
    const groupInvite = webhookPayload.event.Message.groupInviteMessage;
    console.log("Group invite:", groupInvite.groupName);
    break;

  case MessageType.VIEW_ONCE:
    const viewOnceMsg = webhookPayload.event.Message.viewOnceMessage;
    console.log("View once message received");
    break;

  // Handle other new message types
  case MessageType.BUTTONS:
  case MessageType.LIST:
  case MessageType.TEMPLATE:
  case MessageType.POLL:
  case MessageType.POLL_UPDATE:
    console.log(`Interactive message type: ${messageType}`);
    break;
}

// Handle media intelligently
if (hasS3Media(webhookPayload)) {
  console.log("S3 URL:", webhookPayload.s3.url);
} else if (hasBase64Media(webhookPayload)) {
  console.log("Base64 media available");
}
```

### 🎯 Available Message Types

```typescript
enum MessageType {
  // Basic messages
  TEXT = "conversation", // Simple text messages
  EXTENDED_TEXT = "extendedTextMessage", // Rich text messages

  // Media messages
  IMAGE = "imageMessage", // Photos, screenshots
  VIDEO = "videoMessage", // Video files, GIFs
  AUDIO = "audioMessage", // Audio files, voice messages
  DOCUMENT = "documentMessage", // PDFs, Word docs, etc.
  STICKER = "stickerMessage", // Stickers (animated/static)

  // Contact & location
  CONTACT = "contactMessage", // Shared contacts
  LOCATION = "locationMessage", // Location pins

  // Interactive messages
  BUTTONS = "buttonsMessage", // Interactive buttons
  LIST = "listMessage", // List menus
  TEMPLATE = "templateMessage", // Template messages

  // Response messages
  BUTTONS_RESPONSE = "buttonsResponseMessage", // Button click responses
  LIST_RESPONSE = "listResponseMessage", // List selection responses

  // Group messages
  GROUP_INVITE = "groupInviteMessage", // Group invitations

  // Poll messages
  POLL = "pollCreationMessage", // Polls (standard)
  POLL_CREATION = "pollCreationMessageV3", // Polls (v3)
  POLL_UPDATE = "pollUpdateMessage", // Poll vote updates

  // Special messages
  VIEW_ONCE = "viewOnceMessage", // View once messages
  REACTION = "reactionMessage", // Message reactions (emoji)
  EDITED = "editedMessage", // Edited messages

  // System messages
  PROTOCOL = "protocolMessage", // System messages
  DEVICE_SENT = "deviceSentMessage", // Multi-device messages

  UNKNOWN = "unknown", // Unrecognized types
}
```

### Basic Webhook Setup

```typescript
import express from "express";
import WuzapiClient, { getMessageContent, hasS3Media } from "wuzapi";

const app = express();
app.use(express.json());

const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
  token: "your-token",
});

app.post("/webhook", async (req, res) => {
  try {
    const webhookPayload = req.body;

    // Validate payload structure with token and type
    if (
      !webhookPayload.token ||
      !webhookPayload.type ||
      !webhookPayload.event
    ) {
      return res
        .status(400)
        .json({ error: "Invalid webhook payload structure" });
    }

    // Verify token (optional security check)
    if (webhookPayload.token !== "your-expected-token") {
      return res.status(401).json({ error: "Invalid webhook token" });
    }

    console.log(`Received webhook event: ${webhookPayload.type}`);

    // Handle S3 media if present
    if (hasS3Media(webhookPayload)) {
      console.log("S3 Media:", webhookPayload.s3.url);
    }

    const event = webhookPayload.event;

    // Handle different event types
    switch (webhookPayload.type) {
      case "Message":
        if (event.Message && event.Info) {
          const messageContent = getMessageContent(event.Message);
          const from = event.Info.RemoteJid.replace("@s.whatsapp.net", "");

          if (messageContent?.type === "text") {
            console.log(`Message from ${from}: ${messageContent.content}`);

            // Auto-reply
            if (messageContent.content.toLowerCase().includes("hello")) {
              await client.chat.sendText({
                Phone: from,
                Body: "Hello! 👋 How can I help you?",
              });
            }
          }
        }
        break;

      case "Receipt":
        console.log("Message receipt:", event.Type, event.MessageIDs);
        break;

      case "Connected":
        console.log("✅ WhatsApp connected successfully");
        break;

      case "Disconnected":
        console.log("❌ WhatsApp disconnected");
        break;

      case "QR":
        console.log("📱 QR Code received:", event.Codes);
        break;

      case "GroupInfo":
        console.log("👥 Group info updated:", event.GroupName);
        break;

      case "Presence":
        console.log(
          "👤 User presence:",
          event.From,
          event.Unavailable ? "offline" : "online"
        );
        break;

      // Handle all other webhook events
      default:
        console.log(`Unhandled event type: ${webhookPayload.type}`, event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});
```

### Message Types

The `getMessageContent()` utility function returns structured message data:

```typescript
const messageContent = getMessageContent(event.Message);

switch (messageContent?.type) {
  case "text":
    console.log("Text:", messageContent.content);
    break;
  case "image":
    console.log("Image:", messageContent.content.caption);
    break;
  case "buttonsResponse":
    console.log("Button clicked:", messageContent.content.selectedButtonId);
    break;
  case "listResponse":
    console.log(
      "List selection:",
      messageContent.content.singleSelectReply?.selectedRowId
    );
    break;
  // ... handle other types
}
```

---

## 🛠️ Advanced Topics

<details>
<summary><strong>⚠️ Error Handling</strong></summary>

```typescript
import { WuzapiError } from "wuzapi";

try {
  await client.chat.sendText({
    Phone: "invalid-number",
    Body: "This will fail",
  });
} catch (error) {
  if (error instanceof WuzapiError) {
    console.error("WuzAPI Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Common Error Codes

- **401**: Authentication required
- **404**: Endpoint not found
- **500**: Server error

</details>

<details>
<summary><strong>🔧 Custom Configuration</strong></summary>

```typescript
// Custom axios configuration
import { BaseClient } from "wuzapi";

class CustomClient extends BaseClient {
  constructor(config) {
    super(config);

    // Add custom interceptors
    this.axios.interceptors.request.use((config) => {
      console.log("Making request:", config.url);
      return config;
    });
  }
}
```

</details>

<details>
<summary><strong>📝 TypeScript Support</strong></summary>

```typescript
import {
  WuzapiClient,
  SendTextRequest,
  SendMessageResponse,
  GroupInfo,
  User,
} from "wuzapi";

// All API requests and responses are fully typed
const request: SendTextRequest = {
  Phone: "5491155554444",
  Body: "Typed message",
};

const response: SendMessageResponse = await client.chat.sendText(request);
```

</details>

<details>
<summary><strong>🔄 Legacy Aliases</strong></summary>

```typescript
// These are equivalent:
await client.user.check(["5491155554444"]);
await client.users.check(["5491155554444"]); // Alias

await client.chat.sendText({ Phone: "123", Body: "Hi" });
await client.message.sendText({ Phone: "123", Body: "Hi" }); // Alias
```

</details>

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/gusnips/wuzapi-node.git
cd wuzapi

# Install dependencies
npm install

# Run linter
npm run lint

# Build the project
npm run build
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- 📚 [WuzAPI Documentation](https://github.com/asternic/wuzapi)
- 🐛 [Issue Tracker](https://github.com/gusnips/wuzapi-node/issues)
- 💬 [Discussions](https://github.com/gusnips/wuzapi-node/discussions)

---

## 📊 Changelog

### Latest Updates

- ✅ **Chat History**: Added chat history new endpoint
- ✅ **Phone Pairing**: Alternative to QR code login
- ✅ **Interactive Messages**: Buttons, lists, and polls
- ✅ **Message Management**: Edit and delete messages
- ✅ **Advanced Groups**: Full participant management
- ✅ **Newsletter Support**: Business newsletter features
- ✅ **Enhanced Webhooks**: Update and delete webhook configs
- ✅ **Proxy Support**: Configure proxy for connections
- ✅ **History Sync**: Request message history after login

---

Made with ❤️ for the WhatsApp automation community.
