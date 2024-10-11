if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const { isLoggedIn, saveOriginalUrl } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const chatsController = require('../controllers/chat.js')


router.route('/')
    .get(saveOriginalUrl, isLoggedIn, asyncWrap(chatsController.renderChats)) //All Chats

module.exports = router;