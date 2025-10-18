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

// Cloudflare AI Analysis Endpoint
app.post('/api/ai-analysis', async (c) => {
  try {
    const { text, conversationHistory, voiceMetrics } = await c.req.json()
    
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

TASK: Provide SHORT, actionable coaching using COMPANY KNOWLEDGE and VOICE ANALYSIS above. Keep suggestions brief and punchy.

CRITICAL RULES:
1. CUSTOMER NAME: Extract if mentioned ("My name is Sarah", "I'm John", "This is Mike")
2. ISSUE: Be specific (Password Reset, Billing Dispute, Refund, Shipping Delay, Account Locked)
3. COACHING: 
   - Use COMPANY KNOWLEDGE BASE to reference specific policies/procedures
   - Keep it SHORT unless complex protocol needed (1-2 sentences max)
   - ONLY give detailed steps if technical issue requires it
   - Cite specific policy/procedure when relevant (e.g., "Per refund policy...")
   - Use RECOMMENDED PHRASES, avoid FORBIDDEN PHRASES

GOOD SHORT COACHING EXAMPLES:
"Per refund policy: Full refund available within 30 days. Ask for purchase date."
"Follow password reset procedure: Verify email and last 4 digits of phone."
"Use greeting script for upset customers. Acknowledge frustration first."

Respond ONLY with valid JSON:
{
  "sentiment": 0.0-1.0,
  "empathy": 0.0-10.0,
  "quality": 0.0-10.0,
  "stress": "Low"|"Medium"|"High",
  "clarity": "Poor"|"Fair"|"Good"|"Excellent",
  "predictedCSAT": 0.0-10.0,
  "customerName": "FirstName LastName"|null,
  "issue": "Specific Issue",
  "coaching": [
    {
      "type": "action"|"empathy"|"knowledge",
      "title": "Brief title (3-5 words)",
      "message": "Short suggestion (1-2 sentences max, unless technical protocol)"
    }
  ]
}`

    // Use Cloudflare AI
    const ai = c.env.AI
    
    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds only in valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 500
    })

    // Parse AI response
    let analysis
    try {
      const responseText = response.response || JSON.stringify(response)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback response if parsing fails
      analysis = {
        sentiment: 0.5,
        empathy: 7.0,
        quality: 7.0,
        stress: 'Medium',
        clarity: 'Good',
        predictedCSAT: 7.0,
        customerName: null,
        issue: 'General Inquiry',
        coaching: [{
          type: 'empathy',
          title: 'Listen Actively',
          message: 'Focus on understanding the customer\'s concern fully.'
        }]
      }
    }

    return c.json({ success: true, analysis })
    
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return c.json({ 
      success: false, 
      error: error.message,
      analysis: {
        sentiment: 0.5,
        empathy: 7.0,
        quality: 7.0,
        stress: 'Medium',
        clarity: 'Good',
        predictedCSAT: 7.0,
        customerName: null,
        issue: 'General Inquiry',
        coaching: [{
          type: 'knowledge',
          title: 'AI Unavailable',
          message: 'Continue assisting customer. AI analysis temporarily unavailable.'
        }]
      }
    }, 500)
  }
})

// Test Ollama Connection
app.post('/api/test-ollama', async (c) => {
  try {
    const { ollamaUrl, model } = await c.req.json()
    const url = ollamaUrl || 'http://localhost:11434'
    const testModel = model || 'qwen2.5:3b'
    
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
    const ollamaModel = model || 'qwen2.5:3b'
    
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
