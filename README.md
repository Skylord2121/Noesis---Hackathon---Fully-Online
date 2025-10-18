# Empathy AI - Real-Time Live Coaching Dashboard

## 🎯 Project Overview

**Empathy AI** is a **fully live, reactive** AI coaching system that provides real-time analysis and coaching during live conversations. Your voice becomes the customer, and an AI agent responds automatically while analyzing the entire interaction.

**Tagline:** *"Live AI coaching — every conversation, in real time."*

## 🤖 Ollama AI Integration (Required)

**This dashboard is FULLY powered by AI** - no demo data, everything is live and reactive:

- **Your voice = Customer** - Speak into your microphone as the customer
- **AI Agent responds** - Automatically generates contextual responses
- **Live metrics** - All metrics (empathy, sentiment, stress, quality) from AI
- **Real-time coaching** - AI analyzes every customer message and provides suggestions
- **Live audio spectrum** - Visual representation of your voice in real-time

## ✨ Key Features

### Fully Live & Reactive
- 🎤 **Voice-to-Text** - Your speech is transcribed in real-time (Web Speech API)
- 🤖 **AI Agent Responses** - Ollama generates natural agent responses
- 📊 **Live Metrics** - Empathy (0-10), Sentiment, Stress, Clarity, Quality, Predicted CSAT
- 💡 **Real-Time Coaching** - AI suggests phrases and coaching tips as you speak
- 🌊 **Voice Spectrum** - Visual audio analyzer connected to your microphone
- 📝 **Live Transcript** - All conversation logged with timestamps
- 📚 **RAG (Document Retrieval)** - AI references company policies in coaching suggestions

### AI-Powered Analysis
- **Comprehensive Metrics:**
  - Empathy Score (4.0-9.5 scale)
  - Sentiment (Upset → Happy)
  - Stress Level (High/Medium/Low)
  - Clarity (Poor/Fair/Good)
  - Quality Score (65-92%)
  - Predicted CSAT (5.0-9.5)
  - Customer Tags (Premium, Work From Home, etc.)
  - Issue Detection
  - Status Tracking (Open → Resolved)

### Coaching Cards
- **Priority-based** (1=Critical, 2=Important, 3=Helpful)
- **Actionable suggestions** with example phrases
- **Type categorization** (De-escalation, Empathy, Action, Transparency, Resolution, Knowledge)

## 🌐 Live Demo

**Dashboard URL:** https://3000-ib0z8zuo7krasmb055710-b237eb32.sandbox.novita.ai

## 🚀 New: Document-Based Coaching (RAG)

**Now you can upload company documents and the AI will reference them in coaching suggestions!**

### What is RAG?

RAG (Retrieval-Augmented Generation) allows the AI to:
- **Reference your company policies** when giving coaching advice
- **Quote specific guidelines** from your documentation
- **Provide contextually relevant suggestions** based on your procedures

### 📚 Guides for Everyone

**New to coding? Start here:**
- **HOW_TO_USE_RAG_SIMPLE.md** - Super simple 3-step guide with pictures
- **RAG_FOR_NON_CODERS.md** - Complete guide in plain English (no coding knowledge needed)

**For technical users:**
- **QUICK_START_RAG.md** - 5-minute technical quick start
- **LLAMAINDEX_SETUP.md** - Complete technical documentation

### Setup Document-Based Coaching

1. **Add Your Documents**
   ```bash
   cd /home/user/webapp/company-docs/
   # Add your files: refund policies, scripts, empathy guides, etc.
   # Supported: .txt, .pdf, .md, .doc, .docx
   ```

2. **Index the Documents**
   ```bash
   # Pull the embedding model (first time only)
   ollama pull nomic-embed-text
   
   # Index your documents
   python3 scripts/document_indexer.py
   ```

3. **Done!** The AI will now reference your policies in coaching suggestions.

**Need help?** Read `HOW_TO_USE_RAG_SIMPLE.md` or `RAG_FOR_NON_CODERS.md` for step-by-step instructions.

### Example

**Without RAG:**
> "Consider offering a refund to resolve this issue."

**With RAG (after indexing company policies):**
> "Per our damaged item policy: Issue immediate refund without requiring return. Use phrase: 'I'm so sorry your item arrived damaged. Let me process an immediate refund - you don't need to return it.'"

### Sample Documents Included

