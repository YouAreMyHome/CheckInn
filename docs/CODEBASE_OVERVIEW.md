# Tổng quan về Codebase của CheckInn

Chào mừng bạn đến với dự án CheckInn! Tài liệu này sẽ giúp bạn có cái nhìn tổng quan về cấu trúc codebase, các thành phần chính và cách để bắt đầu.

## 1. Giới thiệu chung

**CheckInn** là một hệ thống quản lý khách sạn đa cổng (Multi-Portal), được xây dựng theo kiến trúc monorepo sử dụng npm workspaces. Kiến trúc này cho phép quản lý nhiều ứng dụng và các gói thư viện chia sẻ trong cùng một repository.

- **Monorepo**: Toàn bộ code của các ứng dụng (frontend, backend) và các thư viện dùng chung đều nằm trong một repository duy nhất.
- **npm Workspaces**: Công cụ giúp quản lý các project con (gọi là workspaces), tối ưu hóa việc cài đặt dependencies và liên kết các project với nhau.

## 2. Cấu trúc thư mục chính

Cấu trúc dự án được chia thành hai phần chính: `apps` và `packages`.

```
CheckInn/
├── 📁 apps/         # Chứa các ứng dụng độc lập (frontend, backend)
├── 📁 packages/      # Chứa các gói thư viện có thể tái sử dụng
├── 📁 docs/         # Tài liệu dự án
├── 📁 scripts/      # Các script tự động hóa
└── ... (các file cấu hình khác)
```

### `apps/` - Các ứng dụng

Đây là nơi chứa code của các ứng dụng hoàn chỉnh. Mỗi thư mục con là một ứng dụng riêng biệt.

- **`api-server`**:
    - **Mục đích**: Backend chính của hệ thống, cung cấp REST API cho tất cả các ứng dụng frontend.
    - **Công nghệ**: Node.js, Express.js, MongoDB.
    - **Các thư mục quan trọng**:
        - `src/controllers`: Xử lý logic nghiệp vụ.
        - `src/models`: Định nghĩa cấu trúc dữ liệu (database schema).
        - `src/routes`: Định nghĩa các API endpoints.
        - `src/middlewares`: Các tầng xử lý trung gian (ví dụ: xác thực).

- **`client-app`** (dự kiến):
    - **Mục đích**: Cổng thông tin cho khách hàng đặt phòng.
    - **Công nghệ**: React, Vite, Tailwind CSS.

- **`admin-dashboard`** (dự kiến):
    - **Mục đích**: Trang quản trị cho phép quản lý toàn bộ hệ thống (khách sạn, người dùng, đặt phòng...).
    - **Công nghệ**: React, Ant Design, Tailwind CSS.

- **`partner-portal`** (dự kiến):
    - **Mục đích**: Cổng thông tin cho các đối tác khách sạn quản lý phòng, giá, và các booking.
    - **Công nghệ**: React, Material UI.

### `packages/` - Các gói chia sẻ

Đây là nơi chứa các đoạn code có thể tái sử dụng giữa nhiều ứng dụng để tránh lặp lại code và đảm bảo tính nhất quán.

- **`shared-ui`**:
    - **Mục đích**: Chứa các component UI chung như `Button`, `Card`, `Modal`, `Input`...
    - **Cách dùng**: Các ứng dụng frontend có thể import trực tiếp component từ gói này.

- **`shared-utils`**:
    - **Mục đích**: Chứa các hàm tiện ích chung như định dạng tiền tệ (`formatCurrency`), kiểm tra email (`validateEmail`), xử lý ngày tháng...

- **`api-client`**:
    - **Mục đích**: Một thư viện client tập trung để gọi API từ backend. Giúp quản lý các endpoint và đảm bảo an toàn kiểu dữ liệu (type safety).

- **`types`**:
    - **Mục đích**: Định nghĩa các kiểu dữ liệu (TypeScript types/interfaces) được sử dụng chung giữa backend và frontend (ví dụ: `User`, `Hotel`, `Booking`).

## 3. Hướng dẫn Bắt đầu Nhanh

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (cài đặt local hoặc sử dụng dịch vụ cloud)

### Các bước cài đặt

1.  **Clone repository**:
    ```bash
    git clone <repository-url>
    cd CheckInn
    ```

2.  **Cài đặt dependencies**:
    Lệnh này sẽ tự động cài đặt tất cả các gói cần thiết cho toàn bộ project (bao gồm tất cả các `apps` và `packages`).
    ```bash
    npm install
    ```
    *Lưu ý: `npm install` trong một project có workspaces sẽ tương đương với `npm run install:all`.*

3.  **Cấu hình môi trường**:
    - Sao chép file `.env.example` thành `.env`.
    - Cập nhật các biến môi trường trong file `.env`, đặc biệt là chuỗi kết nối tới MongoDB (`DATABASE_URL`).

4.  **Khởi chạy môi trường phát triển**:
    Lệnh này sẽ khởi động đồng thời `api-server` và tất cả các ứng dụng frontend.
    ```bash
    npm run dev
    ```

## 4. Các lệnh (scripts) quan trọng

Bạn có thể tìm thấy tất cả các lệnh trong file `package.json` ở thư mục gốc.

- `npm run dev`: Chạy tất cả các ứng dụng ở chế độ development.
- `npm run dev:api`: Chỉ chạy backend `api-server`.
- `npm run dev:client`: Chỉ chạy ứng dụng `client-app`.
- `npm run build`: Build tất cả các ứng dụng cho môi trường production.
- `npm test`: Chạy unit test trên toàn bộ project.
- `npm run lint`: Kiểm tra lỗi và định dạng code.

## 5. Tài liệu chi tiết

Để tìm hiểu sâu hơn, bạn có thể tham khảo các tài liệu trong thư mục `docs/`:

- **`docs/guides/SETUP_GUIDE.md`**: Hướng dẫn cài đặt chi tiết.
- **`docs/architecture/`**: Thông tin về kiến trúc hệ thống.
- **`docs/api/`**: Tài liệu về các API của backend.

Chúc bạn có một trải nghiệm làm việc hiệu quả với CheckInn!
