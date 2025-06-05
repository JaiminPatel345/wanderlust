const Notification = require('../models/notification');
const { formatResponse } = require('../utilities/errorHandler');
const { emitToUser } = require('../utilities/socket');
const mongoose = require('mongoose');

// Create a new notification
module.exports.createNotification = async (notificationData) => {
    try {
        const {
            recipient,
            type,
            title,
            message,
            relatedListing,
            relatedUser
        } = notificationData;

        const newNotification = new Notification({
            recipient,
            type,
            title,
            message,
            relatedListing,
            relatedUser
        });

        const notification = await newNotification.save();
        
        // Emit real-time notification
        emitToUser(recipient.toString(), 'new_notification', {
            notification: {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt
            }
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Create notification from HTTP request
module.exports.createNotificationHandler = async (req, res) => {
    try {
        const notification = await module.exports.createNotification(req.body);
        res.status(201).json(formatResponse(true, 'Notification created successfully', notification));
    } catch (error) {
        console.error('Error in notification handler:', error);
        res.status(500).json({
            message: 'Error creating notification',
            error: error.message
        });
    }
};

// Get user's notifications
module.exports.getUserNotifications = (req, res) => {
    const userId = req.user.userId;

    Notification.find({ recipient: userId })
        .sort('-createdAt')
        .populate('relatedListing', 'title images')
        .populate('relatedUser', 'name avatar')
        .then(notifications => {
            res.json(formatResponse(true, 'Notifications retrieved successfully', notifications));
        })
        .catch(error => {
            console.log('Error fetching notifications:', error);
            res.status(500).json({
                message: 'Error fetching notifications',
                error: error.message
            });
        });
};

// Mark notification as read
module.exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;

        // Validate notificationId
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json(formatResponse(false, 'Invalid notification ID'));
        }

        // Find and update in one operation to avoid race conditions
        const updatedNotification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: userId,
                read: false
            },
            { read: true },
            { new: true, runValidators: true }
        );
        
        if (!updatedNotification) {
            // Check if notification exists at all
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                return res.status(404).json(formatResponse(false, 'Notification not found'));
            }
            
            // If notification exists but wasn't updated, check why
            if (notification.recipient.toString() !== userId.toString()) {
                return res.status(403).json(formatResponse(false, 'You do not have permission to update this notification'));
            }
            
            // If notification exists but is already read
            if (notification.read) {
                return res.json(formatResponse(true, 'Notification was already marked as read', notification));
            }
        }
        
        res.json(formatResponse(true, 'Notification marked as read', updatedNotification));
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json(formatResponse(false, 'Error updating notification', error.message));
    }
};

// Get unread notifications count
module.exports.getUnreadCount = (req, res) => {
    const userId = req.user.userId;

    Notification.countDocuments({
        recipient: userId,
        read: false
    }).then(count => {
        res.json(formatResponse(true, 'Unread count retrieved', { unreadCount: count }));
    }).catch(error => {
        console.log('Error fetching unread count:', error);
        res.status(500).json({
            message: 'Error fetching unread count',
            error: error.message
        });
    });
}; 