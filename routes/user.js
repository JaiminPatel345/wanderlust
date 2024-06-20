const express = require('express')
const router = express.Router({ mergeParams: true })
// const { reviewsSchema} = require('../schema.js')
const passport = require('passport')
const { saveRedirectUrl } = require('../utilities/middleware.js')
const asyncWrap = require('../utilities/wrapAsync.js')
const userController = require('../controllers/user.js')

router.route('/signup')
    .get(asyncWrap(userController.renderSignupForm))
    .post(saveRedirectUrl, asyncWrap(userController.signup));

router.route('/login')
    .get(asyncWrap(userController.renderLoginForm))
    .post(saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), asyncWrap(userController.login));

//log out
router.get('/logout', saveRedirectUrl, userController.logout);


module.exports = router
