const express = require('express')
const router = express.Router({ mergeParams: true })
const { isLoggedIn, saveRedirectUrl, isReviewOwner, validateReview, saveOriginalUrl, isListingOwner } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const reviewController = require('../controllers/review.js')


//Add review
router.post("/", isLoggedIn, saveRedirectUrl, validateReview, asyncWrap(reviewController.createReview));

//delete review
router.delete("/:reviewId", isReviewOwner, asyncWrap(reviewController.destroyReview));


module.exports = router;