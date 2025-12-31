# AI Command - Developer Guide

## 📖 Overview

Command AI yang modular untuk WhatsApp bot dengan support multiple modes dan easy maintenance.

## 🎯 Syntax

```
!ai <mode> <content>
```

### Examples:

```
!ai 1 Halo, apa kabar?
!ai 2 Jelaskan tentang JavaScript
!ai 3 Buatkan puisi tentang coding
```

---

## 🔧 Architecture

### 1. **AI_MODES Configuration**

Lokasi: `commands/ai.js` (Line 8-26)

```javascript
const AI_MODES = {
  1: {
    name: "Standard Chat",
    description: "Mode percakapan standar",
    emoji: "💬",
  },
  2: {
    name: "RAG Enhanced",
    description: "Mode dengan RAG system",
    emoji: "🧠",
  },
  // Add more modes here
};
```

**Cara menambah mode baru:**

```javascript
3: {
  name: "Your Mode Name",
  description: "Mode description",
  emoji: "🎨",
},
```

### 2. **parseArguments() Function**

Fungsi untuk parse dan validasi input dari user.

**Input:** `args` array dari messageHandler
**Output:**

```javascript
{
  isValid: boolean,
  mode: number,
  content: string,
  modeInfo: object,
  error: string // jika isValid = false
}
```

**Validasi yang dilakukan:**

- ✅ Minimal 2 argumen (mode & content)
- ✅ Mode harus berupa angka valid
- ✅ Mode harus terdaftar di AI_MODES
- ✅ Content tidak boleh kosong

### 3. **formatResponse() Function**

Fungsi untuk format response dari Python backend.

**Customization:**
Ubah fungsi ini jika struktur response dari Python berubah.

```javascript
function formatResponse(data, modeInfo) {
  // Customize sesuai kebutuhan
  const message = data.message || data.hasil_python || JSON.stringify(data);
  return `${modeInfo.emoji} *${modeInfo.name}*\n\n${message}`;
}
```

---

## 🔄 Flow Diagram

```
User mengirim: !ai 2 Halo AI
        ↓
messageHandler.js parse command
        ↓
args = ["2", "Halo", "AI"]
        ↓
parseArguments(args)
        ↓
Validasi: mode=2, content="Halo AI"
        ↓
sendToBridge(content, mode)
        ↓
bridge.js → Python backend
        ↓
Response dari Python
        ↓
formatResponse(data, modeInfo)
        ↓
Kirim ke WhatsApp user
```

---

## 🛠️ Maintenance Guide

### Adding New Mode

1. Buka `commands/ai.js`
2. Tambahkan mode baru di `AI_MODES` object
3. Pastikan backend Python support mode tersebut
4. Update `usage` description jika perlu

**Example:**

```javascript
const AI_MODES = {
  // ... existing modes
  4: {
    name: "Code Assistant",
    description: "Mode untuk bantuan coding",
    emoji: "👨‍💻",
  },
};
```

### Modifying Validation Rules

Edit fungsi `parseArguments()` sesuai kebutuhan:

- Ubah minimal argumen
- Tambah validasi custom
- Ubah error messages

### Customizing Response Format

Edit fungsi `formatResponse()`:

- Ubah template message
- Tambah informasi tambahan
- Customize per mode

---

## 🐛 Error Handling

### 1. Invalid Format

```
User: !ai
Response: ❌ Format salah! [dengan panduan]
```

### 2. Invalid Mode

```
User: !ai 99 Halo
Response: ❌ Mode tidak valid [dengan daftar mode]
```

### 3. Empty Content

```
User: !ai 1
Response: ❌ Pesan tidak boleh kosong!
```

### 4. Bridge Connection Error

```
Response: ❌ Maaf, terjadi kesalahan [dengan troubleshooting tips]
```

---

## 📊 Features

✅ **Modular Design** - Easy to add new modes
✅ **Input Validation** - Comprehensive error checking
✅ **User Feedback** - Clear error messages & typing indicators
✅ **Performance Tracking** - Response time logging
✅ **Extensible** - Easy to customize and extend

---

## 🔗 Related Files

- `commands/ai.js` - Main command file
- `triggertest.js` - Bridge communication function
- `bridge.js` - Node.js bridge server
- `bridge.py` - Python backend
- `handlers/messageHandler.js` - Command parser

---

## 💡 Tips

1. **Testing New Modes**: Uncomment test code di `triggertest.js` untuk testing
2. **Logging**: Check console untuk debug info
3. **Backend Sync**: Pastikan mode di frontend match dengan backend
4. **Error Messages**: Keep them user-friendly dan informatif

---

## 📝 Future Enhancements

Ide untuk pengembangan selanjutnya:

- [ ] Add mode aliases (e.g., "rag" → mode 2)
- [ ] Support untuk attachment (image, document)
- [ ] Rate limiting per user
- [ ] Command history tracking
- [ ] Multi-language support
- [ ] Custom mode per group/user

---

**Last Updated:** 2025-12-29
**Maintainer:** Developer Team
