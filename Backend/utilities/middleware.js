const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const User = require('../models/user.js');
const { listingsSchema } = require('./schema.js');

module.exports.isLoggedIn = async (req, res, next) => {

  if (req.session && req.session.user) {
    try {
      const user = await User.findById(req.session.user.userId)
      if (user) {
        req.user = user;
        next();

      } else {
        res.status(401).send({ message: "No your found" })
      }
    } catch (err) {
      res.status(401).send({ message: "No your found" })

    }
  } else {
    res.status(401).send({ message: "No your found" })
  }
}

module.exports.saveOriginalUrl = (req, res, next) => {
  req.session.redirectUrl = req.originalUrl;
  next();
}

module.exports.isListingOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing || !(req.session.user.userId === "66a343a50ff99cdefc1a4657" || listing.owner._id.equals(req.session.user.userId))) {
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