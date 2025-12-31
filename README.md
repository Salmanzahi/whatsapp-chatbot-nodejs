# 🤖 WhatsApp Bot with Baileys

A powerful WhatsApp bot built with Baileys that can join groups, auto-reply, and execute custom commands.

## ✨ Features

- ✅ **Auto-reply system** with custom commands
- ✅ **Group management** (welcome messages, tag all members)
- ✅ **Modular command structure** - easy to add new commands
- ✅ **QR code authentication** - scan once and stay logged in
- ✅ **Auto-reconnect** - bot stays online 24/7
- ✅ **Group & private chat support**
- ✅ **Mention system** - tag users in messages
- ✅ **Event handling** - joins, leaves, promotions

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- WhatsApp account (not WhatsApp Business)

## 🚀 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the bot:**
```bash
npm start
```

3. **Scan QR code:**
   - A QR code will appear in your terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code

4. **Bot is ready!**
   - Once connected, the bot will stay online
   - Add it to groups or send messages directly

## 🎮 Available Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `!ping` | `!p` | Check bot responsiveness |
| `!help` | `!h`, `!commands` | Show all commands |
| `!info` | `!about`, `!botinfo` | Bot information |
| `!sticker` | `!s`, `!stiker` | Convert image to sticker |
| `!everyone` | `!tagall`, `!all` | Mention all group members |

### Command Examples:

```
!ping                    → Check if bot is online
!help                    → Show all commands
!help ping               → Get detailed help for ping command
!info                    → Show bot information
!everyone Hello team!    → Tag everyone with a message
!sticker                 → Reply to an image to make it a sticker
```

## 📁 Project Structure

```
whatsapp-bot/
├── index.js                 # Main bot file
├── handlers/
│   ├── messageHandler.js    # Handles incoming messages
│   └── groupHandler.js      # Handles group events
├── commands/
│   ├── index.js            # Command registry
│   ├── ping.js             # Ping command
│   ├── help.js             # Help command
│   ├── info.js             # Info command
│   ├── sticker.js          # Sticker command
│   └── everyone.js         # Tag all command
├── auth_info/              # Authentication data (auto-generated)
├── package.json
└── README.md
```

## 🔧 Adding New Commands

Create a new file in `commands/` folder:

```javascript
// commands/mycommand.js
export default {
    name: 'mycommand',
    aliases: ['mc'],
    description: 'My custom command',
    usage: '!mycommand [args]',
    groupOnly: false, // Set to true for group-only commands
    
    async execute(sock, msg, args, context) {
        await sock.sendMessage(context.from, { 
            text: 'Hello from my command!' 
        });
    }
};
```

Then add it to `commands/index.js`:

```javascript
import mycommand from './mycommand.js';

export const commands = [
    // ... other commands
    mycommand
];
```

## 🌐 Hosting (24/7 Operation)

### Option 1: VPS (Recommended)
- Deploy to a VPS (DigitalOcean, Linode, AWS EC2)
- Use PM2 to keep the bot running:
```bash
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup
```

### Option 2: Railway / Render
- Push to GitHub
- Connect to Railway or Render
- Deploy automatically

### Option 3: Local Machine
- Keep your computer running
- Use `npm start` to run the bot

## ⚠️ Important Notes

1. **Authentication Data**: The `auth_info/` folder contains your login session. Never share or commit this folder!

2. **WhatsApp Limits**: Don't spam messages or you might get banned. Use responsibly.

3. **Group Permissions**: For some commands (like `!everyone`), the bot needs to be a group admin.

4. **Rate Limiting**: WhatsApp has rate limits. Don't send too many messages too quickly.

## 🐛 Troubleshooting

### Bot won't connect
- Make sure you're using a regular WhatsApp account (not Business)
- Delete `auth_info/` folder and scan QR again
- Check your internet connection

### QR code not showing
- Make sure terminal supports unicode
- Try running with `printQRInTerminal: true` in index.js

### Bot keeps disconnecting
- Check your internet connection
- Make sure WhatsApp is not open on your phone's browser
- Verify Node.js version is 16+

## 📚 Resources

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [WhatsApp Web API](https://github.com/WhiskeySockets/Baileys/blob/master/WAProto/WAWebProtobufsE2E.proto)

## 🔮 Future Enhancements

Ideas for extending the bot:

- [ ] AI chatbot integration (OpenAI, Gemini)
- [ ] Database integration (Firebase, MongoDB)
- [ ] Admin commands (kick, mute, warn)
- [ ] Custom auto-replies with keywords
- [ ] Media download commands
- [ ] Scheduled messages
- [ ] Analytics and logging
- [ ] Multi-language support

## 📝 License

ISC

## 👨‍💻 Developer

Built with ❤️ using Baileys

---

**Need help?** Type `!help` in WhatsApp or check the documentation above.
