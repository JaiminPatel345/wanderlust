const express = require("express")
const router = express.Router()
const asyncWrap = require("../utilities/wrapAsync.js")
const userController = require("../controllers/user.js")
const { isLoggedIn } = require("../utilities/middleware.js")
const { rateLimiters } = require("../utilities/rateLimiter.js")

router.route("/signup").post(asyncWrap(userController.signup))

router.route("/login").post(rateLimiters.login, asyncWrap(userController.login))

router.route("/logout").post(asyncWrap(userController.logout))

router.route("/islogin").get(asyncWrap(userController.isLogin))

// Password reset routes
router.route("/forgot-password").post(rateLimiters.passwordReset, asyncWrap(userController.forgotPassword))

router.route("/reset-password").post(rateLimiters.passwordReset, asyncWrap(userController.resetPassword))

// Change password (requires authentication)
router.route("/change-password").post(isLoggedIn, rateLimiters.passwordChange, asyncWrap(userController.changePassword))

// Profile management routes
router.route("/profile")
    .get(isLoggedIn, asyncWrap(userController.getProfile))
    .put(isLoggedIn, asyncWrap(userController.updateProfile))

router.route("/profile/name").put(isLoggedIn, asyncWrap(userController.updateName))

router.route("/cloudinary-signature").get(isLoggedIn, asyncWrap(userController.getCloudinarySignature))

// Bookmark routes
router.route("/bookmarks")
    .get(isLoggedIn, asyncWrap(userController.getBookmarks))

router.route("/bookmarks/:listingId")
    .post(isLoggedIn, asyncWrap(userController.addBookmark))
    .delete(isLoggedIn, asyncWrap(userController.removeBookmark))

module.exports = router
