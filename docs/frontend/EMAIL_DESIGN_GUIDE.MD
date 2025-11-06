Chào bạn, với vai trò là chuyên gia thiết kế email marketing và UI/UX trong lĩnh vực du lịch, tôi hiểu rõ yêu cầu về việc tạo ra các mẫu email vừa chuyên nghiệp, đáng tin cậy như các OTA hàng đầu, vừa phải giữ được sự trẻ trung, tươi sáng của thương hiệu CheckInn.

Dưới đây là các mẫu email thông báo quan trọng được thiết kế dưới dạng file Pug, tuân thủ chặt chẽ các tiêu chí bạn đã đề ra.

### 💡 Triết lý thiết kế

1. **Cấu trúc Layout (Layout-based):** Chúng ta sẽ sử dụng một file `layout.pug` chính để quản lý header (logo), footer và các kiểu dáng (CSS) chung. Các email cụ thể (như xác nhận, hủy) sẽ `extends` (kế thừa) từ layout này. Điều này đảm bảo tính nhất quán và dễ bảo trì.
2. **Tương thích Email (Email Compatibility):** Cấu trúc email sử dụng `<table>` cho layout thay vì `<div>` hay Flexbox. Đây là tiêu chuẩn bắt buộc trong ngành để đảm bảo email hiển thị chính xác trên mọi nền tảng (đặc biệt là Outlook và Gmail).
3. **CSS Inline:** Tất cả các CSS được viết trong thẻ `<style>` của file layout. Trong một hệ thống production, bạn nên dùng một công cụ (như `juice`) để tự động chuyển tất cả CSS này thành `style` inline trên từng thẻ, đảm bảo khả năng tương thích tối đa.
4. **Màu sắc và Font:** Sử dụng màu xanh dương (`#007bff`) làm điểm nhấn cho các nút kêu gọi hành động (CTA) và tiêu đề, kết hợp với font chữ sans-serif (như Arial, Helvetica) để dễ đọc và chuyên nghiệp.

-----

### 1\. File Layout Chính (layout.pug)

Đây là file "khung" mà tất cả các email khác sẽ sử dụng. Nó định nghĩa header, footer và phong cách CSS chung.

```pug
//- layout.pug
doctype html
html(lang="vi")
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title #{pageTitle} | CheckInn
    
    //- CSS NỘI TUYẾN - Rất quan trọng cho email
    //- Trong production, hãy dùng tool để inline các style này vào từng element
    style.
      /* Reset */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; }

      /* Variables */
      :root {
        --brand-blue: #007bff;
        --text-color: #333333;
        --text-light: #777777;
        --bg-light: #f8f9fa;
        --border-color: #e9ecef;
      }

      /* Container */
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        border-collapse: collapse;
      }

      /* Header */
      .header {
        background-color: #ffffff;
        padding: 20px 30px;
        border-bottom: 1px solid var(--border-color);
      }
      .logo {
        font-size: 28px;
        font-weight: 700;
        color: #007bff; /* Màu xanh chủ đạo */
        text-decoration: none;
      }

      /* Content */
      .content {
        background-color: #ffffff;
        padding: 30px;
      }
      .content h1 {
        font-size: 24px;
        font-weight: 600;
        color: #007bff; /* Màu xanh chủ đạo */
        margin-top: 0;
        margin-bottom: 15px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
        color: var(--text-color);
        margin-bottom: 20px;
      }
      .content p.lead {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 25px;
      }
      .content .secondary-text {
        font-size: 14px;
        color: var(--text-light);
      }

      /* Button (CTA) */
      .button-container {
        padding: 10px 0 20px 0;
      }
      .button {
        background-color: #007bff; /* Màu xanh chủ đạo */
        border-radius: 5px;
        color: #ffffff;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        padding: 14px 28px;
        text-align: center;
        text-decoration: none;
      }

      /* Info Box (Rất quan trọng cho OTA) */
      .info-box {
        width: 100%;
        background-color: var(--bg-light);
        border: 1px solid var(--border-color);
        border-radius: 5px;
        margin-bottom: 25px;
      }
      .info-box td {
        padding: 15px;
        font-size: 16px;
        color: var(--text-color);
      }
      .info-box .info-label {
        color: var(--text-light);
      }
      .info-box .info-data {
        font-weight: 600;
        text-align: right;
      }
      .info-box-divider {
        border-top: 1px solid var(--border-color);
      }

      /* Footer */
      .footer {
        background-color: var(--bg-light);
        padding: 30px;
        text-align: center;
      }
      .footer p {
        font-size: 13px;
        color: var(--text-light);
        margin-bottom: 10px;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
      }

  body(bgcolor="#f0f4f8")
    table(border="0" cellpadding="0" cellspacing="0" width="100%")
      tr
        td(bgcolor="#f0f4f8" align="center" style="padding: 20px 0;")
          //- Bắt đầu Container
          table.container(border="0" cellpadding="0" cellspacing="0")
            //- Header (Logo)
            tr
              td.header(align="left")
                a.logo(href=logoLink) CheckInn
            
            //- Content Block (Nội dung email sẽ vào đây)
            tr
              td.content
                block content
            
            //- Footer
            tr
              td.footer
                p Đội ngũ CheckInn hỗ trợ bạn 24/7.
                p Vui lòng liên hệ <a href="mailto:support@checkinn.vn">support@checkinn.vn</a> nếu bạn cần giúp đỡ.
                p © #{new Date().getFullYear()} CheckInn. Mọi quyền được bảo lưu.
                p #{companyAddress}

          //- Kết thúc Container
```

