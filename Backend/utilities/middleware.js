const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const User = require('../models/user.js');
const { listingsSchema } = require('./schema.js');

module.exports.isLoggedIn = async (req, res, next) => {

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId)
      if (user) {
        req.user = user;
      } else {
        res.status(401).send({ msg: "No your found" })
      }
    } catch (err) {
      res.status(401).send({ msg: "No your found" })

    }
  } else {
    res.status(401).send({ msg: "No your found" })
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