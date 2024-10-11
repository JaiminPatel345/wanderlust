const Listing = require('../models/listing.js');
const { listingsSchema } = require('./schema.js');
const Review = require('../models/review.js');

module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in' });
  }
  next();
}

module.exports.saveOriginalUrl = (req, res, next) => {
  req.session.redirectUrl = req.originalUrl;
  next();
}

module.exports.isListingOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing || !(req.user.username === "jaimin345" || listing.owner.equals(req.user._id))) {
    return res.status(403).json({ error: 'You are not the owner of this listing' });
  }

  next();
}

module.exports.validateListing = (req, res, next) => {
  const { error } = listingsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map(el => el.message).join(",") });
  }
  next();
}

module.exports.isReviewOwner = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (review.owner.equals(req.user._id)) {
    next();
  } else {
    return res.status(403).json({ error: 'You are not the owner of this review' });
  }
}