/**
 * User Management Controller for Admin
 * 
 * Handles all CRUD operations for user management
 * Only accessible by Admin role
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const User = require('../models/User.model');
const UserActivity = require('../models/UserActivity.model');
const { sendResponse } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendWelcomeEmail } = require('../utils/email');

/**
 * Helper function to log admin activity safely
 */
const logAdminActivity = async (req, activityType, description, targetUserId = null) => {
  try {
    await UserActivity.create({
      user: req.user._id,
      sessionId: req.sessionID || `admin-${Date.now()}`,
      activityType: 'page_view', // Use valid enum value
      description: `[ADMIN-${activityType}] ${description}`,
      targetUser: targetUserId,
      locationInfo: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
      },
      metadata: {
        adminAction: activityType,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.log(`Activity logging failed for ${activityType}:`, error.message);
    // Don't throw error - continue with main operation
  }
};

/**
 * Get all users with search, filtering and pagination
 * GET /api/admin/users
 */
exports.getUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    role = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  // Search by name or email (support both name and fullName)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role && role !== 'all') {
    filter.role = role;
  }
  
  // Filter by status
  if (status && status !== 'all') {
    filter.status = status;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute queries
  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('name fullName email phone role status statusUpdatedAt createdAt updatedAt lastActive avatar preferences location')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Log admin activity
  await logAdminActivity(req, 'users_list_view', `Viewed users list (page ${page})`);

  sendResponse(res, 200, true, 'Users retrieved successfully', {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    },
    filters: {
      search,
      role,
      status,
      sortBy,
      sortOrder
    }
  });
});

/**
 * Get single user by ID
 * GET /api/admin/users/:id
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log('🔍 GET Single User - ID:', id);
  console.log('🔍 Request URL:', req.originalUrl);
  console.log('🔍 Request method:', req.method);
  
  const user = await User.findById(id)
    .select('name fullName email phone role status statusUpdatedAt createdAt updatedAt lastActive avatar preferences location active')
    .populate('bookings', 'hotelId checkIn checkOut totalAmount status')
    .populate('reviews', 'hotelId rating comment createdAt');
    
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get user activity logs (last 10)
  const recentActivity = await UserActivity.find({ userId: id })
    .sort({ createdAt: -1 })
    .limit(10);

  // Log admin activity
  await logAdminActivity(req, 'user_detail_view', `Viewed user details: ${user.name} (${user.email})`, user._id);

  sendResponse(res, 200, true, 'User retrieved successfully', {
    user,
    recentActivity
  });
});

/**
 * Create new user
 * POST /api/admin/users
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, role, status, location, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !role) {
    return next(new AppError('Name, email, phone and role are required', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create user data
  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    role,
    status: status || 'active',
    location: location?.trim()
  };

  // Set password (use provided or generate temporary)
  if (password) {
    userData.password = password;
  } else {
    userData.password = Math.random().toString(36).slice(-8); // Temporary password
    userData.mustChangePassword = true;
  }

  // Create user
  const newUser = await User.create(userData);

  // Remove sensitive data from response
  newUser.password = undefined;
  newUser.refreshTokens = undefined;

  // Send welcome email (optional)
  try {
    await sendWelcomeEmail(newUser.email, {
      name: newUser.name,
      temporaryPassword: userData.password
    });
  } catch (emailError) {
    console.log('Failed to send welcome email:', emailError.message);
  }

  // Log admin activity
  await logAdminActivity(req, 'user_create', `Created new user: ${newUser.name} (${newUser.email})`, newUser._id);

  // Log user creation activity for the new user
  await logAdminActivity({
    user: { _id: newUser._id },
    sessionID: `system-${Date.now()}`,
    ip: req.ip,
    get: () => req.get('User-Agent')
  }, 'account_created', `Account created by admin: ${req.user.name}`);

  sendResponse(res, 201, true, 'User created successfully', { user: newUser });
});

/**
 * Update user
 * PATCH /api/admin/users/:id
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find user
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from updating their own role or status
  if (user._id.toString() === req.user._id.toString()) {
    if (updates.role || updates.status) {
      return next(new AppError('Bạn không thể thay đổi role hoặc status của chính tài khoản mình', 403));
    }
  }

  // Prevent updating sensitive fields directly
  delete updates.password;
  delete updates.refreshTokens;
  delete updates.passwordResetToken;
  delete updates.passwordResetExpires;

  // Validate email uniqueness if email is being updated
  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({ 
      email: updates.email.toLowerCase().trim(),
      _id: { $ne: id }
    });
    if (existingUser) {
      return next(new AppError('Email already in use by another user', 400));
    }
    updates.email = updates.email.toLowerCase().trim();
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).select('-password -passwordResetToken -passwordResetExpires -refreshTokens');

  // Log admin activity
  await logAdminActivity(req, 'user_update', `Updated user: ${updatedUser.name} (${updatedUser.email}) - Fields: ${Object.keys(updates).join(', ')}`, updatedUser._id);

  // Log user activity
  await logAdminActivity({
    user: { _id: updatedUser._id },
    sessionID: `system-${Date.now()}`,
    ip: req.ip,
    get: () => req.get('User-Agent')
  }, 'profile_updated', `Profile updated by admin: ${req.user.name} - Fields: ${Object.keys(updates).join(', ')}`);

  sendResponse(res, 200, true, 'User updated successfully', { user: updatedUser });
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find user
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deleting their own account
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Bạn không thể xóa tài khoản của chính mình', 403));
  }

  // Prevent deleting other admin users (safety check)
  if (user.role === 'Admin') {
    return next(new AppError('Không thể xóa tài khoản Admin khác', 403));
  }

  // Soft delete - mark as deleted instead of hard delete
  await User.findByIdAndUpdate(id, {
    status: 'deleted',
    deletedAt: new Date(),
    email: `deleted_${Date.now()}_${user.email}` // Prevent email conflicts
  });

  // Log admin activity
  await logAdminActivity(req, 'user_delete', `Deleted user: ${user.name} (${user.email})`, user._id);

  sendResponse(res, 200, true, 'User deleted successfully');
});

/**
 * Bulk delete users
 * DELETE /api/admin/users/bulk
 */
