const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utilities/middleware');
const {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadCount
} = require('../controllers/notification');

// Get user's notifications
router.get('/', verifyToken, getUserNotifications);

// Get unread notifications count
router.get('/unread-count', verifyToken, getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', verifyToken, markNotificationAsRead);

module.exports = router; 