// Comprehensive webhook events handling example for WuzAPI
// This example shows how to handle different types of WhatsApp events via webhooks
//
// TOKEN USAGE OPTIONS:
//
// Option 1: Traditional global token (used in this example)
// const client = new WuzapiClient({
//   apiUrl: "http://localhost:8080",
//   token: "your-user-token-here",
// });
//
// Option 2: Flexible per-request tokens
// const client = new WuzapiClient({
//   apiUrl: "http://localhost:8080",
//   // No global token
// });
//
// Then for each API call, add the second parameter:
// await client.chat.sendText(messageData, { token: "user-specific-token" });
// await client.session.getStatus({ token: "user-specific-token" });
//
// This allows using different tokens for different operations in the same client instance.

import WuzapiClient, {
  getMessageContent,
  EventType,
  hasS3Media,
  hasBase64Media,
  hasBothMedia,
} from "wuzapi";
import express from "express";

const app = express();
app.use(express.json());

// Initialize the client (using traditional global token approach)
const client = new WuzapiClient({
  apiUrl: "http://localhost:8080",
  token: "your-user-token-here",
});

// Event handlers for different types of WhatsApp events
const eventHandlers = {
  // Message events
  handleMessage: async (event) => {
    const { Info, Message, IsEphemeral, IsViewOnce } = event;
    const from = Info.RemoteJid.replace("@s.whatsapp.net", "");
    const isGroup = Info.RemoteJid.includes("@g.us");

    console.log(`📨 New message from ${from}${isGroup ? " (group)" : ""}`);

    if (IsEphemeral) console.log("⏱️  Ephemeral message");
    if (IsViewOnce) console.log("👁️  View once message");

    // Use the utility function to get message content and type
    const messageContent = getMessageContent(Message);

    if (!messageContent) {
      console.log("❓ Unknown message type");
      return;
    }

    // Handle different message types based on the structured content
    switch (messageContent.type) {
      case "text":
        console.log(`💬 Text: ${messageContent.content}`);

        // Auto-reply example
        if (messageContent.content.toLowerCase().includes("hello")) {
          await client.chat.sendText({
            Phone: from,
            Body: "👋 Hello! Thanks for your message.",
          });
          // With flexible tokens, you would add: , { token: "user-specific-token" }
        }
        break;

      case "extendedText":
        console.log(`📝 Extended text: ${messageContent.content.text}`);
        if (messageContent.content.canonicalUrl) {
          console.log(`🔗 Link: ${messageContent.content.canonicalUrl}`);
        }
        break;

      case "image":
        console.log(
          `🖼️  Image: ${messageContent.content.caption || "No caption"}`
        );
        console.log(
          `📏 Dimensions: ${messageContent.content.width}x${messageContent.content.height}`
        );

        // Example: Download image if needed
        if (messageContent.content.url && messageContent.content.mediaKey) {
          try {
            const media = await client.chat.downloadImage({
              Url: messageContent.content.url,
              MediaKey: Array.from(messageContent.content.mediaKey),
              Mimetype: messageContent.content.mimetype,
              FileSHA256: Array.from(messageContent.content.fileSha256),
              FileLength: messageContent.content.fileLength,
            });
            console.log("✅ Image downloaded successfully");
          } catch (error) {
            console.log("❌ Failed to download image:", error.message);
          }
        }
        break;

      case "video":
        console.log(
          `🎥 Video: ${messageContent.content.caption || "No caption"}`
        );
        console.log(`⏱️  Duration: ${messageContent.content.seconds}s`);
        if (messageContent.content.gifPlayback) {
          console.log("🎬 GIF playback enabled");
        }
        break;

      case "audio":
        console.log(`🎵 Audio message: ${messageContent.content.seconds}s`);
        if (messageContent.content.ptt) {
          console.log("🎤 Voice note (Push-to-talk)");
        }
        break;

      case "document":
        console.log(
          `📄 Document: ${
            messageContent.content.fileName || messageContent.content.title
          }`
        );
        console.log(`📊 Size: ${messageContent.content.fileLength} bytes`);
        console.log(`📋 Type: ${messageContent.content.mimetype}`);
        if (messageContent.content.pageCount) {
          console.log(`📖 Pages: ${messageContent.content.pageCount}`);
        }
        break;

      case "sticker":
        console.log(`😀 Sticker`);
        if (messageContent.content.isAnimated) {
          console.log("🎬 Animated sticker");
        }
        if (messageContent.content.isLottie) {
          console.log("🎨 Lottie sticker");
        }
        break;

      case "location":
        const { degreesLatitude, degreesLongitude, name, address } =
          messageContent.content;
        console.log(`📍 Location: ${degreesLatitude}, ${degreesLongitude}`);
        if (name) console.log(`🏷️  Name: ${name}`);
        if (address) console.log(`🏠 Address: ${address}`);
        if (messageContent.content.isLiveLocation) {
          console.log("📡 Live location sharing");
        }
        break;

      case "contact":
        console.log(`👤 Contact: ${messageContent.content.displayName}`);
        break;

      case "contactsArray":
        console.log(
          `👥 Multiple contacts: ${
            messageContent.content.contacts?.length || 0
          } contacts`
        );
        break;

      case "buttons":
        console.log(
          `🔘 Interactive buttons: ${messageContent.content.contentText}`
        );
        console.log(
          `🔢 ${messageContent.content.buttons?.length || 0} buttons`
        );
        break;

      case "list":
        console.log(`📋 List message: ${messageContent.content.title}`);
        console.log(
          `📝 ${messageContent.content.sections?.length || 0} sections`
        );
        break;

      case "template":
        console.log(`📄 Template message`);
        if (messageContent.content.hydratedTemplate) {
          console.log(
            `📰 Title: ${messageContent.content.hydratedTemplate.title}`
          );
        }
        break;

      case "buttonsResponse":
        console.log(
          `✅ Button response: ${messageContent.content.selectedDisplayText}`
        );
        console.log(`🆔 Button ID: ${messageContent.content.selectedButtonId}`);
        break;

      case "listResponse":
        console.log(`✅ List response: ${messageContent.content.title}`);
        if (messageContent.content.singleSelectReply) {
          console.log(
            `🆔 Selected: ${messageContent.content.singleSelectReply.selectedRowId}`
          );
        }
        break;

      case "groupInvite":
        console.log(`👥 Group invite: ${messageContent.content.groupName}`);
        console.log(`🔗 Invite code: ${messageContent.content.inviteCode}`);
        break;

      case "poll":
        console.log(`📊 Poll: ${messageContent.content.name}`);
        console.log(
          `🔢 Options: ${messageContent.content.options?.length || 0}`
        );
        console.log(
          `✅ Max selections: ${
            messageContent.content.selectableOptionsCount || 1
          }`
        );
        break;

      case "pollUpdate":
        console.log(`🗳️  Poll vote update`);
        break;

      case "reaction":
        console.log(`😊 Reaction: ${messageContent.content.text}`);
        console.log(`📝 To message: ${messageContent.content.key?.id}`);
        break;

      case "protocol":
        console.log(`⚙️  Protocol message: ${messageContent.content.type}`);
        break;

      case "ephemeral":
        console.log(`⏱️  Ephemeral message wrapper`);
        // Handle the nested message
        if (messageContent.content.message) {
          const nestedContent = getMessageContent(
            messageContent.content.message
          );
          if (nestedContent) {
            console.log(`↳ Contains: ${nestedContent.type}`);
          }
        }
        break;

      case "viewOnce":
        console.log(`👁️  View once message wrapper`);
        // Handle the nested message
        if (messageContent.content.message) {
          const nestedContent = getMessageContent(
            messageContent.content.message
          );
          if (nestedContent) {
            console.log(`↳ Contains: ${nestedContent.type}`);
          }
        }
        break;

      default:
        console.log(`❓ Unhandled message type: ${messageContent.type}`);
    }
  },

  // Receipt events (message delivery/read confirmations)
  handleReceipt: async (event) => {
    const { MessageSource, MessageIDs, Type, Timestamp } = event;
    const from = MessageSource.Chat.User;

    console.log(
      `📋 Receipt from ${from}: ${Type} for ${MessageIDs.length} message(s)`
    );

    switch (Type) {
      case "delivery":
        console.log(`✅ Messages delivered to ${from}`);
        break;
      case "read":
        console.log(`👀 Messages read by ${from}`);
        break;
      case "played":
        console.log(`▶️  Voice/video messages played by ${from}`);
        break;
    }
  },

  // Presence events (typing, online/offline status)
  handlePresence: async (event) => {
    const { From, Unavailable, LastSeen } = event;
    const user = From.User;

    if (Unavailable) {
      console.log(`🔴 ${user} went offline (last seen: ${LastSeen})`);
    } else {
      console.log(`🟢 ${user} is online`);
    }
  },

  // Chat presence events (typing indicators)
  handleChatPresence: async (event) => {
    const { MessageSource, State, Media } = event;
    const from = MessageSource.Sender.User;
    const isGroup = MessageSource.IsGroup;

    if (State === "composing") {
      if (Media === "text") {
        console.log(`⌨️  ${from} is typing${isGroup ? " in group" : ""}...`);
      } else {
        console.log(
          `📎 ${from} is sending ${Media}${isGroup ? " in group" : ""}...`
        );
      }
    } else if (State === "paused") {
      console.log(`⏸️  ${from} stopped typing`);
    }
  },

  // Group events
  handleGroupInfo: async (event) => {
    const { JID, GroupName, Participants, Sender } = event;
    console.log(`👥 Group info updated for ${GroupName} (${JID.User})`);
    console.log(`👤 Updated by: ${Sender.User}`);
    console.log(`👥 Participants: ${Participants.length}`);
  },

  handleJoinedGroup: async (event) => {
    const { Reason, Type, Participants } = event;
    console.log(`🎉 Joined group! Reason: ${Reason}, Type: ${Type}`);
    console.log(`👥 Group has ${Participants.length} participants`);
  },

  // Connection events
  handleConnected: async (event) => {
    console.log("🟢 Connected to WhatsApp!");
  },

  handleDisconnected: async (event) => {
    console.log("🔴 Disconnected from WhatsApp");
  },

  handleLoggedOut: async (event) => {
    const { Reason, OnConnect } = event;
    console.log(`🚪 Logged out from WhatsApp. Reason: ${Reason}`);
    if (OnConnect) {
      console.log("⚠️  Logout occurred during connection");
    }
  },

  // QR Code events
  handleQR: async (event) => {
    const { Codes } = event;
    console.log("📱 New QR codes received:");
    Codes.forEach((code, index) => {
      console.log(`📷 QR Code ${index + 1}: ${code}`);
    });
  },

  // Picture events (profile/group picture changes)
  handlePicture: async (event) => {
    const { JID, Author, Remove, Timestamp } = event;
    const target = JID.User;
    const changer = Author.User;

    if (Remove) {
      console.log(`🗑️  ${changer} removed profile picture for ${target}`);
    } else {
      console.log(`🖼️  ${changer} updated profile picture for ${target}`);
    }
  },

  // Contact events
  handleContact: async (event) => {
    const { JID, Found, FullName, PushName, BusinessName } = event;
    console.log(`👤 Contact info: ${FullName || PushName} (${JID.User})`);
    if (BusinessName) {
      console.log(`🏢 Business: ${BusinessName}`);
    }
    console.log(`✅ Found in WhatsApp: ${Found}`);
  },

  // Push name changes
  handlePushName: async (event) => {
    const { JID, OldPushName, NewPushName } = event;
    console.log(
      `📝 ${JID.User} changed name from "${OldPushName}" to "${NewPushName}"`
    );
  },

  // Error events
  handleUndecryptableMessage: async (event) => {
    const { Info, IsUnavailable, UnavailableType, DecryptFailMode } = event;
    console.log(`❌ Failed to decrypt message from ${Info.Source.Sender.User}`);
    console.log(
      `📊 Unavailable: ${IsUnavailable}, Type: ${UnavailableType}, Mode: ${DecryptFailMode}`
    );
  },

  handleStreamError: async (event) => {
    const { Code } = event;
    console.log(`🚨 Stream error: ${Code}`);
  },
};

