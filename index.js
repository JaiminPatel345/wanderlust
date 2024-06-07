const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require('ejs-mate');
const Swal = require('sweetalert2');
const {listingsSchema} = require('./schema.js');
const port = 3000;
const app = express();

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

app.get("/", (req, res) => {
  res.render('./Listings/home.ejs');
});

//Manage Async errors
function asyncWrap(fn){
  return function(req , res , next){
    fn(req, res, next).catch( (err) => next(err));
  }
}


//All listing
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("./Listings/index.ejs", { allListings });
});

//new Listing
app.get("/listings/new", async (req, res) => {
  res.render("./Listings/new.ejs");
});

//Show route
app.get("/listings/:id", asyncWrap(async (req, res) => {
  let { id } = req.params;
  let oneListing = await Listing.findById(id);
  res.render("./Listings/show.ejs", { listing: oneListing });
}));

//Add route
app.post("/listings", asyncWrap( async (req, res, next) => {
  
  
    let { title, description, image, price, location, country } = req.body;
    // if(!title || !description || !price || !location || !country) {
    //   res.status(400).send("Enter all details")
    // }

    let result = listingsSchema.validate(req.body);
    console.log(result);
    
    const newListing = new Listing({
      title: title,
      description: description,
      image: image,
      price: price,
      location: location,
      country: country,
    });

    await newListing.save();
    res.redirect("/listings");
  
})
);


//edit route 
app.get("/listings/:id/edit", asyncWrap( async (req, res) => {
  let { id } = req.params;
  let oneListing = await Listing.findById(id);
  res.render("./Listings/edit.ejs", { listing: oneListing });
})
);



//update route
app.put("/listings/:id", asyncWrap( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body);

  res.redirect(`/listings/${id}`);
})
);



//delete route
app.delete("/listings/:id", asyncWrap( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
})
);


// Error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err);
  
  res.status(500).render("./Listings/error.ejs", { Swal, err });
});



app.listen(port, () => console.log(`listen on port ${port}`));
