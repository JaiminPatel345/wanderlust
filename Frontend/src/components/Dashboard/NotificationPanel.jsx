import React, { useEffect } from 'react';
import {
    Card,
    List,
    ListItem,
    Title,
    Text,
    Badge
} from "@tremor/react";
import { BellIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import useNotificationStore from '../../store/notificationStore';

const NotificationPanel = () => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'REVIEW':
                return "⭐";
            case 'BOOKING':
                return "📅";
            case 'INQUIRY':
                return "💬";
            default:
                return "🔔";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <Text color="red">Error: {error}</Text>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <Title>Notifications</Title>
                {unreadCount > 0 && (
                    <Badge color="red" size="sm">
                        {unreadCount} unread
                    </Badge>
                )}
            </div>

            <List>
                {notifications.length === 0 ? (
                    <ListItem>
                        <div className="flex items-center justify-center py-8">
                            <BellIcon className="h-6 w-6 text-gray-400 mr-2" />
                            <Text>No notifications yet</Text>
                        </div>
                    </ListItem>
                ) : (
                    notifications.map((notification) => (
                        <ListItem
                            key={notification._id}
                            className={`cursor-pointer transition-colors ${
                                !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <Text className="font-medium">
                                            {notification.title}
                                        </Text>
                                        <Text className="text-sm text-gray-500">
                                            {formatDate(notification.createdAt)}
                                        </Text>
                                    </div>
                                    <Text className="text-gray-600 mt-1">
                                        {notification.message}
                                    </Text>
                                </div>
                                {notification.read && (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                                )}
                            </div>
                        </ListItem>
                    ))
                )}
            </List>
        </Card>
    );
};

export default NotificationPanel; 