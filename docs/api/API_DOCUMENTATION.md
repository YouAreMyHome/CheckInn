# 📚 CheckInn API Documentation

## 🎯 Mục đích

Tài liệu này cung cấp hướng dẫn chi tiết cho Frontend Team để integrate với CheckInn API một cách dễ dàng và hiệu quả.

## 🔧 Base Configuration

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Standard Response Format

Tất cả API responses đều follow format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "errors": array (nếu có validation errors)
}
```

### Authentication Headers

```javascript
// Required for protected routes
headers: {
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}
```

---

## 🔐 Authentication APIs

### 1. User Registration

**POST** `/auth/register`

**Rate Limit:** 5 requests/15 minutes per IP

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "Password123!",
  "role": "Customer" // Optional: Customer, HotelPartner
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789",
      "role": "Customer",
      "isEmailVerified": false,
      "avatar": "",
      "createdAt": "2025-09-22T10:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "refresh_token"
  }
}
```

**Frontend Usage:**

```javascript
const register = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (result.success) {
      // Store tokens
      localStorage.setItem("access_token", result.data.token);
      localStorage.setItem("refresh_token", result.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
```

### 2. User Login

**POST** `/auth/login`

**Rate Limit:** 5 requests/15 minutes per IP

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** Same as registration

**Frontend Usage:**

```javascript
const login = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("access_token", result.data.token);
      localStorage.setItem("refresh_token", result.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

### 3. Get Current User

**GET** `/auth/me`

**Headers:** Authorization required

**Response:**

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "role": "Customer"
      // ... other user fields
    }
  }
}
```

### 4. Refresh Token

**POST** `/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "your_refresh_token"
}
```

### 5. Logout

**POST** `/auth/logout`

**Headers:** Authorization required

### 6. Forgot Password

**POST** `/auth/forgot-password`

**Rate Limit:** 3 requests/hour per IP

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### 7. Reset Password

**POST** `/auth/reset-password/:token`

**Request Body:**

```json
{
  "password": "NewPassword123!"
}
```

---

## 🏨 Hotels APIs

### 1. Get Hotels (Public)

**GET** `/hotels`

**Query Parameters:**

```javascript
{
  page: 1,              // Trang hiện tại
  limit: 10,            // Số lượng/trang
  city: "Ho Chi Minh",  // Lọc theo thành phố
  minPrice: 500000,     // Giá tối thiểu
  maxPrice: 2000000,    // Giá tối đa
  rating: 4,            // Rating tối thiểu
  amenities: "wifi,pool", // Tiện ích (comma separated)
  sortBy: "price",      // price, rating, name
  sortOrder: "asc"      // asc, desc
}
```

**Response:**

```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": {
    "hotels": [
      {
        "_id": "hotel_id",
        "name": "Luxury Hotel Saigon",
        "description": "5-star luxury hotel...",
        "images": ["url1", "url2"],
        "location": {
          "address": "123 Nguyen Hue, District 1",
          "city": "Ho Chi Minh",
          "coordinates": [106.6297, 10.8231]
        },
        "contact": {
          "phone": "+84123456789",
          "email": "hotel@example.com"
        },
        "amenities": ["wifi", "pool", "spa"],
        "starRating": 5,
        "averageRating": 4.5,
        "totalReviews": 150,
        "priceRange": {
          "min": 800000,
          "max": 3000000
        },
        "policies": {
          "checkIn": "14:00",
          "checkOut": "12:00"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalHotels": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Frontend Usage:**

```javascript
const getHotels = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${BASE_URL}/hotels?${queryParams}`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Get hotels error:", error);
    throw error;
  }
};

// Usage example
const hotelData = await getHotels({
  city: "Ho Chi Minh",
  minPrice: 500000,
  maxPrice: 2000000,
  page: 1,
  limit: 12,
});
```

### 2. Get Hotel by ID

**GET** `/hotels/:id`

**Response:**

```json
{
  "success": true,
  "message": "Hotel retrieved successfully",
  "data": {
    "hotel": {
      "_id": "hotel_id",
      "name": "Luxury Hotel Saigon",
      "description": "Detailed description...",
      "images": ["url1", "url2", "url3"],
      "location": {
        "address": "123 Nguyen Hue, District 1",
        "city": "Ho Chi Minh",
        "coordinates": [106.6297, 10.8231],
        "landmarks": [
          {
            "name": "Ben Thanh Market",
            "distance": 500,
            "type": "Mall"
          }
        ]
      },
      "contact": {
        "phone": "+84123456789",
        "email": "hotel@example.com",
        "website": "https://hotel.com"
      },
      "amenities": ["wifi", "pool", "spa", "gym"],
      "starRating": 5,
      "averageRating": 4.5,
      "totalReviews": 150,
      "rooms": [
        {
          "_id": "room_id",
          "name": "Deluxe Room",
          "type": "Deluxe",
          "price": 1200000,
          "capacity": 2,
          "amenities": ["ac", "tv", "minibar"],
          "availability": true
        }
      ],
      "policies": {
        "checkIn": "14:00",
        "checkOut": "12:00",
        "cancellation": {
          "type": "Free",
          "hoursBeforeCheckIn": 24
        }
      }
    }
  }
}
```

