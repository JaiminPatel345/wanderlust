const Listing = require('../models/listing.js');

// Index: Get all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.json(allListings); // Send data in JSON format
};

// Show a specific listing
module.exports.singleListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: { path: 'owner' }
    })
    .populate('owner');

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  res.json(listing);
};

// Create a new listing
module.exports.createListing = async (req, res) => {
  const { title, description, price, location, country, tagsArray } = req.body;
  let image;
  if (req.file) {
    const { path, filename } = req.file;
    image = { url: path, filename: filename };
  } else {
    image = { url: req.body.image, filename: 'listingimage' };
  }

  const newListing = new Listing({
    title,
    description,
    image,
    price,
    location,
    country,
    tags: JSON.parse(tagsArray || '[]'),
    owner: req.user._id
  });

  const result = await newListing.save();
  res.status(201).json({ message: 'New Listing Added!', listing: result }); // Send success message and created listing
};

// Update a listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const body = { ...req.body, tags: JSON.parse(req.body.tagsArray || '[]') };
  const listing = await Listing.findByIdAndUpdate(id, body, { new: true });

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (req.file) {
    listing.image.url = req.file.path;
    listing.image.filename = req.file.filename;
    await listing.save();
  }

  res.json({ message: 'Listing Updated!', listing }); // Send success message and updated listing
};

// Delete a listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const result = await Listing.findByIdAndDelete(id);

  if (!result) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  res.json({ message: 'Listing Deleted' }); // Send success message
};