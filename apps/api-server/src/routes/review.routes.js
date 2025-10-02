/**
 * Review Routes for CheckInn Hotel Booking Platform
 * 
 * Defines all review-related API endpoints với engagement features
 * và moderation capabilities
 * 
 * @author CheckInn Team  
 * @version 1.0.0
 */

const express = require('express');
const ReviewController = require('../controllers/review.controller');
const middleware = require('../middlewares');

const router = express.Router();

/**
 * ============================================================================
 * PUBLIC ROUTES (No authentication required)
 * ============================================================================
 */

/**
 * Review Discovery & Reading
 */
router.get('/', ReviewController.getReviews);
router.get('/:id', ReviewController.getReviewById);

/**
 * ============================================================================
 * PROTECTED ROUTES (Authentication required)
 * ============================================================================
 */

// Apply protected route middleware for authenticated operations
middleware.utils.applyMiddleware(router, middleware.routes.protected);

/**
 * Review Management  
 */
router.post('/', ReviewController.createReview);

router
  .route('/:id')
  .patch(ReviewController.updateReview)
  .delete(ReviewController.deleteReview);

/**
 * Review Engagement
 */
router.post('/:id/vote', ReviewController.voteReviewHelpful);
router.post('/:id/like', ReviewController.toggleReviewLike);

/**
 * Management Response (Hotel Owners)
 */
router
  .route('/:id/response')
  .post(ReviewController.addManagementResponse)
  .patch(ReviewController.updateManagementResponse);

/**
 * ============================================================================
 * ANALYTICS & INSIGHTS
 * ============================================================================
 */

/**
 * Review Analytics (Hotel Owners & Admin)
 */
router.get('/analytics/overview', ReviewController.getReviewAnalytics);

module.exports = router;