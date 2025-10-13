# 🏨 CheckInn - Website Đặt Phòng Khách Sạn 

**Repository**: https://github.com/YouAreMyHome/CheckInn.git  
**Version**: 2.0.0 | **Status**: ✅ Full Stack Application Ready

## 🚀 Quick Start (Run from Root Directory)

```bash
# 📦 Install all dependencies (first time)
npm install

# 🔥 Run both Frontend + Backend (Development)
npm run dev

# 🚀 Run individual servers
npm run dev:api        # Only API Server (port 5000)
npm run dev:frontend   # Only Frontend (port 5173)

# 🏭 Production mode
npm run start:full     # Both servers in production

# 🔧 Utilities
npm run health        # Check API server health
npm run info          # Show project information
npm run test:health   # Detailed health check
```

**🌐 Application URLs:**
- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:5000  
- **API Documentation**: http://localhost:5000/api

## 🏗️ Project Structure (Full Stack Application)

```bash
CheckInn/
├── 📁 apps/                      # Applications (✅ Ready)
│   ├── api-server/             # � Backend API Server (✅ Complete)
│   └── frontend/               # � Customer Portal React App (✅ Complete)
│
├── 📁 packages/                 # Shared Packages
│   ├── shared-ui/             # 🎨 Shared UI Components  
│   ├── shared-utils/          # 🛠️ Common Utilities
│   ├── api-client/            # 📡 API Client Library
│   └── types/                 # 📝 TypeScript Definitions
│
├── 📁 docs/                    # Documentation
│   ├── api/                   # API Documentation
│   ├── guides/                # Development Guides  
│   ├── architecture/          # System Architecture
│   └── deployment/            # Deployment Guides
│
├── 📁 config/                  # Shared Configuration
├── 📁 scripts/                 # Build & Deployment Scripts
├── 📁 tools/                   # Development Tools
└── 📄 Root Configuration Files
```

## ✅ **Current Status & Features**

### 🔧 **Backend API Server** (100% Complete)
- ✅ Express.js + MongoDB + JWT Authentication
- ✅ 13 API endpoints with full CRUD operations
- ✅ Hotel Management System with business logic
- ✅ User roles: Customer, Hotel Manager, Admin
- ✅ Advanced features: Pagination, filtering, sorting
- ✅ Security: Rate limiting, validation, sanitization

### 🌐 **Frontend Customer Portal** (85% Complete)  
- ✅ React + Vite + Tailwind CSS + React Router
- ✅ Complete booking flow: Search → Details → Booking → Confirmation
- ✅ Authentication with real API integration
- ✅ Responsive design with modern UI/UX
- ✅ Real-time hotel search with filters and sorting

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0
- Git

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/YouAreMyHome/CheckInn.git
cd CheckInn

# Install all dependencies (root + apps/api-server + apps/frontend)
npm install

# Start development servers (both frontend + backend)
npm run dev
```

### 🎯 **Available Commands**

```bash
# 🚀 Development (recommended)
npm run dev              # Start both frontend + backend
npm run dev:api          # Only API server (port 5000)
npm run dev:frontend     # Only frontend (port 5173)

# 🏭 Production
npm run start:full       # Both servers in production mode
npm run start:api        # Only API server  
npm run frontend         # Only frontend server

# 📦 Installation
npm install              # Install all workspaces
npm run install:all      # Install each directory separately
npm run install:api      # Install only API server deps
npm run install:frontend # Install only frontend deps

# 🔧 Build & Deploy  
npm run build           # Build both applications
npm run build:api       # Build API server
npm run build:frontend  # Build frontend

# 🧹 Maintenance
npm run clean           # Clean all node_modules
npm run clean:cache     # Clean build cache (Vite, etc.)
npm run reset           # Clean + reinstall everything

