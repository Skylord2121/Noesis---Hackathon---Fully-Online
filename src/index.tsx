import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// In-memory session storage (for local development)
// In production, use Cloudflare KV or Durable Objects
const sessions = new Map<string, Array<any>>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Ollama Proxy API - Bypass CORS
app.post('/api/ollama/generate', async (c) => {
  try {
    const body = await c.req.json()
    const ollamaUrl = body.ollamaUrl || 'http://localhost:11434'
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: body.model,
        prompt: body.prompt,
        stream: false,
        options: body.options || {}
      })
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/api/ollama/tags', async (c) => {
  try {
    const ollamaUrl = c.req.query('url') || 'http://localhost:11434'
    const response = await fetch(`${ollamaUrl}/api/tags`)
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Load company knowledge
import companyKnowledge from '../config/company-knowledge.json'

// Ollama AI Analysis Endpoint (ONLY SOURCE - No fallback)
app.post('/api/ai-analysis', async (c) => {
  // Parse request body FIRST, outside try/catch so it's accessible in fallback
  const { text, conversationHistory, voiceMetrics } = await c.req.json()
  
  try {
    
    console.log('=================================================')
    console.log('[AI ANALYSIS] NEW REQUEST')
    console.log('[AI ANALYSIS] Customer text:', text)
    console.log('[AI ANALYSIS] Voice metrics:', voiceMetrics ? 'Present' : 'None')
    console.log('=================================================')
    
    if (!text) {
      return c.json({ success: false, error: 'Text is required' }, 400)
    }

    // Build conversation context
    const conversationContext = conversationHistory
      ?.slice(-10)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n') || ''
    
    // Build voice analysis context if available
    let voiceContext = ''
    if (voiceMetrics && voiceMetrics.volume > 0) {
      voiceContext = `\nVOICE ANALYSIS:
- Volume: ${voiceMetrics.volume}/100 (${voiceMetrics.volume > 60 ? 'LOUD - possibly angry/stressed' : voiceMetrics.volume > 30 ? 'Normal' : 'Quiet - possibly calm/sad'})
- Pitch: ${voiceMetrics.pitch}Hz (${voiceMetrics.pitch > 250 ? 'HIGH - stressed/excited' : voiceMetrics.pitch > 150 ? 'Normal' : 'LOW - calm/sad'})
- Speech Rate: ${voiceMetrics.speechRate} words/sec (${voiceMetrics.speechRate > 4 ? 'FAST - stressed/rushed' : voiceMetrics.speechRate > 2 ? 'Normal' : 'SLOW - calm/confused'})
- Energy: ${voiceMetrics.energy}/100 (${voiceMetrics.energy > 70 ? 'HIGH intensity' : voiceMetrics.energy > 30 ? 'Moderate' : 'LOW intensity'})\n`
    }

    // Build company knowledge context
    const knowledgeDocs = Object.values(companyKnowledge.documents)
      .map(doc => `${doc.title}:\n${doc.content}`)
      .join('\n\n---\n\n')
    
    const quickRefs = Object.entries(companyKnowledge.quick_references)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const prompt = `You are an expert customer service analyst providing real-time coaching to a live agent.

COMPANY KNOWLEDGE BASE:
${knowledgeDocs}

QUICK REFERENCES:
${quickRefs}

RECOMMENDED PHRASES: ${companyKnowledge.recommended_phrases.join(', ')}
AVOID PHRASES: ${companyKnowledge.forbidden_phrases.join(', ')}

CONVERSATION:
${conversationContext}
${voiceContext}
LATEST CUSTOMER: "${text}"

CRITICAL RULES FOR SENTIMENT:
1. READ THE WORDS: If customer SAYS "I'm happy" or "I'm frustrated", TRUST their words
2. Sentiment scale:
   - "happy", "great", "wonderful", "thank you" = 0.7-1.0 (Happy)
   - "okay", "fine", "alright", neutral tone = 0.5-0.7 (Neutral)
   - "frustrated", "upset", "angry", "disappointed" = 0.0-0.4 (Upset/Frustrated)
3. Voice metrics are HINTS, not absolute truth
4. Customer's STATED emotion overrides voice analysis

COACHING RULES:
1. ULTRA-SHORT messages (3-5 words max)
2. Quick glanceable nudges, not paragraphs
3. Use action verbs: "Ask", "Offer", "Acknowledge", "Check"
4. Agent should instantly know what to do

GOOD COACHING EXAMPLES:
{"type": "empathy", "title": "Match energy", "message": "Mirror happy tone"}
{"type": "action", "title": "Verify account", "message": "Ask email + DOB"}
{"type": "knowledge", "title": "Refund ready", "message": "30-day full refund"}

NAME EXTRACTION:
- "My name is Sarah" → "Sarah"
- "I'm John Smith" → "John Smith"  
- "This is Mike" → "Mike"
- If no name mentioned, return null

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "sentiment": 0.5,
  "empathy": 7.0,
  "quality": 7.0,
  "stress": "Medium",
  "clarity": "Good",
  "predictedCSAT": 7.0,
  "customerName": "John Smith",
  "issue": "General Inquiry",
  "coaching": [
    {
      "type": "empathy",
      "title": "2-4 words",
      "message": "3-5 words max"
    }
  ]
}`

    // ONLY USE OLLAMA - No fallback
    // Use environment variable for Ollama URL (supports ngrok tunnels)
    const ollamaUrl = c.env?.OLLAMA_URL || 'http://localhost:11434'
    console.log('[OLLAMA] Calling Ollama at', ollamaUrl + '/api/generate')
    console.log('[OLLAMA] Model: qwen2.5:8b')
    
    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:8b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 500
        }
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })
    
    if (!ollamaResponse.ok) {
      console.error('[OLLAMA] HTTP Error:', ollamaResponse.status, ollamaResponse.statusText)
      throw new Error(`Ollama returned ${ollamaResponse.status}: ${ollamaResponse.statusText}`)
    }
    
    const ollamaData = await ollamaResponse.json()
    const responseText = ollamaData.response.trim()
    
    console.log('[OLLAMA] Raw response length:', responseText.length)
    console.log('[OLLAMA] Raw response preview:', responseText.substring(0, 300))
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[OLLAMA] No JSON found in response')
      throw new Error('Ollama did not return valid JSON')
    }
    
    const analysis = JSON.parse(jsonMatch[0])
    console.log('[OLLAMA] ✓ Successfully parsed JSON')
    console.log('[OLLAMA] Analysis:', JSON.stringify(analysis, null, 2))

    return c.json({ success: true, analysis, aiSource: 'ollama' })
    
  } catch (ollamaError) {
    console.error('=================================================')
    console.error('[OLLAMA] ❌ CRITICAL ERROR - Ollama unavailable')
    console.error('[OLLAMA] Error message:', ollamaError.message)
    console.error('[OLLAMA] Stack:', ollamaError.stack)
    console.error('[OLLAMA] Using emergency rule-based fallback')
    console.error('=================================================')
    
    // EMERGENCY FALLBACK - Basic rule-based analysis when Ollama is down
    // This is NOT AI - just simple keyword matching to keep system functional
    // text variable is now accessible since it was parsed outside try/catch
    const lowerText = (text || '').toLowerCase()
    
    // Detect customer name
    const nameMatch = text.match(/(?:my name is|i'm|this is|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
    const customerName = nameMatch ? nameMatch[1] : null
    
    // Detect issue type
    let issue = 'General Inquiry'
    if (lowerText.includes('refund') || lowerText.includes('money back')) issue = 'Refund Request'
    else if (lowerText.includes('password') || lowerText.includes('login')) issue = 'Account Access'
    else if (lowerText.includes('order') || lowerText.includes('delivery')) issue = 'Order Issue'
    
    // Sentiment from keywords and voice
    let sentiment = 0.5
    let empathy = 5.0
    let quality = 5.0
    let stress = 'Medium'
    
    if (lowerText.includes('upset') || lowerText.includes('angry') || lowerText.includes('frustrated')) {
      sentiment = 0.3
      empathy = 3.5
      quality = 4.0
      stress = 'High'
    } else if (voiceMetrics && voiceMetrics.volume > 60) {
      sentiment = 0.4
      empathy = 4.0
      stress = 'High'
    }
    
    const analysis = {
      sentiment,
      empathy,
      quality,
      stress,
      clarity: 'Good',
      predictedCSAT: empathy,
      customerName,
      issue,
      coaching: [{
        type: 'system',
        title: '⚠️ Ollama Unavailable',
        message: 'Using basic analysis. Install Ollama for AI-powered coaching.'
      }, {
        type: 'empathy',
        title: stress === 'High' ? 'Customer Upset' : 'Active Listening',
        message: stress === 'High' ? 'Show empathy and acknowledge frustration' : 'Maintain professional tone'
      }]
    }
    
    console.log('[FALLBACK] Generated basic analysis:', JSON.stringify(analysis, null, 2))
    
    return c.json({ 
      success: true, 
      analysis, 
      aiSource: 'fallback',
      warning: 'Ollama unavailable - using basic rule-based analysis'
    })
  }
})

