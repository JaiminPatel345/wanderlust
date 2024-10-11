const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewOwner } = require('../utilities/middleware.js');
const asyncWrap = require('../utilities/wrapAsync.js');
const reviewController = require('../controllers/review.js');

// Add review
router.post("/", isLoggedIn, asyncWrap(reviewController.createReview));

// Delete review
router.delete("/:reviewId", isReviewOwner, asyncWrap(reviewController.destroyReview));

module.exports = router;
