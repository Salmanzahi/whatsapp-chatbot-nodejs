# 🚀 Modular Command System

## 📁 File Structure

```
whatsapp-bot/
├── commands/
│   ├── ai.js                    # Main AI command (current version)
│   ├── ai.refactored.js         # Refactored version using utils
│   ├── translate.example.js     # Example multi-param command
│   └── index.js                 # Command registry
├── utils/
│   └── commandUtils.js          # Reusable utility functions
├── docs/
│   └── AI_COMMAND_GUIDE.md      # AI command documentation
└── triggertest.js               # Bridge communication
```

---

## 🎯 Quick Start

### Using Current AI Command

**Syntax:**

```
!ai <mode> <message>
```

**Examples:**

```
!ai 1 Halo, apa kabar?
!ai 2 Jelaskan tentang JavaScript
!ai 3 Buatkan puisi tentang coding
```

**Available Modes:**

- 💬 Mode 1: Standard Chat
- 🧠 Mode 2: RAG Enhanced
- 🎨 Mode 3: Creative Mode

---

## 🛠️ Creating New Commands

### Method 1: Simple Command (No Utils)

```javascript
export default {
  name: "mycommand",
  aliases: ["mc"],
  description: "My custom command",
  usage: "!mycommand <arg1> <arg2>",

  async execute(sock, msg, args, context) {
    // Your logic here
    await sock.sendMessage(context.from, {
      text: "Response",
    });
  },
};
```

### Method 2: Using Command Utils (Recommended)

```javascript
import {
  parseCommandArgs,
  createErrorMessage,
  createSuccessMessage,
} from "../utils/commandUtils.js";

const SCHEMA = {
  params: [
    {
      name: "param1",
      type: "number",
      required: true,
    },
    {
      name: "param2",
      type: "string",
      required: true,
      takeRest: true,
    },
  ],
};

export default {
  name: "mycommand",

  async execute(sock, msg, args, context) {
    const parsed = parseCommandArgs(args, SCHEMA);

    if (!parsed.isValid) {
      await sock.sendMessage(context.from, {
        text: createErrorMessage("Invalid input", parsed.errors.join("\n")),
      });
      return;
    }

    // Use parsed.params.param1, parsed.params.param2
  },
};
```

---

## 📚 Available Utilities

### 1. **parseCommandArgs(args, schema)**

Parse dan validasi command arguments dengan schema.

```javascript
const schema = {
  params: [
    {
      name: "mode",
      type: "number", // "string" | "number"
      required: true,
      validate: (v) => v >= 1 && v <= 3,
      errorMessage: "Mode must be 1-3",
    },
    {
      name: "content",
      type: "string",
      required: true,
      takeRest: true, // Ambil semua argumen sisanya
      minLength: 1,
    },
  ],
};
```

### 2. **createErrorMessage(title, details, examples)**

Buat error message dengan format konsisten.

```javascript
createErrorMessage("Format salah!", "Gunakan: !ai <mode> <pesan>", [
  "!ai 1 Hello",
  "!ai 2 Test",
]);
```

### 3. **createSuccessMessage(emoji, title, content, footer)**

Buat success message dengan format konsisten.

```javascript
createSuccessMessage("✅", "Success", "Your message here", "⚡ 123ms");
```

### 4. **validateMode(mode, modesConfig)**

Validasi mode dengan config object.

```javascript
const modes = {
  1: { name: "Mode 1", emoji: "💬" },
  2: { name: "Mode 2", emoji: "🧠" },
};

const result = validateMode("1", modes);
// { isValid: true, mode: 1, modeInfo: {...} }
```

### 5. **sendTypingIndicator(sock, jid, duration)**

Kirim typing indicator.

```javascript
await sendTypingIndicator(sock, context.from, 3000);
```

### 6. **formatDuration(ms)**

Format milliseconds ke human-readable.

```javascript
formatDuration(1234); // "1.2s"
formatDuration(500); // "500ms"
```

