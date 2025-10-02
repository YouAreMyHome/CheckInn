# CheckInn Workspace Configuration

## 🏗️ Workspace Structure

This is a npm workspaces monorepo containing multiple applications and shared packages.

### Directory Structure:

- `apps/` - Individual applications
- `packages/` - Shared packages and libraries
- `docs/` - Documentation
- `scripts/` - Build and deployment scripts
- `tools/` - Development tools and utilities

### Workspace Benefits:

1. **Shared Dependencies** - Common packages installed once at root
2. **Cross-package Imports** - Easy importing between packages
3. **Unified Scripts** - Run commands across all workspaces
4. **Consistent Tooling** - Shared linting, testing, build tools
5. **Atomic Deployments** - Deploy related changes together

## 🚀 Commands

### Development

```bash
npm run dev                 # Start all apps in development mode
npm run dev:admin          # Start admin dashboard only
npm run dev:client         # Start client app only
npm run dev:partner        # Start partner portal only
npm run dev:api           # Start API server only
```

### Building

```bash
npm run build             # Build all applications
npm run build:admin       # Build admin dashboard
npm run build:client      # Build client app
npm run build:partner     # Build partner portal
```

### Package Management

```bash
npm install               # Install all workspace dependencies
npm run install:all       # Explicit install all workspaces
```

### Testing & Quality

```bash
npm run test             # Run tests in all workspaces
npm run lint             # Lint all workspaces
npm run clean            # Clean build artifacts
```

## 📦 Adding New Packages

### New Application

```bash
mkdir apps/new-app
cd apps/new-app
npm init -y
# Add to workspaces in root package.json
```

### New Shared Package

```bash
mkdir packages/new-package
cd packages/new-package
npm init -y
# Configure as workspace package
```

## 🔧 Workspace Dependencies

Dependencies are hoisted to the root when possible, but each workspace can have its own dependencies when needed.

### Installing Dependencies

```bash
# Root dependency (available to all workspaces)
npm install lodash

# Workspace-specific dependency
npm install react --workspace=apps/admin-dashboard

# Dev dependency for specific workspace
npm install -D jest --workspace=packages/shared-utils
```

## 🎯 Best Practices

1. **Shared Code** - Put reusable code in `packages/`
2. **App-Specific** - Keep application code in respective `apps/`
3. **Documentation** - Document packages and their APIs
4. **Versioning** - Use consistent versioning across packages
5. **Scripts** - Define consistent npm scripts across workspaces
