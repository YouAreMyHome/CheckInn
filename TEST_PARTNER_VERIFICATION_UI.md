# 🔍 Hướng dẫn Test Partner Verification UI

## ✅ Checklist Trước Khi Test

### 1. **Restart Development Server**

```bash
# Stop server hiện tại (Ctrl+C nếu đang chạy)
# Sau đó start lại:
npm run dev
```

**Lý do:** Code backend đã thay đổi (removed `in_review`), cần reload để áp dụng changes.

---

### 2. **Clear Browser Cache**

- Mở DevTools (F12)
- Right-click vào nút Refresh
- Chọn **"Empty Cache and Hard Reload"**

**Lý do:** Frontend có thể cache JavaScript cũ.

---

## 🧪 Test Workflow

### **Bước 1: Login Admin**

1. Truy cập: `http://localhost:5173/admin/login`
2. Login với:
   - Email: `admin@checkinn.com`
   - Password: `AdminPass123!`

---

### **Bước 2: Vào Partner Verifications**

1. Click menu **"Partner Verifications"** hoặc truy cập: `http://localhost:5173/admin/partner-verifications`
2. Bạn sẽ thấy:
   - **Stats Card:** "Pending Review" = 1
   - **Partner Card:** Hotel Manager Test (manager@test.com)
   - **Status Badge:** Màu vàng "Pending Review"

---

### **Bước 3: Mở Chi Tiết Partner**

1. Click vào nút **"More" (ChevronDown icon)** trên partner card
2. Phần expanded sẽ hiển thị:
   - ✅ Business Information
   - ✅ Banking Information
   - ✅ **Nút "Review Application"** (màu xanh)

---

### **Bước 4: Test Review Modal**

1. Click nút **"Review Application"**
2. Modal sẽ mở với:
   - ✅ Applicant Information
   - ✅ Business Information
   - ✅ Banking Information
   - ✅ **2 nút ở footer:**
     - **"Reject"** (border red) - Bên trái
     - **"Approve Application"** (green) - Bên phải

---

### **Bước 5: Test Approve Flow**

1. Trong modal, click nút **"Approve Application"**
2. Kết quả mong đợi:
   - ✅ Modal đóng
   - ✅ Notification success: "Partner application approved"
   - ✅ Partner card biến mất khỏi "Pending Review" filter
   - ✅ Stats "Pending Review" giảm xuống 0
   - ✅ Stats "Verified" tăng lên 1
3. Đổi filter sang **"Verified"**:
   - ✅ Thấy partner với badge màu xanh "Verified"
   - ✅ **KHÔNG có nút "Review Application"** (đã approved rồi)

---

### **Bước 6: Test Reject Flow** (Nếu muốn test)

**Tạo partner mới để test:**

```bash
# Chạy script tạo partner test
cd E:\Project\CheckInn\apps\api-server
node script/create-test-partner.js
```

Sau đó:

1. Vào Partner Verifications, click "Review Application"
2. Click nút **"Reject"**
3. Form rejection reason sẽ xuất hiện:
   - ✅ Textarea để nhập lý do
   - ✅ Nút "Cancel"
   - ✅ Nút "Confirm Rejection" (red)
4. Nhập lý do (ví dụ: "Missing business license")
5. Click **"Confirm Rejection"**
6. Kết quả:
   - ✅ Modal đóng
   - ✅ Notification error: "Partner application rejected"
   - ✅ Stats "Rejected" tăng lên 1
7. Đổi filter sang **"Rejected"**:
   - ✅ Thấy partner với badge màu đỏ "Rejected"
   - ✅ Expanded view hiển thị rejection reason

---

## 🐛 Troubleshooting

### ❌ "Không thấy nút Review Application"

**Nguyên nhân có thể:**

1. **Partner không ở trạng thái `pending`**
   - Check database: Chạy script kiểm tra ở trên
   - Fix: Run migration script nếu cần

2. **Code cũ đang chạy**
   - Fix: Restart server (`npm run dev`)

3. **Browser cache**
   - Fix: Hard reload (Ctrl+Shift+R)

---

### ❌ "Modal không mở"

**Check Console (F12):**

```javascript
// Nếu có lỗi, check:
- selectedPartner có được set không?
- showReviewModal có true không?
```

**Fix:**
- Xem log trong React DevTools
- Check component state

---

### ❌ "API error khi approve/reject"

**Check Server Log:**

```bash
# Server log sẽ hiển thị lỗi chi tiết
# Ví dụ: "User validation failed..."
```

**Nguyên nhân thường gặp:**
1. Enum validation (đã fix ✅)
2. JWT token expired (login lại)
3. Permissions (phải là Admin)

---

## 📊 Current Database State

**Partner hiện tại:**
```
ID: 68d17a19ebaf8c19ef236615
Name: Hotel Manager Test
Email: manager@test.com
Status: pending ✅
```

**Sẵn sàng để test approve/reject flow!**

---

## ✅ Expected UI Components

### **Partner Card (Collapsed):**
```
┌─────────────────────────────────────────────────┐
│ 👤 Hotel Manager Test                         │
│ ✉️  manager@test.com                          │
│ 📞 +84123456789                               │
│ 📅 Applied Nov 7, 2025                        │
│                                                │
│                        🟡 Pending Review      │
│                        [More ▼]              │
└─────────────────────────────────────────────────┘
```

### **Partner Card (Expanded):**
```
┌─────────────────────────────────────────────────┐
│ ... (collapsed content) ...                     │
├─────────────────────────────────────────────────┤
│ 🏢 Business Information | 💰 Banking Info      │
│                                                │
│         [🛡️ Review Application]                │
└─────────────────────────────────────────────────┘
```

### **Review Modal:**
```
┌───────────────────────────────────────────────┐
│ Review Partner Application              [×]   │
├───────────────────────────────────────────────┤
│                                               │
│ 👤 Applicant Information                     │
│ 🏢 Business Information                      │
│ 💰 Banking Information                       │
│                                               │
├───────────────────────────────────────────────┤
│              [Reject]  [✓ Approve Application]│
└───────────────────────────────────────────────┘
```

---

**🚀 Ready to test! Restart server và test ngay!**
