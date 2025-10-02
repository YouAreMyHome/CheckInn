# 📋 Frontend Integration Guide - CheckInn Admin App

## 🎯 Tổng Quan

Tài liệu này hướng dẫn tích hợp Frontend Admin App với Backend API, bao gồm cách sử dụng các service, hooks và components đã được tách ra.

## 📁 Cấu Trúc Components Đã Tách

### 1. Service Layer

```
src/services/
├── apiClient.js          # Base HTTP client
├── authService.js        # Authentication services
└── adminService.js       # Admin-specific services
```

### 2. Custom Hooks

```
src/hooks/
├── useAuth.js           # Authentication hooks & context
└── useAdmin.js          # Admin dashboard hooks
```

### 3. Common Components

```
src/components/
├── common/
│   ├── StatsCard.jsx         # Reusable statistics card
│   ├── ErrorBoundary.jsx     # Error handling component
│   ├── LoadingSkeleton.jsx   # Loading states
│   └── PageHeader.jsx        # Page header with actions
├── dashboard/
│   ├── KPICards.jsx          # Dashboard KPI metrics
│   ├── RevenueChart.jsx      # Revenue analytics charts
│   └── SystemHealthMonitor.jsx # System health monitoring
└── charts/                   # Chart components (future)
```

## 🔗 API Integration Status

### ✅ Đã Tích Hợp (Có Sẵn Backend)

#### 1. Authentication APIs

- **POST** `/auth/login` ✅
- **POST** `/auth/register` ✅
- **GET** `/auth/me` ✅
- **POST** `/auth/refresh` ✅
- **POST** `/auth/logout` ✅
- **POST** `/auth/forgot-password` ✅
- **POST** `/auth/reset-password/:token` ✅

#### 2. Hotels APIs

- **GET** `/hotels` ✅
- **GET** `/hotels/:id` ✅
- **POST** `/hotels` (Partner only) ✅
- **PUT** `/hotels/:id` (Partner only) ✅

#### 3. Bookings APIs

- **GET** `/bookings` ✅
- **POST** `/bookings` ✅
- **GET** `/bookings/:id` ✅
- **PATCH** `/bookings/:id/cancel` ✅

### 🔄 Cần Tích Hợp (Chưa Có Backend)

#### 1. Admin Dashboard APIs

```javascript
// Cần implement backend
GET / admin / dashboard / stats;
GET / admin / analytics / revenue;
GET / admin / system / health;
```

#### 2. Admin User Management

```javascript
// Cần implement backend
GET /admin/users
PATCH /admin/users/:id/status
DELETE /admin/users/:id
```

#### 3. Admin Hotel Management

```javascript
// Cần implement backend
GET /admin/hotels
PATCH /admin/hotels/:id/approve
PATCH /admin/hotels/:id/reject
```

#### 4. Admin Booking Management

```javascript
// Cần implement backend
GET /admin/bookings
PATCH /admin/bookings/:id/status
```

#### 5. Reports & Analytics

```javascript
// Cần implement backend
GET /admin/reports/:type
GET /admin/reports/:type/export
GET /admin/metrics/performance
```

#### 6. System Management

```javascript
// Cần implement backend
GET / admin / settings;
PUT / admin / settings;
GET / admin / logs / activity;
```

## 💻 Cách Sử Dụng Components

### 1. Sử dụng Auth Hook

```jsx
import { useAuth, AuthProvider } from "./hooks/useAuth";

// Wrap app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// Use in components
function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Redirect to dashboard
    } catch (error) {
      // Handle error
    }
  };
}
```

### 2. Sử dụng Admin Hooks

```jsx
import { useDashboardStats, useRevenueAnalytics } from "./hooks/useAdmin";

function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: revenue } = useRevenueAnalytics("7d");

  if (isLoading) return <LoadingSkeleton type="stats" />;

  return (
    <div>
      <KPICards data={stats} />
      <RevenueChart data={revenue} />
    </div>
  );
}
```

