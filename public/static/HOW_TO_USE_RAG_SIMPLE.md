# How to Use RAG - Super Simple Guide

## The 3-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│                     STEP 1: ADD DOCUMENTS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Copy your company documents to this folder:                │
│  /home/user/webapp/company-docs/                            │
│                                                             │
│  Examples:                                                  │
│  • Refund policy (PDF)                                      │
│  • Call scripts (Word document)                             │
│  • Training manual (Text file)                              │
│  • Product guides (PDF)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  STEP 2: INDEX DOCUMENTS                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Open Terminal and run these 2 commands:                    │
│                                                             │
│  1. cd /home/user/webapp                                    │
│  2. python3 scripts/document_indexer.py                     │
│                                                             │
│  Wait 10-30 seconds until you see:                          │
│  ✅ Index created successfully!                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      STEP 3: USE IT!                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  The AI now automatically references your documents         │
│  when giving coaching suggestions!                          │
│                                                             │
│  Start a live session and speak as a customer.              │
│  The AI will quote your company policies.                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Visual Explanation: How RAG Works

### WITHOUT RAG (Before):
```
┌──────────────┐
│  Customer:   │  "My package is damaged"
│  You say...  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│      AI      │  Thinks: "What should I say?"
│   (Generic)  │  Uses: General knowledge only
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Coaching   │  "Offer to help resolve the issue"
│  (Generic)   │  ← Not specific to YOUR company!
└──────────────┘
```

### WITH RAG (After):
```
┌──────────────┐
│  Customer:   │  "My package is damaged"
│  You say...  │
└──────┬───────┘
       │
       ↓
┌──────────────┐      ┌─────────────────────┐
│      AI      │ ───→ │  YOUR DOCUMENTS     │
│  (Smart!)    │ ←─── │  • Refund policy    │
└──────┬───────┘      │  • Call scripts     │
       │              │  • Training manual  │
       │              └─────────────────────┘
       │              AI searches and finds
       │              relevant company policy!
       ↓
┌──────────────┐
│   Coaching   │  "Per damaged item policy (page 3):
│  (Specific)  │   Issue immediate refund, no return.
│              │   Say: 'I'm processing your refund
│              │   right now. You'll see it in 3-5 days.'"
└──────────────┘   ← Quotes YOUR exact policy!
```

---

## Where to Find the Documents I Made

### Option 1: Dashboard (Easiest)
```
1. Open the coaching dashboard
2. Click Settings button (⚙️) in top right
3. Look for purple box: "Company Documents (RAG)"
4. Click "Setup Guide" for full instructions
5. Click "Open Folder" to see file location
```

### Option 2: File Explorer (Direct)
```
1. Open your file manager/finder
2. Navigate to: /home/user/webapp/company-docs/
3. You'll see 4 files:
   • amazon_refund_policy.md
   • customer_service_scripts.md  
   • shipping_policies.txt
   • empathy_coaching.md
```

---

## How to Add Your Own Documents

### What Files Can You Add?
- ✅ Word documents (.doc, .docx)
- ✅ PDF files (.pdf)
- ✅ Text files (.txt)
- ✅ Markdown files (.md)

### Step-by-Step:

**1. Find the Folder:**
```
Navigate to: /home/user/webapp/company-docs/
```

**2. Copy Your Files:**
```
Drag and drop your company documents into this folder
OR
Copy-paste them from wherever they're saved
```

**3. What to Put:**
```
✅ GOOD:
• Customer service policies
• Refund/return procedures
• Call scripts
• Product knowledge guides
• Training manuals
• FAQ documents

❌ NOT GOOD:
• Personal files
• Images/photos
• Spreadsheets (Excel won't work)
• Presentations (PowerPoint won't work)
```

**4. Optional - Delete Samples:**
```
You can delete the 4 sample documents I created
(They're just Amazon examples)
OR keep them as reference
```

---

## How to Index (Make Documents Searchable)

Think of indexing like creating a table of contents for a book - it makes everything searchable!

### Before You Start:
```
Make sure Ollama is running:
• Look for Ollama icon in your taskbar
• OR open Terminal and type: ollama serve
```

### Indexing Steps:

**1. Open Terminal**
```
Mac: Press Cmd+Space, type "Terminal", press Enter
Windows: Press Win+R, type "cmd", press Enter
Linux: Press Ctrl+Alt+T
```

