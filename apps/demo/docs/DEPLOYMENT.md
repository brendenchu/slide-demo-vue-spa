# Vue SPA Deployment Guide

**Project**: Vue Slide Demo - Vue 3 SPA
**Last Updated**: January 11, 2026

## Table of Contents

- [Overview](#overview)
- [Build Process](#build-process)
- [Deployment Platforms](#deployment-platforms)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Nginx](#nginx)
  - [Apache](#apache)
  - [GitHub Pages](#github-pages)
- [Backend Coordination](#backend-coordination)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Vue SPA is a static site that can be deployed to any static hosting service. After building, the `dist/` directory contains all the files needed for deployment.

### Requirements

- **Node.js** 18+ for building
- **Static hosting** for serving files
- **HTTPS** required for API mode (secure token authentication)
- **Backend API** accessible from deployed domain (API mode)

### Build Output

```
dist/
├── assets/              # JavaScript and CSS bundles
│   ├── index-{hash}.js
│   └── index-{hash}.css
├── index.html           # SPA entry point
└── vite.svg             # Favicon
```

---

## Build Process

### Production Build

```bash
# 1. Install dependencies
npm install

# 2. Create production environment file
cp .env.example .env.production

# 3. Configure for production
nano .env.production
# Set: VITE_DATA_SOURCE=api
# Set: VITE_API_URL=https://api.yourdomain.com

# 4. Build for production
npm run build

# Output: dist/ directory
```

### Build Verification

```bash
# Preview the production build locally
npm run preview

# Opens at: http://localhost:4173
# Test all features before deploying
```

### Build Options

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production"
  }
}
```

---

## Deployment Platforms

### Netlify

**Recommended for:** Quick deployment, continuous delivery, free tier

#### Method 1: Drag & Drop

1. Build locally:

```bash
npm run build
```

2. Go to [Netlify Drop](https://app.netlify.com/drop)

3. Drag `dist/` folder to upload

4. Done! Site deployed at `https://random-name.netlify.app`

#### Method 2: Git Integration (Recommended)

1. **Push to Git**:

```bash
git push origin main
```

2. **Connect Repository**:

- Go to [Netlify](https://app.netlify.com)
- Click "Add new site" → "Import an existing project"
- Choose Git provider (GitHub, GitLab, Bitbucket)
- Select repository

3. **Configure Build Settings**:

```yaml
Build command: npm run build
Publish directory: dist
```

4. **Set Environment Variables**:

```
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.yourdomain.com
VITE_DEBUG=false
```

5. **Deploy**:

- Click "Deploy site"
- Deploys automatically on every push

#### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

# Redirect all requests to index.html for SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Custom Domain

1. Go to "Domain settings"
2. Add custom domain
3. Update DNS records:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

4. Enable HTTPS (automatic with Netlify)

---

### Vercel

**Recommended for:** Next.js-like experience, edge network, free tier

#### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Build
npm run build

# Deploy
vercel --prod

# Follow prompts to link project
```

#### Method 2: Git Integration (Recommended)

1. **Push to Git**:

```bash
git push origin main
```

2. **Import Project**:

- Go to [Vercel](https://vercel.com)
- Click "Add New..." → "Project"
- Import Git repository

3. **Configure Build**:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. **Environment Variables**:

```
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.yourdomain.com
VITE_DEBUG=false
```

5. **Deploy**:

- Deploys automatically on push

#### Vercel Configuration File

Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### AWS S3 + CloudFront

**Recommended for:** Enterprise, full control, AWS ecosystem

#### Prerequisites

- AWS account
- AWS CLI installed and configured
- S3 bucket created
- CloudFront distribution (optional, recommended)

#### Step 1: Build

```bash
npm run build
```

#### Step 2: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-app-name

# Enable static website hosting
aws s3 website s3://your-app-name \
  --index-document index.html \
  --error-document index.html
```

#### Step 3: Upload to S3

```bash
# Sync dist/ to S3
aws s3 sync dist/ s3://your-app-name/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Set index.html cache
aws s3 cp dist/index.html s3://your-app-name/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"
```

#### Step 4: Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-name/*"
    }
  ]
}
```

#### Step 5: CloudFront Distribution

1. Create CloudFront distribution
2. Origin: S3 bucket
3. Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Compress Objects Automatically: Yes
5. Default Root Object: index.html

6. **Error Pages** (for SPA routing):

```
HTTP Error Code: 403
Response Page Path: /index.html
HTTP Response Code: 200
```

#### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Build
echo "Building..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://your-app-name/ \
  --delete \
  --cache-control "public, max-age=31536000"

# Update index.html cache
aws s3 cp dist/index.html s3://your-app-name/index.html \
  --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

---

### Nginx

**Recommended for:** Self-hosted, VPS, full control

#### Prerequisites

- Linux server with Nginx installed
- Domain pointing to server
- SSL certificate (Let's Encrypt recommended)

#### Step 1: Build and Upload

```bash
# Build locally
npm run build

# Upload to server
scp -r dist/* user@yourserver.com:/var/www/your-app/
```

#### Step 2: Nginx Configuration

Create `/etc/nginx/sites-available/your-app`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Root directory
    root /var/www/your-app;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### Step 3: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 4: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d app.yourdomain.com

# Auto-renewal is configured automatically
```

---

### Apache

**Recommended for:** Shared hosting, cPanel, Apache ecosystem

#### Step 1: Build and Upload

```bash
# Build
npm run build

# Upload to server (via FTP or SCP)
# Upload contents of dist/ to public_html/
```

#### Step 2: .htaccess Configuration

Create `.htaccess` in web root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # HTTPS redirect
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # SPA routing - redirect all to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/json application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

### GitHub Pages

**Recommended for:** Open source, free hosting, GitHub integration

#### Limitations

- Static sites only ✅
- No server-side code ✅ (We're SPA)
- Public repositories (or paid plan)
- Custom domain supported

#### Method 1: Manual Deployment

```bash
# Build
npm run build

# Create gh-pages branch
git checkout --orphan gh-pages

# Add dist contents
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"

# Push
git push origin gh-pages --force

# Switch back
git checkout main
```

#### Method 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_DATA_SOURCE: api
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_DEBUG: false

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v2
```

#### Configure Repository

1. Go to repository Settings
2. Pages section
3. Source: GitHub Actions
4. Add secrets (Settings → Secrets → Actions):

```
API_URL = https://api.yourdomain.com
```

#### Custom Domain

Create `public/CNAME`:

```
app.yourdomain.com
```

Update DNS:

```
Type: CNAME
Name: app
Value: yourusername.github.io
```

---

## Backend Coordination

### CORS Configuration

The backend API must allow requests from the deployed SPA:

**Backend `.env` (example):**

```bash
# Production SPA domain
FRONTEND_URL=https://app.yourdomain.com
```

**CORS Configuration:**

The backend must be configured to allow:

- Origin: `https://app.yourdomain.com` (from FRONTEND_URL)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`
- Credentials: `true`

### Testing CORS

```bash
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.yourdomain.com/api/v1/projects

# Should return:
# Access-Control-Allow-Origin: https://app.yourdomain.com
# Access-Control-Allow-Credentials: true
```

---

## Environment Configuration

### Production Environment

**`.env.production`**:

```bash
# Application
VITE_APP_NAME="Vue Slide Demo"
VITE_APP_URL=https://app.yourdomain.com

# API Mode (Production)
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.yourdomain.com

# Debug (ALWAYS false in production)
VITE_DEBUG=false
```

### Staging Environment

**`.env.staging`**:

```bash
VITE_APP_NAME="Vue Slide Demo (Staging)"
VITE_APP_URL=https://staging.yourdomain.com
VITE_DATA_SOURCE=api
VITE_API_URL=https://staging-api.yourdomain.com
VITE_DEBUG=false
```

### Building with Environment

```bash
# Production
npm run build

# Staging
npm run build --mode staging

# Custom
vite build --mode custom
# Loads .env.custom
```

---

## Post-Deployment Checklist

### Deployment Verification

- [ ] Site loads at deployed URL
- [ ] All routes work (SPA routing)
- [ ] Assets load (CSS, JS, images)
- [ ] HTTPS is enabled and working
- [ ] API connection works (if API mode)
- [ ] Authentication flow works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Tested on multiple browsers

### Performance Checks

- [ ] Lighthouse score >90
- [ ] First load <3 seconds
- [ ] Assets compressed (gzip/brotli)
- [ ] Images optimized
- [ ] JavaScript code split
- [ ] CSS minified

### Security Checks

- [ ] HTTPS enforced (HTTP redirects)
- [ ] Security headers set
- [ ] No exposed secrets in code
- [ ] CORS configured correctly
- [ ] CSP headers (optional)
- [ ] XSS protection enabled

### Monitoring Setup

- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics (Google Analytics, Plausible, etc.)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## Troubleshooting

### Issue: 404 on Page Refresh

**Cause**: Server not configured for SPA routing

**Solution**: Configure server to redirect all requests to `index.html`

**Netlify**: Add to `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx**: Add to config:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache**: Add to `.htaccess`:

```apache
RewriteRule . /index.html [L]
```

### Issue: Assets Not Loading

**Cause**: Incorrect base URL or paths

**Solution**:

Check `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/', // Or '/subdirectory/' if deployed to subdirectory
})
```

### Issue: API Requests Failing (CORS)

**Cause**: Backend CORS not configured

**Solution**:

1. Set `FRONTEND_URL` in backend configuration
2. Verify CORS config allows origin
3. Restart backend server to apply changes

### Issue: Environment Variables Not Working

**Cause**: Variables not prefixed with `VITE_`

**Solution**:

```bash
# ✅ Correct
VITE_API_URL=https://api.yourdomain.com

# ❌ Wrong
API_URL=https://api.yourdomain.com
```

### Issue: Build Size Too Large

**Cause**: Large dependencies or no code splitting

**Solution**:

```bash
# Analyze bundle
npm run build -- --mode production --minify

# Check bundle size
du -sh dist/

# Use dynamic imports for code splitting
const Dashboard = () => import('./pages/Dashboard.vue')
```

---

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Environment setup
- [API Integration Guide](API_INTEGRATION.md) - API integration
- [Testing Guide](TESTING.md) - Testing before deployment
- [Vue SPA README](../README.md) - Main documentation

---

**Last Updated**: January 11, 2026
