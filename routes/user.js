const express = require('express')
const router = express.Router({ mergeParams: true })
// const { reviewsSchema} = require('../schema.js')
const User = require('../models/user.js')
const passport = require('passport')


//Manage Async errors
function asyncWrap(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(() => next());
    }
}

class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}


router.get('/signup', asyncWrap(async (req, res, next) => {
    res.render('./Users/signup.ejs')
}))

router.post('/signup', asyncWrap(async (req, res, next) => {
    try {
        let { username,name , email, password } = req.body;
        const newUser = new User({
            username: username,
            email: email,
            name : name
        });
        const registerUser = await User.register(newUser, password)
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) { return  next(err) }
            req.flash('success', `Welcome to Wanderlust ${name}`);
            res.redirect('/listings')
          });

    } catch (e) {
        console.log(e);
        req.flash('error', e.message)
        res.redirect('/signup')
    }


}))


router.get('/login', asyncWrap(async (req, res, next) => {
    res.render('./Users/login.ejs')
}))

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), asyncWrap(async (req, res, next) => {
    const user = await User.findOne({'username' : req.body.username});
    req.flash('success', `Welcome to Wanderlust  ${user.name}`);
    res.redirect('/listings')

}))

  //log out
  router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully'); // Add this line to set the flash message
        res.redirect('/listings');
    });
});


module.exports = router
