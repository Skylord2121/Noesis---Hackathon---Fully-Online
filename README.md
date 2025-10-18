# Real-Time Agent Support Dashboard

## 🎯 Project Overview

**Real-Time Agent Support Dashboard** is a **hybrid cloud/local AI system** that enables live, two-way conversations between customers and human agents with real-time AI coaching and analytics.

**Architecture:**
- 🌐 **Cloud Dashboard** - Hosted on Cloudflare Pages (agent interface)
- 💻 **Local AI Processing** - Ollama runs on your computer (RAG + metrics)
- 👥 **Real People** - Both customer and agent are real humans speaking

**Tagline:** *"Human conversations, AI-powered coaching — in real time."*

## 🚀 What's New: Real Human Conversations

**This system now supports real customer-agent conversations:**

### How It Works

1. **Agent Dashboard** (Cloud)
   - Agent clicks "Start New Session"
   - System generates unique customer link
   - Agent sees customer transcript in real-time
   - Agent responds using microphone
   - AI provides live coaching and metrics

2. **Customer Page** (Cloud)
   - Customer receives link from agent
   - Simple interface with microphone button
   - Customer speaks → Agent sees transcript
   - No AI or metrics visible to customer

3. **AI Coaching** (Local - Your Computer)
   - Ollama analyzes customer messages
   - Provides coaching suggestions for agent
   - Tracks sentiment, empathy, stress, clarity
   - References company documents (RAG)

## 🌐 Live URLs

**Agent Dashboard:** https://3000-ib0z8zuo7krasmb055710-b237eb32.sandbox.novita.ai
**Customer Page:** `{agent-dashboard}/static/customer.html?session={session-id}`

## ✨ Key Features

### Agent Dashboard Features
- 🎤 **Agent Microphone** - Respond to customers using your voice
- 📝 **Live Customer Transcript** - See what customer says in real-time
- 💡 **AI Coaching** - Get suggestions while customer speaks
- 📊 **Live Metrics** - Track empathy, sentiment, stress, quality
- 📚 **RAG Integration** - AI references company documents
- ⏱️ **Call Timer** - Track call duration (AHT)
- 🔗 **Session Links** - Generate unique customer links

### Customer Page Features
- 🎤 **Simple Microphone** - One-click to start speaking
- 🔴 **Recording Indicator** - Visual feedback when speaking
- 🔌 **Connection Status** - See if connected to agent
- 🎨 **Clean Interface** - No distractions, just communication

### AI-Powered Analysis (Local)
- **Comprehensive Metrics:**
  - Empathy Score (0-10)
  - Sentiment (Upset → Happy)
  - Stress Level (High/Medium/Low)
  - Clarity (Poor/Fair/Good)
  - Quality Score (0-10)
  - Predicted CSAT (0-10)
  - Issue Detection
  - Status Tracking

### Coaching Cards
- **Priority-based** coaching suggestions
- **Actionable phrases** to use
- **Type categorization** (De-escalation, Empathy, Action, etc.)
- **Document references** from your company policies

## ⚙️ Setup Instructions

### 1. Install and Run Ollama (On Your Computer)

**Required for AI coaching and metrics:**

```bash
# Install Ollama (if not installed)
# Visit: https://ollama.ai

# Pull the recommended model
ollama pull qwen2.5:3b

# Pull embedding model for RAG
ollama pull nomic-embed-text

# Start Ollama server
ollama serve
```

The default Ollama address is `http://localhost:11434`.

### 2. Setup RAG Documents (Optional but Recommended)

**Location on your computer:** `C:\Users\Nimbus VFX\Desktop\Company Docs`

```bash
# Navigate to your documents folder
cd "C:\Users\Nimbus VFX\Desktop\Company Docs"

# Add your company documents (.txt, .md, .pdf)
# Examples: refund_policy.md, call_scripts.md, etc.

# Index documents
cd scripts
python document_indexer.py
```

**See:** `RAG_FOR_NON_CODERS.md` for detailed setup instructions.

### 3. Configure Dashboard Settings

1. Open the **Agent Dashboard**
2. Click **Settings icon** (⚙️) in top right
3. Enter **Ollama Host URL**: `http://localhost:11434`
4. Enter **Model Name**: `qwen2.5:3b`
5. Click **Test Connection** to verify
6. Click **Save**

