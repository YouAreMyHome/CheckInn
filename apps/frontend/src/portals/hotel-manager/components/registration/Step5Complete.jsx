/**
 * Step 5: Complete - Partner Registration
 * Final step with success message and next actions
 */

import { motion } from 'framer-motion';
import { CheckCircle, Home, FileText, CreditCard, Loader2 } from 'lucide-react';

const Step5Complete = ({ onComplete }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const completedItems = [
    {
      icon: CheckCircle,
      title: 'Basic Information',
      description: 'Your account has been created'
    },
    {
      icon: FileText,
      title: 'Business Details',
      description: 'Business information recorded'
    },
    {
      icon: CreditCard,
      title: 'Bank Account',
      description: 'Payment details saved'
    },
    {
      icon: Home,
      title: 'Documents',
      description: 'Verification documents uploaded'
    }
  ];

  return (
    <motion.div {...fadeIn} className="text-center">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="inline-block mb-6"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Registration Complete!
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Your partner registration has been submitted successfully. We'll review your application
        and get back to you within 2-3 business days.
      </p>

      {/* Completed Items */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {completedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 text-left"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Document Verification</p>
              <p className="text-xs text-gray-600 mt-1">
                Our team will review your submitted documents
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Account Approval</p>
              <p className="text-xs text-gray-600 mt-1">
                You'll receive an email once your account is approved
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Start Managing</p>
              <p className="text-xs text-gray-600 mt-1">
                Add your first hotel and start receiving bookings
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={onComplete}
        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
      >
        Go to Dashboard
        <svg
          className="ml-2 w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>

      {/* Contact Info */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Have questions?{' '}
          <a href="mailto:partner@checkinn.com" className="text-blue-600 hover:underline">
            Contact our partner support team
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default Step5Complete;
