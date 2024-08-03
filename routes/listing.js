if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const { isLoggedIn, saveOriginalUrl, isListingOwner, validateListing } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const listingController = require('../controllers/listing.js')
const multer = require('multer')
const { storage } = require('../cloudConfig.js')
const upload = multer({ storage })


router.route('/')
    .get(saveOriginalUrl, asyncWrap(listingController.index)) //All listing
    .post(isLoggedIn, upload.single('image'), asyncWrap(listingController.createListing)); // add route

//new Listing
router.get("/new", saveOriginalUrl, isLoggedIn, asyncWrap(listingController.renderNewListingForm));

router.route('/:id')
    .get(saveOriginalUrl, asyncWrap(listingController.showListing)) //Show route
    .put(isLoggedIn, isListingOwner, upload.single('image'), asyncWrap(listingController.updateListing)) //update route
    .delete(isLoggedIn, isListingOwner, asyncWrap(listingController.destroyListing)); //delete route

//edit route 
router.get("/:id/edit", saveOriginalUrl, isLoggedIn, isListingOwner, asyncWrap(listingController.renderEditListing));

router.route('/:id/book')
    .get((req, res) => { res.send("Very soon build book facility") }) // for book  




module.exports = router;