# 📚 AI Command - Add Knowledge Documentation

## Overview

Command `!ai add-knowledge` memungkinkan user untuk menambahkan knowledge/dokumen ke dalam RAG (Retrieval-Augmented Generation) knowledge base dengan metadata yang terstruktur.

---

## 🎯 Format Command

```
!ai add-knowledge [--role:<role>] [--context:<context>] <isi_knowledge>
```

### **Flags (Opsional)**

| Flag        | Nilai                                  | Deskripsi                                       | Contoh               |
| ----------- | -------------------------------------- | ----------------------------------------------- | -------------------- |
| `--role`    | `user`, `model`, `system`, `assistant` | Menentukan siapa yang berbicara dalam knowledge | `--role:user`        |
| `--context` | `string`                               | Kategori/konteks dari knowledge                 | `--context:greeting` |

### **Auto-Generated Metadata**

Sistem akan otomatis menambahkan:

- `added_at`: Timestamp ISO 8601
- `source`: "whatsapp"

---

## 💡 Contoh Penggunaan

### **1. Basic - Tanpa Flags**

```
!ai add-knowledge Nama saya Salman
```

**Hasil:**

- Text: "Nama saya Salman"
- Metadata: `{ added_at, source: "whatsapp" }`

---

### **2. Dengan Role**

```
!ai add-knowledge --role:user Saya suka programming Python
```

**Hasil:**

- Text: "Saya suka programming Python"
- Metadata: `{ role: "user", added_at, source: "whatsapp" }`

---

### **3. Dengan Context**

```
!ai add-knowledge --context:facts Python adalah bahasa pemrograman yang populer
```

**Hasil:**

- Text: "Python adalah bahasa pemrograman yang populer"
- Metadata: `{ context: "facts", added_at, source: "whatsapp" }`

---

### **4. Dengan Role + Context (Full)**

```
!ai add-knowledge --role:model --context:greeting Halo! Saya adalah AI assistant yang siap membantu Anda
```

**Hasil:**

- Text: "Halo! Saya adalah AI assistant yang siap membantu Anda"
- Metadata:
  ```json
  {
    "role": "model",
    "context": "greeting",
    "added_at": "2025-12-30T12:00:00.000Z",
    "source": "whatsapp"
  }
  ```

---

### **5. Multi-Word Context**

```
!ai add-knowledge --context:company-info PT Sixteen AI adalah perusahaan teknologi
```

**Hasil:**

- Text: "PT Sixteen AI adalah perusahaan teknologi"
- Metadata: `{ context: "company-info", added_at, source: "whatsapp" }`

---

## 📋 Use Cases

### **Personal Information**

```
!ai add-knowledge --role:user --context:personal Nama saya Salman dan saya tinggal di Jakarta
!ai add-knowledge --role:user --context:personal Hobi saya adalah coding dan membaca
!ai add-knowledge --role:user --context:personal Saya bekerja sebagai software engineer
```

### **AI Personality/Responses**

```
!ai add-knowledge --role:model --context:greeting Selamat pagi! Ada yang bisa saya bantu?
!ai add-knowledge --role:model --context:farewell Terima kasih sudah chat! Sampai jumpa lagi
!ai add-knowledge --role:model --context:personality Saya adalah AI yang ramah dan suka membantu
```

### **Facts & Knowledge Base**

```
!ai add-knowledge --context:tech-facts JavaScript adalah bahasa pemrograman untuk web
!ai add-knowledge --context:company-info Sixteen AI didirikan pada tahun 2024
!ai add-knowledge --context:product-info Kami menyediakan layanan AI chatbot
```

### **System Instructions**

```
!ai add-knowledge --role:system --context:rules Selalu jawab dalam bahasa Indonesia
!ai add-knowledge --role:system --context:rules Gunakan emoji untuk membuat respons lebih menarik
!ai add-knowledge --role:system --context:rules Jika tidak tahu jawaban, katakan dengan jujur
```

---

## ✅ Response Format

Ketika knowledge berhasil ditambahkan, user akan menerima konfirmasi:

```
✅ Knowledge berhasil ditambahkan!

📄 Content: Nama saya Salman

📋 Metadata:
  • Role: user
  • Context: personal
  • Source: whatsapp
  • Added: 30/12/2025, 12:00:00

🔑 Document ID: abc123-def456-ghi789

⏱ Response time: 234ms
```

---

## ❌ Error Handling

### **1. Knowledge Kosong**

```
!ai add-knowledge
```

**Error:**

```
❌ Knowledge content tidak boleh kosong!

📖 Format:
!ai add-knowledge [--role:<role>] [--context:<context>] <isi_knowledge>

📋 Flags (opsional):
--role:<user|model|system|assistant> - Siapa yang bicara
--context:<string> - Konteks/kategori knowledge

💡 Contoh:
!ai add-knowledge Nama saya Salman
!ai add-knowledge --role:user Saya suka programming
!ai add-knowledge --role:model --context:greeting Halo! Saya AI assistant
!ai add-knowledge --context:facts Python adalah bahasa pemrograman
```

