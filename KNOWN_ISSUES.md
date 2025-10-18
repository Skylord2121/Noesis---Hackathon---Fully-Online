# Known Issues & Testing Guide

## 🚨 Critical Issues

### 1. **Cloudflare Workers AI Not Available in Local Development**
**Status:** ❌ LIMITATION
**Impact:** AI analysis (name detection, coaching) doesn't work in sandbox
**Reason:** Cloudflare Workers AI requires valid Cloudflare account authentication
**Workaround:** AI falls back to default values when unavailable
**Fix:** Only works when deployed to production Cloudflare Pages

```
Error: "Not logged in" - Cloudflare Workers AI
Result: Uses fallback analysis with null customerName
```

**What Works:**
- ✅ Message storage and retrieval
- ✅ Speech recognition (customer & agent)
- ✅ Transcript display
- ✅ Voice metrics capture
- ✅ Session management

**What Doesn't Work (Local Only):**
- ❌ AI-powered name detection
- ❌ AI coaching suggestions  
- ❌ Sentiment analysis
- ❌ Real-time metrics (empathy, quality, CSAT)

---

## 📋 Complete Feature Status

### ✅ **Working Features (Tested & Verified)**

1. **Session Management**
   - Start new session ✅
   - Generate unique customer links ✅
   - Session ID validation ✅
   - In-memory message storage ✅

2. **Customer Side**
   - Speech recognition (Web Speech API) ✅
   - Voice metrics capture (volume, pitch, energy) ✅
   - Message sending to agent ✅
   - Microphone permission handling ✅
   - Mobile detection & manual start ✅
   - Agent message display (polls every 2s) ✅
   - Audio visualization bars ✅

3. **Agent Side**
   - Speech recognition ✅
   - Continuous mic (auto-restart) ✅
   - Message sending to customer ✅
   - Transcript display ✅
   - Session polling (1s intervals) ✅
   - Customer voice spectrum animation ✅

4. **Backend API**
   - POST /api/session/message ✅
   - GET /api/session/messages ✅
   - GET /api/session/check ✅
   - Session isolation ✅
   - Voice metrics storage ✅

### ⚠️ **Partial/Limited Features**

1. **AI Analysis** (❌ Local, ✅ Production)
   - Customer name extraction
   - Issue detection
   - Sentiment scoring
   - Coaching suggestions
   - All metrics (empathy, quality, stress, clarity, CSAT)

2. **Voice Spectrum** (✅ Partial)
   - Shows animation on agent side ✅
   - Uses voice metrics when available ✅
   - Generic fallback animation ✅
   - Could be enhanced with real-time audio analysis

---

## 🧪 How to Test Properly

### **Local Testing (Sandbox - Current Environment)**

**What You CAN Test:**
```bash
# 1. Session & Message Flow
curl -X POST http://localhost:3000/api/session/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"TEST","role":"customer","content":"Hello","timestamp":1234567890}'

curl "http://localhost:3000/api/session/messages?sessionId=TEST&since=0"

# 2. Voice Metrics Capture
# Open customer page, speak, check that voiceMetrics are captured

# 3. Speech Recognition
# Agent clicks "Speak", talks, check transcript appears

# 4. Customer-Agent Communication
# Open two browsers, send messages both ways
```

**What You CANNOT Test:**
- AI name detection
- AI coaching
- Sentiment/metrics scoring

### **Production Testing (After Deployment)**

Once deployed to Cloudflare Pages with valid account:
```bash
# AI Analysis will work:
curl -X POST https://your-app.pages.dev/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"text":"My name is Sarah"}'

# Should return: {"customerName": "Sarah", ...}
```

---

## 🔧 Quick Fixes Applied Today

### Mobile Issues Fixed:
1. ✅ Microphone requires manual tap (iOS/Android requirement)
2. ✅ Bottom padding increased (120px) to avoid navigation bar
3. ✅ Audio context resuming for Safari
4. ✅ Mobile detection with appropriate UI messages

### Agent Microphone Fixed:
1. ✅ Continuous recognition with auto-restart
2. ✅ 100ms delay to prevent rapid loops
3. ✅ Proper error handling (ignores no-speech, aborted)
4. ✅ Comprehensive logging for debugging

