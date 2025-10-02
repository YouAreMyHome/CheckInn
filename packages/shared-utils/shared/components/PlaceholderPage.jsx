import React from 'react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="text-sm text-gray-500">
          This page is under development
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;