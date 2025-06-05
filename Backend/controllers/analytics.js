const Analytics = require('../models/analytics');
const Listing = require('../models/listing');
const { formatResponse } = require('../utilities/errorHandler');
const { emitAnalyticsUpdate, emitToUser } = require('../utilities/socket');

// Update listing views and emit real-time updates
module.exports.updateListingViews = async (listingId, userId) => {
    try {
        let analytics = await Analytics.findOne({ listing: listingId });
        
        if (!analytics) {
            // Get the listing to find its owner
            const listing = await Listing.findById(listingId);
            if (!listing) {
                throw new Error('Listing not found');
            }
            
            // Create new analytics if not found
            analytics = new Analytics({
                listing: listingId,
                owner: listing.owner, // Use the listing's owner
                views: { total: 0, history: [] },
                reviews: { total: 0, average_rating: 0 },
                engagement: { bookmarks: 0, inquiries: 0 }
            });
        }

        analytics.views.total += 1;
        analytics.views.history.push({
            timestamp: new Date(),
            count: 1
        });
        analytics.lastUpdated = new Date();

        const updatedAnalytics = await analytics.save();

        // Only emit updates if we have an owner
        if (updatedAnalytics.owner) {
            // Emit real-time updates
            emitAnalyticsUpdate(listingId, {
                type: 'VIEW_UPDATE',
                data: {
                    total: updatedAnalytics.views.total,
                    recent: updatedAnalytics.views.history.slice(-1)[0]
                }
            });

            // Notify listing owner
            emitToUser(updatedAnalytics.owner.toString(), 'listing_view', {
                listingId,
                viewCount: updatedAnalytics.views.total
            });
        }

        return updatedAnalytics;
    } catch (error) {
        console.error('Error updating views:', error);
        throw error;
    }
};

// Route handler for updating views
module.exports.updateListingViewsHandler = (req, res) => {
    const { listingId } = req.params;
    
    this.updateListingViews(listingId, req.user?.userId)
        .then(updatedAnalytics => {
            res.json(formatResponse(true, 'View count updated', updatedAnalytics));
        })
        .catch(error => {
            res.status(500).json({
                message: 'Error updating view count',
                error: error.message
            });
        });
};

// Get user's analytics data
module.exports.getUserAnalytics = (req, res) => {
    const userId = req.user.userId;

    Analytics.find({ owner: userId })
        .populate('listing')
        .sort('-lastUpdated')
        .then(analytics => {
            const aggregatedData = {
                totalViews: 0,
                totalReviews: 0,
                averageRating: 0,
                listingStats: analytics.map(item => ({
                    listingId: item.listing._id,
                    title: item.listing.title,
                    views: item.views.total,
                    reviews: item.reviews.total,
                    rating: item.reviews.average_rating,
                    engagement: item.engagement
                }))
            };

            // Calculate totals
            analytics.forEach(item => {
                aggregatedData.totalViews += item.views.total;
                aggregatedData.totalReviews += item.reviews.total;
            });

            // Calculate average rating
            if (aggregatedData.totalReviews > 0) {
                const totalRating = analytics.reduce((sum, item) => 
                    sum + (item.reviews.average_rating * item.reviews.total), 0);
                aggregatedData.averageRating = totalRating / aggregatedData.totalReviews;
            }

            res.json(formatResponse(true, 'Analytics retrieved successfully', aggregatedData));
        })
        .catch(error => {
            console.log('Error fetching user analytics:', error);
            res.status(500).json({
                message: 'Error fetching analytics',
                error: error.message
            });
        });
};

// Get specific listing analytics
module.exports.getListingAnalytics = (req, res) => {
    const { listingId } = req.params;
    const userId = req.user.userId;

    Analytics.findOne({ listing: listingId })
        .populate('listing')
        .then(analytics => {
            if (!analytics) {
                return res.status(404).json({
                    message: 'Analytics not found',
                    error: 'No analytics data found for this listing'
                });
            }

            // Check ownership
            if (analytics.owner.toString() !== userId) {
                return res.status(403).json({
                    message: 'Unauthorized',
                    error: 'You do not have permission to view these analytics'
                });
            }

            res.json(formatResponse(true, 'Analytics retrieved successfully', analytics));
        })
        .catch(error => {
            console.log('Error fetching listing analytics:', error);
            res.status(500).json({
                message: 'Error fetching listing analytics',
                error: error.message
            });
        });
}; 