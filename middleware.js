
module.exports.isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'you must be logged in ')
    // res.render("./Listings/error.ejs", { Swal, msg : err.message });
    return res.redirect('/login')
  }
  next();
}

module.exports.saveOriginalUrl = (req, res, next) => {
  req.session.redirectUrl = req.originalUrl
  next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
  res.locals.redirectUrl = (req.session.redirectUrl || '/listings/test')
  next()
}