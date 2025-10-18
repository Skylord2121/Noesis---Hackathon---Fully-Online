# Empathy AI - Real-Time Call Center Dashboard

## 🎯 Project Overview

**Empathy AI** is an advanced real-time dashboard designed for BPO call centers that uses AI to monitor customer emotions during live calls and provide instant coaching suggestions to agents. The system helps agents maintain empathy, improve response quality, and deliver exceptional customer experiences.

**Tagline:** *"Empathy, in real time — for every conversation."*

## ✨ Key Features

### Core Functionality
- 🎤 **Real-Time Emotion Detection** - Detects customer emotions (frustration, confusion, disappointment, hopefulness) with confidence scores
- 💡 **Instant AI Coaching** - Provides live suggestions for empathetic phrasing, tone adjustments, and de-escalation techniques
- 📊 **Empathy Meter** - Visual real-time scoring (0-10) with historical tracking throughout the call
- 🎙️ **Voice Spectrum Analyzer** - Monitors volume, speech rate, tone stress, and clarity in real-time
- 📝 **Live Transcript** - Annotated conversation history with emotion tagging and acoustic analysis
- 🔍 **Smart Knowledge Base** - AI-powered retrieval of relevant KB articles based on conversation context
- 📈 **Performance Metrics** - Real-time call quality scoring and predicted CSAT

### BPO-Specific Features
- 👤 **Agent Profile Panel** - Shows agent stats (calls today, average handle time, CSAT score, empathy average)
- 👥 **Customer Context Panel** - Account type, tenure, previous call history, sentiment history, issue categories
- 🚨 **Escalation Controls** - One-click escalate to supervisor, transfer call, or put on hold
- 🎯 **Quality Assurance** - Post-call emotional analysis, coaching insights, and feedback loops
- 💼 **BPO Workflow Integration** - Designed to fit into existing call center operations
- 🧘 **Agent Wellness** - Stress detection and breathing exercises for agent mental health

### Dashboard Components

#### Left Column
1. **Agent Info Card** - Profile, stats, performance badges
2. **Customer Info Card** - Account details, history, sentiment patterns
3. **Voice Spectrum Analyzer** - Real-time audio analysis with visual waveform and stress alerts

#### Center Column
1. **Empathy Meter** - Circular gauge with live score and emotional journey timeline
2. **Current Emotions Panel** - Bar charts showing frustration, disappointment, confusion, hopefulness
3. **Live Transcript** - Color-coded speaker identification with emotion badges and acoustic tags
4. **Call Controls** - Hold, Escalate, Transfer, Mute, End Call buttons

#### Right Column
1. **AI Coaching Panel** - Prioritized suggestions (critical alerts, tone adjustments, empathy building)
2. **Knowledge Base Quick Access** - Contextually relevant articles
3. **Agent Wellness Checks** - Breathing exercises and stress management
4. **Performance Metrics** - This call's empathy score, response quality, suggestion adoption rate, predicted CSAT

## 🎨 Design Specifications

