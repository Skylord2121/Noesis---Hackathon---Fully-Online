# AI Customer Coach - Deployment Information

## 🚀 Cloudflare Pages Deployments

### Production Environment
- **Project Name**: `ai-coach-prod`
- **Branch**: `main`
- **URL**: https://ai-coach-prod.pages.dev
- **Latest Deployment**: https://11c425ff.ai-coach-prod.pages.dev
- **Purpose**: Stable production release for end users

### Development Environment
- **Project Name**: `ai-coach-dev`
- **Branch**: `develop`
- **URL**: https://ai-coach-dev.pages.dev
- **Latest Deployment**: https://2c88bba3.ai-coach-dev.pages.dev
- **Purpose**: Testing and development branch

## 📦 Backup
- **Backup URL**: https://page.gensparksite.com/project_backups/webapp-working-backup.tar.gz
- **Backup Size**: 1.18 MB
- **Description**: Working AI Customer Coach with RunPod integration, CORS fixes, and full AI coaching features

## 🔧 Configuration

### Ollama/LLM Settings
- **Default URL**: https://86y7be6mjfb4mj-11434.proxy.runpod.net/api/generate
- **Default Model**: default:latest
- **Backend Proxy**: All Ollama calls routed through `/api/ollama/generate` to avoid CORS

### GitHub Repository
- **Repository**: https://github.com/Skylord2121/Noesis---Hackathon---Fully-Online
- **Main Branch**: Production-ready code
- **Develop Branch**: Development and testing

## 🔄 Deployment Workflow

### Deploying to Production
```bash
git checkout main
npm run build
npx wrangler pages deploy dist --project-name ai-coach-prod --branch main
```

### Deploying to Development
```bash
git checkout develop
npm run build
npx wrangler pages deploy dist --project-name ai-coach-dev --branch develop
```

### Merging Development to Production
```bash
# Test on develop first
git checkout develop
# ... make changes, test ...
git push origin develop

# When ready for production
git checkout main
git merge develop
git push origin main
npx wrangler pages deploy dist --project-name ai-coach-prod --branch main
```

## ✅ Features
- ✅ Real-time AI coaching powered by Ollama
- ✅ Emotional scoring (1-10 scale)
- ✅ Response quality metrics
- ✅ Voice analysis integration
- ✅ Company knowledge base
- ✅ Session management
- ✅ Light/Dark theme
- ✅ CORS-free backend proxy
- ✅ RunPod LLM integration

## 🔐 Security Notes
- All LLM URLs must be manually configured by users
- No hardcoded API endpoints
- CORS protection via backend proxy
- Cloudflare secrets for production API keys
