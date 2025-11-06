/**
 * Step 2: Business Info - Partner Registration
 * Collects business address and tax information
 */

import { motion } from 'framer-motion';
import { MapPin, Hash } from 'lucide-react';

const Step2BusinessInfo = ({ formData, errors, handleChange }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div {...fadeIn}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
      <p className="text-gray-600 mb-8">
        Tell us more about your business
      </p>

      <div className="space-y-6">
        {/* Tax ID (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax ID / Business Registration Number
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 0123456789"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional - Required for company-type accounts
          </p>
        </div>

        {/* Business Address */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Business Address</h3>
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessAddress.street"
              value={formData.businessAddress.street}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors['businessAddress.street'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Main Street"
            />
            {errors['businessAddress.street'] && (
              <p className="mt-1 text-sm text-red-600">{errors['businessAddress.street']}</p>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessAddress.city"
                value={formData.businessAddress.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors['businessAddress.city'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ho Chi Minh City"
              />
              {errors['businessAddress.city'] && (
                <p className="mt-1 text-sm text-red-600">{errors['businessAddress.city']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessAddress.state"
                value={formData.businessAddress.state}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors['businessAddress.state'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ho Chi Minh"
              />
              {errors['businessAddress.state'] && (
                <p className="mt-1 text-sm text-red-600">{errors['businessAddress.state']}</p>
              )}
            </div>
          </div>

          {/* Country & Zip Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="businessAddress.country"
                value={formData.businessAddress.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Vietnam">Vietnam</option>
                <option value="Thailand">Thailand</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Indonesia">Indonesia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip/Postal Code
              </label>
              <input
                type="text"
                name="businessAddress.zipCode"
                value={formData.businessAddress.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="700000"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step2BusinessInfo;
