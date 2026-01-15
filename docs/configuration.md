# Configuration Guide

This document describes all configuration options, environment variables, and settings for the PhotoPixels Web application.

## Environment Variables

### Build-time Variables (React)

These variables are embedded into the application during the build process and cannot be changed at runtime.

#### REACT_APP_SERVER

- **Type:** String
- **Required:** Yes
- **Description:** Backend API server URL
- **Format:** Full URL with protocol (http:// or https://)
- **Build-time Only:** Yes

**Examples:**

```env
# Development
REACT_APP_SERVER=http://localhost:5000

# Staging
REACT_APP_SERVER=https://staging-api.photopixels.com

# Production
REACT_APP_SERVER=https://api.photopixels.com
```

**Important Notes:**

- Must start with `REACT_APP_` prefix to be accessible in React
- Embedded at build time, not runtime
- Changing this requires rebuilding the application
- Should NOT end with a trailing slash (handled automatically in code)

**Usage in Code:**

```typescript
// src/constants/constants.ts
const baseUrl = process.env.REACT_APP_SERVER;
export const BASE_URL = baseUrl?.endsWith('/') ? baseUrl : baseUrl + '/';
```

### Runtime Variables (Docker)

These variables can be set when running the Docker container and are injected at runtime via Nginx.

#### SERVER_URL

- **Type:** String
- **Required:** Yes (when using Docker)
- **Description:** Backend API URL injected at container runtime
- **Format:** Full URL with protocol
- **Replaces:** `%%BASEURL%%` placeholder in built files

**Docker Usage:**

```bash
docker run -d \
  -e SERVER_URL=https://api.photopixels.com \
  scalefocusad/photopixels-web:latest
```

**Docker Compose Usage:**

```yaml
services:
  photopixels-web:
    image: scalefocusad/photopixels-web:latest
    environment:
      - SERVER_URL=https://api.photopixels.com
```

**How It Works:**

The Nginx configuration uses `sub_filter` to replace the placeholder:

```nginx
location / {
    try_files $uri /index.html;
    sub_filter %%BASEURL%% ${SERVER_URL};
    sub_filter_once off;
}
```

In the application code:

```typescript
// src/constants/constants.ts
const resolveBaseUrl = () => {
	const baseUrl =
		window.BASE_URL !== '%%BASEURL%%'
			? window.BASE_URL
			: process.env.REACT_APP_SERVER;

	return baseUrl?.endsWith('/') ? baseUrl : baseUrl + '/';
};
```

## Configuration Files

### .env File

Create a `.env` file in the project root for local development:

```env
# API Configuration
REACT_APP_SERVER=http://localhost:5000

# Optional: Application Environment
NODE_ENV=development

# Optional: Port for development server (default: 3000)
PORT=3000

# Optional: Disable browser auto-open
BROWSER=none

# Optional: Enable HTTPS in development
HTTPS=false
```

### .env.example

Template file for environment variables (commit to repository):

```env
# Backend API URL
# Example: http://localhost:5000 or https://api.photopixels.com
REACT_APP_SERVER=

# Development server port (optional, default: 3000)
# PORT=3000
```

### Environment-Specific Files

Create different environment files for various deployment environments:

```
.env                    # Default, used if no specific env file
.env.local              # Local overrides (gitignored)
.env.development        # Development environment
.env.development.local  # Local development overrides
.env.production         # Production environment
.env.production.local   # Local production overrides
.env.test               # Test environment
```

**Priority (highest to lowest):**

1. `.env.{environment}.local`
2. `.env.{environment}`
3. `.env.local`
4. `.env`

**Example .env.development:**

```env
REACT_APP_SERVER=http://localhost:5000
BROWSER=chrome
HTTPS=false
```

**Example .env.production:**

```env
REACT_APP_SERVER=https://api.photopixels.com
GENERATE_SOURCEMAP=false
```

## Application Constants

### BASE_URL Resolution

The application uses a smart resolution strategy for the API base URL:

```typescript
// src/constants/constants.ts
declare global {
	interface Window {
		BASE_URL: string;
	}
}

const resolveBaseUrl = () => {
	// Priority:
	// 1. Runtime-injected BASE_URL (Docker)
	// 2. Build-time REACT_APP_SERVER
	const baseUrl =
		window.BASE_URL !== '%%BASEURL%%'
			? window.BASE_URL
			: process.env.REACT_APP_SERVER;

	// Ensure trailing slash
	if (baseUrl?.endsWith('/')) {
		return baseUrl;
	}

	return baseUrl + '/';
};

export const BASE_URL = resolveBaseUrl();
```

### Other Constants

```typescript
// src/constants/constants.ts

// User roles
export const USER_ROLES_OPTIONS: Record<UserRoles, string> = {
	[UserRoles.ADMIN]: 'Admin',
	[UserRoles.USER]: 'User',
};

// Pagination
export const NUMBER_OF_OBJECTS_PER_PAGE = 30;
```

## Nginx Configuration

### Location

`docker/nginx.conf`

### Template Configuration

```nginx
server {
    root /var/www/data/photopixels;

    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
        sub_filter_once off;
    }
}
```

### Key Directives Explained

#### root

Sets the document root directory where static files are served from:

```nginx
root /var/www/data/photopixels;
```

#### try_files

Handles SPA routing by falling back to index.html for client-side routes:

```nginx
try_files $uri /index.html;
```

**How it works:**

1. Try to serve the exact file requested (`$uri`)
2. If not found, serve `index.html` (React Router handles routing)

#### sub_filter

Replaces placeholders in HTML with environment variables:

```nginx
sub_filter %%BASEURL%% ${SERVER_URL};
sub_filter_once off;
```

**Parameters:**

- First arg: Text to find (`%%BASEURL%%`)
- Second arg: Replacement value (`${SERVER_URL}`)
- `sub_filter_once off`: Replace all occurrences (not just first)

### Production-Ready Nginx Configuration

For production deployments, use this enhanced configuration:

```nginx
server {
    listen 80;
    server_name photopixels.example.com;
    root /var/www/data/photopixels;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.photopixels.com;" always;

    # Main application
    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
        sub_filter_once off;

        # No caching for index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Static assets - aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Service worker - special handling
    location = /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Security - hide sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Docker Configuration

### Dockerfile

Multi-stage Dockerfile for optimized builds:

```dockerfile
# Stage 1: Install dependencies
FROM node:16.18-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build application
FROM node:16.18-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM nginx:latest as runtime
COPY --from=builder /app/build /var/www/data/photopixels
COPY ./docker/nginx.conf /etc/nginx/templates/default.conf.template
```

**Benefits:**

- Small final image (only Nginx + static files)
- Cached dependency layer speeds up builds
- No source code or build tools in final image

### Docker Compose

```yaml
version: '3.8'

services:
  photopixels-web:
    image: scalefocusad/photopixels-web:latest
    container_name: photopixels-web
    ports:
      - '80:80'
    environment:
      - SERVER_URL=${SERVER_URL}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - photopixels-network
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'

networks:
  photopixels-network:
    driver: bridge
```

**Environment file (.env for Docker Compose):**

```env
SERVER_URL=https://api.photopixels.com
```

## TypeScript Configuration

### tsconfig.json

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"allowJs": true,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"forceConsistentCasingInFileNames": true,
		"noFallthroughCasesInSwitch": true,
		"module": "esnext",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx"
	},
	"include": ["src"],
	"exclude": ["node_modules", "build", "dist"]
}
```

**Key Settings:**

- `strict: true` - Enable all strict type checking
- `jsx: "react-jsx"` - Use new JSX transform (React 17+)
- `moduleResolution: "node"` - Node.js module resolution
- `skipLibCheck: true` - Skip type checking of declaration files (faster builds)

## Package.json Scripts

```json
{
	"scripts": {
		"start": "react-scripts start",
		"build": "react-scripts build",
		"test": "react-scripts test",
		"eject": "react-scripts eject",
		"prepare": "husky install",
		"lint": "eslint . --fix --max-warnings=0",
		"format": "prettier . --write"
	}
}
```

**Script Descriptions:**

- `start` - Starts development server (port 3000)
- `build` - Creates production build
- `test` - Runs tests in watch mode
- `lint` - Runs ESLint with auto-fix
- `format` - Formats code with Prettier
- `prepare` - Git hooks setup (runs on npm install)

## Build Configuration

### Production Build Options

Set in `.env.production`:

```env
# API URL
REACT_APP_SERVER=https://api.photopixels.com

# Disable source maps in production (optional)
GENERATE_SOURCEMAP=false

# Optimize bundle size
INLINE_RUNTIME_CHUNK=false

# Build output directory (default: build)
BUILD_PATH=./dist
```

### Environment-Specific Builds

```bash
# Development build
npm run build

# Production build with specific env file
REACT_APP_ENV=production npm run build

# Staging build
REACT_APP_SERVER=https://staging-api.photopixels.com npm run build
```

## CORS Configuration

CORS is typically handled on the backend API, but you can configure a development proxy:

### setupProxy.js (Development)

Create `src/setupProxy.js`:

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://localhost:5000',
			changeOrigin: true,
			pathRewrite: {
				'^/api': '', // Remove /api prefix
			},
		})
	);
};
```

Then use relative URLs in development:

```typescript
// Instead of: http://localhost:5000/media
// Use: /api/media
```

## Security Configuration

### Content Security Policy (CSP)

Configure in Nginx:

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.photopixels.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
" always;
```