### 3. Create Hotel (Partner Only)

**POST** `/hotels`

**Headers:** Authorization required, Role: HotelPartner

**Request Body:**

```json
{
  "name": "New Hotel",
  "description": "Hotel description",
  "location": {
    "address": "123 Street Name",
    "city": "Ho Chi Minh",
    "state": "Ho Chi Minh",
    "country": "Vietnam",
    "zipCode": "70000"
  },
  "contact": {
    "phone": "+84123456789",
    "email": "hotel@example.com"
  },
  "amenities": ["wifi", "pool"],
  "starRating": 4,
  "policies": {
    "checkIn": "14:00",
    "checkOut": "12:00"
  }
}
```

---

## 🛏️ Rooms APIs

### 1. Get Rooms for Hotel

**GET** `/rooms?hotelId=:hotelId`

**Query Parameters:**

```javascript
{
  hotelId: "hotel_id",     // Required
  checkIn: "2025-10-01",   // YYYY-MM-DD
  checkOut: "2025-10-03",  // YYYY-MM-DD
  guests: 2,               // Số khách
  roomType: "Deluxe",      // Loại phòng
  minPrice: 500000,
  maxPrice: 2000000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "_id": "room_id",
        "hotel": "hotel_id",
        "name": "Deluxe Ocean View",
        "type": "Deluxe",
        "description": "Spacious room with ocean view",
        "images": ["room1.jpg", "room2.jpg"],
        "capacity": {
          "adults": 2,
          "children": 1,
          "maxOccupancy": 3
        },
        "bedConfiguration": [
          {
            "type": "King",
            "quantity": 1
          }
        ],
        "size": 35,
        "amenities": ["ac", "tv", "minibar", "balcony"],
        "pricing": {
          "basePrice": 1200000,
          "taxRate": 10,
          "serviceChargeRate": 5
        },
        "availability": {
          "isAvailable": true,
          "availableRooms": 3
        }
      }
    ]
  }
}
```

---

## 📋 Bookings APIs

### 1. Create Booking

**POST** `/bookings`

**Headers:** Authorization required

**Request Body:**

```json
{
  "hotel": "hotel_id",
  "room": "room_id",
  "checkIn": "2025-10-01",
  "checkOut": "2025-10-03",
  "guests": [
    {
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "email": "guest@example.com",
      "phone": "+84123456789",
      "age": 30,
      "type": "Adult",
      "isMainGuest": true
    }
  ],
  "specialRequests": "Late check-in",
  "paymentMethod": "CreditCard"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "booking_id",
      "bookingNumber": "CHK-2025-001234",
      "hotel": {
        "_id": "hotel_id",
        "name": "Luxury Hotel Saigon"
      },
      "room": {
        "_id": "room_id",
        "name": "Deluxe Ocean View"
      },
      "user": "user_id",
      "checkIn": "2025-10-01T00:00:00.000Z",
      "checkOut": "2025-10-03T00:00:00.000Z",
      "nights": 2,
      "guests": [...],
      "pricing": {
        "baseAmount": 2400000,
        "taxes": 240000,
        "serviceCharges": 120000,
        "totalAmount": 2760000,
        "currency": "VND"
      },
      "status": "Confirmed",
      "paymentStatus": "Pending",
      "createdAt": "2025-09-22T10:00:00.000Z"
    }
  }
}
```

### 2. Get My Bookings

**GET** `/bookings/my-bookings`

**Headers:** Authorization required

**Query Parameters:**

```javascript
{
  page: 1,
  limit: 10,
  status: "Confirmed", // Confirmed, Cancelled, CheckedIn, CheckedOut
  sortBy: "checkIn",   // checkIn, createdAt
  sortOrder: "desc"
}
```

### 3. Get Booking by ID

**GET** `/bookings/:id`

**Headers:** Authorization required

### 4. Cancel Booking

**PATCH** `/bookings/:id/cancel`

**Headers:** Authorization required

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

---

## 🔍 Search APIs

### 1. Hotel Search

**GET** `/search/hotels`

**Query Parameters:**

