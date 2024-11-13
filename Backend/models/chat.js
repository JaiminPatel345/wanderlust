const mongoose = require("mongoose")

//chat is array of message
const chatSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
    lastMessage: {
        type: String,
        default: "",
    },
    isLastMessageYours: {
        type: Boolean,
        default: false,
    }, // whether the last message is doen by you
})

module.exports = mongoose.model("Chat", chatSchema)
