# 🎯 Backend API Requirements - CheckInn Admin System

## 📋 Mục Đích

Tài liệu này mô tả chi tiết các API endpoints cần phát triển để hỗ trợ đầy đủ chức năng Admin Dashboard của CheckInn system.

---

## 🔐 Admin Authentication & Authorization

### Required Role-based Access Control

```javascript
// User roles hierarchy
const ROLES = {
  ADMIN: "Admin", // Full system access
  PARTNER: "HotelPartner", // Hotel management only
  CUSTOMER: "Customer", // Booking & profile only
};

// Middleware để check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
};
```

---

## 📊 1. Admin Dashboard APIs

### 1.1 Dashboard Statistics

**GET** `/admin/dashboard/stats`

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalRevenue": 2850000000,
    "monthlyRevenue": 890000000,
    "dailyRevenue": 32000000,
    "totalHotels": 1247,
    "totalUsers": 45623,
    "todayBookings": 342,
    "occupancyRate": 72.5,
    "averageRating": 4.3,

    // Trend data (percentage change from previous period)
    "revenueTrend": 15.2, // +15.2% from last month
    "hotelsTrend": 8, // +8 new hotels
    "usersTrend": 156, // +156 new users
    "bookingsTrend": 12.3, // +12.3% from yesterday

    // Additional metrics
    "topPerformingCity": "Ho Chi Minh",
    "averageBookingValue": 850000,
    "returnCustomerRate": 68.5
  }
}
```

### 1.2 Revenue Analytics

**GET** `/admin/analytics/revenue`

**Query Parameters:**

- `period`: string (required) - "7d", "30d", "90d", "1y"
- `groupBy`: string (optional) - "day", "week", "month" (default: auto based on period)

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Revenue analytics retrieved successfully",
  "data": {
    "totalRevenue": 2850000000,
    "periodRevenue": 890000000,
    "averageDailyRevenue": 32000000,
    "peakRevenueDay": "2025-09-20",
    "lowestRevenueDay": "2025-09-15",

    "dailyRevenue": [
      {
        "date": "2025-09-18",
        "revenue": 28500000,
        "bookings": 342,
        "averageBookingValue": 833333
      },
      {
        "date": "2025-09-19",
        "revenue": 31200000,
        "bookings": 378,
        "averageBookingValue": 825396
      }
      // ... more daily data
    ],

    "revenueByCity": [
      {
        "city": "Ho Chi Minh",
        "revenue": 1200000000,
        "percentage": 42.1
      },
      {
        "city": "Ha Noi",
        "revenue": 850000000,
        "percentage": 29.8
      }
      // ... more cities
    ],

    "revenueByHotelCategory": [
      {
        "category": "5-star",
        "revenue": 1500000000,
        "percentage": 52.6
      },
      {
        "category": "4-star",
        "revenue": 950000000,
        "percentage": 33.3
      }
      // ... more categories
    ]
  }
}
```

### 1.3 System Health Monitoring

