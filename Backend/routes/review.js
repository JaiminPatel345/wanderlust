const express = require("express")
const router = express.Router({ mergeParams: true })
const {  verifyToken, isReviewOwner } = require("../utilities/middleware.js")
const asyncWrap = require("../utilities/wrapAsync.js")
const reviewController = require("../controllers/review.js")

// Add review
router.post("/", verifyToken, asyncWrap(reviewController.createReview))

// Delete review
router.delete(
    "/:reviewId",
    verifyToken,
    isReviewOwner,
    asyncWrap(reviewController.destroyReview)
)

module.exports = router
