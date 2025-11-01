# Admin Self-Restriction Feature - Implementation Summary

## Mục tiêu
Ngăn chặn Admin thao tác trên chính tài khoản của mình để tránh các vấn đề bảo mật và sai sót như:
- Admin tự suspend/deactivate tài khoản mình → mất quyền truy cập
- Admin tự thay đổi role → giảm quyền hạn
- Admin tự xóa tài khoản → mất tài khoản quản trị

## Các ràng buộc đã triển khai

### 1. **Update User Status** (`PATCH /api/admin/users/:id/status`)
**File**: `apps/api-server/src/controllers/admin.user.controller.js`

```javascript
// Prevent admin from changing their own status
if (user._id.toString() === req.user._id.toString()) {
  return next(new AppError('Bạn không thể thay đổi trạng thái của chính tài khoản mình', 403));
}

// Prevent changing status of other admin users
if (user.role === 'Admin') {
  return next(new AppError('Không thể thay đổi trạng thái của tài khoản Admin khác', 403));
}
```

**Ràng buộc**:
- ❌ Admin không thể thay đổi status của chính mình
- ❌ Admin không thể thay đổi status của Admin khác

### 2. **Update User** (`PUT /api/admin/users/:id`)
**File**: `apps/api-server/src/controllers/admin.user.controller.js`

```javascript
// Prevent admin from updating their own role or status
if (user._id.toString() === req.user._id.toString()) {
  if (updates.role || updates.status) {
    return next(new AppError('Bạn không thể thay đổi role hoặc status của chính tài khoản mình', 403));
  }
}
```

**Ràng buộc**:
- ❌ Admin không thể thay đổi role của chính mình
- ❌ Admin không thể thay đổi status của chính mình qua endpoint update
- ✅ Admin có thể update các thông tin khác (name, email, phone, etc.)

### 3. **Delete User** (`DELETE /api/admin/users/:id`)
**File**: `apps/api-server/src/controllers/admin.user.controller.js`

```javascript
// Prevent admin from deleting their own account
if (user._id.toString() === req.user._id.toString()) {
  return next(new AppError('Bạn không thể xóa tài khoản của chính mình', 403));
}

// Prevent deleting other admin users
if (user.role === 'Admin') {
  return next(new AppError('Không thể xóa tài khoản Admin khác', 403));
}
```

**Ràng buộc**:
- ❌ Admin không thể xóa tài khoản của chính mình
- ❌ Admin không thể xóa tài khoản Admin khác

### 4. **Block/Unblock User** (`PATCH /api/users/:id/block`, `PATCH /api/users/:id/unblock`)
**File**: `apps/api-server/src/controllers/user.controller.js`

```javascript
// blockUser
if (id === req.user._id.toString()) {
  return next(new AppError('Bạn không thể chặn tài khoản của chính mình', 403));
}

// unblockUser
if (id === req.user._id.toString()) {
  return next(new AppError('Bạn không thể thao tác trên tài khoản của chính mình', 403));
}
```

**Ràng buộc**:
- ❌ Admin không thể block/unblock chính mình

## Test Coverage

### Test File
`apps/api-server/test-admin-self-restriction.js`

### Test Cases
1. ✅ **Change Own Status (Direct)** - Admin không thể thay đổi status qua endpoint `/status`
2. ✅ **Change Own Role** - Admin không thể thay đổi role qua endpoint update
3. ✅ **Delete Own Account** - Admin không thể xóa tài khoản của mình
4. ✅ **Update Own Status (via PUT)** - Admin không thể thay đổi status qua endpoint update

### Chạy Test
```bash
node apps/api-server/test-admin-self-restriction.js
```

**Expected Output**: All 4 tests pass ✅

## API Responses

### Success Response (Khi thao tác hợp lệ)
```json
{
  "success": true,
  "message": "User status updated to suspended",
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "status": "suspended"
    }
  }
}
```

### Error Response (Khi Admin thao tác trên chính mình)
```json
{
  "success": false,
  "message": "Bạn không thể thay đổi trạng thái của chính tài khoản mình",
  "statusCode": 403
}
```

## Security Benefits

1. **Prevents Self-Lockout**: Admin không thể vô tình khóa tài khoản mình
2. **Maintains Admin Access**: Đảm bảo luôn có ít nhất 1 admin active trong hệ thống
3. **Audit Trail**: Mọi thay đổi được log và track
4. **Role Protection**: Ngăn chặn privilege escalation/de-escalation

## Related Files

### Controllers
- `apps/api-server/src/controllers/admin.user.controller.js`
- `apps/api-server/src/controllers/user.controller.js`

### Routes
- `apps/api-server/src/routes/admin.user.routes.js`
- `apps/api-server/src/routes/user.routes.js`

### Middleware
- `apps/api-server/src/middlewares/auth.simple.middleware.js`
- `apps/api-server/src/middlewares/role.middleware.js`

### Tests
- `apps/api-server/test-admin-self-restriction.js`

## Notes

- Các ràng buộc này chỉ áp dụng khi Admin thao tác trên **chính tài khoản của mình**
- Admin vẫn có thể thao tác trên các tài khoản Customer/HotelManager/Partner khác
- Admin **không thể** thao tác trên tài khoản Admin khác (additional safety)
- Frontend UI nên disable các button/action tương ứng khi target user ID = current admin ID

## Future Enhancements

1. Frontend validation: Disable UI controls khi Admin xem profile của chính mình
2. Super Admin role: Tạo role cao hơn có thể quản lý Admin users
3. Multi-admin confirmation: Yêu cầu 2+ admin confirm khi thay đổi status của admin khác
4. Emergency unlock: Cơ chế khôi phục khi tất cả admin bị lock

---

**Status**: ✅ Implemented & Tested  
**Version**: 1.0.0  
**Date**: 2025-11-01
