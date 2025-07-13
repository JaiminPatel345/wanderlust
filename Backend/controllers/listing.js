const Listing = require('../models/listing.js');
const Analytics = require('../models/analytics.js');
const {formatResponse} = require('../utilities/errorHandler');
const { updateListingViews } = require('./analytics.js');

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
module.exports.singleListing = async (req, res) => {
  const { id } = req.params;
  
  try {
    const listing = await Listing.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'owner',
        },
      })
      .populate('owner');

    if (!listing) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }

    // Track view - but don't let tracking errors affect the response
    try {
      await updateListingViews(id, req.user?.userId);
    } catch (trackingError) {
      console.error('Error tracking view:', trackingError);
      // Continue with the response even if tracking fails
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving listing',
      error: error.message,
    });
  }
};

// Create a new listing
module.exports.createListing = async (req, res) => {
    try {
        const {
            title,
            description,
            pricePerDay,
            location,
            country,
            tags = [],
            nightOnlyPrice,
            childPricing = [],
            coordinates
        } = req.body;

        // Validate required fields
        if (!title || !description || !pricePerDay || !location || !country || !coordinates) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['title', 'description', 'pricePerDay', 'location', 'country', 'coordinates']
            });
        }

        // Validate coordinates
        if (!coordinates.lat || !coordinates.lng) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates',
                required: { coordinates: { lat: 'number', lng: 'number' } }
            });
        }

        // Create the listing
        const newListing = new Listing({
            title,
            description,
            pricePerDay: parseFloat(pricePerDay),
            location,
            country,
            coordinates: {
                lat: parseFloat(coordinates.lat),
                lng: parseFloat(coordinates.lng)
            },
            tags: Array.isArray(tags) ? tags : [tags],
            owner: req.user.userId,
            ...(nightOnlyPrice && { nightOnlyPrice: parseFloat(nightOnlyPrice) }),
            childPricing: Array.isArray(childPricing) ? childPricing.map(cp => ({
                ageRange: {
                    min: parseInt(cp.ageRange?.min, 10),
                    max: parseInt(cp.ageRange?.max, 10)
                },
                pricePerDay: parseFloat(cp.pricePerDay)
            })).filter(cp => 
                !isNaN(cp.ageRange.min) && 
                !isNaN(cp.ageRange.max) && 
                !isNaN(cp.pricePerDay) &&
                cp.ageRange.min >= 0 &&
                cp.ageRange.max <= 17 &&
                cp.ageRange.min <= cp.ageRange.max
            ) : []
        });

        // Handle image upload if present
        if (req.body.image?.url) {
            newListing.image = {
                url: req.body.image.url,
                filename: req.body.image.filename || 'listing-image'
            };
        }

        // Save the listing
        const savedListing = await newListing.save();

        // Create analytics entry for the new listing
        try {
            const analytics = new Analytics({
                listing: savedListing._id,
                owner: req.user.userId,
                views: { total: 0, history: [] },
                reviews: { total: 0, average_rating: 0 },
                engagement: { bookmarks: 0, inquiries: 0 }
            });
            await analytics.save();
        } catch (analyticsError) {
            console.error('Error creating analytics:', analyticsError);
            // Continue even if analytics fails
        }

        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: savedListing
        });

    } catch (error) {
        console.error('Error creating listing:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate key error',
                error: 'A listing with similar details already exists'
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Failed to create listing',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update a listing
module.exports.updateListing = async (req, res) => {
  const {
    id,
  } = req.params;
  const {
    title,
    description,
    pricePerDay,
    location,
    country,
    tagsArray,
    nightOnlyPrice,
    childPricing
  } = req.body;

  const image = {
    url: req.body.image,
    filename: 'listingimage',
  };

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    {
      title,
      description,
      image,
      pricePerDay,
      location,
      country,
      tags: tagsArray,
      nightOnlyPrice,
      childPricing
    },
    { new: true }
  );

  if (!updatedListing) {
    return res.status(404).json({
      message: 'Listing not found',
    });
  }

  res.json(formatResponse(true, "Successfully Updated", updatedListing));
};

// Delete a listing
module.exports.destroyListing = async (req, res) => {
  const {
    id,
  } = req.params;

  try {
    // Delete the listing
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found',
      });
    }

    // Delete associated analytics
    await Analytics.findOneAndDelete({ listing: id });

    res.json({
      message: 'Listing Deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting listing',
      error: error.message,
    });
  }
};