**2. Copy and Paste These Commands:**
```bash
cd /home/user/webapp
```
Press Enter, then:
```bash
python3 scripts/document_indexer.py
```
Press Enter

**3. Wait and Watch:**
You'll see messages like this:
```
🚀 LlamaIndex Document Indexer...
📦 Checking for model...
✅ Model available
📂 Loading documents...
📄 Found 5 document(s)
🔨 Creating index...
✅ Index created successfully!
```

**This means it worked! ✅**

---

## How to Test If It's Working

### Quick Test (Terminal):

**1. Open Terminal**

**2. Run this command:**
```bash
python3 scripts/query_documents.py "What's our refund policy?"
```

**3. You should see:**
```
🔍 Query: What's our refund policy?

📄 Response:
[Actual text from your document about refunds]

📚 Sources:
  [1] your_refund_policy.pdf (score: 0.92)
```

**If you see this = IT WORKS! ✅**

### Real Test (Dashboard):

**1. Start a Live Session:**
- Click "Start Session" button
- Allow microphone access

**2. Speak as a Customer:**
Say something that matches your documents, like:
- "My package is damaged"
- "I want a refund"
- "My order is late"

**3. Watch the Coaching:**
The AI coaching should now quote your actual company policy!

**Before RAG:**
> "Consider offering a refund"

**After RAG:**
> "Per our refund policy section 2: Issue immediate refund for damaged items. Say: 'I'm processing your refund right now.'"

---

## When Do You Need to Re-Index?

Run the indexer again whenever you:
- ✅ Add new documents
- ✅ Update existing documents
- ✅ Delete documents
- ✅ Change document content

**Just run the same command:**
```bash
python3 scripts/document_indexer.py
```

---

## Common Issues & Fixes

### "Model not found: nomic-embed-text"
**Fix:**
```bash
ollama pull nomic-embed-text
```
Wait 5 minutes, then try indexing again.

---

### "No documents found"
**Fix:**
1. Check files are in `/home/user/webapp/company-docs/`
2. Check file types (.pdf, .doc, .txt, .md only)
3. Make sure files aren't empty

---

### "Ollama connection failed"
**Fix:**
```bash
ollama serve
```
Leave this running, then try indexing in a new terminal window.

---

### AI Not Using My Documents
**Possible reasons:**
1. Documents not indexed yet → Run indexer
2. Customer's words don't match document content
3. Ollama not running → Start it with `ollama serve`

---

## Real Example

**Scenario:** You run TechGadgets store

**What You Do:**

**Step 1 - Add Documents:**
```
Copy to company-docs/:
• TechGadgets_Warranty_Policy.pdf
• TechGadgets_Returns.docx
• TechGadgets_Call_Scripts.txt
```

**Step 2 - Index:**
```bash
cd /home/user/webapp
python3 scripts/document_indexer.py
```

**Step 3 - Test:**
Start session, say: "My phone screen is cracked"

**AI Coaching:**
```
Per TechGadgets Warranty Policy (Section 3.2):
Screen damage within 30 days = free replacement

Say: "I'm so sorry about your screen. Per our 
warranty, I'm sending a replacement phone with 
overnight shipping at no charge. You'll have it 
tomorrow."
```

**See?** AI quotes YOUR warranty policy!

---

## Quick Reference

### 📁 Documents Folder:
```
/home/user/webapp/company-docs/
```

### 🔧 Index Command:
```bash
cd /home/user/webapp
python3 scripts/document_indexer.py
```

### 🧪 Test Command:
```bash
python3 scripts/query_documents.py "your question"
```

---

## That's It!

**3 simple steps:**
1. **Add** documents to folder
2. **Index** with one command
3. **Use** - AI automatically references them!

**Need more detail?** Read `RAG_FOR_NON_CODERS.md` for the full guide.

---

## Summary Checklist

- [ ] I found the company-docs folder
- [ ] I added my company's documents
- [ ] I opened Terminal
- [ ] I ran the indexer command
- [ ] I saw "✅ Index created successfully!"
- [ ] I tested with a query command
- [ ] I tested in the live dashboard
- [ ] AI coaching now quotes my policies! 🎉

**You're done!** The RAG system is working with your documents.
