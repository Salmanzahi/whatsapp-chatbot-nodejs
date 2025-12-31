# 📊 Project Architecture

## Directory Structure

```
whatsapp-bot/
│
├── 📄 index.js                    # Main entry point - starts the bot
│   ├── Initializes WhatsApp connection
│   ├── Handles QR code authentication
│   ├── Manages reconnection logic
│   └── Registers event listeners
│
├── 📁 handlers/                   # Event handlers
│   ├── messageHandler.js          # Processes incoming messages
│   │   ├── Extracts message content
│   │   ├── Parses commands
│   │   └── Routes to appropriate command
│   │
│   └── groupHandler.js            # Handles group events
│       ├── Welcome messages
│       ├── Goodbye messages
│       └── Admin promotions/demotions
│
├── 📁 commands/                   # Bot commands (modular)
│   ├── index.js                   # Command registry
│   ├── ping.js                    # Test bot responsiveness
│   ├── help.js                    # Show available commands
│   ├── info.js                    # Bot information
│   ├── sticker.js                 # Convert media to stickers
│   ├── everyone.js                # Tag all group members
│   └── example-quote.js           # Example custom command
│
├── 📁 auth_info/                  # Authentication data (auto-generated)
│   └── [Session files]            # ⚠️ Never commit this folder!
│
├── 📁 node_modules/               # Dependencies
│
├── 📄 package.json                # Project configuration
├── 📄 package-lock.json           # Dependency lock file
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Full documentation
└── 📄 QUICKSTART.md               # Quick start guide
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     WhatsApp Message                        │
│                            ↓                                │
│                      index.js                               │
│                            ↓                                │
│              messages.upsert event                          │
│                            ↓                                │
│                  messageHandler.js                          │
│                            ↓                                │
│              Parse command & arguments                      │
│                            ↓                                │
│                   Find command in                           │
│                   commands/index.js                         │
│                            ↓                                │
│              Execute specific command                       │
│              (ping, help, info, etc.)                       │
│                            ↓                                │
│              Send response to user                          │
└─────────────────────────────────────────────────────────────┘
```

## Command Structure

Every command follows this pattern:

```javascript
export default {
    name: 'commandname',           // Primary command name
    aliases: ['alias1', 'alias2'], // Alternative names
    description: 'What it does',   // Help text
    usage: '!commandname [args]',  // Usage example
    groupOnly: false,              // true = groups only
    
    async execute(sock, msg, args, context) {
        // sock    = WhatsApp socket connection
        // msg     = Full message object
        // args    = Command arguments array
        // context = { from, sender, isGroup }
        
        // Your command logic here
        await sock.sendMessage(context.from, { 
            text: 'Response' 
        });
    }
};
```

## Event Flow

### 1. Connection Events
```
Start Bot → Generate QR → User Scans → Connected
                                      ↓
                              Save Credentials
                                      ↓
                              Bot Ready to Use
```

### 2. Message Events
```
User sends message → messageHandler → Parse command
                                           ↓
                                    Execute command
                                           ↓
                                    Send response
```

### 3. Group Events
```
User joins group → groupHandler → Send welcome
User leaves      → groupHandler → Send goodbye
User promoted    → groupHandler → Congratulate
```

## Key Components

### 1. **Baileys Socket** (`sock`)
- Main WhatsApp connection
- Used to send/receive messages
- Handles all WhatsApp operations

### 2. **Authentication State**
- Stored in `auth_info/` folder
- Contains login session
- Persists across restarts

### 3. **Event Listeners**
- `connection.update` - Connection status
- `creds.update` - Save credentials
- `messages.upsert` - New messages
- `group-participants.update` - Group changes

### 4. **Command System**
- Modular design
- Easy to add new commands
- Centralized registry
- Supports aliases

## Adding New Features

### Add a new command:
1. Create `commands/mycommand.js`
2. Add to `commands/index.js`
3. Restart bot

### Add database:
1. Install: `npm install firebase` or `mongodb`
2. Create `utils/database.js`
3. Import in commands that need it

### Add AI:
1. Install: `npm install openai` or `@google/generative-ai`
2. Create `utils/ai.js`
3. Create command that uses AI

## Security Notes

🔒 **Never commit:**
- `auth_info/` folder
- `.env` files with API keys
- Any credentials

🔒 **Always:**
- Use `.gitignore`
- Keep dependencies updated
- Validate user input
- Rate limit commands

## Performance Tips

⚡ **Optimize:**
- Use async/await properly
- Don't block the event loop
- Cache frequently used data
- Limit message size

⚡ **Monitor:**
- Check memory usage
- Watch for memory leaks
- Log errors properly
- Track command usage

---

**This architecture is designed to be:**
- ✅ Modular - Easy to extend
- ✅ Maintainable - Clear structure
- ✅ Scalable - Can handle growth
- ✅ Reliable - Auto-reconnect
