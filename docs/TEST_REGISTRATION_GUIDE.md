# 🚀 HƯỚNG DẪN TEST TRANG ĐĂNG KÝ MỚI

## ✅ Checklist Trước Khi Test

- [x] Đã cài `antd` và `@ant-design/icons`
- [x] Route `/register` đã được update
- [x] Backend API đang chạy (port 8888)
- [x] Frontend đang chạy (port 3000)
- [x] Email service đã config (Gmail App Password)

---

## 🎯 TEST FLOW HOÀN CHỈNH

### 1️⃣ Start Services

```bash
# Terminal 1: Backend
cd e:\Project\CheckInn
npm run dev

# Terminal 2: Frontend (tab mới)
cd e:\Project\CheckInn
npm run dev
```

Đợi cả 2 services chạy thành công.

---

### 2️⃣ Mở Trang Đăng Ký

Truy cập: **http://localhost:3000/register**

Kiểm tra:
- ✅ Hiển thị form với Steps indicator
- ✅ Progress bar màu gradient
- ✅ Header "CheckInn" và "Đăng ký tài khoản mới"
- ✅ Bước 1 active (Email icon màu xanh)

---

### 3️⃣ BƯỚC 1: Nhập Email

#### Input
```
Email: test123@gmail.com
```

#### Actions
1. Nhập email vào input
2. Click button "Tiếp tục"

#### Expected Results
✅ Loading spinner hiện ra
✅ Backend console log: `[OTP] Created for test123@gmail.com: 123456`
✅ Message success: "Mã OTP đã được gửi đến email của bạn!"
✅ Chuyển sang Bước 2
✅ Progress bar: 40%

#### Kiểm tra Console Backend
```
[Registration] OTP sent to test123@gmail.com
[OTP] Created for test123@gmail.com: 123456 (expires in 5m)
[Email] Sent otp-verification to test123@gmail.com: <message-id>
```

**LẤY MÃ OTP TỪ CONSOLE!** (hoặc check email nếu đã config)

---

### 4️⃣ BƯỚC 2: Xác Thực OTP

#### Input
```
OTP: 123456  (lấy từ console log)
```

#### Actions
1. Nhập 6 số OTP
2. Click button "Xác thực"

#### Expected Results
✅ Loading spinner
✅ Backend verify OTP thành công
✅ Message: "Xác thực OTP thành công!"
✅ Chuyển sang Bước 3
✅ Progress bar: 60%

#### Test Countdown Timer
- Sau khi vào bước 2, đợi xem timer đếm ngược 60s
- Button "Gửi lại mã OTP" phải disable
- Sau 60s, button phải enable

#### Test Resend OTP
1. Đợi 60s
2. Click "Gửi lại mã OTP"
3. Check console có OTP mới
4. Timer reset về 60s

---

### 5️⃣ BƯỚC 3: Đặt Mật Khẩu

#### Input
```
Mật khẩu: TestPass123
Xác nhận mật khẩu: TestPass123
```

#### Actions
1. Nhập password
2. Nhập confirm password (phải giống)
3. Click "Tiếp tục"

#### Expected Results
✅ Validation hiển thị check marks
✅ Password match validation
✅ Message: "Mật khẩu đã được thiết lập thành công"
✅ Chuyển sang Bước 4
✅ Progress bar: 80%

#### Test Validation
**Mật khẩu yếu:**
```
Input: test123
Error: "Mật khẩu phải có ít nhất 8 ký tự"
```

**Không khớp:**
```
Password: TestPass123
Confirm: TestPass456
Error: "Mật khẩu không khớp!"
```

**Thiếu uppercase:**
```
Input: testpass123
Error: "Mật khẩu phải có chữ hoa, chữ thường và số!"
```

---

### 6️⃣ BƯỚC 4: Nhập Số Điện Thoại

#### Input
```
Số điện thoại: 0912345678
```

#### Actions
1. Nhập số điện thoại Việt Nam
2. Click "Tiếp tục"

#### Expected Results
✅ Format validation
✅ Message: "Số điện thoại đã được thiết lập"
✅ Chuyển sang Bước 5
✅ Progress bar: 100%

#### Test Validation
**Số không hợp lệ:**
```
Input: 0112345678
Error: "Số điện thoại không hợp lệ!"
```

**Số đã tồn tại:**
```
Input: 0912345678 (nếu DB có)
Error: "Số điện thoại này đã được sử dụng"
```

---

### 7️⃣ BƯỚC 5: Hoàn Tất Đăng Ký

#### Input
```
Họ và tên: Nguyễn Văn Test
```

#### Actions
1. Nhập tên đầy đủ
2. Click "Hoàn tất đăng ký 🎉"

#### Expected Results
✅ Loading spinner
✅ Backend tạo user trong database
✅ Success message: "🎉 Chúc mừng! Tài khoản đã được tạo thành công!"
✅ JWT token được lưu vào localStorage
✅ Welcome email được gửi (check console)
✅ **Auto redirect về `/login` sau 2 giây**

