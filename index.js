import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import readline from "readline";
import { exec } from "child_process";
import { promisify } from "util";

import { handleMessages } from "./handlers/messageHandler.js";
import { handleGroupEvents } from "./handlers/groupHandler.js";

const logger = pino({ level: "silent" });
const execAsync = promisify(exec);

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
      console.log("🧠 AI Service: Local (No Bridge)");
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

// Terminal interaction setup with git command support
function setupTerminalInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "🤖 git> ",
  });

  console.log("\n💬 Interactive terminal enabled.");
  console.log('   Type "git <command>" to run git commands');
  console.log('   Type "help" for available commands\n');
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    const command = input.toLowerCase();

    // Handle empty input
    if (!input) {
      rl.prompt();
      return;
    }

    // Built-in commands
    if (command === "help") {
      console.log("\n📋 Available Commands:");
      console.log(
        "  git <command>  - Execute any git command (e.g., git status, git log)",
      );
      console.log("  help           - Show this help message");
      console.log("  clear          - Clear the console");
      console.log("  exit           - Shutdown the bot");
      console.log("\n💡 Examples:");
      console.log("  git status");
      console.log("  git log --oneline -5");
      console.log("  git add .");
      console.log('  git commit -m "your message"');
      console.log("  git push\n");
      rl.prompt();
      return;
    }

    if (command === "clear") {
      console.clear();
      console.log("🚀 WhatsApp Bot - Git Interactive Terminal\n");
      rl.prompt();
      return;
    }

    if (command === "exit" || command === "quit") {
      console.log("\n👋 Shutting down bot...");
      process.exit(0);
      return;
    }

    // Execute git commands
    if (input.startsWith("git ")) {
      try {
        console.log(`\n⚙️  Executing: ${input}\n`);
        const { stdout, stderr } = await execAsync(input, {
          cwd: process.cwd(),
        });

        if (stdout) {
          console.log(stdout.trim());
        }
        if (stderr) {
          console.error("⚠️  ", stderr.trim());
        }
        console.log(); // Empty line for readability
      } catch (error) {
        console.error(`\n❌ Error executing git command:`);
        console.error(error.message);
        if (error.stderr) {
          console.error(error.stderr);
        }
        console.log();
      }
      rl.prompt();
      return;
    }

    // Unknown command
    console.log(`\n❌ Unknown command: "${input}"`);
    console.log('   Type "help" for available commands\n');
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\n👋 Bot shutting down...");
    process.exit(0);
  });
}

// Start the bot
console.log("🚀 Starting WhatsApp Bot...\n");
console.log("📦 AI System: Native JavaScript (ChromaDB + OpenRouter)");
console.log("🔌 Bridge: Disabled\n");

startBot()
  .then(() => {
    // Setup interactive terminal after bot starts
    setupTerminalInterface();
  })
  .catch((err) => {
    console.error("❌ Error starting bot:", err);
    process.exit(1);
  });

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n👋 Bot shutting down...");
  process.exit(0);
});
