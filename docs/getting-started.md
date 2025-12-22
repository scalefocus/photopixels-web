# Getting Started Guide

This guide will help you set up the PhotoPixels Web application on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** v16.18 or higher ([Download](https://nodejs.org/))
- **npm** v8 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Optional Software

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop)) - For containerized development
- **Visual Studio Code** ([Download](https://code.visualstudio.com/)) - Recommended IDE

### Backend API

You'll need access to a running PhotoPixels backend API server. The API URL will be configured in your environment variables.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/photopixels-web.git
cd photopixels-web
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using pnpm (if available):

```bash
pnpm install
```

This will install all dependencies listed in `package.json`, including:

- React and React DOM
- Material-UI components and icons
- React Query for data fetching
- React Router for navigation
- Axios for HTTP requests

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file (if available)
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
# Backend API Server URL
REACT_APP_SERVER=http://localhost:5000

# Optional: Additional configuration
# NODE_ENV=development
```

**Important**: The `REACT_APP_SERVER` variable must point to your PhotoPixels backend API server.

### 4. Start the Development Server

```bash
npm start
```

The application will automatically open in your default browser at:

```
http://localhost:3000
```

### 5. Verify Installation

You should see the PhotoPixels login page. If everything is configured correctly:

1. The page loads without errors
2. The browser console shows no critical errors
3. You can attempt to login (requires valid backend API)

## Development Environment Setup

### Visual Studio Code Configuration

#### Recommended Extensions

Install these VS Code extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`) - Code linting
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatting
3. **TypeScript and JavaScript** (Built-in) - Language support
4. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
5. **Material Icon Theme** (`PKief.material-icon-theme`) - Better file icons

#### Enable IntelliSense

Create or update `.vscode/settings.json`:

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": true
	},
	"typescript.suggest.enabled": true,
	"javascript.suggest.enabled": true,
	"typescript.updateImportsOnFileMove.enabled": "always",
	"editor.quickSuggestions": {
		"other": true,
		"comments": false,
		"strings": true
	}
}
```

#### Workspace Snippets

VS Code will provide TypeScript and React snippets automatically. Common ones:

- `tsrce` - Create TypeScript React component with export
- `tsrc` - Create TypeScript React component
- `uef` - useEffect hook
- `usf` - useState hook

### Browser DevTools

Install these browser extensions:

1. **React Developer Tools** - Inspect React component hierarchy

   - [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

2. **Redux DevTools** (if Redux is added in the future)

## Available Scripts

After installation, you can run these commands:

### `npm start`

Runs the app in development mode with hot reloading.

- Opens: http://localhost:3000
- Auto-reloads on file changes
- Shows lint errors in console

### `npm test`

Launches the test runner in interactive watch mode.

```bash
npm test
```

### `npm run build`

Creates an optimized production build in the `build/` folder.

```bash
npm run build
```

### `npm run lint`

Runs ESLint to check and fix code quality issues.

```bash
npm run lint
```

### `npm run format`

Formats code using Prettier.

```bash
npm run format
```

## Project Structure Overview

```
photopixels-web/
├── public/              # Static files
│   ├── index.html       # HTML template
│   ├── favicon.ico      # App icon
│   └── manifest.json    # PWA manifest
├── src/
│   ├── api/             # API integration layer
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── layout/          # Layout components
│   ├── context/         # React context providers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── constants/       # App constants
│   └── index.tsx        # App entry point
├── docker/              # Docker configuration
├── .github/             # GitHub Actions workflows
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Troubleshooting Installation

### Port 3000 Already in Use

If port 3000 is occupied:

**Windows (PowerShell):**

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Alternative:** Set a different port:

```bash
set PORT=3001 && npm start
```

### Node Version Issues

If you encounter Node.js version errors:

```bash
# Check your Node version
node --version

# Should be v16.18 or higher
```

Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```bash
nvm install 16.18
nvm use 16.18
```

### Dependencies Installation Fails

Try clearing the cache and reinstalling:

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

### Environment Variables Not Working

- Ensure variables start with `REACT_APP_` prefix
- Restart the dev server after changing `.env`
- Variables are embedded at build time, not runtime

### API Connection Issues

If you see network errors:

1. Verify the backend API is running
2. Check `REACT_APP_SERVER` URL in `.env`
3. Ensure no CORS issues (check browser console)
4. Test API endpoint manually:
   ```bash
   curl http://localhost:5000/status
   ```

## Next Steps

Now that you have the development environment set up:

1. 📖 Read the [Architecture Overview](./architecture.md) to understand the project structure
2. 💻 Review the [Development Guide](./development-guide.md) for coding standards
3. 🔌 Check the [API Integration](./api-integration.md) guide for working with the backend
4. 🧩 Explore the [Component Guide](./component-guide.md) for component documentation

## Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review the [FAQ section](#) (coming soon)
- Open an issue on [GitHub](https://github.com/your-org/photopixels-web/issues)
