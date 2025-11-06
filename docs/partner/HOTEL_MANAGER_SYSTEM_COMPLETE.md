# 🏨 Hotel Manager System - Implementation Documentation

## 📋 Tổng Quan

Hệ thống quản lý dành cho Hotel Partners (Hotel Managers) trong CheckInn platform, bao gồm đầy đủ các nghiệp vụ từ đăng ký, onboarding, quản lý khách sạn đến theo dõi doanh thu.

---

## 🎯 Nghiệp Vụ Đã Triển Khai

### 1. **Partner Registration & Onboarding**

#### **Multi-Step Registration Flow:**
```
Bước 1: Đăng ký tài khoản cơ bản (name, email, password, businessName)
    ↓
Bước 2: Thông tin doanh nghiệp (businessType, taxId, address)
    ↓
Bước 3: Thông tin tài khoản ngân hàng (bankName, accountNumber, holder)
    ↓
Bước 4: Upload giấy tờ xác minh (business license, tax certificate, ID)
    ↓
Bước 5: Hoàn thành onboarding → Có thể tạo hotel
```

#### **Backend APIs:**
- `POST /api/partner/register` - Đăng ký partner account
- `GET /api/partner/onboarding-status` - Kiểm tra tiến trình onboarding
- `PUT /api/partner/business-info` - Cập nhật thông tin doanh nghiệp
- `PUT /api/partner/bank-account` - Cập nhật tài khoản ngân hàng
- `POST /api/partner/documents` - Upload giấy tờ xác minh
- `POST /api/partner/complete-onboarding` - Hoàn thành onboarding

---

### 2. **Dashboard & Analytics**

#### **Partner Dashboard Metrics:**
```javascript
{
  hotels: {
    total: 5,           // Tổng số khách sạn
    active: 4           // Số khách sạn đang hoạt động
  },
  bookings: {
    pending: 12,        // Booking chờ xác nhận
    todayCheckIns: 3    // Check-in hôm nay
  },
  revenue: {
    today: 5500000,     // Doanh thu hôm nay (VND)
    thisMonth: 85000000 // Doanh thu tháng này
  },
  statistics: {
    totalBookings: 45,  // Tổng booking trong tháng
    avgOccupancyRate: 67.5 // Tỷ lệ lấp đầy trung bình (%)
  }
}
```

#### **Backend API:**
- `GET /api/partner/dashboard` - Dashboard overview data

---

### 3. **Revenue Tracking & Analytics**

#### **Revenue Data Structure:**
```javascript
{
  hotel: ObjectId,           // Hotel reference
  partner: ObjectId,         // Partner reference
  date: Date,                // Ngày cụ thể
  year: 2025,
  month: 11,
  day: 2,
  
  // Revenue breakdown
  totalRevenue: 2500000,     // Tổng doanh thu
  confirmedRevenue: 2000000, // Doanh thu đã xác nhận
  completedRevenue: 500000,  // Doanh thu hoàn thành
  pendingRevenue: 0,
  
  // Booking statistics
  totalBookings: 8,
  confirmedBookings: 6,
  completedBookings: 2,
  cancelledBookings: 0,
  
  // Room statistics
  totalRooms: 20,
  occupiedRooms: 15,
  
  // Calculated metrics
  occupancyRate: 75.0,       // Tỷ lệ lấp đầy (%)
  averageBookingValue: 312500, // Giá trị TB mỗi booking
  cancellationRate: 0        // Tỷ lệ hủy (%)
}
```

#### **Backend APIs:**
- `GET /api/revenue/partner/summary` - Tổng quan doanh thu tất cả hotels
- `GET /api/revenue/hotel/:hotelId` - Doanh thu theo khách sạn (date range)
- `GET /api/revenue/hotel/:hotelId/monthly` - Tổng kết doanh thu theo tháng
- `GET /api/revenue/hotel/:hotelId/occupancy` - Tỷ lệ lấp đầy phòng
- `GET /api/revenue/hotel/:hotelId/trends` - Xu hướng booking (7d/30d/90d/1y)
- `POST /api/revenue/hotel/:hotelId/update` - Cập nhật revenue data (Admin only)

---

### 4. **Transaction Management**

#### **Transaction Schema:**
```javascript
{
  transactionId: 'TXN-ABC123',
  booking: ObjectId,
  hotel: ObjectId,
  user: ObjectId,         // Customer
  partner: ObjectId,      // Hotel owner
  
  type: 'payment',        // payment, refund, commission, payout
  status: 'completed',    // pending, processing, completed, failed
  
  amount: 1000000,        // Tổng tiền
  platformFee: 100000,    // Phí platform (10%)
  partnerAmount: 900000,  // Số tiền partner nhận
  
  paymentMethod: 'vnpay',
  paymentGateway: 'vnpay',
  gatewayTransactionId: 'VNP123456',
  
  // Payout tracking
  payoutStatus: 'pending',
  payoutDate: null,
  payoutMethod: 'bank_transfer'
}
```

