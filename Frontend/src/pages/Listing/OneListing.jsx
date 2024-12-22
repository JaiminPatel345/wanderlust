/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { UserContext } from "../../contexts/userContext"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import {
    IconStar,
    IconHash,
    IconMapPin,
    IconWorld,
    IconEdit,
    IconTrash,
    IconMessage,
} from "@tabler/icons-react"
import "../../rating.css"

const ADMIN_ID = "66a343a50ff99cdefc1a4657"

const ReviewForm = ({
    onSubmit,
    rating,
    setRating,
    content,
    setContent,
    isLoading,
    showSignupLink,
}) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`p-2 rounded ${
                        rating === value ? "text-yellow-500" : "text-gray-300"
                    }`}
                >
                    <IconStar
                        size={24}
                        fill={rating >= value ? "currentColor" : "none"}
                    />
                </button>
            ))}
        </div>

        <div className="space-y-2">
            <label htmlFor="review" className="block text-sm font-medium">
                Your Review
            </label>
            <textarea
                id="review"
                value={content || ""}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-2 rounded-md p-2 min-h-[100px]"
                required
            />
        </div>

        {showSignupLink && (
            <Link to="/signup" className="text-blue-600 hover:underline block">
                Sign up to leave a review
            </Link>
        )}

        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
            {isLoading ? "Submitting..." : "Submit Review"}
        </button>
    </form>
)

const Review = ({ review, onDelete, canDelete, isDeleting }) => (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
        <div className="flex justify-between items-start mb-2">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <IconStar
                        key={i}
                        size={20}
                        className={
                            i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                        }
                        fill={i < review.rating ? "currentColor" : "none"}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
            </span>
        </div>

        <p className="font-medium text-gray-700 mb-1">
            By: {review.owner?.name}
        </p>
        <p className="text-gray-600">{review.content}</p>

        {canDelete && (
            <button
                onClick={() => onDelete(review)}
                disabled={isDeleting}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        )}
    </div>
)

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

    const { currUser, checkCurrUser } = useContext(UserContext)
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
            } catch (error) {
                showErrorMessage(error.message || "Failed to load listing")
            } finally {
                setIsLoading(false)
            }
        }

        fetchListingDetails()
    }, [id])

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
            const response = await fetch(
                `${process.env.VITE_API_BASE_URL}/listings/${id}/reviews`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ rating, content: reviewContent }),
                }
            )

            const data = await response.json()

            if (!response.ok) throw new Error(data.message)

            const newReview = {
                ...data.review,
                owner: { _id: currUser.userId, name: currUser.name },
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
            const response = await fetch(
                `${process.env.VITE_API_BASE_URL}/listings/${id}/reviews/${review._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message)
            }

            setReviews((prev) => prev.filter((r) => r._id !== review._id))
            showSuccessMessage("Review deleted successfully")
        } catch (error) {
            showErrorMessage(error.message || "Failed to delete review")
        } finally {
            setIsDeletingReview((prev) => ({ ...prev, [review._id]: false }))
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
                    <img
                        src={listing.image.url}
                        alt={listing.title}
                        className="w-full h-[400px] object-cover"
                    />
                )}

                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">
                        {listing?.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Hosted by {listing?.owner?.name}
                    </p>

                    <div className="space-y-4">
                        <p className="text-gray-700">{listing?.description}</p>

                        <div className="flex items-center gap-2">
                            <IconMapPin className="text-gray-500" />
                            <span>{listing?.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <IconWorld className="text-gray-500" />
                            <span>{listing?.country}</span>
                        </div>

                        <p className="text-xl font-semibold">
                            ₹{listing?.price?.toLocaleString("en-IN")}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {listing?.tags
                                ?.filter((tag) => tag !== "null")
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

                    <div className="flex gap-4 mt-6">
                        {canModifyListing ? (
                            <>
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
                            </>
                        ) : (
                            <Link
                                to="/chats"
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                                <IconMessage size={20} />
                                Chat with {listing?.owner?.name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>

                <ReviewForm
                    onSubmit={handleReviewSubmit}
                    rating={rating}
                    setRating={setRating}
                    content={reviewContent}
                    setContent={setReviewContent}
                    isLoading={isSubmitting}
                    showSignupLink={showSignupPrompt}
                />

                <div className="mt-8 space-y-4">
                    {reviews?.length > 0 ? (
                        reviews.map((review) => (
                            <Review
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
                        ))
                    ) : (
                        <p className="text-gray-500 italic">
                            No reviews yet. Be the first to review!
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ListingDetail
