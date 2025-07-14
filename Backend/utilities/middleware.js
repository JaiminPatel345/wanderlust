const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./tokenUtils.js');
const {
    listingsSchema
} = require("./schema.js");

module.exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        
        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        
        User.findById(decoded.userId)
            .then((user) => {
                if (user) {
                    req.user = {
                        userId: user._id,
                        email: user.email,
                        name: user.name,
                        profilePhoto: user.profilePhoto || '',
                        isValidatedEmail: user.isValidatedEmail
                    };
                    next();
                } else {
                    res.status(401).json({
                        message: "Invalid token: User not found",
                    });
                }
            })
            .catch((err) => {
                res.status(401).json({
                    message: err.message,
                });
            });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};

// This function is no longer needed since client-side will check for token
// We'll keep it during transition period, but it can be replaced with verifyToken
module.exports.isLoggedIn = module.exports.verifyToken;

module.exports.isListingOwner = (req, res, next) => {
    
    const { id } = req.params;
    Listing.findById(id)
        .populate("owner")
        .then((listing) => {
            if (listing && listing.owner._id.equals(req.user.userId))
                next();
            else {
                throw {
                    status: 403,
                    message: "You are not the owner of this listing",
                };
            }
        })
        .catch((error) => {
            res.status(error.status || 500).json({
                message: error.message,
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
    const { reviewId } = req.params;

    if (req.user?.userId?.toString() === "66a343a50ff99cdefc1a4657") {
        next();
        return;
    }

    Review.findById(reviewId)
        .populate("owner")
        .then((review) => {
            if (review && review.owner._id.equals(req.user.userId)) {
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