### 7. **CommandLogger**

Logger dengan timestamp.

```javascript
CommandLogger.log("ai", userId, args, "success");
CommandLogger.error("ai", userId, error);
```

---

## 🔄 Migration Guide

### Migrating to Refactored Version

1. **Backup current ai.js:**

   ```bash
   cp commands/ai.js commands/ai.backup.js
   ```

2. **Replace with refactored version:**

   ```bash
   cp commands/ai.refactored.js commands/ai.js
   ```

3. **Test the command:**
   ```
   !ai 1 Test message
   ```

---

## 📖 Best Practices

### 1. **Always Validate Input**

```javascript
if (args.length < 2) {
  // Send error message
  return;
}
```

### 2. **Use Typing Indicators**

```javascript
await sendTypingIndicator(sock, context.from);
```

### 3. **Log Command Execution**

```javascript
CommandLogger.log("commandName", context.sender, args, "success");
```

### 4. **Handle Errors Gracefully**

```javascript
try {
  // Your logic
} catch (error) {
  CommandLogger.error("commandName", context.sender, error);
  // Send user-friendly error message
}
```

### 5. **Use Consistent Message Format**

```javascript
// Use createErrorMessage and createSuccessMessage
// instead of raw strings
```

---

## 🎨 Adding New AI Modes

Edit `commands/ai.js`:

```javascript
const AI_MODES = {
  // ... existing modes
  4: {
    name: "Code Assistant",
    description: "Help with coding questions",
    emoji: "👨‍💻",
  },
};
```

**Important:** Make sure your Python backend supports the new mode!

---

## 🧪 Testing

### Test AI Command

```bash
# Make sure servers are running:
# 1. Node.js bridge (port 3000)
# 2. Python backend (port 8000)

# Then send WhatsApp message:
!ai 1 Hello
!ai 2 Explain JavaScript
```

### Test with triggertest.js

```javascript
// Uncomment the test code in triggertest.js
const dataTes = "Test message";
const modeSelection = 2;

(async () => {
  const result = await sendToBridge(dataTes, modeSelection);
  console.log(result);
})();
```

---

## 📊 Command Flow

```
User sends: !ai 2 Hello AI
        ↓
messageHandler.js
        ↓
Parse: command="ai", args=["2", "Hello", "AI"]
        ↓
commands/ai.js execute()
        ↓
parseArguments(args)
        ↓
Validate: mode=2, content="Hello AI"
        ↓
sendToBridge(content, mode)
        ↓
bridge.js → Python backend
        ↓
Response received
        ↓
formatResponse()
        ↓
Send to WhatsApp user ✅
```

---

## 🐛 Troubleshooting

### Command not working?

1. **Check if command is registered:**

   ```javascript
   // In commands/index.js
   import ai from "./ai.js";
   export const commands = [ai, ...];
   ```

2. **Check server status:**

   - Node.js bridge running on port 3000?
   - Python backend running on port 8000?

3. **Check logs:**
   - Console output for errors
   - CommandLogger output

### Invalid mode error?

- Make sure mode exists in `AI_MODES`
- Check if backend supports the mode
- Verify mode is a number (1, 2, 3, not "one", "two")

---

## 📝 Future Enhancements

- [ ] Rate limiting per user
- [ ] Command cooldowns
- [ ] User permissions system
- [ ] Command analytics
- [ ] Multi-language support
- [ ] Attachment support (images, documents)
- [ ] Command aliases with parameters
- [ ] Auto-complete suggestions

---

## 🔗 Related Documentation

- [AI Command Guide](./AI_COMMAND_GUIDE.md) - Detailed AI command docs
- [Command Utils API](../utils/commandUtils.js) - Utility functions
- [Example Commands](../commands/translate.example.js) - Templates

---

**Last Updated:** 2025-12-29  
**Version:** 2.0.0  
**Maintainer:** Development Team
