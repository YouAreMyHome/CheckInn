# Báo Cáo Chi Tiết Frontend

## 1. Thông Tin Chung
*   **Tên ứng dụng:** `frontend`
*   **Thư mục:** `apps/frontend/`
*   **Framework:** React 19 + Vite + React Router v7.
*   **UI:** Ant Design + Tailwind CSS.
*   **State Management:** React Query.

## 2. Cấu Trúc "Portals" (Phân Hệ)
Frontend được chia thành 3 phân hệ rõ rệt nằm trong `src/portals/`. Dưới đây là chi tiết các trang (Pages) và tính năng đã được triển khai:

### A. Customer Portal (Khách Hàng)
Dành cho người dùng cuối tìm kiếm và đặt phòng.
*   `HomePage`: Trang chủ.
*   `SearchPage`: Trang tìm kiếm và lọc khách sạn.
*   `HotelDetailPage`: Xem chi tiết thông tin khách sạn.
*   `BookingPage` & `BookingConfirmationPage`: Quy trình đặt phòng và xác nhận.
*   `ProfilePage`: Trang cá nhân người dùng.
*   `BookingsPage`: Lịch sử đặt phòng của khách.
*   `MultiStepRegisterPage`: Tính năng đăng ký tài khoản nhiều bước (nâng cao).
*   `LoginPage`, `RegisterPage`, `ForgotPasswordPage`: Các trang xác thực cơ bản.

### B. Hotel Manager Portal (Đối Tác)
Dashboard dành cho chủ khách sạn quản lý tài sản của mình.
*   `DashboardPage`: Tổng quan hoạt động.
*   `HotelsPage`: Danh sách khách sạn quản lý.
*   `RoomsPage`: Quản lý danh sách phòng.
*   `BookingsPage`: Quản lý đơn đặt phòng (Xác nhận/Hủy).
*   `GuestsPage`: Quản lý thông tin khách lưu trú.
*   `RevenuePage` & `AnalyticsPage`: Báo cáo doanh thu và phân tích số liệu.
*   `PartnerRegisterPage`: Trang đăng ký trở thành đối tác.
*   `SettingsPage`, `ApplicationStatusPage`: Cài đặt và trạng thái hồ sơ.

### C. Admin Portal (Quản Trị Viên)
Dashboard dành cho Super Admin quản lý toàn bộ hệ thống.
*   `DashboardPage` & `EnhancedDashboardPage`: Bảng điều khiển trung tâm (phiên bản nâng cao có thể chứa nhiều biểu đồ hơn).
*   `UsersPage`: Quản lý toàn bộ người dùng hệ thống.
*   `HotelsPage`: Duyệt và quản lý tất cả khách sạn trên hệ thống.
*   `VerificationsPage`: Trang xác minh danh tính/hồ sơ đối tác.
*   `ReviewsPage`: Quản lý đánh giá/bình luận (Moderation).
*   `ReportsPage`: Các báo cáo hệ thống.
*   `SecurityPage`: Cài đặt bảo mật hệ thống.
*   `SettingsPage`: Cấu hình chung.
*   `AdminLoginPage`, `AdminForgotPasswordPage`, `AdminResetPasswordPage`: Luồng xác thực riêng cho Admin.

## 3. Điểm Nổi Bật Về Kỹ Thuật
*   **React Router v7:** Sử dụng phiên bản router mới nhất.
*   **Lazy Loading:** Các Portal có vẻ được tách biệt tốt, hỗ trợ code splitting.
*   **Component Reuse:** Có các folder `components` riêng cho từng portal (VD: `admin/components`, `hotel-manager/components`) bên cạnh `shared/components`, giúp code gọn gàng và dễ bảo trì.
