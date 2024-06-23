const Listing = require('../models/listing.js')
const { listingsSchema, reviewsSchema } = require('./schema.js')
const Review = require('../models/review.js')

module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'you must be logged in ')
    // res.render("./Listings/error.ejs", { Swal, msg : err.message });
    return res.redirect('/login')
  }
  next();
}

module.exports.saveOriginalUrl = (req, res, next) => {
  req.session.redirectUrl = req.originalUrl
  next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
  res.locals.redirectUrl = (req.session.redirectUrl || '/listings')
  next()
}


module.exports.isListingOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (listing.owner.equals(req.user._id)) {
    next();
  } else {
    req.flash('error', 'You are not the owner of this listing')
    res.redirect(`/listings/${id}`)
  }
}

//check for delete review
module.exports.isReviewOwner = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (review.owner.equals(req.user._id)) {
    next();
  } else {
    req.flash('error', 'You are not the owner of this review')
    res.redirect(`/listings/${id}`)
  }
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingsSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    // res.status(error.statusCode).render("./Listings/error.ejs", { Swal, error });
    throw error
  } else {
    next();
  }
}

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewsSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}


