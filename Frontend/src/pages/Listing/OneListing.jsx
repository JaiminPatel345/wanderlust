/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { FlashMessageContext } from '../../utils/flashMessageContext';
import axiosInstance from '../../api/axiosInstance';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCurrencyDollar,
  IconCurrencyRupee,
  IconEdit,
  IconHash,
  IconMapPin,
  IconTax,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import '../../rating.css';
import { isListingBookmarked, toggleBookmark } from '../../utils/bookmarkUtils';
import DatePicker from 'react-datepicker';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component imports
import PriceDisplay from '../../components/ui/listing/PriceDisplay';
import OwnerInfo from '../../components/ui/listing/OwnerInfo';
import Review from '../../components/ui/listing/Review';
import { deleteListing } from '../../api/index.js';

const ADMIN_ID = '66a343a50ff99cdefc1a4657';

const ListingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showWithTax, setShowWithTax] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  
  // New state for booking
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const { currUser, checkCurrUser } = useUserStore();
  const {
    showSuccessMessage,
    showErrorMessage,
  } = useContext(FlashMessageContext);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!currUser) await checkCurrUser();

      try {
        const response = await axiosInstance.get(`/listings/${id}`);
        const data = response.data;

        setListing(data);
        setReviews(data.reviews);

        if (currUser) {
          try {
            // Track view using axiosInstance
            await axiosInstance.post(`/analytics/listing/${id}/view`);

            const bookmarkStatus = await isListingBookmarked(id);
            setIsBookmarked(bookmarkStatus);
          } catch (error) {
            console.error('Error tracking view or checking bookmark:', error);
          }
        }
      } catch (error) {
        showErrorMessage(error.response?.data?.message || 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, currUser]);

  //remove bookmarks when user logout
  useEffect(() => {
    if (!currUser) {
      setIsBookmarked(false);
    }
  }, [id, currUser]);

  const handleDelete = async () => {
    setIsDeletingListing(true);

    try {
      await deleteListing(id);

      showSuccessMessage('Listing deleted successfully');
      navigate('/listings');
    } catch (error) {
      showErrorMessage(error.message || 'Failed to delete listing');
    } finally {
      setIsDeletingListing(false);
    }
  };

  const handleBookmark = async () => {
    if (!currUser) {
      showErrorMessage('Please log in to bookmark a listing');
      navigate('/login');
      return;
    }

    setIsBookmarked(!isBookmarked);

    try {
      const response = await toggleBookmark(id, isBookmarked);

      if (!response.success) {
        if (!response.message.includes('already bookmarked')) {
          setIsBookmarked(isBookmarked);
          showErrorMessage(response.message ||
              'Failed to update bookmark status');
        }
      } else {
        showSuccessMessage(isBookmarked
            ? 'Removed from bookmarks'
            : 'Added to bookmarks');
      }
    } catch (error) {
      setIsBookmarked(isBookmarked);
      showErrorMessage('Failed to update bookmark status');
    }
  };

  const handleReviewUpdate = (updatedReviews) => {
    setReviews(updatedReviews);
  };

  // Calculate total price when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && listing) {
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Use nightOnlyPrice if available and for one night
      let basePrice = listing.pricePerDay;
      if (diffDays === 1 && listing.nightOnlyPrice) {
        basePrice = listing.nightOnlyPrice;
      }
      
      const calculatedTotal = basePrice * diffDays;
      setTotalPrice(calculatedTotal);
    }
  }, [checkInDate, checkOutDate, listing]);

  const handleBookNow = async () => {
    // TO DO: Implement booking logic
  };

  const convertCurrency = async () => {
    try {
      if (!listing.pricePerDay || !displayCurrency) return;

      const convertedPricePerDay = await convertCurrencyAPI(listing.pricePerDay, 'USD', displayCurrency);
      const convertedNightOnlyPrice = listing.nightOnlyPrice ? await convertCurrencyAPI(listing.nightOnlyPrice, 'USD', displayCurrency) : null;

      setConvertedPrices({
        pricePerDay: convertedPricePerDay,
        nightOnlyPrice: convertedNightOnlyPrice
      });
    } catch (error) {
      console.error('Error converting currency:', error);
    }
  };

  useEffect(() => {
    convertCurrency();
  }, [listing, displayCurrency]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  const canModifyListing = Boolean(
      currUser &&
      (currUser.userId === listing?.owner?._id ||
          currUser.userId === ADMIN_ID),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Listing Details */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-gray-700">
                  {listing.rating ? listing.rating.toFixed(1) : 'New'}
                </span>
                <span className="mx-2">•</span>
                <span className="text-gray-700">
                  {reviews.length} reviews
                </span>
              </div>
            </div>
            {/* Bookmark button and other actions */}
            <div className="flex items-center gap-2">
              <button
                className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                onClick={handleBookmark}
                aria-label={isBookmarked
                  ? 'Remove from bookmarks'
                  : 'Save to bookmarks'}
              >
                {isBookmarked ? (
                  <IconBookmarkFilled size={22} className="text-rose-500"/>
                ) : (
                  <IconBookmark size={22} className="text-gray-600"/>
                )}
              </button>
              {canModifyListing && (
                <button
                  onClick={() =>
                    navigate(`/listings/${id}/edit`, {
                      state: listing,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <IconEdit size={20}/>
                  Edit
                </button>
              )}
              {canModifyListing && (
                <button
                  onClick={handleDelete}
                  disabled={isDeletingListing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <IconTrash size={20}/>
                  {isDeletingListing
                    ? 'Deleting...'
                    : 'Delete'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center text-gray-700">
              <IconMapPin className="h-5 w-5 mr-1" />
              <span>{listing.location}, {listing.country}</span>
            </div>
          </div>

          {/* Image gallery */}
          {listing?.image && (
            <div className="relative">
              <img
                src={listing.image.url}
                alt={listing.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
            <p className="mt-4 text-gray-700 whitespace-pre-line">{listing.description}</p>
          </div>

          {isClient && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64">
                <MapContainer 
                  center={[listing.coordinates.lat, listing.coordinates.lng]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[listing.coordinates.lat, listing.coordinates.lng]}>
                    <Popup>{listing.location}, {listing.country}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Reviews section */}
          <Review
            listingId={id}
            initialReviews={reviews}
            onReviewUpdate={handleReviewUpdate}
          />
        </div>

        {/* Right Column - Booking Sidebar */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-8">
            <div className="mb-4">
              <PriceDisplay 
                price={listing.pricePerDay} 
                currency={displayCurrency} 
                showWithTax={showWithTax} 
                isPerDay={true}
              />
              {listing.nightOnlyPrice && (
                <p className="text-sm text-gray-600 mt-1">Special night price: {displayCurrency === 'USD' ? '$' : '₹'}{listing.nightOnlyPrice}</p>
              )}
            </div>

            <div className="border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <DatePicker
                    selected={checkInDate}
                    onChange={date => setCheckInDate(date)}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    placeholderText="Add date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={date => setCheckOutDate(date)}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate}
                    placeholderText="Add date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>
                      {displayCurrency === 'USD' ? '$' : '₹'}{listing.pricePerDay} x 
                      {Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} days
                    </span>
                    <span>{displayCurrency === 'USD' ? '$' : '₹'}{totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-2">
                    <span>Total</span>
                    <span>{displayCurrency === 'USD' ? '$' : '₹'}{totalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
              onClick={handleBookNow}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
