# PhotoPixels Web - Developer Documentation

Welcome to the PhotoPixels Web application documentation. This comprehensive guide will help you understand, develop, deploy, and maintain the PhotoPixels web frontend.

## 📚 Documentation Index

### Getting Started

- **[Getting Started Guide](./getting-started.md)** - Setup your development environment and run the application locally

### Architecture & Development

- **[Architecture Overview](./architecture.md)** - Application structure, design patterns, and technical stack
- **[Development Guide](./development-guide.md)** - Coding standards, workflows, and best practices
- **[Component Guide](./component-guide.md)** - Detailed component documentation and usage examples
- **[API Integration](./api-integration.md)** - Backend API integration and data fetching patterns

### Deployment & Operations

- **[Deployment Guide](./deployment.md)** - Production deployment instructions
- **[Docker Guide](./docker.md)** - Docker configuration and containerization
- **[CI/CD Pipeline](./cicd.md)** - Automated build and deployment pipeline
- **[Configuration](./configuration.md)** - Environment variables and configuration options

### Maintenance

- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Testing Guide](./testing.md)** - Testing strategies and examples

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/photopixels-web.git
cd photopixels-web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API server URL

# Start development server
npm start
```

## 🏗️ Technology Stack

| Category             | Technology                           |
| -------------------- | ------------------------------------ |
| **Framework**        | React 18.2 with TypeScript           |
| **UI Library**       | Material-UI (MUI) 5.14               |
| **State Management** | React Query (TanStack Query) 5.8     |
| **Routing**          | React Router 6.18                    |
| **HTTP Client**      | Axios 1.6                            |
| **Build Tool**       | React Scripts 5.0 (Create React App) |
| **Container**        | Docker with Nginx                    |
| **CI/CD**            | GitHub Actions                       |

## 📋 Project Overview

PhotoPixels is a web-based photo management application that allows users to:

- Upload and organize photos and videos
- Create and manage albums
- Mark favorites and manage trash
- User authentication and role-based access control
- Admin dashboard for user management
- Quota management and server monitoring

## 🔗 Quick Links

- [GitHub Repository](https://github.com/your-org/photopixels-web)
- [Issue Tracker](https://github.com/your-org/photopixels-web/issues)
- [Docker Hub](https://hub.docker.com/r/scalefocusad/photopixels-web)
- [API Documentation](./api-integration.md)

## 📞 Support

For questions, issues, or contributions:

- Open an issue on GitHub
- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review existing documentation

## 📄 License

See the [LICENSE](../LICENSE) file in the project root.

---

**Last Updated**: December 2025
