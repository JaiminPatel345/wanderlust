const express = require('express')
const router = express.Router()
const { isLoggedIn, saveOriginalUrl, isListingOwner, validateListing } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const listingController = require('../controllers/listing.js')


router.route('/')
    .get(saveOriginalUrl, asyncWrap(listingController.index)) //All listing
    .post(validateListing, asyncWrap(listingController.createListing)); // add route

//new Listing
router.get("/new", saveOriginalUrl, isLoggedIn, asyncWrap(listingController.renderNewListingForm));

router.route('/:id')
    .get(saveOriginalUrl, asyncWrap(listingController.showListing)) //Show route
    .put(asyncWrap(listingController.updateListing)) //update route
    .delete(isLoggedIn, isListingOwner, asyncWrap(listingController.destroyListing)); //delete route

//edit route 
router.get("/:id/edit", saveOriginalUrl, isLoggedIn, isListingOwner, asyncWrap(listingController.renderEditListing));




module.exports = router;