#### Backend Console
```
[Registration] Completed for test123@gmail.com
[Email] Sent welcome to test123@gmail.com
```

#### Check Database
Vào MongoDB và verify:
```javascript
db.users.findOne({ email: "test123@gmail.com" })

// Should return:
{
  name: "Nguyễn Văn Test",
  email: "test123@gmail.com",
  phone: "0912345678",
  role: "Customer",
  emailVerified: true,
  createdAt: ISODate(...)
}
```

---

## 🎨 TEST UI/UX

### Visual Checks
- [ ] Steps indicator hiển thị đúng 5 bước
- [ ] Icon cho mỗi bước hiển thị đúng
- [ ] Progress bar animate mượt
- [ ] Gradient background đẹp
- [ ] Form centered và responsive
- [ ] Button hover effects
- [ ] Input focus states
- [ ] Error messages màu đỏ

### Animation Tests
- [ ] Chuyển bước có fade animation
- [ ] Slide transition mượt
- [ ] Loading spinner
- [ ] Success message animation

### Responsive Tests
**Desktop (1920x1080):**
- Card width max 600px
- Centered perfectly
- All steps visible

**Tablet (768x1024):**
- Card responsive
- Steps description hidden
- Form inputs full width

**Mobile (375x667):**
- Card fill screen với padding
- Steps chỉ hiển thị icon
- Buttons full width

---

## 🐛 TEST ERROR CASES

### 1. Email đã tồn tại
```
Email: existing@user.com
Expected: "Email này đã được đăng ký. Vui lòng đăng nhập..."
```

### 2. OTP sai
```
OTP: 999999
Expected: "Mã OTP không chính xác. Còn 4 lần thử."
```

### 3. OTP hết hạn
```
Đợi 5 phút sau khi nhận OTP
Expected: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."
```

### 4. Nhập sai OTP 5 lần
```
Nhập sai liên tục 5 lần
Expected: "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới."
```

### 5. Session timeout
```
Refresh page giữa chừng
Expected: Session mất, phải bắt đầu lại
```

### 6. Network error
```
Tắt backend
Expected: Error message "Có lỗi xảy ra"
```

---

## 🔍 DEBUG HELPERS

### Check Session Info
```bash
curl http://localhost:8888/api/register/session/test123@gmail.com
```

Response:
```json
{
  "success": true,
  "data": {
    "session": {
      "email": "test123@gmail.com",
      "step": 3,
      "emailVerified": true,
      "password": "***HIDDEN***",
      "phone": "0912345678"
    },
    "otp": {
      "hasOTP": false
    }
  }
}
```

### Check Backend Logs
```bash
# Xem logs real-time
Get-Content "apps\api-server\logs\combined.log" -Tail 50 -Wait
```

### Check Email Logs
```bash
# Filter email activities
Get-Content "apps\api-server\logs\combined.log" | Select-String "Email"
```

---

## ✅ TEST CHECKLIST HOÀN CHỈNH

### Functional Tests
- [ ] Send OTP thành công
- [ ] Verify OTP đúng
- [ ] Verify OTP sai
- [ ] Resend OTP sau 60s
- [ ] Set password với validation
- [ ] Set phone với format check
- [ ] Complete registration
- [ ] JWT token saved
- [ ] Redirect to login
- [ ] Welcome email sent

### Security Tests
- [ ] Email uniqueness check
- [ ] OTP expiry (5 minutes)
- [ ] OTP max attempts (5 times)
- [ ] Resend cooldown (60 seconds)
- [ ] Password strength requirement
- [ ] Session expiry (30 minutes)
- [ ] Phone uniqueness check

### UX Tests
- [ ] Progress bar updates
- [ ] Steps indicator active state
- [ ] Loading states
- [ ] Success messages
- [ ] Error messages
- [ ] Form validation
- [ ] Countdown timer
- [ ] Smooth animations

### Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## 📊 Expected Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Email send | < 3s | Gmail SMTP |
| OTP verify | < 100ms | In-memory check |
| User creation | < 200ms | MongoDB write |
| Page load | < 1s | Frontend bundle |
| Step transition | < 300ms | Framer Motion |

---

## 🎉 Success Criteria

**Test PASS nếu:**
✅ Có thể complete toàn bộ 5 bước
✅ OTP gửi và verify thành công
✅ User được tạo trong database
✅ JWT token được lưu
✅ Redirect về login thành công
✅ Không có console errors
✅ UI/UX mượt mà
✅ Responsive trên mobile

**Test FAIL nếu:**
❌ Không nhận được OTP
❌ OTP verify không hoạt động
❌ Session bị mất giữa chừng
❌ User không được tạo
❌ Console có errors
❌ UI bị broken

---

## 📝 Bug Report Template

Nếu gặp bug, report theo format:

```markdown
**Bug Title:** [Mô tả ngắn gọn]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
...

**Actual Result:**
...

**Screenshots:**
[Attach screenshots]

**Console Errors:**
```
[Paste console errors]
```

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080
```

---

**Happy Testing! 🚀**

Nếu test pass, trang đăng ký mới đã sẵn sàng cho production!
