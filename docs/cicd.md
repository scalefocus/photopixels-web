# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment pipeline for PhotoPixels Web using GitHub Actions.

## Overview

The CI/CD pipeline automatically builds, tests, and publishes Docker images when version tags are pushed to the repository.

**Pipeline Flow:**

```
Git Tag Push (v*)
    ↓
GitHub Actions Triggered
    ↓
Checkout Code → Setup Node → Create .env → Install Dependencies
    ↓
Build Application → Build Docker Image
    ↓
Login to Docker Hub → Push Image
    ↓
Image Available: scalefocusad/photopixels-web:VERSION
```

## Workflow Configuration

### Location

`.github/workflows/ci-main.yml`

### Trigger

The workflow is triggered when a version tag matching the pattern `v*` is pushed:

```yaml
on:
  push:
    tags:
      - v*
```

**Examples of valid tags:**

- `v1.0.0`
- `v1.2.3`
- `v2.0.0-beta`
- `v1.5.0-rc.1`

## Pipeline Stages

### Stage 1: Checkout Code

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

**Purpose:** Checks out the repository code with full git history.

**Parameters:**

- `fetch-depth: 0` - Fetches all history for all branches and tags

### Stage 2: Setup Node.js

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '16.x' # Note: Original config had an error
```

**⚠️ Configuration Issue:**
The current workflow has `dotnet-version: 8.0.x` which is incorrect. It should be `node-version: '16.x'` or higher.

**Corrected Configuration:**

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '16.x'
    cache: 'npm'
```

**Purpose:** Sets up Node.js environment for building the React application.

### Stage 3: Create Environment File

```yaml
- name: Make envfile
  uses: SpicyPizza/create-envfile@v2.0
  with:
    envkey_REACT_APP_SERVER: ${{ vars.SERVER_URL }}
    directory: .
    file_name: .env
```

**Purpose:** Creates `.env` file with backend API URL.

**Variables Used:**

- `vars.SERVER_URL` - GitHub repository variable containing the API endpoint

**Resulting .env file:**

```env
REACT_APP_SERVER=https://api.yourserver.com
```

### Stage 4: Install Dependencies

```yaml
- name: Restore dependencies
  run: npm ci
```

**Purpose:** Installs npm dependencies using clean install.

**Why `npm ci` instead of `npm install`:**

- Faster installation
- Uses exact versions from package-lock.json
- Better for CI/CD environments
- Fails if package.json and package-lock.json are out of sync

### Stage 5: Build Application

```yaml
- name: Build project
  run: npm run build
```

**Purpose:** Creates production-ready build in the `build/` directory.

**Build Process:**

1. Transpiles TypeScript to JavaScript
2. Bundles and minifies code
3. Optimizes assets
4. Generates source maps
5. Outputs to `build/` folder

### Stage 6: Extract Version

```yaml
- name: Write release version
  run: |
    VERSION=${GITHUB_REF_NAME#v}
    echo Version: $VERSION
    echo "VERSION=$VERSION" >> $GITHUB_ENV
```

**Purpose:** Extracts version number from git tag.

**Example:**

- Tag: `v1.2.3`
- Extracted VERSION: `1.2.3`

**How it works:**

- `${GITHUB_REF_NAME#v}` - Removes 'v' prefix from tag name
- `echo "VERSION=$VERSION" >> $GITHUB_ENV` - Makes VERSION available to subsequent steps

### Stage 7: Build Docker Image

```yaml
- name: Build docker image
  run: docker build -t scalefocusad/photopixels-web:${VERSION} -f ./Dockerfile .
```

**Purpose:** Builds Docker image with version tag.

**Image Tag:**

- Format: `scalefocusad/photopixels-web:VERSION`
- Example: `scalefocusad/photopixels-web:1.2.3`

**Build Process:**

1. Executes multi-stage Dockerfile
2. Tags image with version number
3. Image ready for push to Docker Hub

### Stage 8: Docker Hub Login

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_HUB_USERNAME }}
    password: ${{ secrets.DOCKER_HUB_PASS }}
```

**Purpose:** Authenticates with Docker Hub.

**Required Secrets:**

- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_PASS` - Docker Hub password or access token

### Stage 9: Push Docker Image

