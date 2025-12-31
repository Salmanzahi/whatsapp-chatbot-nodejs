/**
 * Example: Multi-parameter Command Template
 *
 * Ini adalah template untuk membuat command dengan multiple parameters
 * Bisa digunakan sebagai referensi untuk command baru
 *
 * Syntax: !translate <source_lang> <target_lang> <text>
 * Example: !translate en id Hello World
 */

import { sendToBridge } from "../triggertest.js";
import {
  parseCommandArgs,
  createErrorMessage,
  createSuccessMessage,
  sendTypingIndicator,
  CommandLogger,
} from "../utils/commandUtils.js";

/**
 * Supported languages configuration
 */
const LANGUAGES = {
  en: { name: "English", emoji: "🇬🇧" },
  id: { name: "Indonesian", emoji: "🇮🇩" },
  ja: { name: "Japanese", emoji: "🇯🇵" },
  ko: { name: "Korean", emoji: "🇰🇷" },
  zh: { name: "Chinese", emoji: "🇨🇳" },
  // Add more languages as needed
};

/**
 * Command schema definition
 */
const COMMAND_SCHEMA = {
  params: [
    {
      name: "sourceLang",
      type: "string",
      required: true,
      validate: (value) => LANGUAGES[value] !== undefined,
      errorMessage: "Bahasa sumber tidak valid",
    },
    {
      name: "targetLang",
      type: "string",
      required: true,
      validate: (value) => LANGUAGES[value] !== undefined,
      errorMessage: "Bahasa target tidak valid",
    },
    {
      name: "text",
      type: "string",
      required: true,
      takeRest: true, // Ambil semua argumen sisanya
      minLength: 1,
    },
  ],
};

export default {
  name: "translate",
  aliases: ["tr", "tl"],
  description: "Translate text between languages",
  usage:
    "!translate <source> <target> <text>\n\nExample:\n!translate en id Hello World",

  async execute(sock, msg, args, context) {
    const start = Date.now();

    // Parse arguments menggunakan schema
    const parsed = parseCommandArgs(args, COMMAND_SCHEMA);

    if (!parsed.isValid) {
      const availableLangs = Object.entries(LANGUAGES)
        .map(([code, info]) => `${info.emoji} ${code} = ${info.name}`)
        .join("\n");

      const errorMsg = createErrorMessage(
        "Format salah!",
        `${parsed.errors.join(
          "\n"
        )}\n\n📋 Bahasa yang tersedia:\n${availableLangs}`,
        ["!translate en id Hello", "!translate id en Halo dunia"]
      );

      await sock.sendMessage(context.from, { text: errorMsg });
      CommandLogger.log("translate", context.sender, args, "validation_failed");
      return;
    }

    const { sourceLang, targetLang, text } = parsed.params;

    try {
      await sendTypingIndicator(sock, context.from);

      // Kirim notifikasi
      const sourceLangInfo = LANGUAGES[sourceLang];
      const targetLangInfo = LANGUAGES[targetLang];

      await sock.sendMessage(context.from, {
        text: `${sourceLangInfo.emoji} → ${targetLangInfo.emoji}\nMenerjemahkan...\n⏳ Mohon tunggu...`,
      });

      // TODO: Implement actual translation logic
      // Untuk sekarang, ini hanya contoh
      // Anda bisa integrate dengan translation API atau AI

      const mockResponse = {
        original: text,
        translated: `[Translated from ${sourceLang} to ${targetLang}]: ${text}`,
        sourceLang: sourceLangInfo.name,
        targetLang: targetLangInfo.name,
      };

      const latency = Date.now() - start;

      const responseText = createSuccessMessage(
        "🌐",
        "Translation Result",
        `*${sourceLangInfo.name}:*\n${mockResponse.original}\n\n*${targetLangInfo.name}:*\n${mockResponse.translated}`,
        `⚡ ${latency}ms`
      );

      await sock.sendMessage(context.from, { text: responseText });

      CommandLogger.log("translate", context.sender, args, "success");
    } catch (error) {
      CommandLogger.error("translate", context.sender, error);

      const errorMsg = createErrorMessage(
        "Terjadi kesalahan saat menerjemahkan",
        error.message
      );

      await sock.sendMessage(context.from, { text: errorMsg });
    }
  },
};