```javascript
{
  destination: "Ho Chi Minh",  // City or hotel name
  checkIn: "2025-10-01",
  checkOut: "2025-10-03",
  guests: 2,
  rooms: 1,
  minPrice: 500000,
  maxPrice: 2000000,
  starRating: 4,
  amenities: "wifi,pool",
  sortBy: "price",
  sortOrder: "asc",
  page: 1,
  limit: 12
}
```

**Frontend Search Component Example:**

```javascript
const HotelSearch = () => {
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
  });

  const searchHotels = async () => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${BASE_URL}/search/hotels?${queryString}`);
      const result = await response.json();

      if (result.success) {
        setHotels(result.data.hotels);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return <div className="search-form">{/* Search form implementation */}</div>;
};
```

---

## 🛠️ Error Handling

### Common Error Codes

```javascript
// HTTP Status Codes
200: "Success"
201: "Created"
400: "Bad Request - Invalid data"
401: "Unauthorized - Invalid token"
403: "Forbidden - Insufficient permissions"
404: "Not Found"
429: "Too Many Requests - Rate limit exceeded"
500: "Internal Server Error"
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Frontend Error Handler

```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired, try refresh
        await refreshToken();
        // Retry original request
        return apiCall(url, options);
      } else if (response.status === 429) {
        throw new Error("Quá nhiều yêu cầu, vui lòng thử lại sau");
      }

      throw new Error(result.message || "Something went wrong");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

---

## 🔄 Token Refresh Strategy

```javascript
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("access_token", result.data.token);
      return result.data.token;
    } else {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = "/login";
    }
  } catch (error) {
    localStorage.clear();
    window.location.href = "/login";
  }
};
```

---

## 📱 Real-time Features (WebSocket)

### Connection Setup

```javascript
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_WS_URL, {
  auth: {
    token: localStorage.getItem("access_token"),
  },
});

// Listen for booking updates
socket.on("booking-update", (data) => {
  console.log("Booking updated:", data);
  // Update UI accordingly
});

// Listen for hotel availability changes
socket.on("room-availability", (data) => {
  console.log("Room availability changed:", data);
  // Update room list
});
```

---

## 🧪 Testing với Postman

### Environment Variables

```javascript
{
  "base_url": "http://localhost:5000/api",
  "access_token": "{{access_token}}",
  "refresh_token": "{{refresh_token}}"
}
```

### Pre-request Script (Auto token refresh)

```javascript
pm.sendRequest(
  {
    url: pm.environment.get("base_url") + "/auth/me",
    method: "GET",
    header: {
      Authorization: "Bearer " + pm.environment.get("access_token"),
    },
  },
  function (err, response) {
    if (response.code === 401) {
      // Token expired, refresh it
      pm.sendRequest(
        {
          url: pm.environment.get("base_url") + "/auth/refresh",
          method: "POST",
          header: {
            "Content-Type": "application/json",
          },
          body: {
            mode: "raw",
            raw: JSON.stringify({
              refreshToken: pm.environment.get("refresh_token"),
            }),
          },
        },
        function (err, refreshResponse) {
          if (refreshResponse.code === 200) {
            const newToken = refreshResponse.json().data.token;
            pm.environment.set("access_token", newToken);
          }
        }
      );
    }
  }
);
```

---

## 🎯 Best Practices cho Frontend

### 1. State Management

```javascript
// Using React Query for API state management
import { useQuery, useMutation, useQueryClient } from "react-query";

const useHotels = (filters) => {
  return useQuery(["hotels", filters], () => getHotels(filters), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation(createBooking, {
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings"]);
    },
  });
};
```

### 2. Loading States

```javascript
const HotelList = () => {
  const { data, isLoading, error } = useHotels(filters);

  if (isLoading) return <HotelSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.hotels.map((hotel) => (
        <HotelCard key={hotel._id} hotel={hotel} />
      ))}
    </div>
  );
};
```

### 3. Form Validation

```javascript
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const bookingSchema = yup.object({
  checkIn: yup.date().required("Check-in date is required"),
  checkOut: yup
    .date()
    .min(yup.ref("checkIn"), "Check-out must be after check-in"),
  guests: yup.array().min(1, "At least one guest is required"),
});

const BookingForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookingSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createBooking(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>;
};
```

---

## 📞 Support & Contact

- **Tech Lead:** [Your Name]
- **API Documentation:** This file
- **Postman Collection:** [Link to shared collection]
- **Slack Channel:** #checkinn-frontend
- **API Issues:** Create issue in project repository

---

**📝 Note:** Document này sẽ được cập nhật thường xuyên khi có thay đổi API. Vui lòng check version mới nhất trước khi implement.

**Last Updated:** September 22, 2025
**Version:** 1.0.0
