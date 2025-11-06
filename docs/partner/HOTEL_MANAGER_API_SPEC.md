# 🔌 Hotel Manager API Specification

## Base URL
```
http://localhost:5000/api
```

---

## 📋 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1️⃣ Partner Registration & Onboarding

### 1.1 Register Partner Account

**Endpoint:** `POST /partner/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "partner@example.com",
  "phone": "0123456789",
  "password": "Password123!",
  "businessName": "A Hotel Group",
  "businessType": "company"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner account created successfully",
  "data": {
    "user": {
      "_id": "partner_id",
      "name": "Nguyễn Văn A",
      "email": "partner@example.com",
      "role": "HotelPartner",
      "partnerInfo": {
        "businessName": "A Hotel Group",
        "businessType": "company",
        "onboardingCompleted": false,
        "onboardingStep": 1
      }
    },
    "nextStep": 2,
    "onboardingUrl": "/partner/onboarding/business-info"
  }
}
```

---

### 1.2 Get Onboarding Status

**Endpoint:** `GET /partner/onboarding-status`

**Access:** Private (HotelPartner)

**Response:**
```json
{
  "success": true,
  "data": {
    "currentStep": 3,
    "completed": false,
    "verificationStatus": "pending",
    "steps": {
      "basicInfo": true,
      "businessInfo": true,
      "bankAccount": true,
      "documents": false,
      "verified": false
    }
  }
}
```

---

### 1.3 Update Business Information

**Endpoint:** `PUT /partner/business-info`

**Access:** Private (HotelPartner)

**Request Body:**
```json
{
  "businessName": "A Hotel Group Ltd",
  "businessType": "company",
  "taxId": "0123456789",
  "businessAddress": {
    "street": "123 Main Street",
    "city": "Ho Chi Minh",
    "state": "Ho Chi Minh",
    "country": "Vietnam",
    "zipCode": "70000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Business information updated successfully",
  "data": {
    "user": { },
    "nextStep": 3,
    "onboardingUrl": "/partner/onboarding/bank-account"
  }
}
```

---

### 1.4 Update Bank Account

**Endpoint:** `PUT /partner/bank-account`

**Access:** Private (HotelPartner)

**Request Body:**
```json
{
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN A",
  "swiftCode": "BFTVVNVX",
  "branchName": "District 1 Branch"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bank account information saved successfully",
  "data": {
    "user": { },
    "nextStep": 4,
    "onboardingUrl": "/partner/onboarding/documents"
  }
}
```

---

### 1.5 Upload Verification Documents

**Endpoint:** `POST /partner/documents`

**Access:** Private (HotelPartner)

**Request Body:**
```json
{
  "documents": [
    {
      "type": "business_license",
      "url": "https://cdn.example.com/docs/license.pdf"
    },
    {
      "type": "tax_certificate",
      "url": "https://cdn.example.com/docs/tax.pdf"
    },
    {
      "type": "id_card",
      "url": "https://cdn.example.com/docs/id.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documents uploaded successfully. Your account is under review.",
  "data": {
    "user": { },
    "estimatedReviewTime": "2-3 business days"
  }
}
```

---

### 1.6 Complete Onboarding

**Endpoint:** `POST /partner/complete-onboarding`

**Access:** Private (HotelPartner)

**Response:**
```json
{
  "success": true,
  "message": "Onboarding completed! You can now create your first hotel.",
  "data": {
    "user": { },
    "redirectUrl": "/partner/hotels/create"
  }
}
```

---

## 2️⃣ Partner Dashboard

### 2.1 Get Dashboard Overview

**Endpoint:** `GET /partner/dashboard`

**Access:** Private (HotelPartner)

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": {
      "total": 5,
      "active": 4
    },
    "bookings": {
      "pending": 12,
      "todayCheckIns": 3
    },
    "revenue": {
      "today": 5500000,
      "thisMonth": 85000000
    },
    "statistics": {
      "totalBookings": 45,
      "avgOccupancyRate": 67.5
    }
  }
}
```

---

### 2.2 Get Partner's Hotels

**Endpoint:** `GET /partner/hotels`

**Access:** Private (HotelPartner)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "hotels": [
      {
        "_id": "hotel_id",
        "name": "Luxury Hotel Saigon",
        "status": "active",
        "category": "luxury",
        "starRating": 5,
        "location": {
          "city": "Ho Chi Minh",
          "address": "123 Nguyen Hue"
        },
        "stats": {
          "averageRating": 4.5,
          "totalReviews": 230,
          "totalBookings": 450
        },
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.3 Get Partner Earnings

**Endpoint:** `GET /partner/earnings`

**Access:** Private (HotelPartner)

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Example:** `GET /partner/earnings?startDate=2025-10-01&endDate=2025-10-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    },
    "earnings": {
      "totalEarnings": 76500000,
      "totalTransactions": 85,
      "totalPlatformFee": 8500000,
      "totalGrossRevenue": 85000000
    },
    "pendingPayout": 5000000
  }
}
```

---

## 3️⃣ Revenue & Analytics

### 3.1 Get Partner Revenue Summary

**Endpoint:** `GET /revenue/partner/summary`

**Access:** Private (HotelPartner)

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    },
    "summary": {
      "totalRevenue": 125000000,
      "totalBookings": 150,
      "avgOccupancyRate": 72.5,
      "totalHotels": 5
    },
    "byHotel": [
      {
        "_id": "hotel_id_1",
        "hotelName": "Luxury Hotel Saigon",
        "totalRevenue": 50000000,
        "totalBookings": 60,
        "avgOccupancyRate": 80.0
      }
    ]
  }
}
```

