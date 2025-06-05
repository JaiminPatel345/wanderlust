const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utilities/middleware');
const {
    getUserAnalytics,
    getListingAnalytics,
    updateListingViewsHandler
} = require('../controllers/analytics');

// Get user's overall analytics
router.get('/user', verifyToken, getUserAnalytics);

// Get specific listing analytics
router.get('/listing/:listingId', verifyToken, getListingAnalytics);

// Update listing views
router.post('/listing/:listingId/view', verifyToken, updateListingViewsHandler);

module.exports = router; 