// Basic usage example for WuzAPI client
// This example shows how to set up and use the WuzAPI client
// with both traditional (global token) and flexible (per-request token) approaches

import WuzapiClient from "wuzapi";

// Method 1: Traditional usage with tokens on the client
// `token` is the user credential (sent as the `token` header); `adminToken` is
// only needed for client.admin.* (sent as `Authorization`).
const configuredClient = new WuzapiClient({
  apiUrl: "http://localhost:8080", // Your WuzAPI server URL
  token: "your-user-token-here", // Your user authentication token
  // adminToken: "your-admin-token-here",
});

// Method 2: Flexible usage - no tokens on the client, supplied per request
const flexibleClient = new WuzapiClient({
  apiUrl: "http://localhost:8080", // Your WuzAPI server URL
});

// For this example, we'll use the traditional approach
const client = configuredClient;

async function basicExample() {
  try {
    console.log("🔄 Connecting to WuzAPI...");

    // Test connectivity
    const isConnected = await client.ping();
    if (!isConnected) {
      console.error("❌ Cannot connect to WuzAPI server");
      return;
    }
    console.log("✅ Connected to WuzAPI server");

    // Optional: Configure proxy before connecting (uncomment if needed)
    /*
    console.log("🔧 Configuring proxy...");
    try {
      await client.session.setProxy("socks5://username:password@proxy-server:1080", true);
      console.log("✅ Proxy configured");
    } catch (proxyError) {
      console.log("⚠️ Proxy configuration failed:", proxyError.message);
    }
    */

    // Connect to WhatsApp
    console.log("🔄 Connecting to WhatsApp...");
    await client.session.connect({
      Subscribe: ["Message", "ReadReceipt"],
      Immediate: false,
    });

    // Check connection status
    const status = await client.session.getStatus();
    console.log("📱 WhatsApp Status:", {
      connected: status.Connected,
      loggedIn: status.LoggedIn,
    });

    // If not logged in, offer options: QR code or phone pairing
    if (status.Connected && !status.LoggedIn) {
      console.log("📱 Not logged in. Choose login method:");

      // Option 1: QR Code (traditional)
      console.log("📷 Option 1: QR Code login");
      const qr = await client.session.getQRCode();
      console.log("📷 Scan this QR code with WhatsApp:", qr.QRCode);
      console.log("⏳ Waiting for QR code scan...");

      // Option 2: Phone pairing (alternative)
      console.log("\n📞 Option 2: Phone pairing");
      console.log("💡 To use phone pairing instead:");
      console.log("   1. Uncomment the pairPhone example below");
      console.log("   2. Replace with your phone number");
      console.log("   3. You'll receive an SMS/call with verification code");

      /*
      // Phone pairing example - uncomment and modify:
      try {
        const phoneNumber = "5491155554444"; // Your phone number with country code
        console.log(`📱 Requesting pairing code for ${phoneNumber}...`);
        
        // This will generate a pairing code that will be sent via SMS/call
        const pairResult = await client.session.pairPhone(phoneNumber);
        console.log("✅ Pairing result:", pairResult.Details);
        console.log("📱 Check your phone for verification code and enter it in WhatsApp");
      } catch (pairError) {
        console.error("❌ Phone pairing failed:", pairError.message);
      }
      */
    }

    // Example: Send a text message (uncomment when ready)
    /*
    if (status.LoggedIn) {
      console.log('📤 Sending test message...');
      const response = await client.chat.sendText({
        Phone: '5491155554444', // Replace with actual phone number
        Body: 'Hello from WuzAPI! 🎉'
      });
      console.log('✅ Message sent:', response.Id);
    }
    */

    // Example: Get user contacts
    if (status.LoggedIn) {
      console.log("📇 Getting contacts...");
      const contacts = await client.user.getContacts();
      console.log(`📇 Found ${Object.keys(contacts).length} contacts`);
    }

    // Example: List groups
    if (status.LoggedIn) {
      console.log("👥 Getting groups...");
      const groups = await client.group.list();
      console.log(`👥 Found ${groups.Groups.length} groups`);
    }

    // Example: Request message history sync (useful after login)
    if (status.LoggedIn) {
      console.log("📚 Requesting message history sync...");
      try {
        await client.session.requestHistory();
        console.log("✅ History sync requested");
      } catch (error) {
        console.log("⚠️ History sync failed:", error.message);
      }
    }

    // Advanced examples (uncomment to test)
    if (status.LoggedIn) {
      console.log("\n🚀 Advanced features available:");
      console.log("📋 Uncomment below to test new message types:");

      /*
      // Interactive buttons example
      await client.chat.sendButtons({
        Phone: '5491155554444',
        Body: 'Choose an option:',
        Footer: 'WuzAPI Bot',
        Buttons: [
          { ButtonId: 'btn1', ButtonText: { DisplayText: 'Option 1' }, Type: 1 },
          { ButtonId: 'btn2', ButtonText: { DisplayText: 'Option 2' }, Type: 1 }
        ]
      });

      // List message example
      await client.chat.sendList(
        '5491155554444', // Phone
        'View Options', // Button text
        'Select from menu:', // Description
        'Menu', // Top text/title
        [{ // Sections
          Title: 'Options',
          Rows: [
            { Title: 'Option A', Desc: 'First option', RowId: 'opt_a' },
            { Title: 'Option B', Desc: 'Second option', RowId: 'opt_b' }
          ]
        }]
      );

      // Poll example (for groups only)
      await client.chat.sendPoll(
        '120362023605733675@g.us', // Group JID (replace with actual group)
        'Favorite color?', // Header
        ['Red', 'Blue', 'Green'] // Options array
      );
      */
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code) {
      console.error("📊 Error code:", error.code);
    }
    if (error.details) {
      console.error("📋 Error details:", error.details);
    }
  }
}