**GET** `/admin/system/health`

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "System health status retrieved successfully",
  "data": {
    "overall": "healthy", // healthy, warning, error
    "timestamp": "2025-09-24T10:30:00.000Z",

    "database": {
      "status": "healthy",
      "responseTime": 45, // milliseconds
      "connections": {
        "active": 12,
        "idle": 8,
        "total": 20
      },
      "slowQueries": 2
    },

    "api": {
      "status": "healthy",
      "uptime": 99.8, // percentage
      "requestsPerMinute": 1250,
      "averageResponseTime": 120, // milliseconds
      "errorRate": 0.02 // percentage
    },

    "memory": {
      "status": "warning",
      "usage": 78, // percentage
      "total": "8GB",
      "available": "1.76GB"
    },

    "cpu": {
      "status": "healthy",
      "usage": 45, // percentage
      "cores": 4,
      "loadAverage": [1.2, 1.5, 1.8]
    },

    "storage": {
      "status": "healthy",
      "usage": 65, // percentage
      "total": "500GB",
      "available": "175GB"
    },

    "network": {
      "status": "healthy",
      "latency": 25, // milliseconds
      "throughput": "850Mbps"
    },

    "services": {
      "redis": "healthy",
      "elasticsearch": "healthy",
      "cloudinary": "healthy",
      "email": "healthy"
    }
  }
}
```

---

## 👥 2. User Management APIs

### 2.1 Get All Users (Admin)

**GET** `/admin/users`

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `role`: string (optional) - filter by role
- `status`: string (optional) - "active", "inactive", "banned"
- `search`: string (optional) - search by name, email, phone
- `sortBy`: string (default: "createdAt") - "name", "email", "createdAt", "lastLogin"
- `sortOrder`: string (default: "desc") - "asc", "desc"
- `dateFrom`: string (optional) - registration date filter
- `dateTo`: string (optional) - registration date filter

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "user_id_1",
        "name": "Nguyen Van A",
        "email": "nguyenvana@example.com",
        "phone": "0123456789",
        "role": "Customer",
        "status": "active",
        "isEmailVerified": true,
        "avatar": "https://cloudinary.com/avatar1.jpg",
        "lastLogin": "2025-09-24T08:30:00.000Z",
        "createdAt": "2025-09-01T10:00:00.000Z",
        "totalBookings": 5,
        "totalSpent": 4500000,
        "loyaltyLevel": "Gold"
      }
      // ... more users
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalUsers": 500,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalActive": 450,
      "totalInactive": 35,
      "totalBanned": 15,
      "newThisMonth": 78
    }
  }
}
```

### 2.2 Update User Status

**PATCH** `/admin/users/:userId/status`

**Request Body:**

```json
{
  "status": "active", // active, inactive, banned
  "reason": "Spam behavior detected" // required for ban action
}
```

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "userId": "user_id_1",
    "newStatus": "banned",
    "previousStatus": "active",
    "updatedBy": "admin_id",
    "updatedAt": "2025-09-24T10:30:00.000Z"
  }
}
```

### 2.3 Delete User (Admin)

**DELETE** `/admin/users/:userId`

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedUserId": "user_id_1",
    "deletedBy": "admin_id",
    "deletedAt": "2025-09-24T10:30:00.000Z"
  }
}
```

---

## 🏨 3. Hotel Management APIs

### 3.1 Get All Hotels (Admin)

**GET** `/admin/hotels`

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: string (optional) - "pending", "approved", "rejected", "suspended"
- `city`: string (optional) - filter by city
- `starRating`: number (optional) - filter by star rating
- `partnerId`: string (optional) - filter by partner
- `search`: string (optional) - search by name, address
- `sortBy`: string (default: "createdAt")
- `sortOrder`: string (default: "desc")

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": {
    "hotels": [
      {
        "_id": "hotel_id_1",
        "name": "Luxury Hotel Saigon",
        "partnerId": "partner_id_1",
        "partnerName": "Hotel Partner Co.",
        "status": "pending", // pending, approved, rejected, suspended
        "approvalStatus": {
          "status": "pending",
          "submittedAt": "2025-09-20T10:00:00.000Z",
          "reviewedBy": null,
          "reviewedAt": null,
          "rejectionReason": null
        },
        "location": {
          "address": "123 Nguyen Hue, District 1",
          "city": "Ho Chi Minh",
          "coordinates": [106.6297, 10.8231]
        },
        "starRating": 5,
        "averageRating": 4.5,
        "totalReviews": 150,
        "totalBookings": 1250,
        "monthlyRevenue": 450000000,
        "createdAt": "2025-09-20T10:00:00.000Z",
        "lastUpdated": "2025-09-22T14:30:00.000Z"
      }
      // ... more hotels
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalHotels": 300,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalPending": 25,
      "totalApproved": 245,
      "totalRejected": 18,
      "totalSuspended": 12
    }
  }
}
```

### 3.2 Approve Hotel

**PATCH** `/admin/hotels/:hotelId/approve`

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Hotel approved successfully",
  "data": {
    "hotelId": "hotel_id_1",
    "status": "approved",
    "approvedBy": "admin_id",
    "approvedAt": "2025-09-24T10:30:00.000Z",
    "notificationSent": true
  }
}
```

