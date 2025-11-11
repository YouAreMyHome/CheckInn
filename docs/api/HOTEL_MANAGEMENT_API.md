# Hotel Management API Documentation

## Overview
API endpoints cho Admin Portal để quản lý hotels trong hệ thống CheckInn.

---

## Authentication
Tất cả protected routes yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get All Hotels
**GET** `/api/hotels`

**Access:** Public

**Query Parameters:**
- `status` (string): Filter by status (active, pending, inactive, suspended, rejected)
- `category` (string): Filter by category (budget, business, luxury, resort, boutique)
- `isVerified` (boolean): Filter by verification status
- `isFeatured` (boolean): Filter by featured status
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": {
    "hotels": [
      {
        "_id": "hotel_id",
        "name": "Grand Hotel",
        "category": "luxury",
        "starRating": 5,
        "status": "active",
        "isVerified": true,
        "isFeatured": false,
        "location": {
          "city": "Ho Chi Minh",
          "country": "Vietnam",
          "address": "123 Main St"
        },
        "contact": {
          "phone": "+84123456789",
          "email": "info@grandhotel.com"
        },
        "stats": {
          "averageRating": 4.5,
          "totalReviews": 120
        },
        "priceRange": {
          "min": 1000000,
          "max": 5000000
        },
        "rejectionReason": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalHotels": 50
    }
  }
}
```

---

### 2. Update Hotel
**PATCH** `/api/hotels/:id`

**Access:** Admin, HotelPartner (owner only)

**Authorization:** 
- Admin: Can update any hotel
- HotelPartner: Can only update own hotels (cannot change status)

**Request Body:**
```json
{
  "status": "active",
  "isVerified": true,
  "isFeatured": false,
  "rejectionReason": "Incomplete documentation"
}
```

**Note:** 
- `status` can only be changed by Admin
- Available statuses: active, pending, inactive, suspended, rejected

**Response:**
```json
{
  "success": true,
  "message": "Hotel updated successfully",
  "data": {
    "hotel": {
      "_id": "hotel_id",
      "name": "Grand Hotel",
      "status": "active",
      "isVerified": true,
      "isFeatured": false
    }
  }
}
```

---

### 3. Approve Hotel (Admin Only)
**PATCH** `/api/hotels/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "active",
  "isVerified": true
}
```

**Use Case:** Approve pending hotel application

---

### 4. Reject Hotel (Admin Only)
**PATCH** `/api/hotels/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "rejected",
  "rejectionReason": "Incomplete business documentation. Please provide valid business license."
}
```

**Note:** `rejectionReason` is required when rejecting

---

### 5. Suspend Hotel (Admin Only)
**PATCH** `/api/hotels/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "suspended"
}
```

---

### 6. Toggle Verification (Admin Only)
**PATCH** `/api/hotels/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "isVerified": true
}
```

---

### 7. Toggle Featured (Admin Only)
**PATCH** `/api/hotels/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "isFeatured": true
}
```

---

### 8. Delete Hotel (Admin Only)
**DELETE** `/api/hotels/:id`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Hotel deleted successfully"
}
```

---

## Hotel Status Flow

```
pending → active (approved by admin)
pending → rejected (rejected by admin)
active → suspended (suspended by admin)
suspended → active (reactivated by admin)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authenticated. Please log in."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only update your own hotels"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

---

## Testing

Run test script:
```bash
cd apps/api-server
node test-hotel-api.js
```

Test credentials (Admin):
```
Email: admin@checkinn.com
Password: Admin@123
```

---

## Implementation Notes

### Backend Changes:
1. **Hotel Model** (`Hotel.model.js`):
   - Added `rejectionReason` field
   - Added 'rejected' to status enum

2. **Hotel Routes** (`hotel.routes.js`):
   - Added authentication middleware (`protect`)
   - Added authorization middleware (`restrictTo`)
   - Admin-only routes for status changes

3. **Hotel Controller** (`hotel.controller.js`):
   - Existing `updateHotel` handles all updates
   - Admin can change status + verification
   - Partners can only update own hotels

### Frontend Integration:
- **HotelsPage**: View all hotels, quick actions
- **VerificationsPage**: Dedicated verification workflow
- Actions: Approve, Reject (with reason), Suspend, Verify, Feature

---

## Security

✅ JWT authentication required for all write operations
✅ Role-based access control (Admin vs HotelPartner)
✅ Hotel ownership validation
✅ Status change restricted to Admin only
✅ Input validation and sanitization

---

## Next Steps

1. Test API với Postman hoặc test script
2. Verify authentication flow
3. Test admin permissions
4. Test partner permissions
5. Integrate với frontend pages
