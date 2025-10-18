import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Redirect root to live demo (the only page we need)
app.get('/', (c) => {
  return c.redirect('/static/live-demo')
})

export default app
