# 🔌 Backend Integration Requirements

## 📋 Tổng quan Integration Status

### ✅ Đã tích hợp sẵn (Ready to use)

#### 1. Authentication APIs

- ✅ `POST /auth/login` - Đăng nhập
- ✅ `POST /auth/register` - Đăng ký
- ✅ `GET /auth/profile` - Lấy thông tin user hiện tại
- ✅ `PUT /auth/profile` - Cập nhật profile
- ✅ `POST /auth/change-password` - Đổi mật khẩu
- ✅ `POST /auth/logout` - Đăng xuất

#### 2. Hotel Management APIs

- ✅ `GET /hotels` - Lấy danh sách hotels với filter/pagination
- ✅ `GET /hotels/:id` - Lấy chi tiết hotel
- ✅ `POST /hotels` - Tạo hotel mới (partner/admin)
- ✅ `PUT /hotels/:id` - Cập nhật hotel
- ✅ `DELETE /hotels/:id` - Xóa hotel (admin)
- ✅ `GET /search` - Tìm kiếm hotels

#### 3. Room Management APIs

- ✅ `GET /rooms` - Lấy danh sách rooms với filter
- ✅ `GET /rooms/:id` - Lấy chi tiết room
- ✅ `POST /rooms` - Tạo room mới
- ✅ `PUT /rooms/:id` - Cập nhật room
- ✅ `DELETE /rooms/:id` - Xóa room

#### 4. Booking APIs

- ✅ `POST /bookings` - Tạo booking mới
- ✅ `GET /bookings/my-bookings` - Lấy bookings của user hiện tại
- ✅ `GET /bookings/:id` - Lấy chi tiết booking
- ✅ `PATCH /bookings/:id/cancel` - Hủy booking

---

## ❌ Cần bổ sung Backend APIs

### 1. User Management (Admin Features)

#### Cần thiết bổ sung:

```javascript
// Get all users (admin only)
GET /auth/users
Query params: ?role=customer&status=active&page=1&limit=10&search=email

// Get user by ID (admin only)
GET /auth/users/:userId

// Update user status (admin only)
PATCH /auth/users/:userId/status
Body: { status: 'active' | 'inactive' | 'blocked' }

// Delete user (admin only)
DELETE /auth/users/:userId

// Get user's booking history (admin only)
GET /auth/users/:userId/bookings

// Get user's reviews (admin only)
GET /auth/users/:userId/reviews

// Upload user avatar
POST /auth/upload-avatar
Body: FormData with file
```

### 2. Room Availability & Pricing

#### Cần thiết bổ sung:

```javascript
// Search available rooms
GET /rooms/search
Query: ?hotelId=xxx&checkIn=2024-01-15&checkOut=2024-01-17&guests=2

// Get room availability for dates
GET /rooms/:roomId/availability
Query: ?checkIn=2024-01-15&checkOut=2024-01-17

// Get room pricing for dates
GET /rooms/:roomId/pricing
Query: ?checkIn=2024-01-15&checkOut=2024-01-17&guests=2

// Update room status
PATCH /rooms/:roomId/status
Body: { status: 'Available' | 'Occupied' | 'Maintenance' | 'OutOfOrder' | 'Cleaning' }

// Upload room images
POST /rooms/:roomId/images
Body: FormData with multiple files

// Delete room image
DELETE /rooms/:roomId/images/:imageId
```

### 3. Booking Management (Admin Features)

#### Cần thiết bổ sung:

```javascript
// Get all bookings (admin only)
GET /bookings
Query: ?status=confirmed&hotel=xxx&user=xxx&page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31

// Check room availability
GET /bookings/availability
Query: ?hotelId=xxx&roomId=xxx&checkIn=2024-01-15&checkOut=2024-01-17&guests=2

// Get booking pricing
POST /bookings/pricing
Body: { hotel, room, checkIn, checkOut, guests }

// Update booking status (admin only)
PATCH /bookings/:bookingId/status
Body: { status: 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'NoShow' }
```

### 4. Admin Dashboard APIs

#### Cần thiết bổ sung:

```javascript
// Dashboard statistics
GET /admin/dashboard-stats
Response: {
  totalUsers: number,
  totalHotels: number,
  totalBookings: number,
  totalRevenue: number,
  newUsersToday: number,
  newBookingsToday: number,
  revenueToday: number
}

// Revenue analytics
GET /admin/revenue-analytics
Query: ?period=7d|30d|90d|1y
Response: {
  totalRevenue: number,
  data: [{ date: string, revenue: number }],
  growth: number
}

// System health check
GET /admin/system-health
Response: {
  database: 'healthy' | 'warning' | 'error',
  server: 'healthy' | 'warning' | 'error',
  storage: 'healthy' | 'warning' | 'error',
  uptime: number
}

// Activity logs
GET /admin/activity-logs
Query: ?page=1&limit=20&userId=xxx&action=login|create|update|delete&startDate=xxx&endDate=xxx

// System settings
GET /admin/system-settings
PUT /admin/system-settings
Body: { siteName: string, maintenanceMode: boolean, allowRegistration: boolean }

// Performance metrics
GET /admin/performance-metrics
Query: ?period=24h|7d|30d
Response: {
  avgResponseTime: number,
  errorRate: number,
  throughput: number,
  data: [{ timestamp: string, responseTime: number, errors: number }]
}

// Reports
GET /admin/reports
Query: ?type=users|bookings|revenue&startDate=xxx&endDate=xxx&format=json|csv|pdf

// Export report
POST /admin/reports/export
Body: { type: string, format: string, dateRange: { startDate: string, endDate: string } }
```

