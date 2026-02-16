# Vue SPA Configuration Guide

**Project**: Vue Slide Demo - Vue 3 + TypeScript SPA
**Last Updated**: January 11, 2026

## Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Data Source Modes](#data-source-modes)
- [Development Setup](#development-setup)
- [Production Configuration](#production-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Vue SPA uses environment variables to configure its behavior and connection to the backend API. All configuration is done through a `.env` file in the `vue-spa/` directory.

### Configuration Files

- `.env` - Your local configuration (not committed to git)
- `.env.example` - Example configuration with all available options
- `.env.production` - Production-specific configuration (optional)

---

## Environment Variables

### Complete Reference

Create a `.env` file in the `vue-spa/` directory with these variables:

```bash
# Application Settings
VITE_APP_NAME="Vue Slide Demo"
VITE_APP_URL=http://localhost:5173

# Storage Configuration (Local Mode)
# Prefix for all LocalStorage/IndexedDB keys
VITE_STORAGE_PREFIX=vsd

# Data Source Mode
# Options: local, api, hybrid
# - local: Browser-only storage (LocalStorage + IndexedDB)
# - api: Connect to backend REST API
# - hybrid: Offline-first with API sync (Phase 5 - not yet implemented)
VITE_DATA_SOURCE=local

# API Configuration (Required for api/hybrid modes)
# Point to backend API (WITHOUT /api suffix)
# Examples:
#   Development (Herd): https://vue-slide-demo.test
#   Development (Serve): http://localhost:8000
#   Production: https://api.yourdomain.com
VITE_API_URL=

# Debug Mode
# Enable additional console logging for troubleshooting
VITE_DEBUG=false
```

### Variable Details

| Variable              | Required | Default               | Description                                               |
| --------------------- | -------- | --------------------- | --------------------------------------------------------- |
| `VITE_APP_NAME`       | No       | "Vue Slide Demo"      | Application name shown in UI and page titles              |
| `VITE_APP_URL`        | No       | http://localhost:5173 | Base URL of the SPA (used for metadata)                   |
| `VITE_STORAGE_PREFIX` | No       | vsd                   | Prefix for LocalStorage/IndexedDB keys to avoid conflicts |
| `VITE_DATA_SOURCE`    | No       | local                 | Data source mode: `local`, `api`, or `hybrid`             |
| `VITE_API_URL`        | API mode | -                     | Backend API base URL (without /api suffix)                |
| `VITE_DEBUG`          | No       | false                 | Enable debug logging in browser console                   |

---

## Data Source Modes

The application uses an adapter pattern that allows switching between different data persistence strategies.

### Mode 1: Local (Default)

**Configuration:**

```bash
VITE_DATA_SOURCE=local
# No other variables needed for local mode
```

**What it does:**

- Stores all data in browser storage
- Uses LocalStorage for small data (users, auth tokens)
- Uses IndexedDB for large data (projects, responses)
- All keys prefixed with `VITE_STORAGE_PREFIX` (default: `vsd:`)

**When to use:**

- Development without backend API
- Demos and prototyping
- Testing frontend features
- Offline development

**Storage locations:**

```
LocalStorage:
  vsd:auth:token         # Authentication token
  vsd:auth:user          # Current user object

IndexedDB (via localforage):
  user:{id}              # User records
  team:{id}              # Team records
  project:{id}           # Project records
```

**Pros:**

- ✅ Works completely offline
- ✅ Instant response times (no network latency)
- ✅ No backend required
- ✅ Perfect for demos

**Cons:**

- ❌ Data only accessible from current browser
- ❌ Limited by browser storage quotas (~10MB LocalStorage, ~50MB+ IndexedDB)
- ❌ No real authentication
- ❌ Data lost if browser storage cleared

### Mode 2: API (Production)

**Configuration:**

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://vue-slide-demo.test
```

**What it does:**

- Fetches all data from REST API backend
- Uses token-based authentication (Bearer tokens)
- Stores only auth token locally
- All CRUD operations hit API endpoints

**When to use:**

- Production deployment
- Multi-device access needed
- Real authentication required
- Data persistence required across browsers

**Backend Requirements:**

- REST API server running and accessible
- Token-based authentication configured
- CORS enabled for SPA origin
- All API endpoints available at `/api/v1/*`

**Pros:**

- ✅ Real authentication and authorization
- ✅ Data accessible from any device
- ✅ No storage limits
- ✅ Production-ready
- ✅ Role-based access control

**Cons:**

- ❌ Requires network connection
- ❌ Network latency for all operations
- ❌ Requires backend API running

**API URL Examples:**

```bash
# Local development
VITE_API_URL=https://api.local.test

# Local development (alternate)
VITE_API_URL=http://localhost:8000

# Production
VITE_API_URL=https://api.yourdomain.com
```

**Important:**

- Do NOT include `/api` in the URL - it's added automatically
- Do NOT include trailing slash
- URL must be accessible from the browser (CORS configured)

### Mode 3: Hybrid (Future - Phase 5)

**Status:** Not yet implemented

**Planned Configuration:**

```bash
VITE_DATA_SOURCE=hybrid
VITE_API_URL=https://vue-slide-demo.test
```

**Planned Features:**

- Offline-first operation (instant reads from cache)
- Background sync when online
- Conflict resolution strategies
- Service worker integration
- Progressive Web App (PWA) features

---

## Development Setup

### Quick Start

1. **Copy environment template:**

```bash
cd vue-spa
cp .env.example .env
```

2. **Choose your data source mode:**

**Option A: Local Mode (No Backend)**

```bash
# .env
VITE_DATA_SOURCE=local
```

**Option B: API Mode (With Backend)**

```bash
# .env
VITE_DATA_SOURCE=api
VITE_API_URL=https://vue-slide-demo.test
```

3. **Install dependencies:**

```bash
npm install
```

4. **Start development server:**

```bash
npm run dev
```

5. **Open browser:**

```
http://localhost:5173
```

### Testing API Connection

If using API mode, verify connection:

```bash
# Test API is accessible
curl https://vue-slide-demo.test/api/v1/auth/user

# Should return 401 (expected - not authenticated)
# Any other error means API is not accessible
```

### Development with Local Mode

```bash
# .env for local development
VITE_APP_NAME="Vue Slide Demo (Dev)"
VITE_APP_URL=http://localhost:5173
VITE_DATA_SOURCE=local
VITE_STORAGE_PREFIX=vsd
VITE_DEBUG=true  # Enable debug logging
```

**Demo Credentials (Local Mode):**

- Any email/password works in local mode
- Suggested: `client@demo.com` / `password`
- Suggested: `admin@demo.com` / `password`

### Development with API Mode

```bash
# .env for API development
VITE_APP_NAME="Vue Slide Demo (Dev)"
VITE_APP_URL=http://localhost:5173
VITE_DATA_SOURCE=api
VITE_API_URL=https://vue-slide-demo.test
VITE_DEBUG=true  # Enable debug logging
```

**Demo Credentials (API Mode):**
Use accounts from your backend API:

- `client@demo.com` / `password`
- `admin@demo.com` / `password`
- `consultant@example.com` / `password`
- `guest@demo.com` / `password`

---

## Production Configuration

### Environment Setup

Create `.env.production` for production builds:

```bash
# Production Configuration
VITE_APP_NAME="Vue Slide Demo"
VITE_APP_URL=https://app.yourdomain.com

# API Mode (Production)
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.yourdomain.com

# Debug (ALWAYS false in production)
VITE_DEBUG=false
```

### Build Process

```bash
# Build with production environment
npm run build

# Output: dist/ directory
# Contains optimized, minified assets ready for deployment
```

### Backend API Requirements

Ensure your backend API is configured for the production SPA:

**Backend `.env` (example for typical REST API):**

```bash
# Backend must allow SPA origin
FRONTEND_URL=https://app.yourdomain.com

# Production environment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
```

**CORS Configuration (example):**
The backend must allow requests from your SPA domain:

- Allow origin: `https://app.yourdomain.com`
- Allow credentials: `true`
- Allow methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allow headers: `Content-Type, Authorization`

### Deployment Checklist

**Before Deployment:**

- [ ] Set `VITE_DATA_SOURCE=api` in `.env.production`
- [ ] Set `VITE_API_URL` to production API URL
- [ ] Set `VITE_DEBUG=false` in `.env.production`
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify API is accessible from production domain
- [ ] Ensure CORS allows production domain
- [ ] Ensure HTTPS is enabled (required for secure token auth)

**After Deployment:**

- [ ] Test authentication flow
- [ ] Test API requests
- [ ] Check browser console for errors
- [ ] Verify all routes work (SPA routing)
- [ ] Test on multiple browsers
- [ ] Monitor performance

---

## Troubleshooting

### Issue: Environment Variables Not Loading

**Symptoms:**

- Application uses default values instead of `.env` values
- API URL not set correctly

**Solutions:**

1. Ensure `.env` file is in `vue-spa/` directory (same level as `package.json`)
2. Environment variables must start with `VITE_` prefix
3. Restart dev server after changing `.env`:

```bash
npm run dev
```

4. Vite only reads `.env` on startup - changes require restart

### Issue: "Cannot connect to API"

**Symptoms:**

- Network errors in browser console
- 404 or connection refused errors

**Solutions:**

1. **Check `VITE_API_URL` format:**

```bash
# Correct
VITE_API_URL=https://vue-slide-demo.test

# Incorrect
VITE_API_URL=https://vue-slide-demo.test/api  # Don't include /api
VITE_API_URL=https://vue-slide-demo.test/     # Don't include trailing slash
```

2. **Verify backend is running:**

```bash
# Test API directly
curl https://vue-slide-demo.test/api/v1/auth/user

# Should return 401 (good - means API is accessible)
# Connection refused = backend not running
```

3. **Check CORS configuration:**

```bash
# Test CORS from SPA domain
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://vue-slide-demo.test/api/v1/auth/user

# Should return CORS headers
```

4. **Verify environment variable is loaded:**

```javascript
// In browser console
console.log(import.meta.env.VITE_API_URL)

// Should print your API URL
// If undefined, .env not loaded correctly
```

### Issue: 401 Unauthorized Errors

**Symptoms:**

- Logged out unexpectedly
- All API requests return 401

**Solutions:**

1. **Check token exists:**

```javascript
// Browser console
localStorage.getItem('vsd:auth:token')

// Should return token string
// If null, need to log in again
```

2. **Token may have expired:**

- Log out and log in again
- Check backend token expiration settings

3. **Clear storage and retry:**

```javascript
// Browser console
localStorage.clear()
// Then log in again
```

### Issue: Local Storage Data Not Persisting

**Symptoms:**

- Data lost on page refresh (local mode)
- Projects disappear

**Solutions:**

1. **Check browser doesn't block storage:**

- Open DevTools → Application → Local Storage
- Verify entries exist with `vsd:` prefix

2. **Check storage quota:**

- Browser may have hit storage limit
- Clear old data or use API mode

3. **Incognito/Private mode:**

- Storage cleared when window closed
- Use regular browser window

4. **Browser storage settings:**

- Ensure site allowed to store data
- Check browser privacy settings

### Issue: CORS Errors

**Symptoms:**

- "Access to XMLHttpRequest blocked by CORS policy"
- API requests fail with CORS error

**Solutions:**

1. **Backend CORS configuration:**

```bash
# Backend environment
FRONTEND_URL=http://localhost:5173

# Must match exactly (no trailing slash)
```

2. **Restart backend server:**
   After updating CORS configuration, restart your backend API server to apply changes.

3. **Check CORS headers:**

```bash
# Request should include these headers in response:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

4. **Development vs Production:**

```bash
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://app.yourdomain.com
```

### Issue: Debug Mode Not Working

**Symptoms:**

- No debug logs in console
- Want to see API requests

**Solutions:**

1. **Enable debug mode:**

```bash
# .env
VITE_DEBUG=true
```

2. **Restart dev server:**

```bash
npm run dev
```

3. **Check browser console:**

- Open DevTools (F12)
- Console tab should show debug logs
- Look for API request/response logs

4. **Verify environment variable:**

```javascript
// Browser console
console.log(import.meta.env.VITE_DEBUG)
// Should print: true
```

### Issue: Build Errors

**Symptoms:**

- `npm run build` fails
- TypeScript errors

**Solutions:**

1. **Run type check:**

```bash
npm run type-check
```

2. **Clear cache and reinstall:**

```bash
rm -rf node_modules dist
npm install
npm run build
```

3. **Check for missing dependencies:**

```bash
npm install
```

4. **Update dependencies:**

```bash
npm update
```

### Debug Checklist

When things aren't working:

1. **Check environment variables:**

```bash
cat .env
# Verify all variables set correctly
```

2. **Check dev server is running:**

```bash
# Should see: VITE vX.X.X  ready in XXX ms
npm run dev
```

3. **Check browser console:**

- Open DevTools (F12)
- Look for error messages
- Check Network tab for failed requests

4. **Check API accessibility:**

```bash
curl $VITE_API_URL/api/v1/auth/user
# Should return 401 (good)
# Connection refused = API not running
```

5. **Check storage:**

- DevTools → Application → Local Storage
- Should see entries with `vsd:` prefix

6. **Try clearing everything:**

```javascript
// Browser console
localStorage.clear()
// Refresh page
```

---

## Advanced Configuration

### Custom Storage Prefix

If running multiple instances or versions:

```bash
# .env
VITE_STORAGE_PREFIX=myapp_dev

# Storage keys will be:
# myapp_dev:auth:token
# myapp_dev:auth:user
# etc.
```

### Multiple Environments

Create environment-specific files:

**`.env.development`** (Development):

```bash
VITE_DATA_SOURCE=local
VITE_DEBUG=true
```

**`.env.staging`** (Staging):

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://staging-api.yourdomain.com
VITE_DEBUG=false
```

**`.env.production`** (Production):

```bash
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.yourdomain.com
VITE_DEBUG=false
```

Vite automatically loads the correct file based on mode:

```bash
npm run dev              # Uses .env.development
npm run build --mode staging  # Uses .env.staging
npm run build            # Uses .env.production
```

---

## Security Considerations

### Don't Commit Secrets

**Never commit:**

- `.env` files with real credentials
- API keys or tokens
- Production URLs (unless public)

**Always:**

- Add `.env` to `.gitignore`
- Commit `.env.example` as template
- Use different credentials for each environment

### Environment Variables in Vite

**Important:** All environment variables are exposed to the client:

```javascript
// These are visible in browser source code!
console.log(import.meta.env.VITE_API_URL)
```

**Never put in `.env`:**

- API keys or secrets
- Passwords
- Private tokens
- Sensitive configuration

**Safe to put:**

- Public API URLs
- Application name
- Feature flags
- Non-sensitive configuration

---

## Related Documentation

- [Vue SPA README](../README.md) - Main documentation
- [API Integration Guide](API_INTEGRATION.md) - Frontend API integration
- [Testing Guide](TESTING.md) - Frontend testing
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

---

**Last Updated**: January 11, 2026
