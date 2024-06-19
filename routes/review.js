const express = require('express')
const router = express.Router({ mergeParams : true})
const { reviewsSchema} = require('../schema.js')
const Review = require('../models/review.js')
const Listing = require('../models/listing.js')
const {isLoggedIn ,saveRedirectUrl , isReviewOwner , saveOriginalUrl , isListingOwner} = require('../middleware.js')


//Manage Async errors
function asyncWrap(fn){
    return function(req , res , next){
      fn(req, res, next).catch( (err) => next(err));
    }
  }

  class ExpressError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }

  const validateReview = (req , res , next) => {
    let {error} = reviewsSchema.validate(req.body);
    if(error) {
      let errMsg =  error.details.map((el) => el.message).join(",");
      throw new ExpressError(400 , errMsg);
    }else{
      next();
    }
  }


//Add review
router.post("/" ,isLoggedIn , saveRedirectUrl , validateReview ,  asyncWrap( async (req , res ) => {
    if(!req.isAuthenticated){
      req.flash('warning' , 'you must be logged in ')
      return res.redirect('/login')
    }
    let listing = await Listing.findById(req.params.id);
    let { rating , content} = req.body;
    let newReview = new Review({
      content : content,
      rating : parseInt(rating) ,
      owner : req.user._id
    });
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash('success' , 'New Review Added !')
    res.redirect(`/listings/${req.params.id}`)
  }));
  
  
  
  //delete review
  router.delete("/:reviewId" , isReviewOwner , asyncWrap ( async (req , res) => {
    let { id , reviewId } = req.params;
    let listing = await Listing.findById(id);
    await Review.findByIdAndDelete(reviewId);
    listing.reviews.pull(reviewId);
    await listing.save();
    req.flash('delete' , 'Review Deleted ')
    res.redirect(`/listings/${id}`);
  })
  );


  module.exports = router;