/**
 * @deprecated This file is no longer used.
 * The AI system has been migrated to native JavaScript services.
 * See: services/chatbotService.js
 *
 * This file is kept for reference only.
 */

import axios from "axios";

/**
 * Fungsi untuk mensimulasikan pengiriman data ke Bridge Node.js
 * @param {string} pesan - Teks yang ingin dites ke sistem
 * @param {number} modeSelection - Mode selection untuk AI (default: 1)
 */
export async function sendToBridge(pesan, modeSelection = 1) {
  const urlBridge = "http://localhost:3000/gateway"; // Alamat server Node.js kamu

  console.log(`[Trigger] 🚀 Mengirim permintaan ke: ${urlBridge}`);
  console.log(`[Trigger] 📩 Data: "${pesan}"`);
  console.log(`[Trigger] 🎯 Mode Selection: ${modeSelection}`);

  try {
    const response = await axios.post(urlBridge, {
      message: pesan,
      modeSelection: modeSelection,
    });

    console.log("\n--- HASIL TESTING ---");
    console.log("✅ Status     :", response.data.status || "OK");
    console.log("🤖 Dari Python:", response.data.hasil_python || response.data);
    console.log("⏰ Waktu      :", new Date().toLocaleTimeString());
    console.log("---------------------\n");

    return response.data; // Return data jika berhasil
  } catch (error) {
    if (error.response) {
      // Server merespon tapi dengan kode error (misal 404 atau 500)
      console.error("❌ Bridge merespon dengan error:", error.response.data);

      // Return error details from Python
      return {
        error: true,
        error_type: error.response.data.error_type || "BridgeError",
        error_message:
          error.response.data.error_message ||
          error.response.data.error ||
          "Unknown error",
        traceback: error.response.data.traceback || null,
        detail: error.response.data.detail || null,
      };
    } else if (error.request) {
      // Request dikirim tapi tidak ada jawaban (Server Node.js mati)
      console.error(
        "❌ Gagal terhubung ke Bridge. Pastikan server.js (Node) sudah jalan di port 3000."
      );

      return {
        error: true,
        error_type: "ConnectionError",
        error_message:
          "Failed to connect to Bridge server (Node.js). Make sure it's running on port 3000.",
      };
    } else {
      console.error("❌ Error:", error.message);

      return {
        error: true,
        error_type: "UnknownError",
        error_message: error.message,
      };
    }
  }
}