// Example with flexible token usage
async function flexibleTokenExample() {
  try {
    console.log("\n🔧 Flexible Token Usage Example");
    console.log("=================================");

    // Use the flexible client
    const userToken = "user-specific-token-here";
    const adminToken = "admin-token-here";

    // Test connectivity with user token
    const isConnected = await flexibleClient.ping({ token: userToken });
    if (!isConnected) {
      console.error("❌ Cannot connect to WuzAPI server");
      return;
    }
    console.log("✅ Connected to WuzAPI server with user token");

    // Connect to WhatsApp with user token
    console.log("🔄 Connecting to WhatsApp with user token...");
    await flexibleClient.session.connect(
      {
        Subscribe: ["Message", "ReadReceipt"],
        Immediate: false,
      },
      { token: userToken }
    );

    // Check status with user token
    const status = await flexibleClient.session.getStatus({ token: userToken });
    console.log("📱 WhatsApp Status:", {
      connected: status.Connected,
      loggedIn: status.LoggedIn,
    });

    // Send message with user token
    if (status.LoggedIn) {
      console.log("📤 Sending message with user token...");
      // Uncomment and update phone number when ready
      /*
      const response = await flexibleClient.chat.sendText(
        {
          Phone: '5491155554444',
          Body: 'Hello from flexible token usage! 🚀'
        },
        { token: userToken }
      );
      console.log('✅ Message sent:', response.Id);
      */
    }

    // Admin operations with admin token
    console.log("👨‍💼 Performing admin operations with admin token...");
    try {
      const users = await flexibleClient.admin.listUsers({ token: adminToken });
      console.log(`👥 Found ${users.length} users in system`);
    } catch (error) {
      console.log("⚠️ Admin operations require valid admin token");
    }

    console.log("✅ Flexible token example completed");
  } catch (error) {
    console.error("❌ Error in flexible token example:", error.message);
    if (error.code === 401) {
      console.error("🔑 Authentication error - check your tokens");
    }
  }
}

// Run the examples
console.log("Running WuzAPI Basic Usage Examples");
console.log("==================================\n");

// Uncomment the example you want to run:

// Traditional usage
basicExample();

// Flexible token usage
// flexibleTokenExample();
