/* eslint-disable react/prop-types */
import React, { useContext, useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BeatLoader, PulseLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import useUserStore from "../../store/userStore"
import { Link } from "react-router-dom"
import { getCloudinarySignature, uploadToCloudinary, validateImageFile } from "../../utils/cloudinaryUtils"
import axiosInstance from "../../api/axiosInstance"
import { IconPhoto, IconTrash, IconEdit } from "@tabler/icons-react"
import TagSelector from "../../components/ui/TagSelector"

const EditListing = () => {
    const navigate = useNavigate()
    const { showSuccessMessage, showErrorMessage, clearFlashMessage } = useContext(FlashMessageContext)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [submitLoader, setSubmitLoader] = useState(false)
    const [imageLoader, setImageLoader] = useState(false)
    const fileInputRef = useRef(null)
    const { currUser } = useUserStore()
    const { state } = useLocation()
    const listing = state
    const [exchangeRate] = useState(83.5)
    const [selectedCurrency, setSelectedCurrency] = useState("USD")

    const [formData, setFormData] = useState({
        title: listing?.title || "",
        description: listing?.description || "",
        price: listing?.price || 0,
        country: listing?.country || "",
        location: listing?.location || "",
        tags: listing?.tags || [],
    })

    // Set initial image preview from listing
    useEffect(() => {
        if (listing?.image?.url) {
            setImagePreview(listing.image.url)
            setImageFile(listing.image.url)
        }
    }, [listing])

    const handleChange = (e) => {
        const { name, value } = e.target
        
        if (name === "currency") {
            if (value === "INR" && selectedCurrency === "USD") {
                setFormData((prevData) => ({
                    ...prevData,
                    price: Math.round(prevData.price * exchangeRate)
                }))
                setSelectedCurrency(value)
            } else if (value === "USD" && selectedCurrency === "INR") {
                setFormData((prevData) => ({
                    ...prevData,
                    price: Math.round(prevData.price / exchangeRate)
                }))
                setSelectedCurrency(value)
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }))
        }
    }

    const handleTagsChange = (newTags) => {
        setFormData(prevData => ({
            ...prevData,
            tags: newTags
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!formData.title || !formData.description || !formData.price || 
            !formData.country || !formData.location) {
            showErrorMessage("Please fill in all required fields")
            window.scrollTo(0, 0)
            return
        }

        if (!imageFile) {
            showErrorMessage("Please upload an image")
            window.scrollTo(0, 0)
            return
        }

        setSubmitLoader(true)

        let finalPrice = formData.price;
        if (selectedCurrency === "INR") {
            finalPrice = Math.round(formData.price / exchangeRate);
        }

        const data = {
            ...formData,
            price: finalPrice,
            tagsArray: formData.tags,
            image: imageFile,
        }

        sendData(data)
            .then(() => {
                showSuccessMessage("Listing updated successfully!")
                navigate(`/listings/${listing._id}`)
            })
            .catch((e) => {
                showErrorMessage(e.message || "Failed to update listing")
            })
            .finally(() => {
                setSubmitLoader(false)
            })
    }

    const sendData = async (data) => {
        try {
            const response = await axiosInstance.put(`/listings/${listing._id}`, data)
            return response.data
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || "Unknown error")
        }
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation) {
            showErrorMessage(validation.message)
            return
        }

        setImageLoader(true)
        clearFlashMessage()

        try {
            const signatureData = await getCloudinarySignature('listing')
            if (!signatureData || !signatureData.cloud_name || !signatureData.api_key) {
                throw new Error('Failed to get upload credentials')
            }

            const imageUrl = await uploadToCloudinary(file, signatureData)
            if (!imageUrl) {
                throw new Error('No image URL returned from upload')
            }

            setImageFile(imageUrl)
            setImagePreview(URL.createObjectURL(file))
            showSuccessMessage('Image uploaded successfully')
        } catch (error) {
            console.error('Image upload failed:', error)
            showErrorMessage(error.message || 'Failed to upload image')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            setImagePreview(null)
        } finally {
            setImageLoader(false)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    if (!currUser) {
        return (
            <div className="flex justify-center items-center mt-16">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-3xl font-semibold mb-4">Authentication Required</h1>
                    <p className="mb-6 text-gray-600">You must be logged in to edit a listing.</p>
                    <div className="flex flex-col gap-4">
                        <Link to="/login" className="px-4 py-2 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition-colors">
                            Log In
                        </Link>
                        <Link to="/signup" className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen py-8">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-red-500">Edit Listing</h2>

                <form id="new-listing-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Listing Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {!imagePreview ? (
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors rounded-md">
                                    <IconPhoto size={48} className="text-gray-400 mb-2"/>
                                    <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
                                    <p className="text-xs text-gray-400">JPG, PNG or GIF (max. 5MB)</p>
                                    {imageLoader && (
                                        <div className="mt-4">
                                            <PulseLoader size={8} color="#f43f5e"/>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative group">
                                    <img src={imagePreview} alt="Listing preview" className="max-h-64 mx-auto rounded-md"/>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                            title="Change image"
                                        >
                                            <IconEdit size={20} className="text-gray-700"/>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                        title="Remove image"
                                    >
                                        <IconTrash size={16} className="text-red-500"/>
                                    </button>
                                    {imageLoader && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                            <PulseLoader size={10} color="#ffffff"/>
                                        </div>
                                    )}
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                onChange={handleImageUpload} disabled={imageLoader}/>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input type="text" id="title" name="title" placeholder="Add a catchy title"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                            value={formData.title} onChange={handleChange} required/>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea name="description" id="description" placeholder="Give a brief description about the listing"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 min-h-[100px]"
                            value={formData.description} onChange={handleChange} required></textarea>
                    </div>

                    {/* Price & Currency & Country */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <input type="number" name="price" id="price" value={formData.price} required
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                                onChange={handleChange}/>
                        </div>

                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select name="currency" id="currency" value={selectedCurrency}
                                className="w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                                onChange={handleChange}>
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <input type="text" name="country" id="country" placeholder="India" value={formData.country}
                                required className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                                onChange={handleChange}/>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input type="text" name="location" id="location" value={formData.location}
                            placeholder="Vadodara, Gujarat" required
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                            onChange={handleChange}/>
                    </div>

                    {/* Tags */}
                    <TagSelector 
                        selectedTags={formData.tags}
                        onTagsChange={handleTagsChange}
                    />

                    <button type="submit"
                        className="w-full bg-rose-500 text-white py-3 rounded-md hover:bg-rose-600 transition-colors">
                        {submitLoader ? <BeatLoader size={10}/> : "Update Listing"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditListing
