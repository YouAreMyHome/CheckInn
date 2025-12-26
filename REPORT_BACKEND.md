# Báo Cáo Chi Tiết Backend (API Server)

## 1. Thông Tin Chung
*   **Tên ứng dụng:** `api-server`
*   **Thư mục:** `apps/api-server/`
*   **Loại:** RESTful API Service
*   **Cổng mặc định (Port):** 5000 (hoặc 5001)

## 2. Công Nghệ & Thư Viện Chính
*   **Core:** Express, Mongoose, Node.js.
*   **Security:** Helmet, Cors, Bcryptjs, Jsonwebtoken, Express-mongo-sanitize, Xss-clean, Hpp.
*   **Performance:** Redis, Compression, Rate-limit-redis.
*   **Logging:** Morgan, Winston.
*   **Services:** Cloudinary (Media), Nodemailer (Email).

## 3. Cấu Trúc Mã Nguồn
```
src/
├── config/           # Cấu hình hệ thống
├── controllers/      # Logic xử lý request
├── middlewares/      # Auth, Error, Validation
├── models/           # Mongoose Schemas
├── routes/           # API Endpoints
├── utils/            # Helpers
└── views/            # Email templates
```

## 4. Danh Sách API & Trạng Thái (Cập Nhật)
Dựa trên kiểm tra file `src/routes/index.js`, hệ thống API đang trong quá trình tích hợp hoặc bảo trì.

### Các Route Đang Hoạt Động (Active)
*   `/api/auth`: Xác thực và phân quyền (Đăng nhập, Refresh token).
*   `/api/register`: Đăng ký tài khoản (đặc biệt là Multi-step registration).
*   `/api/partner`: Các nghiệp vụ dành cho Đối tác/Quản lý khách sạn.
*   `/api/revenue`: Quản lý và báo cáo doanh thu.
*   `/api/status`: Kiểm tra trạng thái server (Health check cơ bản).
*   `/api/version`: Kiểm tra version API.

### Các Route Tạm Thời Vô Hiệu Hóa (Inactive/Commented Out)
Code cho các module này đã tồn tại trong thư mục `routes/` nhưng chưa được mount vào router chính:
*   `/api/users`: Quản lý người dùng.
*   `/api/health`: Health check chi tiết.
*   `/api/hotels`: Quản lý khách sạn (CRUD).
*   `/api/rooms`: Quản lý phòng.
*   `/api/bookings`: Hệ thống đặt phòng.
*   `/api/reviews`: Hệ thống đánh giá.

## 5. Mô Hình Dữ Liệu (Database Models)
Các Schema đã được định nghĩa đầy đủ trong `src/models/`:
1.  **User**: Thông tin người dùng.
2.  **Hotel**: Thông tin khách sạn.
3.  **Room**: Thông tin phòng.
4.  **Booking**: Đơn đặt phòng.
5.  **Review**: Đánh giá.
6.  **Transaction**: Giao dịch.
7.  **Revenue**: Doanh thu.
8.  **OTPVerification**: Mã OTP.
9.  **PendingRegistration**: Đăng ký chờ duyệt.
10. **UserActivity**: Log hoạt động.
