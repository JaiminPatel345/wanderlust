const express = require('express');
const router = express.Router();
const passport = require('passport');
const { saveRedirectUrl } = require('../utilities/middleware.js');
const asyncWrap = require('../utilities/wrapAsync.js');
const userController = require('../controllers/user.js');

router.route('/signup')
    .get(asyncWrap(userController.renderSignupForm))
    .post(asyncWrap(userController.signup));

router.route('/login')
    .get(asyncWrap(userController.renderLoginForm))
    .post(passport.authenticate('local', { failureFlash: true }), asyncWrap(userController.login));

// Log out
router.get('/logout', userController.logout);

module.exports = router;