### 3.3 Reject Hotel

**PATCH** `/admin/hotels/:hotelId/reject`

**Request Body:**

```json
{
  "reason": "Incomplete documentation. Missing business license and safety certificates."
}
```

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Hotel rejected successfully",
  "data": {
    "hotelId": "hotel_id_1",
    "status": "rejected",
    "rejectedBy": "admin_id",
    "rejectedAt": "2025-09-24T10:30:00.000Z",
    "rejectionReason": "Incomplete documentation. Missing business license and safety certificates.",
    "notificationSent": true
  }
}
```

---

## 🎫 4. Booking Management APIs

### 4.1 Get All Bookings (Admin)

**GET** `/admin/bookings`

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: string (optional) - "pending", "confirmed", "cancelled", "completed", "no-show"
- `hotelId`: string (optional) - filter by hotel
- `userId`: string (optional) - filter by user
- `dateFrom`: string (optional) - booking date filter
- `dateTo`: string (optional) - booking date filter
- `checkInFrom`: string (optional) - check-in date filter
- `checkInTo`: string (optional) - check-in date filter
- `search`: string (optional) - search by booking code, user name, hotel name
- `sortBy`: string (default: "createdAt")
- `sortOrder`: string (default: "desc")

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "_id": "booking_id_1",
        "bookingCode": "CHK24092400001",
        "userId": "user_id_1",
        "userName": "Nguyen Van A",
        "userEmail": "nguyenvana@example.com",
        "hotelId": "hotel_id_1",
        "hotelName": "Luxury Hotel Saigon",
        "roomId": "room_id_1",
        "roomName": "Deluxe Room",
        "status": "confirmed",
        "checkIn": "2025-09-25T14:00:00.000Z",
        "checkOut": "2025-09-27T12:00:00.000Z",
        "guests": [
          {
            "name": "Nguyen Van A",
            "age": 30,
            "idType": "passport",
            "idNumber": "B1234567"
          }
        ],
        "totalAmount": 1500000,
        "paidAmount": 1500000,
        "paymentStatus": "paid",
        "paymentMethod": "credit_card",
        "createdAt": "2025-09-20T10:00:00.000Z",
        "lastUpdated": "2025-09-20T10:05:00.000Z"
      }
      // ... more bookings
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalBookings": 1000,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalPending": 50,
      "totalConfirmed": 780,
      "totalCancelled": 120,
      "totalCompleted": 45,
      "totalNoShow": 5,
      "totalRevenue": 850000000
    }
  }
}
```

### 4.2 Update Booking Status

**PATCH** `/admin/bookings/:bookingId/status`

**Request Body:**

