# 📧 Hướng dẫn Test Email Templates - CheckInn

## 🎯 Mục đích

Script này giúp bạn kiểm tra giao diện và nội dung của tất cả email templates trước khi deploy lên production.

## 📋 Danh sách Email Templates

1. **welcome** - Email chào mừng người dùng mới
2. **verify-email** - Email xác thực địa chỉ email
3. **otp-verification** - Email gửi mã OTP
4. **booking-confirmation** - Email xác nhận đặt phòng (giống voucher OTA)
5. **booking-cancelled** - Email thông báo hủy đặt phòng
6. **password-reset** - Email đặt lại mật khẩu

## 🚀 Cách sử dụng

### Bước 1: Cấu hình Email (.env)

Đảm bảo file `.env` có đầy đủ thông tin email:

```env
# Email Configuration
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Lưu ý**: Nếu dùng Gmail, bạn cần tạo App Password:
1. Vào https://myaccount.google.com/apppasswords
2. Tạo App Password mới
3. Copy password và paste vào `EMAIL_PASSWORD`

### Bước 2: Chạy test

#### Option 1: Test TẤT CẢ email templates (khuyên dùng)

```bash
# Từ folder root
npm run test:email:all

# Hoặc từ folder api-server
cd apps/api-server
node script/test-email-templates.js
```

Lệnh này sẽ gửi **6 email** đến `consauchetduoi@gmail.com`:
- ✅ Welcome
- ✅ Verify Email  
- ✅ OTP Verification
- ✅ Booking Confirmation
- ✅ Booking Cancelled
- ✅ Password Reset

#### Option 2: Test TỪNG email riêng lẻ

```bash
# Từ folder root
npm run test:email:single welcome
npm run test:email:single otp
npm run test:email:single booking

# Hoặc từ folder api-server
cd apps/api-server
node script/test-single-email.js welcome
node script/test-single-email.js verify
node script/test-single-email.js otp
node script/test-single-email.js booking
node script/test-single-email.js cancel
node script/test-single-email.js password
```

#### Option 3: Test kết nối email server

```bash
# Từ folder api-server
node script/test-email.js
```

## 📬 Kiểm tra kết quả

1. Mở email `consauchetduoi@gmail.com`
2. Kiểm tra Inbox (hoặc Spam/Junk nếu không thấy)
3. Xem trước giao diện các email
4. Kiểm tra:
   - ✅ Layout hiển thị đúng
   - ✅ Màu sắc (#007bff - blue)
   - ✅ Font chữ rõ ràng
   - ✅ Nút CTA hoạt động
   - ✅ Responsive trên mobile

## 🎨 Customize dữ liệu test

Nếu muốn thay đổi dữ liệu test, chỉnh sửa file:
```
apps/api-server/script/test-email-templates.js
```

Tìm đến phần `sampleData` và thay đổi theo ý muốn.

## 🐛 Troubleshooting

### Lỗi: "Connection failed"
- ✅ Kiểm tra thông tin `.env` có đúng không
- ✅ Nếu dùng Gmail, đảm bảo đã bật "Less secure app access" hoặc dùng App Password
- ✅ Kiểm tra firewall/antivirus có block SMTP không

### Lỗi: "Template not found"
- ✅ Đảm bảo tất cả file `.pug` tồn tại trong `apps/api-server/src/views/emails/`
- ✅ Kiểm tra tên file khớp với tên trong script

### Email vào Spam
- ✅ Đây là bình thường khi test
- ✅ Trong production, cần setup SPF, DKIM, DMARC records

## 📊 Output mẫu

```
╔════════════════════════════════════════════════════════╗
║   TEST EMAIL TEMPLATES - CheckInn Hotel Booking        ║
╚════════════════════════════════════════════════════════╝

📬 Email nhận test: consauchetduoi@gmail.com
📤 Email gửi: CheckInn Hotel Booking <your-email@gmail.com>

⏳ Bắt đầu kiểm tra kết nối...
✅ Kết nối email server thành công!

═══════════════════════════════════════════════════════
Gửi tất cả email templates...

📨 Đang gửi: welcome...
✅ welcome - Sent successfully!
   Message ID: <abc123@gmail.com>

📨 Đang gửi: verify-email...
✅ verify-email - Sent successfully!
   Message ID: <def456@gmail.com>

... (tiếp tục)

═══════════════════════════════════════════════════════
📊 KẾT QUẢ TỔNG HỢP:
═══════════════════════════════════════════════════════

1. ✅ welcome
2. ✅ verifyEmail
3. ✅ otpVerification
4. ✅ bookingConfirmation
5. ✅ bookingCancelled
6. ✅ passwordReset

───────────────────────────────────────────────────────
Thành công: 6/6
Thất bại: 0/6
───────────────────────────────────────────────────────

🎉 TẤT CẢ EMAIL ĐÃ ĐƯỢC GỬI THÀNH CÔNG!
📬 Vui lòng kiểm tra hộp thư: consauchetduoi@gmail.com
💡 Lưu ý: Email có thể vào folder Spam/Junk
```

## 🔧 Technical Details

### Email Standards tuân thủ:
- ✅ Table-based layout (tương thích Outlook, Gmail, Yahoo, etc.)
- ✅ Inline CSS (không phụ thuộc external stylesheets)
- ✅ Max-width 600px (chuẩn email width)
- ✅ Responsive design
- ✅ Plain text fallback

### Template Engine:
- **Pug** (trước đây là Jade)
- Variables được pass vào từ JavaScript
- Layout inheritance với `extends`

### Libraries:
- `nodemailer` - Gửi email
- `pug` - Template engine
- `html-to-text` - Convert HTML sang plain text

## 📝 Ghi chú

- Email test có prefix `[TEST]` trong subject để dễ phân biệt
- Mỗi email được gửi cách nhau 2 giây để tránh rate limit
- Tất cả dữ liệu đều là dummy data, không ảnh hưởng production

## 🎯 Next Steps

Sau khi test xong và hài lòng với giao diện:

1. ✅ Deploy lên production
2. ✅ Setup SPF/DKIM records cho domain
3. ✅ Integrate vào authentication flow
4. ✅ Add email tracking (optional)
5. ✅ Monitor email delivery rate

---

**Happy Testing! 🚀**