// Main webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const webhookPayload = req.body;

    // Log the raw payload for debugging
    console.log(
      "📨 Webhook received:",
      JSON.stringify(webhookPayload, null, 2)
    );

    // Handle S3 media information if present
    if (hasS3Media(webhookPayload)) {
      console.log("☁️ S3 Media Information:");
      console.log(`🔗 URL: ${webhookPayload.s3.url}`);
      console.log(`🗂️ Bucket: ${webhookPayload.s3.bucket}`);
      console.log(`🔑 Key: ${webhookPayload.s3.key}`);
      console.log(`📊 Size: ${webhookPayload.s3.size} bytes`);
      console.log(`📋 Type: ${webhookPayload.s3.mimeType}`);
      console.log(`📄 File: ${webhookPayload.s3.fileName}`);
    }

    if (hasBase64Media(webhookPayload)) {
      console.log("📦 Base64 media included");
      console.log(`📋 Type: ${webhookPayload.mimeType}`);
      console.log(`📄 File: ${webhookPayload.fileName}`);
      console.log(`📊 Size: ${webhookPayload.base64.length} chars`);
    }

    if (hasBothMedia(webhookPayload)) {
      console.log("🔄 Both S3 and Base64 media provided");
    }

    // Extract the actual event data
    const eventData = webhookPayload.event || webhookPayload;

    // Determine event type using the EventType enum and handle accordingly
    const eventType = detectEventType(eventData);

    console.log(`🏷️ Event Type: ${eventType}`);

    switch (eventType) {
      case EventType.MESSAGE:
        await eventHandlers.handleMessage(eventData);
        break;

      case EventType.RECEIPT:
        await eventHandlers.handleReceipt(eventData);
        break;

      case EventType.PRESENCE:
        await eventHandlers.handlePresence(eventData);
        break;

      case EventType.CHAT_PRESENCE:
        await eventHandlers.handleChatPresence(eventData);
        break;

      case EventType.GROUP_INFO:
        await eventHandlers.handleGroupInfo(eventData);
        break;

      case EventType.JOINED_GROUP:
        await eventHandlers.handleJoinedGroup(eventData);
        break;

      case EventType.QR:
        await eventHandlers.handleQR(eventData);
        break;

      case EventType.PICTURE:
        await eventHandlers.handlePicture(eventData);
        break;

      case EventType.CONTACT:
        await eventHandlers.handleContact(eventData);
        break;

      case EventType.PUSH_NAME:
        await eventHandlers.handlePushName(eventData);
        break;

      case EventType.UNDECRYPTABLE_MESSAGE:
        await eventHandlers.handleUndecryptableMessage(eventData);
        break;

      case EventType.STREAM_ERROR:
        await eventHandlers.handleStreamError(eventData);
        break;

      case EventType.CONNECTED:
        await eventHandlers.handleConnected(eventData);
        break;

      case EventType.DISCONNECTED:
        await eventHandlers.handleDisconnected(eventData);
        break;

      case EventType.LOGGED_OUT:
        await eventHandlers.handleLoggedOut(eventData);
        break;

      default:
        console.log(`🤷 Unknown or unhandled event type: ${eventType}`);
        console.log("📋 Event data:", eventData);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to detect event type from event data structure
function detectEventType(eventData) {
  // Check for specific event patterns to determine type
  if (eventData.Message && eventData.Info) {
    return EventType.MESSAGE;
  }
  if (eventData.MessageIDs && eventData.Type) {
    return EventType.RECEIPT;
  }
  if (eventData.From && typeof eventData.Unavailable !== "undefined") {
    return EventType.PRESENCE;
  }
  if (eventData.State && eventData.MessageSource) {
    return EventType.CHAT_PRESENCE;
  }
  if (eventData.GroupName && eventData.Participants) {
    return EventType.GROUP_INFO;
  }
  if (eventData.Reason && eventData.Type && eventData.Participants) {
    return EventType.JOINED_GROUP;
  }
  if (eventData.Codes) {
    return EventType.QR;
  }
  if (
    eventData.JID &&
    eventData.Author &&
    typeof eventData.Remove !== "undefined"
  ) {
    return EventType.PICTURE;
  }
  if (eventData.Found !== undefined && eventData.FullName) {
    return EventType.CONTACT;
  }
  if (eventData.OldPushName && eventData.NewPushName) {
    return EventType.PUSH_NAME;
  }
  if (eventData.IsUnavailable !== undefined) {
    return EventType.UNDECRYPTABLE_MESSAGE;
  }
  if (eventData.Code && !eventData.Expire) {
    return EventType.STREAM_ERROR;
  }

  // Handle events with explicit type field
  if (eventData.event_type) {
    switch (eventData.event_type) {
      case "connected":
        return EventType.CONNECTED;
      case "disconnected":
        return EventType.DISCONNECTED;
      case "logged_out":
        return EventType.LOGGED_OUT;
    }
  }

  // Try to detect by checking specific fields
  if (eventData.Connected !== undefined) {
    return EventType.CONNECTED;
  }

  return "Unknown";
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Webhook verification endpoint (if needed)
app.get("/webhook", (req, res) => {
  // Handle webhook verification if your system requires it
  const challenge = req.query.challenge;
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(200).json({ message: "Webhook endpoint is active" });
  }
});

// Initialize the webhook server
async function initializeWebhookServer() {
  try {
    console.log("🔧 Initializing webhook server...");

    // Test WuzAPI connection
    const isConnected = await client.ping();
    // With flexible tokens: await client.ping({ token: "user-specific-token" });
    if (!isConnected) {
      throw new Error("Cannot connect to WuzAPI server");
    }
    console.log("✅ Connected to WuzAPI");

    // Connect to WhatsApp with full event subscription using EventType enum
    await client.session.connect({
      Subscribe: [
        EventType.MESSAGE,
        EventType.RECEIPT,
        EventType.PRESENCE,
        EventType.CHAT_PRESENCE,
        EventType.GROUP_INFO,
        EventType.CONTACT,
        EventType.PUSH_NAME,
        EventType.PICTURE,
        EventType.QR,
        EventType.CONNECTED,
        EventType.DISCONNECTED,
        EventType.LOGGED_OUT,
        EventType.UNDECRYPTABLE_MESSAGE,
        EventType.STREAM_ERROR,
      ],
      Immediate: false,
    });
    // With flexible tokens: add second parameter { token: "user-specific-token" }

    console.log("📱 Connected to WhatsApp");

    // Check login status
    const status = await client.session.getStatus();
    // With flexible tokens: await client.session.getStatus({ token: "user-specific-token" });
    if (!status.LoggedIn) {
      console.log("📱 Not logged in. Please scan QR code...");
      const qr = await client.session.getQRCode();
      // With flexible tokens: await client.session.getQRCode({ token: "user-specific-token" });
      console.log("📷 QR Code:", qr.QRCode);
    } else {
      console.log("✅ Already logged in to WhatsApp");
    }

    // Set webhook URL
    const webhookUrl =
      process.env.WEBHOOK_URL || "http://localhost:3000/webhook";
    await client.webhook.setWebhook(webhookUrl, ["All"]);
    // With flexible tokens: await client.webhook.setWebhook(webhookUrl, ["All"], { token: "user-specific-token" });
    console.log(`🔗 Webhook configured: ${webhookUrl}`);

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Webhook server running on port ${port}`);
      console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
      console.log("🎉 Ready to receive WhatsApp events!");
    });
  } catch (error) {
    console.error("❌ Webhook server initialization failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down webhook server...");
  try {
    await client.session.disconnect();
    // With flexible tokens: await client.session.disconnect(undefined, { token: "user-specific-token" });
    console.log("✅ Disconnected from WhatsApp");
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
initializeWebhookServer();

export { app, client, eventHandlers };
