const Listing = require('../models/listing.js')
const Chat = require('../models/chat')
const Message = require('../models/message')
const mongoose = require("mongoose");
const User = require('../models/user');

module.exports.renderChats = async (req, res, next) => {

    // const { mode } = req.params

    // const user = await User.findById(req.user._id).populate({
    //     path: 'chats',
    //     populate: {
    //         path: 'owner'
    //     }
    // })

    // console.log(user);

    const fakeChats = [
        {
            _id: 1,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Alice"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "See you tomorrow!",
            isLastMessageYours: true
        },
        {
            _id: 2,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Bob"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "I'll send the report soon.",
            isLastMessageYours: false
        },
        {
            _id: 3,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Charlie"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Got it, thanks!",
            isLastMessageYours: true
        },
        {
            _id: 4,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Diana"
            },
            chats: [
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "When can we meet?",
            isLastMessageYours: false
        },
        {
            _id: 5,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Eve"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Thanks for the update!",
            isLastMessageYours: true
        },
        {
            _id: 6,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Frank"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Call me when you're free.",
            isLastMessageYours: false
        },
        {
            _id: 7,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Grace"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Meeting postponed to 3 PM.",
            isLastMessageYours: true
        },
        {
            _id: 8,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Henry"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Let's catch up later.",
            isLastMessageYours: false
        },
        {
            _id: 9,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Ivy"
            },
            chats: [
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "Got the files, thank you!",
            isLastMessageYours: true
        },
        {
            _id: 10,
            listing: new mongoose.Types.ObjectId(),
            user: {
                _id: new mongoose.Types.ObjectId(),
                name: "Jack"
            },
            chats: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            lastMessage: "When are we starting?",
            isLastMessageYours: false
        }
    ];



    res.render('./Chats/index.ejs', {
        user: {
            username: 'jaimin345',
            name: 'Jaimin'
        }, chats: fakeChats
    })
}
