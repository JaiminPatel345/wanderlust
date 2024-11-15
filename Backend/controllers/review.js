const Review = require("../models/review.js")
const Listing = require("../models/listing.js")

// Create a new review
module.exports.createReview = (req, res) => {
    const {
        id
    } = req.params;
    const {
        rating,
        content
    } = req.body;

    Listing.findById(id)
        .then((listing) => {
            const newReview = new Review({
                content,
                rating: parseInt(rating),
                owner: req.session.user.userId,
            });

            listing.reviews.push(newReview);
            return Promise.all([newReview.save(), listing.save()]);
        })
        .then(([review]) => {
            res.status(201).json({
                message: "New Review Added!",
                review
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error creating review",
                error: error.message,
            });
        });
};

// Delete a review
module.exports.destroyReview = (req, res) => {
    const {
        id,
        reviewId
    } = req.params;

    Listing.findById(id)
        .then((listing) => {
            return Promise.all([
                Review.findByIdAndDelete(reviewId),
                listing.reviews.pull(reviewId),
                listing.save(),
            ]);
        })
        .then(() => {
            res.json({
                message: "Review Deleted"
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error deleting review",
                error: error.message,
            });
        });
};