#### **Key Features:**
- Tự động tính platform fee (10% default)
- Track refund transactions
- Partner earnings calculation
- Payout management

---

## 🗄️ Database Models

### 1. **Revenue Model** (`Revenue.model.js`)
- Track daily revenue per hotel
- Auto-calculate occupancy rate, avg booking value, cancellation rate
- Aggregate methods for monthly/yearly reports
- Update via `Revenue.updateRevenueForDate(hotelId, date)`

### 2. **Transaction Model** (`Transaction.model.js`)
- Record all payment transactions
- Platform fee calculation
- Refund handling with `createRefund()` method
- Partner earnings tracking

### 3. **User Model Updates** (`User.model.js`)
- Added `partnerInfo` field:
  - Business information (name, type, taxId, address)
  - Bank account details
  - Verification status & documents
  - Onboarding progress tracking

---

## 🔐 Authentication & Authorization

### **Role-Based Access:**
```javascript
// Partner routes - HotelPartner only
router.use(middleware.auth.protect);
router.use(middleware.auth.restrictTo('HotelPartner'));

// Revenue routes - HotelPartner or Admin
router.use(middleware.auth.restrictTo('HotelPartner', 'Admin'));
```

### **Hotel Ownership Verification:**
```javascript
// Check if partner owns the hotel before showing revenue
if (req.user.role === 'HotelPartner' && 
    hotel.owner.toString() !== req.user.id) {
  return next(new AppError('Unauthorized', 403));
}
```

---

## 📊 Analytics Features

### **1. Occupancy Rate Calculation:**
```javascript
occupancyRate = (occupiedRooms / totalRooms) * 100
```

### **2. Booking Trends:**
- Daily bookings count
- Revenue trend (7d/30d/90d/1y)
- Growth rate comparison (first half vs second half of period)

### **3. Financial Metrics:**
- Total revenue
- Average booking value
- Cancellation rate
- Platform fee breakdown
- Partner earnings (gross - platform fee)

---

## 🎨 Frontend Implementation Plan

### **1. Partner Registration Page** (`@partner/pages/PartnerRegisterPage.jsx`)
```jsx
// Multi-step wizard với 5 steps
<PartnerRegistrationWizard>
  <Step1BasicInfo />      // name, email, password
  <Step2BusinessInfo />   // businessType, taxId, address
  <Step3BankAccount />    // bank details
  <Step4Documents />      // upload verification docs
  <Step5Complete />       // success & redirect
</PartnerRegistrationWizard>
```

### **2. Partner Dashboard** (`@partner/pages/DashboardPage.jsx`)
```jsx
<Dashboard>
  {/* KPI Cards */}
  <MetricCard title="Total Hotels" value={5} icon={Building} />
  <MetricCard title="Today's Revenue" value="5.5M VND" icon={DollarSign} />
  <MetricCard title="Pending Bookings" value={12} icon={Calendar} />
  <MetricCard title="Occupancy Rate" value="67.5%" icon={TrendingUp} />
  
  {/* Charts */}
  <RevenueChart data={revenueData} period="30d" />
  <BookingTrendsChart data={bookingsData} />
  
  {/* Quick Actions */}
  <QuickActions>
    <Button>Add Hotel</Button>
    <Button>View Bookings</Button>
    <Button>Financial Reports</Button>
  </QuickActions>
</Dashboard>
```

### **3. Revenue Dashboard** (`@partner/pages/RevenuePage.jsx`)
```jsx
<RevenueDashboard>
  {/* Date Range Picker */}
  <DateRangePicker onChange={handleDateChange} />
  
  {/* Summary Cards */}
  <SummaryGrid>
    <Card label="Total Revenue" value={revenue.total} />
    <Card label="Total Bookings" value={revenue.bookings} />
    <Card label="Avg Booking Value" value={revenue.avgValue} />
    <Card label="Occupancy Rate" value={revenue.occupancy} />
  </SummaryGrid>
  
  {/* Charts */}
  <LineChart data={dailyRevenue} title="Revenue Trend" />
  <BarChart data={bookingsByStatus} title="Bookings by Status" />
  <GaugeChart value={occupancyRate} title="Occupancy Rate" />
  
  {/* Export Button */}
  <Button onClick={exportReport}>Export PDF Report</Button>
</RevenueDashboard>
```

---

## 🔧 Services & Hooks

### **Partner Service** (`@services/partnerService.js`)
```javascript
export const partnerService = {
  // Registration & Onboarding
  register: (data) => api.post('/partner/register', data),
  updateBusinessInfo: (data) => api.put('/partner/business-info', data),
  updateBankAccount: (data) => api.put('/partner/bank-account', data),
  uploadDocuments: (documents) => api.post('/partner/documents', { documents }),
  completeOnboarding: () => api.post('/partner/complete-onboarding'),
  getOnboardingStatus: () => api.get('/partner/onboarding-status'),
  
  // Dashboard
  getDashboard: () => api.get('/partner/dashboard'),
  getMyHotels: () => api.get('/partner/hotels'),
  getEarnings: (params) => api.get('/partner/earnings', { params })
};
```

