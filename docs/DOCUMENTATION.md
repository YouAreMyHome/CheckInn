# 📋 CheckInn OTA - Documentation

## 🎯 Tổng Quan Dự Án

**CheckInn** là một nền tảng đặt phòng khách sạn trực tuyến (OTA - Online Travel Agency) được xây dựng với công nghệ hiện đại, phục vụ 3 nhóm người dùng chính:

- 👥 **Khách hàng** - Tìm kiếm và đặt phòng khách sạn
- 🏨 **Đối tác khách sạn** - Quản lý tài sản và đặt phòng
- 👨‍💼 **Quản trị viên** - Quản lý hệ thống và người dùng

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

- **Runtime**: Node.js với Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT tokens với bcrypt
- **File Upload**: Cloudinary integration
- **Security**: Rate limiting, CORS, helmet
- **Logging**: Winston logger

### Frontend

- **Framework**: React 18 với Vite
- **Styling**: Tailwind CSS + Ant Design
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form với validation
- **HTTP Client**: Axios
- **SEO**: React Helmet Async

---

## 📁 Cấu Trúc Dự Án

```
CheckInn/
├── client/                    # Frontend React App
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── common/        # Common UI components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── booking/       # Booking flow components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   └── search/        # Search components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── utils/             # Utility functions
│   │   ├── constants/         # App constants
│   │   └── services/          # API services
│   └── public/                # Static assets
├── server.js                  # Backend server
├── models/                    # MongoDB models
├── controllers/               # Route controllers
├── middleware/                # Custom middleware
├── routes/                    # API routes
├── services/                  # Business logic
└── utils/                     # Backend utilities
```

---

## 🚀 Tính Năng Đã Hoàn Thành

### ✅ 1. Frontend Architecture

**Mô tả**: Thiết lập nền tảng frontend với component architecture
**Components**:

- `constants/` - Theme, API endpoints, validation rules
- `utils/` - Date formatting, currency, validation helpers
- `services/api.js` - Axios configuration và interceptors
- `components/common/` - Button, Input, Modal, Loading, etc.

### ✅ 2. Layout System

**Mô tả**: Responsive layout cho tất cả loại trang
**Components**:

- `Header.jsx` - Navigation với user menu
- `Footer.jsx` - Company info và links
- `MainLayout.jsx` - Primary layout wrapper
- `DashboardLayout.jsx` - Admin/Partner layout
- `AuthLayout.jsx` - Authentication pages layout

### ✅ 3. Homepage

**Mô tả**: Trang chủ với search và featured content
**Components**:

- `HeroSection.jsx` - Search form chính
- `SearchBar.jsx` - Advanced search options
- `FeaturedHotels.jsx` - Hotels nổi bật
- `PopularDestinations.jsx` - Điểm đến phổ biến
- `Testimonials.jsx` - Đánh giá khách hàng

### ✅ 4. Search Results

**Mô tả**: Trang kết quả tìm kiếm với filter và sort
**Components**:

- `SearchResults.jsx` - Main search container
- `HotelCard.jsx` - Hotel display card
- `FilterSidebar.jsx` - Search filters
- `SortOptions.jsx` - Sorting controls
- `Pagination.jsx` - Results pagination

### ✅ 5. Hotel Detail Page

**Mô tả**: Chi tiết khách sạn với booking integration
**Components**:

- `HotelDetail.jsx` - Main hotel page
- `ImageGallery.jsx` - Photo gallery
- `HotelInfo.jsx` - Basic information
- `AmenitiesSection.jsx` - Hotel amenities
- `ReviewsSection.jsx` - Customer reviews
- `RoomSelection.jsx` - Available rooms

### ✅ 6. User Authentication

**Mô tả**: Hệ thống đăng nhập/đăng ký hoàn chỉnh
**Components**:

- `Login.jsx` - Login form với social options
- `Register.jsx` - Registration form
- `ForgotPassword.jsx` - Password recovery
- `VerifyEmail.jsx` - Email verification
- `ResetPassword.jsx` - Password reset
- `AuthContext.jsx` - Authentication state

