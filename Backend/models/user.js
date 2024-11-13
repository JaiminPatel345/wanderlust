const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    email: {
        type: String,
        required: true,
    },
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            require: true,
        },
    ],
})

module.exports = mongoose.model("User", userSchema)
