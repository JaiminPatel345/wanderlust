const express = require('express')
const router = express.Router()
const {listingsSchema } = require('../schema.js')
const Listing = require('../models/listing.js')
const {isLoggedIn} = require('../middleware.js')


//Manage Async errors
function asyncWrap(fn){
    return function(req , res , next){
      fn(req, res, next).catch( (err) => next(err));
    }
  }

  class ExpressError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  


  const validateListing = (req , res , next) => {
    let {error} = listingsSchema.validate(req.body);
    if(error) {
      let errMsg =  error.details.map((el) => el.message).join(",");
      res.status(err.statusCode).render("./Listings/error.ejs", { Swal, err });
    }else{
      next();
    }
  }
  

//All listing
router.get("/", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("./Listings/index.ejs", { allListings });
  });
  
  //new Listing
  router.get("/new" ,isLoggedIn ,  async (req, res) => {
    console.log('came');
    console.log(req.user);
    res.render("./Listings/new.ejs")
  });
  
  
  //Show route
  router.get("/:id", asyncWrap(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    if (!listing) {
      req.flash('error' , 'Listing not found')
      res.redirect('/listings')
    }
    res.render("./Listings/show.ejs", { listing });
  }));
  
  
  //Add route
  router.post("", validateListing ,  asyncWrap( async (req, res, next) => {
    
    
      let { title, description, image, price, location, country } = req.body;
      
      const newListing = new Listing({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country,
      });
  
      await newListing.save();
      req.flash('success' , 'New Listing Added !')
      res.redirect("/listings");
    
  })
  );
  
  
  //edit route 
  router.get("/:id/edit",isLoggedIn , asyncWrap( async (req, res) => {
    let { id } = req.params;
    let oneListing = await Listing.findById(id);
    res.render("./Listings/edit.ejs", { listing: oneListing });
  })
  );
  
  
  
  //update route
  router.put("/:id", asyncWrap( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body);
    req.flash('success' , 'Listing Updated !')
    res.redirect(`/listings/${id}`);
  })
  );
  
  
  
  //delete route
  router.delete("/:id", isLoggedIn , asyncWrap( async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('warning' , 'Listing Deleted ')
    res.redirect("/listings");
  })
  );



  

  module.exports = router;