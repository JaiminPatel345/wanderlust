import React, { useState } from 'react';

const EditListing = ({ listing, newListingImageUrl }) => {
    const [formData, setFormData] = useState({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        country: listing.country,
        location: listing.location,
        image: null,
        tags: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { title, description, price, country, location } = formData;

        // Basic validation
        if (!title || !description || !price || !country || !location) {
            alert("All fields are required!");
            return;
        }

        // Form submission logic here...
    };

    const handleTagChange = (e) => {
        const selectedTag = e.target.value;
        if (selectedTag !== "null") {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, selectedTag] }));
            e.target.value = "null";
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold my-6">Edit Listing</h2>
            <div className="flex justify-center">
                <div className="w-full max-w-4xl p-4 bg-gray-100 shadow-md rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.title}
                                onChange={handleChange}
                                required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.description}
                                onChange={handleChange}
                                required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Original Image Preview</label>
                            <img src={newListingImageUrl} className="h-48 w-48 object-cover mt-2" alt="Image preview" />
                        </div>
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                            <input
                                type="file"
                                name="image"
                                id="image"
                                className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={handleImageChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    id="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    id="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                id="location"
                                value={formData.location}
                                onChange={handleChange}
                                required />
                        </div>
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                            <select
                                name="tags"
                                id="tags"
                                onChange={handleTagChange}
                                className="mt-1 px-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="null">Select Tags</option>
                                {['trending', 'rooms', 'iconic cities', 'mountains', 'castles', 'amazing pools', 'camping', 'farms', 'arctic'].map(tag => (
                                    <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Update Listing</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditListing;
