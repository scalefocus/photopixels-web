# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the PhotoPixels Web application.

## Development Issues

### Application Won't Start

#### Problem: `npm start` fails immediately

**Symptoms:**

```
Error: ENOENT: no such file or directory
```

**Solutions:**

1. **Install dependencies:**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

2. **Check Node.js version:**

```powershell
node --version  # Should be 16.x or higher
```

3. **Clear npm cache:**

```powershell
npm cache clean --force
npm install
```

#### Problem: Port 3000 is already in use

**Symptoms:**

```
Something is already running on port 3000
```

**Solutions:**

**Windows (PowerShell):**

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Alternative - Use different port:**

```powershell
$env:PORT=3001
npm start
```

### Build Errors

#### Problem: TypeScript compilation errors

**Symptoms:**

```
TS2304: Cannot find name 'X'
TS2339: Property 'X' does not exist on type 'Y'
```

**Solutions:**

1. **Check TypeScript version:**

```powershell
npm list typescript
```

2. **Reinstall type definitions:**

```powershell
npm install --save-dev @types/react @types/react-dom @types/node
```

3. **Check tsconfig.json is valid**

4. **Restart VS Code / TypeScript server:**
   - Press `Ctrl+Shift+P`
   - Type "TypeScript: Restart TS Server"

#### Problem: Module not found errors

**Symptoms:**

```
Module not found: Can't resolve 'X'
```

**Solutions:**

1. **Verify import paths are correct:**

```typescript
// ❌ Wrong
import { Component } from 'components/Component';

// ✅ Correct (relative path)
import { Component } from '../components/Component';
```

2. **Check file exists at the specified path**

3. **Verify file extensions:**

```typescript
// In TypeScript, omit .tsx extension
import Component from './Component'; // ✅
import Component from './Component.tsx'; // ❌
```

4. **Clear cache and rebuild:**

```powershell
Remove-Item -Recurse -Force node_modules/.cache
npm start
```

### Environment Variable Issues

#### Problem: Environment variables not loading

**Symptoms:**

- `process.env.REACT_APP_SERVER` is `undefined`
- API calls fail with incorrect URL

**Solutions:**

1. **Verify variable name starts with `REACT_APP_`:**

```env
# ✅ Correct
REACT_APP_SERVER=http://localhost:5000

# ❌ Wrong - won't be accessible
SERVER_URL=http://localhost:5000
```

2. **Check .env file location:**

   - Must be in project root directory
   - Same level as `package.json`

3. **Restart development server:**

```powershell
# Stop server (Ctrl+C)
npm start
```

4. **Check .env syntax:**

```env
# ✅ Correct
REACT_APP_SERVER=http://localhost:5000

# ❌ Wrong - no spaces around =
REACT_APP_SERVER = http://localhost:5000

# ❌ Wrong - no quotes needed
REACT_APP_SERVER="http://localhost:5000"
```

5. **Debug loaded environment:**

```typescript
console.log('Env vars:', {
	REACT_APP_SERVER: process.env.REACT_APP_SERVER,
	NODE_ENV: process.env.NODE_ENV,
});
```

### API Connection Issues

#### Problem: CORS errors

**Symptoms:**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Verify backend CORS configuration** (backend issue)

2. **Use development proxy (temporary solution):**

