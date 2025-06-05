import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const useAnalyticsStore = create((set, get) => ({
    userAnalytics: null,
    listingAnalytics: {},
    loading: false,
    error: null,

    fetchUserAnalytics: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axiosInstance.get('/analytics/user');
            
            if (response.data.success) {
                set({ 
                    userAnalytics: response.data.data,
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
            // Only show error if it's not an auth error
            if (!errorMessage.includes('token')) {
                toast.error(errorMessage);
            }
        }
    },

    fetchListingAnalytics: async (listingId) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosInstance.get(`/analytics/listing/${listingId}`);

            if (response.data.success) {
                set(state => ({
                    listingAnalytics: {
                        ...state.listingAnalytics,
                        [listingId]: response.data.data
                    },
                    loading: false
                }));

                // Subscribe to real-time updates
                const socket = getSocket();
                if (socket) {
                    socket.on(`analytics-${listingId}`, (data) => {
                        if (data.type === 'VIEW_UPDATE') {
                            set(state => ({
                                listingAnalytics: {
                                    ...state.listingAnalytics,
                                    [listingId]: {
                                        ...state.listingAnalytics[listingId],
                                        views: {
                                            ...state.listingAnalytics[listingId].views,
                                            total: data.data.total,
                                            history: [
                                                ...state.listingAnalytics[listingId].views.history,
                                                data.data.recent
                                            ]
                                        }
                                    }
                                }
                            }));
                        }
                    });
                }
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({ 
                error: errorMessage, 
                loading: false 
            });
            // Only show error if it's not an auth error
            if (!errorMessage.includes('token')) {
                toast.error(errorMessage);
            }
        }
    },

    clearAnalytics: () => {
        set({ userAnalytics: null, listingAnalytics: {}, error: null });
    }
}));

export default useAnalyticsStore; 