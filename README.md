# 🏨 CheckInn - Website Đặt Phòng Khách Sạn 

**Repository**: https://github.com/YouAreMyHome/CheckInn.git  
**Version**: 2.0.0 | **Status**: ✅ Backend Core Complete

## 🚀 Quick Start (Run from Root Directory)

```bash
# Install dependencies (first time)
npm run install:all

# Start development server
npm start

# Start full production server  
npm run server

# Health check
npm run health

# View API info
npm run api:info
```

**Server URL**: http://localhost:5000  
**API Documentation**: http://localhost:5000/api

## 🏗️ Project Structure (New & Organized)

```
CheckInn/
├── 📁 apps/                      # Applications
│   ├── admin-dashboard/         # 👨‍💼 Admin Management Portal
│   ├── client-app/             # 👥 Customer Booking Portal
│   ├── partner-portal/         # 🤝 Hotel Partner Portal
│   ├── customer-app/           # 📱 Customer Mobile App
│   └── api-server/             # 🔧 Backend API Server
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
├── 📁 scripts/                 # Build & Deployment Scripts
├── 📁 tools/                   # Development Tools
└── 📄 Root Configuration Files
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd CheckInn

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

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
