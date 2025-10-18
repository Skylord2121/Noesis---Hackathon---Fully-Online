# Quick Start: Document-Based AI Coaching

## TL;DR - 3 Steps to Enable RAG

```bash
# 1. Pull embedding model (first time only)
ollama pull nomic-embed-text

# 2. Index your documents
cd /home/user/webapp
python3 scripts/document_indexer.py

# 3. Done! AI will now reference your policies
```

## What You Get

**Before RAG:**
> "Consider offering a refund."

**After RAG:**
> "Per our damaged item policy: Issue immediate refund without return. Use phrase: 'I'm so sorry your item arrived damaged. Let me process an immediate refund immediately.'"

## Your Documents

We've included 4 sample Amazon call center documents in `company-docs/`:
- `amazon_refund_policy.md`
- `customer_service_scripts.md`
- `shipping_policies.txt`
- `empathy_coaching.md`

**Replace these with your own company documents!**

## Adding Your Documents

```bash
cd /home/user/webapp/company-docs/

# Add your files (supports .txt, .pdf, .md, .doc, .docx)
cp ~/Downloads/our-refund-policy.pdf .
cp ~/Downloads/call-scripts.docx .

# Re-index
cd /home/user/webapp
python3 scripts/document_indexer.py
```

That's it! The AI will now reference your policies.

## Testing It

```bash
# Test document queries directly
python3 scripts/query_documents.py "What's our policy on damaged items?"

# Or use the dashboard
# 1. Start live session
# 2. Say "My package arrived damaged"
# 3. Watch AI coaching reference your exact policy
```

## Dashboard Access

Click **Settings (⚙️)** → **Company Documents (RAG)** section:
- **"Setup Guide"** button - Opens complete documentation
- **"Open Folder"** button - Shows document directory path

## Updating Documents

Whenever you add/update/remove documents:

```bash
python3 scripts/document_indexer.py
```

The system automatically re-indexes everything.

## Troubleshooting

**"Model not found: nomic-embed-text"**
```bash
ollama pull nomic-embed-text
```

**"No documents found"**
```bash
ls company-docs/  # Should show your files
```

**Need more help?**
- Read `LLAMAINDEX_SETUP.md` for detailed setup
- Read `RAG_IMPLEMENTATION_SUMMARY.md` for technical details

## Architecture

```
Your Company Documents
        ↓
   Vector Index (.index/ folder)
        ↓
  Customer says something
        ↓
System queries relevant policies
        ↓
AI generates coaching WITH policy references
```

## Example Queries That Work Well

✅ "What's our refund policy?"  
✅ "How do I handle an angry customer?"  
✅ "What do I say if package is late?"  
✅ "Damaged item procedure"  
✅ "Empathy statements for frustrated customers"  

## Why It's Awesome

- ✅ **No hallucination** - AI quotes actual company policies
- ✅ **Always up-to-date** - Re-index when policies change
- ✅ **Consistent coaching** - Same advice for same situations
- ✅ **Privacy** - Everything runs locally, nothing sent to cloud
- ✅ **Fast** - Queries return in ~500ms

## Next Steps

1. **Replace sample docs** - Add your company's actual policies
2. **Re-index** - Run `python3 scripts/document_indexer.py`
3. **Test** - Start a live session and see it in action!

---

**Questions?** See `LLAMAINDEX_SETUP.md` for the complete guide.