### ✅ 7. User Profile Management

**Mô tả**: Quản lý profile và settings
**Components**:

- `ProfilePage.jsx` - Main profile page
- `AccountSettings.jsx` - Account preferences
- `PersonalInfo.jsx` - Personal information form
- `SecuritySettings.jsx` - Password và security
- `NotificationSettings.jsx` - Notification preferences

### ✅ 8. Booking Flow

**Mô tả**: Wizard đặt phòng với multiple steps
**Components**:

- `BookingContext.jsx` - State management với reducer
- `BookingWizard.jsx` - Main booking container
- `BookingStepProgress.jsx` - Progress indicator
- `BookingSummary.jsx` - Sticky booking summary
- `RoomSelectionStep.jsx` - Room selection
- `GuestDetailsStep.jsx` - Guest information form

---

## 🔄 API Endpoints

### Authentication

```
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/register       # Đăng ký
POST   /api/auth/forgot         # Quên mật khẩu
POST   /api/auth/reset          # Reset mật khẩu
GET    /api/auth/verify         # Verify email
POST   /api/auth/refresh        # Refresh token
```

### Hotels

```
GET    /api/hotels              # Danh sách khách sạn
GET    /api/hotels/:id          # Chi tiết khách sạn
POST   /api/hotels              # Tạo khách sạn (Partner)
PUT    /api/hotels/:id          # Cập nhật khách sạn
DELETE /api/hotels/:id          # Xóa khách sạn
GET    /api/hotels/search       # Tìm kiếm khách sạn
```

### Rooms

```
GET    /api/rooms               # Danh sách phòng
GET    /api/rooms/:id           # Chi tiết phòng
GET    /api/rooms/available     # Phòng trống
POST   /api/rooms               # Tạo phòng (Partner)
PUT    /api/rooms/:id           # Cập nhật phòng
DELETE /api/rooms/:id           # Xóa phòng
```

### Bookings

```
GET    /api/bookings            # Danh sách booking
GET    /api/bookings/:id        # Chi tiết booking
POST   /api/bookings            # Tạo booking
PUT    /api/bookings/:id        # Cập nhật booking
DELETE /api/bookings/:id        # Hủy booking
```

---

## 🎨 Design System

### Colors

```css
Primary: #2563eb (Blue 600)
Secondary: #64748b (Slate 500)
Success: #10b981 (Emerald 500)
Warning: #f59e0b (Amber 500)
Error: #ef4444 (Red 500)
Gray Scale: #f8fafc to #1e293b
```

### Typography

```css
Font Family: Inter, system-ui, sans-serif
Headings: font-bold, line-height tight
Body: font-normal, line-height relaxed
Small: text-sm, text-gray-600
```

### Components

- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Forms**: Consistent input styling với validation states
- **Cards**: Shadow-sm, rounded-lg, proper spacing
- **Navigation**: Sticky header, mobile hamburger menu
- **Loading**: Spinner với message support