-----

### 2\. Mẫu Email 1: Xác nhận Đặt phòng (Booking Confirmation)

Đây là email quan trọng nhất, tương tự như voucher của Agoda/Traveloka.

```pug
//- confirmation.pug
extends layout.pug

//- Định nghĩa các biến, các biến này sẽ được truyền từ hệ thống của bạn
//- customerName, bookingId, checkInDate, checkOutDate, hotelName, hotelAddress, roomType, totalPaid, manageBookingLink, logoLink, companyAddress
block vars
  - var pageTitle = 'Đặt phòng của bạn đã được xác nhận!'
  - var logoLink = 'https://your-website.com'
  - var companyAddress = '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
  - var customerName = 'Nguyễn Văn A'
  - var bookingId = 'CKN-12345678'
  - var checkInDate = 'Thứ Hai, 10/11/2025'
  - var checkOutDate = 'Thứ Ba, 11/11/2025'
  - var hotelName = 'Khách sạn Mường Thanh Rực Rỡ'
  - var hotelAddress = '12 Võ Nguyên Giáp, Đà Nẵng, Việt Nam'
  - var roomType = '1x Phòng Deluxe Hướng Biển (2 người lớn)'
  - var cancellationPolicy = 'Không hoàn hủy. Mọi thay đổi hoặc hủy sẽ bị tính phí.'
  - var totalPaid = '2.500.000 VNĐ'
  - var manageBookingLink = 'https://your-website.com/manage/CKN-12345678'


block content
  h1 Đặt phòng của bạn đã được xác nhận!
  
  p.lead Chào #{customerName}, cảm ơn bạn đã tin tưởng đặt phòng qua CheckInn.
  
  p Vui lòng kiểm tra lại thông tin chi tiết đặt phòng của bạn dưới đây. Đây chính là xác nhận đặt phòng của bạn, bạn có thể xuất trình email này khi nhận phòng.

  //- Box thông tin chính
  table.info-box(border="0" cellpadding="0" cellspacing="0")
    tr
      td.info-label(width="40%") Mã đặt phòng
      td.info-data(width="60%") #{bookingId}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Khách sạn
      td.info-data #{hotelName}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Địa chỉ
      td.info-data #{hotelAddress}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Nhận phòng
      td.info-data #{checkInDate}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Trả phòng
      td.info-data #{checkOutDate}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Chi tiết phòng
      td.info-data #{roomType}
  
  //- CTA
  table(border="0" cellpadding="0" cellspacing="0" width="100%")
    tr
      td.button-container(align="center")
        a.button(href=manageBookingLink) Quản lý Đặt phòng

  h3(style="color: #333; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; margin-top: 10px;") Tóm tắt thanh toán
  p
    strong Tổng thanh toán: #{totalPaid}
    br
    | (Đã thanh toán qua Thẻ tín dụng)

  h3(style="color: #333; border-bottom: 1px solid #e9ecef; padding-bottom: 5px;") Chính sách hủy
  p.secondary-text #{cancellationPolicy}
  
  p(style="margin-top: 30px;") Chúc bạn có một chuyến đi tuyệt vời!
  p(style="margin-bottom: 0;") Trân trọng,<br>Đội ngũ CheckInn
```