exports.bulkDeleteUsers = catchAsync(async (req, res, next) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return next(new AppError('User IDs array is required', 400));
  }

  // Find users to delete
  const users = await User.find({ _id: { $in: userIds } });
  
  // Filter out admin users (safety check)
  const safeToDelete = users.filter(user => 
    user.role !== 'Admin' || user._id.toString() === req.user._id.toString()
  );

  if (safeToDelete.length === 0) {
    return next(new AppError('No users available for deletion', 400));
  }

  // Soft delete users
  await User.updateMany(
    { _id: { $in: safeToDelete.map(u => u._id) } },
    {
      status: 'deleted',
      deletedAt: new Date(),
      $set: { email: { $concat: ["deleted_", { $toString: Date.now() }, "_", "$email"] } }
    }
  );

  // Log admin activity
  await logAdminActivity(req, 'users_bulk_delete', `Bulk deleted ${safeToDelete.length} users`);

  sendResponse(res, 200, true, `${safeToDelete.length} users deleted successfully`, {
    deletedCount: safeToDelete.length,
    skippedCount: userIds.length - safeToDelete.length
  });
});

/**
 * Update user status
 * PATCH /api/admin/users/:id/status
 */
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended', 'inactive'].includes(status)) {
    return next(new AppError('Invalid status. Must be active, suspended, or inactive', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from changing their own status
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('Bạn không thể thay đổi trạng thái của chính tài khoản mình', 403));
  }

  // Prevent changing status of other admin users (additional safety)
  if (user.role === 'Admin') {
    return next(new AppError('Không thể thay đổi trạng thái của tài khoản Admin khác', 403));
  }

  // Update status
  user.status = status;
  user.statusUpdatedAt = new Date();
  await user.save();

  // Log admin activity
  await logAdminActivity(req, 'user_status_update', `Changed status of ${user.name} to ${status}`, user._id);

  // Log user activity
  await logAdminActivity({
    user: { _id: user._id },
    sessionID: `system-${Date.now()}`,
    ip: req.ip,
    get: () => req.get('User-Agent')
  }, 'status_changed', `Account status changed to ${status} by admin`);

  sendResponse(res, 200, true, `User status updated to ${status}`, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      statusUpdatedAt: user.statusUpdatedAt
    }
  });
});

module.exports = {
  getUsers: exports.getUsers,
  getUser: exports.getUser,
  createUser: exports.createUser,
  updateUser: exports.updateUser,
  deleteUser: exports.deleteUser,
  bulkDeleteUsers: exports.bulkDeleteUsers,
  updateUserStatus: exports.updateUserStatus
};