Create `src/setupProxy.js`:

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://localhost:5000',
			changeOrigin: true,
		})
	);
};
```

3. **Check API URL format:**

```typescript
// Ensure proper protocol
const API_URL = 'https://api.example.com'; // ✅
const API_URL = 'api.example.com'; // ❌
```

#### Problem: API requests fail with 401

**Symptoms:**

- User gets logged out unexpectedly
- API returns "Unauthorized"

**Solutions:**

1. **Check token in localStorage:**

```javascript
// In browser console
localStorage.getItem('token');
```

2. **Verify token format in headers:**

```javascript
// Should be: Bearer <token>
```

3. **Check token expiration** (backend issue)

4. **Clear localStorage and re-login:**

```javascript
localStorage.clear();
// Then login again
```

#### Problem: Network request failed

**Symptoms:**

```
Network Error
Failed to fetch
```

**Solutions:**

1. **Verify API server is running:**

```powershell
curl http://localhost:5000/status
```

2. **Check firewall settings**

3. **Verify API URL in environment:**

```typescript
console.log('API URL:', process.env.REACT_APP_SERVER);
```

4. **Check browser console for actual error**

### React Query Issues

#### Problem: Data not refreshing

**Symptoms:**

- Stale data displayed
- Changes not reflected after mutation

**Solutions:**

1. **Invalidate queries after mutation:**

```typescript
const mutation = useMutation({
	mutationFn: updateData,
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['data'] });
	},
});
```

2. **Check staleTime configuration:**

```typescript
useQuery({
	queryKey: ['data'],
	queryFn: getData,
	staleTime: 0, // Always refetch
});
```

3. **Force refetch:**

```typescript
const { refetch } = useQuery(/* ... */);
refetch();
```

#### Problem: Infinite loading state

**Symptoms:**

- `isLoading` never becomes `false`
- Spinner never disappears

**Solutions:**

1. **Check query function returns data:**

```typescript
queryFn: async () => {
	const response = await api.getData();
	return response.data; // ✅ Return data
};
```

2. **Check for errors in query:**

```typescript
const { data, error, isLoading } = useQuery(/* ... */);
console.log({ data, error, isLoading });
```

3. **Check network tab for failed requests**

## Docker Issues

### Container Won't Start

#### Problem: Container exits immediately

**Symptoms:**

```powershell
docker ps  # Container not listed
docker ps -a  # Shows exited status
```

**Solutions:**

1. **Check container logs:**

```powershell
docker logs photopixels-web
```

2. **Check environment variables:**

```powershell
docker inspect photopixels-web | Select-String -Pattern "SERVER_URL"
```

3. **Verify image is correct:**

```powershell
docker images | Select-String -Pattern "photopixels-web"
```

4. **Try running interactively:**

```powershell
docker run -it --rm `
  -p 80:80 `
  -e SERVER_URL=https://api.example.com `
  scalefocusad/photopixels-web:latest `
  /bin/sh
```

### Port Binding Issues

#### Problem: Port already in use

**Symptoms:**

```
Error response: port is already allocated
```

**Solutions:**

1. **Check what's using the port:**

```powershell
netstat -ano | findstr :80
```

2. **Stop existing container:**

```powershell
docker stop photopixels-web
docker rm photopixels-web
```

3. **Use different port:**

```powershell
docker run -d -p 8080:80 scalefocusad/photopixels-web:latest
```

### Environment Variables Not Working

#### Problem: SERVER_URL not replacing %%BASEURL%%

**Symptoms:**

- Application shows `%%BASEURL%%` in console
- API calls go to wrong URL

**Solutions:**

1. **Verify environment variable is set:**

```powershell
docker exec photopixels-web env | Select-String -Pattern "SERVER_URL"
```

2. **Check Nginx configuration:**

```powershell
docker exec photopixels-web cat /etc/nginx/conf.d/default.conf
```

3. **Verify sub_filter is working:**

```powershell
docker exec photopixels-web curl -s http://localhost | Select-String -Pattern "BASE_URL"
```

4. **Restart container with correct env:**

```powershell
docker stop photopixels-web
docker rm photopixels-web
docker run -d `
  --name photopixels-web `
  -p 80:80 `
  -e SERVER_URL=https://api.yourserver.com `
  scalefocusad/photopixels-web:latest
```

## Production Issues

### 502 Bad Gateway

**Symptoms:**

- Nginx shows 502 error
- Application not accessible

**Solutions:**

1. **Check container is running:**

```powershell
docker ps | Select-String -Pattern "photopixels-web"
```

2. **Check container logs:**

```powershell
docker logs photopixels-web --tail 50
```

3. **Verify port mapping:**

```powershell
docker port photopixels-web
```

4. **Check reverse proxy configuration** (if using one)

5. **Restart container:**

```powershell
docker restart photopixels-web
```

### 404 Errors on Refresh

**Symptoms:**

- Application loads initially
- 404 error when refreshing on nested routes

**Solutions:**

1. **Verify Nginx configuration has fallback:**

```nginx
location / {
    try_files $uri /index.html;
}
```

2. **Check Nginx config is loaded:**

```powershell
docker exec photopixels-web nginx -t
```

3. **Restart Nginx:**

```powershell
docker exec photopixels-web nginx -s reload
```

### Images Not Loading

**Symptoms:**

- Thumbnails don't display
- Broken image icons

**Solutions:**

1. **Check API connectivity:**

```powershell
curl https://api.yourserver.com/media/123
```

2. **Verify CORS headers on API**

3. **Check browser console for errors**

4. **Test image URL directly in browser**

5. **Check authentication token is valid**

### Slow Performance

**Symptoms:**

- Application loads slowly
- Images take long to appear

**Solutions:**

1. **Enable gzip compression in Nginx:**

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Check caching headers:**

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Use CDN for static assets**

4. **Optimize images on backend**

5. **Check React Query cache configuration:**

```typescript
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
		},
	},
});
```

## Build Issues

### Build Fails in CI/CD

**Symptoms:**

- GitHub Actions workflow fails
- Build step returns errors

**Solutions:**

1. **Check workflow logs in GitHub Actions**

2. **Verify Node version in workflow:**

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '16.x' # Not dotnet-version!
```