```json
{
  "status": "confirmed", // pending, confirmed, cancelled, completed, no-show
  "reason": "Customer request" // optional, required for cancellation
}
```

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "bookingId": "booking_id_1",
    "newStatus": "confirmed",
    "previousStatus": "pending",
    "updatedBy": "admin_id",
    "updatedAt": "2025-09-24T10:30:00.000Z",
    "notificationSent": true
  }
}
```

---

## 📊 5. Reports & Analytics APIs

### 5.1 Get Reports

**GET** `/admin/reports/:type`

**Path Parameters:**

- `type`: string - "revenue", "bookings", "users", "hotels", "performance"

**Query Parameters:**

- `startDate`: string (required) - ISO date string
- `endDate`: string (required) - ISO date string
- `groupBy`: string (optional) - "day", "week", "month"
- `city`: string (optional) - filter by city
- `hotelId`: string (optional) - filter by hotel

**Authorization:** Admin role required

**Response for Revenue Report:**

```json
{
  "success": true,
  "message": "Revenue report generated successfully",
  "data": {
    "reportType": "revenue",
    "period": {
      "startDate": "2025-09-01T00:00:00.000Z",
      "endDate": "2025-09-24T23:59:59.000Z"
    },
    "summary": {
      "totalRevenue": 2850000000,
      "totalBookings": 12450,
      "averageBookingValue": 229000,
      "topPerformingDay": "2025-09-15",
      "lowestPerformingDay": "2025-09-08"
    },
    "dailyData": [
      {
        "date": "2025-09-01",
        "revenue": 45000000,
        "bookings": 180,
        "averageValue": 250000
      }
      // ... more daily data
    ],
    "topHotels": [
      {
        "hotelId": "hotel_id_1",
        "hotelName": "Luxury Hotel Saigon",
        "revenue": 350000000,
        "bookings": 1250,
        "percentage": 12.3
      }
      // ... more hotels
    ],
    "cityBreakdown": [
      {
        "city": "Ho Chi Minh",
        "revenue": 1200000000,
        "percentage": 42.1
      }
      // ... more cities
    ]
  }
}
```

### 5.2 Export Report

**GET** `/admin/reports/:type/export`

**Query Parameters:**

- `format`: string (required) - "csv", "xlsx", "pdf"
- `startDate`: string (required)
- `endDate`: string (required)
- Same filters as get reports

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Report export initiated successfully",
  "data": {
    "exportId": "export_id_1",
    "format": "xlsx",
    "status": "processing", // processing, completed, failed
    "downloadUrl": null, // will be populated when completed
    "expiresAt": "2025-09-25T10:30:00.000Z",
    "estimatedCompletion": "2025-09-24T10:32:00.000Z"
  }
}
```

### 5.3 Performance Metrics

**GET** `/admin/metrics/performance`

**Query Parameters:**

- `period`: string (default: "24h") - "1h", "24h", "7d", "30d"

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "period": "24h",
    "timestamp": "2025-09-24T10:30:00.000Z",

    "apiMetrics": {
      "totalRequests": 125000,
      "successRate": 99.2,
      "averageResponseTime": 145, // milliseconds
      "p95ResponseTime": 350,
      "p99ResponseTime": 850,
      "errorRate": 0.8,
      "slowestEndpoints": [
        {
          "endpoint": "/api/hotels/search",
          "averageResponseTime": 450,
          "requestCount": 15000
        }
      ]
    },

    "databaseMetrics": {
      "queryCount": 450000,
      "averageQueryTime": 25, // milliseconds
      "slowQueries": 45,
      "connectionPool": {
        "active": 12,
        "idle": 8,
        "waiting": 0
      }
    },

    "userActivity": {
      "activeUsers": 2450,
      "newSessions": 890,
      "pageViews": 45000,
      "averageSessionDuration": 420 // seconds
    },

    "businessMetrics": {
      "bookingsPerHour": 18,
      "revenuePerHour": 1850000,
      "conversionRate": 3.2,
      "averageBookingTime": 180 // seconds
    }
  }
}
```

---

## ⚙️ 6. System Settings APIs

### 6.1 Get System Settings

**GET** `/admin/settings`

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "System settings retrieved successfully",
  "data": {
    "general": {
      "siteName": "CheckInn",
      "siteDescription": "Hotel booking platform",
      "supportEmail": "support@checkinn.com",
      "timezone": "Asia/Ho_Chi_Minh",
      "currency": "VND",
      "language": "vi"
    },

    "booking": {
      "maxAdvanceBookingDays": 365,
      "minAdvanceBookingHours": 2,
      "cancellationPolicyHours": 24,
      "autoConfirmBookings": false,
      "requirePhoneVerification": true
    },

    "payment": {
      "enabledMethods": ["credit_card", "banking", "wallet"],
      "defaultCurrency": "VND",
      "commissionRate": 10.0, // percentage
      "partnerPayoutSchedule": "weekly"
    },

    "notifications": {
      "emailEnabled": true,
      "smsEnabled": true,
      "pushEnabled": true,
      "emailProvider": "sendgrid",
      "smsProvider": "twilio"
    },

    "security": {
      "passwordMinLength": 8,
      "requireTwoFactor": false,
      "sessionTimeout": 24, // hours
      "maxLoginAttempts": 5,
      "rateLimitEnabled": true
    },

    "maintenance": {
      "maintenanceMode": false,
      "maintenanceMessage": "System maintenance in progress",
      "allowedIPs": ["192.168.1.100"]
    }
  }
}
```

