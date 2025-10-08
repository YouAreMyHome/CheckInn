const UsersPage = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              User Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage all users in the system.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
          <p className="text-gray-600 mb-4">User management features will be implemented here</p>
          <p className="text-sm text-gray-500">Features: View users, ban/unban, role management, user analytics</p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;