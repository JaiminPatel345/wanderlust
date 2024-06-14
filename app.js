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

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

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

app.get("/", (req, res) => {
  res.render('./Listings/home.ejs');
});

app.use( (req , res , next) => {
  res.locals.success = req.flash('success');
  res.locals.del = req.flash('delete');
  next();
})

app.use('/listings/:id/reviews' , reviews);  
app.use('/listings' , listings);

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err);
  
  res.status(err.statusCode).render("./Listings/error.ejs", { Swal, err });
});

app.listen(port, () => console.log(`listen on port ${port}`));