### 6.2 Update System Settings

**PUT** `/admin/settings`

**Request Body:**

```json
{
  "general": {
    "siteName": "CheckInn Pro",
    "supportEmail": "help@checkinn.com"
  },
  "booking": {
    "autoConfirmBookings": true,
    "cancellationPolicyHours": 48
  }
  // ... other settings sections
}
```

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "System settings updated successfully",
  "data": {
    "updatedBy": "admin_id",
    "updatedAt": "2025-09-24T10:30:00.000Z",
    "changedSettings": [
      "general.siteName",
      "general.supportEmail",
      "booking.autoConfirmBookings",
      "booking.cancellationPolicyHours"
    ]
  }
}
```

---

## 📝 7. Activity Logs APIs

### 7.1 Get Activity Logs

**GET** `/admin/logs/activity`

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 50)
- `userId`: string (optional) - filter by user
- `action`: string (optional) - filter by action type
- `resource`: string (optional) - filter by resource type
- `dateFrom`: string (optional)
- `dateTo`: string (optional)
- `sortBy`: string (default: "createdAt")
- `sortOrder`: string (default: "desc")

**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": {
    "logs": [
      {
        "_id": "log_id_1",
        "userId": "user_id_1",
        "userName": "Nguyen Van A",
        "userRole": "Customer",
        "action": "CREATE_BOOKING",
        "resource": "booking",
        "resourceId": "booking_id_1",
        "details": {
          "hotelName": "Luxury Hotel Saigon",
          "roomType": "Deluxe Room",
          "checkIn": "2025-09-25",
          "totalAmount": 1500000
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "createdAt": "2025-09-24T10:30:00.000Z"
      }
      // ... more logs
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 100,
      "totalLogs": 5000,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalToday": 245,
      "totalThisWeek": 1580,
      "mostActiveUser": "user_id_123",
      "mostCommonAction": "VIEW_HOTEL"
    }
  }
}
```

---

## 🔧 Implementation Guidelines

### 1. Database Design Considerations

```javascript
// Add admin-specific fields to existing schemas

// User schema additions
{
  lastLoginIP: String,
  loginAttempts: Number,
  lockoutUntil: Date,
  adminNotes: String
}

// Hotel schema additions
{
  approvalStatus: {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'] },
    submittedAt: Date,
    reviewedBy: ObjectId,
    reviewedAt: Date,
    rejectionReason: String
  },
  adminNotes: String,
  performanceMetrics: {
    monthlyRevenue: Number,
    totalBookings: Number,
    averageRating: Number,
    lastUpdated: Date
  }
}

// New ActivityLog schema
{
  userId: ObjectId,
  action: String,  // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
  resource: String, // user, hotel, booking, system
  resourceId: ObjectId,
  details: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}

// New SystemSettings schema
{
  category: String, // general, booking, payment, security
  settings: Object, // flexible settings object
  updatedBy: ObjectId,
  updatedAt: Date
}
```

### 2. Security & Performance

```javascript
// Rate limiting for admin endpoints
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many admin requests from this IP",
});

// Data sanitization
const sanitizeAdminInput = (req, res, next) => {
  // Sanitize user inputs
  // Validate admin permissions
  // Log admin actions
  next();
};

// Caching strategy
const cacheSettings = {
  dashboard: 300, // 5 minutes
  systemHealth: 60, // 1 minute
  reports: 1800, // 30 minutes
  settings: 3600, // 1 hour
};
```

### 3. Error Handling

```javascript
// Admin-specific error codes
const ADMIN_ERROR_CODES = {
  INSUFFICIENT_PERMISSIONS: 'ADMIN_001',
  RESOURCE_NOT_FOUND: 'ADMIN_002',
  INVALID_STATUS_TRANSITION: 'ADMIN_003',
  REPORT_GENERATION_FAILED: 'ADMIN_004',
  SYSTEM_HEALTH_CHECK_FAILED: 'ADMIN_005'
};

// Error response format
{
  "success": false,
  "message": "Access denied. Admin role required.",
  "errorCode": "ADMIN_001",
  "timestamp": "2025-09-24T10:30:00.000Z",
  "requestId": "req_12345"
}
```

