const Review = require("../models/review.js")
const Listing = require("../models/listing.js")
const Analytics = require("../models/analytics.js")
const { createNotification } = require("./notification.js")
const { emitAnalyticsUpdate } = require('../utilities/socket');

// Create a new review
module.exports.createReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, content } = req.body;

        if (!rating || !content) {
            return res.status(400).json({
                success: false,
                message: "Rating and content are required"
            });
        }

        const listing = await Listing.findById(id).populate('owner');
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        // Check if user has already reviewed this listing
        const existingReview = await Review.findOne({
            owner: req.user.userId,
            _id: { $in: listing.reviews }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this listing"
            });
        }

        const newReview = new Review({
            content,
            rating: parseInt(rating),
            owner: req.user.userId,
        });

        listing.reviews.push(newReview);

        try {
            // Create notification for listing owner
            await createNotification({
                recipient: listing.owner._id,
                type: 'REVIEW',
                title: 'New Review Received',
                message: `Your listing "${listing.title}" received a new ${rating}-star review`,
                relatedListing: listing._id,
                relatedUser: req.user.userId
            });
        } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Continue with review creation even if notification fails
        }

        // Update analytics
        try {
            let analytics = await Analytics.findOne({ listing: id });
            if (analytics) {
                analytics.reviews.total += 1;
                
                // Update average rating
                const totalRating = analytics.reviews.average_rating * (analytics.reviews.total - 1) + parseInt(rating);
                analytics.reviews.average_rating = totalRating / analytics.reviews.total;
                
                analytics.lastUpdated = new Date();
                await analytics.save();

                // Emit analytics update
                emitAnalyticsUpdate(id, {
                    type: 'REVIEW_ADDED',
                    data: {
                        totalReviews: analytics.reviews.total,
                        averageRating: analytics.reviews.average_rating
                    }
                });
            }
        } catch (analyticsError) {
            console.error("Error updating analytics:", analyticsError);
            // Continue with review creation even if analytics update fails
        }

        await Promise.all([newReview.save(), listing.save()]);

        res.status(201).json({
            success: true,
            message: "New Review Added!",
            review: newReview
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({
            success: false,
            message: "Error creating review",
            error: error.message,
        });
    }
};

// Delete a review
module.exports.destroyReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Update analytics
        const analytics = await Analytics.findOne({ listing: id });
        if (analytics) {
            analytics.reviews.total -= 1;
            
            // Update average rating
            if (analytics.reviews.total > 0) {
                const totalRating = analytics.reviews.average_rating * (analytics.reviews.total + 1) - review.rating;
                analytics.reviews.average_rating = totalRating / analytics.reviews.total;
            } else {
                analytics.reviews.average_rating = 0;
            }
            
            analytics.lastUpdated = new Date();
            await analytics.save();
        }

        await Promise.all([
            Review.findByIdAndDelete(reviewId),
            listing.reviews.pull(reviewId),
            listing.save(),
        ]);

        res.json({
            success: true,
            message: "Review Deleted"
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting review",
            error: error.message,
        });
    }
};