// Test Ollama Connection
app.post('/api/test-ollama', async (c) => {
  try {
    const { ollamaUrl, model } = await c.req.json()
    const url = ollamaUrl || 'http://localhost:11434'
    const testModel = model || 'qwen2.5:8b'
    
    // Test 1: Check if Ollama server is reachable
    const tagsResponse = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (!tagsResponse.ok) {
      return c.json({ 
        success: false, 
        error: `Ollama server returned ${tagsResponse.status}`,
        message: 'Could not connect to Ollama server'
      })
    }
    
    const tagsData = await tagsResponse.json()
    const availableModels = tagsData.models?.map(m => m.name) || []
    
    // Test 2: Check if requested model is available
    const modelExists = availableModels.some(m => m.includes(testModel.split(':')[0]))
    
    if (!modelExists) {
      return c.json({
        success: false,
        error: `Model "${testModel}" not found`,
        message: `Model not available. Found models: ${availableModels.join(', ')}`,
        availableModels
      })
    }
    
    // Test 3: Try a simple generation
    const testResponse = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: testModel,
        prompt: 'Say "Hello" in one word.',
        stream: false,
        options: { num_predict: 10 }
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!testResponse.ok) {
      return c.json({
        success: false,
        error: 'Model generation failed',
        message: `Could not generate with model "${testModel}"`
      })
    }
    
    const testData = await testResponse.json()
    
    return c.json({
      success: true,
      message: `Successfully connected to Ollama!`,
      details: {
        url,
        model: testModel,
        availableModels,
        testResponse: testData.response?.substring(0, 50)
      }
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Connection failed. Make sure Ollama is running and accessible.'
    }, 500)
  }
})

