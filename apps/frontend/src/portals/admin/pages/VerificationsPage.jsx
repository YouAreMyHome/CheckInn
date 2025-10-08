const VerificationsPage = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Verifications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve hotel verifications.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Verifications</h3>
          <p className="text-gray-600 mb-4">Verification management features will be implemented here</p>
          <p className="text-sm text-gray-500">Features: Review applications, document verification, approval workflow</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationsPage;