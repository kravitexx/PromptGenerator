# Deployment Guide

This guide covers deploying the AI Prompt Generator to various platforms, with detailed instructions for Vercel (recommended) and other hosting providers.

## 🚀 Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments, edge functions, and seamless environment variable management.

### Prerequisites

- Vercel account ([sign up here](https://vercel.com))
- GitHub repository with your code
- All required API keys and credentials

### Step 1: Connect Repository

1. **Login to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" as the framework preset

### Step 2: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required Variables
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
CLERK_SECRET_KEY=sk_live_your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Optional Variables (for Google Drive)
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Update Clerk Configuration

1. **Update Clerk URLs**
   - Go to your Clerk dashboard
   - Update the following URLs to match your Vercel domain:
     - Homepage URL: `https://your-domain.vercel.app`
     - Sign-in URL: `https://your-domain.vercel.app/sign-in`
     - Sign-up URL: `https://your-domain.vercel.app/sign-up`
     - After sign-in URL: `https://your-domain.vercel.app/chat`

2. **Configure OAuth Providers**
   - Ensure Google OAuth is configured with correct redirect URIs
   - Add your Vercel domain to authorized origins

### Step 4: Deploy

1. **Automatic Deployment**
   - Push to your main branch
   - Vercel will automatically build and deploy

2. **Manual Deployment**
   ```bash
   vercel --prod
   ```

### Step 5: Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update Clerk configuration with new domain

## 🐳 Docker Deployment

For containerized deployments using Docker.

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    env_file:
      - .env.local
```

### Build and Run

```bash
# Build the image
docker build -t ai-prompt-generator .

# Run the container
docker run -p 3000:3000 --env-file .env.local ai-prompt-generator

# Or use Docker Compose
docker-compose up -d
```

## ☁️ Other Cloud Platforms

### Netlify

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`

2. **Environment Variables**
   - Add all required environment variables in Netlify dashboard
   - Update `NEXT_PUBLIC_APP_URL` to your Netlify domain

3. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

### Railway

1. **Deploy from GitHub**
   - Connect your repository to Railway
   - Railway will auto-detect Next.js

2. **Environment Variables**
   - Add variables in Railway dashboard
   - Update URLs to match Railway domain

3. **Custom Start Command**
   ```
   npm start
   ```

### DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select Node.js environment

2. **Configure Build**
   - Build command: `npm run build`
   - Run command: `npm start`

3. **Environment Variables**
   - Add all required variables
   - Update domain references

## 🔧 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Use Clerk test keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging-your-app.vercel.app
# Use Clerk test keys for staging
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Use Clerk live keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## 🔍 Post-Deployment Checklist

### Functionality Tests
- [ ] Authentication flow works
- [ ] API key input and validation
- [ ] Prompt generation with Gemini API
- [ ] Image upload and analysis
- [ ] Google Drive integration (if enabled)
- [ ] Custom format creation
- [ ] Responsive design on mobile

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 5 seconds
- [ ] Image upload handling
- [ ] Error handling and recovery

### Security Tests
- [ ] HTTPS enabled
- [ ] API keys not exposed in client
- [ ] Proper CORS configuration
- [ ] Authentication redirects work
- [ ] Protected routes are secure

### SEO and Accessibility
- [ ] Meta tags configured
- [ ] Proper heading structure
- [ ] Alt text for images
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## 🐛 Troubleshooting Deployment Issues

### Common Build Errors

**"Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**TypeScript errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Environment variable issues**
- Ensure all required variables are set
- Check variable names match exactly
- Verify Clerk keys are for correct environment

### Runtime Errors

**Authentication not working**
- Verify Clerk configuration matches deployment URL
- Check OAuth provider settings
- Ensure redirect URLs are correct

**API calls failing**
- Check CORS configuration
- Verify API endpoints are accessible
- Test with Postman collection

**Google Drive integration issues**
- Verify OAuth credentials
- Check API permissions
- Test Drive API access

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics
- Check bundle size with `npm run analyze`
- Optimize images and assets

**API timeouts**
- Increase function timeout limits
- Implement request caching
- Add retry mechanisms

## 📊 Monitoring and Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to your layout:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Speed Insights for performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

For additional help with deployment, check the [troubleshooting section](../README.md#troubleshooting) in the main README or create an issue in the repository.