```yaml
- name: Push Docker image
  run: docker push scalefocusad/photopixels-web:${VERSION}
```

**Purpose:** Pushes the built image to Docker Hub.

**Result:**
Image is publicly available at:

```
docker.io/scalefocusad/photopixels-web:1.2.3
```

## Required Configuration

### GitHub Secrets

Configure in: **Repository → Settings → Secrets and variables → Actions → Secrets**

| Secret Name           | Description                         | How to Get                                                  |
| --------------------- | ----------------------------------- | ----------------------------------------------------------- |
| `DOCKER_HUB_USERNAME` | Docker Hub username                 | Your Docker Hub account username                            |
| `DOCKER_HUB_PASS`     | Docker Hub password or access token | Docker Hub → Account Settings → Security → New Access Token |

**Creating Docker Hub Access Token:**

1. Log into Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Name: `github-actions-photopixels-web`
5. Permissions: Read & Write
6. Copy token and save as `DOCKER_HUB_PASS` secret

### GitHub Variables

Configure in: **Repository → Settings → Secrets and variables → Actions → Variables**

| Variable Name | Description     | Example                       |
| ------------- | --------------- | ----------------------------- |
| `SERVER_URL`  | Backend API URL | `https://api.photopixels.com` |

**Setting Variables:**

1. Navigate to Repository Settings
2. Go to "Secrets and variables" → "Actions" → "Variables" tab
3. Click "New repository variable"
4. Name: `SERVER_URL`
5. Value: Your API endpoint URL
6. Click "Add variable"

## Release Process

### 1. Prepare Release

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Verify everything works
npm install
npm run build
npm test

# Check for uncommitted changes
git status
```

### 2. Create Release Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0

- Added feature X
- Fixed bug Y
- Improved performance Z"

# Push tag to trigger CI/CD
git push origin v1.0.0
```

### 3. Monitor Pipeline

1. Go to GitHub repository
2. Click "Actions" tab
3. Click on the running workflow
4. Monitor each step's progress
5. Check for errors or warnings

### 4. Verify Deployment

```bash
# Check if image is available
docker pull scalefocusad/photopixels-web:1.0.0

# Verify image
docker images | grep photopixels-web

# Test image locally
docker run -d -p 8080:80 \
  -e SERVER_URL=https://api.yourserver.com \
  scalefocusad/photopixels-web:1.0.0

# Test in browser
curl http://localhost:8080
```

## Versioning Strategy

### Semantic Versioning

Follow [Semantic Versioning 2.0.0](https://semver.org/):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR** - Incompatible API changes
- **MINOR** - New functionality, backward compatible
- **PATCH** - Bug fixes, backward compatible

### Version Examples

```bash
# Major release (breaking changes)
git tag -a v2.0.0 -m "Major release with breaking changes"

# Minor release (new features)
git tag -a v1.1.0 -m "Added album sharing feature"

# Patch release (bug fixes)
git tag -a v1.0.1 -m "Fixed image upload bug"
```

### Pre-release Versions

```bash
# Alpha release
git tag -a v1.1.0-alpha.1 -m "Alpha release for testing"

# Beta release
git tag -a v1.1.0-beta.1 -m "Beta release for user testing"

# Release candidate
git tag -a v1.1.0-rc.1 -m "Release candidate 1"
```

## Advanced Workflow Enhancements

### Recommended Improvements

#### 1. Add Caching

Speed up builds by caching dependencies:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

#### 2. Run Tests

Add test stage before building:

```yaml
- name: Run tests
  run: npm test -- --passWithNoTests --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

#### 3. Lint Code

Ensure code quality:

```yaml
- name: Lint code
  run: npm run lint
```

#### 4. Build Multi-platform Images

Support ARM and x86:

```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: scalefocusad/photopixels-web:${{ env.VERSION }}
```

#### 5. Tag Latest

Automatically tag as `latest`:

```yaml
- name: Tag as latest
  run: |
    docker tag scalefocusad/photopixels-web:${VERSION} scalefocusad/photopixels-web:latest
    docker push scalefocusad/photopixels-web:latest
```

#### 6. Create GitHub Release

Automatically create GitHub release:

```yaml
- name: Create GitHub Release
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ github.ref_name }}
    release_name: Release ${{ github.ref_name }}
    draft: false
    prerelease: false
