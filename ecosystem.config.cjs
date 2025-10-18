module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
