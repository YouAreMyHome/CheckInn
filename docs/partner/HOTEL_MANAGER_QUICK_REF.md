# 🏨 Hotel Manager System - Quick Reference

## ✅ Đã Hoàn Thành (Backend)

### 📦 Models Created
1. **Revenue.model.js** - Track doanh thu theo ngày/tháng
2. **Transaction.model.js** - Quản lý giao dịch thanh toán  
3. **User.model.js** - Thêm `partnerInfo` fields

### 🛣️ Routes & Controllers
1. **Partner Routes** (`/api/partner/*`)
   - Registration & onboarding flow
   - Dashboard analytics
   - Earnings tracking

2. **Revenue Routes** (`/api/revenue/*`)
   - Hotel revenue reports
   - Occupancy analytics
   - Booking trends
   - Partner summary

### 🔑 Key Features Implemented

#### 1. Multi-Step Partner Registration
```
Step 1: Basic Info → Step 2: Business Info → 
Step 3: Bank Account → Step 4: Documents → Step 5: Complete
```

#### 2. Partner Dashboard
- Total hotels (active/inactive)
- Pending bookings count
- Today's revenue + Monthly revenue
- Average occupancy rate

#### 3. Revenue Analytics
- Daily revenue tracking
- Monthly summaries
- Occupancy rate calculation (%)
- Booking trends (7d/30d/90d/1y)
- Growth rate analysis

#### 4. Transaction Management
- Payment tracking với platform fee (10%)
- Partner earnings calculation
- Refund handling
- Payout status tracking

---

## 🚀 Cần Triển Khai (Frontend)

### 1. Partner Registration Page
**File:** `apps/frontend/src/portals/hotel-manager/pages/PartnerRegisterPage.jsx`

```jsx
// Multi-step wizard với progress indicator
<MultiStepWizard currentStep={step}>
  <Step1BasicInfo onNext={handleStep1} />
  <Step2BusinessInfo onNext={handleStep2} />
  <Step3BankAccount onNext={handleStep3} />
  <Step4Documents onNext={handleStep4} />
  <Step5Complete />
</MultiStepWizard>
```

### 2. Partner Dashboard
**File:** `apps/frontend/src/portals/hotel-manager/pages/DashboardPage.jsx`

```jsx
<Dashboard>
  {/* KPI Cards */}
  <MetricCards data={dashboard} />
  
  {/* Charts */}
  <RevenueChart period="30d" />
  <BookingTrendsChart />
  
  {/* Quick Actions */}
  <QuickActions />
  
  {/* Recent Activities */}
  <RecentActivityList />
</Dashboard>
```

### 3. Revenue Dashboard
**File:** `apps/frontend/src/portals/hotel-manager/pages/RevenuePage.jsx`

```jsx
<RevenuePage>
  <DateRangePicker onChange={setDateRange} />
  
  {/* Summary Cards */}
  <SummaryGrid>
    <Card label="Total Revenue" value={revenue.total} />
    <Card label="Bookings" value={revenue.bookings} />
    <Card label="Occupancy" value={revenue.occupancy} />
  </SummaryGrid>
  
  {/* Charts */}
  <LineChart data={revenueData} />
  <BarChart data={bookingsData} />
  
  {/* Export */}
  <ExportButton format="pdf" />
</RevenuePage>
```

### 4. Services
**File:** `apps/frontend/src/shared/services/partnerService.js`

```javascript
export const partnerService = {
  // Registration
  register: (data) => api.post('/partner/register', data),
  updateBusinessInfo: (data) => api.put('/partner/business-info', data),
  updateBankAccount: (data) => api.put('/partner/bank-account', data),
  uploadDocuments: (docs) => api.post('/partner/documents', { documents: docs }),
  
  // Dashboard
  getDashboard: () => api.get('/partner/dashboard'),
  getEarnings: (params) => api.get('/partner/earnings', { params })
};
```

**File:** `apps/frontend/src/shared/services/revenueService.js`

```javascript
export const revenueService = {
  getPartnerSummary: (params) => api.get('/revenue/partner/summary', { params }),
  getHotelRevenue: (hotelId, params) => api.get(`/revenue/hotel/${hotelId}`, { params }),
  getOccupancyRate: (hotelId, params) => api.get(`/revenue/hotel/${hotelId}/occupancy`, { params }),
  getBookingTrends: (hotelId, period) => api.get(`/revenue/hotel/${hotelId}/trends`, { params: { period } })
};
```

### 5. Custom Hooks
**File:** `apps/frontend/src/shared/hooks/usePartner.js`

```javascript
export const usePartner = () => {
  const { data: dashboard, isLoading } = useQuery(
    ['partner-dashboard'],
    partnerService.getDashboard
  );
  
  const { data: earnings } = useQuery(
    ['partner-earnings'],
    partnerService.getEarnings
  );
  
  return { dashboard, earnings, isLoading };
};
```

**File:** `apps/frontend/src/shared/hooks/useRevenue.js`

```javascript
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

## 📋 API Endpoints Summary

### Partner Routes
```
POST   /api/partner/register              ✅
GET    /api/partner/onboarding-status     ✅
PUT    /api/partner/business-info         ✅
PUT    /api/partner/bank-account          ✅
POST   /api/partner/documents             ✅
POST   /api/partner/complete-onboarding   ✅
GET    /api/partner/dashboard             ✅
GET    /api/partner/hotels                ✅
GET    /api/partner/earnings              ✅
```

### Revenue Routes
```
GET    /api/revenue/partner/summary              ✅
GET    /api/revenue/hotel/:hotelId               ✅
GET    /api/revenue/hotel/:hotelId/monthly       ✅
GET    /api/revenue/hotel/:hotelId/occupancy     ✅
GET    /api/revenue/hotel/:hotelId/trends        ✅
POST   /api/revenue/hotel/:hotelId/update        ✅
```

---

## 🎯 Next Steps

### Phase 1: Registration & Onboarding (Frontend)
1. Create `PartnerRegisterPage.jsx` với multi-step wizard
2. Create onboarding flow components
3. Integrate với backend APIs
4. Add form validation & error handling

### Phase 2: Dashboard (Frontend)
1. Update `DashboardPage.jsx` với real data
2. Add charts (recharts/chart.js)
3. Create metric cards components
4. Add quick actions

### Phase 3: Revenue Dashboard (Frontend)
1. Create `RevenuePage.jsx`
2. Implement date range picker
3. Add revenue charts (line, bar, gauge)
4. Add export functionality

### Phase 4: Testing
1. Test registration flow end-to-end
2. Test dashboard data accuracy
3. Test revenue calculations
4. Performance optimization

---

## 🔥 Important Notes

### Security
- All partner routes require JWT authentication
- Hotel ownership verification before showing revenue
- Role-based access control (HotelPartner/Admin)

### Performance
- Revenue data indexed by hotel, partner, date
- Aggregation pipelines for analytics
- Caching với TanStack Query on frontend

### Data Integrity
- Transaction schema tracks platform fee automatically
- Revenue model auto-calculates occupancy rate
- Pre-save hooks ensure data consistency

---

## 📚 Documentation Files

1. `HOTEL_MANAGER_SYSTEM_COMPLETE.md` - Full system documentation
2. `HOTEL_MANAGER_API_SPEC.md` - Complete API specification
3. `HOTEL_MANAGER_QUICK_REF.md` (this file) - Quick reference

---

**Status:** Backend Complete ✅ | Frontend In Progress 🚧

**Next Task:** Implement Partner Registration frontend flow

**Author:** CheckInn Team  
**Date:** November 2, 2025
