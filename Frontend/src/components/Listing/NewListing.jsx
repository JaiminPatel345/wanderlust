import React, { useState } from "react"

const NewListing = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: "",
        price: 1200,
        country: "",
        location: "",
        tags: [],
        tagsArray: [],
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
        if (selectedTag !== "null") {
            removeOption(selectedTag)
            addTag(selectedTag)
            e.target.value = "null" // Reset select value
        }
    }

    const addTag = (tag) => {
        setFormData((prevData) => ({
            ...prevData,
            tags: [...prevData.tags, tag],
        }))
        removeOption(tag)
    }

    const removeOption = (tag) => {
        const select = document.getElementById("tags")
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === tag) {
                select.remove(i)
                break
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (
            !formData.title ||
            !formData.description ||
            !formData.country ||
            !formData.location
        ) {
            return // Validation handling can be improved here
        }

        // Add tags array as hidden input
        const hiddenTagsInput = document.createElement("input")
        hiddenTagsInput.type = "hidden"
        hiddenTagsInput.name = "tagsArray"
        hiddenTagsInput.value = JSON.stringify(formData.tags)

        // Submit the form using fetch or other methods
        console.log("Form submitted", { ...formData, tagsArray: formData.tags })
        // TODO: Handle the form submission to your backend
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">New Listing</h2>
                <form
                    id="new-listing-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
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
                            htmlFor="urlImage"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Image URL
                        </label>
                        <input
                            type="text"
                            name="urlImage"
                            id="urlImage"
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
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-rose-500 text-white py-3 rounded-md hover:bg-rose-600 transition-colors"
                    >
                        Add to List
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewListing
