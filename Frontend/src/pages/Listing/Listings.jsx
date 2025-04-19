/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ScaleLoader } from "react-spinners"
import useUserStore from "../../../Store/userStore"
import useListingStore from "../../../Store/listing"
import { useListingApi } from "../../../hooks/listingApi"
import useTagStore from "../../../Store/tagStore"
import {
    IconMapPin,
    IconWorld,
    IconFlame,
    IconBed,
    IconBuildingSkyscraper,
    IconMountain,
    IconBuildingCastle,
    IconPool,
    IconTent,
    IconTractor,
    IconSnowflake,
    IconHash,
} from "@tabler/icons-react"
import ListingCard from "../../components/ListingCard"
import { toggleBookmark } from "../../utils/bookmarkUtils"

const FILTER_TAGS = [
    { id: "trending", label: "Trending", icon: IconFlame },
    { id: "rooms", label: "Rooms", icon: IconBed },
    {
        id: "iconic-cities",
        label: "Iconic cities",
        icon: IconBuildingSkyscraper,
    },
    { id: "mountains", label: "Mountains", icon: IconMountain },
    { id: "castles", label: "Castles", icon: IconBuildingCastle },
    { id: "amazing-pools", label: "Amazing pools", icon: IconPool },
    { id: "camping", label: "Camping", icon: IconTent },
    { id: "farms", label: "Farms", icon: IconTractor },
    { id: "arctic", label: "Arctic", icon: IconSnowflake },
]

const TAX_RATE = 0.18 // 18% GST

const PriceDisplay = ({ price, showWithTax }) => {
    const displayedPrice = showWithTax
        ? (price + price * TAX_RATE).toLocaleString("en-IN")
        : price.toLocaleString("en-IN")

    return (
        <div className="flex items-center gap-2">
            <span>₹{displayedPrice}</span>
            <span className="text-sm text-gray-500">
                ({showWithTax ? "Including GST" : "Excluding GST"})
            </span>
        </div>
    )
}

const TagFilter = ({ tag, isActive, onClick }) => {
    const Icon = tag.icon
    const { selectedTags } = useTagStore()


    return (
        <div
            className={`filter flex flex-col items-center cursor-pointer transition-colors
        ${isActive ? "!text-red-600" : "text-gray-600"} hover:text-blue-500`}
            onClick={() => onClick(tag.label)}
        >
            <Icon size={24} />
            <p className="text-sm mt-1">{tag.label}</p>
        </div>
    )
}

const Listings = () => {
    const { filterListings, allListings, filterListingsOnTag } =
        useListingStore()
    const { selectedTags, tagClick } = useTagStore()
    const [showWithTax, setShowWithTax] = useState(false)
    const [loading, setLoading] = useState(true)
    const { currUser, checkCurrUser } = useUserStore()
    const { getAllListings } = useListingApi()
    const [bookmarkedListings, setBookmarkedListings] = useState([]);

    useEffect(() => {
        const initializePage = async () => {
            if (!currUser) {
                await checkCurrUser()
            }
            await getAllListings(setLoading)
            // If user is logged in, fetch their bookmarks to know which listings are bookmarked
            if (currUser) {
                try {
                    const response = await fetch('/api/bookmarks', {
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.bookmarks) {
                            setBookmarkedListings(data.bookmarks.map(bookmark => bookmark._id));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching bookmarks:', error);
                }
            }
        }

        initializePage()
    }, [currUser])

    const handleTagClick = async (tag) => {
        await tagClick(tag)
        filterListingsOnTag()
    }

    // Handle bookmark toggle with optimistic UI update
    const handleToggleBookmark = async (listingId, newBookmarkStatus) => {
        if (!currUser) {
            showErrorMessage("Please log in to bookmark listings");
            navigate("/login");
            return;
        }
        
        // Optimistically update UI
        if (newBookmarkStatus) {
            setBookmarkedListings(prev => [...prev, listingId]);
        } else {
            setBookmarkedListings(prev => prev.filter(id => id !== listingId));
        }
        
        // Make API call in the background
        try {
            const response = await toggleBookmark(listingId, !newBookmarkStatus);
            
            // If API call failed, revert the UI change
            if (!response.success) {
                // Revert the optimistic update
                if (newBookmarkStatus) {
                    setBookmarkedListings(prev => prev.filter(id => id !== listingId));
                } else {
                    setBookmarkedListings(prev => [...prev, listingId]);
                }
                
                // Show error message only for actual error conditions, not for "already bookmarked" case
                if (!response.message.includes("already bookmarked")) {
                    showErrorMessage(response.message || "Failed to update bookmark");
                }
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            // Revert the optimistic update
            if (newBookmarkStatus) {
                setBookmarkedListings(prev => prev.filter(id => id !== listingId));
            } else {
                setBookmarkedListings(prev => [...prev, listingId]);
            }
            showErrorMessage("Failed to update bookmark status");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-1/2">
                <ScaleLoader color="#000000" loading={loading} size={15} />
            </div>
        )
    }

    if (!loading && allListings?.length === 0) {
        return (
            <div className="flex justify-center items-center h-1/2">
                <p>No listings found. Please try refreshing the page.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-6">
                    {FILTER_TAGS.map((tag) => (
                        <TagFilter
                            key={tag.id}
                            tag={tag}
                            isActive={selectedTags.includes(tag.label)}
                            onClick={handleTagClick}
                        />
                    ))}
                </div>

                <div className="flex items-center border-2 rounded-md px-4 py-2">
                    <input
                        type="checkbox"
                        id="taxToggle"
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={showWithTax}
                        onChange={() => setShowWithTax(!showWithTax)}
                    />
                    <label htmlFor="taxToggle" className="ml-2 text-sm">
                        {showWithTax
                            ? "Show Price with Tax"
                            : "Show Price without Tax"}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterListings.map((listing) => (
                    <ListingCard
                        key={listing._id}
                        listing={listing}
                        showWithTax={showWithTax}
                        isBookmarked={bookmarkedListings.includes(listing._id)}
                        onToggleBookmark={handleToggleBookmark}
                    />
                ))}
            </div>
        </div>
    )
}

export default Listings