### Environment Variable Validation

Add validation to ensure required variables are present:

```typescript
// src/config/env.ts
const requiredEnvVars = ['REACT_APP_SERVER'];

export function validateEnv() {
	const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(', ')}`
		);
	}
}

// Call in index.tsx
validateEnv();
```

## Troubleshooting Configuration

### Environment Variables Not Loading

**Problem:** `process.env.REACT_APP_SERVER` is undefined

**Solutions:**

1. Ensure variable starts with `REACT_APP_` prefix
2. Restart development server after changing `.env`
3. Check `.env` file is in project root
4. Verify no syntax errors in `.env` file

```bash
# Check if variable is loaded
echo $REACT_APP_SERVER

# Restart dev server
npm start
```

### Docker Runtime Variables Not Applied

**Problem:** `SERVER_URL` not replacing `%%BASEURL%%`

**Solutions:**

```bash
# Check environment variable in container
docker exec photopixels-web env | grep SERVER_URL

# Check Nginx configuration was templated
docker exec photopixels-web cat /etc/nginx/conf.d/default.conf

# Check if sub_filter is working
docker exec photopixels-web curl -s http://localhost | grep BASE_URL
```

### CORS Errors

**Problem:** API requests blocked by CORS policy

**Solutions:**

1. Configure CORS on backend API
2. Use development proxy (see setupProxy.js above)
3. Verify API URL is correct
4. Check browser console for exact CORS error

### Build Fails with Missing Dependencies

**Problem:** Build fails with "Cannot find module"

**Solutions:**

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Verify Node version
node --version  # Should be 16.x or higher
```

## Configuration Checklist

### Development Setup

- [ ] Create `.env` file with `REACT_APP_SERVER`
- [ ] Install dependencies (`npm install`)
- [ ] Verify API connectivity
- [ ] Configure VS Code settings
- [ ] Set up Git hooks (Husky)

### Production Deployment

- [ ] Set `REACT_APP_SERVER` for build
- [ ] Set `SERVER_URL` for Docker container
- [ ] Configure Nginx for production
- [ ] Enable HTTPS/SSL
- [ ] Set up security headers
- [ ] Configure caching
- [ ] Enable compression
- [ ] Set up monitoring
- [ ] Configure log rotation

### CI/CD Configuration

- [ ] Set GitHub secrets (Docker Hub credentials)
- [ ] Set GitHub variables (`SERVER_URL`)
- [ ] Test pipeline with tag push
- [ ] Verify Docker image builds
- [ ] Confirm image pushes to registry

---

**Related Documentation:**

- [Getting Started Guide](./getting-started.md)
- [Deployment Guide](./deployment.md)
- [CI/CD Pipeline](./cicd.md)
