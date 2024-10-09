const chats = require('../models/chat')
const messages = require('../models/message')

module.exports.renderChatPage = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if (!listing) {
        req.flash('error', 'Listing not found')
        return res.redirect('/listings')
    }
    let chat = await chats.findOne({ participants: { $all: [req.user._id, listing.owner] } })
    if (!chat) {
        chat = await chats.create({ participants: [req.user._id, listing.owner] })
    }
    let messages = await messages.find({ chat: chat._id }).populate('owner')
    res.render('./chat.ejs', { chat, messages })

}