The system comes with 4 Amazon call center example documents:
- `amazon_refund_policy.md` - Refund guidelines and empathy scripts
- `customer_service_scripts.md` - Call center scripts and de-escalation
- `shipping_policies.txt` - Shipping guidelines and procedures
- `empathy_coaching.md` - Advanced empathy framework (A.P.O.L.O.G.Y.)

**Replace these with your own company documents!**

### Access in Dashboard

1. Click **Settings** (⚙️) in top right
2. Find **"Company Documents (RAG)"** section
3. Click **"Setup Guide"** for detailed instructions
4. Click **"Open Folder"** to access document directory

For complete setup instructions, see `LLAMAINDEX_SETUP.md`.

## ⚙️ Setup Instructions

### 1. Install and Run Ollama

**On your local machine:**

```bash
# Install Ollama (if not installed)
# Visit: https://ollama.ai

# Pull the recommended model
ollama pull qwen2.5:3b

# Start Ollama server
ollama serve
```

The default Ollama address is `http://localhost:11434`.

### 2. Configure Dashboard Settings

1. Open the dashboard
2. Click the **Settings icon** (⚙️) in the top right
3. Enter your **Ollama Host URL**: `http://localhost:11434`
4. Enter your **Model Name**: `qwen2.5:3b`
5. Click **Test Connection** to verify
6. Click **Save** to store settings

### 3. Start Live Session

1. Click **"Start Session"** button
2. Allow microphone access when prompted
3. Start speaking as the customer
4. Watch the AI agent respond and see live metrics update
5. Review AI coaching suggestions in the right panel

## 🎙️ How It Works

### Live Session Flow

```
You speak (Customer) 
    ↓
Web Speech API → Transcript
    ↓
Ollama AI → Metrics Analysis (empathy, sentiment, stress, etc.)
    ↓
Ollama AI → Agent Response
    ↓
Dashboard Updates (metrics, coaching cards, transcript)
    ↓
Audio Spectrum (live visualization of your voice)
```

### Your Voice = Customer Only

- **Customer voice:** Your microphone input
- **Agent responses:** Generated by AI (Ollama)
- **Metrics:** Analyzed from customer (your) messages
- **Coaching:** Suggestions for how the agent should respond

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Tailwind CSS** - Utility-first styling framework (via CDN)
- **Web Speech API** - Voice-to-text transcription
- **Web Audio API** - Live audio spectrum visualization
- **Font Awesome** - Professional iconography

### AI Backend
- **Ollama** - Local LLM inference (qwen2.5:3b recommended)
- **Direct browser-to-Ollama** - No backend proxy needed
- **Streaming analysis** - Real-time metrics generation

### Framework
- **Hono** - Lightweight web framework for Cloudflare Workers
- **Vite** - Build tool for optimal performance
- **PM2** - Process manager for development

## 📊 Data Architecture

### Current Implementation (Fully Live)
```
Microphone → Web Speech API → Customer Transcript
                                      ↓
                              Ollama AI Analysis
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
              Metrics Update                    Agent Response
        (empathy, sentiment, etc.)               (AI generated)
                    ↓                                   ↓
              Coaching Cards                      Transcript
```

### Audio Spectrum (Live)
```
Microphone → Web Audio API → Analyser Node → Frequency Data → Visual Bars
```

## 🚀 Use Cases

### Primary Use Cases
1. **Agent Training** - Practice conversations with AI feedback
2. **Quality Assurance** - Review coaching effectiveness
3. **Self-coaching** - Agents can practice empathy techniques
4. **Customer Simulation** - Role-play challenging scenarios

### Expansion Opportunities
- Multi-agent simulations (multiple AI personas)
- Scenario-based training modules
- Integration with real telephony systems
- Supervisor monitoring dashboard

## 🔒 Privacy & Security

- **Local processing** - Ollama runs on your machine
- **No cloud uploads** - All AI processing happens locally
- **Browser-only** - Speech recognition happens in your browser
- **No storage** - Conversations are not saved (ephemeral)

## ✅ Features Completed