### 4. Start Live Session

1. Click **"Start New Session"** button
2. Copy the generated customer link
3. Send link to your customer (or friend for testing)
4. Customer opens link and clicks microphone
5. You see their transcript in real-time
6. Click **"Speak"** button to respond
7. AI provides coaching in right panel

## 🎙️ How It Works

### Session Flow

```
AGENT CLICKS "START NEW SESSION"
    ↓
SYSTEM GENERATES UNIQUE LINK
    ↓
AGENT SENDS LINK TO CUSTOMER
    ↓
CUSTOMER OPENS LINK + SPEAKS
    ↓
TRANSCRIPT → AGENT DASHBOARD (real-time)
    ↓
AI ANALYZES → COACHING + METRICS
    ↓
AGENT RESPONDS USING MICROPHONE
    ↓
AGENT'S RESPONSE → CUSTOMER PAGE
```

### Data Flow

```
Customer Speech → Web Speech API → Transcript
                                        ↓
                            Store in Cloud Cache
                                        ↓
                            Agent Dashboard Polls
                                        ↓
                            Display Transcript
                                        ↓
                    Local Ollama AI Analysis
                                        ↓
                ┌───────────────────────┴───────────────────┐
                ↓                                           ↓
         Coaching Cards                              Metrics Update
    (suggestions for agent)                (empathy, sentiment, etc.)


Agent Speech → Web Speech API → Transcript
                                        ↓
                            Store in Cloud Cache
                                        ↓
                            Customer Page Polls
                                        ↓
                            Display (optional)
```

## 🛠️ Tech Stack

### Frontend (Cloud - Cloudflare Pages)
- **HTML5/CSS3** - Structure and styling
- **Tailwind CSS** - Utility-first styling framework
- **Web Speech API** - Voice-to-text transcription
- **Vanilla JavaScript** - No framework overhead

### Backend (Cloud - Cloudflare Workers)
- **Hono** - Lightweight web framework
- **Cache API** - Real-time message sync
- **Cloudflare KV** - Session storage (production)
- **REST API** - Session management endpoints

### AI Processing (Local - Your Computer)
- **Ollama** - Local LLM inference (qwen2.5:3b)
- **LlamaIndex** - RAG document indexing
- **nomic-embed-text** - Vector embeddings
- **Python** - Document indexing scripts

### Architecture Pattern
- **Hybrid Cloud/Local** - UI in cloud, AI on your machine
- **Real-time polling** - 1-second updates for messages
- **Ephemeral sessions** - Cached conversations (1-hour TTL)

## 📊 Data Architecture

### Session Storage (Cloud)
```
Cache Key: https://internal.cache/{sessionId}/messages
Structure: {
  messages: [
    { role: 'customer', content: '...', timestamp: 1234567890 },
    { role: 'agent', content: '...', timestamp: 1234567891 }
  ]
}
Expiry: 1 hour
```

### Document Storage (Local)
```
C:\Users\Nimbus VFX\Desktop\Company Docs\
├── refund_policy.md
├── call_scripts.md
├── .index/                    # Vector database (auto-created)
└── scripts/
    ├── document_indexer.py    # Index documents
    └── query_documents.py     # Query indexed docs
```

## 🚀 Use Cases

### Primary Use Cases
1. **Remote Customer Support** - Handle customers from anywhere
2. **Agent Training** - Practice with AI coaching
3. **Quality Assurance** - Real-time monitoring with metrics
4. **Sales Coaching** - Improve conversion with suggestions
5. **Testing Support Scripts** - Test with friends before going live

### How to Test
1. Open agent dashboard
2. Start new session
3. Copy customer link
4. Open in **another browser/device** (or send to friend)
5. Speak from customer page
6. Respond from agent page
7. Watch AI coaching appear

## 🔒 Privacy & Security

- **Local AI processing** - Ollama runs on your machine only
- **Cloud conversations** - Stored in cache for 1 hour only
- **No permanent storage** - Sessions are ephemeral
- **No AI on customer side** - Customers don't see coaching/metrics
- **HTTPS only** - All communication encrypted

## ✅ Features Completed

