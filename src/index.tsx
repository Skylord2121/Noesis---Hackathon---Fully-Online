import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Dashboard is at /static/dashboard.html or /index.html')
})

export default app
