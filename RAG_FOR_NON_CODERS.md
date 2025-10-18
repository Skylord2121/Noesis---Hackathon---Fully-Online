# RAG System - Explained for Non-Coders

## What is RAG? (In Plain English)

**RAG = Retrieval-Augmented Generation**

Think of it like giving the AI a **filing cabinet of your company's instruction manuals**.

### Without RAG:
```
You: "My package is damaged"
AI: "I'll help you with that" (generic response)
```

### With RAG:
```
You: "My package is damaged"
AI: *looks through your company's refund policy document*
AI: "According to our damaged item policy on page 3: Issue immediate 
     refund without requiring return. Say: 'I'm so sorry your item 
     arrived damaged. Let me process an immediate refund right now.'"
```

**The AI quotes your actual company policies instead of making things up!**

---

## How Does It Work? (Simple Version)

### Step 1: You Add Documents
Put your company documents in a special folder, like:
- Refund policy
- Customer service scripts
- Shipping guidelines
- Training materials

### Step 2: The System "Reads" Them
A program converts your documents into a searchable database (like indexing a book).

### Step 3: AI Uses Them in Real-Time
When a customer says something, the AI:
1. Understands what they need help with
2. Searches your documents for relevant info
3. Quotes the exact policy or procedure
4. Gives coaching based on YOUR company's rules

---

## Where Are the Documents You Made?

### 📁 Location: `/home/user/webapp/company-docs/`

**I created 4 sample documents for you:**

1. **amazon_refund_policy.md** - Refund procedures, when to give credits, escalation rules
2. **customer_service_scripts.md** - Opening greetings, de-escalation techniques, empathy phrases
3. **shipping_policies.txt** - Delivery times, what to do for late packages, tracking help
4. **empathy_coaching.md** - The A.P.O.L.O.G.Y. framework, handling angry customers

**These are Amazon examples - you should replace them with YOUR company's documents!**

---

## How to Find the Documents

### Method 1: Through the Dashboard
1. Open the coaching dashboard
2. Click the **Settings** button (⚙️ gear icon in top right)
3. Look for the purple **"Company Documents (RAG)"** section
4. Click **"Open Folder"** button
5. It will show you the path: `/home/user/webapp/company-docs/`

### Method 2: Through File Explorer
1. Open your file manager
2. Navigate to: `/home/user/webapp/company-docs/`
3. You'll see the 4 sample documents I created

### Method 3: View the Setup Guide
1. In the dashboard, click **Settings** (⚙️)
2. In the **"Company Documents (RAG)"** section
3. Click **"Setup Guide"** button
4. This opens the complete documentation with screenshots and examples

---

## How to Add Your Own Documents

### What Types of Files Can You Add?

✅ **Text files** - `.txt`  
✅ **Word documents** - `.doc`, `.docx`  
✅ **PDFs** - `.pdf`  
✅ **Markdown** - `.md` (like these instructions)

### Step-by-Step Instructions:

#### Step 1: Prepare Your Documents
Gather your company documents:
- Customer service policies
- Refund/return procedures
- Product knowledge guides
- Call scripts and templates
- FAQ documents
- Training materials

#### Step 2: Copy Them to the Folder
```
1. Open your file manager
2. Navigate to: /home/user/webapp/company-docs/
3. Copy your documents into this folder
   (You can drag and drop or copy-paste)
```

**Example:**
```
Before:
company-docs/
├── amazon_refund_policy.md (sample)
├── customer_service_scripts.md (sample)
├── shipping_policies.txt (sample)
└── empathy_coaching.md (sample)

After adding yours:
company-docs/
├── YOUR_refund_policy.pdf
├── YOUR_call_scripts.docx
├── YOUR_product_guide.txt
└── YOUR_training_manual.pdf
```

