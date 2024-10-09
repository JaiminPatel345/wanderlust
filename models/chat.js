const mongoose = require("mongoose")

//chat is array of msg
const chatSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
})

module.exports = mongoose.model("chat", chatSchema)