import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

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

// Cloudflare AI Analysis Endpoint
app.post('/api/ai-analysis', async (c) => {
  try {
    const { text, conversationHistory } = await c.req.json()
    
    if (!text) {
      return c.json({ success: false, error: 'Text is required' }, 400)
    }

    // Build conversation context
    const conversationContext = conversationHistory
      ?.slice(-10)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n') || ''

    const prompt = `You are an expert customer service analyst providing real-time coaching to a live agent.

CONVERSATION:
${conversationContext}

LATEST CUSTOMER: "${text}"

TASK: Provide SHORT, actionable coaching. Keep suggestions brief and punchy.

CRITICAL RULES:
1. CUSTOMER NAME: Extract if mentioned ("My name is Sarah", "I'm John", "This is Mike")
2. ISSUE: Be specific (Password Reset, Billing Dispute, Refund, Shipping Delay, Account Locked)
3. COACHING: Keep it SHORT unless complex protocol needed
   - DEFAULT: 1-2 sentences max
   - ONLY give detailed steps if technical issue requires it
   - Focus on WHAT to do, not HOW in detail

GOOD SHORT COACHING:
"Acknowledge frustration first. Say: 'I understand how frustrating this is. Let me help you right away.'"
"Ask for order number. Check if refund was already issued."
"Password reset link expires in 24hrs. Check spam folder if not received."

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
    const { sessionId, role, content, timestamp } = await c.req.json()
    
    if (!sessionId || !role || !content) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    const message = {
      role,
      content,
      timestamp: timestamp || Date.now()
    }
    
    // Store in KV (for production)
    // For MVP, we'll use in-memory storage via Workers Cache API
    const cacheKey = new Request(`https://internal.cache/${sessionId}/messages`)
    const cache = caches.default
    
    // Get existing messages
    let messages = []
    try {
      const cachedResponse = await cache.match(cacheKey)
      if (cachedResponse) {
        const data = await cachedResponse.json()
        messages = data.messages || []
      }
    } catch (e) {
      console.log('No cached messages found')
    }
    
    // Add new message
    messages.push(message)
    
    // Store back in cache
    const newResponse = new Response(JSON.stringify({ messages }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    })
    await cache.put(cacheKey, newResponse)
    
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
    
    // Get messages from cache
    const cacheKey = new Request(`https://internal.cache/${sessionId}/messages`)
    const cache = caches.default
    
    let messages = []
    try {
      const cachedResponse = await cache.match(cacheKey)
      if (cachedResponse) {
        const data = await cachedResponse.json()
        messages = data.messages || []
      }
    } catch (e) {
      console.log('No cached messages found')
    }
    
    // Filter messages newer than 'since' timestamp
    const newMessages = messages.filter(msg => msg.timestamp > since)
    
    return c.json({ success: true, messages: newMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Query Documents API - Search indexed company documents
app.post('/api/query-docs', async (c) => {
  try {
    const { query, top_k = 3, ollamaUrl } = await c.req.json()
    const url = ollamaUrl || 'http://localhost:11434'
    
    if (!query || query.trim().length === 0) {
      return c.json({ 
        success: false, 
        error: 'Query is required' 
      }, 400)
    }
    
    // Note: This endpoint expects the user to have run document_indexer.py locally
    // The actual RAG retrieval happens via the query_documents.py script
    // For now, we'll provide a simple response suggesting relevant document sections
    
    // In production, you would:
    // 1. Load the vector index from disk (.index directory)
    // 2. Query it with the user's question
    // 3. Return the most relevant chunks
    
    // For MVP, we'll use Ollama directly with document context
    // This is a simplified approach - full RAG would use the vector index
    
    const response = {
      success: true,
      query: query,
      message: 'Document query endpoint ready. Run document_indexer.py locally to enable full RAG retrieval.',
      suggestion: 'For now, the AI coaching system will include general guidance. After indexing, it will reference specific company policies.'
    }
    
    return c.json(response)
    
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
