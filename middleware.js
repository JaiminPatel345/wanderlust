
const isLoggedIn = async (req , res , next) => {
    if(!req.isAuthenticated()){
      req.flash('error' , 'you must be logged in ')
      // res.render("./Listings/error.ejs", { Swal, msg : err.message });
      return res.redirect('/login')
    }
    next();
}



module.exports = {isLoggedIn}