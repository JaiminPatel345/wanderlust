import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { FlashMessageContext } from '../../utils/flashMessageContext';
import useUserStore from '../../store/userStore';
import { getCloudinarySignature, uploadToCloudinary, validateImageFile } from '../../utils/cloudinaryUtils';
import { IconPhoto, IconMapPin } from '@tabler/icons-react';
import TagSelector from '../../components/ui/TagSelector';
import { createListing } from '../../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import components
import MapController from '../../components/listing/MapController';
import MapClickHandler from '../../components/listing/MapClickHandler';
import LocationSearch from '../../components/listing/LocationSearch';
import ImageUpload from '../../components/listing/ImageUpload';
import PriceInput from '../../components/listing/PriceInput';
import ChildPricing from '../../components/listing/ChildPricing';
import { getCurrentPosition, getLocationDetails, getLocationSuggestions } from '../../utils/locationUtils';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const NewListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    nightOnlyPrice: '',
    tags: [],
  });

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate] = useState(83.5);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);
  const { showSuccessMessage, showErrorMessage, clearFlashMessage } = useContext(FlashMessageContext);
  const { currUser, checkCurrUser } = useUserStore();
  const fileInputRef = useRef(null);

  const [nightOnly, setNightOnly] = useState(formData.nightOnlyPrice > 0);
  const [childPricing, setChildPricing] = useState([]);
  const [position, setPosition] = useState([18.5204, 73.8567]);
  const [address, setAddress] = useState({ city: '', country: '' });
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);


  // Handle getting current location
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

  // Handle map click to set location
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    const newPosition = [lat, lng];
    setPosition(newPosition);
    setIsSearching(true);

    try {
      const newAddress = await getLocationDetails(lat, lng);
      setAddress(newAddress);

      // const displayAddress = `${newAddress.fullAddress.split(',')[0]}, ${newAddress.city}, ${newAddress.country}`;
      const displayAddress = newAddress.fullAddress;

      setSearchQuery(displayAddress);
    } catch (error) {
      showErrorMessage(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
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

  // Fetch location suggestions
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

  // Handle selecting a suggestion
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

  // Handle search button click
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      fetchSuggestions(searchQuery);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'currency') {
      if (value === 'INR' && selectedCurrency === 'USD') {
        setFormData((prevData) => ({
          ...prevData,
          pricePerDay: Math.round(prevData.pricePerDay * exchangeRate),
        }));
        setSelectedCurrency(value);
      } else if (value === 'USD' && selectedCurrency === 'INR') {
        setFormData((prevData) => ({
          ...prevData,
          pricePerDay: Math.round(prevData.pricePerDay / exchangeRate),
        }));
        setSelectedCurrency(value);
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    clearFlashMessage();
  };

  const handleTagsChange = (newTags) => {
    setFormData((prevData) => ({
      ...prevData,
      tags: newTags,
    }));
  };

  const hasAgeRangeError = (child) => {
    if (!child.ageRange.min || !child.ageRange.max) return false;

    // Check if min > max
    if (parseInt(child.ageRange.min) > parseInt(child.ageRange.max)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    // Basic validation
    if (!formData.title || !formData.description || !formData.pricePerDay) {
      setFormError('Please fill in all required fields');
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return;
    }

    // Validate child pricing
    const hasInvalidChildPricing = childPricing.some(child =>
      hasAgeRangeError(child) ||
      (child.ageRange.min && !child.pricePerDay) ||
      (child.ageRange.max && !child.pricePerDay)
    );

    if (hasInvalidChildPricing) {
      setFormError('Please correct the child pricing information');
      setIsSubmitting(false);
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }

    if (!imageFile) {
      showErrorMessage('Please upload an image for your listing');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitLoader(true);

    try {
      let finalPrice = formData.pricePerDay;

      if (selectedCurrency === 'INR') {
        finalPrice = Math.round(formData.pricePerDay / exchangeRate);
      }

      // Prepare the data according to the backend model
      const data = {
        title: formData.title,
        description: formData.description,
        pricePerDay: parseFloat(finalPrice),
        nightOnlyPrice: formData.nightOnlyPrice ? parseFloat(formData.nightOnlyPrice) : undefined,
        childPricing: childPricing.map(cp => ({
          ageRange: {
            min: parseInt(cp.ageRange.min),
            max: parseInt(cp.ageRange.max)
          },
          pricePerDay: parseFloat(cp.pricePerDay)
        })).filter(cp => !isNaN(cp.ageRange.min) && !isNaN(cp.ageRange.max) && !isNaN(cp.pricePerDay)),
        location: address.city,
        country: address.country,
        coordinates: {
          lat: parseFloat(position[0]),
          lng: parseFloat(position[1])
        },
        tags: formData.tags,
        image: {
          url: imageFile,
          filename: 'listing-image'
        }
      };

      // Remove undefined values
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      const response = await createListing(data);
      showSuccessMessage('Listing added successfully');
      navigate(`/listings/${response._id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create listing';
      showErrorMessage(errorMessage);
      setFormError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setSubmitLoader(false);
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation) {
      showErrorMessage(validation.message);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageLoader(true);
    clearFlashMessage();

    try {
      const signatureData = await getCloudinarySignature('listing');

      if (!signatureData || !signatureData.cloud_name || !signatureData.api_key) {
        throw new Error('Failed to get upload credentials');
      }

      const imageUrl = await uploadToCloudinary(file, signatureData);

      if (!imageUrl) {
        throw new Error('No image URL returned from upload');
      }

      setImageFile(imageUrl);
      showSuccessMessage('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      showErrorMessage(error.message || 'Failed to upload image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImagePreview(null);
    } finally {
      setImageLoader(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    setChildPricing((prevData) => {
      return [
        ...prevData,
        {
          ageRange: { min: '', max: '' },
          pricePerDay: '',
        },
      ];
    });
  };

  const removeChildPricing = (index) => {
    setChildPricing((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
  };

  useEffect(() => {
    const checkUser = async () => {
      if (!currUser) {
        await checkCurrUser();
      }
    };
    checkUser();
  }, [currUser, checkCurrUser]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!currUser) {
    return (
      <div className="flex justify-center items-center mt-16">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold mb-4">
            Authentication Required
          </h1>
          <p className="mb-6 text-gray-600">
            You must be logged in to create a new listing.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Create New Listing</h2>

        <form id="new-listing-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUpload
            imagePreview={imagePreview}
            imageLoader={imageLoader}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            fileInputRef={fileInputRef}
          />

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Add a catchy title"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Give a brief description about the listing"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 min-h-[100px]"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Price Input - Moved to be with other price-related fields */}
          <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-1 md:gap-6 ">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Pricing</h3>
                <p className="mt-1 text-sm text-gray-500">Set your pricing details</p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                <PriceInput
                  selectedCurrency={selectedCurrency}
                  exchangeRate={exchangeRate}
                  formData={formData}
                  handleChange={handleChange}
                  nightOnly={nightOnly}
                  setNightOnly={setNightOnly}
                  setFormData={setFormData}
                />

                {/* Child Pricing */}
                <ChildPricing
                  childPricing={childPricing}
                  handleChildAgeChange={handleChildAgeChange}
                  handleChildPriceChange={handleChildPriceChange}
                  addChildPricing={addChildPricing}
                  removeChildPricing={removeChildPricing}
                  selectedCurrency={selectedCurrency}
                />
              </div>
            </div>
          </div>

          {/* Location Search */}
          <LocationSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchChange={handleSearchChange}
            handleSearchSubmit={handleSearchSubmit}
            handleSelectSuggestion={handleSelectSuggestion}
            getCurrentLocation={handleGetCurrentLocation}
            suggestions={suggestions}
            isSearching={isSearching}
            isGettingLocation={isGettingLocation}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            address={address}
          />

          {/* Interactive Map */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Location on Map
            </label>
            <div className="text-sm text-gray-600 mb-2">
              Click on the map to set your exact location
            </div>
            {isClient && (
              <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapController position={position} zoom={13} />
                  <MapClickHandler onMapClick={handleMapClick} />
                  <Marker position={position}>
                    <Popup>
                      <div>
                        <strong>Your listing location</strong>
                        <br />
                        {address.city && address.country && (
                          <span>{address.city}, {address.country}</span>
                        )}
                        <br />
                        <small className="text-gray-500">
                          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                        </small>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={address.city}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none"
                placeholder="City will appear here"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={address.country}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none"
                placeholder="Country will appear here"
              />
            </div>
          </div>


          {/* Tags */}
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={handleTagsChange}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitLoader || !imageFile}
            className={`w-full py-3 rounded-md text-white transition-colors ${
              !imageFile
                ? 'bg-gray-400 cursor-not-allowed'
                : submitLoader
                    ? 'bg-rose-400'
                    : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {submitLoader ? (
              <BeatLoader size={10} color="white" />
            ) : (
              'Create Listing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewListing;
