const express = require('express');
const router = express.Router();
const asyncWrap = require('../utilities/wrapAsync.js');
const userController = require('../controllers/user.js');

router.route('/signup')
    .post(asyncWrap(userController.signup));

router.route('/login')
    .post(asyncWrap(userController.login));

router.route('/islogin')
    .get(asyncWrap(userController.isLogin))
// // Log out
// router.get('/logout', userController.logout);

module.exports = router;
