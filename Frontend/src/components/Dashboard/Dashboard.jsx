import React, { useEffect, useState } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels } from "@tremor/react";
import { AreaChart, BarChart, DonutChart } from '@tremor/react';
import { useNavigate } from 'react-router-dom';
import useAnalyticsStore from '../../store/analyticsStore';
import useNotificationStore from '../../store/notificationStore';
import useUserStore from '../../store/userStore';
import NotificationPanel from './NotificationPanel';
import ListingStats from './ListingStats';
import { initializeSocket, getSocket, disconnectSocket } from '../../utils/socket';
import { isLoggedIn } from '../../utils/tokenUtils';
import { IconChartBar, IconClipboardList, IconEye, IconMessage, IconStar } from '@tabler/icons-react';

const colorPalette = {
    blue: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd"],
    emerald: ["#059669", "#34d399", "#6ee7b7", "#a7f3d0"],
    violet: ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"],
    amber: ["#d97706", "#fbbf24", "#fcd34d", "#fde68a"],
    rose: ["#e11d48", "#fb7185", "#fda4af", "#fecdd3"]
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [socketInitialized, setSocketInitialized] = useState(false);
    const [socketError, setSocketError] = useState(null);
    const { userAnalytics, fetchUserAnalytics, loading, error } = useAnalyticsStore();
    const { initializeNotifications } = useNotificationStore();
    const { currUser, checkCurrUser } = useUserStore();

    // Simple authentication check
    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login', { state: { from: '/dashboard' } });
            return;
        }
        
        // If logged in, fetch user data
        checkCurrUser();
    }, [navigate, checkCurrUser]);

    // Handle data fetching and socket setup
    useEffect(() => {
        if (!currUser) return;

        let mounted = true;

        const setupDashboard = async () => {
            try {
                // Fetch initial data
                await fetchUserAnalytics();

                // Initialize socket connection
                const socket = await initializeSocket();
                if (socket && mounted) {
                    setSocketInitialized(true);
                    await initializeNotifications();

                    // Set up event listeners
                    socket.on('analytics_update', (data) => {
                        if (data.userId === currUser.userId) {
                            fetchUserAnalytics();
                        }
                    });

                    socket.on('listing_view', (data) => {
                        if (data.ownerId === currUser.userId) {
                            fetchUserAnalytics();
                        }
                    });

                    socket.on('review_added', (data) => {
                        if (data.ownerId === currUser.userId) {
                            fetchUserAnalytics();
                        }
                    });
                }
            } catch (error) {
                console.error('Dashboard setup error:', error);
                if (mounted) {
                    setSocketError(error.message);
                }
            }
        };

        setupDashboard();

        // Cleanup function
        return () => {
            mounted = false;
            const socket = getSocket();
            if (socket) {
                socket.off('analytics_update');
                socket.off('listing_view');
                socket.off('review_added');
                disconnectSocket();
            }
        };
    }, [currUser, fetchUserAnalytics, initializeNotifications]);

    if (loading || !currUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <Text>Loading dashboard...</Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Text color="red">Error: {error}</Text>
            </div>
        );
    }

    // Show socket error in a non-blocking way
    const renderSocketError = () => {
        if (socketError) {
            return (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Text color="yellow">
                        ⚠️ Real-time updates may be unavailable: {socketError}
                    </Text>
                </div>
            );
        }
        return null;
    };

    const viewsData = userAnalytics?.listingStats.map(listing => ({
        name: listing.title,
        Views: listing.views
    })) || [];

    const reviewsData = userAnalytics?.listingStats.map(listing => ({
        name: listing.title,
        "Reviews": listing.reviews,
        "Rating": listing.rating
    })) || [];

    const engagementData = [
        { 
            name: 'Total Page Views',
            value: userAnalytics?.totalViews || 0,
            description: 'Number of times your listings were viewed'
        },
        { 
            name: 'Reviews Received',
            value: userAnalytics?.totalReviews || 0,
            description: 'Total reviews across all listings'
        },
        { 
            name: 'Saved Listings',
            value: userAnalytics?.totalBookmarks || 0,
            description: 'Times your listings were bookmarked'
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Title className="mb-4 text-2xl font-bold text-gray-800">Dashboard</Title>
            
            {renderSocketError()}
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card decoration="top" decorationColor="blue">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconEye className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <Text className="text-sm text-gray-600">Total Views</Text>
                            <Title className="text-2xl font-bold text-blue-600">
                                {userAnalytics?.totalViews || 0}
                            </Title>
                        </div>
                    </div>
                </Card>
                <Card decoration="top" decorationColor="emerald">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <IconMessage className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <Text className="text-sm text-gray-600">Total Reviews</Text>
                            <Title className="text-2xl font-bold text-emerald-600">
                                {userAnalytics?.totalReviews || 0}
                            </Title>
                        </div>
                    </div>
                </Card>
                <Card decoration="top" decorationColor="amber">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <IconStar className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <Text className="text-sm text-gray-600">Average Rating</Text>
                            <Title className="text-2xl font-bold text-amber-600">
                                {userAnalytics?.averageRating?.toFixed(1) || "N/A"}
                            </Title>
                        </div>
                    </div>
                </Card>
            </div>

            <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                <TabList className="mb-4">
                    <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                        <IconChartBar className={activeTab === 0 ? "text-blue-600" : "text-gray-400"} />
                        <span className={activeTab === 0 ? "text-blue-600 font-medium" : ""}>Analytics</span>
                    </Tab>
                    <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                        <IconClipboardList className={activeTab === 1 ? "text-blue-600" : "text-gray-400"} />
                        <span className={activeTab === 1 ? "text-blue-600 font-medium" : ""}>Listings</span>
                    </Tab>
                    <Tab className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                        <IconMessage className={activeTab === 2 ? "text-blue-600" : "text-gray-400"} />
                        <span className={activeTab === 2 ? "text-blue-600 font-medium" : ""}>Notifications</span>
                    </Tab>
                </TabList>
                
                <TabPanels>
                    <TabPanel>
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <Title className="mb-4">Views by Listing</Title>
                                <div className="h-80">
                                    <BarChart
                                        data={viewsData}
                                        index="name"
                                        categories={["Views"]}
                                        colors={colorPalette.blue}
                                        showLegend={false}
                                        valueFormatter={(value) => `${value} views`}
                                        yAxisWidth={48}
                                    />
                                </div>
                            </Card>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <Title className="mb-4">Reviews and Ratings</Title>
                                    <div className="h-80">
                                        <AreaChart
                                            data={reviewsData}
                                            index="name"
                                            categories={["Reviews", "Rating"]}
                                            colors={[colorPalette.emerald[0], colorPalette.amber[0]]}
                                            valueFormatter={(value) => 
                                                typeof value === 'number' ? value.toFixed(1) : value
                                            }
                                            yAxisWidth={48}
                                        />
                                    </div>
                                </Card>

                                <Card>
                                    <Title className="mb-4">Engagement Overview</Title>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="h-80">
                                            <DonutChart
                                                data={engagementData}
                                                category="value"
                                                index="name"
                                                colors={[colorPalette.blue[0], colorPalette.emerald[0], colorPalette.violet[0]]}
                                                valueFormatter={(value) => `${value.toLocaleString()}`}
                                                className="mt-6"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center space-y-6">
                                            {engagementData.map((item, index) => (
                                                <div key={item.name} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                                                    <div className={`p-2 rounded-lg ${
                                                        index === 0 ? 'bg-blue-100' :
                                                        index === 1 ? 'bg-emerald-100' :
                                                        'bg-violet-100'
                                                    }`}>
                                                        {index === 0 ? <IconEye className="h-6 w-6 text-blue-600" /> :
                                                         index === 1 ? <IconMessage className="h-6 w-6 text-emerald-600" /> :
                                                         <IconStar className="h-6 w-6 text-violet-600" />}
                                                    </div>
                                                    <div>
                                                        <Text className="font-medium">{item.name}</Text>
                                                        <Title className="text-2xl">{item.value.toLocaleString()}</Title>
                                                        <Text className="text-sm text-gray-500">{item.description}</Text>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>
                    
                    <TabPanel>
                        <ListingStats listings={userAnalytics?.listingStats || []} />
                    </TabPanel>
                    
                    <TabPanel>
                        <NotificationPanel />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default Dashboard; 