✅ **Real human conversations** - Both customer and agent are real people  
✅ **Session management** - Unique session IDs and links  
✅ **Real-time transcription** - Both customer and agent speech-to-text  
✅ **Agent dashboard** - Full metrics and coaching interface  
✅ **Customer page** - Simple, clean microphone interface  
✅ **Live message sync** - 1-second polling for real-time updates  
✅ **AI coaching** - Ollama analysis with suggestions  
✅ **RAG integration** - Company document references  
✅ **Call metrics** - Empathy, sentiment, stress, quality, CSAT  
✅ **Settings panel** - Ollama configuration and testing  

## 🔮 Features Not Yet Implemented

🔲 **WebSocket support** - Currently using polling (1-second intervals)  
🔲 **Session persistence** - Sessions expire after 1 hour  
🔲 **Agent sees customer audio** - Only transcript, no audio playback  
🔲 **Customer sees agent responses** - Currently one-way display  
🔲 **Multiple concurrent sessions** - Agent handles one session at a time  
🔲 **Session history** - No saved conversation logs  
🔲 **Authentication** - No user login system  
🔲 **Supervisor monitoring** - No multi-agent dashboard  

## 🎯 Recommended Next Steps

1. **Enhanced Real-Time Sync**
   - Upgrade from polling to WebSocket (Cloudflare Durable Objects)
   - Reduce latency from 1s to <100ms
   - Add typing indicators

2. **Session Management**
   - Save session history to database
   - Export transcripts as PDF/JSON
   - Session replay functionality
   - Support multiple concurrent sessions

3. **Customer Experience**
   - Show agent responses on customer page
   - Add "agent is typing" indicator
   - Support text chat as alternative to voice
   - Add customer feedback at end of call

4. **Advanced Features**
   - Supervisor monitoring dashboard
   - Call recording and playback
   - Team performance analytics
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

# Add your company documents (Windows path)
# C:\Users\Nimbus VFX\Desktop\Company Docs\your-files.md

# Index documents for RAG
cd "C:\Users\Nimbus VFX\Desktop\Company Docs\scripts"
python document_indexer.py

# Build project
cd /home/user/webapp
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs webapp --nostream

# Stop service
pm2 stop webapp
```

## 🔧 Troubleshooting

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check model is installed: `ollama list`
- Test connection in Settings panel
- Verify URL: `http://localhost:11434`

### Customer Can't Connect
- Check session link is complete with `?session=` parameter
- Verify agent dashboard is running
- Check browser console for errors
- Try different browser (Chrome/Edge recommended)

### No Transcript Appearing
- Verify microphone permissions granted
- Check browser supports Web Speech API
- Test with "Hello" and wait 2-3 seconds
- Check network tab for API calls

### AI Coaching Not Working
- Verify Ollama is running locally
- Test Ollama connection in settings
- Check console for API errors
- Ensure qwen2.5:3b model is downloaded

## 📚 Additional Documentation

- **RAG_FOR_NON_CODERS.md** - Plain-English RAG setup guide
- **HOW_TO_USE_RAG_SIMPLE.md** - Quick 3-step visual guide
- **LLAMAINDEX_SETUP.md** - Technical RAG documentation

## 📝 API Endpoints

### Session Management

```bash
# Check if session exists
GET /api/session/check?sessionId={id}

# Send message to session
POST /api/session/message
Body: {
  "sessionId": "session_abc123",
  "role": "customer" | "agent",
  "content": "Hello!",
  "timestamp": 1697500000000
}

# Get new messages
GET /api/session/messages?sessionId={id}&since={timestamp}
```

### Ollama Proxy

```bash
# Test Ollama connection
POST /api/test-ollama
Body: {
  "ollamaUrl": "http://localhost:11434",
  "model": "qwen2.5:3b"
}

# Generate AI analysis
POST /api/analyze-message
Body: {
  "customerMessage": "I'm upset!",
  "conversationHistory": [...],
  "ollamaUrl": "http://localhost:11434",
  "model": "qwen2.5:3b"
}
```

## 📝 Deployment Status

- **Platform:** Cloudflare Pages (Development)
- **Current Status:** ✅ Active (Real Human Conversations)
- **Environment:** Sandbox demonstration
- **Tech Stack:** Hono + Cloudflare Workers + Ollama + LlamaIndex
- **Last Updated:** 2025-10-17

---

**Note:** This system uses a hybrid architecture. The UI and conversation sync are hosted in the cloud, but all AI processing happens locally on your computer via Ollama. This ensures privacy while enabling real-time coaching.