### **Revenue Service** (`@services/revenueService.js`)
```javascript
export const revenueService = {
  // Partner summary
  getPartnerSummary: (params) => api.get('/revenue/partner/summary', { params }),
  
  // Hotel analytics
  getHotelRevenue: (hotelId, params) => api.get(`/revenue/hotel/${hotelId}`, { params }),
  getMonthlyRevenue: (hotelId, year, month) => 
    api.get(`/revenue/hotel/${hotelId}/monthly`, { params: { year, month } }),
  getOccupancyRate: (hotelId, params) => 
    api.get(`/revenue/hotel/${hotelId}/occupancy`, { params }),
  getBookingTrends: (hotelId, period) => 
    api.get(`/revenue/hotel/${hotelId}/trends`, { params: { period } })
};
```

### **Custom Hooks**
```javascript
// @hooks/usePartner.js
export const usePartner = () => {
  const dashboard = useQuery(['partner-dashboard'], partnerService.getDashboard);
  const hotels = useQuery(['partner-hotels'], partnerService.getMyHotels);
  const onboarding = useQuery(['onboarding-status'], partnerService.getOnboardingStatus);
  
  return { dashboard, hotels, onboarding };
};

// @hooks/useRevenue.js
export const useRevenue = (hotelId, dateRange) => {
  const revenue = useQuery(
    ['hotel-revenue', hotelId, dateRange],
    () => revenueService.getHotelRevenue(hotelId, dateRange)
  );
  
  const occupancy = useQuery(
    ['hotel-occupancy', hotelId, dateRange],
    () => revenueService.getOccupancyRate(hotelId, dateRange)
  );
  
  return { revenue, occupancy };
};
```

---

## 🚀 Next Steps

### **Immediate (Frontend Development):**
1. ✅ Partner Registration multi-step form
2. ✅ Partner Dashboard với KPIs
3. ✅ Revenue Dashboard với charts
4. ✅ Hotel Management pages
5. ✅ Services & Hooks implementation

### **Phase 2 (Hotel Management):**
1. Hotel creation form với image upload
2. Room management (add/edit/delete rooms)
3. Availability calendar
4. Pricing management

### **Phase 3 (Booking Management):**
1. Booking list với filters
2. Booking confirmation workflow
3. Guest management
4. Special requests handling

### **Phase 4 (Advanced Features):**
1. Real-time notifications
2. Automated payouts
3. Financial reports export (PDF/Excel)
4. Revenue forecasting
5. Performance benchmarking

---

## 📝 Testing Checklist

- [ ] Partner registration flow (all 5 steps)
- [ ] Business info validation
- [ ] Bank account validation
- [ ] Document upload
- [ ] Dashboard metrics accuracy
- [ ] Revenue calculations
- [ ] Occupancy rate calculation
- [ ] Booking trends charts
- [ ] Date range filtering
- [ ] Transaction tracking
- [ ] Platform fee calculation
- [ ] Refund handling
- [ ] Hotel ownership verification
- [ ] Role-based access control

---

## 🔗 API Endpoints Summary

### **Partner Routes** (`/api/partner`)
```
POST   /register              - Register as partner
GET    /onboarding-status     - Get onboarding progress
PUT    /business-info         - Update business information
PUT    /bank-account          - Update bank account
POST   /documents             - Upload verification documents
POST   /complete-onboarding   - Complete onboarding
GET    /dashboard             - Dashboard overview
GET    /hotels                - Get partner's hotels
GET    /earnings              - Get earnings summary
```

### **Revenue Routes** (`/api/revenue`)
```
GET    /partner/summary                  - Partner revenue across all hotels
GET    /hotel/:hotelId                   - Hotel revenue (date range)
GET    /hotel/:hotelId/monthly           - Monthly revenue summary
GET    /hotel/:hotelId/occupancy         - Occupancy rate analytics
GET    /hotel/:hotelId/trends            - Booking trends
POST   /hotel/:hotelId/update            - Update revenue data (Admin)
```

---

## 💡 Best Practices Applied

1. **DRY Principle:** Revenue calculation logic centralized trong model methods
2. **KISS:** Simple, clear API structure
3. **Security:** Role-based access, ownership verification
4. **Performance:** Indexed queries, aggregation pipelines
5. **Scalability:** Separate revenue tracking model, async updates
6. **Maintainability:** Clear separation of concerns (models, controllers, routes)

---

**Author:** CheckInn Team  
**Version:** 1.0.0  
**Date:** November 2, 2025
