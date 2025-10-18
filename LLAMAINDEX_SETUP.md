# LlamaIndex RAG Setup Guide

## Overview

This system uses **LlamaIndex** to implement RAG (Retrieval-Augmented Generation) for the call center coaching dashboard. This allows the AI to reference company documents when providing coaching suggestions.

## Architecture

```
company-docs/          → Your company policy documents
    ├── refund_policy.md
    ├── shipping_policies.txt
    └── empathy_coaching.md

scripts/document_indexer.py  → Indexes documents into vector database
scripts/query_documents.py   → Queries indexed documents

.index/                → Vector index storage (auto-created)
```

## Prerequisites

1. **Ollama must be running** on your local machine (`http://localhost:11434`)
2. **qwen2.5:3b model** must be installed: `ollama pull qwen2.5:3b`
3. **nomic-embed-text model** must be installed: `ollama pull nomic-embed-text`
4. **Python packages installed**: `pip3 install llama-index llama-index-llms-ollama llama-index-embeddings-ollama pypdf`

## Quick Start

### Step 1: Add Your Company Documents

Place your company policy documents in the `company-docs/` directory:

```bash
cd /home/user/webapp/company-docs/
# Add your files:
# - Refund policies
# - Shipping guidelines
# - Customer service scripts
# - Empathy coaching guides
# - Product knowledge bases
# etc.
```

**Supported formats**: `.txt`, `.pdf`, `.md`, `.doc`, `.docx`

### Step 2: Index the Documents

Run the indexer to create the vector database:

```bash
cd /home/user/webapp
python3 scripts/document_indexer.py
```

This will:
- Load all documents from `company-docs/`
- Chunk them into 512-token segments with 50-token overlap
- Create vector embeddings using nomic-embed-text
- Store the index in `.index/` directory

**Expected output**:
```
🚀 LlamaIndex Document Indexer for Call Center Coaching
📦 Checking for embedding model: nomic-embed-text
✅ Model available
📂 Loading documents from: company-docs/
📄 Found 4 document(s)
🔨 Creating vector index...
✅ Index created successfully!
💾 Index saved to: .index/
```

### Step 3: Test Document Queries

Test that the system works:

```bash
# Interactive mode
python3 scripts/query_documents.py

# Command-line query
python3 scripts/query_documents.py "What is our refund policy for damaged items?"
```

**Example output**:
```
🔍 Query: What is our refund policy for damaged items?

📄 Response:
For damaged items, customers do NOT need to return the item first.
We issue an immediate refund upon verification. We also cover all
return shipping costs for damaged items. Customers should take
photos of the damage for documentation.

📚 Sources:
  [1] amazon_refund_policy.md (score: 0.89)
  [2] customer_service_scripts.md (score: 0.76)
```

### Step 4: Re-index When Documents Change

Whenever you add, update, or remove documents:

```bash
python3 scripts/document_indexer.py
```

The index will be recreated with the updated content.

## Integration with Dashboard

### Automatic Integration (When index exists)

The dashboard will automatically use the indexed documents when:
1. The `.index/` directory exists (created by running `document_indexer.py`)
2. Ollama is running and accessible
3. The `query_documents.py` script is in the `scripts/` directory

### How It Works

When a customer message is analyzed, the system:

1. **Extracts key topics** from the customer's message (e.g., "refund", "damaged package")
2. **Queries the document index** for relevant company policies
3. **Includes retrieved context** in the AI coaching prompt
4. **AI generates coaching** that references specific company policies

**Example flow**:

```
Customer says: "My package arrived damaged"
    ↓
System queries index: "What is our policy for damaged packages?"
    ↓
Retrieved context: "For damaged items, issue immediate refund without requiring return..."
    ↓
AI coaching: "Offer immediate refund per damaged item policy. Use phrase: 
'I'm so sorry your item arrived damaged. Let me process an immediate 
refund - you don't need to return it. I'll also add a $10 credit.'"
```

## API Endpoints

### `/api/query-docs` (POST)

Query the indexed documents directly.

**Request**:
```json
{
  "query": "What should I do if a customer's package is late?",
  "top_k": 3,
  "ollamaUrl": "http://localhost:11434"
}
```

**Response**:
```json
{
  "success": true,
  "response": "For late packages, refund shipping costs immediately...",
  "sources": [
    {
      "score": 0.92,
      "text": "When a package is late (past guaranteed date)...",
      "metadata": {"file_name": "shipping_policies.txt"}
    }
  ]
}
```

