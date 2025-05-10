const express = require("express")
const router = express.Router()
const asyncWrap = require("../utilities/wrapAsync.js")
const userController = require("../controllers/user.js")
const { isLoggedIn, verifyToken } = require("../utilities/middleware.js")
const { rateLimiters } = require("../utilities/rateLimiter.js")

router.route("/signup").post(asyncWrap(userController.signup))

router.route("/login").post(rateLimiters.login, asyncWrap(userController.login))

router.route("/logout").post(asyncWrap(userController.logout))

// router.route("/islogin").get(asyncWrap(userController.isLogin))

// Password reset routes
router.route("/forgot-password").post(rateLimiters.passwordReset, asyncWrap(userController.forgotPassword))

router.route("/reset-password").post(asyncWrap(userController.resetPassword))

// Change password (requires authentication)
router.route("/change-password").post(verifyToken, rateLimiters.passwordChange, asyncWrap(userController.changePassword))

// Profile management routes
router.route("/profile")
    .get(verifyToken, asyncWrap(userController.getProfile))
    .put(verifyToken, asyncWrap(userController.updateProfile))

router.route("/profile/name").put(verifyToken, asyncWrap(userController.updateName))

router.route("/cloudinary-signature").get(verifyToken, asyncWrap(userController.getCloudinarySignature))

// Bookmark routes
router.route("/bookmarks")
    .get(verifyToken, asyncWrap(userController.getBookmarks))

router.route("/bookmarks/:listingId")
    .post(verifyToken, asyncWrap(userController.addBookmark))
    .delete(verifyToken, asyncWrap(userController.removeBookmark))

module.exports = router