### **2. Role Invalid**

```
!ai add-knowledge --role:admin Halo
```

**Error:**

```
❌ Role tidak valid: "admin"

📋 Role yang tersedia: user, model, system, assistant

Contoh: !ai add-knowledge --role:user Halo
```

### **3. Content Kosong (Hanya Flags)**

```
!ai add-knowledge --role:user --context:greeting
```

**Error:**

```
❌ Isi knowledge tidak boleh kosong!

Contoh: !ai add-knowledge --role:user Nama saya Salman
```

---

## 🔧 Technical Details

### **Data Flow**

1. **User Input** → WhatsApp Bot

   ```
   !ai add-knowledge --role:user --context:personal Nama saya Salman
   ```

2. **Parser** → `parseKnowledgeCommand()`

   - Extract flags: `{ role: "user", context: "personal" }`
   - Extract text: "Nama saya Salman"
   - Build metadata
   - Create JSON payload

3. **Payload to Bridge**

   ```json
   {
     "text": "Nama saya Salman",
     "metadata": {
       "role": "user",
       "context": "personal",
       "added_at": "2025-12-30T12:00:00.000Z",
       "source": "whatsapp"
     }
   }
   ```

4. **Python Backend** → `rag_system.py`

   - Parse JSON payload
   - Generate embedding vector
   - Store to ChromaDB
   - Return document ID

5. **Response to User**
   - Formatted confirmation message
   - Show metadata
   - Show document ID
   - Show response time

---

## 🎨 Best Practices

### **1. Use Descriptive Contexts**

✅ Good:

```
--context:company-info
--context:product-features
--context:user-preferences
```

❌ Bad:

```
--context:misc
--context:stuff
--context:data
```

### **2. Choose Appropriate Roles**

- `user`: Informasi tentang user
- `model`: Cara AI harus merespons
- `system`: Instruksi sistem/aturan
- `assistant`: Alternatif untuk `model`

### **3. Keep Knowledge Atomic**

✅ Good (satu knowledge per command):

```
!ai add-knowledge --context:personal Nama saya Salman
!ai add-knowledge --context:personal Saya tinggal di Jakarta
```

❌ Bad (terlalu banyak info):

```
!ai add-knowledge Nama saya Salman, tinggal di Jakarta, hobi coding, bekerja sebagai engineer
```

### **4. Use Consistent Naming**

Gunakan naming convention yang konsisten untuk context:

- `kebab-case`: `user-info`, `company-data`
- Lowercase: `greeting`, `farewell`
- Descriptive: `product-features` bukan `pf`

---

## 🔍 Related Commands

### **List Knowledge**

```
!ai list-knowledge
```

Menampilkan semua knowledge yang tersimpan.

### **Delete Knowledge**

```
!ai delete-knowledge <doc_id>
```

Menghapus knowledge berdasarkan document ID.

---

## 📊 Metadata Schema

```typescript
interface KnowledgeMetadata {
  role?: "user" | "model" | "system" | "assistant"; // Optional
  context?: string; // Optional
  added_at: string; // ISO 8601 timestamp (auto)
  source: "whatsapp"; // Auto-generated
}
```

---

## 🚀 Advanced Usage

### **Batch Adding Knowledge**

```
!ai add-knowledge --role:user --context:skills Saya bisa JavaScript
!ai add-knowledge --role:user --context:skills Saya bisa Python
!ai add-knowledge --role:user --context:skills Saya bisa React
```

### **Creating AI Personality**

```
!ai add-knowledge --role:model --context:tone Gunakan bahasa yang santai dan friendly
!ai add-knowledge --role:model --context:tone Tambahkan emoji untuk membuat percakapan lebih hidup
!ai add-knowledge --role:model --context:behavior Jika user bertanya tentang Salman, gunakan knowledge base
```

### **Building FAQ**

```
!ai add-knowledge --context:faq Jam operasional kami adalah 09:00 - 17:00 WIB
!ai add-knowledge --context:faq Kami melayani konsultasi gratis untuk project baru
!ai add-knowledge --context:faq Hubungi kami di email: contact@sixteen.ai
```

---

## 🎯 Summary

**Command:** `!ai add-knowledge [flags] <text>`

**Flags:**

- `--role:<user|model|system|assistant>` (optional)
- `--context:<string>` (optional)

**Auto Metadata:**

- `added_at`: ISO timestamp
- `source`: "whatsapp"

**Response:** Detailed confirmation with metadata and document ID

**Use Cases:** Personal info, AI personality, facts, system rules, FAQ
