const mongoose = require("mongoose");
const default_img = "https://img.freepik.com/free-vector/wanderlust-explore-adventure-landscape_24908-55313.jpg?w=740&t=st=1711876159~exp=1711876759~hmac=b91c9ca5ccaf8ba289e930b3c62030b97c46e70ad36177b312e199938db1c47c";
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    image: {
        url: {
            type: String,
            required: [true, 'Image URL is required'],
            default: default_img,
            set: (v) => v === "" ? default_img : v,
        },
        filename: {
            type: String,
            default: 'listing-image'
        }
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Price per day is required'],
        min: [0, 'Price cannot be negative']
    },
    nightOnlyPrice: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    childPricing: [{
        _id:false,
        ageRange: {
            min: { 
                type: Number, 
                required: [true, 'Minimum age is required'],
                min: [0, 'Minimum age cannot be negative'],
                max: [17, 'Maximum age for child pricing is 17']
            },
            max: { 
                type: Number, 
                required: [true, 'Maximum age is required'],
                min: [0, 'Maximum age cannot be negative'],
                max: [17, 'Maximum age for child pricing is 17']
            }
        },
        pricePerDay: { 
            type: Number, 
            required: [true, 'Price per day is required for child pricing'],
            min: [0, 'Price cannot be negative']
        }
    }],
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        set: (v) => v ? v.toUpperCase() : v,
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        set: (v) => v ? v.toUpperCase() : v,
    },
    coordinates: {
        lat: { 
            type: Number, 
            required: [true, 'Latitude is required'] 
        },
        lng: { 
            type: Number, 
            required: [true, 'Longitude is required'] 
        }
    },
    tags: [{
        type: String,
        trim: true
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
}, { timestamps: true });

// Pre-save hook to validate child pricing age ranges
listingSchema.pre('save', function(next) {
    if (this.childPricing && this.childPricing.length > 0) {
        // Remove any invalid child pricing entries
        this.childPricing = this.childPricing.filter(cp => 
            cp.ageRange && 
            cp.ageRange.min !== undefined && 
            cp.ageRange.max !== undefined && 
            cp.pricePerDay !== undefined
        );

        // Check for overlapping age ranges
        const sortedPricing = [...this.childPricing].sort((a, b) => a.ageRange.min - b.ageRange.min);
        
        for (let i = 1; i < sortedPricing.length; i++) {
            if (sortedPricing[i].ageRange.min <= sortedPricing[i-1].ageRange.max) {
                return next(new Error('Child pricing age ranges cannot overlap'));
            }
        }
    }
    next();
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
})

const Listing = mongoose.model("Listing", listingSchema)
module.exports = Listing
