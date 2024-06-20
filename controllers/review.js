const Review = require('../models/review.js')
const Listing = require('../models/listing.js')


//create  new 
module.exports.createReview = async (req, res) => {
    if (!req.isAuthenticated) {
        req.flash('warning', 'you must be logged in ')
        return res.redirect('/login')
    }
    let listing = await Listing.findById(req.params.id);
    let { rating, content } = req.body;
    let newReview = new Review({
        content: content,
        rating: parseInt(rating),
        owner: req.user._id
    });
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash('success', 'New Review Added !')
    res.redirect(`/listings/${req.params.id}`)
}

//delete
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    let listing = await Listing.findById(id);
    await Review.findByIdAndDelete(reviewId);
    listing.reviews.pull(reviewId);
    await listing.save();
    req.flash('delete', 'Review Deleted ')
    res.redirect(`/listings/${id}`);
}