# 🎯 Add Knowledge Command - Quick Reference

## Basic Syntax

```
!ai add-knowledge [--role:<role>] [--context:<context>] <knowledge_text>
```

---

## 📝 Examples

### Simple

```
!ai add-knowledge Nama saya Salman
```

### With Role

```
!ai add-knowledge --role:user Saya suka programming
```

### With Context

```
!ai add-knowledge --context:facts Python adalah bahasa pemrograman
```

### Full (Role + Context)

```
!ai add-knowledge --role:model --context:greeting Halo! Saya AI assistant
```

---

## 🏷️ Valid Roles

- `user` - User information
- `model` - AI responses/personality
- `system` - System instructions
- `assistant` - Alternative to model

---

## 📂 Context Examples

- `personal` - Personal information
- `greeting` - Greeting messages
- `farewell` - Goodbye messages
- `facts` - General facts
- `company-info` - Company information
- `product-info` - Product details
- `skills` - User skills
- `preferences` - User preferences
- `faq` - Frequently asked questions
- `rules` - System rules

---

## ✅ Success Response

```
✅ Knowledge berhasil ditambahkan!

📄 Content: Nama saya Salman

📋 Metadata:
  • Role: user
  • Context: personal
  • Source: whatsapp
  • Added: 30/12/2025, 12:00:00

🔑 Document ID: abc123-def456

⏱ Response time: 234ms
```

---

## ❌ Common Errors

### Empty Knowledge

```
!ai add-knowledge
→ ❌ Knowledge content tidak boleh kosong!
```

### Invalid Role

```
!ai add-knowledge --role:admin Halo
→ ❌ Role tidak valid: "admin"
```

### Only Flags, No Content

```
!ai add-knowledge --role:user
→ ❌ Isi knowledge tidak boleh kosong!
```

---

## 🎨 Use Case Templates

### Personal Info

```bash
!ai add-knowledge --role:user --context:personal Nama saya [NAMA]
!ai add-knowledge --role:user --context:personal Saya tinggal di [KOTA]
!ai add-knowledge --role:user --context:personal Hobi saya [HOBI]
```

### AI Personality

```bash
!ai add-knowledge --role:model --context:tone Gunakan bahasa [STYLE]
!ai add-knowledge --role:model --context:greeting [GREETING_MESSAGE]
!ai add-knowledge --role:model --context:farewell [FAREWELL_MESSAGE]
```

### Company/Product

```bash
!ai add-knowledge --context:company-info [COMPANY_NAME] didirikan tahun [YEAR]
!ai add-knowledge --context:product-info Kami menyediakan [SERVICE]
!ai add-knowledge --context:faq Jam operasional: [HOURS]
```

---

## 🔗 Related Commands

| Command                     | Description                    |
| --------------------------- | ------------------------------ |
| `!ai list-knowledge`        | List all knowledge             |
| `!ai delete-knowledge <id>` | Delete knowledge by ID         |
| `!ai <message>`             | Chat with RAG (uses knowledge) |

---

## 💡 Pro Tips

1. **Keep it atomic** - One fact per command
2. **Use consistent contexts** - Stick to naming convention
3. **Add role for clarity** - Helps AI understand perspective
4. **Use descriptive contexts** - Makes searching easier
5. **Save document IDs** - For future deletion

---

## 🚀 Quick Start

1. Add your name:

   ```
   !ai add-knowledge --role:user --context:personal Nama saya [NAMA]
   ```

2. Add AI greeting:

   ```
   !ai add-knowledge --role:model --context:greeting Halo! Ada yang bisa saya bantu?
   ```

3. Test it:

   ```
   !ai Siapa nama saya?
   ```

4. See the magic! ✨
