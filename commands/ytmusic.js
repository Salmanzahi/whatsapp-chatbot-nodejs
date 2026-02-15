import { prefix } from "../config.js";
import { Downloader } from "ytdl-mp3";
import path from "path";
import fs from "fs";

export default {
  name: "yt",
  aliases: ["yt"],
  description: "yt vid downloader",
  usage: "!yt <format> <url>",

  async execute(sock, msg, args, context) {
    const from = context.from;
    const allowedFormat = ["mp3", "mp4"];
    const format = args[0];
    const url = args[1];

    if (!allowedFormat.includes(format) || args.length !== 2) {
      return await sock.sendMessage(
        from,
        {
          text: `Invalid format! Correct usage: ${prefix}yt <format> <url>`,
        },
        { quoted: msg },
      );
    }

    await sock.sendMessage(
      from,
      { text: `Processing  ${format} request.` },
      { quoted: msg },
    );

    try {
      if (format === "mp3") {
        // 1. Download and get the file info
        const filePath = await tomp3(url);

        // 2. Send to WhatsApp
        await sock.sendMessage(
          from,
          {
            audio: { url: filePath },
            mimetype: "audio/mpeg",
            fileName: path.basename(filePath),
          },
          { quoted: msg },
        );

        // 3. Cleanup: Delete local file after 1 minute to save space
        setTimeout(() => fs.unlinkSync(filePath), 60000);
      } else {
        await sock.sendMessage(from, { text: "MP4 support coming soon!" });
      }
    } catch (error) {
      console.error(error);
      await sock.sendMessage(from, {
        text: "Failed to download. Check the link or try again later.",
      });
    }
  },
};

/**
 * Fixed tomp3 function
 */
async function tomp3(url) {
  const outputFolder = path.resolve("./media/audio"); // Absolute path to your folder
  if (!fs.existsSync(outputFolder))
    fs.mkdirSync(outputFolder, { recursive: true });

  const downloader = new Downloader({
    getTags: true,
    outputDir: outputFolder, // ytdl-mp3 supports outputDir in options
  });

  // downloadSong returns information about the downloaded file
  const songInfo = await downloader.downloadSong(url);

  // Return the full path to the saved file
  return songInfo.filePath;
}