// AI Coaching Analysis - Analyze customer messages with Ollama
app.post('/api/analyze-message', async (c) => {
  try {
    const { customerMessage, conversationHistory, agentName, customerName, ollamaUrl, model } = await c.req.json()
    const url = ollamaUrl || 'http://localhost:11434'
    const ollamaModel = model || 'qwen2.5:8b'
    
    // Build conversation context for Ollama
    let context = "You are an expert call center coach analyzing a customer service conversation in real-time.\n\n"
    context += "CONVERSATION HISTORY:\n"
    
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        context += `${msg.speaker === 'agent' ? agentName : customerName}: ${msg.text}\n`
      })
    }
    
    context += `\nLATEST CUSTOMER MESSAGE:\n${customerName}: ${customerMessage}\n\n`
    
    context += `TASK: Analyze the customer's latest message and provide coaching for the agent (${agentName}). Focus on:\n`
    context += `1. Customer's emotional state (frustration, confusion, satisfaction, etc.)\n`
    context += `2. What the agent should do next\n`
    context += `3. Specific empathetic phrases the agent can use\n`
    context += `4. Any red flags or escalation risks\n\n`
    context += `Respond in JSON format with these fields:\n`
    context += `{\n`
    context += `  "type": "de-escalation|empathy|action|transparency|resolution|knowledge",\n`
    context += `  "title": "Brief title for the coaching card",\n`
    context += `  "message": "Detailed coaching advice for the agent",\n`
    context += `  "phrase": "An exact phrase the agent can use (or null if not applicable)",\n`
    context += `  "priority": 1-3 (1=critical, 2=important, 3=nice-to-have)\n`
    context += `}\n\n`
    context += `Only return the JSON object, nothing else.`
    
    // Call Ollama API
    const ollamaResponse = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: context,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 300
        }
      })
    })
    
    const ollamaData = await ollamaResponse.json()
    
    // Parse the AI response
    let coaching
    try {
      // Extract JSON from response (sometimes Ollama adds extra text)
      const responseText = ollamaData.response.trim()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        coaching = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if JSON parsing fails
        coaching = {
          type: 'empathy',
          title: 'AI Suggestion',
          message: responseText.substring(0, 200),
          phrase: null,
          priority: 2
        }
      }
    } catch (parseError) {
      // If parsing fails completely, return a generic response
      coaching = {
        type: 'action',
        title: 'AI Analysis Available',
        message: ollamaData.response.substring(0, 200),
        phrase: null,
        priority: 2
      }
    }
    
    return c.json({ success: true, coaching })
  } catch (error) {
    console.error('Ollama API Error:', error)
    return c.json({ 
      success: false, 
      error: error.message,
      coaching: {
        type: 'knowledge',
        title: 'AI Analysis Unavailable',
        message: 'Could not connect to AI coaching service. Please check if Ollama is running.',
        phrase: null,
        priority: 3
      }
    }, 500)
  }
})

