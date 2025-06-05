import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';
import { initializeSocket, getSocket, reconnectSocket } from '../utils/socket';
import { showNotificationToast } from '../services/notificationService.jsx';
import toast from 'react-hot-toast';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isInitialized: false,

    initializeNotifications: async (force = false) => {
        // If already initialized and not forced, return
        if (get().isInitialized && !force) return;

        try {
            // First try to get existing socket
            let socket = getSocket();
            
            // If no socket or forced reinitialization, create new connection
            if (!socket || force) {
                socket = await reconnectSocket();
            }

            if (!socket) {
                throw new Error('Failed to initialize socket connection');
            }

            // Fetch initial data
            await get().fetchNotifications();
            await get().fetchUnreadCount();

            // Remove any existing listeners to prevent duplicates
            socket.off('new_notification');
            socket.off('notification_update');

            // Listen for new notifications
            socket.on('new_notification', (data) => {
                const { notification } = data;
                
                // Update notifications list
                set(state => ({
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.unreadCount + 1
                }));
                
                // Show toast notification
                showNotificationToast(notification, get().handleNotificationClick);
            });

            // Listen for notification updates
            socket.on('notification_update', (data) => {
                if (data.type === 'READ') {
                    set(state => ({
                        notifications: state.notifications.map(notif =>
                            notif._id === data.notificationId ? { ...notif, read: true } : notif
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1)
                    }));
                }
            });

            // Listen for socket disconnection
            socket.on('disconnect', async (reason) => {
                console.debug('Socket disconnected:', reason);
                // If disconnected unexpectedly, try to reconnect
                if (reason === 'transport close' || reason === 'ping timeout') {
                    await get().initializeNotifications(true);
                }
            });

            set({ isInitialized: true });
        } catch (error) {
            console.error('Error initializing notifications:', error);
            set({ error: error.message });
        }
    },

    handleNotificationClick: async (notification) => {
        try {
            if (!notification.read) {
                await get().markAsRead(notification._id, true);
            }
            
            // Handle navigation based on notification type and scroll to specific section
            if (notification.relatedListing) {
                const navigate = window.routerNavigate; // This will be set in App.jsx
                
                // Navigate to the listing page
                navigate(`/listings/${notification.relatedListing._id}`, {
                    state: {
                        scrollTo: notification.type === 'REVIEW' ? 'reviews' : null,
                        highlight: notification.type === 'REVIEW' ? notification.relatedReview : null
                    }
                });
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    },

    fetchNotifications: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axiosInstance.get('/notifications');
            
            if (response.data.success) {
                set({ 
                    notifications: response.data.data,
                    loading: false 
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ 
                error: errorMessage, 
                loading: false 
            });
            if (!errorMessage.includes('token')) {
                console.error('Error fetching notifications:', errorMessage);
            }
        }
    },

    fetchUnreadCount: async () => {
        try {
            const response = await axiosInstance.get('/notifications/unread-count');
            
            if (response.data.success) {
                set({ unreadCount: response.data.data.unreadCount });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            // Only log auth errors, don't show them to user
            if (errorMessage.includes('token')) {
                console.debug('Auth error fetching unread count:', errorMessage);
            } else {
                console.error('Error fetching unread count:', errorMessage);
                toast.error('Failed to fetch unread notifications count');
            }
        }
    },

    markAsRead: async (notificationId, silent = false) => {
        try {
            const response = await axiosInstance.put(
                `/notifications/${notificationId}/read`
            );
            
            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.map(notif =>
                        notif._id === notificationId ? { ...notif, read: true } : notif
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));

                // Only show success toast if not in silent mode
                if (!silent) {
                    toast.success(response.data.message);
                }
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            // Only show error toast if it's not an auth error and not in silent mode
            if (!errorMessage.includes('token') && !silent) {
                console.error('Error marking notification as read:', errorMessage);
                toast.error('Failed to mark notification as read');
            }
            throw error; // Re-throw to handle in the component
        }
    },

    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, error: null });
    }
}));

export default useNotificationStore; 