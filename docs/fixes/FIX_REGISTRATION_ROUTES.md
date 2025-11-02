# 🔧 FIX: Registration Routes Issue

## ❌ VẤN ĐỀ

Route `/api/register/send-otp` không hoạt động vì:
- Mixing `express-validator` và Joi validation middleware
- Validation middleware conflict
- Routes không được register đúng

## ✅ GIẢI PHÁP

### Đã sửa: `registration.routes.js`

**TRƯỚC (Lỗi):**
```javascript
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation.middleware');

const validateEmail = [
  body('email').isEmail()...,
  validate, // ← Conflict!
];

router.post('/send-otp', validateEmail, ...);
```

**SAU (Fixed):**
```javascript
// Đơn giản hóa - validation trong controller
router.post('/send-otp', registrationController.sendOTPForRegistration);
router.post('/verify-otp', registrationController.verifyOTP);
router.post('/set-password', registrationController.setPassword);
router.post('/set-phone', registrationController.setPhone);
router.post('/complete', registrationController.completeRegistration);
```

### Tại sao fix này hoạt động?

1. **Controller đã có validation** - Registration controller đã validate data bên trong
2. **Tránh conflict** - Không còn mixing 2 validation libraries
3. **Đơn giản hơn** - Routes chỉ route, controller lo validation

---

## 🚀 TEST NGAY

### 1. Restart Backend
```bash
# Ctrl + C để stop backend hiện tại
# Rồi chạy lại:
cd apps/api-server
npm run dev
```

### 2. Test với PowerShell
```powershell
$body = @{ email = "test@example.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/register/send-otp" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến email của bạn",
  "data": {
    "email": "test@example.com",
    "expiresAt": "...",
    "expiryMinutes": 5
  }
}
```

### 3. Check Console
Backend console sẽ show:
```
[OTP] Created for test@example.com: 123456 (expires in 5m)
[Registration] OTP sent to test@example.com
```

### 4. Test Frontend
1. Hard refresh: `Ctrl + Shift + R`
2. Vào `http://localhost:3000/register`
3. Nhập email → Click "Tiếp tục"
4. **Should work now!** ✅

---

## 📊 Routes Summary

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/register/send-otp` | POST | ✅ Fixed |
| `/api/register/verify-otp` | POST | ✅ Fixed |
| `/api/register/set-password` | POST | ✅ Fixed |
| `/api/register/set-phone` | POST | ✅ Fixed |
| `/api/register/complete` | POST | ✅ Fixed |
| `/api/register/session/:email` | GET | ✅ Working |

---

## ✅ STATUS

**Routes:** ✅ SIMPLIFIED  
**Validation:** ✅ IN CONTROLLER  
**Backend:** 🔄 NEEDS RESTART  
**Ready:** ✅ AFTER RESTART

**Action Required:** Restart backend server!

---

**Fixed:** October 14, 2024  
**Status:** ✅ READY TO TEST (after restart)
