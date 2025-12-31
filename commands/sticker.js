export default {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Convert image/video to sticker (reply to media)',
    usage: '!sticker (reply to image/video)',
    
    async execute(sock, msg, args, context) {
        // Check if message is a reply
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(context.from, {
                text: '❌ Please reply to an image or video with !sticker'
            });
            return;
        }

        // Check if quoted message contains media
        const imageMessage = quotedMsg.imageMessage;
        const videoMessage = quotedMsg.videoMessage;

        if (!imageMessage && !videoMessage) {
            await sock.sendMessage(context.from, {
                text: '❌ Please reply to an image or video!'
            });
            return;
        }

        try {
            await sock.sendMessage(context.from, {
                text: '⏳ Creating sticker...'
            });

            // Download media
            const mediaType = imageMessage ? 'image' : 'video';
            const mediaMessage = imageMessage || videoMessage;
            
            // For now, send a placeholder message
            // In production, you'd download the media and convert it to a sticker
            await sock.sendMessage(context.from, {
                text: '⚠️ Sticker creation requires additional dependencies.\n\nTo enable this feature, install:\nnpm install sharp fluent-ffmpeg'
            });

        } catch (error) {
            console.error('Error creating sticker:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to create sticker. Please try again.'
            });
        }
    }
};
