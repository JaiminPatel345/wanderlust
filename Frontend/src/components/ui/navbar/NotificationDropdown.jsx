import React, { useEffect, useRef, useState } from 'react';
import { IconBell, IconCheck } from '@tabler/icons-react';
import useNotificationStore from '../../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

// Notification type to emoji and color mapping
const notificationConfig = {
    REVIEW: { 
        emoji: '⭐', 
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-500',
        hoverBg: 'hover:bg-amber-100'
    },
    BOOKING: { 
        emoji: '📅', 
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500',
        hoverBg: 'hover:bg-blue-100'
    },
    LISTING_VIEW: { 
        emoji: '👀', 
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-500',
        hoverBg: 'hover:bg-purple-100'
    },
    MESSAGE: { 
        emoji: '💬', 
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500',
        hoverBg: 'hover:bg-green-100'
    },
    SYSTEM: { 
        emoji: '🔔', 
        bgColor: 'bg-rose-50',
        iconColor: 'text-rose-500',
        hoverBg: 'hover:bg-rose-100'
    },
    DEFAULT: { 
        emoji: '📢', 
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-500',
        hoverBg: 'hover:bg-gray-100'
    }
};

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const dropdownRef = useRef(null);
    
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        fetchUnreadCount,
        handleNotificationClick 
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [fetchNotifications, fetchUnreadCount]);

    const getNotificationStyle = (type, isRead) => {
        const config = notificationConfig[type] || notificationConfig.DEFAULT;
        return {
            background: isRead ? 'bg-white' : config.bgColor,
            hover: isRead ? 'hover:bg-gray-50' : config.hoverBg,
            icon: config.iconColor
        };
    };

    const displayedNotifications = showAll 
        ? notifications 
        : notifications.filter(n => !n.read);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-full"
                aria-label="Notifications"
            >
                <IconBell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <IconBell className="h-4 w-4" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-xs text-gray-600 hover:text-gray-800"
                            >
                                {showAll ? 'Show Unread' : 'Show All'}
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        {displayedNotifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                                <span className="text-2xl">🔔</span>
                                <p>{showAll ? 'No notifications yet' : 'No unread notifications'}</p>
                            </div>
                        ) : (
                            displayedNotifications.map((notification) => {
                                const style = getNotificationStyle(notification.type, notification.read);
                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b cursor-pointer transition-all ${style.background} ${style.hover}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl" role="img" aria-label={notification.type}>
                                                {notificationConfig[notification.type]?.emoji || notificationConfig.DEFAULT.emoji}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-800' : style.icon}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-gray-400 mt-2 block">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {notification.read ? (
                                                <IconCheck className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <span className={`h-2 w-2 rounded-full mt-2 ${style.icon} bg-current`}></span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown; 