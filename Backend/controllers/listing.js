const Listing = require('../models/listing.js');
const {formatResponse} = require('../utilities/errorHandler');

// Index: Get all listings
module.exports.index = (req, res) => {
  Listing.find({}).then((data) => {
    res.send(data);
  }).catch((e) => {
    res.status(500).json({
      message: 'Error to get all Listing',
      error: e.message,
    });
  });
};

// Search listings by query
module.exports.searchListings = (req, res) => {
  const {query} = req.query;

  if (!query || query.trim() === '') {
    // If query is empty, return all listings
    return this.index(req, res);
  }

  const searchRegex = new RegExp(query, 'i'); // Case insensitive search

  Listing.find({
    $or: [
      {title: searchRegex},
      {description: searchRegex},
      {location: searchRegex},
      {country: searchRegex},
      {tags: searchRegex},
    ],
  }).then(listings => {
    res.json(listings);
  }).catch(err => {
    res.status(500).json({
      message: 'Error searching listings',
      error: err.message,
    });
  });
};

// Show a specific listing
module.exports.singleListing = (req, res) => {
  const {
    id,
  } = req.params;
  Listing.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'owner',
    },
  }).populate('owner').then((listing) => {
    if (!listing) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }
    res.json(listing);
  }).catch((error) => {
    res.status(500).json({
      message: 'Error retrieving listing',
      error: error.message,
    });
  });
};

// Create a new listing
module.exports.createListing = (req, res, next) => {
  const {
    title,
    description,
    price,
    location,
    country,
    tagsArray,
  } = req.body;

  const image = {
    url: req.body.image,
    filename: 'listingimage',
  };

  const newListing = new Listing({
    title,
    description,
    image,
    price, // Price is already in USD from frontend
    location,
    country,
    tags: tagsArray || '[]',
    owner: req.user.userId,
  });
  console.log(newListing);

  newListing.save().then((result) => {
    res.status(201).json(formatResponse(true, "Successfully added", newListing));
  }).catch((error) => {
    console.log("Error to create listing", error);
    res.status(500).json({
      message: 'Error creating listing',
      error: error.message,
    });
  });
};

// Update a listing
module.exports.updateListing = (req, res) => {
  const {
    id,
  } = req.params;
  const {
    title,
    description,
    price,
    location,
    country,
    tagsArray,
  } = req.body;

  const image = {
    url: req.body.image,
    filename: 'listingimage',
  };

  const data = {
    title,
    description,
    image,
    price, // Price is already in USD from frontend
    location,
    country,
    tags: tagsArray,
  };

  const body = {
    ...data,
  };

  Listing.findByIdAndUpdate(id, body, {
    new: true,
  }).then((listing) => {
    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found',
      });
    }

    res.json(formatResponse(true, "Successfully Updated", listing));
  }).catch((error) => {
    res.status(500).json({
      message: 'Error updating listing',
      error: error.message,
    });
  });
};

// Delete a listing
module.exports.destroyListing = (req, res) => {
  const {
    id,
  } = req.params;
  console.log(id);

  Listing.findByIdAndDelete(id).then((result) => {
    if (!result) {
      return res.status(404).json({
        message: 'Listing not found',
      });
    }

    res.json({
      message: 'Listing Deleted',
    });
  }).catch((error) => {
    res.status(500).json({
      message: 'Error deleting listing',
      error: error.message,
    });
  });
};