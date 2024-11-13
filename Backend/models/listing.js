const mongoose = require("mongoose")
const default_img =
    "https://img.freepik.com/free-vector/wanderlust-explore-adventure-landscape_24908-55313.jpg?w=740&t=st=1711876159~exp=1711876759~hmac=b91c9ca5ccaf8ba289e930b3c62030b97c46e70ad36177b312e199938db1c47c"
const Review = require("./review.js")

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        filename: String,
        url: {
            type: String,
            default: default_img,
            set: (v) => (v === "" ? default_img : v),
        },
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
        set: (v) => v.toUpperCase(),
    },
    country: {
        type: String,
        set: (v) => v.toUpperCase(),
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    tags: [
        {
            type: String,
            // enum: ["Trending", "Rooms", "Iconic cities", "Mountains", "Castles", "Amazing pools", "Camping", "Farms", "Arctic"]
        },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
})

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
})

const Listing = mongoose.model("Listing", listingSchema)
module.exports = Listing