#### Step 3: Delete or Keep Sample Documents
You can:
- **Delete** the sample Amazon documents (they're just examples)
- **Keep** them as reference (they won't hurt anything)

**To delete:** Just select them and press Delete key

---

## How to "Index" Your Documents (Make Them Searchable)

**"Indexing" = Converting documents into a format the AI can search**

Think of it like creating an index at the back of a book, but automatic!

### Before You Start:

1. **Make sure Ollama is running**
   - You should see the Ollama icon in your taskbar
   - Or open Terminal and type: `ollama serve`

2. **Make sure you have the right model**
   - Open Terminal
   - Type: `ollama pull nomic-embed-text`
   - Press Enter and wait (downloads a special AI model for reading documents)

### Indexing Steps (Easy Way):

#### Step 1: Open Terminal
- On Mac: Press `Cmd + Space`, type "Terminal", press Enter
- On Windows: Press `Win + R`, type "cmd", press Enter
- On Linux: Press `Ctrl + Alt + T`

#### Step 2: Navigate to the Project
Copy and paste this command, then press Enter:
```bash
cd /home/user/webapp
```

#### Step 3: Run the Indexer
Copy and paste this command, then press Enter:
```bash
python3 scripts/document_indexer.py
```

#### Step 4: Wait and Watch
You'll see messages like:
```
🚀 LlamaIndex Document Indexer for Call Center Coaching
📦 Checking for embedding model: nomic-embed-text
✅ Model available
📂 Loading documents from: company-docs/
📄 Found 5 document(s):
   - YOUR_refund_policy.pdf (12.4 KB)
   - YOUR_call_scripts.docx (8.2 KB)
   ...
🔨 Creating vector index...
✅ Index created successfully!
💾 Index saved to: .index/
```

**This takes about 10-30 seconds depending on how many documents you have.**

---

## How to Test If It's Working

### Test 1: Query Documents Directly

#### Step 1: Open Terminal
(Same as before)

#### Step 2: Navigate to Project
```bash
cd /home/user/webapp
```

#### Step 3: Ask a Question
```bash
python3 scripts/query_documents.py "What is our refund policy for damaged items?"
```

#### Expected Result:
```
🔍 Query: What is our refund policy for damaged items?

📄 Response:
For damaged items, customers do NOT need to return the item first.
We issue an immediate refund upon verification. We also cover all
return shipping costs for damaged items. Customers should take
photos of the damage for documentation.

📚 Sources:
  [1] YOUR_refund_policy.pdf (score: 0.89)
  [2] customer_service_scripts.md (score: 0.76)
```

**If you see this, IT'S WORKING! ✅**

### Test 2: Test in the Dashboard

#### Step 1: Start the Dashboard
Make sure the dashboard is running (you should see it in your browser)

#### Step 2: Start a Live Session
1. Click the **"Start Session"** button
2. Allow microphone access if prompted

#### Step 3: Say Something That Matches Your Documents
For example, if you uploaded a refund policy document, say:
- "My package arrived damaged and I want a refund"
- "The item I ordered is broken"
- "I received the wrong product"

#### Step 4: Look at the AI Coaching
The coaching suggestion should now reference your actual company policy!

**Example:**
```
Before RAG:
"Consider offering a refund to resolve the issue"

After RAG (with your documents):
"Per our damaged item policy (page 2, section 3): Issue immediate 
refund without return. Add $15 goodwill credit. Use phrase: 
'I'm so sorry your item arrived damaged. I'm processing a full 
refund right now, and I've added $15 to your account as an apology.'"
```

---

## Troubleshooting

### Problem: "Model not found: nomic-embed-text"

**Solution:**
```bash
# Open Terminal and run:
ollama pull nomic-embed-text
```
Wait for it to download (about 5 minutes), then try indexing again.

---

### Problem: "No documents found"

**Solution:**
1. Check that your files are actually in the `company-docs/` folder
2. Make sure they're the right file types (.txt, .pdf, .doc, .docx, .md)
3. Navigate to the folder and run: `ls company-docs/`
   You should see your files listed

---

### Problem: "Ollama connection failed"

**Solution:**
1. Make sure Ollama is running
2. Open Terminal and type: `ollama serve`
3. You should see "Ollama is running"
4. Try indexing again

---

### Problem: AI Coaching Doesn't Reference My Documents

**Possible Causes:**

1. **Documents not indexed yet**
   - Solution: Run `python3 scripts/document_indexer.py`

2. **Customer's question doesn't match document content**
   - Solution: Make sure your documents contain relevant information
   - Example: If customer says "package damaged" but your document only talks about "returns", the AI might not find a match

3. **Ollama not running**
   - Solution: Start Ollama with `ollama serve`

---

## Quick Reference Card

### 📁 Where Are Documents?
```
/home/user/webapp/company-docs/
```

### 🔧 How to Index Documents?
```bash
cd /home/user/webapp
python3 scripts/document_indexer.py
```

### 🧪 How to Test?
```bash
python3 scripts/query_documents.py "your question here"
```

### 🔄 When to Re-Index?
Every time you:
- Add new documents
- Update existing documents
- Delete documents

---

## What Documents Work Best?

### ✅ Good Document Content:

**Example 1: Refund Policy (Good)**
```
DAMAGED ITEMS POLICY

Procedure:
1. Customer reports damage
2. Ask for photos (optional, not required)
3. Issue immediate refund - DO NOT require return
4. Add $10-$25 goodwill credit
5. File carrier claim (internal, not customer's concern)

Script:
"I'm so sorry your item arrived damaged. I'm processing a full 
refund right now. You don't need to return it - you can keep or 
donate it. I'm also adding a $15 credit to your account as an 
apology for this experience."

Authorization: No manager approval needed for refunds under $200
```

**Why it's good:**
- Clear step-by-step procedure
- Exact phrases to use
- Authorization levels specified
- Easy for AI to quote

---

**Example 2: Call Script (Good)**
```
ANGRY CUSTOMER DE-ESCALATION

Opening:
"I hear you, and I understand you're frustrated. Let me help 
make this right."

What NOT to say:
❌ "Calm down"
❌ "Our policy says..."
❌ "You need to..."

What TO say:
✅ "I'm going to fix this right now"
✅ "You have every right to be upset"
✅ "This is our mistake, not yours"

Action Steps:
1. Let customer vent completely (don't interrupt)
2. Acknowledge their frustration specifically
3. Take ownership immediately
4. Offer solution before they ask
5. Add unexpected value (credit, upgrade, expedite)
```

**Why it's good:**
- Specific phrases provided
- Clear do's and don'ts
- Action steps numbered
- Real-world applicable

---

### ❌ Poor Document Content:

**Example: Vague Policy (Bad)**
```
Customers should be treated well and issues should be resolved 
professionally. Use good judgment.
```

**Why it's bad:**
- Too vague
- No specific actions
- No phrases to use
- AI can't give concrete coaching

---

## Best Practices

### 1. Use Clear Headings
```
✅ Good:
## DAMAGED ITEMS REFUND POLICY
### When to Refund
### How to Refund
### What to Say

❌ Bad:
refunds and stuff
```

### 2. Include Exact Phrases
```
✅ Good:
Say: "I'm processing your refund right now. You'll see it in 3-5 days."

❌ Bad:
Tell them about the refund timeline
```

### 3. Be Specific About Numbers
```
✅ Good:
- Refund processing: 3-5 business days
- Goodwill credit: $10-$25 depending on item value
- Manager approval required: Orders over $200

❌ Bad:
- Refunds take a few days
- Offer some credit
- Get approval for big orders
```

### 4. Include Examples
```
✅ Good:
Example scenarios:
- "My package is late" → Refund shipping + $15 credit
- "Item is damaged" → Full refund + $20 credit, no return
- "Wrong item sent" → Keep wrong item + send correct item overnight

❌ Bad:
Handle each case appropriately
```

---

## Summary Checklist

### Getting Started:
- [ ] Ollama is installed and running
- [ ] Model `nomic-embed-text` is downloaded
- [ ] You found the `company-docs/` folder
- [ ] You reviewed the 4 sample documents I created

### Adding Your Documents:
- [ ] Gathered your company's policy documents
- [ ] Copied them to `/home/user/webapp/company-docs/`
- [ ] Files are in supported format (.txt, .pdf, .doc, .docx, .md)
- [ ] Deleted or kept sample documents (your choice)

### Indexing:
- [ ] Opened Terminal
- [ ] Navigated to `/home/user/webapp`
- [ ] Ran `python3 scripts/document_indexer.py`
- [ ] Saw "✅ Index created successfully!" message

### Testing:
- [ ] Ran a test query: `python3 scripts/query_documents.py "test question"`
- [ ] Got a response that quotes your document
- [ ] Started a live session in the dashboard
- [ ] AI coaching references your company policies

### Maintenance:
- [ ] Know to re-index when documents change
- [ ] Bookmarked this guide for future reference

---

## Need More Help?

### Read the Detailed Guides:
1. **QUICK_START_RAG.md** - 5-minute quick start (technical but simple)
2. **LLAMAINDEX_SETUP.md** - Complete technical documentation
3. **RAG_IMPLEMENTATION_SUMMARY.md** - Technical details for developers

### In the Dashboard:
1. Click **Settings** (⚙️)
2. Find **"Company Documents (RAG)"** section
3. Click **"Setup Guide"** button
4. Opens the complete guide with more details

---

## Real-World Example

**Your Company:** TechStore Electronics

**Your Documents Added:**
1. `techstore_warranty_policy.pdf` - 30-day return, 1-year warranty details
2. `techstore_shipping.txt` - 2-day shipping for Prime, 5-7 days standard
3. `techstore_scripts.docx` - Call opening, closing, troubleshooting steps

**Customer Says:** "My laptop arrived with a cracked screen"

**AI Coaching (Before RAG):**
"Apologize and offer to help resolve the issue"

**AI Coaching (After RAG with your docs):**
"Per TechStore Warranty Policy (Section 2.3): Damaged-on-arrival items 
qualify for immediate replacement. No return required.

Script: 'I'm very sorry your laptop arrived damaged. Per our policy, 
I'm sending you a replacement with overnight shipping at no charge. 
Keep the damaged one until the new one arrives, then we'll send a 
prepaid return label. I'm also adding a $50 store credit as an apology.'

Authorization: Manager approval required for laptops over $1,500"

**See the difference?** The AI now quotes YOUR specific policies!

---

## You're Ready! 🚀

That's everything you need to know. The RAG system is now ready to use with your company's documents.

**Remember:**
- Documents go in `/home/user/webapp/company-docs/`
- Index with `python3 scripts/document_indexer.py`
- Test with `python3 scripts/query_documents.py "question"`
- Re-index when documents change

**Questions?** Re-read this guide or check the technical documentation in the other files.

Good luck with your AI coaching system! 🎉
