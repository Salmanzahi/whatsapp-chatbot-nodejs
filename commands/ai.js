// Command to handle AI respond to bridge system
import { sendToBridge } from "../triggertest.js";
const VALID_MODES = [1, 2, 3, 4, 5, 6];

/**
 * Parse flags from arguments (e.g., --role:user, --context:greeting)
 * @param {Array} args - Array of arguments
 * @returns {Object} - { flags: Object, remainingArgs: Array }
 */
function parseFlags(args) {
  const flags = {};
  const remainingArgs = [];

  for (const arg of args) {
    // Check if arg is a flag (starts with --)
    if (arg.startsWith("--")) {
      const flagMatch = arg.match(/^--([^:]+):(.+)$/);
      if (flagMatch) {
        const [, flagName, flagValue] = flagMatch;
        flags[flagName] = flagValue;
      } else {
        // Flag without value (e.g., --verbose)
        const flagName = arg.substring(2);
        flags[flagName] = true;
      }
    } else {
      remainingArgs.push(arg);
    }
  }

  return { flags, remainingArgs };
}

/**
 * Parse add-knowledge command with metadata support
 * @param {Array} args - Arguments after "add-knowledge"
 * @returns {Object} - Parsed knowledge data or error
 */
function parseKnowledgeCommand(args) {
  const VALID_ROLES = ["user", "model", "system", "assistant"];

  if (args.length === 0) {
    return {
      isValid: false,
      error:
        "❌ Knowledge content tidak boleh kosong!\n\n" +
        "📖 Format:\n" +
        "!ai add-knowledge [--role:<role>] [--context:<context>] <isi_knowledge>\n\n" +
        "📋 Flags (opsional):\n" +
        "--role:<user|model|system|assistant> - Siapa yang bicara\n" +
        "--context:<string> - Konteks/kategori knowledge\n\n" +
        "💡 Contoh:\n" +
        "!ai add-knowledge Nama saya Salman\n" +
        "!ai add-knowledge --role:user Saya suka programming\n" +
        "!ai add-knowledge --role:model --context:greeting Halo! Saya AI assistant\n" +
        "!ai add-knowledge --context:facts Python adalah bahasa pemrograman",
    };
  }

  // Parse flags and content
  const { flags, remainingArgs } = parseFlags(args);
  const knowledgeText = remainingArgs.join(" ").trim();

  // Validate knowledge text
  if (!knowledgeText) {
    return {
      isValid: false,
      error:
        "❌ Isi knowledge tidak boleh kosong!\n\n" +
        "Contoh: !ai add-knowledge --role:user Nama saya Salman",
    };
  }

  if (flags.role && !VALID_ROLES.includes(flags.role.toLowerCase())) {
    return {
      isValid: false,
      error:
        `❌ Role tidak valid: "${flags.role}"\n\n` +
        `📋 Role yang tersedia: ${VALID_ROLES.join(", ")}\n\n` +
        `Contoh: !ai add-knowledge --role:user Halo`,
    };
  }

  // Build metadata object
  const metadata = {};

  if (flags.role) {
    metadata.role = flags.role.toLowerCase();
  }

  if (flags.context) {
    metadata.context = flags.context;
  }

  // Add timestamp
  metadata.added_at = new Date().toISOString();
  metadata.source = "whatsapp";

  // Build content payload for Python backend
  // Format: JSON string with text and metadata
  const payload = {
    text: knowledgeText,
    metadata: metadata,
  };
  console.log("[DEBUG] Payload:", payload);
  return {
    isValid: true,
    mode: 3,
    content: JSON.stringify(payload),
    metadata: metadata, // Keep for display purposes
    knowledgeText: knowledgeText,
  };
}

/**
 * Parse command arguments
 * @param {Array} args - Array of arguments from command
 * @returns {Object} - { mode: number, content: string, isValid: boolean, error: string }
 */