### 4. Logging Strategy

```javascript
// Log levels for admin operations
const LOG_LEVELS = {
  INFO: "info", // Normal admin operations
  WARN: "warning", // Potentially concerning actions
  ERROR: "error", // Failed operations
  AUDIT: "audit", // Critical security events
};

// What to log
const LOGGABLE_ACTIONS = [
  "USER_STATUS_CHANGE",
  "HOTEL_APPROVAL",
  "HOTEL_REJECTION",
  "BOOKING_STATUS_CHANGE",
  "SYSTEM_SETTINGS_UPDATE",
  "ADMIN_LOGIN",
  "REPORT_EXPORT",
];
```

---

## 📊 Database Performance Optimization

### Required Indexes

```javascript
// Users collection
db.users.createIndex({ role: 1, status: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });

// Hotels collection
db.hotels.createIndex({ "approvalStatus.status": 1 });
db.hotels.createIndex({ "location.city": 1, starRating: 1 });
db.hotels.createIndex({ partnerId: 1 });

// Bookings collection
db.bookings.createIndex({ status: 1, createdAt: -1 });
db.bookings.createIndex({ hotelId: 1, checkIn: 1 });
db.bookings.createIndex({ userId: 1, createdAt: -1 });

// Activity logs collection
db.activityLogs.createIndex({ createdAt: -1 });
db.activityLogs.createIndex({ userId: 1, action: 1 });
db.activityLogs.createIndex({ resource: 1, resourceId: 1 });
```

### Aggregation Pipelines

```javascript
// Dashboard statistics aggregation
const getDashboardStats = async () => {
  const stats = await db.bookings.aggregate([
    {
      $facet: {
        totalRevenue: [
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ],
        monthlyRevenue: [
          {
            $match: {
              status: "completed",
              createdAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ],
        todayBookings: [
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);

  return stats;
};
```

---

## 🚀 Deployment & Monitoring

### 1. Environment Variables

```bash
# Admin-specific environment variables
ADMIN_JWT_SECRET=your_admin_jwt_secret
ADMIN_SESSION_TIMEOUT=86400000  # 24 hours
ADMIN_RATE_LIMIT_REQUESTS=1000
ADMIN_RATE_LIMIT_WINDOW=900000  # 15 minutes

# System monitoring
SYSTEM_HEALTH_CHECK_INTERVAL=30000  # 30 seconds
PERFORMANCE_METRICS_RETENTION=7     # 7 days

# Report generation
REPORT_EXPORT_MAX_SIZE=100000       # 100k records
REPORT_EXPORT_TIMEOUT=300000        # 5 minutes
```

### 2. Health Checks

```javascript
// Health check endpoint for load balancer
app.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.status(200).json(health);
});
```

---

## 📞 Support & Next Steps

### Implementation Priority

1. **High Priority** (Week 1):
   - Admin Dashboard APIs (`/admin/dashboard/stats`, `/admin/system/health`)
   - User Management APIs (`/admin/users/*`)
2. **Medium Priority** (Week 2):
   - Hotel Management APIs (`/admin/hotels/*`)
   - Booking Management APIs (`/admin/bookings/*`)
3. **Low Priority** (Week 3-4):
   - Reports & Analytics APIs (`/admin/reports/*`)
   - System Settings APIs (`/admin/settings/*`)
   - Activity Logs APIs (`/admin/logs/*`)

### Testing Requirements

- Unit tests for all admin controllers
- Integration tests for admin workflows
- Load testing for dashboard endpoints
- Security testing for admin authorization

### Documentation

- API documentation with Postman collection
- Database schema documentation
- Deployment guide for admin features
- Monitoring and alerting setup

---

**Last Updated**: September 24, 2025  
**Version**: 1.0.0  
**Prepared by**: Frontend Team
