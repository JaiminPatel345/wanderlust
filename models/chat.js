const mongoose = require("mongoose")

//chat is array of msg
const chatSchema = new mongoose.Schema({
    // listing: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Listing",
    // },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    chats: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Message"
    }],
})

module.exports = mongoose.model("chat", chatSchema)