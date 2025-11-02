# 🎯 Import Alias System - CheckInn Project

## Tổng quan

Hệ thống import alias giúp code clean hơn, dễ maintain và tránh relative path phức tạp như `../../../shared/components/`.

## Cấu hình

### 1. Vite Config (`apps/frontend/vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@components': resolve(__dirname, './src/shared/components'),
      '@context': resolve(__dirname, './src/shared/context'),
      '@hooks': resolve(__dirname, './src/shared/hooks'),
      '@services': resolve(__dirname, './src/shared/services'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
      '@portals': resolve(__dirname, './src/portals'),
      '@customer': resolve(__dirname, './src/portals/customer'),
      '@admin': resolve(__dirname, './src/portals/admin'),
      '@partner': resolve(__dirname, './src/portals/hotel-manager'),
    }
  }
})
```

### 2. JSConfig (`apps/frontend/jsconfig.json`)
VSCode IntelliSense support - tự động complete và jump to definition.

## 📋 Danh sách Aliases

| Alias | Path | Mục đích |
|-------|------|----------|
| `@` | `./src` | Root của source code |
| `@shared` | `./src/shared` | Shared resources cross-portal |
| `@components` | `./src/shared/components` | Shared components |
| `@context` | `./src/shared/context` | React contexts (Auth, Theme, etc) |
| `@hooks` | `./src/shared/hooks` | Custom React hooks |
| `@services` | `./src/shared/services` | API services (axios instances) |
| `@utils` | `./src/shared/utils` | Utility functions |
| `@assets` | `./src/assets` | Images, icons, fonts |
| `@styles` | `./src/styles` | Global styles, CSS |
| `@portals` | `./src/portals` | All portals |
| `@customer` | `./src/portals/customer` | Customer portal specific |
| `@admin` | `./src/portals/admin` | Admin portal specific |
| `@partner` | `./src/portals/hotel-manager` | Partner portal specific |

## 🎨 Cách sử dụng

### ❌ Trước (Relative paths)
```javascript
import { useNotification } from '../../../shared/components/NotificationProvider';
import { AuthContext } from '../../../shared/context/AuthContext';
import userService from '../services/userService';
import UserFormModal from '../components/UserFormModal';
```

### ✅ Sau (Import alias)
```javascript
import { useNotification } from '@components/NotificationProvider';
import { AuthContext } from '@context/AuthContext';
import userService from '@admin/services/userService';
import UserFormModal from '@admin/components/UserFormModal';
```

## 📂 Quy tắc sử dụng

### 1. Shared Resources (Cross-portal)
Luôn dùng `@` aliases cho shared code:
```javascript
// ✅ Good
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';
import { formatDate } from '@utils/format';

// ❌ Bad (relative path)
import { useAuth } from '../../../shared/hooks/useAuth';
```

### 2. Portal-specific Resources
Dùng portal alias cho code trong portal đó:
```javascript
// Trong Admin Portal
import DashboardCard from '@admin/components/DashboardCard';
import adminService from '@admin/services/adminService';

// Trong Customer Portal  
import HotelCard from '@customer/components/HotelCard';
import bookingService from '@customer/services/bookingService';

// Trong Partner Portal
import RevenueChart from '@partner/components/RevenueChart';
import partnerService from '@partner/services/partnerService';
```

### 3. Local Components (Same folder/sibling)
Dùng relative path cho local imports:
```javascript
// Trong admin/pages/UsersPage.jsx
import UserFormModal from '../components/UserFormModal'; // ✅ OK - cùng portal
// hoặc
import UserFormModal from '@admin/components/UserFormModal'; // ✅ Cũng OK

// Trong admin/components/UserTable/index.jsx
import UserRow from './UserRow'; // ✅ Good - cùng folder
import styles from './UserTable.module.css'; // ✅ Good - local file
```

## 🔄 Migration Guide

### Automatic Migration (Recommended)
Sử dụng Find & Replace trong VSCode với Regex:

1. **Shared Components:**
   - Find: `from ['"]\.\.\/\.\.\/\.\.\/shared\/components\/(.+)['"]`
   - Replace: `from '@components/$1'`

2. **Shared Context:**
   - Find: `from ['"]\.\.\/\.\.\/\.\.\/shared\/context\/(.+)['"]`
   - Replace: `from '@context/$1'`

3. **Shared Hooks:**
   - Find: `from ['"]\.\.\/\.\.\/\.\.\/shared\/hooks\/(.+)['"]`
   - Replace: `from '@hooks/$1'`

4. **Shared Services:**
   - Find: `from ['"]\.\.\/\.\.\/\.\.\/shared\/services\/(.+)['"]`
   - Replace: `from '@services/$1'`

### Manual Migration
1. Mở file cần migrate
2. Tìm các import với relative paths
3. Replace với alias tương ứng
4. Test lại để đảm bảo không lỗi

## 🚀 Benefits

1. **Cleaner Code:** Không còn `../../../` rối mắt
2. **Easier Refactoring:** Move file dễ dàng, không phải fix paths
3. **Better IntelliSense:** VSCode autocomplete và jump-to-definition
4. **Consistent Imports:** Team code theo cùng 1 chuẩn
5. **Scalability:** Dễ scale khi project lớn hơn

## ⚠️ Notes

- **Restart dev server** sau khi thay đổi `vite.config.js`
- **Reload VSCode** sau khi thay đổi `jsconfig.json` để IntelliSense update
- Alias chỉ hoạt động trong `apps/frontend/src/`, không dùng được ở ngoài
- Khi tạo file mới, luôn nghĩ xem nên dùng alias nào cho clean nhất

## 🧪 Testing

```bash
# Restart dev server
npm run dev

# Build để test production
npm run build
```

## 📝 Best Practices

1. **Ưu tiên alias cho shared code** (components, context, hooks, services)
2. **Portal-specific code** dùng `@admin`, `@customer`, `@partner`
3. **Local/sibling imports** có thể dùng relative path hoặc alias (tùy preference)
4. **Consistency trong team** - chọn 1 style và stick with it
5. **Document trong PR** khi migrate code sang alias system

---

✅ **Status:** Import alias system đã được implement và sẵn sàng sử dụng.
🔄 **Next Steps:** Migrate existing files theo hướng dẫn trên.
