const TestPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CheckInn Test Page</h1>
        <p className="text-xl text-gray-600 mb-8">If you see this, React is working!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-green-600 font-medium">✓ React Router Working</p>
          <p className="text-green-600 font-medium">✓ Tailwind CSS Working</p>
          <p className="text-green-600 font-medium">✓ Component Rendering Working</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;