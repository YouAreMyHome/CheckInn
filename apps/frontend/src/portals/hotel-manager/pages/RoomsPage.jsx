const RoomsPage = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Room Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage rooms across all your hotels.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Add New Room
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Room Management</h3>
          <p className="text-gray-600 mb-4">Room listing and management features will be implemented here</p>
          <p className="text-sm text-gray-500">Features: Add/edit rooms, set pricing, manage availability, room types</p>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;