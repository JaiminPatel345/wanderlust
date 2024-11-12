const Review = require("../models/review.js")
const Listing = require("../models/listing.js")

// Create a new review
module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    const { rating, content } = req.body

    const newReview = new Review({
        content: content,
        rating: parseInt(rating),
        owner: req.session.user.userId,
    })

    listing.reviews.push(newReview)
    const response = await newReview.save()
    await listing.save()

    res.status(201).json({ message: "New Review Added!", review: response }) // Send success message and new review
}

// Delete a review
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params
    const listing = await Listing.findById(id)

    await Review.findByIdAndDelete(reviewId)
    listing.reviews.pull(reviewId)
    await listing.save()

    res.json({ message: "Review Deleted" }) // Send success message
}
