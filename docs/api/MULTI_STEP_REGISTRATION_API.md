# 📝 MULTI-STEP REGISTRATION API DOCUMENTATION

## 🎯 Tổng quan

Quy trình đăng ký người dùng 5 bước với OTP verification cho CheckInn Hotel Booking Platform.

### 🔄 Quy trình

```
1. Nhập Email → 2. Xác thực OTP → 3. Đặt mật khẩu → 4. Nhập số điện thoại → 5. Hoàn tất
```

### ⏱️ Thời gian hết hạn

- **OTP**: 5 phút
- **Registration Session**: 30 phút
- **Resend OTP Cooldown**: 60 giây

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8888/api/register
```

---

## 1️⃣ BƯỚC 1: Gửi OTP đến Email

### Endpoint
```
POST /api/register/send-otp
```

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Mã OTP đã được gửi đến email của bạn",
  "data": {
    "email": "user@example.com",
    "expiresAt": "2024-10-14T00:55:00.000Z",
    "expiryMinutes": 5
  }
}
```

### Error Responses

**Email đã tồn tại (400)**
```json
{
  "success": false,
  "message": "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác."
}
```

**Resend quá nhanh (429)**
```json
{
  "success": false,
  "message": "Vui lòng đợi 45 giây trước khi gửi lại mã."
}
```

---

## 2️⃣ BƯỚC 2: Xác thực OTP

### Endpoint
```
POST /api/register/verify-otp
```

### Request Body
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Xác thực OTP thành công!",
  "data": {
    "email": "user@example.com",
    "nextStep": "password",
    "message": "Vui lòng đặt mật khẩu cho tài khoản"
  }
}
```

### Error Responses

**OTP sai (400)**
```json
{
  "success": false,
  "message": "Mã OTP không chính xác. Còn 4 lần thử.",
  "attemptsLeft": 4
}
```

**OTP hết hạn (400)**
```json
{
  "success": false,
  "message": "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới."
}
```

**Nhập sai quá nhiều (400)**
```json
{
  "success": false,
  "message": "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới."
}
```

---

## 3️⃣ BƯỚC 3: Đặt mật khẩu

### Endpoint
```
POST /api/register/set-password
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Password Requirements
- Tối thiểu 8 ký tự
- Có ít nhất 1 chữ hoa (A-Z)
- Có ít nhất 1 chữ thường (a-z)
- Có ít nhất 1 số (0-9)

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Mật khẩu đã được thiết lập thành công",
  "data": {
    "email": "user@example.com",
    "nextStep": "phone",
    "message": "Vui lòng nhập số điện thoại"
  }
}
```

### Error Responses

**Mật khẩu không khớp (400)**
```json
{
  "success": false,
  "message": "Mật khẩu xác nhận không khớp"
}
```

**Mật khẩu yếu (400)**
```json
{
  "success": false,
  "message": "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
}
```

---

## 4️⃣ BƯỚC 4: Nhập số điện thoại

### Endpoint
```
POST /api/register/set-phone
```

### Request Body
```json
{
  "email": "user@example.com",
  "phone": "0912345678"
}
```

### Phone Format
- Vietnamese phone numbers
- Pattern: `^(0|\+84)(3|5|7|8|9)[0-9]{8}$`
- Examples: `0912345678`, `+84912345678`

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Số điện thoại đã được thiết lập",
  "data": {
    "email": "user@example.com",
    "phone": "0912345678",
    "nextStep": "complete",
    "message": "Sẵn sàng hoàn tất đăng ký"
  }
}
```

### Error Responses

**Phone không hợp lệ (400)**
```json
{
  "success": false,
  "message": "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng."
}
```

**Phone đã được dùng (400)**
```json
{
  "success": false,
  "message": "Số điện thoại này đã được sử dụng. Vui lòng dùng số khác."
}
```

---

## 5️⃣ BƯỚC 5: Hoàn tất đăng ký

### Endpoint
```
POST /api/register/complete
```

### Request Body
```json
{
  "email": "user@example.com",
  "name": "Nguyễn Văn A"
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công! 🎉",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6789...",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0912345678",
      "role": "Customer",
      "emailVerified": true,
      "createdAt": "2024-10-14T00:50:00.000Z"
    },
    "message": "Chúc mừng! Tài khoản của bạn đã được tạo thành công."
  }
}
```

### Error Responses

**Session không đầy đủ (400)**
```json
{
  "success": false,
  "message": "Phiên đăng ký không đầy đủ. Vui lòng hoàn thành các bước trước."
}
```

**Email đã được đăng ký (400)**
```json
{
  "success": false,
  "message": "Email đã được đăng ký bởi người khác"
}
```

---

## 🔧 Helper Endpoint: Get Session Info

### Endpoint (Development Only)
```
GET /api/register/session/:email
```

