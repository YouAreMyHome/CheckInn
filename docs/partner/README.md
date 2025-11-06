# 🏨 Hotel Manager / Partner Portal Documentation

Tài liệu hệ thống quản lý cho Hotel Partners (Hotel Managers) trong CheckInn platform.

---

## 📚 Documents Overview

### 1. **HOTEL_MANAGER_SYSTEM_COMPLETE.md**
Tài liệu đầy đủ về hệ thống Hotel Manager:
- Nghiệp vụ chi tiết (Registration, Dashboard, Revenue tracking)
- Database models (Revenue, Transaction, User)
- Backend APIs specification
- Frontend implementation plan
- Services & Hooks architecture
- Testing checklist

**Đọc khi:** Cần hiểu toàn bộ hệ thống từ A-Z

---

### 2. **HOTEL_MANAGER_API_SPEC.md**
API specification đầy đủ với examples:
- Tất cả endpoints với request/response format
- Authentication & Authorization
- Query parameters
- Error responses
- Authorization matrix

**Đọc khi:** Cần integrate với backend APIs hoặc test APIs

---

### 3. **HOTEL_MANAGER_QUICK_REF.md**
Quick reference ngắn gọn:
- Checklist các features đã implement
- Code snippets cho frontend
- API endpoints summary
- Next steps

**Đọc khi:** Cần overview nhanh hoặc lookup thông tin

---

## 🎯 Hệ Thống Đã Triển Khai

### ✅ Backend Complete

#### Models:
- ✅ `Revenue.model.js` - Daily/monthly revenue tracking
- ✅ `Transaction.model.js` - Payment transactions & platform fees
- ✅ `User.model.js` - Partner business info

#### Routes & Controllers:
- ✅ Partner registration & onboarding (multi-step)
- ✅ Partner dashboard analytics
- ✅ Revenue tracking & analytics
- ✅ Occupancy rate calculation
- ✅ Booking trends analysis

#### APIs Available:
```
POST   /api/partner/register
GET    /api/partner/dashboard
GET    /api/partner/earnings
GET    /api/revenue/partner/summary
GET    /api/revenue/hotel/:id
GET    /api/revenue/hotel/:id/occupancy
GET    /api/revenue/hotel/:id/trends
```

---

### 🚧 Frontend In Progress

#### Cần Implement:
1. **PartnerRegisterPage.jsx** - Multi-step registration wizard
2. **DashboardPage.jsx** - KPIs & charts
3. **RevenuePage.jsx** - Revenue dashboard với analytics
4. **partnerService.js** - API integration
5. **revenueService.js** - Revenue APIs
6. **usePartner.js** - Custom hook
7. **useRevenue.js** - Revenue hook

---

## 🚀 Quick Start Guide

### Cho Backend Developers:

1. **Kiểm tra models:**
   ```bash
   # Navigate to models directory
   cd apps/api-server/src/models
   
   # Check: Revenue.model.js, Transaction.model.js, User.model.js
   ```

2. **Test APIs:**
   ```bash
   # Start server
   npm run dev
   
   # Test partner registration
   POST http://localhost:5000/api/partner/register
   
   # Test dashboard (need JWT token)
   GET http://localhost:5000/api/partner/dashboard
   ```

3. **Đọc docs:**
   - `HOTEL_MANAGER_API_SPEC.md` - Xem API details
   - `HOTEL_MANAGER_SYSTEM_COMPLETE.md` - Hiểu business logic

---

### Cho Frontend Developers:

1. **Xem API specification:**
   ```bash
   # Đọc file này để hiểu APIs
   docs/partner/HOTEL_MANAGER_API_SPEC.md
   ```

2. **Implement services:**
   ```bash
   # Create services
   apps/frontend/src/shared/services/partnerService.js
   apps/frontend/src/shared/services/revenueService.js
   ```

3. **Create pages:**
   ```bash
   # Partner portal pages
   apps/frontend/src/portals/hotel-manager/pages/PartnerRegisterPage.jsx
   apps/frontend/src/portals/hotel-manager/pages/RevenuePage.jsx
   ```

4. **Custom hooks:**
   ```bash
   # Create hooks
   apps/frontend/src/shared/hooks/usePartner.js
   apps/frontend/src/shared/hooks/useRevenue.js
   ```

5. **Tham khảo:**
   - `HOTEL_MANAGER_QUICK_REF.md` - Code examples
   - `HOTEL_MANAGER_SYSTEM_COMPLETE.md` - Frontend implementation plan

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────┐
│           Hotel Manager Portal                   │
│         (Frontend - React + Vite)                │
└───────────────┬─────────────────────────────────┘
                │ API Calls (JWT Auth)
                ↓
