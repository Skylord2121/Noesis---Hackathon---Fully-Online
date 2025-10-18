import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Noesis - BPO Call Center Dashboard</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-8">
      <div class="max-w-2xl text-center">
        <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Noesis
        </h1>
        <p class="text-xl text-gray-400 mb-12">Real-Time Call Intelligence Platform</p>
        
        <div class="space-y-4">
          <a href="/static/live-demo" 
             class="block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105">
            🎬 Live Call Simulation
            <span class="block text-sm mt-1 opacity-80">Watch a real BrightWave Support call with live AI analysis</span>
          </a>
          
          <a href="/static/dashboard" 
             class="block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-8 rounded-lg transition-all border border-blue-500/30">
            📊 Static Dashboard
            <span class="block text-sm mt-1 opacity-80">View the dashboard interface</span>
          </a>
        </div>
      </div>
    </body>
    </html>
  `)
})

export default app
