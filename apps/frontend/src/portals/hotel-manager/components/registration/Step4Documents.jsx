/**
 * Step 4: Documents - Partner Registration
 * Upload verification documents
 */

import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

const Step4Documents = ({ documents, handleFileUpload, removeDocument }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const documentTypes = [
    {
      type: 'businessLicense',
      label: 'Business License',
      description: 'Business registration certificate or operating license',
      required: true
    },
    {
      type: 'idCard',
      label: 'ID Card / Passport',
      description: 'Government-issued identification document',
      required: true
    },
    {
      type: 'bankStatement',
      label: 'Bank Statement',
      description: 'Recent bank statement (last 3 months)',
      required: false
    },
    {
      type: 'taxCertificate',
      label: 'Tax Certificate',
      description: 'Tax registration certificate (if applicable)',
      required: false
    }
  ];

  const hasDocument = (type) => {
    return documents.some(doc => doc.type === type);
  };

  return (
    <motion.div {...fadeIn}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
      <p className="text-gray-600 mb-8">
        Please upload the required documents for verification
      </p>

      <div className="space-y-6">
        {documentTypes.map((docType) => (
          <div
            key={docType.type}
            className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  {docType.label}
                  {docType.required && (
                    <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                  {hasDocument(docType.type) && (
                    <CheckCircle className="ml-2 w-5 h-5 text-green-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
              </div>
            </div>

            {/* Upload Area */}
            {!hasDocument(docType.type) ? (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-blue-600 font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG or JPEG (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileUpload(e, docType.type)}
                />
              </label>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {documents.find(doc => doc.type === docType.type)?.name}
                      </p>
                      <p className="text-xs text-gray-500">Uploaded successfully</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const index = documents.findIndex(doc => doc.type === docType.type);
                      if (index !== -1) removeDocument(index);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Document Guidelines</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>All documents must be clear and readable</li>
                  <li>Documents should be in color (not black and white)</li>
                  <li>Ensure all corners of the document are visible</li>
                  <li>Documents will be reviewed within 2-3 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Documents Uploaded:
            </span>
            <span className="text-lg font-bold text-blue-600">
              {documents.length} / {documentTypes.filter(d => d.required).length} Required
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step4Documents;
