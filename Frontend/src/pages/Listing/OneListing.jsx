/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useUserStore from "../../store/userStore"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import {
    IconHash,
    IconMapPin,
    IconWorld,
    IconEdit,
    IconTrash,
    IconBookmark,
    IconBookmarkFilled,
    IconCurrencyRupee,
    IconCurrencyDollar,
    IconTax,
} from "@tabler/icons-react"
import "../../rating.css"
import { toggleBookmark, isListingBookmarked } from "../../utils/bookmarkUtils"
import { addReview, deleteReview } from "../../utils/reviewUtils"

// Component imports
import PriceDisplay from "../../components/ui/listing/PriceDisplay"
import ReviewForm from "../../components/ui/listing/ReviewForm"
import ReviewItem from "../../components/ui/listing/ReviewItem"
import ReviewStats from "../../components/ui/listing/ReviewStats"
import OwnerInfo from "../../components/ui/listing/OwnerInfo"

const ADMIN_ID = "66a343a50ff99cdefc1a4657"

const ListingDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [listing, setListing] = useState(null)
    const [reviews, setReviews] = useState([])
    const [reviewContent, setReviewContent] = useState("")
    const [rating, setRating] = useState(3)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeletingReview, setIsDeletingReview] = useState({})
    const [isDeletingListing, setIsDeletingListing] = useState(false)
    const [showSignupPrompt, setShowSignupPrompt] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    // Add state for price display options
    const [showWithTax, setShowWithTax] = useState(false)
    const [displayCurrency, setDisplayCurrency] = useState("USD")

    const { currUser, checkCurrUser } = useUserStore()
    const { showSuccessMessage, showErrorMessage } =
        useContext(FlashMessageContext)

    useEffect(() => {
        const fetchListingDetails = async () => {
            if (!currUser) await checkCurrUser()

            try {
                const response = await fetch(
                    `${process.env.VITE_API_BASE_URL}/listings/${id}`
                )
                const data = await response.json()

                setListing(data)
                setReviews(data.reviews)
                
                // Check if this listing is bookmarked
                if (currUser) {
                    try {
                        const bookmarkStatus = await isListingBookmarked(id);
                        setIsBookmarked(bookmarkStatus);
                    } catch (error) {
                        console.error("Error checking bookmark status:", error);
                    }
                }
            } catch (error) {
                showErrorMessage(error.message || "Failed to load listing")
            } finally {
                setIsLoading(false)
            }
        }

        fetchListingDetails()
    }, [id, currUser])

    const handleDelete = async () => {
        setIsDeletingListing(true)

        try {
            await fetch(`${process.env.VITE_API_BASE_URL}/listings/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            showSuccessMessage("Listing deleted successfully")
            navigate("/listings")
        } catch (error) {
            showErrorMessage(error.message || "Failed to delete listing")
        } finally {
            setIsDeletingListing(false)
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()

        if (!rating || !reviewContent) {
            showErrorMessage("Please fill all fields")
            return
        }

        if (!currUser) {
            showErrorMessage("Please log in to submit a review")
            setShowSignupPrompt(true)
            return
        }

        setIsSubmitting(true)

        try {
            const result = await addReview(id, { rating, content: reviewContent });
            
            if (!result.success) {
                throw new Error(result.error)
            }

            const newReview = {
                ...result.review,
                owner: { _id: currUser.userId, name: currUser.name, profilePhoto: currUser.profilePhoto },
            }

            setReviews((prev) => [...prev, newReview])
            setReviewContent("")
            setRating(3)
            showSuccessMessage("Review added successfully")
        } catch (error) {
            showErrorMessage(error.message || "Failed to submit review")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReviewDelete = async (review) => {
        setIsDeletingReview((prev) => ({ ...prev, [review._id]: true }))

        try {
            const result = await deleteReview(id, review._id);
            
            if (!result.success) {
                throw new Error(result.error)
            }

            setReviews((prev) => prev.filter((r) => r._id !== review._id))
            showSuccessMessage("Review deleted successfully")
        } catch (error) {
            showErrorMessage(error.message || "Failed to delete review")
        } finally {
            setIsDeletingReview((prev) => ({ ...prev, [review._id]: false }))
        }
    }

    const handleBookmark = async () => {
        if (!currUser) {
            showErrorMessage("Please log in to bookmark a listing")
            navigate("/login")
            return
        }

        // Optimistically update UI first
        setIsBookmarked(!isBookmarked)
        
        try {
            // Then make the API call
            const response = await toggleBookmark(id, isBookmarked);
            
            if (!response.success) {
                // Only revert UI if there was a real error (not "already bookmarked")
                if (!response.message.includes("already bookmarked")) {
                    setIsBookmarked(isBookmarked);
                    showErrorMessage(response.message || "Failed to update bookmark status");
                }
            } else {
                showSuccessMessage(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
            }
        } catch (error) {
            // If failed, revert the UI change
            setIsBookmarked(isBookmarked);
            showErrorMessage("Failed to update bookmark status");
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        )
    }

    const canModifyListing =
        currUser &&
        (currUser.userId === listing?.owner?._id ||
            currUser.userId === ADMIN_ID)

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {listing?.image && (
                    <div className="relative">
                        <img
                            src={listing.image.url}
                            alt={listing.title}
                            className="w-full h-[400px] object-cover"
                        />
                        {/* Bookmark button */}
                        {currUser && (
                            <button
                                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                                onClick={handleBookmark}
                                aria-label={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                            >
                                {isBookmarked ? (
                                    <IconBookmarkFilled size={22} className="text-rose-500" />
                                ) : (
                                    <IconBookmark size={22} className="text-gray-600" />
                                )}
                            </button>
                        )}
                    </div>
                )}

                <div className="p-6">
                    {/* Title and bookmark controls on top row */}
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold">
                            {listing?.title}
                        </h1>
                        
                        {/* Price display options */}
                        <div className="flex items-center gap-1">
                            <div className="flex border rounded-md overflow-hidden">
                                <button
                                    onClick={() => setDisplayCurrency("INR")}
                                    className={`p-1.5 sm:px-2 sm:py-1 flex items-center gap-1 text-xs ${displayCurrency === "INR" ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                                    title="Show in Rupees"
                                >
                                    <IconCurrencyRupee size={16} />
                                    <span className="hidden sm:inline">INR</span>
                                </button>
                                <button
                                    onClick={() => setDisplayCurrency("USD")}
                                    className={`p-1.5 sm:px-2 sm:py-1 flex items-center gap-1 text-xs ${displayCurrency === "USD" ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                                    title="Show in Dollars"
                                >
                                    <IconCurrencyDollar size={16} />
                                    <span className="hidden sm:inline">USD</span>
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setShowWithTax(!showWithTax)}
                                className={`p-1.5 rounded-md border flex items-center justify-center ${showWithTax ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                title={showWithTax ? "Price includes tax" : "Price excludes tax"}
                            >
                                <IconTax size={18} className={showWithTax ? 'text-blue-500' : 'text-gray-400'} />
                            </button>
                        </div>
                    </div>

                    {/* Owner info component */}
                    <OwnerInfo 
                        owner={listing?.owner} 
                        listingTitle={listing?.title} 
                        canModifyListing={canModifyListing} 
                    />

                    {/* Description section */}
                    <div className="mb-6">
                        <h2 className="text-lg font-medium mb-2">About this place</h2>
                        <p className="text-gray-700">{listing?.description}</p>
                    </div>

                    {/* Location and price info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium mb-2">Location</h2>
                            <div className="flex items-center gap-2">
                                <IconMapPin className="text-gray-500" />
                                <span>{listing?.location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <IconWorld className="text-gray-500" />
                                <span>{listing?.country}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-medium mb-2">Price</h2>
                            {listing?.price && (
                                <PriceDisplay 
                                    price={listing.price} 
                                    showWithTax={showWithTax} 
                                    displayCurrency={displayCurrency} 
                                />
                            )}
                        </div>
                    </div>
                        
                    {/* Tags section */}
                    {listing?.tags?.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-2">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {listing.tags
                                    .filter((tag) => tag !== "null")
                                    .map((tag, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                                        >
                                            <IconHash size={16} />
                                            {tag}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Admin actions */}
                    {canModifyListing && (
                        <div className="flex gap-4 mt-8 pt-4 border-t">
                            <button
                                onClick={() =>
                                    navigate(`/listings/${id}/edit`, {
                                        state: listing,
                                    })
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                <IconEdit size={20} />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeletingListing}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                <IconTrash size={20} />
                                {isDeletingListing
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                {/* Review statistics */}
                <ReviewStats reviews={reviews} />
                
                {/* Review Form */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                    <ReviewForm
                        onSubmit={handleReviewSubmit}
                        rating={rating}
                        setRating={setRating}
                        content={reviewContent}
                        setContent={setReviewContent}
                        isLoading={isSubmitting}
                        showSignupLink={showSignupPrompt}
                    />
                </div>

                {/* Individual Reviews */}
                {reviews?.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
                        {reviews.map((review) => (
                            <ReviewItem
                                key={review._id}
                                review={review}
                                onDelete={handleReviewDelete}
                                canDelete={
                                    currUser &&
                                    (currUser.userId === review.owner?._id ||
                                        currUser.userId === ADMIN_ID)
                                }
                                isDeleting={isDeletingReview[review._id]}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-center py-4">
                        No reviews yet. Be the first to review!
                    </p>
                )}
            </div>
        </div>
    )
}

export default ListingDetail
