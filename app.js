const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Swal = require('sweetalert2');
const session = require('express-session')
const flash = require('connect-flash')
const port = 3000;
const app = express();
const passport = require('passport')
const LocalStrategy = require('passport-local')
app.use(require('cookie-parser')())

const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user.js');

const User = require('./models/user.js');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine('ejs', ejsMate);

main()
  .then(() => console.log("connection successfully"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires : Date.now() + 1000*3600*24 ,
    maxAge : 1000*3600*24*3

   }
}))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render('./Listings/home.ejs');
});

app.use( (req , res , next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  next();
})

app.use('/listings/:id/reviews' , reviewsRoutes);  
app.use('/listings' , listingsRoutes);
app.use('/' , usersRoutes);

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err);
  
  res.status(err.statusCode).render("./Listings/error.ejs", { Swal, msg : err.message });
});

app.listen(port, () => console.log(`listen on port ${port}`));
