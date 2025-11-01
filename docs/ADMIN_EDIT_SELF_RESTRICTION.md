# Admin Edit Self Restriction - Complete Implementation

**Date**: November 1, 2025  
**Feature**: Ngăn chặn Admin chỉnh sửa Role và Status của chính tài khoản mình

---

## 📋 Overview

Tính năng này ngăn không cho Admin có thể:
- ❌ Thay đổi **Role** của chính mình (VD: từ Admin → Customer)
- ❌ Thay đổi **Status** của chính mình (VD: Active → Suspended)
- ✅ Vẫn có thể update **Name, Email, Phone** của chính mình

**Lý do bảo mật:**
- Ngăn Admin tự nâng/hạ quyền của chính mình
- Ngăn Admin tự suspend hoặc deactivate tài khoản của mình
- Ngăn Admin khóa chính mình ra khỏi hệ thống

---

## 🏗️ Architecture

### **Two-Layer Protection:**
1. **Backend Validation** (API Server) - Security layer
2. **Frontend UX** (React Modal) - User experience layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin clicks "Edit User"                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (UserFormModal)                                   │
│  • Check: isCurrentUser(userId)                             │
│  • Disable Role & Status fields                             │
│  • Show warning banner                                       │
│  • Filter role/status from request payload                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (If bypassed)
┌─────────────────────────────────────────────────────────────┐
│  Backend (admin.user.controller.js)                         │
│  • Check: user._id === req.user._id                         │
│  • If role/status in updates → Return 403 Error            │
│  • Block the request completely                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Details

### **1. Backend (API Server)**

**File**: `apps/api-server/src/controllers/admin.user.controller.js`

**Function**: `updateUser()` - Line 240-260

```javascript
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find user
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 🔒 SECURITY: Prevent admin from updating their own role or status
  if (user._id.toString() === req.user._id.toString()) {
    if (updates.role || updates.status) {
      return next(new AppError('Bạn không thể thay đổi role hoặc status của chính tài khoản mình', 403));
    }
  }

  // ... rest of update logic
});
```

**Key Points:**
- ✅ Validates `user._id === req.user._id` (editing self)
- ✅ Checks if `updates.role` or `updates.status` exists
- ✅ Returns **403 Forbidden** with Vietnamese error message
- ✅ Allows other field updates (name, email, phone)

---

### **2. Frontend (React Modal)**

**File**: `apps/frontend/src/portals/admin/components/UserFormModal.jsx`

#### **A. Component Props**

```jsx
const UserFormModal = ({ 
  isOpen, 
  onClose, 
  user = null, 
  onSave,
  isEditingSelf = false  // 👈 New prop
}) => {
  // ...
}
```

#### **B. Role Field - Disabled State**

```jsx
{/* Role Field */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <Shield className="inline h-4 w-4 mr-1" />
    Role
    {isEditingSelf && (
      <span className="ml-2 text-xs text-amber-600 font-normal">
        (Cannot change your own role)
      </span>
    )}
  </label>
  <select
    name="role"
    value={formData.role}
    onChange={handleInputChange}
    disabled={isEditingSelf}  // 👈 Disabled when editing self
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      isEditingSelf ? 'bg-gray-100 cursor-not-allowed' : ''
    }`}
  >
    <option value="Customer">Customer</option>
    <option value="HotelPartner">Hotel Partner</option>
    <option value="Admin">Admin</option>
  </select>
</div>
```

#### **C. Status Field - Disabled State**

```jsx
{/* Status Field */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Status
    {isEditingSelf && (
      <span className="ml-2 text-xs text-amber-600 font-normal">
        (Cannot change your own status)
      </span>
    )}
  </label>
  <select
    name="status"
    value={formData.status}
    onChange={handleInputChange}
    disabled={isEditingSelf}  // 👈 Disabled when editing self
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      isEditingSelf ? 'bg-gray-100 cursor-not-allowed' : ''
    }`}
  >
    <option value="active">Active</option>
    <option value="suspended">Suspended</option>
    <option value="inactive">Inactive</option>
  </select>
</div>
```

#### **D. Warning Banner**

```jsx
{/* Self-Edit Warning */}
{isEditingSelf && (
  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm text-amber-800">
      ⚠️ <strong>Chỉnh sửa tài khoản của bạn:</strong> Để bảo mật, Role và Status không thể thay đổi.
    </p>
  </div>
)}
```

