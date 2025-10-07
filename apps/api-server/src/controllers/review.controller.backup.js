/**
 * Review Controller for CheckInn Hotel Booking Platform
 * 
 * Manages review operations với detailed rating system, moderation,
 * sentiment analysis, và engagement features
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const Hotel = require('../models/Hotel.model');
const Room = require('../models/Room.model');
const User = require('../models/User.model');
const ActivityTracker = require('../utils/activityTracker');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Review Controller Class
 * Comprehensive review management với business logic
 */
class ReviewController {

  /**
   * ============================================================================
   * REVIEW CREATION & MANAGEMENT
   * ============================================================================
   */

  /**
   * Create new review (only for completed bookings)
   * POST /api/reviews
   */
  static createReview = catchAsync(async (req, res, next) => {
    const {
      bookingId,
      hotelId,
      roomId,
      overallRating,
      detailedRating,
      reviewText,
      pros,
      cons,
      images
    } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId)
      .populate('hotel room');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user can review this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only review your own bookings', 403));
    }

    // Check booking status
    const allowedStatuses = ['CheckedOut', 'Completed'];
    if (!allowedStatuses.includes(booking.status)) {
      return next(new AppError('You can only review completed stays', 400));
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      booking: bookingId
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this booking', 400));
    }

    // Validate rating ranges
    if (overallRating < 1 || overallRating > 5) {
      return next(new AppError('Overall rating must be between 1 and 5', 400));
    }

    // Validate detailed ratings
    const requiredRatingFields = ['cleanliness', 'comfort', 'location', 'facilities', 'staff', 'valueForMoney'];
    for (const field of requiredRatingFields) {
      if (!detailedRating[field] || detailedRating[field] < 1 || detailedRating[field] > 5) {
        return next(new AppError(`${field} rating must be between 1 and 5`, 400));
      }
    }

    // Calculate average detailed rating
    const avgDetailedRating = Object.values(detailedRating)
      .reduce((sum, rating) => sum + rating, 0) / Object.keys(detailedRating).length;

    // Create review
    const reviewData = {
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      booking: bookingId,
      overallRating,
      detailedRating,
      reviewText,
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      images: Array.isArray(images) ? images : [],
      avgDetailedRating: Number(avgDetailedRating.toFixed(1)),
      
      // Stay details từ booking
      stayDate: booking.checkIn,
      stayDuration: booking.nights,
      roomType: booking.room.type,
      travelType: this.determineTravelType(booking),
      
      // Auto moderation
      isApproved: await this.autoModerateReview(reviewText),
      needsModeration: false
    };

    // Advanced sentiment analysis
    const sentiment = await this.analyzeSentiment(reviewText);
    reviewData.sentimentScore = sentiment.score;
    reviewData.sentimentLabel = sentiment.label;

    const review = await Review.create(reviewData);

    // Populate review data
    await review.populate([
      { path: 'user', select: 'name avatar memberSince' },
      { path: 'hotel', select: 'name location' },
      { path: 'room', select: 'name type' }
    ]);

    // Update hotel và room ratings
    await Promise.all([
      this.updateHotelRating(hotelId),
      this.updateRoomRating(roomId),
      this.updateUserReviewStats(req.user._id)
    ]);

    // Update booking review status
    await Booking.findByIdAndUpdate(bookingId, {
      reviewSubmitted: true,
      reviewId: review._id
    });

    // Track review creation
    await ActivityTracker.trackActivity({
      activityType: 'review_create',
      req,
      userId: req.user._id,
      customData: {
        reviewId: review._id,
        bookingId,
        hotelId,
        overallRating,
        sentimentScore: sentiment.score
      }
    });

