/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BeatLoader, PulseLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"

const EditListing = () => {
    const navigate = useNavigate()
    // const [showErrorMessage, showErrorMessage] = useState("") // Flash message state
    const {
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        clearFlashMessage,
    } = useContext(FlashMessageContext)
    const [imageFile, setImageFile] = useState(null)
    const [submitLoader, setSubmitLoader] = useState(false)
    const [imageLoader, setImageLoader] = useState(false)

    const { state } = useLocation()

    const listing = state

    const [formData, setFormData] = useState({
        title: listing?.title || "",
        description: listing?.description || "",
        image: listing?.image.url || "",
        price: listing?.price || 0,
        country: listing?.country || "",
        location: listing?.location || "",
        tags: listing?.tags || [],
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    const handleTagChange = (e) => {
        const selectedTag = e.target.value
        if (selectedTag !== "null" && !formData.tags.includes(selectedTag)) {
            addTag(selectedTag)
            e.target.value = "null" // Reset select value
        }

        if (showErrorMessage) showErrorMessage("")
    }

    const addTag = (tag) => {
        setFormData((prevData) => ({
            ...prevData,
            tags: [...prevData.tags, tag],
        }))
    }

    const removeTag = (tag) => {
        setFormData((prevData) => ({
            ...prevData,
            tags: prevData.tags.filter((t) => t !== tag),
        }))
    }

    function isUrlValid(string) {
        try {
            new URL(string)
            return true
        } catch (err) {
            return false
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.country ||
            !formData.location
        ) {
            showErrorMessage("Please fill in all required fields")
            window.scrollTo(0, 0)

            return
        }
        if (!formData.image && !imageFile) {
            showErrorMessage(
                "Please provide either an image URL or upload an image"
            )
            window.scrollTo(0, 0)
            return
        }

        if (formData.image && !isUrlValid(formData.image)) {
            showErrorMessage("Invalid image URL")
            window.scrollTo(0, 0)
            return
        }

        setSubmitLoader(true)

        const data = {
            ...formData,
            tagsArray: formData.tags,
            image: imageFile || formData.image,
        }

        sendData(data)
            .then((response) => {
                showSuccessMessage("Edited 👍")

                navigate(`/listings/${listing._id}`)
            })
            .catch((e) => {
                showErrorMessage(e.message || "Unknown error")
            })
            .finally(() => {
                setSubmitLoader(false)
            })
    }

    const sendData = async (data) => {
        try {
            const response = await fetch(
                `${process.env.VITE_API_BASE_URL}/listings/${listing._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                    credentials: "include",
                }
            )

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message)
            }
            return response.json()
        } catch (error) {
            throw new Error(error.message || "Unknown error")
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const payload = new FormData()
        payload.append("file", file)
        payload.append("upload_preset", "ml_default")
        setImageLoader(true)
        clearFlashMessage()

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: payload,
                }
            )
            const data = await res.json()
            showSuccessMessage("Image Uploaded ")

            setImageFile(data.secure_url)
        } catch (error) {
            console.error("Image upload failed:", error)
            showErrorMessage((pvs) => pvs + error.message || "Unknown error")
        }
        setImageLoader(false)
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-red-500">
                    Edit Listing
                </h2>

                <form
                    id="new-listing-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Form fields for title, description, image, price, country, location */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Add a catchy title"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            placeholder="Give a brief description about the hotel"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label
                            htmlFor="image"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Image URL
                        </label>
                        <input
                            type="text"
                            name="image"
                            id="image"
                            placeholder="Add an image URL"
                            className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 ${
                                imageFile ? "bg-green-100" : ""
                            }`}
                            value={imageFile || formData.image}
                            onChange={handleChange}
                            disabled={imageFile !== null}
                        />
                    </div>

                    <div className="text-center text-gray-500">
                        <p>OR</p>
                    </div>

                    <div>
                        <label
                            htmlFor="fileImage"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Upload Image
                        </label>
                        <input
                            type="file"
                            name="fileImage"
                            id="fileImage"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            onChange={handleImageUpload}
                        />
                        <p className="mt-2 text-sm text-green-600">
                            {imageLoader ? <PulseLoader size={5} /> : ""}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                value={formData.price}
                                required
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="country"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                id="country"
                                placeholder="India"
                                value={formData.country}
                                required
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            id="location"
                            value={formData.location}
                            placeholder="Vadodara, Gujarat"
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            onChange={handleChange}
                        />
                    </div>

                    {/* Tags section */}
                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tags
                        </label>
                        <select
                            name="tags"
                            id="tags"
                            onChange={handleTagChange}
                            className="mt-1 block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        >
                            <option value="null">--Select Tags--</option>
                            <option value="Trending">Trending</option>
                            <option value="Rooms">Rooms</option>
                            <option value="Iconic cities">Iconic cities</option>
                            <option value="Mountains">Mountains</option>
                            <option value="Castles">Castles</option>
                            <option value="Amazing pools">Amazing pools</option>
                            <option value="Camping">Camping</option>
                            <option value="Farms">Farms</option>
                            <option value="Arctic">Arctic</option>
                        </select>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {formData.tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-gray-300 px-3 py-1 rounded-md"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-2 text-gray-600 hover:text-red-500 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-rose-500 text-white py-3 rounded-md hover:bg-rose-600 transition-colors"
                    >
                        {submitLoader ? (
                            <BeatLoader size={10} />
                        ) : (
                            "Add to List"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditListing
