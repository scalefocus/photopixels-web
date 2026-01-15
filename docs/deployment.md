# Deployment Guide

This comprehensive guide covers deploying the PhotoPixels Web application to production environments.

## Deployment Overview

PhotoPixels Web can be deployed using several methods:

1. **Docker Container** (Recommended) - Containerized deployment with Nginx
2. **Static Hosting** - Netlify, Vercel, AWS S3, etc.
3. **Traditional Server** - Nginx or Apache on a VPS
4. **Kubernetes** - For large-scale deployments

## Prerequisites

- Access to a server or hosting platform
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt or commercial)
- Backend API endpoint URL

## Docker Deployment (Recommended)

### Understanding the Dockerfile

The project uses a multi-stage Dockerfile for optimal image size:

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

# Stage 3: Production runtime with Nginx
FROM nginx:latest as runtime
COPY --from=builder /app/build /var/www/data/photopixels
COPY ./docker/nginx.conf /etc/nginx/templates/default.conf.template
```

**Benefits:**

- Small final image size (only runtime dependencies)
- Cached layer for dependencies
- Secure production environment

### Method 1: Using Pre-built Images

#### Pull from Docker Hub

```bash
docker pull scalefocusad/photopixels-web:latest
```

#### Run the Container

```bash
docker run -d \
  --name photopixels-web \
  -p 80:80 \
  -e SERVER_URL=https://api.yourserver.com \
  --restart unless-stopped \
  scalefocusad/photopixels-web:latest
```

**Environment Variables:**

- `SERVER_URL` - Your backend API URL (required)

#### Verify Deployment

```bash
# Check container status
docker ps

# View logs
docker logs photopixels-web

# Follow logs
docker logs -f photopixels-web

# Test the application
curl http://localhost
```

### Method 2: Building Custom Docker Image

#### 1. Build the Image

```bash
# Build with specific version tag
docker build -t photopixels-web:1.0.0 .

# Build with latest tag
docker build -t photopixels-web:latest .
```

#### 2. Tag for Registry

```bash
# Tag for Docker Hub
docker tag photopixels-web:1.0.0 yourusername/photopixels-web:1.0.0

# Tag for private registry
docker tag photopixels-web:1.0.0 registry.example.com/photopixels-web:1.0.0
```

#### 3. Push to Registry

```bash
# Login to Docker Hub
docker login

# Push image
docker push yourusername/photopixels-web:1.0.0
```

#### 4. Deploy

```bash
docker run -d \
  --name photopixels-web \
  -p 80:80 \
  -e SERVER_URL=https://api.yourserver.com \
  --restart unless-stopped \
  yourusername/photopixels-web:1.0.0
```

### Method 3: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  photopixels-web:
    image: scalefocusad/photopixels-web:latest
    container_name: photopixels-web
    ports:
      - '80:80'
    environment:
      - SERVER_URL=https://api.yourserver.com
    restart: unless-stopped
    networks:
      - photopixels
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  photopixels:
    driver: bridge
```

**Deploy:**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

## Production Configuration

### Nginx Configuration

The `docker/nginx.conf` template file:

```nginx
server {
    root /var/www/data/photopixels;

    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
    }
}
```

**Key Features:**

- `try_files` - SPA routing fallback to index.html
- `sub_filter` - Runtime replacement of base URL

### Enhanced Nginx Configuration

For production, consider this enhanced configuration:

```nginx
server {
    listen 80;
    server_name photopixels.example.com;
    root /var/www/data/photopixels;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Main location
    location / {
        try_files $uri /index.html;
        sub_filter %%BASEURL%% ${SERVER_URL};
        sub_filter_once off;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Security - hide sensitive files
    location ~ /\. {
        deny all;
    }
}
```

### SSL/HTTPS Setup

#### Option 1: Reverse Proxy with SSL

Use a separate Nginx instance as SSL termination:

```nginx
# /etc/nginx/sites-available/photopixels
server {
    listen 80;
    server_name photopixels.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name photopixels.example.com;

    ssl_certificate /etc/letsencrypt/live/photopixels.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/photopixels.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Run container on different port:

```bash
docker run -d \
  --name photopixels-web \
  -p 8080:80 \
  -e SERVER_URL=https://api.yourserver.com \
  scalefocusad/photopixels-web:latest