    APIResponse.success(res, {
      message: 'Review submitted successfully',
      data: { review }
    }, 201);
  });

  /**
   * Get reviews với filtering và pagination
   * GET /api/reviews
   */
  static getReviews = catchAsync(async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      hotelId,
      roomId,
      userId,
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      travelType,
      hasImages,
      approved = true
    } = req.query;

    let query = Review.find();

    // Basic filters
    if (hotelId) query = query.where('hotel', hotelId);
    if (roomId) query = query.where('room', roomId);
    if (userId) query = query.where('user', userId);

    // Rating filter
    if (minRating || maxRating) {
      const ratingFilter = {};
      if (minRating) ratingFilter.$gte = parseFloat(minRating);
      if (maxRating) ratingFilter.$lte = parseFloat(maxRating);
      query = query.where('overallRating', ratingFilter);
    }

    // Additional filters
    if (travelType) query = query.where('travelType', travelType);
    if (hasImages === 'true') query = query.where('images.0').exists(true);
    if (approved !== 'all') query = query.where('isApproved', approved === 'true');

    // Count total
    const total = await Review.countDocuments(query.getFilter());

    // Execute query
    const reviews = await query
      .populate('user', 'name avatar memberSince totalReviews')
      .populate('hotel', 'name location starRating')
      .populate('room', 'name type')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate rating distribution cho hotel
    let ratingDistribution = null;
    if (hotelId) {
      ratingDistribution = await this.getHotelRatingDistribution(hotelId);
    }

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    APIResponse.success(res, {
      data: { 
        reviews, 
        pagination,
        ratingDistribution
      }
    });
  });

  /**
   * Get review by ID
   * GET /api/reviews/:id
   */
  static getReviewById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError('Invalid review ID', 400));
    }

    const review = await Review.findById(id)
      .populate('user', 'name avatar memberSince totalReviews')
      .populate('hotel', 'name location contact')
      .populate('room', 'name type amenities')
      .populate('managementResponse.respondedBy', 'name role');

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Increment view count
    await Review.findByIdAndUpdate(id, { $inc: { views: 1 } });

    APIResponse.success(res, {
      data: { review }
    });
  });

  /**
   * Update review (only by author within 24h)
   * PATCH /api/reviews/:id
   */
  static updateReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your own reviews', 403));
    }

    // Check time limit (24 hours)
    const timeLimit = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeSinceCreation = Date.now() - review.createdAt.getTime();

    if (timeSinceCreation > timeLimit && req.user.role !== 'Admin') {
      return next(new AppError('Reviews can only be updated within 24 hours of creation', 400));
    }

    // Prevent updating protected fields
    const protectedFields = ['user', 'hotel', 'room', 'booking', 'likes', 'dislikes', 'helpfulVotes'];
    protectedFields.forEach(field => delete updates[field]);

    // Re-calculate averages if ratings updated
    if (updates.detailedRating) {
      const avgDetailedRating = Object.values(updates.detailedRating)
        .reduce((sum, rating) => sum + rating, 0) / Object.keys(updates.detailedRating).length;
      updates.avgDetailedRating = Number(avgDetailedRating.toFixed(1));
    }

    // Re-analyze sentiment if review text updated
    if (updates.reviewText) {
      const sentiment = await this.analyzeSentiment(updates.reviewText);
      updates.sentimentScore = sentiment.score;
      updates.sentimentLabel = sentiment.label;
      updates.needsModeration = true; // Re-moderate after edit
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { ...updates, lastModified: new Date() },
      { new: true, runValidators: true }
    ).populate('user hotel room');

    // Update ratings if changed
    if (updates.overallRating || updates.detailedRating) {
      await Promise.all([
        this.updateHotelRating(review.hotel),
        this.updateRoomRating(review.room)
      ]);
    }

    // Track update
    await ActivityTracker.trackActivity({
      activityType: 'review_update',
      req,
      userId: req.user._id,
      customData: {
        reviewId: id,
        updatedFields: Object.keys(updates)
      }
    });

    APIResponse.success(res, {
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  });

  /**
   * Delete review
   * DELETE /api/reviews/:id
   */
  static deleteReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check permission
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Access denied', 403));
    }

    // Soft delete
    await Review.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user._id
    });

    // Update hotel và room ratings
    await Promise.all([
      this.updateHotelRating(review.hotel),
      this.updateRoomRating(review.room),
      this.updateUserReviewStats(review.user)
    ]);

    // Track deletion
    await ActivityTracker.trackActivity({
      activityType: 'review_delete',
      req,
      userId: req.user._id,
      customData: {
        reviewId: id,
        deletedBy: isOwner ? 'owner' : 'admin'
      }
    });

    APIResponse.success(res, {
      message: 'Review deleted successfully'
    });
  });

  /**
   * ============================================================================
   * ENGAGEMENT FEATURES
   * ============================================================================
   */

  /**
   * Vote review helpful/unhelpful
   * POST /api/reviews/:id/vote
   */
  static voteReviewHelpful = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for unhelpful

    if (typeof helpful !== 'boolean') {
      return next(new AppError('Helpful value must be boolean', 400));
    }

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user already voted
    const existingVote = review.helpfulVotes.find(
      vote => vote.user.toString() === req.user._id.toString()
    );

    if (existingVote) {
      return next(new AppError('You have already voted on this review', 400));
    }

    // Add vote
    await review.voteHelpful(req.user._id, helpful);

    // Track vote
    await ActivityTracker.trackActivity({
      activityType: 'review_vote',
      req,
      userId: req.user._id,
      customData: {
        reviewId: id,
        helpful,
        reviewAuthor: review.user
      }
    });

    APIResponse.success(res, {
      message: 'Vote recorded successfully',
      data: {
        helpfulVotes: review.helpfulVotes.length,
        unhelpfulVotes: review.unhelpfulVotes.length
      }
    });
  });

  /**
   * Like/Unlike review
   * POST /api/reviews/:id/like
   */
  static toggleReviewLike = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    const isLiked = review.likes.includes(req.user._id);
    const isDisliked = review.dislikes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      review.likes.pull(req.user._id);
    } else {
      // Like (remove dislike if exists)
      if (isDisliked) {
        review.dislikes.pull(req.user._id);
      }
      review.likes.push(req.user._id);
    }

    await review.save();

    // Track engagement
    await ActivityTracker.trackActivity({
      activityType: isLiked ? 'review_unlike' : 'review_like',
      req,
      userId: req.user._id,
      customData: {
        reviewId: id,
        reviewAuthor: review.user
      }
    });

    APIResponse.success(res, {
      message: isLiked ? 'Review unliked' : 'Review liked',
      data: {
        likes: review.likes.length,
        dislikes: review.dislikes.length,
        userLiked: !isLiked,
        userDisliked: false
      }
    });
  });

  /**
   * ============================================================================
   * MANAGEMENT RESPONSE
   * ============================================================================
   */

  /**
   * Add management response to review
   * POST /api/reviews/:id/response
   */
  static addManagementResponse = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { responseText } = req.body;

    if (!responseText || responseText.trim().length < 10) {
      return next(new AppError('Response text must be at least 10 characters', 400));
    }

    const review = await Review.findById(id).populate('hotel');
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user is hotel owner or admin
    const isHotelOwner = review.hotel.owner && review.hotel.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isHotelOwner && !isAdmin) {
      return next(new AppError('Only hotel management can respond to reviews', 403));
    }

    // Check if already responded
    if (review.managementResponse.responseText) {
      return next(new AppError('Management has already responded to this review', 400));
    }

    // Add response
    review.managementResponse = {
      responseText: responseText.trim(),
      respondedBy: req.user._id,
      respondedAt: new Date()
    };

    await review.save();

    // Populate response
    await review.populate('managementResponse.respondedBy', 'name role');

    // Track management response
    await ActivityTracker.trackActivity({
      activityType: 'review_management_response',
      req,
      userId: req.user._id,
      customData: {
        reviewId: id,
        reviewAuthor: review.user,
        responseLength: responseText.length
      }
    });

    APIResponse.success(res, {
      message: 'Management response added successfully',
      data: { 
        managementResponse: review.managementResponse
      }
    });
  });

  /**
   * Update management response
   * PATCH /api/reviews/:id/response
   */
  static updateManagementResponse = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { responseText } = req.body;

    const review = await Review.findById(id).populate('hotel');
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check permission
    const isHotelOwner = review.hotel.owner && review.hotel.owner.toString() === req.user._id.toString();
    const isOriginalResponder = review.managementResponse.respondedBy && 
                               review.managementResponse.respondedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isHotelOwner && !isOriginalResponder && !isAdmin) {
      return next(new AppError('Access denied', 403));
    }

    if (!review.managementResponse.responseText) {
      return next(new AppError('No management response to update', 404));
    }

    // Update response
    review.managementResponse.responseText = responseText.trim();
    review.managementResponse.lastModified = new Date();

    await review.save();

    APIResponse.success(res, {
      message: 'Management response updated successfully',
      data: { 
        managementResponse: review.managementResponse
      }
    });
  });

  /**
   * ============================================================================
   * ANALYTICS & INSIGHTS
   * ============================================================================
   */

  /**
   * Get review analytics for hotel
   * GET /api/reviews/analytics
   */
  static getReviewAnalytics = catchAsync(async (req, res, next) => {
    const { hotelId, period = 30 } = req.query;

    // Verify hotel ownership
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);
      if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return next(new AppError('Access denied', 403));
      }
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000));

    let matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      isDeleted: { $ne: true }
    };

    if (hotelId) {
      matchStage.hotel = mongoose.Types.ObjectId(hotelId);
    } else if (req.user.role !== 'Admin') {
      // Regular users can only see their own hotel analytics
      const userHotels = await Hotel.find({ owner: req.user._id }).select('_id');
      matchStage.hotel = { $in: userHotels.map(h => h._id) };
    }

    const analytics = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgOverallRating: { $avg: '$overallRating' },
          avgDetailedRating: { $avg: '$avgDetailedRating' },
          
          // Rating distribution
          rating5: { $sum: { $cond: [{ $eq: ['$overallRating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$overallRating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$overallRating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$overallRating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$overallRating', 1] }, 1, 0] } },
          
          // Sentiment analysis
          avgSentiment: { $avg: '$sentimentScore' },
          positiveReviews: { $sum: { $cond: [{ $eq: ['$sentimentLabel', 'positive'] }, 1, 0] } },
          negativeReviews: { $sum: { $cond: [{ $eq: ['$sentimentLabel', 'negative'] }, 1, 0] } },
          
          // Engagement metrics
          totalLikes: { $sum: { $size: '$likes' } },
          totalHelpfulVotes: { $sum: { $size: '$helpfulVotes' } },
          reviewsWithResponse: { $sum: { $cond: [{ $ne: ['$managementResponse.responseText', null] }, 1, 0] } },
          
          // Average detailed ratings
          avgCleanliness: { $avg: '$detailedRating.cleanliness' },
          avgComfort: { $avg: '$detailedRating.comfort' },
          avgLocation: { $avg: '$detailedRating.location' },
          avgFacilities: { $avg: '$detailedRating.facilities' },
          avgStaff: { $avg: '$detailedRating.staff' },
          avgValueForMoney: { $avg: '$detailedRating.valueForMoney' }
        }
      }
    ]);

    // Monthly trend
    const monthlyTrend = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          reviews: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = analytics[0] || {
      totalReviews: 0,
      avgOverallRating: 0,
      avgDetailedRating: 0
    };

    // Calculate response rate
    result.responseRate = result.totalReviews > 0 ? 
      ((result.reviewsWithResponse || 0) / result.totalReviews * 100).toFixed(1) : 0;

    APIResponse.success(res, {
      data: {
        analytics: result,
        monthlyTrend,
        period: { days: period }
      }
    });
  });

  /**
   * ============================================================================
   * HELPER METHODS
   * ============================================================================
   */

  /**
   * Auto moderate review content
   */
  static async autoModerateReview(reviewText) {
    // Simple keyword-based moderation
    const inappropriateWords = [
      'scam', 'fraud', 'fake', 'terrible', 'awful', 'horrible'
      // Add more inappropriate words
    ];

    const lowerText = reviewText.toLowerCase();
    const hasInappropriateContent = inappropriateWords.some(word => 
      lowerText.includes(word)
    );

    return !hasInappropriateContent; // Auto-approve if no inappropriate content
  }

  /**
   * Analyze sentiment of review text
   */
  static async analyzeSentiment(reviewText) {
    // Simple sentiment analysis (trong production sẽ dùng AI service)
    const positiveWords = ['excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'good', 'nice', 'clean'];
    const negativeWords = ['terrible', 'awful', 'bad', 'poor', 'dirty', 'noisy', 'rude', 'disappointing'];

    const words = reviewText.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalWords = words.length;
    const score = ((positiveCount - negativeCount) / totalWords) * 100;

    let label = 'neutral';
    if (score > 10) label = 'positive';
    if (score < -10) label = 'negative';

    return {
      score: Math.max(-100, Math.min(100, score)),
      label,
      positiveWords: positiveCount,
      negativeWords: negativeCount
    };
  }

  /**
   * Determine travel type based on booking
   */
  static determineTravelType(booking) {
    const nights = booking.nights;
    const guests = booking.totalGuests;

    if (nights <= 2) return 'Business';
    if (nights >= 7) return 'Leisure';
    if (guests > 2) return 'Family';
    return 'Leisure';
  }

  /**
   * Update hotel average rating
   */
  static async updateHotelRating(hotelId) {
    const result = await Review.aggregate([
      {
        $match: {
          hotel: mongoose.Types.ObjectId(hotelId),
          isDeleted: { $ne: true },
          isApproved: true
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
          avgCleanliness: { $avg: '$detailedRating.cleanliness' },
          avgComfort: { $avg: '$detailedRating.comfort' },
          avgLocation: { $avg: '$detailedRating.location' },
          avgFacilities: { $avg: '$detailedRating.facilities' },
          avgStaff: { $avg: '$detailedRating.staff' },
          avgValueForMoney: { $avg: '$detailedRating.valueForMoney' }
        }
      }
    ]);

    if (result.length > 0) {
      await Hotel.findByIdAndUpdate(hotelId, {
        averageRating: Number(result[0].avgRating.toFixed(1)),
        totalReviews: result[0].totalReviews,
        detailedRating: {
          cleanliness: Number(result[0].avgCleanliness.toFixed(1)),
          comfort: Number(result[0].avgComfort.toFixed(1)),
          location: Number(result[0].avgLocation.toFixed(1)),
          facilities: Number(result[0].avgFacilities.toFixed(1)),
          staff: Number(result[0].avgStaff.toFixed(1)),
          valueForMoney: Number(result[0].avgValueForMoney.toFixed(1))
        }
      });
    }
  }

  /**
   * Update room average rating
   */
  static async updateRoomRating(roomId) {
    const result = await Review.aggregate([
      {
        $match: {
          room: mongoose.Types.ObjectId(roomId),
          isDeleted: { $ne: true },
          isApproved: true
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      await Room.findByIdAndUpdate(roomId, {
        averageRating: Number(result[0].avgRating.toFixed(1)),
        totalReviews: result[0].totalReviews
      });
    }
  }

  /**
   * Update user review statistics
   */
  static async updateUserReviewStats(userId) {
    const result = await Review.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      }
    ]);

    if (result.length > 0) {
      await User.findByIdAndUpdate(userId, {
        totalReviews: result[0].totalReviews,
        averageRating: Number(result[0].avgRating.toFixed(1))
      });
    }
  }

  /**
   * Get hotel rating distribution
   */
  static async getHotelRatingDistribution(hotelId) {
    const distribution = await Review.aggregate([
      {
        $match: {
          hotel: mongoose.Types.ObjectId(hotelId),
          isDeleted: { $ne: true },
          isApproved: true
        }
      },
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } }
    ]);

    const result = {};
    for (let i = 5; i >= 1; i--) {
      result[i] = 0;
    }

    distribution.forEach(item => {
      result[item._id] = item.count;
    });

    return result;
  }
}

module.exports = ReviewController;