### Example Request
```
GET /api/register/session/user@example.com
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Thông tin phiên đăng ký",
  "data": {
    "session": {
      "email": "user@example.com",
      "step": 3,
      "emailVerified": true,
      "password": "***HIDDEN***",
      "phone": "0912345678",
      "createdAt": 1697234567890,
      "verifiedAt": 1697234600000,
      "passwordSetAt": 1697234650000,
      "phoneSetAt": 1697234700000
    },
    "otp": {
      "hasOTP": false,
      "expiresAt": null,
      "attempts": 0,
      "remainingAttempts": 5,
      "isExpired": false
    }
  }
}
```

---

## 📧 Email Templates Gửi Tự Động

### OTP Verification Email

**Subject**: Mã xác thực OTP - CheckInn Hotel Booking

**Content**:
- Mã OTP 6 số (in đậm, lớn)
- Thời gian hết hạn: 5 phút
- Số lần thử tối đa: 5 lần
- Cảnh báo bảo mật

**Template File**: `src/views/emails/otp-verification.pug`

### Welcome Email

**Subject**: Chào mừng đến với CheckInn! 🎉

**Content**:
- Lời chào mừng
- Giới thiệu tính năng
- CTA: Khám phá khách sạn
- Tips sử dụng

**Template File**: `src/views/emails/welcome.pug`

---

## 🔐 Security Features

### OTP Security
- ✅ Random 6-digit numeric code
- ✅ 5 phút hết hạn
- ✅ Tối đa 5 lần thử
- ✅ 60 giây cooldown giữa các lần gửi
- ✅ Tự động xóa sau khi verify thành công

### Session Security
- ✅ 30 phút hết hạn
- ✅ Email-based isolation
- ✅ Step validation (không thể skip bước)
- ✅ Race condition protection
- ✅ Auto cleanup expired sessions

### Password Security
- ✅ Minimum 8 characters
- ✅ Uppercase + lowercase + number required
- ✅ Bcrypt hashing (auto by Mongoose middleware)
- ✅ Password match validation
- ✅ Never stored in plain text

---

## 🎯 Frontend Integration

### Installation
```bash
npm install antd framer-motion axios
```

### Component Usage
```jsx
import MultiStepRegisterPage from './pages/MultiStepRegisterPage';

// In App.jsx or Router
<Route path="/register" element={<MultiStepRegisterPage />} />
```

### Environment Variables
```env
VITE_API_URL=http://localhost:8888/api
```

---

## 🧪 Testing

### Manual Testing Flow

#### 1. Test Email Step
```bash
curl -X POST http://localhost:8888/api/register/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### 2. Check Email & Get OTP Code
Check console logs for OTP code:
```
[OTP] Created for test@example.com: 123456 (expires in 5m)
```

#### 3. Test OTP Verification
```bash
curl -X POST http://localhost:8888/api/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

#### 4. Test Set Password
```bash
curl -X POST http://localhost:8888/api/register/set-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","confirmPassword":"SecurePass123"}'
```

#### 5. Test Set Phone
```bash
curl -X POST http://localhost:8888/api/register/set-phone \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"0912345678"}'
```

#### 6. Test Complete Registration
```bash
curl -X POST http://localhost:8888/api/register/complete \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Nguyen Van A"}'
```

### Automated Tests (TODO)
```javascript
// tests/registration.test.js
describe('Multi-Step Registration', () => {
  it('should complete full registration flow', async () => {
    // Test implementation
  });
  
  it('should reject invalid OTP', async () => {
    // Test implementation
  });
  
  it('should enforce resend cooldown', async () => {
    // Test implementation
  });
});
```

---

## 📊 Monitoring & Logs

### Console Logs
```
[OTP] Created for user@example.com: 123456 (expires in 5m)
[OTP] Verified successfully for user@example.com
[Registration] OTP sent to user@example.com
[Registration] Completed for user@example.com
[Registration] Cleaned up 3 expired sessions
```

### Email Logs
```
[Email] Sent otp-verification to user@example.com: <message-id>
[Email] Sent welcome to user@example.com: <message-id>
```

---

## 🚀 Production Considerations

### Scalability
- [ ] Replace in-memory storage with **Redis**
- [ ] Implement distributed rate limiting
- [ ] Add request queuing for email sending
- [ ] Use Redis TTL for automatic cleanup

### Security Enhancements
- [ ] Add reCAPTCHA on email step
- [ ] Implement IP-based rate limiting
- [ ] Add device fingerprinting
- [ ] Enable SMS OTP as backup option

### Monitoring
- [ ] Add metrics for each step completion
- [ ] Track OTP failure rates
- [ ] Monitor email delivery success
- [ ] Alert on suspicious patterns

### Performance
- [ ] Cache email templates
- [ ] Optimize email sending (queue system)
- [ ] Add CDN for static assets
- [ ] Implement database indexing

---

## 📞 Support

Nếu có vấn đề trong quá trình đăng ký:
- Email: support@checkinn.com
- Hotline: 1900-xxxx
- Documentation: /api/docs

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2024  
**Author**: CheckInn Team
