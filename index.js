import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import axios from "axios";
import express from "express";

// Import handlers
import { handleMessages } from "./handlers/messageHandler.js";
import { handleGroupEvents } from "./handlers/groupHandler.js";

const logger = pino({ level: "silent" }); // Set to 'debug' for detailed logs

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["WhatsApp Bot", "Chrome", "1.0.0"],
    markOnlineOnConnect: true,
  });

  // Handle QR code

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Scan this QR code with WhatsApp:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output.statusCode !==
            DisconnectReason.loggedOut
          : true;

      // Log detailed disconnect information
      if (lastDisconnect?.error instanceof Boom) {
        const statusCode = lastDisconnect.error.output.statusCode;
        const errorMessage = lastDisconnect.error.message;
        console.log("❌ Connection closed");
        console.log("   Status Code:", statusCode);
        console.log("   Error:", errorMessage);
        console.log("   Reconnecting:", shouldReconnect);

        // Map status codes to readable messages
        const disconnectReasons = {
          [DisconnectReason.badSession]:
            "Bad Session File, Delete auth_info and Scan Again",
          [DisconnectReason.connectionClosed]: "Connection closed",
          [DisconnectReason.connectionLost]: "Connection Lost from Server",
          [DisconnectReason.connectionReplaced]:
            "Connection Replaced, Another New Session Opened",
          [DisconnectReason.loggedOut]:
            "Device Logged Out, Delete auth_info and Scan Again",
          [DisconnectReason.restartRequired]: "Restart Required, Restarting...",
          [DisconnectReason.timedOut]: "Connection TimedOut",
        };

        const reason =
          disconnectReasons[statusCode] ||
          "Unknown DisconnectReason: " + statusCode;
        console.log("   Reason:", reason);
      } else {
        console.log("❌ Connection closed. Reconnecting:", shouldReconnect);
      }

      if (shouldReconnect) {
        setTimeout(() => startBot(), 3000);
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
      console.log("🤖 Bot is now online and ready to receive messages");
    }
  });

  // Save credentials when updated
  sock.ev.on("creds.update", saveCreds);

  // Handle incoming messages
  sock.ev.on("messages.upsert", async (m) => {
    await handleMessages(sock, m);
  });

  // // Handle group events (joins, leaves, etc.)
  // sock.ev.on("group-participants.update", async (update) => {
  //   await handleGroupEvents(sock, update);
  // });

  return sock;
}

// Start the bot
console.log("🚀 Starting WhatsApp Bot...\n");
startBot().catch((err) => {
  console.error("❌ Error starting bot:", err);
  process.exit(1);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n👋 Bot shutting down...");
  process.exit(0);
});

const app = express();
app.use(express.json());

app.post("/gateway", async (req, res) => {
  const inputuser = req.body.message;
  const modeSelection = req.body.modeSelection || 1;

  try {
    console.log(`[NodeJS] Meneruskan ke Python: ${inputuser}`);
    console.log(`[NodeJS] Mode Selection: ${modeSelection}`);

    const respond = await axios.post("http://localhost:8000/gateway", {
      inputUser: inputuser,
      modeSelection: modeSelection,
    });

    console.log("[NodeJS] Respon dari Python diterima!");

    // Check if Python returned an error
    if (respond.data.error) {
      console.error("[NodeJS] Python returned error:", respond.data);
      res.status(500).json(respond.data);
    } else {
      res.json(respond.data);
    }
  } catch (error) {
    console.error("[NodeJS] Error:", error.message);

    // Check if error response contains Python error details
    if (error.response && error.response.data) {
      res.status(500).json(error.response.data);
    } else {
      res.status(500).json({
        error: true,
        error_type: "ConnectionError",
        error_message: "Failed to connect to Python server",
        detail: error.message,
      });
    }
  }
});

app.listen(3000, () => {
  console.log("✓ Node.js Bridge aktif di http://localhost:3000");
});
