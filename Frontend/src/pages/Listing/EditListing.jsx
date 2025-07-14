/* eslint-disable react/prop-types */
import React, { useContext, useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { BeatLoader, PulseLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import useUserStore from "../../store/userStore"
import { Link } from "react-router-dom"
import { getCloudinarySignature, uploadToCloudinary, validateImageFile } from "../../utils/cloudinaryUtils"
import TagSelector from "../../components/ui/TagSelector"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import MapController from "../../components/listing/MapController"
import MapClickHandler from "../../components/listing/MapClickHandler"
import { getCurrentPosition, getLocationDetails, getLocationSuggestions } from '../../utils/locationUtils';
import { ClipLoader } from 'react-spinners';
import LocationSearch from '../../components/listing/LocationSearch';
import ImageUpload from '../../components/listing/ImageUpload';
import PriceInput from '../../components/listing/PriceInput';
import ChildPricing from '../../components/listing/ChildPricing';
import {updateListing} from '../../api'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        title: listing?.title || "",
        description: listing?.description || "",
        pricePerDay: listing?.pricePerDay || 0,
        nightOnlyPrice: listing?.nightOnlyPrice || 0,
        tags: listing?.tags || [],
    })
    
    const [nightOnly, setNightOnly] = useState(!!listing?.nightOnlyPrice);
    const [childPricing, setChildPricing] = useState(listing?.childPricing || []);
    const [position, setPosition] = useState(listing?.coordinates ? [listing.coordinates.lat, listing.coordinates.lng] : [18.5204, 73.8567]);
    const [address, setAddress] = useState({ city: listing?.location || '', country: listing?.country || '', fullAddress: listing?.location || '' });
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const mapRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Set initial image preview from listing
    useEffect(() => {
        if (listing?.image?.url) {
            setImagePreview(listing.image.url)
            setImageFile(listing.image.url)
        }
    }, [listing])

    // Set initial position and address from listing
    useEffect(() => {
        setIsClient(true);
        if (listing?.coordinates) {
            setPosition([listing.coordinates.lat, listing.coordinates.lng]);
            setAddress({
                city: listing.location,
                country: listing.country,
                fullAddress: listing.location
            });
            setSearchQuery(`${listing.location}, ${listing.country}`);
        }
    }, [listing]);

    const handleChange = (e) => {
        const { name, value } = e.target
        
        if (name === "currency") {
            if (value === "INR" && selectedCurrency === "USD") {
                setFormData((prevData) => ({
                    ...prevData,
                    pricePerDay: Math.round(prevData.pricePerDay * exchangeRate)
                }))
                setSelectedCurrency(value)
            } else if (value === "USD" && selectedCurrency === "INR") {
                setFormData((prevData) => ({
                    ...prevData,
                    pricePerDay: Math.round(prevData.pricePerDay / exchangeRate)
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

    const handleChildAgeChange = (index, type, value) => {
        setChildPricing((prevData) => {
            const newData = [...prevData];
            newData[index].ageRange[type] = value;
            return newData;
        });
    };

    const handleChildPriceChange = (index, value) => {
        setChildPricing((prevData) => {
            const newData = [...prevData];
            newData[index].pricePerDay = value;
            return newData;
        });
    };

    const addChildPricing = () => {
        setChildPricing((prevData) => [...prevData, { ageRange: { min: '', max: '' }, pricePerDay: '' }]);
    };

    const removeChildPricing = (index) => {
        setChildPricing((prevData) => prevData.filter((child, i) => i !== index));
    };

    const hasAgeRangeError = (child) => {
        if (!child.ageRange.min || !child.ageRange.max) return false;

        // Check if min > max
        if (parseInt(child.ageRange.min) > parseInt(child.ageRange.max)) {
            return true;
        }

        // Check if age is >= 18
        if (parseInt(child.ageRange.min) >= 18 || parseInt(child.ageRange.max) >= 18) {
            return true;
        }

        // Check for overlaps with other ranges
        const currentMin = parseInt(child.ageRange.min);
        const currentMax = parseInt(child.ageRange.max);

        return childPricing.some(otherChild => {
            if (otherChild === child || !otherChild.ageRange.min || !otherChild.ageRange.max) return false;

            const otherMin = parseInt(otherChild.ageRange.min);
            const otherMax = parseInt(otherChild.ageRange.max);

            return (currentMin >= otherMin && currentMin <= otherMax) ||
                   (currentMax >= otherMin && currentMax <= otherMax) ||
                   (currentMin <= otherMin && currentMax >= otherMax);
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!formData.title || !formData.description || !formData.pricePerDay || 
            !address.fullAddress || !address.country) {
            setFormError("Please fill in all required fields")
            showErrorMessage("Please fill in all required fields")
            window.scrollTo(0, 0)
            return
        }

        if (!imageFile) {
            setFormError("Please upload an image")
            showErrorMessage("Please upload an image")
            window.scrollTo(0, 0)
            return
        }

        // Validate child pricing
        const hasInvalidChildPricing = childPricing.some(child =>
            hasAgeRangeError(child) 
        );

        if (hasInvalidChildPricing) {
            console.log(childPricing);
            setFormError('Please correct the child pricing information. Ensure there are no overlapping age ranges, ages are under 18, and all fields are filled.');
            showErrorMessage('Please correct the child pricing information. Ensure there are no overlapping age ranges, ages are under 18, and all fields are filled.');
            window.scrollTo(0, document.body.scrollHeight);
            return;
        }

        setSubmitLoader(true)

        let finalPrice = formData.pricePerDay;
        if (selectedCurrency === "INR") {
            finalPrice = Math.round(formData.pricePerDay / exchangeRate);
        }

        let formDataToSend = {
            title: formData.title,
            description: formData.description,
            location: address.fullAddress,
            country: address.country,
            coordinates: JSON.stringify({ lat: position[0], lng: position[1] }),
            pricePerDay: formData.pricePerDay,
            currency: selectedCurrency,
            nightOnlyPrice: nightOnly ? formData.nightOnlyPrice : '',
            tags: JSON.stringify(formData.tags)
        };

        formDataToSend['childPricing'] = JSON.stringify(
            childPricing.map(cp => ({
                ageRange: {
                    min: parseInt(cp.ageRange.min),
                    max: parseInt(cp.ageRange.max)
                },
                pricePerDay: parseFloat(cp.pricePerDay)
            })).filter(cp => !isNaN(cp.ageRange.min) && !isNaN(cp.ageRange.max) && !isNaN(cp.pricePerDay))
        )

        // Append image only if it's different from the existing image
        if (imageFile && imageFile !== listing?.image?.url) {
            formDataToSend["image"] = imageFile;
        }

        sendData(formDataToSend)
            .then(() => {
                showSuccessMessage("Listing updated successfully!")
                navigate(`/listings/${listing._id}`)
            })
            .catch((e) => {
                const errorMessage = e.message || "Failed to update listing";
                setFormError(errorMessage);
                showErrorMessage(errorMessage);
            })
            .finally(() => {
                setSubmitLoader(false)
            })
    }

    const sendData = async (formDataToSend) => {
        try {
            await updateListing(listing._id, formDataToSend);
        } catch (error) {
            throw error;
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

    const handleGetCurrentLocation = async () => {
        try {
            setIsGettingLocation(true);
            const { latitude, longitude } = await getCurrentPosition();
            const newPosition = [latitude, longitude];
            setPosition(newPosition);

            const newAddress = await getLocationDetails(latitude, longitude);
            setAddress(newAddress);

            const displayAddress = `${newAddress.fullAddress.split(',')[0]}, ${newAddress.city}, ${newAddress.country}`;
            setSearchQuery(displayAddress);
            showSuccessMessage('Current location detected successfully!');
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleMapClick = async (e) => {
        const { lat, lng } = e.latlng;
        const newPosition = [lat, lng];
        setPosition(newPosition);
        setIsSearching(true);

        try {
            const newAddress = await getLocationDetails(lat, lng);
            setAddress(newAddress);
            setSearchQuery(newAddress.fullAddress);
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowSuggestions(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (value.trim().length >= 3) {
                fetchSuggestions(value);
            } else {
                setSuggestions([]);
                setIsSearching(false);
            }
        }, 300);
    };

    const fetchSuggestions = async (query) => {
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const results = await getLocationSuggestions(query);
            setSuggestions(results);
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSuggestion = async (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        const newPosition = [lat, lng];

        setPosition(newPosition);

        try {
            const newAddress = await getLocationDetails(lat, lng);
            setAddress(newAddress);
            setSearchQuery(suggestion.formatted_address);
            setSuggestions([]);
            setShowSuggestions(false);
            showSuccessMessage('Location selected successfully!');
        } catch (error) {
            showErrorMessage(error.message);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 3) {
            fetchSuggestions(searchQuery);
        }
    };

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
                
                {formError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {formError}
                    </div>
                )}

                <form id="new-listing-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <ImageUpload 
                        imagePreview={imagePreview} 
                        imageLoader={imageLoader} 
                        fileInputRef={fileInputRef} 
                        handleImageUpload={handleImageUpload} 
                        removeImage={removeImage} 
                    />
                    
                    {/* Title and Description */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-3">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter a title" required />
                        </div>
                        <div className="md:col-span-3">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter a description" required></textarea>
                        </div>
                    </div>
                    
                    {/* Pricing Section */}
                    <PriceInput 
                        selectedCurrency={selectedCurrency}
                        exchangeRate={exchangeRate}
                        formData={formData}
                        handleChange={handleChange}
                        nightOnly={nightOnly}
                        setNightOnly={setNightOnly}
                        setFormData={setFormData}
                    />
                    
                    {/* Child Pricing Section */}
                    <ChildPricing
                        childPricing={childPricing}
                        handleChildAgeChange={handleChildAgeChange}
                        handleChildPriceChange={handleChildPriceChange}
                        addChildPricing={addChildPricing}
                        removeChildPricing={removeChildPricing}
                        selectedCurrency={selectedCurrency}
                    />
                    
                    {/* Location Section */}
                    {isClient && (
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <LocationSearch 
                                searchQuery={searchQuery} 
                                setSearchQuery={setSearchQuery} 
                                handleSearchChange={handleSearchChange} 
                                handleSearchSubmit={handleSearchSubmit} 
                                suggestions={suggestions} 
                                showSuggestions={showSuggestions} 
                                setShowSuggestions={setShowSuggestions} 
                                handleSelectSuggestion={handleSelectSuggestion} 
                                isSearching={isSearching} 
                                handleGetCurrentLocation={handleGetCurrentLocation} 
                                isGettingLocation={isGettingLocation} 
                            />
                            
                            <div className="mt-4 relative" style={{ height: '300px', borderRadius: '0.375rem', overflow: 'hidden' }}>
                                {isSearching && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-md">
                                        <ClipLoader color="#ffffff" size={50} />
                                    </div>
                                )}
                                <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker position={position}>
                                        <Popup>You selected this location</Popup>
                                    </Marker>
                                    <MapClickHandler onMapClick={handleMapClick} />
                                    <MapController position={position} />
                                </MapContainer>
                            </div>
                            {address.fullAddress && (
                                <p className="mt-2 text-sm text-gray-500">Selected Location: {address.fullAddress}</p>
                            )}
                        </div>
                    )}
                    
                    {/* Tags Section */}
                    <div className="mb-8">
                        <TagSelector selectedTags={formData.tags} onTagsChange={handleTagsChange} />
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-end">
                        {submitLoader ? (
                            <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded-md opacity-70 cursor-not-allowed" disabled>
                                <BeatLoader color="white" size={8} />
                            </button>
                        ) : (
                            <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors">Update Listing</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditListing
