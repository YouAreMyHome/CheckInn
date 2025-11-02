# 🎨 Frontend Documentation

Complete frontend development documentation for CheckInn portal-based architecture.

---

## 📋 Contents

### Import Alias System
- **[IMPORT_ALIAS_IMPLEMENTATION.md](./IMPORT_ALIAS_IMPLEMENTATION.md)** - Complete setup guide
- **[IMPORT_ALIAS_SYSTEM.md](./IMPORT_ALIAS_SYSTEM.md)** - Detailed documentation
- **[IMPORT_ALIAS_QUICK_REF.md](./IMPORT_ALIAS_QUICK_REF.md)** - Quick reference cheat sheet ⭐

### UI/UX Features
- **[UI_NOTIFICATIONS_IMPLEMENTATION.md](./UI_NOTIFICATIONS_IMPLEMENTATION.md)** - Toast notification system
- **[LOGIN_UX_COMPLETE.md](./LOGIN_UX_COMPLETE.md)** - Enhanced login experience
- **[ENHANCED_LOGIN_UX_SUMMARY.md](./ENHANCED_LOGIN_UX_SUMMARY.md)** - Login improvements summary

### Registration System
- **[REGISTRATION_COMPLETE.md](./REGISTRATION_COMPLETE.md)** - Complete registration flow
- **[MULTI_STEP_REGISTRATION_SUMMARY.md](./MULTI_STEP_REGISTRATION_SUMMARY.md)** - Multi-step wizard
- **[REGISTER_PAGE_REPLACEMENT.md](./REGISTER_PAGE_REPLACEMENT.md)** - Page refactoring
- **[TEST_REGISTRATION_GUIDE.md](./TEST_REGISTRATION_GUIDE.md)** - Testing guide

---

## 🏗️ Architecture

### Portal Structure
```
apps/frontend/src/
├── portals/
│   ├── customer/      (/ routes)
│   ├── admin/         (/admin/* routes)
│   └── hotel-manager/ (/partner/* routes)
└── shared/
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```

### Import Alias Patterns
```javascript
// ✅ Use aliases (ALWAYS)
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common/Button';
import { api } from '@services/api';

// ❌ Don't use relative imports
import { useAuth } from '../../../shared/hooks/useAuth';
```

---

## 🎯 Key Features

### Multi-Portal Architecture
- **Customer Portal**: Booking flow for end users
- **Admin Portal**: User and hotel management
- **Partner Portal**: Hotel manager tools

### Shared Resources
- Components: `@components/` - Cross-portal UI components
- Hooks: `@hooks/` - Reusable React hooks
- Services: `@services/` - API integration layer
- Utils: `@utils/` - Helper functions

### State Management
- TanStack Query for server state
- Context API for global state (Auth, Notification)
- Local state with useState/useReducer

---

## 📚 Related Documentation

- **Architecture**: ../architecture/MULTI_PORTAL_README.md
- **Component Library**: ../architecture/COMPONENT_LIBRARY.md
- **Setup Guide**: ../guides/SETUP_GUIDE.md
- **Integration**: ../guides/FRONTEND_INTEGRATION_GUIDE.md

---

Last Updated: November 2, 2025