### 3. Sử dụng Common Components

```jsx
import StatsCard from "./components/common/StatsCard";
import PageHeader from "./components/common/PageHeader";
import ErrorBoundary from "./components/common/ErrorBoundary";

function MyPage() {
  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        onRefresh={() => refetch()}
        onCreate={() => setCreateModalOpen(true)}
      />

      <StatsCard
        title="Tổng người dùng"
        value={1234}
        icon={<UserOutlined />}
        trend={{ type: "increase", value: "12%" }}
      />

      <ErrorBoundary error={error} retry={refetch}>
        <YourContent />
      </ErrorBoundary>
    </div>
  );
}
```

## 🎨 UI/UX Best Practices Đã Áp Dụng

### 1. Loading States

- ✅ Skeleton components cho từng loại content
- ✅ Loading spinners cho actions
- ✅ Progressive loading cho large datasets

### 2. Error Handling

- ✅ Global error boundary
- ✅ Contextual error messages
- ✅ Retry mechanisms

### 3. User Feedback

- ✅ Toast notifications cho actions
- ✅ Loading states cho async operations
- ✅ Success/error visual feedback

### 4. Responsive Design

- ✅ Mobile-first approach
- ✅ Flexible grid system
- ✅ Adaptive component sizing

### 5. Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels và roles
- ✅ Keyboard navigation support
- ✅ Color contrast compliance

## 🔧 Environment Configuration

### 1. Environment Variables

```bash
# .env.development
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.checkinn.com/api
REACT_APP_ENV=production
```

### 2. API Client Configuration

```javascript
// services/apiClient.js
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Auto token refresh
// Error handling với retry logic
// Request/response interceptors
```

## 📊 Performance Optimizations

### 1. React Query Configuration

```javascript
// Stale time: 5 minutes for dashboard data
// Cache time: 10 minutes
// Background refetch: enabled
// Retry logic: 3 attempts with exponential backoff
```

### 2. Component Optimizations

```javascript
// React.memo for pure components
// useMemo for expensive calculations
// useCallback for stable function references
// Lazy loading for large components
```

### 3. Bundle Optimizations

```javascript
// Code splitting by routes
// Lazy loading of charts library
// Tree shaking of unused Ant Design components
```

## 🚀 Deployment Considerations

### 1. Build Configuration

```json
{
  "homepage": "/admin",
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

### 2. Docker Configuration

```dockerfile
# Multi-stage build
FROM node:16-alpine as builder
# ... build steps

FROM nginx:alpine
# ... serve static files
```

### 3. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
# Build → Test → Deploy to staging → Deploy to production
```

## 🔍 Testing Strategy

### 1. Unit Tests

```javascript
// Components testing with React Testing Library
// Hooks testing with @testing-library/react-hooks
// Services testing with Jest
```

### 2. Integration Tests

```javascript
// API integration tests
// User flow tests
// Error scenario tests
```

### 3. E2E Tests

```javascript
// Cypress tests for critical user paths
// Authentication flows
// Dashboard functionality
```

## 📈 Monitoring & Analytics

### 1. Error Tracking

```javascript
// Sentry integration
// Error boundaries với reporting
// Performance monitoring
```

### 2. User Analytics

```javascript
// Google Analytics 4
// User behavior tracking
// Performance metrics
```

### 3. Application Monitoring

```javascript
// Uptime monitoring
// API response time tracking
// Bundle size monitoring
```

---

## 📞 Support & Next Steps

1. **Backend Integration**: Cần implement các API endpoints được list ở section "Cần Tích Hợp"
2. **Component Enhancement**: Thêm các components còn thiếu (RecentActivity, DetailedReports, etc.)
3. **Testing**: Viết unit tests và integration tests
4. **Documentation**: Cập nhật tài liệu API khi có endpoints mới

**Last Updated**: September 24, 2025  
**Version**: 1.0.0