```

#### Option 2: Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d photopixels.example.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## Cloud Platform Deployments

### AWS (Amazon Web Services)

#### EC2 Deployment

1. **Launch EC2 Instance**

   - Ubuntu Server 22.04 LTS
   - t2.micro or larger
   - Open ports 80, 443

2. **Install Docker**

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
```

3. **Deploy Application**

```bash
# Pull and run
docker pull scalefocusad/photopixels-web:latest
docker run -d \
  --name photopixels-web \
  -p 80:80 \
  -e SERVER_URL=https://api.yourserver.com \
  --restart unless-stopped \
  scalefocusad/photopixels-web:latest
```

#### AWS ECS (Elastic Container Service)

Create task definition:

```json
{
	"family": "photopixels-web",
	"containerDefinitions": [
		{
			"name": "photopixels-web",
			"image": "scalefocusad/photopixels-web:latest",
			"portMappings": [
				{
					"containerPort": 80,
					"protocol": "tcp"
				}
			],
			"environment": [
				{
					"name": "SERVER_URL",
					"value": "https://api.yourserver.com"
				}
			],
			"memory": 512,
			"cpu": 256
		}
	]
}
```

### Azure

#### Azure Container Instances

```bash
az container create \
  --resource-group photopixels-rg \
  --name photopixels-web \
  --image scalefocusad/photopixels-web:latest \
  --dns-name-label photopixels \
  --ports 80 \
  --environment-variables SERVER_URL=https://api.yourserver.com \
  --location eastus
```

#### Azure App Service

```bash
# Create App Service Plan
az appservice plan create \
  --name photopixels-plan \
  --resource-group photopixels-rg \
  --is-linux

# Create Web App
az webapp create \
  --name photopixels-web \
  --plan photopixels-plan \
  --resource-group photopixels-rg \
  --deployment-container-image-name scalefocusad/photopixels-web:latest

# Configure environment
az webapp config appsettings set \
  --name photopixels-web \
  --resource-group photopixels-rg \
  --settings SERVER_URL=https://api.yourserver.com
```

### Google Cloud Platform

#### Cloud Run

```bash
gcloud run deploy photopixels-web \
  --image scalefocusad/photopixels-web:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SERVER_URL=https://api.yourserver.com \
  --port 80
```

## Static Hosting Deployment

### Netlify

1. **Build the Application**

```bash
REACT_APP_SERVER=https://api.yourserver.com npm run build
```

2. **Deploy via CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

3. **Deploy via Git**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables: `REACT_APP_SERVER`

### Vercel

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel --prod
```

3. **Configure Environment**
   - Add `REACT_APP_SERVER` in Vercel dashboard
   - Redeploy

### AWS S3 + CloudFront

1. **Build Application**

```bash
REACT_APP_SERVER=https://api.yourserver.com npm run build
```

2. **Upload to S3**

```bash
aws s3 sync build/ s3://photopixels-web --delete
```

3. **Configure S3 Bucket**

   - Enable static website hosting
   - Set index.html as index document
   - Set error document to index.html (for SPA routing)

4. **CloudFront Distribution**
   - Create distribution with S3 origin
   - Configure custom error response (404 → /index.html)
   - Add custom domain and SSL certificate

## Health Checks & Monitoring

### Docker Health Check

Add to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

### Monitoring Script

```bash
#!/bin/bash
# check-health.sh

CONTAINER_NAME="photopixels-web"
HEALTH_ENDPOINT="http://localhost"

if ! curl -f $HEALTH_ENDPOINT > /dev/null 2>&1; then
    echo "Health check failed. Restarting container..."
    docker restart $CONTAINER_NAME
else
    echo "Health check passed."
fi
```

Add to cron:

```bash
*/5 * * * * /path/to/check-health.sh
```

## Rollback Procedures

### Docker Rollback

```bash
# Stop current container
docker stop photopixels-web
docker rm photopixels-web

# Run previous version
docker run -d \
  --name photopixels-web \
  -p 80:80 \
  -e SERVER_URL=https://api.yourserver.com \
  --restart unless-stopped \
  scalefocusad/photopixels-web:1.0.0