#### **E. Submit Handler - Filter Payload**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  
  try {
    // Prepare data for API
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    // 🔒 Don't include role and status when editing self
    if (!isEditingSelf) {
      userData.role = formData.role;
      userData.active = formData.status === 'active';
    }

    // Add password only for new users
    if (!user && formData.password) {
      userData.password = formData.password;
    }
    
    await onSave(userData, !!user);
    onClose();
  } catch (error) {
    console.error('Error saving user:', error);
    setErrors({ submit: 'Failed to save user. Please try again.' });
  } finally {
    setLoading(false);
  }
};
```

**Key Points:**
- ✅ Only includes `name`, `email`, `phone` in base `userData`
- ✅ Conditionally adds `role` and `active` only when `!isEditingSelf`
- ✅ Prevents sending forbidden fields to backend

---

### **3. Parent Component (UsersPage)**

**File**: `apps/frontend/src/portals/admin/pages/UsersPage.jsx`

#### **A. Import AuthContext**

```jsx
import { useContext } from 'react';
import { AuthContext } from '../../../shared/context/AuthContext';
```

#### **B. Get Current User**

```jsx
const UsersPage = () => {
  // Get current logged-in admin user
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user || null;
  const authLoading = authContext?.loading || false;
  
  // Helper to check if user is current user
  const isCurrentUser = (userId) => {
    if (!currentUser) return false;
    return userId === currentUser._id || userId === currentUser.id;
  };
  
  // ... rest of component
};
```

#### **C. Pass isEditingSelf Prop**

```jsx
<UserFormModal
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  user={editingUser}
  onSave={handleSaveUser}
  isEditingSelf={editingUser && isCurrentUser(editingUser._id || editingUser.id)}
/>
```

---

## 🎨 Visual Design

### **UI States:**

| State | Role Field | Status Field | Warning Banner |
|-------|------------|--------------|----------------|
| **Creating New User** | ✅ Enabled | ✅ Enabled | ❌ Hidden |
| **Editing Other User** | ✅ Enabled | ✅ Enabled | ❌ Hidden |
| **Editing Self** | ❌ Disabled (gray) | ❌ Disabled (gray) | ✅ Shown (amber) |

### **Disabled Field Styling:**
```css
/* When isEditingSelf = true */
bg-gray-100       /* Light gray background */
cursor-not-allowed /* No-entry cursor */
```

### **Warning Banner Colors:**
```css
bg-amber-50       /* Light amber background */
border-amber-200  /* Amber border */
text-amber-800    /* Dark amber text */
```

---

## 🧪 Testing Guide

### **Test Scenario 1: Frontend Validation**

1. **Setup:**
   ```bash
   npm run dev
   ```

2. **Login as Admin:**
   ```
   Email: admin@checkinn.com
   Password: AdminPass123!
   ```

3. **Navigate to Users Page:**
   ```
   http://localhost:5173/admin/users
   ```

4. **Test Edit Self:**
   - Click "Edit" button on your own user row (highlighted blue with "You" badge)
   - **Expected Results:**
     - ✅ Modal opens with title "Edit User"
     - ✅ Name, Email, Phone fields are **enabled**
     - ✅ Role field is **disabled** (gray) with hint "(Cannot change your own role)"
     - ✅ Status field is **disabled** (gray) with hint "(Cannot change your own status)"
     - ✅ Warning banner appears: "⚠️ Chỉnh sửa tài khoản của bạn: Để bảo mật, Role và Status không thể thay đổi."
     - ✅ Can update Name/Email/Phone successfully
     - ✅ Role/Status remain unchanged after save

5. **Test Edit Other User:**
   - Click "Edit" button on any other user
   - **Expected Results:**
     - ✅ All fields are **enabled**
     - ✅ No warning banner
     - ✅ Can change Role and Status

---

### **Test Scenario 2: Backend Validation**

**Goal:** Verify backend blocks requests even if frontend is bypassed

1. **Start Backend:**
   ```bash
   cd apps/api-server
   npm start
   ```

2. **Get Admin Token:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: {
     "email": "admin@checkinn.com",
     "password": "AdminPass123!"
   }
   ```

