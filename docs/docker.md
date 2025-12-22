# Docker Guide

This guide provides detailed information about Docker containerization for the PhotoPixels Web application.

## Overview

The PhotoPixels Web application uses Docker for consistent deployment across environments. The application is served using Nginx in a production-ready container.

## Dockerfile Explained

### Multi-Stage Build

The Dockerfile uses a multi-stage build approach for optimal image size and security:

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

### Stage Breakdown

#### Stage 1: Dependencies (`deps`)

- **Base Image:** `node:16.18-alpine` - Lightweight Alpine Linux with Node.js
- **Purpose:** Install npm dependencies
- **Benefits:**
  - Cached layer - speeds up subsequent builds if package.json unchanged
  - Isolated from source code changes

#### Stage 2: Builder

- **Base Image:** `node:16.18-alpine`
- **Purpose:** Build the React application
- **Process:**
  1. Copy node_modules from deps stage
  2. Copy all source code
  3. Run production build (`npm run build`)
  4. Output to `build/` directory

#### Stage 3: Runtime

- **Base Image:** `nginx:latest` - Production web server
- **Purpose:** Serve static files
- **Process:**
  1. Copy built files from builder stage
  2. Copy Nginx configuration template
  3. No Node.js or build tools in final image

### Benefits of Multi-Stage Build

| Benefit              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| **Small Image Size** | Final image only contains Nginx + static files (~50MB vs ~1GB) |
| **Security**         | No source code or build tools in production image              |
| **Speed**            | Dependency layer is cached, faster rebuilds                    |
| **Clean**            | No cleanup commands needed                                     |

## Building Docker Images

### Local Build

```powershell
# Basic build
docker build -t photopixels-web .

# Build with specific tag
docker build -t photopixels-web:1.0.0 .

# Build with no cache
docker build --no-cache -t photopixels-web .

# Build with build arguments (if needed)
docker build --build-arg NODE_ENV=production -t photopixels-web .
```

### Build for Multiple Platforms

```powershell
# Setup buildx (one-time)
docker buildx create --use

# Build for multiple architectures
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  -t photopixels-web:latest `
  --push .
```

### Optimize Build Time

**Use .dockerignore:**

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
coverage
.vscode
dist
build
*.md
```

## Running Containers

### Basic Run

```powershell
docker run -d `
  --name photopixels-web `
  -p 80:80 `
  -e SERVER_URL=https://api.yourserver.com `
  photopixels-web:latest
```

### With Environment Variables

```powershell
docker run -d `
  --name photopixels-web `
  -p 80:80 `
  -e SERVER_URL=https://api.yourserver.com `
  -e NGINX_WORKER_PROCESSES=auto `
  --restart unless-stopped `
  photopixels-web:latest
```

### Interactive Mode (Debugging)

```powershell
# Run with shell access
docker run -it --rm `
  -p 80:80 `
  -e SERVER_URL=https://api.yourserver.com `
  photopixels-web:latest `
  /bin/sh

# Execute command in running container
docker exec -it photopixels-web /bin/sh
```

### With Volume Mounts (Development)

```powershell
# Mount custom Nginx config
docker run -d `
  --name photopixels-web `
  -p 80:80 `
  -v ${PWD}/docker/nginx.conf:/etc/nginx/templates/default.conf.template `
  -e SERVER_URL=https://api.yourserver.com `
  photopixels-web:latest
```

## Docker Compose

### Basic Configuration

```yaml
# docker-compose.yml
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
```

### Production Configuration

```yaml
version: '3.8'

services:
  photopixels-web:
    image: scalefocusad/photopixels-web:${VERSION:-latest}
    container_name: photopixels-web
    ports:
      - '80:80'
    environment:
      - SERVER_URL=${SERVER_URL}
    restart: unless-stopped

    # Health check
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

    # Logging
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'

    # Networks
    networks:
      - photopixels-network

networks:
  photopixels-network:
    driver: bridge
```

### With Nginx Reverse Proxy

```yaml
version: '3.8'

services:
  # Application
  photopixels-web:
    image: scalefocusad/photopixels-web:latest
    container_name: photopixels-web
    expose:
      - '80'
    environment:
      - SERVER_URL=${SERVER_URL}
    restart: unless-stopped
    networks:
      - photopixels-network

  # Reverse Proxy with SSL
  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - photopixels-web
    restart: unless-stopped
    networks:
      - photopixels-network

networks:
  photopixels-network:
    driver: bridge
```

### Environment File

```env
# .env file for Docker Compose
VERSION=1.0.0
SERVER_URL=https://api.yourserver.com
```

### Commands

```powershell
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart photopixels-web

# Pull latest images
docker-compose pull

# Rebuild and start
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

## Nginx Configuration in Docker

### Template System

The Nginx image uses environment variable templating:

```nginx
# docker/nginx.conf
server {
    root /var/www/data/photopixels;

    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
        sub_filter_once off;
    }
}
```

**How it works:**

1. File is copied to `/etc/nginx/templates/default.conf.template`
2. Nginx startup script processes templates
3. Replaces `${SERVER_URL}` with environment variable value
4. Outputs to `/etc/nginx/conf.d/default.conf`

### Custom Nginx Configuration

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/data/photopixels;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
        sub_filter_once off;

        # Disable caching for index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static assets - aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Container Management

