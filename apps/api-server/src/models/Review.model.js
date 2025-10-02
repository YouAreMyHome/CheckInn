/**
 * Review Model for CheckInn Hotel Booking Platform
 * 
 * Quản lý đánh giá và rating với:
 * - Multi-aspect rating system
 * - Review verification & moderation
 * - Helpful votes system
 * - Performance optimization
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Sub-schema: Detailed ratings
 * Đánh giá chi tiết theo nhiều tiêu chí
 */
const detailedRatingSchema = new mongoose.Schema({
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comfort: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  location: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  service: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  valueForMoney: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  facilities: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

/**
 * Sub-schema: Review images
 * Quản lý ảnh đính kèm review
 */
const reviewImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  caption: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Sub-schema: Management response
 * Phản hồi từ phía quản lý khách sạn
 */
const managementResponseSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Response cannot exceed 1000 characters']
  },
  respondedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Main Review Schema
 * Schema chính quản lý tất cả thông tin đánh giá
 */
const reviewSchema = new mongoose.Schema({
  // === REFERENCES ===
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: [true, 'Review must belong to a hotel'],
    index: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    index: true // Optional - review có thể cho cả hotel
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a user'],
    index: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be linked to a booking'],
    unique: true, // Mỗi booking chỉ được review 1 lần
    index: true
  },
  
  // === RATING SYSTEM ===
  overallRating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    set: (val) => Math.round(val * 10) / 10, // Làm tròn 1 chữ số
    index: true
  },
  detailedRatings: {
    type: detailedRatingSchema,
    required: true
  },
  
  // === REVIEW CONTENT ===
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: 'text'
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    index: 'text'
  },
  
  // === REVIEW IMAGES ===
  images: {
    type: [reviewImageSchema],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'Review can have maximum 10 images'
    }
  },
  
  // === TRAVELER INFO ===
  travelType: {
    type: String,
    enum: ['Business', 'Leisure', 'Family', 'Couples', 'Solo', 'Group'],
    required: true,
    index: true
  },
  roomType: String, // Loại phòng đã ở
  stayDuration: {
    type: Number,
    min: 1 // Số đêm đã ở
  },
  
  // === VERIFICATION & MODERATION ===
  isVerified: {
    type: Boolean,
    default: false, // Đã xác thực là khách thực sự ở
    index: true
  },
  verifiedAt: Date,
  verificationMethod: {
    type: String,
    enum: ['booking_confirmed', 'receipt_verified', 'manual_check']
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending',
    index: true
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  rejectionReason: String,
  
  // === ENGAGEMENT METRICS ===
  helpfulVotes: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }] // Danh sách user đã vote helpful
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // === MANAGEMENT RESPONSE ===
  managementResponse: managementResponseSchema,
  
  // === FLAGS & REPORTS ===
  flags: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'fake', 'spam', 'offensive', 'irrelevant']
    },
    reportedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // === ADDITIONAL INFO ===
  language: {
    type: String,
    default: 'vi',
    enum: ['vi', 'en', 'zh', 'ja', 'ko', 'fr', 'de']
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * PERFORMANCE INDEXES
 */
// Compound indexes cho performance
reviewSchema.index({ hotel: 1, status: 1, overallRating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, status: 1, overallRating: -1 });
reviewSchema.index({ travelType: 1, overallRating: -1 });

// Text search index
reviewSchema.index({ title: 'text', comment: 'text' });

/**
 * VIRTUAL FIELDS
 */

// Virtual: Tính average của detailed ratings
reviewSchema.virtual('averageDetailedRating').get(function() {
  if (!this.detailedRatings) return 0;
  
  const ratings = this.detailedRatings;
  const sum = ratings.cleanliness + ratings.comfort + ratings.location + 
              ratings.service + ratings.valueForMoney + ratings.facilities;
  return Math.round((sum / 6) * 10) / 10;
});

// Virtual: Check if user found review helpful
reviewSchema.virtual('isHelpfulToUser').get(function() {
  // Logic sẽ được implement trong controller với user context
  return false;
});

// Virtual: Format stay duration
reviewSchema.virtual('stayDurationText').get(function() {
  if (!this.stayDuration) return '';
  return this.stayDuration === 1 ? '1 night' : `${this.stayDuration} nights`;
});

/**
 * PRE-SAVE MIDDLEWARE
 */
reviewSchema.pre('save', function(next) {
  // Auto-calculate overall rating from detailed ratings if not provided
  if (this.detailedRatings && !this.overallRating) {
    const ratings = this.detailedRatings;
    const average = (ratings.cleanliness + ratings.comfort + ratings.location + 
                    ratings.service + ratings.valueForMoney + ratings.facilities) / 6;
    this.overallRating = Math.round(average * 10) / 10;
  }
  
  // Auto-approve if user is verified and no flags
  if (this.isNew && this.isVerified && this.flags.length === 0) {
    this.status = 'approved';
  }
  
  next();
});

/**
 * POST-SAVE MIDDLEWARE
 */
reviewSchema.post('save', async function(doc) {
  // Update hotel average rating when review is approved
  if (doc.status === 'approved') {
    await updateHotelRatings(doc.hotel);
    
    // Update room rating if room is specified
    if (doc.room) {
      await updateRoomRatings(doc.room);
    }
  }
});

/**
 * POST-REMOVE MIDDLEWARE
 */
reviewSchema.post('remove', async function(doc) {
  // Update ratings after review removal
  await updateHotelRatings(doc.hotel);
  if (doc.room) {
    await updateRoomRatings(doc.room);
  }
});

/**
 * HELPER FUNCTIONS
 */
async function updateHotelRatings(hotelId) {
  const Review = mongoose.model('Review');
  const Hotel = mongoose.model('Hotel');
  
  const stats = await Review.aggregate([
    {
      $match: {
        hotel: hotelId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  const { averageRating = 0, totalReviews = 0 } = stats[0] || {};
  
  await Hotel.findByIdAndUpdate(hotelId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews
  });
}

async function updateRoomRatings(roomId) {
  const Review = mongoose.model('Review');
  const Room = mongoose.model('Room');
  
  const stats = await Review.aggregate([
    {
      $match: {
        room: roomId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  const { averageRating = 0, totalReviews = 0 } = stats[0] || {};
  
  await Room.findByIdAndUpdate(roomId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews
  });
}

/**
 * STATIC METHODS
 */

// Lấy reviews với filters và pagination
reviewSchema.statics.getHotelReviews = function(hotelId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    minRating,
    maxRating,
    travelType,
    verifiedOnly = false
  } = options;
  
  const query = {
    hotel: hotelId,
    status: 'approved'
  };
  
  if (minRating || maxRating) {
    query.overallRating = {};
    if (minRating) query.overallRating.$gte = minRating;
    if (maxRating) query.overallRating.$lte = maxRating;
  }
  
  if (travelType) query.travelType = travelType;
  if (verifiedOnly) query.isVerified = true;
  
  return this.find(query)
    .populate('user', 'name avatar')
    .populate('room', 'name type')
    .sort({ [sortBy]: sortOrder })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Thống kê review cho hotel
reviewSchema.statics.getReviewStats = function(hotelId) {
  return this.aggregate([
    { $match: { hotel: mongoose.Types.ObjectId(hotelId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: {
          $push: '$overallRating'
        },
        travelTypeBreakdown: {
          $push: '$travelType'
        }
      }
    }
  ]);
};

/**
 * INSTANCE METHODS
 */

// Vote helpful cho review
reviewSchema.methods.voteHelpful = async function(userId) {
  if (this.helpfulVotes.users.includes(userId)) {
    throw new Error('User already voted for this review');
  }
  
  this.helpfulVotes.users.push(userId);
  this.helpfulVotes.count += 1;
  
  return this.save();
};

// Remove helpful vote
reviewSchema.methods.removeHelpfulVote = async function(userId) {
  const index = this.helpfulVotes.users.indexOf(userId);
  if (index === -1) {
    throw new Error('User has not voted for this review');
  }
  
  this.helpfulVotes.users.splice(index, 1);
  this.helpfulVotes.count = Math.max(0, this.helpfulVotes.count - 1);
  
  return this.save();
};

// Flag review
reviewSchema.methods.flagReview = async function(reason, reportedBy, description) {
  this.flags.push({
    reason,
    reportedBy,
    description,
    reportedAt: new Date()
  });
  
  // Auto-hide if too many flags
  if (this.flags.length >= 3) {
    this.status = 'hidden';
  }
  
  return this.save();
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;