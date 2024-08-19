const Listing = require('../models/listing.js')

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("./Listings/index.ejs", { allListings });
}

module.exports.renderNewListingForm = async (req, res) => {
  res.render("./Listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'owner'
      }
    })
    .populate('owner');
  // console.log(listing);
  if (!listing) {
    req.flash('error', 'Listing not found')
    res.redirect('/listings')
  }
  res.render("./Listings/show.ejs", { listing });
}

//Add 
module.exports.createListing = async (req, res, next) => {

  const { title, description, price, location, country } = req.body;
  let { tagsArray } = req.body;
  if (typeof tagsArray === 'string') {
    tagsArray = JSON.parse(tagsArray);
  }
  //console.log(tagsArray);

  let image;
  if (req.file) {
    const { path, filename } = req.file
    image = {
      url: path,
      filename: filename,
    }
  } else {
    image = {
      url: req.body.image,
      filename: 'listingimage'
    }
  }

  const newListing = new Listing({
    title: title,
    description: description,
    image,
    price: price,
    location: location,
    country: country,
    tags: tagsArray,
    owner: req.user._id
  });

  const result = await newListing.save();
  req.flash('success', 'New Listing Added !')
  res.redirect(`/listings/${result._id}`);

}

//Edit 
module.exports.renderEditListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let originalUrl = listing.image.url;
  originalUrl = originalUrl.replace("/uploads", "/uploads/h_300")
  res.render("./Listings/edit.ejs", { listing, newListingImageUrl: originalUrl });
}

//Update
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let { tagsArray } = req.body;
  if (typeof tagsArray === 'string') {
    tagsArray = JSON.parse(tagsArray);
  }
  const body = {
    ...req.body,
    tags: tagsArray
  }
  const listing = await Listing.findByIdAndUpdate(id, body);
  if (req.file) {
    const { path, filename } = req.file
    listing.image.url = path,
      listing.image.filename = filename,
      await listing.save()
  }
  req.flash('success', 'Listing Updated !')
  res.redirect(`/listings/${id}`);
}


//delete
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('warning', 'Listing Deleted ')
  res.redirect("/listings");
}