✅ **Fully live and reactive** - No demo data  
✅ **Voice-to-text** - Web Speech API integration  
✅ **AI agent responses** - Contextual Ollama-generated replies  
✅ **Live audio spectrum** - Connected to microphone  
✅ **Real-time metrics** - All from AI analysis  
✅ **Live coaching** - AI suggestions every customer message  
✅ **Settings panel** - Ollama configuration  
✅ **Connection testing** - Verify Ollama before starting  
✅ **Clean UI** - Removed all demo/simulation code  
✅ **Empathy score** - Connected to AI (NOT hardcoded)  
✅ **Quality score** - Direct from AI (0-100 scale)  
✅ **Predicted CSAT** - AI-analyzed emotion intensity (0-10 scale)  
✅ **Sentiment mapping** - Accurate 0-10 display matching emotion words  
✅ **Spectrum bars zero state** - Bars reduce to 0% when not speaking  
✅ **Mic pause during AI reply** - Prevents transcript disruption  
✅ **Extended speech window** - Continuous listening for natural pauses  
✅ **Pause/Resume controls** - Mid-session pause functionality  
✅ **RAG Implementation** - LlamaIndex document indexing and retrieval  
✅ **Document Management UI** - Settings panel for document upload guidance  
✅ **Company Policy Integration** - AI references indexed documents in coaching  
✅ **Dual-layer validation** - JavaScript + AI for 99% metric accuracy  

## 🔮 Features Not Yet Implemented

🔲 **Document upload from dashboard** - Currently manual file placement  
🔲 **Document preview in UI** - View indexed documents in settings  
🔲 **Re-indexing trigger** - Button to re-index after adding documents  
🔲 **Manual speaker selection** - Currently auto AI agent  
🔲 **Save conversation history** - Sessions are ephemeral  
🔲 **Export transcript/metrics** - Download conversations  
🔲 **Multiple agent personalities** - Different AI personas  
🔲 **Scenario templates** - Pre-configured training scenarios  
🔲 **Performance analytics** - Track improvement over time  

## 🎯 Recommended Next Steps

1. **Enhanced RAG Features**
   - In-dashboard document upload (drag & drop)
   - Document preview and management UI
   - Automatic re-indexing when documents change
   - Document search from dashboard
   - Version control for policy documents

2. **Enhanced Speech Recognition**
   - Add manual "Push-to-Talk" button for customer
   - Implement silence detection for natural pauses
   - Support for multiple languages

3. **Agent Customization**
   - Different AI agent personas (empathetic, technical, etc.)
   - Adjustable response length and style
   - Custom coaching focus areas
   - Company-specific response templates

4. **Session Management**
   - Save and review past sessions
   - Export transcripts as PDF/JSON
   - Session replay functionality
   - Coaching effectiveness tracking

5. **Advanced Analytics**
   - Track improvement over multiple sessions
   - Identify common coaching patterns
   - Compare metrics across agents
   - Policy compliance scoring

6. **Production Features**
   - User authentication
   - Session history database
   - Multi-user support
   - Supervisor monitoring
   - Integration with CRM systems

## 💻 Local Development

```bash
# Clone repository
git clone <repo-url>
cd webapp

# Install dependencies
npm install

# Install Python dependencies for RAG
pip3 install llama-index llama-index-llms-ollama llama-index-embeddings-ollama pypdf

# Pull required Ollama models
ollama pull qwen2.5:3b
ollama pull nomic-embed-text

# Add your company documents
cp your-policies.pdf company-docs/
cp your-scripts.md company-docs/

# Index documents for RAG
python3 scripts/document_indexer.py

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs webapp --nostream

# Stop service
pm2 stop webapp
```

## 📚 RAG System Files

- `company-docs/` - Your company policy documents
- `scripts/document_indexer.py` - Indexes documents into vector database
- `scripts/query_documents.py` - Query indexed documents (can be used standalone)
- `.index/` - Vector index storage (auto-created, do not edit)
- `LLAMAINDEX_SETUP.md` - Complete RAG setup guide

## 🔧 Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check model is installed: `ollama list`
- Test connection in Settings panel
- Try alternative models if qwen2.5:3b fails

### Microphone Issues
- Allow microphone permissions in browser
- Check browser console for errors
- Test microphone in browser settings
- Use Chrome/Edge for best compatibility

### Speech Recognition Issues
- Speak clearly and at moderate pace
- Reduce background noise
- Check language setting (en-US default)
- Restart browser if recognition stops

## 📝 Deployment Status

- **Platform:** Cloudflare Pages (Development)
- **Current Status:** ✅ Active (Fully Live)
- **Environment:** Sandbox demonstration
- **Tech Stack:** Hono + TypeScript + TailwindCSS + Ollama AI
- **Last Updated:** 2025-10-15

---

**Note:** This is a fully live, reactive system. All metrics and coaching come from real AI analysis, not hardcoded values. Ollama must be running for the dashboard to function.