```

### Blue-Green Deployment

```bash
# Deploy new version on different port
docker run -d \
  --name photopixels-web-green \
  -p 8080:80 \
  -e SERVER_URL=https://api.yourserver.com \
  scalefocusad/photopixels-web:1.1.0

# Test new version
curl http://localhost:8080

# Switch traffic (update reverse proxy)
# If successful, remove old version
docker stop photopixels-web
docker rm photopixels-web
docker rename photopixels-web-green photopixels-web
```

## Backup & Disaster Recovery

### Configuration Backup

```bash
# Backup Docker Compose configuration
tar -czf photopixels-config-$(date +%Y%m%d).tar.gz docker-compose.yml .env

# Backup Nginx configuration
tar -czf nginx-config-$(date +%Y%m%d).tar.gz docker/nginx.conf
```

### Image Backup

```bash
# Save Docker image to file
docker save scalefocusad/photopixels-web:latest | gzip > photopixels-web-latest.tar.gz

# Restore image
gunzip -c photopixels-web-latest.tar.gz | docker load
```

## Performance Optimization

### Enable Caching Headers

Configure Nginx to cache static assets (included in enhanced config above).

### CDN Integration

Use CloudFlare, AWS CloudFront, or similar:

1. Point CDN to your origin server
2. Configure caching rules
3. Enable compression
4. Set up SSL certificate

### Load Balancing

For high-traffic deployments:

```yaml
# docker-compose-lb.yml
version: '3.8'

services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - web1
      - web2

  web1:
    image: scalefocusad/photopixels-web:latest
    environment:
      - SERVER_URL=https://api.yourserver.com

  web2:
    image: scalefocusad/photopixels-web:latest
    environment:
      - SERVER_URL=https://api.yourserver.com
```

## Troubleshooting Deployment

### Container Won't Start

```bash
# Check logs
docker logs photopixels-web

# Check container status
docker inspect photopixels-web

# Common fixes
docker system prune -a  # Clean up resources
docker restart photopixels-web
```

### 502 Bad Gateway

- Check if container is running: `docker ps`
- Check container logs: `docker logs photopixels-web`
- Verify port mapping
- Check reverse proxy configuration

### Environment Variables Not Working

```bash
# Verify environment variables
docker exec photopixels-web env | grep SERVER_URL

# Check if Nginx template was processed
docker exec photopixels-web cat /etc/nginx/conf.d/default.conf
```

### API Connection Issues

- Verify `SERVER_URL` is correct
- Check CORS configuration on backend
- Test API endpoint: `curl https://api.yourserver.com/status`
- Check network connectivity from container

## Security Checklist

- [ ] Use HTTPS/SSL in production
- [ ] Configure security headers (CSP, X-Frame-Options, etc.)
- [ ] Keep Docker images updated
- [ ] Use non-root user in container (if possible)
- [ ] Implement rate limiting
- [ ] Configure firewall rules
- [ ] Enable Docker security scanning
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities
- [ ] Use secrets management (not environment variables for sensitive data)

## Post-Deployment Checklist

- [ ] Verify application loads
- [ ] Test login functionality
- [ ] Check API connectivity
- [ ] Test file upload
- [ ] Verify image display
- [ ] Test navigation
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test error pages
- [ ] Configure monitoring
- [ ] Set up log aggregation
- [ ] Document deployment
- [ ] Train team on rollback procedures

## Maintenance

### Regular Updates

```bash
# Pull latest image
docker pull scalefocusad/photopixels-web:latest

# Stop and remove old container
docker stop photopixels-web
docker rm photopixels-web

# Start new container
docker run -d \
  --name photopixels-web \
  -p 80:80 \
  -e SERVER_URL=https://api.yourserver.com \
  --restart unless-stopped \
  scalefocusad/photopixels-web:latest
```

### Log Rotation

Configure Docker logging:

```json
{
	"log-driver": "json-file",
	"log-opts": {
		"max-size": "10m",
		"max-file": "3"
	}
}
```

---

For automated deployments, see the [CI/CD Pipeline Documentation](./cicd.md).