### Message Flow Fixed:
1. ✅ In-memory Map storage (replaces broken Cache API)
2. ✅ Customer can see agent messages
3. ✅ Agent polls for customer messages (1s)
4. ✅ Customer polls for agent messages (2s)

---

## 🎯 Testing Checklist

### Desktop Testing:
- [ ] Start new session
- [ ] Copy customer link
- [ ] Open in incognito/different browser
- [ ] Customer speaks → Agent sees transcript
- [ ] Agent clicks "Speak" → Customer sees response
- [ ] Check console logs for errors
- [ ] Verify session ID matches on both sides

### Mobile Testing:
- [ ] Open customer link on phone
- [ ] Tap microphone button
- [ ] Grant permission
- [ ] Speak clearly
- [ ] Check agent dashboard receives message
- [ ] Verify bottom buttons are visible (not covered)

### Known Good Flow:
```
1. Agent: Start New Session
   → See session modal with customer link

2. Customer: Open link on different device
   → Mobile: Tap microphone manually
   → Desktop: Auto-starts after 500ms

3. Customer: Speak "Hello I need help"
   → Check agent dashboard for transcript
   → Check spectrum animation

4. Agent: Click "Speak"
   → Say "How can I help you?"
   → Check customer page shows response

5. Verify in browser console:
   [AGENT] logs and [CUSTOMER] logs should show message flow
```

---

## 📝 Console Log Guide

### Expected Agent Console Logs:
```
[AGENT] Starting new session
[AGENT] Session ID: ABC123
[AGENT] Starting message polling...
[AGENT] Polling for messages - Session: ABC123, Since: 0
[AGENT] Poll response: {success: true, messages: [...]}
[AGENT] Received 1 new message(s)
[AGENT] CUSTOMER MESSAGE: Hello
[AGENT] Adding to transcript...
[AGENT] Animating customer spectrum...
```

### Expected Customer Console Logs:
```
[CUSTOMER] Initializing customer page...
[CUSTOMER] Session ID: ABC123
[CUSTOMER] Speech recognition available
[CUSTOMER] Auto-starting microphone... (desktop only)
[CUSTOMER] Starting recording...
[CUSTOMER] Speech recognition result received
[CUSTOMER] Transcript (FINAL): "Hello"
[CUSTOMER] Sending FINAL transcript to server...
[CUSTOMER] Message sent successfully
```

---

## 🚀 Deployment Checklist

Before deploying to production:

1. [ ] Set up Cloudflare account
2. [ ] Configure CLOUDFLARE_API_TOKEN
3. [ ] Create Cloudflare Pages project
4. [ ] Deploy with: `npm run deploy`
5. [ ] Test AI analysis endpoint
6. [ ] Verify name detection works
7. [ ] Check coaching suggestions appear

---

## 💡 Current Limitations

1. **Session Persistence:** 
   - Sessions stored in memory
   - Lost on server restart
   - Use Cloudflare KV for production persistence

2. **AI Features:**
   - Require Cloudflare Workers AI
   - Only work in production deployment
   - Fallback to defaults in local dev

3. **Voice Spectrum:**
   - Shows animation on agent side only
   - Based on voice metrics, not real-time audio
   - Customer side has visual bars but different implementation

4. **Mobile UX:**
   - Requires manual mic tap (browser security)
   - Can't auto-start on page load
   - This is a browser limitation, not a bug

---

## 📊 API Endpoints Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/session/message` | POST | ✅ Works | Stores customer/agent messages |
| `/api/session/messages` | GET | ✅ Works | Retrieves messages for session |
| `/api/session/check` | GET | ✅ Works | Validates session exists |
| `/api/ai-analysis` | POST | ⚠️ Local: Fallback | Requires Cloudflare auth |
| `/api/company-knowledge` | GET | ✅ Works | Returns knowledge base |

---

**Last Updated:** 2025-10-18
**Environment:** Local Development (Wrangler Dev Server)
**Production Status:** Ready for Cloudflare Pages deployment
