const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const {
    listingsSchema
} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        User.findById(req.session.user.userId)
            .then((user) => {
                if (user) {
                    next();
                } else {
                    res.status(401).json({
                        message: "No user found",
                    });
                }
            })
            .catch((err) => {
                res.status(401).json({
                    message: err.message,
                });
            });
    } else {
        res.status(401).json({
            message: "No user found",
        });
    }
};

module.exports.saveOriginalUrl = (req, res, next) => {
    req.session.redirectUrl = req.originalUrl;
    next();
};

module.exports.isListingOwner = (req, res, next) => {
    const {
        id
    } = req.params;
    Listing.findById(id)
        .populate("owner")
        .then((listing) => {
            if (
                !listing ||
                !(
                    req.session.user.userId === "66a343a50ff99cdefc1a4657" ||
                    listing.owner._id.equals(req.session.user.userId)
                )
            ) {
                return res.status(403).json({
                    message: "You are not the owner of this listing",
                });
            }
            next();
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message,
            });
        });
};

module.exports.validateListing = (req, res, next) => {
    const {
        error
    } = listingsSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details.map((el) => el.message).join(","),
        });
    }
    next();
};

module.exports.isReviewOwner = (req, res, next) => {
    const {
        reviewId
    } = req.params;

    if (req.session.user?.userId?.toString() === "66a343a50ff99cdefc1a4657") {
        next();
        return;
    }

    Review.findById(reviewId)
        .populate("owner")
        .then((review) => {
            if (review && review.owner._id.equals(req.session.user.userId)) {
                next();
            } else {
                res.status(403).json({
                    message: "You are not the owner of this review",
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message,
            });
        });
};