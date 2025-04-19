const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            require: true,
        },
    ],
})

module.exports = mongoose.model("User", userSchema)
