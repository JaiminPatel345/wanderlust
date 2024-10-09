if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const { isLoggedIn, saveOriginalUrl, isListingOwner } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const listingController = require('../controllers/listing.js')
const chatsController = require('../controllers/chat.js')


router.route('/')
    .get(saveOriginalUrl, isLoggedIn, asyncWrap(chatsController.renderChats)) //All Chats


router.route('/:id') //specific chat with person 
    .get(saveOriginalUrl, isLoggedIn, isListingOwner, asyncWrap(chatsController.renderIndivisualChat))

// router.route('/listing/:id')
//     .get(saveOriginalUrl, isLoggedIn, isListingOwner, asyncWrap(chatsController.listingChats))

module.exports = router;