- **Theme:** Sleek dark mode with professional aesthetics
- **Color Scheme:** 
  - Primary: Blue (#3b82f6) for agent/system elements
  - Accent: Cyan (#06b6d4) for highlights
  - Background: Dark navy (#0a0e17, #0f172a)
  - Emotions: Red (frustration), Yellow (caution), Green (positive), Purple (neutral)
- **Glass Morphism:** Semi-transparent panels with backdrop blur effects
- **Animations:** Smooth transitions, pulse effects for live indicators, wave animations for audio
- **Typography:** Inter font family for clean, readable text

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Tailwind CSS** - Utility-first styling framework (via CDN)
- **Chart.js** - Real-time data visualization
- **Font Awesome** - Professional iconography

### Backend (Future Integration)
- **Hono Framework** - Lightweight web framework for Cloudflare Workers
- **Speech Emotion Recognition (SER)** - Real-time tone and sentiment analysis
- **NLP Engine** - Empathy response generation and phrase suggestions
- **WebSocket/gRPC** - Low-latency streaming for live feedback
- **Cloudflare Workers** - Edge computing for minimal latency

### Data Storage (Planned)
- **Cloudflare D1** - Call transcripts, emotion logs, performance metrics
- **Cloudflare KV** - Agent profiles, customer context, KB articles
- **Cloudflare R2** - Audio recordings (optional, privacy-compliant)

## 🌐 Live Demo

**Dashboard URL:** https://3000-i06fcpek5jlhyho4vufz5-b9b802c4.sandbox.novita.ai/static/dashboard.html

## 📊 Data Architecture

### Current Implementation (Visualization Only)
- Static HTML dashboard with simulated real-time data
- Chart.js for dynamic emotion tracking and empathy scoring
- Mock data updates every 5 seconds to demonstrate real-time capabilities

### Planned Production Architecture
```
Call Audio Stream → WebSocket → SER Engine → Emotion Analysis
                                    ↓
                              NLP Engine → Suggestion Generation
                                    ↓
                            Dashboard Updates (Real-time)
                                    ↓
                        D1 Database (Historical Logging)
```

## 🚀 Use Cases

### Primary Use Cases
1. **Live Agent Training** - Real-time coaching during actual customer calls
2. **Quality Assurance** - Post-call analysis and coaching feedback
3. **Performance Management** - Track empathy scores and improvement over time
4. **Customer Satisfaction** - Proactive intervention to prevent escalations

### Expansion Opportunities
- Integration with CRM systems (Salesforce, HubSpot, Zendesk)
- Integration with helpdesk tools
- Multi-language support for global BPO operations
- Supervisor dashboard for monitoring multiple agents simultaneously
- Compliance recording and analysis

## 🔒 Privacy & Security

- **Privacy-first architecture** - Optional on-premises inference
- **Data encryption** - All call data encrypted in transit and at rest
- **Compliance ready** - Designed for GDPR, CCPA, and industry-specific regulations
- **Opt-in recording** - Customer consent management
- **Anonymization** - PII removal options for training datasets

## 📈 Features Completed

✅ Full dashboard UI design  
✅ Real-time emotion detection visualization  
✅ Empathy meter with scoring  
✅ Live transcript with emotion tagging  
✅ Voice spectrum analyzer  
✅ AI coaching suggestion panel  
✅ Agent and customer profile cards  
✅ Call control buttons  
✅ Performance metrics display  
✅ Responsive dark theme with blue accents  
✅ Interactive charts (Chart.js integration)  
✅ Glass morphism design effects  

## 🔮 Features Not Yet Implemented

🔲 Backend WebSocket integration  
🔲 Real Speech Emotion Recognition engine  
🔲 Live NLP-based suggestion generation  
🔲 Database integration for historical data  
🔲 User authentication system  
🔲 Supervisor monitoring dashboard  
🔲 CRM/Helpdesk integrations  
🔲 Multi-language support  
🔲 Mobile responsive adjustments  
🔲 Export and reporting functionality  

## 🎯 Recommended Next Steps

1. **Backend API Development**
   - Create Hono API routes for WebSocket connections
   - Implement mock emotion detection endpoints
   - Set up Cloudflare D1 database for call logs

2. **Real-Time Data Integration**
   - Connect frontend to WebSocket API
   - Implement actual emotion detection service (or mock with realistic data)
   - Add authentication and agent session management

3. **Enhanced Features**
   - Build supervisor monitoring view
   - Add call recording playback with emotion timeline
   - Implement export functionality (PDF reports, CSV data)
   - Create analytics dashboard for management

4. **Production Deployment**
   - Deploy to Cloudflare Pages
   - Configure environment variables
   - Set up monitoring and error tracking
   - Performance optimization

5. **Integration Development**
   - Build CRM connectors (Salesforce API, Zendesk API)
   - Implement SSO authentication
   - Create webhook endpoints for third-party integrations

## 💻 Local Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View service
pm2 logs webapp --nostream

# Stop service
pm2 stop webapp
```

## 🤝 Integration Points for BPO Workflows

1. **Call Routing Systems** - Automatic dashboard launch when call connects
2. **CRM Systems** - Customer context auto-population
3. **Quality Management** - Automatic scoring and coaching reports
4. **Workforce Management** - Agent performance metrics feed
5. **Training Systems** - Coaching suggestion library management

## 📞 Workflow Integration Example

```
1. Incoming Call → System triggers dashboard
2. Customer identified → Profile loads automatically  
3. Call begins → Live emotion detection starts
4. AI suggestions appear → Agent views and applies
5. Call ends → Automatic quality scoring
6. Post-call → Coaching report generated
7. Weekly → Performance trends analyzed
```

## 🏆 Business Impact

- **Improved CSAT scores** - Real-time empathy coaching
- **Reduced escalations** - Proactive intervention suggestions
- **Faster training** - On-the-job learning for new agents
- **Better retention** - Agent wellness monitoring reduces burnout
- **Data-driven coaching** - Objective performance metrics
- **Competitive advantage** - AI-enhanced customer experience

## 📝 Deployment Status

- **Platform:** Cloudflare Pages (Planned)
- **Current Status:** ✅ Active (Development/Visualization)
- **Environment:** Sandbox demonstration
- **Tech Stack:** Hono + TypeScript + TailwindCSS + Chart.js
- **Last Updated:** 2025-10-14

---

**Note:** This is currently a high-fidelity visualization/prototype. Backend AI services and real-time emotion detection require additional implementation for production use.
