// Example: Custom quote command
// This command sends a random motivational quote

const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Stay hungry, stay foolish. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
];

export default {
    name: 'quote',
    aliases: ['q', 'motivation'],
    description: 'Get a random motivational quote',
    usage: '!quote',
    groupOnly: false, // Can be used in both private and group chats
    
    async execute(sock, msg, args, context) {
        // Get random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // Send the quote
        await sock.sendMessage(context.from, { 
            text: `💡 *Quote of the moment:*\n\n_${randomQuote}_` 
        });
    }
};

// To activate this command:
// 1. Save this file as: commands/quote.js
// 2. Add to commands/index.js:
//    import quote from './quote.js';
//    export const commands = [
//        ping, help, info, sticker, everyone,
//        quote  // <-- Add this
//    ];
// 3. Restart the bot
// 4. Test with: !quote
