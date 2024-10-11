const express = require('express');
const router = express.Router();
const { isLoggedIn, isListingOwner, validateListing } = require('../utilities/middleware.js');
const asyncWrap = require('../utilities/wrapAsync.js');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Route for all listings
router.route('/')
    .get(asyncWrap(listingController.index)) // All listings
    .post(isLoggedIn, upload.single('image'), asyncWrap(listingController.createListing)); // Add listing

// New Listing form
router.get("/new", isLoggedIn, asyncWrap(listingController.renderNewListingForm));

// Routes for a specific listing
router.route('/:id')
    .get(asyncWrap(listingController.showListing)) // Show route
    .put(isLoggedIn, isListingOwner, upload.single('image'), asyncWrap(listingController.updateListing)) // Update route
    .delete(isLoggedIn, isListingOwner, asyncWrap(listingController.destroyListing)); // Delete route

// Edit route
router.get("/:id/edit", isLoggedIn, isListingOwner, asyncWrap(listingController.renderEditListing));

// Temporary route for booking
router.get("/:id/book", (req, res) => {
    res.json({ message: "Very soon build book facility" });
});

module.exports = router;
