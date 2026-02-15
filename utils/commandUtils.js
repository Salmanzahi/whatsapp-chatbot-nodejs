/**
 * Command Utilities
 * Helper functions untuk membuat command lebih modular dan reusable
 */

/**
 * Parse command arguments dengan pattern yang fleksibel
 * @param {Array} args - Array of arguments
 * @param {Object} schema - Schema untuk validasi
 * @returns {Object} - Parsed and validated result
 *
 * @example
 * const schema = {
 *   params: [
 *     { name: 'mode', type: 'number', required: true, validate: (v) => v >= 1 && v <= 3 },
 *     { name: 'content', type: 'string', required: true, minLength: 1 }
 *   ]
 * };
 * const result = parseCommandArgs(args, schema);
 */
export function parseCommandArgs(args, schema) {
  const result = {
    isValid: true,
    params: {},
    errors: [],
  };

  // Validasi jumlah argumen
  const requiredCount = schema.params.filter((p) => p.required).length;
  if (args.length < requiredCount) {
    result.isValid = false;
    result.errors.push(
      `Minimal ${requiredCount} argumen diperlukan, diberikan ${args.length}`,
    );
    return result;
  }

  // Parse setiap parameter
  schema.params.forEach((param, index) => {
    let value;

    // Handle parameter yang mengambil sisa argumen (seperti content)
    if (param.takeRest) {
      value = args.slice(index).join(" ");
    } else {
      value = args[index];
    }

    // Type conversion
    if (param.type === "number") {
      value = parseInt(value);
      if (isNaN(value)) {
        result.isValid = false;
        result.errors.push(`Parameter '${param.name}' harus berupa angka`);
        return;
      }
    }

    // Custom validation
    if (param.validate && !param.validate(value)) {
      result.isValid = false;
      result.errors.push(
        param.errorMessage || `Parameter '${param.name}' tidak valid`,
      );
      return;
    }

    // Min length validation (untuk string)
    if (param.minLength && value.length < param.minLength) {
      result.isValid = false;
      result.errors.push(
        `Parameter '${param.name}' minimal ${param.minLength} karakter`,
      );
      return;
    }

    result.params[param.name] = value;
  });

  return result;
}

/**
 * Create error message dengan format yang konsisten
 */
export function createErrorMessage(title, details, examples = []) {
  let message = `❌ ${title}\n`;

  if (details) {
    message += `\n${details}\n`;
  }

  if (examples.length > 0) {
    message += `\n📖 Contoh:\n`;
    examples.forEach((ex) => {
      message += `• ${ex}\n`;
    });
  }

  return message.trim();
}

/**
 * Create success message dengan format yang konsisten
 */
export function createSuccessMessage(emoji, title, content, footer = null) {
  let message = `${emoji} *${title}*\n\n${content}`;

  if (footer) {
    message += `\n\n${footer}`;
  }

  return message;
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(sock, jid, duration = 3000) {
  await sock.sendPresenceUpdate("composing", jid);

  // Auto-stop after duration
  setTimeout(async () => {
    await sock.sendPresenceUpdate("paused", jid);
  }, duration);
}

/**
 * Send message dengan retry mechanism
 */
export async function sendMessageWithRetry(sock, jid, content, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await sock.sendMessage(jid, content);
      return true;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Retry ${i + 1}/${maxRetries} - Failed to send message`);

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  console.error("❌ Failed to send message after retries:", lastError);
  return false;
}

/**
 * Format duration ke human-readable string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Validate mode dengan config object
 */
export function validateMode(mode, modesConfig) {
  const modeNum = parseInt(mode);

  if (isNaN(modeNum)) {
    return {
      isValid: false,
      error: `Mode harus berupa angka, diberikan: "${mode}"`,
    };
  }

  if (!modesConfig[modeNum]) {
    const availableModes = Object.entries(modesConfig)
      .map(([key, value]) => `${value.emoji} Mode ${key}: ${value.name}`)
      .join("\n");

    return {
      isValid: false,
      error: `Mode ${modeNum} tidak tersedia.\n\n📋 Mode yang tersedia:\n${availableModes}`,
    };
  }

  return {
    isValid: true,
    mode: modeNum,
    modeInfo: modesConfig[modeNum],
  };
}

/**
 * Extract text dari berbagai tipe message WhatsApp
 */
export function extractMessageText(msg) {
  if (msg.message.conversation) {
    return msg.message.conversation;
  } else if (msg.message.extendedTextMessage) {
    return msg.message.extendedTextMessage.text;
  } else if (msg.message.imageMessage?.caption) {
    return msg.message.imageMessage.caption;
  } else if (msg.message.videoMessage?.caption) {
    return msg.message.videoMessage.caption;
  }
  return "";
}

/**
 * Check if user is admin (untuk future features)
 */
export function isAdmin(userId, adminList = []) {
  return adminList.includes(userId);
}

/**
 * Rate limiter sederhana
 */
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Filter request yang masih dalam window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        resetIn: this.windowMs - (now - validRequests[0]),
      };
    }

    // Add new request
    validRequests.push(now);
    this.requests.set(userId, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
    };
  }

  reset(userId) {
    this.requests.delete(userId);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Logger utility dengan timestamp
 */
export class CommandLogger {
  static log(commandName, userId, args, status = "success") {
    const timestamp = new Date().toISOString();
    const emoji = status === "success" ? "✅" : "❌";

    console.log(
      `${emoji} [${timestamp}] Command: ${commandName} | User: ${userId} | Args: ${JSON.stringify(
        args,
      )} | Status: ${status}`,
    );
  }

  static error(commandName, userId, error) {
    const timestamp = new Date().toISOString();
    console.error(
      `❌ [${timestamp}] Command: ${commandName} | User: ${userId} | Error: ${error.message}`,
    );
  }
}