```

#### 7. Slack/Discord Notifications

Notify team of deployments:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'PhotoPixels Web ${{ github.ref_name }} deployment ${{ job.status }}'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Complete Enhanced Workflow

```yaml
name: Build and Deploy

on:
  push:
    tags:
      - v*

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '16.x'
          cache: 'npm'

      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Make envfile
        uses: SpicyPizza/create-envfile@v2.0
        with:
          envkey_REACT_APP_SERVER: ${{ vars.SERVER_URL }}
          directory: .
          file_name: .env

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Run tests
        run: npm test -- --passWithNoTests --coverage

      - name: Build project
        run: npm run build

      - name: Extract version
        run: |
          VERSION=${GITHUB_REF_NAME#v}
          echo "VERSION=$VERSION" >> $GITHUB_ENV

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_PASS }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            scalefocusad/photopixels-web:${{ env.VERSION }}
            scalefocusad/photopixels-web:latest
          cache-from: type=registry,ref=scalefocusad/photopixels-web:buildcache
          cache-to: type=registry,ref=scalefocusad/photopixels-web:buildcache,mode=max

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          draft: false
          prerelease: ${{ contains(github.ref_name, 'alpha') || contains(github.ref_name, 'beta') || contains(github.ref_name, 'rc') }}
```

## Troubleshooting

### Pipeline Fails at Build Stage

**Problem:** `npm run build` fails

**Solutions:**

```bash
# Test build locally
npm install
npm run build

# Check for TypeScript errors
npm run build 2>&1 | grep error

# Verify environment variables
cat .env
```

### Docker Build Fails

**Problem:** Docker build fails with errors

**Solutions:**

```bash
# Test Docker build locally
docker build -t test-image .

# Check Dockerfile syntax
docker build --no-cache -t test-image .

# View build logs
docker build --progress=plain -t test-image .
```

### Docker Push Fails

**Problem:** Cannot push to Docker Hub

**Solutions:**

1. Verify credentials in GitHub Secrets
2. Check Docker Hub repository exists
3. Verify access token permissions
4. Check Docker Hub rate limits

```bash
# Test authentication locally
docker login -u yourusername
docker push scalefocusad/photopixels-web:test
```

### Wrong Node Version

**Problem:** Build fails due to Node version mismatch

**Solution:**
Update workflow to use correct Node version:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '18.x' # Match your development version
```

## Best Practices

### 1. Test Before Tagging

```bash
# Always test locally before creating release tag
npm install
npm run lint
npm test
npm run build
docker build -t test .
```

### 2. Use Annotated Tags

```bash
# ✅ Good - annotated tag with message
git tag -a v1.0.0 -m "Release version 1.0.0"

# ❌ Avoid - lightweight tag
git tag v1.0.0
```

### 3. Maintain CHANGELOG

Keep `CHANGELOG.md` updated:

```markdown
## [1.0.0] - 2025-12-22

### Added

- New media preview feature
- Video playback support
- Album sharing functionality

### Fixed

- Image upload size limit bug
- Mobile responsive issues

### Changed

- Updated to React 18
- Improved loading performance
```

### 4. Protect Main Branch

Configure branch protection:

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 5. Regular Dependency Updates

Use Dependabot or Renovate:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
```

## Monitoring & Notifications

### View Workflow Runs

1. Go to repository → Actions
2. Click on workflow run
3. View logs for each step
4. Download artifacts if any

### Email Notifications

GitHub automatically sends emails on workflow failures to:

- Workflow author
- Repository owners

### Custom Notifications

Add to workflow for custom notifications:

```yaml
- name: Send notification
  if: failure()
  run: |
    curl -X POST https://your-webhook-url \
      -H 'Content-Type: application/json' \
      -d '{"text":"Build failed for ${{ github.ref_name }}"}'
```

## Security Considerations

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate Docker Hub access tokens regularly
- Use least-privilege access tokens
- Enable 2FA on Docker Hub account
- Scan Docker images for vulnerabilities
- Keep actions up to date

---

**Related Documentation:**

- [Deployment Guide](./deployment.md)
- [Development Guide](./development-guide.md)
- [Configuration Guide](./configuration.md)