┌─────────────────────────────────────────────────┐
│         API Server (Express + Node.js)           │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Partner Routes (/api/partner/*)          │   │
│  │  - Registration & Onboarding             │   │
│  │  - Dashboard                             │   │
│  │  - Earnings                              │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Revenue Routes (/api/revenue/*)          │   │
│  │  - Hotel revenue tracking                │   │
│  │  - Occupancy analytics                   │   │
│  │  - Booking trends                        │   │
│  └──────────────────────────────────────────┘   │
└───────────────┬─────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│            MongoDB Database                      │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ User (Partner) │  │ Hotel          │         │
│  │  - partnerInfo │  │  - owner       │         │
│  │  - bankAccount │  │  - stats       │         │
│  └────────────────┘  └────────────────┘         │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ Revenue        │  │ Transaction    │         │
│  │  - daily       │  │  - payments    │         │
│  │  - occupancy   │  │  - platform fee│         │
│  └────────────────┘  └────────────────┘         │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐         │
│  │ Booking        │  │ Room           │         │
│  │  - status      │  │  - availability│         │
│  │  - payment     │  │  - pricing     │         │
│  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Key Features

### 1. Multi-Step Registration
Partner đăng ký qua 5 bước:
1. Basic info (name, email, password)
2. Business info (company name, tax ID, address)
3. Bank account (for payouts)
4. Document upload (business license, tax certificate)
5. Verification & approval

### 2. Dashboard Analytics
- Real-time KPIs (hotels, bookings, revenue)
- Today's revenue vs monthly revenue
- Pending bookings count
- Average occupancy rate

### 3. Revenue Tracking
- Daily revenue aggregation
- Monthly summaries
- Occupancy rate calculation
- Booking trends (7d/30d/90d/1y)
- Growth rate analysis

### 4. Transaction Management
- Automatic platform fee calculation (10%)
- Partner earnings tracking
- Refund handling
- Payout management

---

## 🔐 Security

### Authentication:
- JWT token required for all protected routes
- Refresh token mechanism
- Token expiry handling

### Authorization:
- Role-based access (HotelPartner, Admin)
- Hotel ownership verification
- Partner can only access own data

### Data Protection:
- Password hashing (bcrypt)
- Input validation (Joi)
- Sanitization
- Rate limiting

---

## 📈 Performance Optimizations

### Backend:
- MongoDB indexes on frequently queried fields
- Aggregation pipelines for analytics
- Efficient date range queries
- Pre-save hooks for calculations

### Frontend (Planned):
- TanStack Query for caching
- Lazy loading components
- Debounced search inputs
- Optimized re-renders

---

## 🧪 Testing

### Backend Tests Needed:
- [ ] Partner registration flow
- [ ] Business info validation
- [ ] Revenue calculation accuracy
- [ ] Occupancy rate formula
- [ ] Transaction fee calculation
- [ ] Hotel ownership checks

### Frontend Tests Needed:
- [ ] Multi-step form navigation
- [ ] Form validation
- [ ] API error handling
- [ ] Chart rendering
- [ ] Date range picker

---

## 🐛 Known Issues & TODOs

### Backend:
- [ ] Implement automated revenue updates (cron job)
- [ ] Add email notifications for document approval
- [ ] Implement payout automation
- [ ] Add revenue forecasting

### Frontend:
- [ ] Create all pages & components
- [ ] Integrate with backend APIs
- [ ] Add loading states
- [ ] Error boundaries
- [ ] Responsive design

---

## 📞 Support & Contact

Nếu có câu hỏi về hệ thống Hotel Manager:

1. Đọc docs đầy đủ: `HOTEL_MANAGER_SYSTEM_COMPLETE.md`
2. Check API spec: `HOTEL_MANAGER_API_SPEC.md`
3. Quick reference: `HOTEL_MANAGER_QUICK_REF.md`
4. Contact team: CheckInn Development Team

---

## 🔄 Version History

### v1.0.0 (November 2, 2025)
- ✅ Initial backend implementation
- ✅ Partner registration & onboarding APIs
- ✅ Revenue tracking system
- ✅ Transaction management
- ✅ Dashboard analytics APIs
- 🚧 Frontend implementation in progress

---

**Status:** Backend Complete | Frontend In Progress

**Last Updated:** November 2, 2025

**Maintainer:** CheckInn Team
