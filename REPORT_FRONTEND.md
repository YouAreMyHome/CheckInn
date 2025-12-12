# Báo Cáo Chi Tiết Frontend

## 1. Thông Tin Chung
*   **Tên ứng dụng:** `frontend`
*   **Thư mục:** `apps/frontend/`
*   **Loại:** Single Page Application (SPA)
*   **Công cụ Build:** Vite
*   **Framework:** React 19

## 2. Công Nghệ & Thư Viện Chính
Dựa trên `package.json`, Frontend sử dụng stack hiện đại nhất hiện nay:

### Core
*   **React 19 & React DOM 19:** Phiên bản mới nhất của React.
*   **Vite:** Build tool siêu tốc thay thế Webpack.
*   **React Router DOM (v7):** Quản lý điều hướng (Routing).

### UI & UX
*   **Tailwind CSS:** Framework CSS utility-first (phổ biến nhất hiện nay).
*   **Ant Design (antd):** Thư viện UI Component cao cấp (thường dùng cho Admin Dashboard/Enterprise apps).
*   **Framer Motion:** Thư viện xử lý Animation mượt mà.
*   **Lucide React:** Bộ icon nhẹ và đẹp.
*   **Clsx & Tailwind-merge:** Xử lý logic class CSS động.

### Data & State Management
*   **@tanstack/react-query:** Quản lý server state, caching, data fetching (thay thế cho Redux trong việc call API).
*   **Axios:** HTTP Client.

### Charts
*   **Recharts:** Vẽ biểu đồ (dùng cho dashboard thống kê).

## 3. Cấu Trúc Mã Nguồn (Folder Structure)
Frontend được tổ chức theo cấu trúc module hóa cao, chia theo "Portals" (Cổng thông tin):

```
src/
├── assets/           # Tài nguyên tĩnh (Images, Fonts)
├── components/       # Các UI components tái sử dụng chung (Global)
├── portals/          # TRÁI TIM CỦA FRONTEND - Chứa các phân hệ
│   ├── admin/          # Giao diện dành cho Quản trị viên
│   ├── customer/       # Giao diện dành cho Khách đặt phòng
│   └── hotel-manager/  # Giao diện dành cho Đối tác khách sạn
├── shared/           # Logic chia sẻ (Hooks, Contexts, Constants)
├── styles/           # Global CSS
└── App.jsx           # Component gốc, thiết lập Routing
```

## 4. Phân Tích Chi Tiết Các Portals (`src/portals/`)
Việc gom nhóm vào `portals` cho thấy chiến lược "Monolithic Frontend" - một ứng dụng duy nhất phục vụ nhiều vai trò, thay vì tách ra 3 domain khác nhau.

*   **Admin Portal (`src/portals/admin/`):**
    *   Dự kiến sử dụng Ant Design nhiều nhất cho các bảng biểu (Tables), Form quản lý.
    *   Chức năng: Duyệt khách sạn, quản lý người dùng, xem báo cáo doanh thu toàn hệ thống.

*   **Customer Portal (`src/portals/customer/`):**
    *   Giao diện tập trung vào trải nghiệm người dùng (UX), tìm kiếm, hình ảnh đẹp.
    *   Chức năng: Tìm kiếm khách sạn, xem chi tiết, đặt phòng, thanh toán, xem lịch sử.

*   **Hotel Manager Portal (`src/portals/hotel-manager/`):**
    *   Dashboard quản lý riêng cho từng khách sạn.
    *   Chức năng: Quản lý phòng, giá cả, xác nhận đơn đặt phòng, xem báo cáo doanh thu riêng.

## 5. Cấu Hình Build (Vite Config)
*   Sử dụng `@vitejs/plugin-react`.
*   Cấu hình Alias (đường dẫn tắt) để import dễ dàng (cần kiểm tra `vite.config.js` để biết chi tiết, ví dụ `@` trỏ về `src`).

## 6. Điểm Nổi Bật
*   **React 19:** Sử dụng phiên bản React mới nhất, có thể tận dụng các tính năng mới như Compiler (nếu được bật), Actions, v.v.
*   **React Query:** Cho thấy tư duy quản lý state hiện đại, tập trung vào đồng bộ hóa dữ liệu server thay vì client store phức tạp.
*   **Tailwind + Ant Design:** Sự kết hợp mạnh mẽ. Tailwind dùng cho layout/custom styling nhanh, Ant Design dùng cho các component phức tạp có sẵn (Datepicker, Table, Modal).