3. **Test build locally:**

```powershell
npm ci
npm run build
```

4. **Check environment variables in GitHub:**

   - Repository → Settings → Secrets and variables → Actions

5. **Verify package-lock.json is committed:**

```powershell
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Docker Build Fails

**Symptoms:**

```
ERROR [build X/Y] npm ci failed
```

**Solutions:**

1. **Test Docker build locally:**

```powershell
docker build -t test-image .
```

2. **Check Dockerfile syntax**

3. **Verify package.json and package-lock.json are in sync:**

```powershell
Remove-Item package-lock.json
npm install
```

4. **Check Node version in Dockerfile:**

```dockerfile
FROM node:16.18-alpine  # Ensure version is available
```

## VS Code Issues

### IntelliSense Not Working

**Symptoms:**

- No autocomplete suggestions
- TypeScript errors not showing

**Solutions:**

1. **Restart TypeScript server:**

   - `Ctrl+Shift+P`
   - "TypeScript: Restart TS Server"

2. **Check settings:**

```json
{
	"typescript.suggest.enabled": true,
	"javascript.suggest.enabled": true
}
```

3. **Reinstall VS Code TypeScript:**

   - `Ctrl+Shift+P`
   - "TypeScript: Select TypeScript Version"
   - "Use Workspace Version"

4. **Check for conflicting extensions**

5. **Reload VS Code window:**
   - `Ctrl+Shift+P`
   - "Developer: Reload Window"

### Debugger Not Working

**Solutions:**

1. **Check launch.json configuration:**

```json
{
	"type": "chrome",
	"request": "launch",
	"name": "Launch Chrome",
	"url": "http://localhost:3000",
	"webRoot": "${workspaceFolder}/src"
}
```

2. **Ensure dev server is running:**

```powershell
npm start
```

3. **Clear browser cache**

4. **Try different browser (Edge/Chrome)**

## Common Error Messages

### "Cannot read property 'X' of undefined"

**Cause:** Trying to access property of undefined object

**Solutions:**

```typescript
// ❌ Unsafe
const name = user.name;

// ✅ Optional chaining
const name = user?.name;

// ✅ Default value
const name = user?.name || 'Unknown';

// ✅ Early return
if (!user) return null;
```

### "Uncaught TypeError: X is not a function"

**Cause:** Trying to call something that's not a function

**Solutions:**

```typescript
// Check if function exists
if (typeof callback === 'function') {
	callback();
}

// Verify import is correct
import { myFunction } from './utils'; // Named export
import myFunction from './utils'; // Default export
```

### "Maximum update depth exceeded"

**Cause:** Infinite loop in useEffect or setState

**Solutions:**

```typescript
// ❌ Wrong - infinite loop
useEffect(() => {
  setCount(count + 1);  // Runs on every render
});

// ✅ Correct - controlled dependency
useEffect(() => {
  setCount(count + 1);
}, []);  // Empty array = run once

// ❌ Wrong - setState in render
function Component() {
  setCount(count + 1);  // Infinite loop
  return <div>{count}</div>;
}

// ✅ Correct - setState in effect or event handler
useEffect(() => {
  setCount(count + 1);
}, []);
```

## Getting More Help

If you can't resolve an issue:

1. **Check browser console** for error messages
2. **Check network tab** for failed requests
3. **Review related documentation sections**
4. **Search GitHub issues** for similar problems
5. **Create a new GitHub issue** with:
   - Description of the problem
   - Steps to reproduce
   - Error messages
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

## Debugging Checklist

- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify environment variables are set
- [ ] Confirm API server is running
- [ ] Check Docker container logs (if applicable)
- [ ] Verify correct versions (Node, npm, packages)
- [ ] Clear cache and restart
- [ ] Test in incognito/private browsing mode
- [ ] Check for conflicting browser extensions
- [ ] Review recent code changes

---

**Related Documentation:**

- [Getting Started Guide](./getting-started.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment.md)
- [Configuration Guide](./configuration.md)