// Session Management API Routes
// Check if session exists
app.get('/api/session/check', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400)
    }
    
    // For now, always return true (we'll use KV for production)
    // In production, check if session exists in KV
    return c.json({ success: true, exists: true })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Send message to session
app.post('/api/session/message', async (c) => {
  try {
    const { sessionId, role, content, timestamp, voiceMetrics } = await c.req.json()
    
    if (!sessionId || !role || !content) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    const message = {
      role,
      content,
      timestamp: timestamp || Date.now(),
      voiceMetrics: voiceMetrics || null  // Include voice analysis data
    }
    
    // Use in-memory storage for local development
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, [])
    }
    
    const messages = sessions.get(sessionId)!
    messages.push(message)
    
    console.log(`[SESSION ${sessionId}] New ${role} message: "${content.substring(0, 50)}..."`)
    console.log(`[SESSION ${sessionId}] Total messages: ${messages.length}`)
    
    return c.json({ success: true, message })
  } catch (error) {
    console.error('Error storing message:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Voice metrics storage (for real-time spectrum visualization)
const sessionVoiceMetrics = new Map<string, any>()

// Session status and verification tracking
const sessionStatus = new Map<string, {
  status: 'active' | 'on-hold' | 'ended',
  isVerified: boolean,
  verifiedAt?: number
}>()

// Store voice metrics update
app.post('/api/session/voice-metrics', async (c) => {
  try {
    const { sessionId, voiceMetrics } = await c.req.json()
    
    if (!sessionId || !voiceMetrics) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Store latest voice metrics for this session
    sessionVoiceMetrics.set(sessionId, {
      ...voiceMetrics,
      timestamp: Date.now()
    })
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Debug endpoint - list all messages in a session
app.get('/api/session/debug', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400)
    }
    
    const messages = sessions.get(sessionId) || []
    
    return c.json({ 
      success: true, 
      sessionId,
      messageCount: messages.length,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content.substring(0, 100),
        timestamp: m.timestamp,
        hasVoiceMetrics: !!m.voiceMetrics
      }))
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get latest voice metrics for session
app.get('/api/session/voice-metrics', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400)
    }
    
    const metrics = sessionVoiceMetrics.get(sessionId)
    
    // Clear old metrics (older than 2 seconds)
    if (metrics && Date.now() - metrics.timestamp > 2000) {
      sessionVoiceMetrics.delete(sessionId)
      return c.json({ success: true, metrics: null })
    }
    
    return c.json({ success: true, metrics })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get session status and verification
app.get('/api/session/status', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400)
    }
    
    // Initialize status if not exists
    if (!sessionStatus.has(sessionId)) {
      sessionStatus.set(sessionId, { status: 'active', isVerified: false })
    }
    
    const status = sessionStatus.get(sessionId)
    return c.json({ success: true, status })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update session status (active/on-hold/ended)
app.post('/api/session/status', async (c) => {
  try {
    const { sessionId, status: newStatus } = await c.req.json()
    
    if (!sessionId || !newStatus) {
      return c.json({ success: false, error: 'Session ID and status required' }, 400)
    }
    
    if (!['active', 'on-hold', 'ended'].includes(newStatus)) {
      return c.json({ success: false, error: 'Invalid status' }, 400)
    }
    
    // Get or create status
    const currentStatus = sessionStatus.get(sessionId) || { status: 'active', isVerified: false }
    currentStatus.status = newStatus
    sessionStatus.set(sessionId, currentStatus)
    
    console.log(`[SESSION ${sessionId}] Status updated to: ${newStatus}`)
    
    return c.json({ success: true, status: currentStatus })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update verification status
app.post('/api/session/verify', async (c) => {
  try {
    const { sessionId, isVerified } = await c.req.json()
    
    if (!sessionId || isVerified === undefined) {
      return c.json({ success: false, error: 'Session ID and isVerified required' }, 400)
    }
    
    // Get or create status
    const currentStatus = sessionStatus.get(sessionId) || { status: 'active', isVerified: false }
    currentStatus.isVerified = isVerified
    if (isVerified) {
      currentStatus.verifiedAt = Date.now()
    } else {
      delete currentStatus.verifiedAt
    }
    sessionStatus.set(sessionId, currentStatus)
    
    console.log(`[SESSION ${sessionId}] Verification updated to: ${isVerified}`)
    
    return c.json({ success: true, status: currentStatus })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get messages from session
app.get('/api/session/messages', async (c) => {
  try {
    const sessionId = c.req.query('sessionId')
    const since = parseInt(c.req.query('since') || '0')
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID required' }, 400)
    }
    
    // Get messages from in-memory storage
    const messages = sessions.get(sessionId) || []
    
    // Filter messages newer than 'since' timestamp
    const newMessages = messages.filter(msg => msg.timestamp > since)
    
    console.log(`[SESSION ${sessionId}] Fetching messages since ${since}, found ${newMessages.length} new messages`)
    
    return c.json({ success: true, messages: newMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get Company Knowledge
app.get('/api/company-knowledge', async (c) => {
  try {
    return c.json({ 
      success: true, 
      knowledge: companyKnowledge 
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Update Company Knowledge (simple version - returns instructions)
app.post('/api/company-knowledge', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'To update company knowledge, edit the file: /home/user/webapp/config/company-knowledge.json',
      instructions: [
        '1. Open the file in a text editor',
        '2. Update the documents section with your company policies',
        '3. Save the file',
        '4. Rebuild and restart: npm run build && pm2 restart webapp',
        '5. AI will automatically use the updated knowledge in coaching'
      ],
      currentFile: '/home/user/webapp/config/company-knowledge.json'
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Add new document to company knowledge
app.post('/api/company-knowledge/add', async (c) => {
  try {
    const { key, document } = await c.req.json()
    
    if (!key || !document || !document.title || !document.content) {
      return c.json({ 
        success: false, 
        error: 'Key, title, and content are required' 
      }, 400)
    }
    
    // Add to in-memory knowledge (runtime only - not persisted)
    companyKnowledge.documents[key] = document
    companyKnowledge.lastUpdated = new Date().toISOString()
    
    return c.json({
      success: true,
      message: 'Document added successfully (session only)',
      note: 'This change is temporary. To persist, edit config/company-knowledge.json'
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Update existing document
app.post('/api/company-knowledge/update', async (c) => {
  try {
    const { key, document } = await c.req.json()
    
    if (!key || !document) {
      return c.json({ 
        success: false, 
        error: 'Key and document are required' 
      }, 400)
    }
    
    if (!companyKnowledge.documents[key]) {
      return c.json({ 
        success: false, 
        error: 'Document not found' 
      }, 404)
    }
    
    // Update in-memory knowledge (runtime only - not persisted)
    companyKnowledge.documents[key] = document
    companyKnowledge.lastUpdated = new Date().toISOString()
    
    return c.json({
      success: true,
      message: 'Document updated successfully (session only)',
      note: 'This change is temporary. To persist, edit config/company-knowledge.json'
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Delete document
app.post('/api/company-knowledge/delete', async (c) => {
  try {
    const { key } = await c.req.json()
    
    if (!key) {
      return c.json({ 
        success: false, 
        error: 'Key is required' 
      }, 400)
    }
    
    if (!companyKnowledge.documents[key]) {
      return c.json({ 
        success: false, 
        error: 'Document not found' 
      }, 404)
    }
    
    // Delete from in-memory knowledge (runtime only - not persisted)
    delete companyKnowledge.documents[key]
    companyKnowledge.lastUpdated = new Date().toISOString()
    
    return c.json({
      success: true,
      message: 'Document deleted successfully (session only)',
      note: 'This change is temporary. To persist, edit config/company-knowledge.json'
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Redirect root to agent dashboard
app.get('/', (c) => {
  return c.redirect('/static/agent.html')
})

// Keep old live-demo route for reference
app.get('/demo', (c) => {
  return c.redirect('/static/live-demo.html')
})

export default app
