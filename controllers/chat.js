const Listing = require('../models/listing.js')
const Chats = require('../models/chat')
const Messages = require('../models/message')

module.exports.renderChats = async (req, res, next) => {

    res.render('./Chats/index.ejs', { user: req.user })
}


module.exports.listingChats = async (req, res, next) => {

}

module.exports.renderIndivisualChat = async (req, res, next) => {

}

