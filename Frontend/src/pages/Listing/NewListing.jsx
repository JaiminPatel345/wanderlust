import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {BeatLoader, PulseLoader} from 'react-spinners';
import {FlashMessageContext} from '../../utils/flashMessageContext';
import useUserStore from '../../store/userStore';
import {
  getCloudinarySignature,
  uploadToCloudinary,
  validateImageFile,
} from '../../utils/cloudinaryUtils';
import {IconPhoto, IconTrash} from '@tabler/icons-react';
import TagSelector from '../../components/ui/TagSelector';
import {createListing} from '../../api/index.js';

const NewListing = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 1200,
    country: '',
    location: '',
    tags: [],
  });
  // Used for display and input in the UI only, not sent to backend
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  // USD to INR conversion rate (approx)
  const [exchangeRate] = useState(83.5);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);
  const {
    showSuccessMessage,
    showErrorMessage,
    clearFlashMessage,
  } = useContext(FlashMessageContext);
  const {currUser, checkCurrUser} = useUserStore();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      if (!currUser) {
        await checkCurrUser();
      }
    };
    checkUser();
  }, []);

  const handleChange = (e) => {
    const {name, value} = e.target;

    // Special handling for currency changes - convert price value for display
    if (name === 'currency') {
      if (value === 'INR' && selectedCurrency === 'USD') {
        // Convert USD to INR for display
        setFormData((prevData) => ({
          ...prevData,
          price: Math.round(prevData.price * exchangeRate),
        }));
        setSelectedCurrency(value);
      } else if (value === 'USD' && selectedCurrency === 'INR') {
        // Convert INR to USD for display
        setFormData((prevData) => ({
          ...prevData,
          price: Math.round(prevData.price / exchangeRate),
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
    setFormData(prevData => ({
      ...prevData,
      tags: newTags,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
        !formData.title ||
        !formData.description ||
        !formData.price ||
        !formData.country ||
        !formData.location
    ) {
      showErrorMessage('Please fill in all required fields');
      return;
    }

    if (!imageFile) {
      showErrorMessage('Please upload an image for your listing');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitLoader(true);

    try {
      let finalPrice = formData.price;

      // If user entered price in INR, convert to USD before sending to backend
      if (selectedCurrency === 'INR') {
        finalPrice = Math.round(formData.price / exchangeRate);
      }

      const data = {
        ...formData,
        price: finalPrice, // Always sends price in USD to backend
        tagsArray: formData.tags,
        image: imageFile,
      };

      const response = await sendData(data);
      showSuccessMessage(`Listing added successfully`);
      navigate(`/listings/${response._id}`);
    } catch (error) {
      showErrorMessage(error.message || 'Failed to create listing');
      window.scrollTo(0, 0);
    } finally {
      setSubmitLoader(false);
    }
  };

  const sendData = async (data) => {
    try {
      const response = await createListing(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create listing');
      }
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate the image file
    const validation = validateImageFile(file);
    if (!validation) {
      showErrorMessage(validation.message);
      return;
    }

    // Create a preview of the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageLoader(true);
    clearFlashMessage();

    try {
      // Get signature from backend
      const signatureData = await getCloudinarySignature('listing');

      if (!signatureData || !signatureData.cloud_name ||
          !signatureData.api_key) {
        throw new Error('Failed to get upload credentials');
      }

      // Upload to Cloudinary with signature
      const imageUrl = await uploadToCloudinary(file, signatureData);

      if (!imageUrl) {
        throw new Error('No image URL returned from upload');
      }

      // Set the returned URL
      setImageFile(imageUrl);
      showSuccessMessage('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      showErrorMessage(error.message || 'Failed to upload image');
      // Reset the file input
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

  if (!currUser) {
    //You are not login page
    return (
        <div className="flex justify-center items-center mt-16">
          <div
              className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
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

          <form
              id="new-listing-form"
              onSubmit={handleSubmit}
              className="space-y-6"
          >
            {/* Image Upload Section */}
            <div className="mb-8">
              <label
                  className="block text-sm font-medium text-gray-700 mb-2"
              >
                Listing Image
              </label>
              <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {!imagePreview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <IconPhoto size={48} className="text-gray-400 mb-2"/>
                      <p className="text-sm text-gray-500 mb-1">Click to upload
                        an image</p>
                      <p className="text-xs text-gray-400">JPG, PNG or GIF (max.
                        5MB)</p>

                      {imageLoader && (
                          <div className="mt-4">
                            <PulseLoader size={8} color="#f43f5e"/>
                          </div>
                      )}
                    </div>
                ) : (
                    <div className="relative">
                      <img
                          src={imagePreview}
                          alt="Listing preview"
                          className="max-h-64 mx-auto rounded-md"
                      />
                      <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                          title="Remove image"
                      >
                        <IconTrash size={16} className="text-red-500"/>
                      </button>

                      {imageLoader && (
                          <div
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                            <PulseLoader size={10} color="#ffffff"/>
                          </div>
                      )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={imageLoader}
                />
              </div>
            </div>

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
              ></textarea>
            </div>

            {/* Price & Currency & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price
                </label>
                <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                    onChange={handleChange}
                />
              </div>

              <div>
                <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Currency
                </label>
                <select
                    name="currency"
                    id="currency"
                    value={selectedCurrency}
                    className="w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                    onChange={handleChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <input
                    type="text"
                    name="country"
                    id="country"
                    placeholder="India"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                    onChange={handleChange}
                />
              </div>

              <div>
                <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="Vadodara, Gujarat"
                    required
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
                    onChange={handleChange}
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
                  <BeatLoader size={10} color="white"/>
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
