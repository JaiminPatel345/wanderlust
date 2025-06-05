const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        total: { type: Number, default: 0 },
        history: [{
            timestamp: { type: Date, default: Date.now },
            count: { type: Number, default: 1 }
        }]
    },
    reviews: {
        total: { type: Number, default: 0 },
        average_rating: { type: Number, default: 0 }
    },
    engagement: {
        bookmarks: { type: Number, default: 0 },
        inquiries: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema); 