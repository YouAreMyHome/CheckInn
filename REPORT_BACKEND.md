# Báo Cáo Chi Tiết Backend (API Server)

## 1. Thông Tin Chung
*   **Tên ứng dụng:** `api-server`
*   **Thư mục:** `apps/api-server/`
*   **Loại:** RESTful API Service
*   **Cổng mặc định (Port):** 5000 (hoặc 5001 tùy cấu hình)

## 2. Công Nghệ & Thư Viện Chính
Dựa trên `package.json`, Backend sử dụng các công nghệ sau:

### Core Framework
*   **Express:** Framework web server chính.
*   **Mongoose:** ODM để làm việc với MongoDB.
*   **Node.js:** Môi trường thực thi.

### Bảo Mật (Security)
*   **Helmet:** Thiết lập các HTTP headers bảo mật.
*   **Cors:** Xử lý Cross-Origin Resource Sharing.
*   **Bcryptjs:** Mã hóa mật khẩu (Hashing).
*   **Jsonwebtoken:** Tạo và xác thực token đăng nhập.
*   **Express-mongo-sanitize:** Ngăn chặn NoSQL Injection.
*   **Xss-clean:** Ngăn chặn tấn công XSS.
*   **Hpp:** Ngăn chặn HTTP Parameter Pollution.

### Hiệu Năng & Tiện Ích
*   **Redis & Rate-limit-redis:** Caching và giới hạn tốc độ request (Rate limiting).
*   **Compression:** Nén response (Gzip).
*   **Morgan & Winston:** Ghi log hệ thống (Logging).
*   **Cloudinary:** Lưu trữ và quản lý hình ảnh/media trên cloud.
*   **Nodemailer:** Gửi email (xác thực, thông báo).
*   **Multer:** Xử lý upload file (multipart/form-data).

## 3. Cấu Trúc Mã Nguồn (Folder Structure)
Backend tuân theo kiến trúc MVC (Model-View-Controller) phổ biến:

```
src/
├── config/           # Cấu hình hệ thống (DB, Cloudinary, Redis...)
├── controllers/      # Logic xử lý request, điều phối dữ liệu
├── middlewares/      # Các hàm trung gian (Auth, Error Handling, Validation)
├── models/           # Định nghĩa Schema dữ liệu MongoDB
├── routes/           # Định nghĩa các API endpoints
├── utils/            # Các hàm hỗ trợ (Helper functions)
└── views/            # Templates (ví dụ: email template dùng Pug)
```

## 4. Mô Hình Dữ Liệu (Database Models)
Hệ thống bao gồm các thực thể dữ liệu chính (`src/models/`):

1.  **User:** Quản lý thông tin người dùng (Admin, Partner, Customer).
2.  **Hotel:** Thông tin khách sạn (Tên, địa chỉ, mô tả, tiện ích...).
3.  **Room:** Thông tin phòng (Loại phòng, giá, tình trạng).
4.  **Booking:** Đơn đặt phòng (Ngày check-in/out, khách hàng, trạng thái thanh toán).
5.  **Review:** Đánh giá và bình luận của khách hàng.
6.  **Transaction:** Lịch sử giao dịch tài chính.
7.  **Revenue:** Theo dõi doanh thu.
8.  **OTPVerification:** Mã xác thực OTP (thường dùng cho verify email/SĐT).
9.  **PendingRegistration:** Đăng ký đang chờ duyệt (có thể dành cho Partner).
10. **UserActivity:** Log hoạt động của người dùng.

## 5. Quy Trình Xử Lý Request Điển Hình
1.  **Request** đi vào qua `server.js`.
2.  Đi qua các **Middlewares** bảo mật (Helmet, CORS, Rate Limit).
3.  Được định tuyến bởi **Routes** đến **Controller** tương ứng.
4.  Trong **Controller**:
    *   Validate dữ liệu đầu vào.
    *   Gọi **Model** để truy xuất/cập nhật Database.
    *   Xử lý logic nghiệp vụ.
5.  Trả về **Response** JSON cho client.

## 6. Scripts Bổ Trợ
Thư mục `script/` chứa các scripts dùng để test chức năng gửi email:
*   `test-email.js`
*   `test-email-templates.js`
*   `test-single-email.js`