## Configuration

### Environment Variables

You can customize the setup with environment variables:

```bash
# Ollama server URL (default: http://localhost:11434)
export OLLAMA_HOST=http://localhost:11434

# LLM model for generation (default: qwen2.5:3b)
export OLLAMA_MODEL=qwen2.5:3b

# Embedding model (default: nomic-embed-text)
# Note: Don't change this unless you know what you're doing
```

### Advanced Settings (in scripts/document_indexer.py)

```python
Settings.chunk_size = 512        # Token size per chunk
Settings.chunk_overlap = 50      # Overlap between chunks
Settings.llm.temperature = 0.3   # Lower = more factual
```

## Troubleshooting

### "Failed to connect to Ollama"

**Solution**: Make sure Ollama is running:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if needed
ollama serve
```

### "Model not found: nomic-embed-text"

**Solution**: Pull the embedding model:
```bash
ollama pull nomic-embed-text
```

### "No documents found"

**Solution**: Add documents to `company-docs/` directory:
```bash
ls company-docs/
# Should show .txt, .pdf, .md files
```

### Index not updating with new documents

**Solution**: Delete the old index and re-index:
```bash
rm -rf .index/
python3 scripts/document_indexer.py
```

### Query results not relevant

**Solutions**:
1. **Add more context to documents** - More detailed documents = better retrieval
2. **Increase top_k** - Retrieve more chunks (default is 3)
3. **Improve document structure** - Use clear headings and sections
4. **Add more documents** - More examples = better coverage

## Best Practices

### Document Organization

✅ **Do**:
- Use clear headings and sections
- Include specific examples
- Cover edge cases
- Use consistent terminology
- Update documents regularly

❌ **Don't**:
- Use overly technical jargon
- Include outdated information
- Mix multiple topics in one document
- Use inconsistent formatting

### Document Content

**Good example**:
```markdown
# Refund Policy for Damaged Items

## Standard Process
1. Customer reports damage
2. Agent verifies with photos (if available)
3. Issue immediate refund (no return required)
4. Add $10-$25 goodwill credit

## Example Phrases
"I'm so sorry your item arrived damaged. Let me process an 
immediate refund - you don't need to return it."
```

**Bad example**:
```markdown
damaged stuff gets refunded
```

### When to Re-Index

Re-index whenever you:
- Add new documents
- Update existing documents
- Remove outdated documents
- Change document structure significantly

## Performance Tips

### For Better Speed

1. **Use smaller models** for embeddings (nomic-embed-text is already optimized)
2. **Reduce chunk_overlap** if you have many documents (trade-off: less context)
3. **Cache frequently queried results** in your application

### For Better Accuracy

1. **Increase chunk_size** for more context per chunk
2. **Increase top_k** to retrieve more relevant chunks
3. **Add more documents** with diverse examples
4. **Include cross-references** in documents

## Production Deployment

### For Cloudflare Pages Deployment

Since Cloudflare Workers doesn't support Python execution, you have two options:

#### Option 1: Pre-Index Locally (Recommended)

1. Index documents on your local machine
2. Commit the `.index/` directory to git
3. Deploy to Cloudflare Pages
4. The frontend will use a remote API to query the index

#### Option 2: Separate RAG Service

1. Run a separate Python service (Flask/FastAPI) for RAG queries
2. Deploy it to Railway, Fly.io, or similar
3. Configure dashboard to query this service via API
4. Keep `.index/` directory out of Cloudflare deployment

## Additional Resources

- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [Ollama Documentation](https://ollama.com/docs)
- [RAG Best Practices](https://docs.llamaindex.ai/en/stable/optimizing/production_rag/)

## Sample Documents Included

The system comes with 4 sample Amazon call center documents:

1. **amazon_refund_policy.md** - Complete refund guidelines and empathy scripts
2. **customer_service_scripts.md** - Call center scripts and de-escalation techniques  
3. **shipping_policies.txt** - Shipping guidelines and late delivery procedures
4. **empathy_coaching.md** - Advanced empathy framework (A.P.O.L.O.G.Y.)

These are examples - replace with your own company documents!

## Next Steps

1. ✅ Add your company documents to `company-docs/`
2. ✅ Run `python3 scripts/document_indexer.py`
3. ✅ Test with `python3 scripts/query_documents.py "test query"`
4. ✅ Start the dashboard and watch AI reference your policies!

---

**Questions or issues?** The system is designed to work out-of-the-box with Ollama. If you encounter problems, check the Troubleshooting section above.
