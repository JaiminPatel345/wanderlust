// hooks/useListingApi.js
import useListingStore from "../store/listing.js"

export const useListingApi = () => {
    const { setListings, setFilterListings } = useListingStore();

    // Transform listing data to ensure it matches our frontend model
    const transformListingData = (data) => {
        if (!Array.isArray(data)) return [];
        
        return data.map(listing => ({
            ...listing,
            // Ensure all required fields have default values
            _id: listing._id || Math.random().toString(36).substring(2, 9),
            title: listing.title || 'Untitled Listing',
            pricePerDay: typeof listing.pricePerDay === 'number' ? listing.pricePerDay : 0,
            nightOnlyPrice: typeof listing.nightOnlyPrice === 'number' ? listing.nightOnlyPrice : null,
            location: listing.location || 'Location not specified',
            country: listing.country || '',
            description: listing.description || '',
            image: listing.image || { url: '/placeholder-listing.jpg', filename: 'placeholder.jpg' },
            tags: Array.isArray(listing.tags) ? listing.tags : [],
            coordinates: listing.coordinates || null,
            childPricing: Array.isArray(listing.childPricing) 
                ? listing.childPricing.map(cp => ({
                    ageRange: {
                        min: typeof cp.ageRange?.min === 'number' ? cp.ageRange.min : 0,
                        max: typeof cp.ageRange?.max === 'number' ? cp.ageRange.max : 0
                    },
                    price: typeof cp.price === 'number' ? cp.price : 0
                })) 
                : [],
            rating: typeof listing.rating === 'number' ? listing.rating : null,
            createdAt: listing.createdAt || new Date().toISOString(),
            updatedAt: listing.updatedAt || new Date().toISOString()
        }));
    };

    const getAllListings = async (setLoading) => {
        try {
            const response = await fetch(`${process.env.VITE_API_BASE_URL}/listings`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const transformedData = transformListingData(data);
            
            setListings(transformedData);
            setFilterListings(transformedData);
            return transformedData;
        } catch (error) {
            console.error("Error fetching listings:", error);
            // Set empty arrays on error to prevent undefined errors
            setListings([]);
            setFilterListings([]);
            return [];
        } finally {
            if (typeof setLoading === 'function') {
                setLoading(false);
            }
        }
    };

    // Function to get a single listing by ID
    const getListingById = async (id) => {
        try {
            const response = await fetch(`${process.env.VITE_API_BASE_URL}/listings/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const [transformedData] = transformListingData([data]);
            return transformedData || null;
        } catch (error) {
            console.error(`Error fetching listing ${id}:`, error);
            return null;
        }
    };

    return { 
        getAllListings,
        getListingById
    };
};
