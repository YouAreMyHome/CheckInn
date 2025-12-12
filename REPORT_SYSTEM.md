# Báo Cáo Tổng Quan Hệ Thống CheckInn

## 1. Giới Thiệu Chung
**CheckInn** là một hệ thống đặt phòng khách sạn toàn diện, được xây dựng theo kiến trúc **Monorepo**. Hệ thống cung cấp các giải pháp cho nhiều đối tượng người dùng khác nhau bao gồm: Khách hàng (Customer), Quản lý khách sạn (Hotel Manager), và Quản trị viên hệ thống (Admin).

Mã nguồn hiện tại (Current State) cho thấy dự án đang tập trung phát triển theo hướng tích hợp (Integrated) thay vì chia nhỏ thành nhiều micro-services/micro-frontends rời rạc như mô tả trong tài liệu cũ.

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

### Điểm Khác Biệt So Với Tài Liệu Cũ:
*   **Thực tế:** Thư mục `apps/` chỉ chứa `api-server` và `frontend`. Ứng dụng `frontend` đóng vai trò là một "Super App", chứa logic cho cả Admin, Customer và Hotel Manager bên trong thư mục `src/portals/`.
*   **Tài liệu cũ (README):** Mô tả việc tách rời thành `admin-dashboard` (port 3002), `partner-portal` (port 3003), `client-app` (port 3000), v.v. Tuy nhiên, cấu trúc file hiện tại cho thấy chúng đã được gộp nhất vào `apps/frontend`.

## 3. Công Nghệ Sử Dụng (Tech Stack)

### Backend (`apps/api-server`)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (sử dụng Mongoose ODM)
*   **Caching/Rate Limiting:** Redis
*   **Authentication:** JWT (JSON Web Tokens)
*   **Media Storage:** Cloudinary
*   **Email:** Nodemailer

### Frontend (`apps/frontend`)
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **UI Library:** Ant Design (AntD), Tailwind CSS
*   **State/Data Management:** React Query (@tanstack/react-query)
*   **Routing:** React Router v7
*   **Icons:** Lucide React

## 4. Luồng Hoạt Động Chính
1.  **Người dùng (User)** truy cập vào ứng dụng Frontend.
2.  Dựa trên đường dẫn (Route) và quyền hạn (Role), hệ thống sẽ hiển thị giao diện tương ứng (Portal):
    *   `/admin`: Giao diện quản trị hệ thống.
    *   `/partner` (hoặc hotel-manager): Giao diện cho chủ khách sạn.
    *   `/`: Giao diện đặt phòng cho khách hàng.
3.  **Frontend** giao tiếp với **Backend** thông qua RESTful API.
4.  **Backend** xử lý logic nghiệp vụ, truy vấn **Database** (MongoDB), lưu cache (Redis) nếu cần, và trả về kết quả.

## 5. Đánh Giá Hiện Trạng
*   **Ưu điểm:** Cấu trúc Monorepo giúp dễ dàng chia sẻ code (như `shared-utils`) và quản lý dependencies. Việc gộp Frontend giúp giảm chi phí vận hành (chỉ cần chạy 1 server frontend thay vì 3-4 cái).
*   **Mức độ hoàn thiện:**
    *   Backend: Có cấu trúc đầy đủ (MVC), nhiều Models chi tiết.
    *   Frontend: Đã chia tách rõ ràng các phân hệ (portals), sử dụng công nghệ mới nhất (React 19, Vite).
