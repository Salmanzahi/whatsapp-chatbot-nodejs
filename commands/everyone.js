export default {
    name: 'everyone',
    aliases: ['tagall', 'all'],
    description: 'Mention everyone in the group',
    usage: '!everyone [message]',
    groupOnly: true,
    
    async execute(sock, msg, args, context) {
        try {
            // Get group metadata
            const groupMetadata = await sock.groupMetadata(context.from);
            const participants = groupMetadata.participants;

            // Create mention list
            const mentions = participants.map(p => p.id);

            // Create message with mentions
            let message = args.join(' ') || 'Attention everyone!';
            message += '\n\n';
            
            participants.forEach(p => {
                message += `@${p.id.split('@')[0]} `;
            });

            await sock.sendMessage(context.from, {
                text: message,
                mentions: mentions
            });

            console.log(`✅ Tagged ${participants.length} members in group`);

        } catch (error) {
            console.error('Error tagging everyone:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to tag everyone. Make sure the bot is an admin!'
            });
        }
    }
};
