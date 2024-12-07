import React, { useEffect, useState, useContext } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ScaleLoader, PropagateLoader, PacmanLoader } from "react-spinners"
import "../../rating.css"
import checkUserSession from "../../utils/auth"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import { UserContext } from "../../contexts/userContext"

const OneListing = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [listing, setListing] = useState(null)
    const [reviewContent, setReviewContent] = useState(null)
    const [rating, setRating] = useState(3)
    const [allReviews, setAllReviews] = useState({})
    const [loading, setLoading] = useState(true)
    const [showSignup, setShowSignup] = useState(false)
    const [submitLoader, setsubmitLoader] = useState(false)
    const [deleteLoader1, setDeleteLoader1] = useState(false)
    const [deleteLoader2, setDeleteLoader2] = useState(false)
    const {
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        clearFlashMessage,
    } = useContext(FlashMessageContext)
    const { currUser, checkCurrUser } = useContext(UserContext)

    useEffect(() => {
        if (!currUser) checkCurrUser()

        fetch(`${process.env.VITE_API_BASE_URL}/listings/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setListing(data)
                setAllReviews(data.reviews)
            })
            .catch((e) => {
                console.log("Error:", e)
                showErrorMessage(e.message || "Unknown error")
            })
            .finally(() => {
                setLoading(false)
            })
    }, [id])

    const deleteListing = () => {
        let isDelete = false
        setDeleteLoader1(true)
        // DeleteListing(listing?._id)
        fetch(`${process.env.VITE_API_BASE_URL}/listings/${listing?._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
            .then(() => {
                isDelete = true
                showSuccessMessage("Listing Deleted")
            })
            .catch((error) => {
                showErrorMessage(error.message || "Unknown error")
                console.log(error)
            })
            .finally(() => {
                setDeleteLoader1(false)
                if (isDelete) navigate("/listings")
            })
    }

    const handelDeleteReview = (e, review) => {
        e.preventDefault()
        setDeleteLoader2((prev) => ({ ...prev, [review._id]: true }))
        fetch(
            `${process.env.VITE_API_BASE_URL}/listings/${listing?._id}/reviews/${review._id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        )
            .then((response) => {
                if (!response.ok) {
                    response.json().then((data) => {
                        showErrorMessage(data.message)
                        throw new Error(data.message)
                    })
                }
                setAllReviews((pvs) => pvs.filter((e) => e._id != review._id))
                showSuccessMessage("Review Deleted")
            })
            .catch((e) => {
                console.log("Error submitting review:", e)
                showErrorMessage(e.message || "Unknown error")
            })
            .finally(() => {
                setDeleteLoader2((prev) => ({ ...prev, [review._id]: false }))
            })
    }

    const handleSubmitReview = (e) => {
        e.preventDefault()
        // Post the review to the API

        if (!rating || !reviewContent) {
            showErrorMessage("Fill all fields ")
            return
        }

        if (!currUser) {
            showErrorMessage("For submit revive must be logged in ")
            setShowSignup(true)
            return
        }
        setsubmitLoader(true)

        fetch(`${process.env.VITE_API_BASE_URL}/listings/${id}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ rating, content: reviewContent }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message)
                    })
                }
                return response.json()
            })
            .then((data) => {
                const newReview = {
                    ...data.review,
                    owner: { _id: currUser.userId, name: currUser.name },
                }

                setAllReviews((pvs) => [...pvs, newReview])
                showSuccessMessage("Review added")

                setReviewContent("")
                setRating(3)
            })
            .catch((e) => {
                console.log("Error submitting review:", e)
                showErrorMessage(e.message || "Unknown error")
            })
            .finally(() => {
                setsubmitLoader(false)
            })
    }

    const handelEditForm = () => {
        navigate(`/listings/${listing?._id}/edit`, { state: listing })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-1/2">
                <ScaleLoader color={"#000000"} loading={loading} size={15} />
            </div>
        )
    }

    return (
        <div className="container mx-auto mt-10 flex flex-col w-[90%] ">
            <div className="w-full md:w-2/3 mx-auto">
                <h3 className="text-2xl font-semibold mb-4">Listing Details</h3>

                <div className="card bg-white shadow-lg">
                    {listing?.image && (
                        <img
                            src={listing?.image.url}
                            className="w-full h-64 object-cover"
                            alt="Image loading..."
                        />
                    )}
                    <div className="p-4">
                        <h5 className="text-xl font-bold mb-2">
                            {listing?.title}
                        </h5>

                        <p className="text-gray-500">
                            Owned by <i>{listing?.owner?.name}</i>
                        </p>
                        <p className="text-gray-700">{listing?.description}</p>
                        <p className="text-lg font-semibold mt-2">
                            ₹ {listing?.price?.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-2">
                            <i className="fas fa-location-dot"></i>{" "}
                            {listing?.location}
                        </p>
                        <p className="mt-2">
                            <i className="fas fa-globe"></i> {listing?.country}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {listing?.tags &&
                                listing?.tags.map(
                                    (tag, index) =>
                                        tag !== "null" && (
                                            <span
                                                key={index}
                                                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                                            >
                                                <i className="fas fa-hashtag"></i>{" "}
                                                {tag}
                                            </span>
                                        )
                                )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-4">
                    {currUser &&
                    listing?.owner &&
                    (listing?.owner._id.toString() === currUser.userId ||
                        currUser.userId === "66a343a50ff99cdefc1a4657") ? (
                        <>
                            <p
                                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 cursor-pointer"
                                onClick={handelEditForm}
                            >
                                Edit
                            </p>

                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600 min-w-20"
                                onClick={deleteListing}
                            >
                                {deleteLoader1 ? (
                                    <PacmanLoader size={10} />
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* <a
                                href={`/listings/${listing?._id}/book`}
                                className="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600"
                            >
                                Book
                            </a> */}
                            <Link
                                to={`/chats`}
                                className="bg-purple-500 text-white px-4 py-2 rounded-md shadow hover:bg-purple-600"
                            >
                                Chat with {listing?.owner?.name}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <hr className="my-8" />

            {/* review */}
            <div className="w-full md:w-2/3 mx-auto">
                <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <fieldset className="starability-slot">
                        <legend className="text-sm font-medium text-gray-700">
                            Your Opinion
                        </legend>
                        {[...Array(5)].map((_, i) => (
                            <React.Fragment key={i + 1}>
                                <input
                                    type="radio"
                                    id={`first-rate${i + 1}`}
                                    name="rating"
                                    value={i + 1}
                                    checked={rating === i + 1}
                                    onChange={() => setRating(i + 1)}
                                />
                                <label htmlFor={`first-rate${i + 1}`}>
                                    {i + 1} stars.
                                </label>
                            </React.Fragment>
                        ))}
                    </fieldset>

                    <div>
                        <label
                            htmlFor="body"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Review
                        </label>
                        <textarea
                            className="mt-1 px-2 block w-full border-black border-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            name="content"
                            id="body"
                            value={reviewContent || ""}
                            onChange={(e) => {
                                setReviewContent(e.target.value)
                            }}
                            required
                        />
                    </div>

                    <div>
                        {showSignup && (
                            <Link
                                to="/signup"
                                className="text-red-600 hover:underline"
                            >
                                Click here to sign up
                            </Link>
                        )}
                    </div>

                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600">
                        {submitLoader ? (
                            <PropagateLoader size={10} />
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </form>

                <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-semibold">
                        {allReviews?.length > 0
                            ? "All Reviews"
                            : "No reviews yet , do you wanna give ?"}
                    </h3>
                    {allReviews?.length > 0 &&
                        allReviews.map((review, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-gray-100 rounded-md shadow"
                            >
                                <div className="flex gap-2 w-full justify-between">
                                    <div className=" flex ">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={
                                                    review.rating >= i + 1
                                                        ? "text-yellow-500"
                                                        : "text-gray-500"
                                                }
                                            >
                                                <p className="text-xl">★</p>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-right text-sm font-semibold text-gray-700">
                                        {new Date(
                                            review.createdAt
                                        ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <h5 className="text-sm font-bold text-gray-700">
                                    By: {review.owner?.name}
                                </h5>
                                <p className="text-sm">{review.content}</p>
                                {currUser &&
                                (currUser?.userId?.toString() ===
                                    review?.owner?._id?.toString() ||
                                    currUser?.userId?.toString() ===
                                        "66a343a50ff99cdefc1a4657") ? (
                                    <form
                                        onSubmit={(e) => {
                                            handelDeleteReview(e, review)
                                        }}
                                        method="post"
                                    >
                                        <button className="bg-red-500 text-white min-w-16 text-sm px-2 py-2 rounded-md shadow mt-2">
                                            {deleteLoader2[review._id] ? (
                                                <PacmanLoader
                                                    size={10}
                                                    className="pr-1"
                                                />
                                            ) : (
                                                "Delete"
                                            )}
                                        </button>
                                    </form>
                                ) : null}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default OneListing
