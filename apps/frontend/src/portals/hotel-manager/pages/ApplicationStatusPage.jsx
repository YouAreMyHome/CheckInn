/**
 * Application Status Page - Partner Onboarding Progress (Public)
 * 
 * Public page where users can check their application status by email
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Eye,
  Mail, Phone, Building2, CreditCard, ChevronRight, Home, Search, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ApplicationStatusPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setApplicationData(null);
      const response = await axios.get(`${API_URL}/partner/application-status/${encodeURIComponent(email)}`);
      if (response.data.success) setApplicationData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found. Please check your email or register as a partner.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setApplicationData(null);
    setError('');
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', iconColor: 'text-yellow-600', textColor: 'text-yellow-800', title: 'Under Review', message: 'Your application is being reviewed by our team' },
      approved: { icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200', iconColor: 'text-green-600', textColor: 'text-green-800', title: 'Approved', message: 'Congratulations! Your application has been approved' },
      rejected: { icon: XCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200', iconColor: 'text-red-600', textColor: 'text-red-800', title: 'Rejected', message: 'Unfortunately, your application was not approved' },
      incomplete: { icon: AlertCircle, bgColor: 'bg-orange-50', borderColor: 'border-orange-200', iconColor: 'text-orange-600', textColor: 'text-orange-800', title: 'Incomplete', message: 'Please complete all required steps' }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar 
        additionalLinks={[
          { to: '/partner/application-status', label: 'Check Status' }
        ]}
        highlightedLink="/partner/application-status"
      />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Check Application Status
            </h1>
          </div>
          <p className="text-gray-600">Enter your email to view your partner application progress</p>
        </motion.div>

        {!applicationData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />Email Address
                </label>
                <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your registered email" disabled={loading} />
                {error && !applicationData && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="inline w-4 h-4 mr-1" />{error}
                  </p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center">
                {loading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" />Searching...</> : <><Search className="h-5 w-5 mr-2" />Check Status</>}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">Don't have an application yet?</p>
              <Link to="/partner/register" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                Register as Partner<ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {applicationData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <StatusDisplay applicationData={applicationData} getStatusConfig={getStatusConfig} navigate={navigate} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <ApplicationDetails applicationData={applicationData} />
                <VerificationSteps applicationData={applicationData} />
              </div>
              <div className="flex justify-center space-x-4">
                <button onClick={handleReset} className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition inline-flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-2" />New Search
                </button>
                <button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition inline-flex items-center">
                  <Home className="h-5 w-5 mr-2" />Back to Home
                </button>
              </div>
              <HelpSection />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const StatusDisplay = ({ applicationData, getStatusConfig, navigate }) => {
  const statusConfig = getStatusConfig(applicationData?.verificationStatus || 'pending');
  const StatusIcon = statusConfig.icon;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-2xl p-8 mb-8 text-center`}>
      <StatusIcon className={`h-20 w-20 ${statusConfig.iconColor} mx-auto mb-4`} />
      <h2 className={`text-3xl font-bold ${statusConfig.textColor} mb-2`}>{statusConfig.title}</h2>
      <p className="text-gray-700 text-lg mb-6">{statusConfig.message}</p>
      {applicationData?.verificationStatus === 'pending' && (
        <div className="bg-white/50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-600"><Clock className="inline h-4 w-4 mr-1" />Average review time: <strong>2-3 business days</strong></p>
        </div>
      )}
      {applicationData?.verificationStatus === 'approved' && (
        <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center">
          Login to Dashboard<ChevronRight className="ml-2 h-5 w-5" />
        </button>
      )}
      {applicationData?.verificationStatus === 'rejected' && applicationData?.rejectionReason && (
        <div className="bg-white/80 rounded-lg p-4 mt-4 max-w-md mx-auto text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
          <p className="text-sm text-gray-600">{applicationData.rejectionReason}</p>
        </div>
      )}
    </motion.div>
  );
};

const ApplicationDetails = ({ applicationData }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 text-blue-600 mr-2" />Application Details</h3>
    <dl className="space-y-3 text-sm">
      <div><dt className="text-gray-600">Applicant Name</dt><dd className="text-gray-900 font-medium">{applicationData?.name || 'N/A'}</dd></div>
      <div><dt className="text-gray-600">Email</dt><dd className="text-gray-900 font-medium flex items-center"><Mail className="h-4 w-4 mr-1" />{applicationData?.email || 'N/A'}</dd></div>
      <div><dt className="text-gray-600">Phone</dt><dd className="text-gray-900 font-medium flex items-center"><Phone className="h-4 w-4 mr-1" />{applicationData?.phone || 'N/A'}</dd></div>
      <div><dt className="text-gray-600">Business Name</dt><dd className="text-gray-900 font-medium">{applicationData?.businessName || 'N/A'}</dd></div>
      <div><dt className="text-gray-600">Submitted Date</dt><dd className="text-gray-900 font-medium">
        {applicationData?.createdAt ? new Date(applicationData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
      </dd></div>
    </dl>
  </motion.div>
);

const VerificationSteps = ({ applicationData }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center"><Shield className="h-5 w-5 text-purple-600 mr-2" />Verification Steps</h3>
    <div className="space-y-3">
      <StepItem icon={Building2} label="Business Information" completed={applicationData?.onboardingProgress?.businessInfoCompleted} />
      <StepItem icon={CreditCard} label="Bank Account" completed={applicationData?.onboardingProgress?.bankAccountCompleted} />
      <StepItem icon={FileText} label="Documents" completed={applicationData?.onboardingProgress?.documentsUploaded} />
      <StepItem icon={Eye} label="Admin Review" completed={applicationData?.verificationStatus === 'approved'} inProgress={applicationData?.verificationStatus === 'pending'} />
    </div>
  </motion.div>
);

const HelpSection = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h4 className="font-semibold text-blue-900 mb-3">Need Help?</h4>
    <p className="text-sm text-blue-800 mb-4">If you have questions about your application status, please contact our support team.</p>
    <div className="flex flex-wrap gap-4 text-sm">
      <a href="mailto:partner-support@checkinn.com" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
        <Mail className="h-4 w-4 mr-1" />partner-support@checkinn.com
      </a>
      <a href="tel:+841234567890" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
        <Phone className="h-4 w-4 mr-1" />+84 123 456 7890
      </a>
    </div>
  </motion.div>
);

const StepItem = ({ icon: Icon, label, completed, inProgress }) => (
  <div className="flex items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${completed ? 'bg-green-100' : inProgress ? 'bg-yellow-100' : 'bg-gray-100'}`}>
      {completed ? <CheckCircle className="h-5 w-5 text-green-600" /> : inProgress ? <Clock className="h-5 w-5 text-yellow-600" /> : Icon && <Icon className="h-5 w-5 text-gray-400" />}
    </div>
    <span className={`text-sm ${completed ? 'text-green-900 font-medium' : inProgress ? 'text-yellow-900 font-medium' : 'text-gray-600'}`}>{label}</span>
  </div>
);

export default ApplicationStatusPage;
