# 🚀 Quick Start Guide

## Step 1: Start the Bot

```bash
npm start
```

## Step 2: Scan QR Code

1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to: **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code from your terminal

## Step 3: Test the Bot

Once connected, try these commands:

### In Private Chat:
- Send: `!ping` → Bot replies with "Pong!"
- Send: `!help` → See all commands
- Send: `!info` → Get bot information

### In Group Chat:
1. Add the bot's number to a WhatsApp group
2. Try these commands:
   - `!ping` → Test responsiveness
   - `!help` → List all commands
   - `!everyone Hello team!` → Tag all members
   - `!info` → Bot details

## Step 4: Keep Bot Running 24/7 (Optional)

### Option A: Using PM2 (Recommended for VPS)
```bash
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup
```

### Option B: Just keep terminal open
```bash
npm start
```

## 🎯 Next Steps

1. **Add Custom Commands**: Create new files in `commands/` folder
2. **Customize Responses**: Edit existing command files
3. **Add AI Integration**: Connect to OpenAI, Gemini, etc.
4. **Database**: Add Firebase or MongoDB for data storage
5. **Deploy**: Host on VPS for 24/7 operation

## ⚠️ Important Notes

- **Don't spam**: WhatsApp may ban your number
- **Keep auth_info/ safe**: This folder contains your login session
- **Group permissions**: Bot needs admin rights for some commands
- **Rate limits**: Don't send too many messages too quickly

## 🐛 Troubleshooting

### Bot won't connect?
```bash
# Delete auth folder and try again
rm -rf auth_info
npm start
```

### QR code not showing?
- Check if your terminal supports unicode
- Try a different terminal (Windows Terminal, iTerm2, etc.)

### Bot keeps disconnecting?
- Check internet connection
- Make sure WhatsApp isn't open in browser
- Verify Node.js version: `node --version` (should be v16+)

## 📞 Need Help?

Check the main [README.md](README.md) for detailed documentation.

---

**Ready to build something awesome? Let's go! 🚀**
