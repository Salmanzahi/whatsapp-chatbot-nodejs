export default {
    name: 'info',
    aliases: ['about', 'botinfo'],
    description: 'Get information about the bot',
    usage: '!info',
    
    async execute(sock, msg, args, context) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const infoText = `
🤖 *WhatsApp Bot Information*

*Platform:* Baileys (WhatsApp Web API)
*Version:* 1.0.0
*Uptime:* ${hours}h ${minutes}m ${seconds}s
*Node.js:* ${process.version}

*Features:*
✅ Auto-reply
✅ Group management
✅ Custom commands
✅ Sticker creation
✅ Mentions & tags

*Developer:* Your Name
*Type:* !help to see all commands
        `.trim();

        await sock.sendMessage(context.from, { text: infoText });
    }
};
