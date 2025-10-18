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

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Redirect root to live demo (the only page we need)
app.get('/', (c) => {
  return c.redirect('/static/live-demo')
})

export default app
