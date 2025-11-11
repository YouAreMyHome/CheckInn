/**
 * Partner Verifications Page - Admin Portal
 * 
 * Features:
 * - View all pending partner applications
 * - Review partner details and documents
 * - Approve or reject applications
 * - Add rejection reasons
 * - Filter by verification status
 * - Quick stats overview
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Clock, CheckCircle, XCircle, FileText, Building2, 
  MapPin, Phone, Mail, User, Loader2, Filter,
  AlertTriangle, Calendar, DollarSign, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import axios from 'axios';
import { useNotification } from '@components/NotificationProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PartnerVerificationsPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { showNotification } = useNotification();

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/partner/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { partners: allPartners, stats: apiStats } = response.data.data;
      setStats(apiStats);
      
      // Filter for display
      const filtered = allPartners.filter(p => {
        const status = p.partnerInfo?.verificationStatus;
        if (filterStatus === 'pending') return status === 'pending';
        if (filterStatus === 'verified') return status === 'verified';
        if (filterStatus === 'rejected') return status === 'rejected';
        return true;
      });
      
      setPartners(filtered);
    } catch (error) {
      console.error('Error fetching partner applications:', error);
      showNotification('error', 'Failed to load partner applications');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleApprove = async (partnerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/partner/applications/${partnerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('success', 'Partner application approved successfully');
      fetchPartners();
      setShowReviewModal(false);
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (partnerId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/partner/applications/${partnerId}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('success', 'Partner application rejected');
      fetchPartners();
      setShowReviewModal(false);
    } catch (err) {
      console.error('Error rejecting application:', err);
      showNotification('error', 'Failed to reject application');
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.partnerInfo?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Partner Verifications</h1>
        <p className="mt-2 text-gray-600">Review and approve partner applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Total Applications"
          value={stats.total}
          icon={Building2}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Applications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No partner applications found</p>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <PartnerCard
              key={partner._id}
              partner={partner}
              onReview={() => {
                setSelectedPartner(partner);
                setShowReviewModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPartner && (
        <ReviewModal
          partner={selectedPartner}
          onApprove={() => handleApprove(selectedPartner._id)}
          onReject={(reason) => handleReject(selectedPartner._id, reason)}
          onClose={() => {
            setSelectedPartner(null);
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </motion.div>
  );
};

// Partner Card Component
const PartnerCard = ({ partner, onReview }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    const status = partner.partnerInfo?.verificationStatus || 'pending';
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-600">{partner.partnerInfo?.businessName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {partner.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {partner.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Applied {new Date(partner.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              {isExpanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Business Type:</span>
                      <span className="ml-2 font-medium">{partner.partnerInfo?.businessType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tax ID:</span>
                      <span className="ml-2 font-medium">{partner.partnerInfo?.taxId || 'N/A'}</span>
                    </div>
                    {partner.partnerInfo?.businessAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                        <span className="text-gray-900">
                          {partner.partnerInfo.businessAddress.street}, {partner.partnerInfo.businessAddress.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banking Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Banking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Bank:</span>
                      <span className="ml-2 font-medium">{partner.partnerInfo?.bankAccount?.bankName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account:</span>
                      <span className="ml-2 font-medium">{partner.partnerInfo?.bankAccount?.accountNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {partner.partnerInfo?.verificationStatus === 'rejected' && partner.partnerInfo?.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-red-900 mb-1">Rejection Reason</h5>
                      <p className="text-sm text-red-800">{partner.partnerInfo.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {partner.partnerInfo?.verificationStatus === 'pending' && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onReview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Review Application
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Review Modal Component
const ReviewModal = ({ partner, onApprove, onReject, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Review Partner Application</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Partner Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <p className="font-medium">{partner.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{partner.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{partner.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Application Date</label>
                <p className="font-medium">{new Date(partner.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Business Name</label>
                <p className="font-medium">{partner.partnerInfo?.businessName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Business Type</label>
                <p className="font-medium">{partner.partnerInfo?.businessType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tax ID</label>
                <p className="font-medium">{partner.partnerInfo?.taxId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Address</label>
                <p className="font-medium">
                  {partner.partnerInfo?.businessAddress ? 
                    `${partner.partnerInfo.businessAddress.street}, ${partner.partnerInfo.businessAddress.city}` : 
                    'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Banking Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Bank Name</label>
                <p className="font-medium">{partner.partnerInfo?.bankAccount?.bankName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Number</label>
                <p className="font-medium">{partner.partnerInfo?.bankAccount?.accountNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Holder</label>
                <p className="font-medium">{partner.partnerInfo?.bankAccount?.accountHolderName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">SWIFT Code</label>
                <p className="font-medium">{partner.partnerInfo?.bankAccount?.swiftCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          {!showRejectForm ? (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Application
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Confirm Rejection
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerVerificationsPage;
