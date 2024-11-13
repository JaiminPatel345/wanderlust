import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"

const NewListing = () => {
    const navigate = useNavigate()
    const [flashMessage, setFlashMessage] = useState("") // For displaying error messages

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: "",
        price: 1200,
        country: "",
        location: "",
        tags: [],
    })
    const [imageUrl, setImageUrl] = useState("")
    const [submitLoader, setSubmitLoader] = useState(false)

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

    const handleSubmit = (event) => {
        event.preventDefault()
        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.country ||
            !formData.location
        ) {
            setFlashMessage("Please fill in all required fields")
            return
        }

        setSubmitLoader(true)

        const data = {
            ...formData,
            tagsArray: formData.tags,
            image: imageUrl || image,
        }
        console.log(data)

        sendData(data)
            .then((response) => {
                console.log("Form submitted successfully", response)
                navigate("/listings")
            })
            .catch((e) => {
                setFlashMessage(e.message)
            })
            .finally(() => {
                setSubmitLoader(false)
            })
    }

    const sendData = async (data) => {
        try {
            const response = await fetch(
                `${process.env.VITE_API_BASE_URL}/listings/new`,
                {
                    method: "POST",
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
            throw new Error("Error submitting form:", error)
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const payload = new FormData()
        payload.append("file", file)
        payload.append("upload_preset", "ml_default")
        console.log(payload)

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: payload,
                }
            )
            const data = await res.json()
            console.log(data)

            setImageUrl(data.secure_url)
            setFormData((pvs) => ({
                ...pvs,
                image: "",
            }))
        } catch (error) {
            console.error("Image upload failed:", error)
            setFlashMessage((pvs) => pvs + error.message)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">New Listing</h2>
                {flashMessage && (
                    <div
                        className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{flashMessage}</span>
                    </div>
                )}

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
                            placeholder="Enter your Image URL"
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.image}
                            onChange={handleChange}
                        />
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

export default NewListing
