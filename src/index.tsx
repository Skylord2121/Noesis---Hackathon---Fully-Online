import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.text('Dashboard is at /static/dashboard.html or /static/live-demo.html')
})

export default app
