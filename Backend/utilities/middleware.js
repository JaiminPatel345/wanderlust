const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const User = require("../models/user.js")
const {
    listingsSchema
} = require("./schema.js")

module.exports.isLoggedIn = async (req, res, next) => {
    console.log(req.session);

    if (req.session && req.session.user) {
        try {
            const user = await User.findById(req.session.user.userId)
            if (user) {
                next()
            } else {
                res.status(401).send({
                    message: "No your found"
                })
            }
        } catch (err) {
            res.status(401).send({
                message: err.message
            })
        }
    } else {
        res.status(401).send({
            message: "No user found"
        })
    }
}

module.exports.saveOriginalUrl = (req, res, next) => {
    req.session.redirectUrl = req.originalUrl
    next()
}

module.exports.isListingOwner = async (req, res, next) => {
    const {
        id
    } = req.params
    const listing = await Listing.findById(id).populate("owner")

    if (
        !listing ||
        !(
            req.session.user.userId === "66a343a50ff99cdefc1a4657" ||
            listing.owner._id.equals(req.session.user.userId)
        )
    ) {
        return res
            .status(403)
            .json({
                message: "You are not the owner of this listing"
            })
    }

    next()
}

module.exports.validateListing = (req, res, next) => {
    const {
        error
    } = listingsSchema.validate(req.body)
    if (error) {
        return res
            .status(400)
            .json({
                message: error.details.map((el) => el.message).join(",")
            })
    }
    next()
}

module.exports.isReviewOwner = async (req, res, next) => {
    const {
        reviewId
    } = req.params

    if (req.session.user?.userId?.toString() === "66a343a50ff99cdefc1a4657") {
        next()
        return

    }


    let review = await Review.findById(reviewId).populate("owner")

    if (review && review.owner._id.equals(req.session.user.userId)) {
        next()
        return
    } else {
        return res
            .status(403)
            .json({
                message: "You are not the owner of this review"
            })

    }
}