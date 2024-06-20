const User = require('../models/user.js')


module.exports.renderSignupForm = async (req, res, next) => {
    res.render('./Users/signup.ejs')
}

module.exports.signup = async (req, res, next) => {
    try {
        let { username, name, email, password } = req.body;
        const newUser = new User({
            username: username,
            email: email,
            name: name
        });
        const registerUser = await User.register(newUser, password)
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) { return next(err) }
            req.flash('success', `Welcome to Wanderlust ${name}`);
            res.redirect(res.locals.redirectUrl)
        });

    } catch (e) {
        console.log(e);
        req.flash('error', e.message)
        res.redirect('/signup')
    }
}


module.exports.renderLoginForm = async (req, res, next) => {
    res.render('./Users/login.ejs')
}

module.exports.login = async (req, res, next) => {
    const user = await User.findOne({ 'username': req.body.username });
    req.flash('success', `Welcome to Wanderlust  ${user.name}`);
    res.redirect(res.locals.redirectUrl)

}

module.exports.logout = async (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('warning', 'Logged out successfully'); // Add this line to set the flash message
        res.redirect(res.locals.redirectUrl);
    });
}