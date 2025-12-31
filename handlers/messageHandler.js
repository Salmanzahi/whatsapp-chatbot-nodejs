import { commands } from "../commands/index.js";

const DEBUG_MODE = true;

export async function handleMessages(sock, m) {
  try {
    const msg = m.messages[0];

    // Ignore if no message or if it's a status update
    if (!msg.message || msg.key.remoteJid === "status@broadcast") return;

    // Extract message info
    // const messageType = Object.keys(msg.message)[0];
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;

    // intial messageText
    let messageText = "";
    if (msg.message.conversation) {
      messageText = msg.message.conversation;
    } else if (msg.message.extendedTextMessage) {
      messageText = msg.message.extendedTextMessage.text;
    } else if (msg.message.imageMessage?.caption) {
      messageText = msg.message.imageMessage.caption;
    } else if (msg.message.videoMessage?.caption) {
      messageText = msg.message.videoMessage.caption;
    }

    // Ignore empty messages
    if (!messageText) return;

    //log the user itself
    // console.log(`sender: ${sender}`);

    // Log the message
    const groupName = isGroup ? "Group" : "Private";
    console.log(
      DEBUG_MODE
        ? `📨 [Grup Id: ${groupName}, Sender Name:${
            msg.pushName
          }, ID Sender:${sender}] Pesan: "${messageText}"
        \n[DEBUG] ${JSON.stringify(msg)}`
        : `📨 [Grup Id: ${groupName}, Sender Name:${msg.pushName}, ID Sender:${sender}] Pesan: "${messageText}"`
    );

    if (messageText.startsWith("!")) {
      // Parse command
      const args = messageText.slice(1).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      // Find and execute command
      const command = commands.find(
        (cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName)
      );

      if (command) {
        console.log(`⚡ Executing command: !${commandName}`);
        if (DEBUG_MODE) {
          console.log(
            `\n[DEBUG] Command: !${commandName}\nArgs: ${JSON.stringify(args)}`
          );
          console.log(`FROM  ${JSON.stringify(from)}`);
          console.log(`SENDER  ${JSON.stringify(sender)}`);
          console.log(`IS GROUP  ${JSON.stringify(isGroup)}`);
        }
        await command.execute(sock, msg, args, { from, sender, isGroup });
      }
    }
  } catch (e) {
    console.error("❌ Error handling message:", e);
  }
}
