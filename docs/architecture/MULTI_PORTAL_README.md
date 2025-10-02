# 🏨 CheckInn Multi-Portal System

## 📋 Tổng quan

CheckInn hiện đã được tách thành **3 ứng dụng frontend độc lập** chạy trên các cổng khác nhau:

- 👥 **Customer Portal** (Port 3000): Giao diện cho khách hàng
- 🏨 **Partner Portal** (Port 3001): Giao diện cho đối tác khách sạn
- ⚙️ **Admin Portal** (Port 3002): Giao diện quản trị hệ thống
- 🔧 **Backend API** (Port 5001): API server chung

## 🚀 Khởi chạy nhanh

### Cách 1: PowerShell Script (Khuyến nghị)

```powershell
.\start-multi-portal.ps1
```

### Cách 2: Batch File

```cmd
start-multi-portal.bat
```

### Cách 3: Chạy từng app riêng lẻ

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Customer App
cd customer-app && npm start

# Terminal 3: Partner App
cd partner-app && npm start

# Terminal 4: Admin App
cd admin-app && npm start
```

## 📁 Cấu trúc thư mục

```
CheckInn/
├── 📂 customer-app/          # Customer Portal (Port 3000)
│   ├── package.json
│   ├── public/
│   └── src/
├── 📂 partner-app/           # Partner Portal (Port 3001)
│   ├── package.json
│   ├── public/
│   └── src/
├── 📂 admin-app/             # Admin Portal (Port 3002)
│   ├── package.json
│   ├── public/
│   └── src/
├── 📂 shared/                # Shared resources cho cả 3 apps
│   ├── components/
│   ├── constants/
│   ├── services/
│   └── utils/
├── 📂 controllers/           # Backend controllers
├── 📂 models/               # Database models
├── 📂 routes/               # API routes
├── server.js                # Main backend server
├── start-multi-portal.ps1   # PowerShell startup script
└── start-multi-portal.bat   # Batch startup script
```

## 🔧 Cấu hình môi trường

### Customer App (Port 3000)

- **Mục đích**: Giao diện booking cho khách hàng
- **Theme**: Blue (#1890ff) - Thân thiện, tin cậy
- **Tính năng**: Tìm kiếm hotel, booking, lịch sử đặt phòng

### Partner App (Port 3001)

- **Mục đích**: Quản lý hotel và phòng cho đối tác
- **Theme**: Business Blue (#0066cc) - Chuyên nghiệp
- **Tính năng**: Quản lý hotel, phòng, booking, thống kê

### Admin App (Port 3002)

- **Mục đích**: Quản trị hệ thống tổng thể
- **Theme**: Admin Red (#cc0000) - Quyền lực, cảnh báo
- **Tính năng**: Monitor hệ thống, quản lý users, reports

## 🛠 Cài đặt dependencies

Mỗi app cần cài đặt dependencies riêng:

```bash
# Customer App
cd customer-app
npm install

# Partner App
cd partner-app
npm install

# Admin App
cd admin-app
npm install
```

## 🌐 URLs truy cập

| Portal   | URL                   | Mô tả              |
| -------- | --------------------- | ------------------ |
| Customer | http://localhost:3000 | Khách hàng booking |
| Partner  | http://localhost:3001 | Đối tác quản lý    |
| Admin    | http://localhost:3002 | Quản trị hệ thống  |
| API      | http://localhost:5001 | Backend services   |

## 📱 Responsive Design

Tất cả 3 portals đều được thiết kế responsive với:

- 📱 Mobile-first approach
- 🎨 Tailwind CSS utilities
- 🐜 Ant Design components
- ⚡ React 18 + Modern hooks

## 🔐 Authentication Flow

Mỗi portal có authentication riêng biệt:

```javascript
// Customer: /customer-app/src/pages/auth/
Login.jsx, Register.jsx

// Partner: /partner-app/src/pages/auth/
Login.jsx, Register.jsx

// Admin: /admin-app/src/pages/auth/
Login.jsx (Admin only)
```

## 🚦 Development vs Production

### Development Mode

- Hot reload cho cả 3 apps
- React DevTools
- Source maps enabled
- Console logs hiển thị

### Production Mode

```bash
# Build tất cả apps
cd customer-app && npm run build
cd ../partner-app && npm run build
cd ../admin-app && npm run build

# Serve with static server
npx serve -s customer-app/build -l 3000
npx serve -s partner-app/build -l 3001
npx serve -s admin-app/build -l 3002
```

## 🔄 Shared Resources

Thư mục `/shared` chứa:

- **Components**: UI components dùng chung
- **Constants**: Theme, config chung
- **Services**: API calls, utilities
- **Utils**: Helper functions, validations

Import trong từng app:

```javascript
import { theme } from "../shared/constants/theme";
import { apiService } from "../shared/services/api";
import { formatCurrency } from "../shared/utils/format";
```

## 🐛 Debugging & Troubleshooting

### Port conflicts

```bash
# Kiểm tra ports đang sử dụng
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :5001

# Kill process nếu cần
taskkill /PID <process_id> /F
```

### Common Issues

1. **"Module not found"**: Chạy `npm install` trong từng app
2. **"Port already in use"**: Kill process hoặc đổi port trong package.json
3. **"Proxy error"**: Kiểm tra backend server chạy trên port 5001

## 📊 Performance Monitoring

- React Query cho data caching
- Code splitting với React.lazy
- Bundle analysis với webpack-bundle-analyzer
- Performance metrics trong Admin portal

## 🤝 Contributing

Khi develop tính năng mới:

1. **Shared code** → `/shared/`
2. **Customer features** → `/customer-app/src/`
3. **Partner features** → `/partner-app/src/`
4. **Admin features** → `/admin-app/src/`

Follow coding standards trong `.github/copilot-instructions.md`

## 📞 Support

Nếu có vấn đề:

1. Check console logs trong từng app
2. Kiểm tra network requests trong DevTools
3. Xem backend logs trong terminal
4. Restart tất cả services
