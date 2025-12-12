# Báo Cáo Tổng Quan Hệ Thống CheckInn

## 1. Giới Thiệu Chung
**CheckInn** là một hệ thống đặt phòng khách sạn toàn diện, được xây dựng theo kiến trúc **Monorepo**. Hệ thống cung cấp các giải pháp cho nhiều đối tượng người dùng khác nhau bao gồm: Khách hàng (Customer), Quản lý khách sạn (Hotel Manager), và Quản trị viên hệ thống (Admin).

Mã nguồn hiện tại (Current State) cho thấy dự án đang tập trung phát triển theo hướng tích hợp (Integrated) thay vì chia nhỏ thành nhiều micro-services/micro-frontends rời rạc.

## 2. Kiến Trúc Hệ Thống (System Architecture)

Dự án được tổ chức theo cấu trúc **Monorepo**, quản lý nhiều ứng dụng và gói thư viện chia sẻ trong cùng một repository.

### Cấu Trúc Thư Mục Cấp Cao:
```
CheckInn/
├── apps/                  # Chứa các ứng dụng chính
│   ├── api-server/        # Backend API (Node.js/Express)
│   └── frontend/          # Single Page Application (React/Vite) chứa tất cả các portals
│
├── packages/              # Các thư viện dùng chung
│   └── shared-utils/      # Các hàm tiện ích (Utilities) chia sẻ
│
├── docs/                  # Tài liệu dự án
└── ... (files cấu hình gốc)
```

## 3. Công Nghệ Sử Dụng (Tech Stack)

### Backend (`apps/api-server`)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (sử dụng Mongoose ODM)
*   **Caching/Rate Limiting:** Redis
*   **Authentication:** JWT
*   **Media Storage:** Cloudinary
*   **Email:** Nodemailer

### Frontend (`apps/frontend`)
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **UI Library:** Ant Design (AntD), Tailwind CSS
*   **State/Data Management:** React Query (@tanstack/react-query)
*   **Routing:** React Router v7

## 4. Tình Trạng Hiện Tại (Updated)
*   **Frontend:** Cấu trúc phân hệ rõ ràng (Admin, Customer, Partner). Số lượng trang và tính năng đã được triển khai khá đầy đủ (Dashboard, Booking Flow, Auth).
*   **Backend:** Đã có code cho hầu hết các module (User, Hotel, Booking...), tuy nhiên qua kiểm tra file `routes/index.js`, **nhiều route quan trọng đang bị comment out (tạm khóa)**.
    *   Các route đang hoạt động: Auth, Register, Partner, Revenue.
    *   Các route đang chờ kích hoạt: Users, Hotels, Rooms, Bookings, Reviews.

## 5. Luồng Hoạt Động Chính
1.  **Người dùng (User)** truy cập vào ứng dụng Frontend.
2.  Dựa trên đường dẫn (Route), hệ thống sẽ hiển thị giao diện tương ứng (Portal).
3.  **Frontend** giao tiếp với **Backend** thông qua RESTful API.
4.  **Backend** xử lý logic và trả về kết quả.
