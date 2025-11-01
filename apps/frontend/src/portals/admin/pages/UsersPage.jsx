import { useState, useEffect, useCallback, useContext } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  Download,
  Upload,
  AlertTriangle,
  Inbox,
  X
} from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import userService from '../services/userService';
import { useNotification } from '../../../shared/components/NotificationProvider';
import { AuthContext } from '../../../shared/context/AuthContext';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notify = useNotification();
  
  // Safely get current user from AuthContext
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user || null;
  const authLoading = authContext?.loading || false;
  
  console.log('UsersPage - AuthContext:', { currentUser, authLoading, authContext });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper function to check if user is current admin
  const isCurrentUser = (userId) => {
    if (!currentUser || !userId) return false;
    return currentUser._id === userId || currentUser.id === userId;
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };

      const response = await userService.getUsers(params);
      
      if (response.success) {
        const users = response.data.users || [];
        console.log('👥 Fetched users sample:', users.slice(0, 2)); // Log first 2 users to see structure
        setUsers(users);
        setTotalUsers(response.data.pagination?.totalCount || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filterRole, filterStatus]);

  // Fetch users when filters or page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filters change (not including currentPage in deps to avoid loop)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterRole, filterStatus]);

  // Clear search handler
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id || user.id));
    }
  };

  const handleEditUser = (user) => {
    const userId = user._id || user.id;
    
    // Allow editing own profile, but show warning about restricted fields
    if (isCurrentUser(userId)) {
      notify.info('ℹ️ Bạn đang chỉnh sửa tài khoản của mình. Role và Status không thể thay đổi.');
    }
    
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    // Check if trying to delete own account
    if (isCurrentUser(userId)) {
      notify.error('⛔ Bạn không thể xóa tài khoản của chính mình!');
      return;
    }

    const user = users.find(u => (u._id || u.id) === userId);
    const userName = user?.name || user?.fullName || 'User';
    
    // Additional check for admin users
    if (user?.role === 'Admin') {
      notify.warning('⚠️ Không thể xóa tài khoản Admin. Vui lòng liên hệ Super Admin.');
      return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${userName}?`)) {
      try {
        const response = await userService.deleteUser(userId);
        if (response.success) {
          await fetchUsers(); // Refresh the list
          notify.success(`✅ Đã xóa tài khoản của ${userName}`);
        } else {
          notify.error('❌ ' + (response.message || 'Xóa tài khoản thất bại'));
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        notify.error('❌ ' + errorMessage);
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    // Check if trying to change own status
    if (isCurrentUser(userId)) {
      notify.error('⛔ Bạn không thể thay đổi trạng thái của chính tài khoản mình!');
      return;
    }

    try {
      console.log('🔄 Updating user status:', { userId, newStatus });
      
      if (!userId) {
        throw new Error('User ID is undefined or null');
      }

      const user = users.find(u => (u._id || u.id) === userId);
      const userName = user?.name || user?.fullName || 'User';

      // Additional check for admin users
      if (user?.role === 'Admin') {
        notify.warning('⚠️ Không thể thay đổi trạng thái của tài khoản Admin khác!');
        return;
      }
      
      const response = await userService.updateUserStatus(userId, newStatus);
      console.log('✅ Update response:', response);
      
      if (response.success) {
        console.log('🔄 Refreshing users list...');
        await fetchUsers(); // Refresh the list
        console.log('✅ Users list refreshed');
        
        // Show success notification based on status
        if (newStatus === 'suspended') {
          notify.warning(`🚫 Đã tạm khóa tài khoản của ${userName}`);
        } else if (newStatus === 'active') {
          notify.success(`✅ Đã kích hoạt tài khoản của ${userName}`);
        } else if (newStatus === 'inactive') {
          notify.info(`⚠️ Đã đặt tài khoản của ${userName} thành không hoạt động`);
        }
      } else {
        notify.error('❌ ' + (response.message || 'Cập nhật trạng thái thất bại'));
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      const errorMessage = error.response?.data?.message || error.message;
      notify.error('❌ ' + errorMessage);
    }
  };

  const handleSaveUser = async (userData, isEdit) => {
    try {
      let response;
      if (isEdit) {
        response = await userService.updateUser(editingUser._id || editingUser.id, userData);
      } else {
        response = await userService.createUser(userData);
      }
      
      if (response.success) {
        await fetchUsers(); // Refresh the list
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingUser(null);
        
        if (isEdit) {
          notify.success(`✅ Đã cập nhật thông tin người dùng`);
        } else {
          notify.success(`✅ Đã tạo tài khoản mới thành công`);
        }
      } else {
        notify.error('Lưu thông tin thất bại: ' + response.message);
      }
    } catch (error) {
      notify.error('Lỗi khi lưu thông tin: ' + error.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'HotelPartner': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage all users in your system</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Security Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                🔒 Bảo vệ tài khoản Admin
              </h4>
              <p className="text-sm text-blue-700">
                Để đảm bảo an toàn, bạn <strong>không thể</strong> thay đổi status, role hoặc xóa tài khoản của chính mình. 
                Các tài khoản Admin khác cũng được bảo vệ khỏi các thao tác này.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hotel Partners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'HotelPartner').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="HotelPartner">Hotel Partner</option>
                <option value="Customer">Customer</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Users ({totalUsers})
              </h3>
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} selected
                  </span>
                  <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Inbox className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                              ? 'Không tìm thấy người dùng' 
                              : 'Chưa có người dùng nào'}
                          </h3>
                          <p className="text-sm text-gray-500 max-w-md">
                            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                              ? 'Không có kết quả nào phù hợp với bộ lọc của bạn. Thử điều chỉnh tiêu chí tìm kiếm.' 
                              : 'Bắt đầu bằng cách tạo người dùng mới cho hệ thống.'}
                          </p>
                        </div>
                        {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo người dùng mới
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user._id || user.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isCurrentUser(user._id || user.id) 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : ''
                      }`}
                    >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id || user.id)}
                        onChange={() => handleSelectUser(user._id || user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {(user.name || user.fullName || '').split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || user.fullName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone || user.phoneNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(user.createdAt || user.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {isCurrentUser(user._id || user.id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            <Shield className="h-3 w-3 mr-1" />
                            You
                          </span>
                        )}
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(user._id || user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`transition-colors ${
                            isCurrentUser(user._id || user.id) || user.role === 'Admin'
                              ? 'text-gray-300 cursor-not-allowed' 
                              : user.status === 'active' 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                          }`}
                          title={
                            isCurrentUser(user._id || user.id) 
                              ? 'Cannot change your own status' 
                              : user.role === 'Admin'
                                ? 'Cannot change admin status'
                                : user.status === 'active' ? 'Suspend' : 'Activate'
                          }
                          disabled={isCurrentUser(user._id || user.id) || user.role === 'Admin'}
                        >
                          {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id || user.id)}
                          className={`transition-colors ${
                            isCurrentUser(user._id || user.id) || user.role === 'Admin'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={
                            isCurrentUser(user._id || user.id)
                              ? 'Cannot delete your own account'
                              : user.role === 'Admin'
                                ? 'Cannot delete admin accounts'
                                : 'Delete'
                          }
                          disabled={isCurrentUser(user._id || user.id) || user.role === 'Admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalUsers)}
                  </span>{' '}
                  of <span className="font-medium">{totalUsers}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* User Form Modals */}
        <UserFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveUser}
        />

        <UserFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={editingUser}
          onSave={handleSaveUser}
          isEditingSelf={editingUser && isCurrentUser(editingUser._id || editingUser.id)}
        />
      </div>
    </div>
  );
};

export default UsersPage;