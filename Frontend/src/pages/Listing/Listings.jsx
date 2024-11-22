import React, { useState, useEffect, useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFire,
    faBed,
    faMountainCity,
    faMountain,
    faPersonSwimming,
    faCampground,
    faTractor,
    faSnowflake,
} from "@fortawesome/free-solid-svg-icons"
import { faFortAwesome } from "@fortawesome/free-brands-svg-icons"
import { Link } from "react-router-dom"
import { ScaleLoader } from "react-spinners"
import { UserContext } from "../../contexts/userContext"

const Listings = () => {
    const [allListings, setAllListings] = useState([])
    const [activeTags, setActiveTags] = useState([])
    const [showWithTax, setShowWithTax] = useState(false)
    const [loading, setLoading] = useState(true)
    const { currUser, checkCurrUser } = useContext(UserContext)

    const taxRate = 0.18 // 18% GST

    // Fetch listings from the backend
    useEffect(() => {
        if (!currUser) checkCurrUser()

        fetch(`${process.env.VITE_API_BASE_URL}/listings`) // Adjust the URL to your backend endpoint
            .then((response) => response.json())
            .then((data) => {
                setAllListings(data)
            })
            .catch((error) => {
                console.error("Error fetching listings:", error)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const handleTagClick = (tag) => {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )
    }

    const filterListings = (listingTags) => {
        return (
            activeTags.length === 0 ||
            activeTags.every((tag) => listingTags.includes(tag))
        )
    }

    const toggleTaxDisplay = () => {
        setShowWithTax(!showWithTax)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-1/2">
                <ScaleLoader color={"#000000"} loading={loading} size={15} />
            </div>
        )
    }

    return (
        // <FontAwesomeIcon icon="fa-brands fa-fort-awesome" />
        <div>
            <div
                id="filters"
                className="flex justify-around gap-2 flex-wrap mt-7 mb-8"
            >
                {[
                    "Trending",
                    "Rooms",
                    "Iconic cities",
                    "Mountains",
                    "Castles",
                    "Amazing pools",
                    "Camping",
                    "Farms",
                    "Arctic",
                ].map((tag) => (
                    <div
                        key={tag}
                        className={`filter flex flex-col items-center ${
                            activeTags.includes(tag) ? "active" : ""
                        }`}
                        onClick={() => handleTagClick(tag)}
                    >
                        <FontAwesomeIcon
                            icon={
                                tag === "Trending"
                                    ? faFire
                                    : tag === "Rooms"
                                    ? faBed
                                    : tag === "Iconic cities"
                                    ? faMountainCity
                                    : tag === "Mountains"
                                    ? faMountain
                                    : tag === "Castles"
                                    ? faFortAwesome
                                    : tag === "Amazing pools"
                                    ? faPersonSwimming
                                    : tag === "Camping"
                                    ? faCampground
                                    : tag === "Farms"
                                    ? faTractor
                                    : faSnowflake
                            }
                        />
                        <p>{tag.charAt(0).toUpperCase() + tag.slice(1)}</p>
                    </div>
                ))}
                <div className="tax-toggle ">
                    <div className="form-check-reverse flex gap-2 border-2 rounded-md px-3 form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                            checked={showWithTax}
                            onChange={toggleTaxDisplay}
                        />
                        <label
                            className="form-check-label"
                            htmlFor="flexSwitchCheckDefault"
                        >
                            {showWithTax
                                ? "Price with Tax"
                                : "Price without Tax"}
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3 px-4">
                {allListings
                    .filter((listing) => filterListings(listing?.tags))
                    .map((listing) => {
                        const originalPrice = listing?.price
                        const displayedPrice = showWithTax
                            ? (
                                  originalPrice +
                                  originalPrice * taxRate
                              ).toLocaleString("en-IN")
                            : originalPrice.toLocaleString("en-IN")

                        return (
                            <div
                                key={listing?._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <Link
                                    to={`/listings/${listing?._id}`}
                                    className="block hover:opacity-80 transition"
                                >
                                    <img
                                        src={listing?.image.url}
                                        className="w-full h-72 object-cover"
                                        alt="Image is processing"
                                    />
                                    <div className="p-4">
                                        <h5 className="text-xl font-semibold mb-2">
                                            {listing?.title}
                                        </h5>
                                        <p className="text-gray-700">
                                            &#8377;
                                            <span
                                                id={`price-${listing?._id}`}
                                                data-original-price={
                                                    originalPrice
                                                }
                                            >
                                                {displayedPrice}
                                            </span>
                                            <i className="tax-info text-sm text-gray-500">
                                                (
                                                {showWithTax
                                                    ? "Including GST"
                                                    : "Excluding GST"}
                                                )
                                            </i>
                                            <br />
                                            <i className="fa-solid fa-location-dot text-gray-600"></i>{" "}
                                            {listing?.location}
                                            <br />
                                            <i className="fa-solid fa-globe text-gray-600"></i>{" "}
                                            {listing?.country}
                                            <br />
                                            <br />
                                            <span className="tags flex flex-wrap gap-2">
                                                {listing?.tags.map(
                                                    (tag) =>
                                                        tag !== "null" && (
                                                            <span
                                                                key={tag}
                                                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1"
                                                            >
                                                                <i className="fa-light fa-hashtag"></i>{" "}
                                                                {tag}
                                                            </span>
                                                        )
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

export default Listings
