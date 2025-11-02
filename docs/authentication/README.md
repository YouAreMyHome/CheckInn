# 🔐 Authentication Documentation

Complete authentication and authorization system documentation for CheckInn.

---

## 📋 Contents

### Core Authentication
- **[JWT_AUTHENTICATION_COMPLETE.md](./JWT_AUTHENTICATION_COMPLETE.md)** - Complete JWT implementation with refresh tokens
- **[JWT_AUTHENTICATION_GUIDE.md](./JWT_AUTHENTICATION_GUIDE.md)** - Authentication flow and best practices

### Frontend Integration
- **[AUTHENTICATION_PAGES_SUMMARY.md](./AUTHENTICATION_PAGES_SUMMARY.md)** - Login/register pages implementation

### Middleware Documentation
See `../guides/middleware/` for:
- AUTH_MIDDLEWARE_OPTIMIZATION.md - Optimized auth middleware
- AUTH_QUICK_GUIDE.md - Quick reference guide

---

## 🔑 Key Concepts

### JWT Token System
- Access tokens (short-lived, 1-2 hours)
- Refresh tokens (long-lived, 7-30 days)
- Automatic token refresh on expiry
- Token blacklisting for logout

### Authentication Flow
1. User login → credentials validation
2. Generate JWT access + refresh tokens
3. Store tokens (localStorage + httpOnly cookies)
4. Auto-refresh when access token expires
5. Logout → invalidate tokens

### Protected Routes
```javascript
// Backend
router.get('/profile', protect, getProfile);
router.delete('/users/:id', protect, restrictTo('Admin'), deleteUser);

// Frontend
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```

---

## 🎯 Quick Links

- **Setup Auth**: JWT_AUTHENTICATION_GUIDE.md
- **Middleware**: ../guides/middleware/AUTH_QUICK_GUIDE.md
- **Frontend**: AUTHENTICATION_PAGES_SUMMARY.md
- **API**: ../api/API_DOCUMENTATION.md

---

Last Updated: November 2, 2025