function parseArguments(args) {
  const DEFAULT_MODE = 2;

  // return if args length == 0
  if (args.length === 0) {
    return {
      isValid: false,
      error:
        "❌ Pesan tidak boleh kosong!\n\n" +
        "📖 Cara pakai:\n" +
        "!ai <pesan>\n" +
        "!ai <mode> <pesan>\n" +
        "!ai add-knowledge [flags] <knowledge>\n\n" +
        "💡 Contoh:\n" +
        "!ai Halo AI (otomatis mode 2)\n" +
        "!ai 1 Halo AI (mode 1)\n" +
        "!ai add-knowledge --role:user Nama saya Salman",
    };
  }

  // Check if first arg is valid mode
  const firstArg = args[0];

  // Handle knowledge management commands
  if (firstArg === "add-knowledge") {
    return parseKnowledgeCommand(args.slice(1));
  } else if (firstArg === "list-knowledge") {
    return {
      isValid: true,
      mode: 4,
      content: args.slice(1).join(" ").trim(),
    };
  } else if (firstArg === "delete-knowledge") {
    const docId = args[1];
    if (!docId) {
      return {
        isValid: false,
        error:
          "❌ Document ID tidak boleh kosong!\n\n" +
          "Format: !ai delete-knowledge <doc_id>\n\n" +
          "Contoh: !ai delete-knowledge abc123",
      };
    } else if (firstArg == "clear-conversation") {
      return {
        isValid: true,
        mode: 6,
        content: args.slice(1).join(" ").trim(),
      };
    }
    return {
      isValid: true,
      mode: 5,
      content: docId,
    };
  }

  // Handle numeric modes
  const possibleMode = parseInt(firstArg);
  const checkFirstArg =
    !isNaN(possibleMode) && VALID_MODES.includes(possibleMode);

  let mode;
  let content;

  if (checkFirstArg) {
    mode = possibleMode;
    content = args.slice(1).join(" ").trim();

    if (!content) {
      return {
        isValid: false,
        error: "❌ Pesan tidak boleh kosong!\n\nContoh: !ai 1 Halo Dunia",
      };
    }
  } else {
    mode = DEFAULT_MODE;
    content = args.join(" ").trim();
  }

  // return isValid, mode selection, and user content message
  return {
    isValid: true,
    mode,
    content,
  };
}

/**
 * Format response untuk user
 */
function formatResponse(data) {
  const message = data.message || JSON.stringify(data);
  return message;
}

export default {
  name: "ai",
  aliases: ["ai", "ask"],
  description: "Talk with Sixteen AI (Enhanced with RAG system)",
  usage:
    "!ai <mode> <pesan>\n\nMode:\n1 = Standard Chat\n2 = RAG Enhanced\n3 = Creative Mode",

  async execute(sock, msg, args, context) {
    const start = Date.now();

    const parsed = parseArguments(args);
    if (!parsed.isValid) {
      await sock.sendMessage(context.from, {
        text: parsed.error,
      });
      return;
    }

    const { mode, content } = parsed;

    try {
      await sock.sendPresenceUpdate("composing", context.from);

      // Show different processing message for add-knowledge
      const processingMsg =
        mode === 3 ? "📝 Adding knowledge to database..." : "Processing...";

      await sock.sendMessage(context.from, {
        text: processingMsg,
      });

      const response = await sendToBridge(content, mode);
      await sock.sendPresenceUpdate("paused", context.from);

      if (!response) {
        // Handle error dari bridge
        await sock.sendMessage(context.from, {
          text: "Failed to connect to bridge system",
        });
        return;
      }

      // Check if response contains error
      if (response.error) {
        let errorMessage = `❌ PYTHON ERROR DETECTED\n\n`;
        errorMessage += `🔴 Error Type: ${response.error_type}\n`;
        errorMessage += `📝 Message: ${response.error_message}\n`;

        if (response.traceback) {
          errorMessage += `\n📋 Traceback:\n${response.traceback}`;
        }

        await sock.sendMessage(context.from, {
          text: errorMessage,
        });

        console.error(
          `[PYTHON ERROR] Type: ${response.error_type}, Message: ${response.error_message}`
        );
        return;
      }

      // Format response based on mode
      let formattedResponse;
      const latency = Date.now() - start;

      if (mode === 3 && parsed.metadata) {
        // Special formatting for add-knowledge success
        formattedResponse = `Knowledge berhasil ditambahkan!\n\n`;
        formattedResponse += `Content: ${parsed.knowledgeText}\n\n`;
        formattedResponse += `Metadata:\n`;

        if (parsed.metadata.role) {
          formattedResponse += `Role: ${parsed.metadata.role}\n`;
        }
        if (parsed.metadata.context) {
          formattedResponse += `Context: ${parsed.metadata.context}\n`;
        }
        formattedResponse += `Source: ${parsed.metadata.source}\n`;
        formattedResponse += `Added: ${new Date(
          parsed.metadata.added_at
        ).toLocaleString("id-ID")}\n`;

        // Add document ID from response if available
        if (response.doc_id || response.document_id) {
          formattedResponse += `\nDocument ID: ${
            response.doc_id || response.document_id
          }`;
        }
      } else {
        // Standard response formatting
        formattedResponse = formatResponse(response);
      }

      await sock.sendMessage(context.from, {
        text: `${formattedResponse}\n\n⏱ Response time: ${latency}ms`,
      });

      console.log(
        `AI command executed successfully | Mode: ${mode} | Latency: ${latency}ms`
      );
    } catch (error) {
      console.error("Error in AI command:", error);

      await sock.sendMessage(context.from, {
        text: `❌ JAVASCRIPT ERROR:\n${error.message}\n\nStack:\n${error.stack}`,
      });
    }
  },
};
