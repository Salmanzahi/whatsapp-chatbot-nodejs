export default {
  name: "ping",
  aliases: ["p"],
  description: "Check if the bot is responsive",
  usage: "!ping",

  async execute(sock, msg, args, context) {
    const start = Date.now();

    await sock.sendMessage(context.from, {
      text: "🏓 Pong!",
    });

    const latency = Date.now() - start;

    await sock.sendMessage(context.from, {
      text: `⚡ Response time: ${latency}ms`,
    });
  },
};