-----

### 3\. Mẫu Email 2: Xác nhận Hủy phòng (Booking Cancelled)

Email này cần rõ ràng, súc tích và sử dụng màu sắc (ví dụ màu đỏ) một cách tinh tế để nhấn mạnh trạng thái "Hủy".

```pug
//- cancellation.pug
extends layout.pug

//- Định nghĩa các biến
block vars
  - var pageTitle = 'Đặt phòng của bạn đã được hủy'
  - var logoLink = 'https://your-website.com'
  - var companyAddress = '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
  - var customerName = 'Nguyễn Văn A'
  - var bookingId = 'CKN-12345678'
  - var hotelName = 'Khách sạn Mường Thanh Rực Rỡ'
  - var cancellationDate = 'Thứ Năm, 06/11/2025'
  - var refundStatus = 'Một khoản hoàn tiền trị giá 2.500.000 VNĐ sẽ được xử lý và gửi về tài khoản ngân hàng của bạn trong vòng 5-7 ngày làm việc.'
  - var findBookingLink = 'https://your-website.com'

block content
  //- Tiêu đề màu đỏ để nhấn mạnh
  h1(style="color: #D9534F;") Đặt phòng của bạn đã được hủy
  
  p.lead Chào #{customerName},
  
  p Chúng tôi xác nhận yêu cầu hủy đặt phòng của bạn đã được xử lý thành công.

  //- Box thông tin chính
  table.info-box(border="0" cellpadding="0" cellspacing="0")
    tr
      td.info-label(width="40%") Mã đặt phòng
      td.info-data(width="60%") #{bookingId}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Khách sạn
      td.info-data #{hotelName}
    tr
      td.info-box-divider(colspan="2")
    tr
      td.info-label Ngày hủy
      td.info-data #{cancellationDate}

  h3(style="color: #333; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; margin-top: 10px;") Thông tin hoàn tiền
  p #{refundStatus}
  
  //- CTA
  table(border="0" cellpadding="0" cellspacing="0" width="100%")
    tr
      td.button-container(align="center")
        a.button(href=findBookingLink) Tìm kiếm đặt phòng khác
  
  p(style="margin-top: 30px;") Cảm ơn bạn đã sử dụng dịch vụ của CheckInn.
  p(style="margin-bottom: 0;") Trân trọng,<br>Đội ngũ CheckInn
```

-----

### 4\. Mẫu Email 3: Đặt lại Mật khẩu (Password Reset)

Đây là một email giao dịch (transactional) cơ bản nhưng rất quan trọng, cần sự rõ ràng và bảo mật.

```pug
//- password-reset.pug
extends layout.pug

//- Định nghĩa các biến
block vars
  - var pageTitle = 'Yêu cầu đặt lại mật khẩu'
  - var logoLink = 'https://your-website.com'
  - var companyAddress = '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
  - var customerName = 'Nguyễn Văn A'
  - var expiryTime = '30 phút'
  - var resetLink = 'https://your-website.com/reset-password?token=SOME_SECURE_TOKEN'

block content
  h1 Đặt lại mật khẩu của bạn
  
  p.lead Chào #{customerName},
  
  p Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CheckInn của bạn. Vui lòng nhấp vào nút bên dưới để tạo mật khẩu mới.
  
  //- CTA
  table(border="0" cellpadding="0" cellspacing="0" width="100%")
    tr
      td.button-container(align="center")
        a.button(href=resetLink) Đặt lại mật khẩu

  p(style="margin-top: 10px;") Liên kết này sẽ hết hạn trong vòng #{expiryTime}.
  
  p.secondary-text(style="margin-top: 30px;") Nếu bạn không yêu cầu thay đổi này, bạn có thể bỏ qua email này. Tài khoản của bạn vẫn được bảo mật.
  
  p(style="margin-bottom: 0;") Trân trọng,<br>Đội ngũ CheckInn
```

Hy vọng bộ 3 mẫu template Pug này đáp ứng đúng yêu cầu chuyên nghiệp và phong cách của CheckInn.