---

### 3.2 Get Hotel Revenue (Date Range)

**Endpoint:** `GET /revenue/hotel/:hotelId`

**Access:** Private (HotelPartner, Admin)

**Query Parameters:**
- `startDate` (optional): ISO date string, default: start of month
- `endDate` (optional): ISO date string, default: today

**Example:** `GET /revenue/hotel/673xxxxx?startDate=2025-10-01&endDate=2025-10-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "hotel_id",
      "name": "Luxury Hotel Saigon"
    },
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    },
    "dailyRevenues": [
      {
        "date": "2025-10-01T00:00:00.000Z",
        "totalRevenue": 2500000,
        "totalBookings": 8,
        "occupancyRate": 75.0,
        "confirmedBookings": 6,
        "cancelledBookings": 0
      }
    ],
    "totals": {
      "totalRevenue": 50000000,
      "totalBookings": 150,
      "confirmedBookings": 140,
      "completedBookings": 130,
      "cancelledBookings": 10,
      "avgOccupancyRate": 72.5,
      "avgBookingValue": 333333
    }
  }
}
```

---

### 3.3 Get Monthly Revenue Summary

**Endpoint:** `GET /revenue/hotel/:hotelId/monthly`

**Access:** Private (HotelPartner, Admin)

**Query Parameters:**
- `year` (optional): number, default: current year
- `month` (optional): number (1-12), default: current month

**Example:** `GET /revenue/hotel/673xxxxx/monthly?year=2025&month=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "hotel_id",
      "name": "Luxury Hotel Saigon"
    },
    "period": {
      "year": 2025,
      "month": 10
    },
    "summary": {
      "totalRevenue": 50000000,
      "totalBookings": 150,
      "confirmedBookings": 140,
      "cancelledBookings": 10,
      "avgOccupancyRate": 72.5,
      "avgBookingValue": 333333
    }
  }
}
```

---

### 3.4 Get Occupancy Rate Analytics

**Endpoint:** `GET /revenue/hotel/:hotelId/occupancy`

**Access:** Private (HotelPartner, Admin)

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "hotel_id",
      "name": "Luxury Hotel Saigon"
    },
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    },
    "occupancy": {
      "average": 72.5,
      "maximum": 95.0,
      "minimum": 45.0
    },
    "dailyOccupancy": [
      {
        "date": "2025-10-01T00:00:00.000Z",
        "occupancyRate": 75.0,
        "occupiedRooms": 15,
        "totalRooms": 20
      }
    ]
  }
}
```

---

### 3.5 Get Booking Trends

**Endpoint:** `GET /revenue/hotel/:hotelId/trends`

**Access:** Private (HotelPartner, Admin)

**Query Parameters:**
- `period` (optional): `7d`, `30d`, `90d`, `1y`, default: `30d`

**Example:** `GET /revenue/hotel/673xxxxx/trends?period=30d`

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "hotel_id",
      "name": "Luxury Hotel Saigon"
    },
    "period": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z",
      "duration": "30d"
    },
    "trends": {
      "bookings": [
        {
          "date": "2025-10-01T00:00:00.000Z",
          "total": 8,
          "confirmed": 6,
          "cancelled": 0,
          "cancellationRate": 0
        }
      ],
      "revenue": [
        {
          "date": "2025-10-01T00:00:00.000Z",
          "total": 2500000,
          "confirmed": 2000000,
          "completed": 500000
        }
      ]
    },
    "growth": {
      "revenue": 15.5,
      "bookings": 12.3
    }
  }
}
```

---

### 3.6 Update Revenue Data (Admin Only)

**Endpoint:** `POST /revenue/hotel/:hotelId/update`

**Access:** Private (Admin)

**Request Body:**
```json
{
  "date": "2025-10-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Revenue data updated successfully",
  "data": {
    "_id": "revenue_id",
    "hotel": "hotel_id",
    "date": "2025-10-01T00:00:00.000Z",
    "totalRevenue": 2500000,
    "totalBookings": 8,
    "occupancyRate": 75.0
  }
}
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not logged in. Please log in to get access."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong on the server"
}
```

---

## 🔐 Authorization Matrix

| Endpoint | Customer | HotelPartner | Admin |
|----------|----------|--------------|-------|
| POST /partner/register | ✅ | ✅ | ✅ |
| GET /partner/onboarding-status | ❌ | ✅ | ✅ |
| PUT /partner/business-info | ❌ | ✅ | ✅ |
| PUT /partner/bank-account | ❌ | ✅ | ✅ |
| POST /partner/documents | ❌ | ✅ | ✅ |
| GET /partner/dashboard | ❌ | ✅ | ✅ |
| GET /partner/hotels | ❌ | ✅ (own) | ✅ |
| GET /partner/earnings | ❌ | ✅ (own) | ✅ |
| GET /revenue/partner/summary | ❌ | ✅ (own) | ✅ |
| GET /revenue/hotel/:id | ❌ | ✅ (own) | ✅ |
| POST /revenue/hotel/:id/update | ❌ | ❌ | ✅ |

---

**Author:** CheckInn Team  
**Version:** 1.0.0  
**Last Updated:** November 2, 2025