# 📊 Monitoring
npm run health          # Quick API health check
npm run test:health     # Detailed health check  
npm run info            # Show project information
```

### 🌍 **Development URLs**

- **Frontend (Customer Portal)**: <http://localhost:5173>
- **Backend API Server**: <http://localhost:5000>  
- **API Documentation**: <http://localhost:5000/api>
- **Health Check**: <http://localhost:5000/health>

## 📱 Applications

### 🎯 Admin Dashboard

- **Port:** 3002
- **Path:** `apps/admin-dashboard/`
- **Purpose:** Hotel system administration, analytics, user management
- **Tech:** React 18, Ant Design, Tailwind CSS

### 🏠 Client App

- **Port:** 3000
- **Path:** `apps/client-app/`
- **Purpose:** Customer hotel booking interface
- **Tech:** React 18, Vite, Tailwind CSS

### 🤝 Partner Portal

- **Port:** 3003
- **Path:** `apps/partner-portal/`
- **Purpose:** Hotel partner management interface
- **Tech:** React 18, Material UI

### 📱 Customer App

- **Port:** 3004
- **Path:** `apps/customer-app/`
- **Purpose:** Mobile customer interface
- **Tech:** React Native / PWA

### 🔧 API Server

- **Port:** 5001
- **Path:** `apps/api-server/`
- **Purpose:** Backend REST API, database, business logic
- **Tech:** Node.js, Express, MongoDB, JWT

## 📦 Shared Packages

### 🎨 shared-ui

Common UI components across all applications

```bash
# Usage example
import { Button, Card, Modal } from '@checkin/shared-ui';
```

### 🛠️ shared-utils

Common utilities and helpers

```bash
# Usage example
import { formatCurrency, validateEmail } from '@checkin/shared-utils';
```

### 📡 api-client

Centralized API client with type safety

```bash
# Usage example
import { hotelApi, bookingApi } from '@checkin/api-client';
```

## 🔧 Development Commands

```bash
# Development - Run all apps
npm run dev

# Development - Individual apps
npm run dev:admin      # Admin dashboard only
npm run dev:client     # Client app only
npm run dev:partner    # Partner portal only
npm run dev:api        # API server only

# Production Build
npm run build          # Build all apps
npm run build:admin    # Build admin only
npm run build:client   # Build client only

# Testing & Quality
npm run test           # Run all tests
npm run lint           # Run linting
npm run clean          # Clean all builds
```

## 🎨 Features

### ✨ Admin Dashboard

- 📊 Analytics & Reporting
- 👥 User Management
- 🏨 Hotel Management
- 📋 Booking Management
- ⚙️ System Settings
- 🔐 Security & Permissions

### 🏠 Customer Portal

- 🔍 Hotel Search & Filtering
- 📅 Booking Management
- 💳 Payment Processing
- ⭐ Reviews & Ratings
- 📱 Mobile Responsive

### 🤝 Partner Portal

- 🏨 Property Management
- 📊 Revenue Analytics
- 📋 Reservation Management
- 📈 Performance Metrics
- 💰 Financial Reports

## 🛡️ Security Features

- 🔐 JWT Authentication
- 🔒 Role-based Access Control
- 🛡️ Input Validation & Sanitization
- 🔍 Rate Limiting
- 📝 Audit Logging

## 📚 Documentation

- **📖 [Setup Guide](./docs/guides/SETUP_GUIDE.md)** - Getting started
- **🏗️ [Architecture](./docs/architecture/)** - System design
- **🔌 [API Docs](./docs/api/)** - API reference
- **🚀 [Deployment](./docs/deployment/)** - Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Admin Dashboard:** Modern React with Ant Design
- **Client Portal:** Vite + React with Tailwind
- **Partner Portal:** Material UI implementation
- **Backend API:** Node.js + Express + MongoDB
- **DevOps:** Docker + CI/CD pipeline

## 📞 Support

For support, email team@checkin.com or join our Slack channel.

---

**🚀 Built with modern technologies for scalable hotel management** 🏨
