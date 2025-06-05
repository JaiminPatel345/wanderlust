const express = require('express');
const router = express.Router();
const {
  verifyToken,
  isListingOwner,
} = require('../utilities/middleware.js');
const asyncWrap = require('../utilities/wrapAsync.js');
const listingController = require('../controllers/listing.js');

// Search route
router.get('/search', asyncWrap(listingController.searchListings));

// Route for all listings
router.route('/').get(asyncWrap(listingController.index)) // All listings
    .post(verifyToken, asyncWrap(listingController.createListing)); // Add listing

// Routes for a specific listing
router.route('/:id').
    get(asyncWrap(listingController.singleListing)) // Show route
    .put(verifyToken,
        isListingOwner,
        asyncWrap(listingController.updateListing),
    ) // Update route
    .delete(
        verifyToken,
        isListingOwner,
        asyncWrap(listingController.destroyListing),
    );

module.exports = router;
