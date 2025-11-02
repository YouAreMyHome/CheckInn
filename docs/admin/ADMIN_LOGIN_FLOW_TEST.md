# 🔐 Admin Login Flow - Complete Test Guide

## Luồng đăng nhập Admin hoàn chỉnh

### 1. Setup Admin User
```bash
# Đảm bảo API server đang chạy
cd apps/api-server
npm run start

# Tạo admin user (terminal khác)
node scripts/create-admin-user.js
```

### 2. Test Login Flow

#### Bước 1: Truy cập trang login
- URL: `http://localhost:5173/admin/login`
- Giao diện: Glass-morphism design với background gradient

#### Bước 2: Nhập thông tin đăng nhập
```
Email: admin@checkinn.com
Password: Admin@123456
```

#### Bước 3: Xác nhận chuyển hướng
Sau khi đăng nhập thành công:
1. ✅ Hiển thị thông báo "Login successful! Redirecting..."
2. ✅ Chờ 1 giây 
3. ✅ Chuyển hướng đến `/admin` (Dashboard)
4. ✅ Kiểm tra role "Admin" qua ProtectedRoute
5. ✅ Render AdminLayout với DashboardPage

### 3. Dashboard Features

#### Thống kê tổng quan:
- 📊 Total Users: 2,847 (+12%)
- 🏨 Active Hotels: 156 (+8%) 
- ✅ Pending Verifications: 23 (+5)
- 🚨 Security Alerts: 3 (-2)

#### Navigation Menu:
- 🏠 Dashboard (default)
- 👥 Users Management
- 🏨 Hotels Management  
- ✅ Verifications
- 📊 Reports
- ⭐ Reviews
- 🔒 Security
- ⚙️ Settings

### 4. Security Features

#### Authentication:
- ✅ JWT Token validation
- ✅ Role-based access (Admin only)  
- ✅ Session management
- ✅ Remember Me functionality
- ✅ Audit logging

#### Route Protection:
- ✅ ProtectedRoute wrapper
- ✅ Automatic redirect to login if unauthorized
- ✅ Role validation middleware

### 5. Expected Flow
```
/admin/login → Login Form → Validate Credentials → Store JWT → Redirect to /admin → AdminLayout → DashboardPage
```

### 6. Error Handling
- ❌ Invalid credentials → Error message
- ❌ Network error → Connection error message  
- ❌ Token expired → Auto logout + redirect to login
- ❌ Insufficient permissions → Access denied

## ✅ Status: COMPLETE
Admin login flow hoàn toàn hoạt động với dashboard redirect!