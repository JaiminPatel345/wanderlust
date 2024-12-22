/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { ScaleLoader } from "react-spinners"
import { UserContext } from "../../contexts/userContext"
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

const ListingCard = ({ listing, showWithTax }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/listings/${listing._id}`} className="block">
            <img
                src={listing.image.url}
                className="w-full h-72 object-cover hover:opacity-90 transition-opacity"
                alt={listing.title}
                loading="lazy"
            />
            <div className="p-4">
                <h5 className="text-xl font-semibold mb-2">{listing.title}</h5>
                <div className="space-y-3">
                    <PriceDisplay
                        price={listing.price}
                        showWithTax={showWithTax}
                    />

                    <div className="flex items-center gap-2">
                        <IconMapPin size={20} />
                        <span>{listing.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <IconWorld size={20} />
                        <span>{listing.country}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {listing.tags
                            .filter((tag) => tag !== "null")
                            .map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1"
                                >
                                    <IconHash size={16} />
                                    {tag}
                                </span>
                            ))}
                    </div>
                </div>
            </div>
        </Link>
    </div>
)

const Listings = () => {
    const { filterListings, allListings, filterListingsOnTag } =
        useListingStore()
    const { selectedTags, tagClick } = useTagStore()
    const [showWithTax, setShowWithTax] = useState(false)
    const [loading, setLoading] = useState(true)
    const { currUser, checkCurrUser } = useContext(UserContext)
    const { getAllListings } = useListingApi()

    useEffect(() => {
        const initializePage = async () => {
            if (!currUser) {
                await checkCurrUser()
            }
            await getAllListings(setLoading)
        }

        initializePage()
    }, [])

    const handleTagClick =async (tag) => {
        console.log(tag)
        
        
        await tagClick(tag)
        console.log(selectedTags)
        filterListingsOnTag()
    }

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
                    />
                ))}
            </div>
        </div>
    )
}

export default Listings
