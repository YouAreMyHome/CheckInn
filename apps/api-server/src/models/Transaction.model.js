/**
 * Transaction Model for CheckInn Hotel Booking Platform
 * 
 * Tracking tất cả giao dịch thanh toán
 * - Payment transactions
 * - Refund transactions
 * - Commission tracking
 * - Payment gateway integration logs
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Chi tiết mọi giao dịch tài chính trong hệ thống
 */
const transactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    index: true
  },
  
  // References
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    index: true
  },
  
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required'],
    index: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true // Customer who made the payment
  },
  
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Partner reference is required'],
    index: true // Hotel owner receiving payment
  },
  
  // Transaction details
  type: {
    type: String,
    enum: ['payment', 'refund', 'commission', 'payout'],
    required: [true, 'Transaction type is required'],
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    required: true,
    index: true
  },
  
  // Amount details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR', 'GBP'],
    required: true
  },
  
  // Fee breakdown (for platform)
  platformFee: {
    type: Number,
    default: 0,
    min: 0 // Platform's commission
  },
  
  platformFeePercentage: {
    type: Number,
    default: 10, // 10% default commission
    min: 0,
    max: 100
  },
  
  partnerAmount: {
    type: Number,
    required: true,
    min: 0 // Amount partner receives after platform fee
  },
  
  // Payment method details
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'vnpay', 'momo', 'stripe', 'paypal'],
    required: [true, 'Payment method is required']
  },
  
  paymentGateway: {
    type: String,
    enum: ['vnpay', 'momo', 'stripe', 'paypal', 'manual'],
    required: [true, 'Payment gateway is required']
  },
  
  // Gateway response data
  gatewayTransactionId: {
    type: String,
    index: true // Transaction ID from payment gateway
  },
  
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed // Raw response from gateway
  },
  
  // Card information (if applicable, masked)
  cardInfo: {
    last4: String, // Last 4 digits
    brand: String, // Visa, Mastercard, etc.
    expiryMonth: Number,
    expiryYear: Number
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: Date,
  
  completedAt: Date,
  
  failedAt: Date,
  
  // Error handling
  errorCode: String,
  
  errorMessage: String,
  
  // Refund details (if applicable)
  refundReason: String,
  
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  refundedAt: Date,
  
  originalTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction' // Reference to original transaction if this is a refund
  },
  
  // Security & fraud detection
  ipAddress: String,
  
  userAgent: String,
  
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  flaggedReason: String,
  
  // Payout tracking (for partners)
  payoutStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'paid', 'failed'],
    default: 'pending'
  },
  
  payoutDate: Date,
  
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe_connect', 'manual']
  },
  
  payoutReference: String,
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional data
  },
  
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
transactionSchema.index({ hotel: 1, status: 1, createdAt: -1 });
transactionSchema.index({ partner: 1, status: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ payoutStatus: 1, payoutDate: 1 });

/**
 * Pre-save middleware: Calculate partner amount
 */
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('platformFeePercentage')) {
    // Calculate platform fee
    this.platformFee = Math.round(this.amount * (this.platformFeePercentage / 100));
    
    // Calculate partner amount
    this.partnerAmount = this.amount - this.platformFee;
  }
  
  next();
});

/**
 * Static method: Generate unique transaction ID
 */
transactionSchema.statics.generateTransactionId = async function() {
  const prefix = 'TXN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Static method: Get transactions for partner
 */
transactionSchema.statics.getPartnerTransactions = function(partnerId, options = {}) {
  const {
    status,
    type,
    startDate,
    endDate,
    limit = 50,
    skip = 0
  } = options;
  
  const filter = { partner: partnerId };
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('booking', 'bookingNumber checkIn checkOut')
    .populate('hotel', 'name')
    .populate('user', 'name email');
};

/**
 * Static method: Calculate partner earnings
 */
transactionSchema.statics.getPartnerEarnings = function(partnerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        partner: mongoose.Types.ObjectId(partnerId),
        status: 'completed',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$partnerAmount' },
        totalTransactions: { $sum: 1 },
        totalPlatformFee: { $sum: '$platformFee' },
        totalGrossRevenue: { $sum: '$amount' }
      }
    }
  ]);
};

/**
 * Instance method: Mark as completed
 */
transactionSchema.methods.markAsCompleted = function(gatewayData = {}) {
  this.status = 'completed';
  this.completedAt = Date.now();
  
  if (gatewayData.transactionId) {
    this.gatewayTransactionId = gatewayData.transactionId;
  }
  
  if (gatewayData.response) {
    this.gatewayResponse = gatewayData.response;
  }
  
  return this.save();
};

/**
 * Instance method: Mark as failed
 */
transactionSchema.methods.markAsFailed = function(errorCode, errorMessage) {
  this.status = 'failed';
  this.failedAt = Date.now();
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  
  return this.save();
};

/**
 * Instance method: Create refund transaction
 */
transactionSchema.methods.createRefund = async function(refundAmount, reason) {
  const Transaction = mongoose.model('Transaction');
  
  const refundTransactionId = await Transaction.generateTransactionId();
  
  const refundTransaction = new Transaction({
    transactionId: refundTransactionId,
    booking: this.booking,
    hotel: this.hotel,
    user: this.user,
    partner: this.partner,
    type: 'refund',
    status: 'pending',
    amount: refundAmount,
    currency: this.currency,
    platformFee: 0, // No fee on refunds
    platformFeePercentage: 0,
    partnerAmount: -refundAmount, // Negative for partner
    paymentMethod: this.paymentMethod,
    paymentGateway: this.paymentGateway,
    refundReason: reason,
    originalTransaction: this._id
  });
  
  await refundTransaction.save();
  
  // Update original transaction
  this.refundedAmount = (this.refundedAmount || 0) + refundAmount;
  if (this.refundedAmount >= this.amount) {
    this.status = 'refunded';
  }
  await this.save();
  
  return refundTransaction;
};

module.exports = mongoose.model('Transaction', transactionSchema);