### 5. Hotel Approval System

#### Cần thiết bổ sung:

```javascript
// Approve hotel (admin only)
PATCH /hotels/:hotelId/approve
Body: { notes?: string }

// Reject hotel (admin only)
PATCH /hotels/:hotelId/reject
Body: { reason: string }

// Get pending hotels (admin only)
GET /hotels/pending

// Get hotel approval history (admin only)
GET /hotels/:hotelId/approval-history
```

### 6. File Upload APIs

#### Cần thiết bổ sung:

```javascript
// Upload hotel images
POST /hotels/:hotelId/images
Body: FormData with multiple files

// Delete hotel image
DELETE /hotels/:hotelId/images/:imageId

// Upload room images
POST /rooms/:roomId/images
Body: FormData with multiple files

// Delete room image
DELETE /rooms/:roomId/images/:imageId

// Upload user avatar
POST /auth/upload-avatar
Body: FormData with file
```

---

## 🔧 Implementation Priority

### Phase 1: Critical Admin Features (Tuần 1)

1. ✅ User Management APIs
2. ✅ Admin Dashboard Stats
3. ✅ Hotel Approval System
4. ✅ Booking Management (Admin)

### Phase 2: Enhanced Features (Tuần 2)

1. ✅ Room Availability & Pricing
2. ✅ Advanced Search & Filtering
3. ✅ File Upload System
4. ✅ Activity Logs

### Phase 3: Analytics & Reports (Tuần 3)

1. ✅ Revenue Analytics
2. ✅ Performance Metrics
3. ✅ Reports & Export
4. ✅ System Monitoring

---

## 📊 Database Schema Requirements

### User Schema Updates

```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: ['customer', 'partner', 'admin'],
  status: ['active', 'inactive', 'blocked', 'pending'],
  avatar: String,
  phone: String,
  dateOfBirth: Date,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### Hotel Schema Updates

```javascript
{
  name: String,
  description: String,
  location: {
    address: String,
    city: String,
    country: String,
    coordinates: [Number]
  },
  amenities: [String],
  images: [String],
  rating: Number,
  status: ['Pending', 'Active', 'Inactive', 'Rejected'],
  partner: ObjectId,
  approvedBy: ObjectId,
  approvedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Room Schema Updates

```javascript
{
  name: String,
  type: String,
  capacity: Number,
  area: Number,
  basePrice: Number,
  hotel: ObjectId,
  amenities: [String],
  images: [String],
  bedConfiguration: [{
    type: String,
    count: Number
  }],
  status: ['Available', 'Occupied', 'Maintenance', 'OutOfOrder', 'Cleaning'],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema Updates

```javascript
{
  user: ObjectId,
  hotel: ObjectId,
  room: ObjectId,
  checkIn: Date,
  checkOut: Date,
  guests: [{
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    isMainGuest: Boolean
  }],
  status: ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow'],
  pricing: {
    baseAmount: Number,
    taxes: Number,
    serviceCharges: Number,
    totalAmount: Number
  },
  cancellationReason: String,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Service Integration Guide

### Frontend Service Usage

```javascript
// Import services
import {
  userService,
  hotelService,
  bookingService,
  roomService,
  adminService,
} from "../services";

// Use with React Query hooks
const { data: users } = useUsers({ role: "customer", status: "active" });
const { data: hotels } = useHotels({ status: "Active", city: "Ho Chi Minh" });
const { data: bookings } = useMyBookings({ status: "confirmed" });

// Mutations
const createHotel = useCreateHotel();
const updateUser = useUpdateUser();
const cancelBooking = useCancelBooking();
```

### Error Handling

```javascript
// All services include comprehensive error handling
try {
  const result = await hotelService.createHotel(hotelData);
  message.success("Tạo khách sạn thành công");
} catch (error) {
  message.error(`Lỗi: ${error.message}`);
}
```

---

## ✅ Testing & Validation

### Integration Demo Component

- 📍 Route: `/integration-demo`
- 🧪 Tests all service integrations
- 📊 Shows real-time API data
- 🔍 Debug API responses
- ⚡ Test CRUD operations

### Usage:

```bash
# Access demo page
http://localhost:3002/integration-demo

# Test various API endpoints
# View real-time data loading
# Monitor API response times
# Check error handling
```

---

## 🔒 Security Considerations

### Authentication

- ✅ JWT token-based auth implemented
- ✅ Role-based access control
- ✅ Request interceptors with token refresh
- ❌ Need: Rate limiting APIs
- ❌ Need: Input validation middleware

### Authorization

- ✅ Admin-only endpoints protected
- ✅ User ownership validation
- ❌ Need: Resource-level permissions
- ❌ Need: Audit logging

---

## 📈 Performance Optimizations

### Caching Strategy

- ✅ React Query with smart caching
- ✅ Stale-while-revalidate pattern
- ❌ Need: Server-side caching (Redis)
- ❌ Need: CDN for static assets

### Pagination & Filtering

- ✅ Frontend pagination implemented
- ✅ Search/filter parameters ready
- ❌ Need: Backend pagination
- ❌ Need: Database indexing

---

## 🎯 Next Steps

1. **Backend Implementation**: Implement missing APIs theo priority order
2. **Database Setup**: Update schemas với required fields
3. **Testing**: Test integration với Integration Demo component
4. **Deployment**: Setup production environment
5. **Monitoring**: Implement logging và monitoring

---

_📅 Last Updated: January 2024_
_🔄 Status: Backend Integration In Progress_