---

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   # Mobile large
md: 768px   # Tablet
lg: 1024px  # Desktop
xl: 1280px  # Large desktop
2xl: 1536px # Extra large
```

### Mobile-First Approach

- Grid layouts adapt từ 1 column (mobile) đến multi-column (desktop)
- Navigation collapsible trên mobile
- Touch-friendly button sizes (min 44px)
- Optimized images với lazy loading

---

## 🔐 Security Features

### Authentication

- JWT tokens với secure httpOnly cookies
- Password hashing với bcrypt (salt rounds: 12)
- Rate limiting cho login attempts
- Email verification required
- Two-factor authentication ready

### Data Protection

- Input validation và sanitization
- CORS configuration
- Helmet.js security headers
- MongoDB injection protection
- XSS protection

### API Security

- Protected routes với middleware
- Role-based access control
- Request rate limiting
- Input data validation
- Error handling không expose sensitive info

---

## 🚧 Tính Năng Đang Phát Triển

### 🔄 Customer Dashboard (Todo #9)

- Booking history management
- Profile settings advanced
- Payment method management
- Support ticket system

### 🔄 Hotel Partner Dashboard (Todo #10)

- Property management interface
- Room inventory control
- Booking management
- Revenue analytics
- Guest communication

### 🔄 Admin Dashboard (Todo #11)

- User management system
- Hotel approval workflow
- System monitoring
- Platform analytics
- Content moderation

### 🔄 Payment Integration (Todo #12)

- VNPay gateway integration
- Momo wallet support
- Credit card processing
- Payment confirmation flow
- Refund management

---

## 📊 Performance Optimization

### Frontend

- **Code Splitting**: React.lazy cho pages
- **Caching**: Service Worker với cache strategies
- **Images**: WebP format với fallbacks
- **Bundling**: Vite với tree shaking
- **CSS**: Tailwind purging unused styles

### Backend

- **Database**: MongoDB indexing
- **Caching**: Redis cho session và queries
- **CDN**: Cloudinary cho images
- **Compression**: Gzip response compression
- **Monitoring**: Performance metrics

---

## 🧪 Testing Strategy

### Frontend Testing

```bash
# Unit Tests
npm run test              # Jest + React Testing Library

# E2E Tests
npm run test:e2e          # Cypress

# Performance
npm run lighthouse        # Lighthouse CI
```

### Backend Testing

```bash
# API Tests
npm run test:api          # Supertest + Jest

# Database Tests
npm run test:db           # MongoDB Memory Server

# Integration Tests
npm run test:integration  # Full stack testing
```

---

## 🚀 Deployment

### Development

```bash
# Backend
npm run dev               # Nodemon server

# Frontend
npm run dev               # Vite dev server

# Full Stack
npm run start:all         # Concurrently run both
```

### Production

```bash
# Build
npm run build             # Production build

# Deploy
npm run deploy            # Deploy to staging/production

# Monitor
npm run monitor           # Health check và logs
```

---

## 📈 Monitoring & Analytics

### Performance Monitoring

- **Frontend**: Web Vitals, Lighthouse scores
- **Backend**: Response times, error rates
- **Database**: Query performance, connection pool
- **Infrastructure**: Server resources, uptime

### Business Analytics

- **User Behavior**: Page views, conversion rates
- **Booking Analytics**: Revenue, popular destinations
- **Search Analytics**: Search terms, filter usage
- **Customer Satisfaction**: Reviews, ratings

---

## 🔮 Roadmap Tương Lai

### Phase 1 (Current)

- ✅ Core booking functionality
- ✅ User authentication
- ✅ Basic search & filter

### Phase 2 (Next 3 months)

- 🔄 Payment integration
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 Multi-language support

### Phase 3 (Next 6 months)

- 🔄 AI-powered recommendations
- 🔄 Loyalty program
- 🔄 Corporate booking tools
- 🔄 API for third parties

---

## 👥 Team & Contributors

### Development Team

- **Backend Developer**: API design, database optimization
- **Frontend Developer**: UI/UX implementation, performance
- **DevOps Engineer**: Deployment, monitoring, security
- **QA Engineer**: Testing automation, quality assurance

### Contact Information

- **Email**: dev@checkinn.vn
- **Slack**: checkinn-dev.slack.com
- **GitHub**: github.com/checkinn/checkinn-ota
- **Documentation**: docs.checkinn.vn

---

## 📚 Additional Resources

### Development Guidelines

- [Coding Standards](./docs/CODING_STANDARDS.md)
- [Git Workflow](./docs/GIT_WORKFLOW.md)
- [API Documentation](./docs/API_DOCS.md)
- [Component Library](./docs/COMPONENT_LIBRARY.md)

### Deployment Guides

- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)
- [Monitoring Setup](./docs/MONITORING_SETUP.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

---

_Last Updated: September 22, 2025_  
_Version: 1.0.0_  
_Status: 8/19 Features Complete (42%)_
