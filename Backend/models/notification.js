const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['REVIEW', 'BOOKING', 'INQUIRY', 'SYSTEM'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 