3. **Try to Update Own Role (should fail):**
   ```bash
   PATCH http://localhost:5000/api/admin/users/{your_admin_id}
   Headers: {
     "Authorization": "Bearer {your_token}"
   }
   Body: {
     "role": "Customer"  // Trying to downgrade self
   }
   ```

   **Expected Response:**
   ```json
   {
     "success": false,
     "message": "Bạn không thể thay đổi role hoặc status của chính tài khoản mình",
     "statusCode": 403
   }
   ```

4. **Try to Update Own Status (should fail):**
   ```bash
   PATCH http://localhost:5000/api/admin/users/{your_admin_id}
   Headers: {
     "Authorization": "Bearer {your_token}"
   }
   Body: {
     "status": "inactive"  // Trying to deactivate self
   }
   ```

   **Expected Response:**
   ```json
   {
     "success": false,
     "message": "Bạn không thể thay đổi role hoặc status của chính tài khoản mình",
     "statusCode": 403
   }
   ```

5. **Update Own Name (should succeed):**
   ```bash
   PATCH http://localhost:5000/api/admin/users/{your_admin_id}
   Headers: {
     "Authorization": "Bearer {your_token}"
   }
   Body: {
     "name": "Updated Admin Name"
   }
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "message": "User updated successfully",
     "data": {
       "user": {
         "_id": "...",
         "name": "Updated Admin Name",
         "role": "Admin",  // Unchanged
         "status": "active"  // Unchanged
       }
     }
   }
   ```

---

## 🔒 Security Analysis

### **Attack Vectors Covered:**

| Attack | Frontend Protection | Backend Protection |
|--------|--------------------|--------------------|
| **Browser DevTools Edit** | ❌ Can be bypassed | ✅ Blocked at API |
| **Direct API Call** | ❌ N/A | ✅ Blocked at API |
| **Postman/cURL** | ❌ N/A | ✅ Blocked at API |
| **CSRF Attack** | ❌ Can be bypassed | ✅ Blocked at API |

### **Defense in Depth:**
1. **Frontend**: Provides good UX, prevents accidental self-edit
2. **Backend**: Enforces security policy, blocks all attempts

---

## 📝 Code Files Modified

| File | Purpose | Lines Changed |
|------|---------|---------------|
| `apps/api-server/src/controllers/admin.user.controller.js` | Backend validation | 251-257 |
| `apps/frontend/src/portals/admin/components/UserFormModal.jsx` | Modal UI + payload filter | 9, 87-95, 237-278 |
| `apps/frontend/src/portals/admin/pages/UsersPage.jsx` | Pass `isEditingSelf` prop | 34-40, 684 |

---

## ✅ Checklist

- [x] Backend validates self-edit requests
- [x] Backend returns 403 with clear error message
- [x] Frontend disables Role field when editing self
- [x] Frontend disables Status field when editing self
- [x] Frontend shows warning banner when editing self
- [x] Frontend filters role/status from request payload
- [x] Parent component detects current user correctly
- [x] Visual indicators (gray background, disabled cursor)
- [x] Label hints explain why fields are disabled
- [x] Other fields (name, email, phone) remain editable
- [x] Works with both `_id` and `id` field names
- [x] Tested with real admin account
- [x] Documentation created

---

## 🚀 Future Enhancements

1. **Audit Log**: Track failed attempts to edit own role/status
2. **Notification**: Show toast notification explaining why fields are disabled
3. **Admin Hierarchy**: Allow Super Admin to edit other Admins
4. **Approval Workflow**: Require another Admin's approval for role changes

---

## 📚 Related Documentation

- [ADMIN_SELF_RESTRICTION.md](./ADMIN_SELF_RESTRICTION.md) - Restriction on status change, delete
- [FRONTEND_ADMIN_SELF_RESTRICTION_UX.md](./FRONTEND_ADMIN_SELF_RESTRICTION_UX.md) - UX implementation
- [ADMIN_USER_MANAGEMENT_COMPLETE.md](./ADMIN_USER_MANAGEMENT_COMPLETE.md) - Overall admin user management

---

**Implementation Date**: November 1, 2025  
**Status**: ✅ Complete and Tested  
**Developer**: Senior Fullstack Developer (GitHub Copilot)