### Lifecycle Commands

```powershell
# Start container
docker start photopixels-web

# Stop container
docker stop photopixels-web

# Restart container
docker restart photopixels-web

# Pause container
docker pause photopixels-web

# Unpause container
docker unpause photopixels-web

# Remove container
docker rm photopixels-web

# Force remove running container
docker rm -f photopixels-web
```

### Inspect Container

```powershell
# Full details
docker inspect photopixels-web

# Specific info
docker inspect photopixels-web --format='{{.State.Status}}'
docker inspect photopixels-web --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'

# Environment variables
docker inspect photopixels-web | Select-String -Pattern "Env"
```

### View Logs

```powershell
# All logs
docker logs photopixels-web

# Follow logs (live)
docker logs -f photopixels-web

# Last 100 lines
docker logs --tail 100 photopixels-web

# Logs since specific time
docker logs --since 30m photopixels-web

# Logs with timestamps
docker logs -t photopixels-web
```

### Resource Usage

```powershell
# Container stats (live)
docker stats photopixels-web

# Disk usage
docker system df

# Detailed container disk usage
docker ps -s
```

## Image Management

### List Images

```powershell
# All images
docker images

# Specific image
docker images photopixels-web

# Filter by tag
docker images photopixels-web:1.0.0
```

### Tag Images

```powershell
# Tag with version
docker tag photopixels-web:latest photopixels-web:1.0.0

# Tag for registry
docker tag photopixels-web:latest scalefocusad/photopixels-web:1.0.0

# Tag for different registry
docker tag photopixels-web:latest registry.example.com/photopixels-web:1.0.0
```

### Push to Registry

```powershell
# Login to Docker Hub
docker login

# Push image
docker push scalefocusad/photopixels-web:1.0.0

# Push all tags
docker push scalefocusad/photopixels-web --all-tags
```

### Pull from Registry

```powershell
# Pull latest
docker pull scalefocusad/photopixels-web:latest

# Pull specific version
docker pull scalefocusad/photopixels-web:1.0.0

# Pull all tags
docker pull scalefocusad/photopixels-web --all-tags
```

### Remove Images

```powershell
# Remove by name
docker rmi photopixels-web:latest

# Remove by ID
docker rmi abc123def456

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a

# Force remove
docker rmi -f photopixels-web:latest
```

## Networking

### List Networks

```powershell
docker network ls
```

### Inspect Network

```powershell
docker network inspect bridge
```

### Create Network

```powershell
docker network create photopixels-network
```

### Connect Container to Network

```powershell
docker network connect photopixels-network photopixels-web
```

### Container Communication

```powershell
# Containers on same network can communicate using container names
# Example: http://photopixels-web:80
```

## Health Checks

### Define in Dockerfile

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

### Define in Docker Compose

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Check Health Status

```powershell
# View health status
docker ps --filter name=photopixels-web --format "table {{.Names}}\t{{.Status}}"

# Inspect health
docker inspect --format='{{.State.Health.Status}}' photopixels-web
```

## Security Best Practices

### 1. Use Specific Image Tags

```dockerfile
# ✅ Good - specific version
FROM node:16.18-alpine

# ❌ Bad - unpredictable
FROM node:latest
```

### 2. Run as Non-Root User

```dockerfile
# Add to Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

### 3. Scan Images for Vulnerabilities

```powershell
# Using Docker Scout
docker scout cves photopixels-web:latest

# Using Trivy
trivy image photopixels-web:latest
```

### 4. Limit Resources

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

### 5. Use Read-Only Filesystem

```powershell
docker run --read-only `
  --tmpfs /tmp `
  --tmpfs /var/cache/nginx `
  photopixels-web:latest
```

## Troubleshooting

### Container Won't Start

```powershell
# Check logs
docker logs photopixels-web

# Inspect container
docker inspect photopixels-web

# Try running interactively
docker run -it --rm photopixels-web:latest /bin/sh
```

### Application Not Accessible

```powershell
# Check port mapping
docker port photopixels-web

# Check container is running
docker ps

# Test from inside container
docker exec photopixels-web curl -I http://localhost
```

### Environment Variables Not Applied

```powershell
# Check environment in container
docker exec photopixels-web env | Select-String -Pattern "SERVER_URL"

# Check processed Nginx config
docker exec photopixels-web cat /etc/nginx/conf.d/default.conf
```

## Performance Optimization

### Build Cache

```powershell
# Use BuildKit for better caching
$env:DOCKER_BUILDKIT=1
docker build -t photopixels-web .
```

### Layer Optimization

```dockerfile
# Optimize layer order (most stable first)
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### Multi-Stage Build

Already implemented - keeps final image small.

## Backup and Migration

### Export Container

```powershell
# Save container as image
docker commit photopixels-web photopixels-web-backup

# Save image to file
docker save photopixels-web-backup > photopixels-backup.tar
```

### Import Container

```powershell
# Load image from file
docker load < photopixels-backup.tar

# Run from loaded image
docker run -d photopixels-web-backup
```

---

**Related Documentation:**

- [Deployment Guide](./deployment.md)
- [Configuration Guide](./configuration.md)
- [CI/CD Pipeline](./cicd.md)
- [Troubleshooting Guide](./troubleshooting.md)
