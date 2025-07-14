/* eslint-disable react/prop-types */
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import useUserStore from '../../store/userStore';
import {FlashMessageContext} from '../../utils/flashMessageContext';
import axiosInstance from '../../api/axiosInstance';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconEdit,
  IconMapPin,
  IconTrash,
  IconStar,
  IconCalendar,
  IconUsers,
  IconShare,
  IconMoon,
  IconMail,
  IconCopy,
  IconCheck,
  IconX,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
} from '@tabler/icons-react';
import '../../rating.css';
import {isListingBookmarked, toggleBookmark} from '../../utils/bookmarkUtils';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BookingCard from '../../components/listing/BookingCard';
import HostInfo from '../../components/listing/HostInfo';
import Review from '../../components/ui/listing/Review';
import {deleteListing} from '../../api/index.js';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom styles for date picker
const datePickerStyles = `
  .react-datepicker {
    border: none !important;
    border-radius: 1rem !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    font-family: inherit !important;
  }
  
  .react-datepicker__header {
    background-color: white !important;
    border-bottom: 1px solid #e5e7eb !important;
    border-radius: 1rem 1rem 0 0 !important;
    padding: 1rem !important;
  }
  
  .react-datepicker__current-month {
    color: #111827 !important;
    font-weight: 600 !important;
    font-size: 1.1rem !important;
  }
  
  .react-datepicker__day-names {
    margin-bottom: 0.5rem !important;
  }
  
  .react-datepicker__day-name {
    color: #6b7280 !important;
    font-weight: 500 !important;
  }
  
  .react-datepicker__day {
    border-radius: 0.5rem !important;
    color: #374151 !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
  }
  
  .react-datepicker__day--today {
    background-color: #fef3f2 !important;
    color: #dc2626 !important;
    font-weight: 600 !important;
  }
  
  .react-datepicker__day--selected {
    background-color: #ec4899 !important;
    color: white !important;
    font-weight: 600 !important;
  }
  
  .react-datepicker__day--in-range {
    background-color: #fce7f3 !important;
    color: #be185d !important;
  }
  
  .react-datepicker__day--keyboard-selected {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
  }
  
  .react-datepicker__day:hover {
    background-color: #fce7f3 !important;
    color: #be185d !important;
  }
  
  .react-datepicker__navigation {
    top: 1.2rem !important;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: #6b7280 !important;
  }
  
  .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: #ec4899 !important;
  }
  
  .react-datepicker__day--disabled {
    color: #d1d5db !important;
    cursor: not-allowed !important;
  }
  
  .react-datepicker__day--disabled:hover {
    background-color: transparent !important;
    color: #d1d5db !important;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = datePickerStyles;
  document.head.appendChild(styleElement);
}

const ListingDetail = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Booking state
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState([]);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const {currUser, checkCurrUser} = useUserStore();
  const {
    showSuccessMessage,
    showErrorMessage,
  } = useContext(FlashMessageContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGuestSelector &&
          !event.target.closest('.guest-selector-container')) {
        setShowGuestSelector(false);
      }
      if (showShareMenu &&
          !event.target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showGuestSelector, showShareMenu]);

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
        showErrorMessage(error.response?.data?.message ||
            'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, currUser]);

  // Remove bookmarks when user logout
  useEffect(() => {
    if (!currUser) {
      setIsBookmarked(false);
    }
  }, [currUser]);

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

  const handleShareToggle = () => {
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      showSuccessMessage('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      showErrorMessage('Failed to copy link');
    }
  };

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(listing?.title || 'Check out this amazing place!');
    const description = encodeURIComponent(listing?.description?.substring(0, 100) + '...' || '');

    const shareUrls = {
      whatsapp: `https://wa.me/?text=Hey! Check out this amazing place: ${title}%20${url}`,
      facebook: `https://www.facebook.com/messages/t/?text=${title}%20${url}`,
      twitter: `https://twitter.com/messages/compose?text=${title}%20${url}`,
      linkedin: `https://www.linkedin.com/messaging/compose?text=${title}%20${url}`,
      instagram: `https://www.instagram.com/direct/inbox/`, // Instagram direct messages
      email: `mailto:?subject=Check out this place - ${decodeURIComponent(title)}&body=Hi!%0A%0AI found this amazing place and thought you might like it:%0A%0A${decodeURIComponent(title)}%0A%0A${decodeURIComponent(description)}%0A%0ACheck it out here: ${decodeURIComponent(url)}`
    };

    if (platform === 'instagram') {
      showSuccessMessage('Opening Instagram. You can share the link in your direct messages!');
      copyToClipboard();
      window.open(shareUrls[platform], '_blank');
      setShowShareMenu(false);
      return;
    }

    if (platform === 'email') {
      // Email opens in the same window
      window.location.href = shareUrls[platform];
    } else {
      // Open social media links in new tab
      window.open(shareUrls[platform], '_blank');
    }

    setShowShareMenu(false);
  };

  // Calculate total price when dates or guests change
  useEffect(() => {
    if (checkInDate && checkOutDate && listing) {
      const diffTime = Math.abs(checkOutDate - checkInDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate adult price
      let basePrice = listing.pricePerDay;
      if (diffDays === 1 && listing.nightOnlyPrice) {
        basePrice = listing.nightOnlyPrice;
      }
      let adultTotal = basePrice * diffDays * adults;

      // Calculate child prices
      let childTotal = 0;
      children.forEach((child) => {
        const childAge = child.age;
        const childPricing = listing.childPricing?.find((cp) => childAge >=
            cp.ageRange.min && childAge <= cp.ageRange.max);

        if (childPricing) {
          childTotal += childPricing.pricePerDay * diffDays;
        }
      });

      setTotalPrice(adultTotal + childTotal);
    } else {
      setTotalPrice(0);
    }
  }, [checkInDate, checkOutDate, listing, adults, children]);

  const handleBookNow = async () => {
    if (!currUser) {
      showErrorMessage('Please log in to book a listing');
      navigate('/login');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      showErrorMessage('Please select check-in and check-out dates');
      return;
    }

    // TODO: Implement booking logic
    showSuccessMessage('Done');

    //reset
    setCheckInDate(null)
    setCheckOutDate(null)
    setAdults(null)
    setChildren([])
  };

  if (isLoading || !listing) {
    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your perfect stay...</p>
          </div>
        </div>
    );
  }

  const canModifyListing = Boolean(currUser && currUser.userId ===
      listing?.owner?._id);

  // Calculate average rating
  const averageRating = reviews.length > 0 ? reviews.reduce((
      sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div
                  className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{listing.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <IconStar
                          className="w-5 h-5 text-yellow-400 fill-current"/>
                      <span
                          className="font-medium text-gray-900">{averageRating >
                      0 ? averageRating.toFixed(1) : 'New'}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span
                        className="text-gray-600 underline cursor-pointer hover:text-gray-900">{reviews.length} reviews</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <IconMapPin className="w-4 h-4"/>
                      <span>{listing.location.split(',')[0]}, {listing.country}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <div className="relative share-menu-container">
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        onClick={handleShareToggle}
                    >
                      <IconShare className="w-4 h-4"/>
                      Share
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Share with friends</h3>
                              <button
                                  onClick={() => setShowShareMenu(false)}
                                  className="text-gray-400 hover:text-gray-600"
                              >
                                <IconX className="w-5 h-5"/>
                              </button>
                            </div>

                            {/* Copy Link */}
                            <div className="mb-4">
                              <button
                                  onClick={copyToClipboard}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                {linkCopied ? (
                                    <IconCheck className="w-5 h-5 text-green-500"/>
                                ) : (
                                    <IconCopy className="w-5 h-5 text-gray-600"/>
                                )}
                                <span className="text-gray-700">
                                  {linkCopied ? 'Link copied!' : 'Copy link'}
                                </span>
                              </button>
                            </div>

                            {/* Social Media Options */}
                            <div className="space-y-2">
                              <button
                                  onClick={() => shareToSocialMedia('whatsapp')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconBrandWhatsapp className="w-5 h-5 text-green-500"/>
                                <span className="text-gray-700">Send via WhatsApp</span>
                              </button>

                              <button
                                  onClick={() => shareToSocialMedia('facebook')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconBrandFacebook className="w-5 h-5 text-blue-600"/>
                                <span className="text-gray-700">Send via Messenger</span>
                              </button>

                              <button
                                  onClick={() => shareToSocialMedia('twitter')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconBrandTwitter className="w-5 h-5 text-blue-400"/>
                                <span className="text-gray-700">Send via Twitter DM</span>
                              </button>

                              <button
                                  onClick={() => shareToSocialMedia('linkedin')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconBrandLinkedin className="w-5 h-5 text-blue-700"/>
                                <span className="text-gray-700">Send via LinkedIn</span>
                              </button>

                              <button
                                  onClick={() => shareToSocialMedia('instagram')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconBrandInstagram className="w-5 h-5 text-pink-500"/>
                                <span className="text-gray-700">Send via Instagram DM</span>
                              </button>

                              <button
                                  onClick={() => shareToSocialMedia('email')}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <IconMail className="w-5 h-5 text-gray-600"/>
                                <span className="text-gray-700">Send via Email</span>
                              </button>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>

                  <button
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      onClick={handleBookmark}
                      aria-label={isBookmarked
                          ? 'Remove from bookmarks'
                          : 'Save to bookmarks'}
                  >
                    {isBookmarked ? (
                        <IconBookmarkFilled className="w-4 h-4 text-red-500"/>
                    ) : (
                        <IconBookmark className="w-4 h-4"/>
                    )}
                    Save
                  </button>
                  {canModifyListing && (
                      <>
                        <button
                            onClick={() => navigate(`/listings/${id}/edit`,
                                {state: listing},
                            )}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl duration-200"
                        >
                          <IconEdit className="w-4 h-4"/>
                          Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeletingListing}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          <IconTrash className="w-4 h-4"/>
                          {isDeletingListing ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {listing?.image && (
                <div className="relative">
                  <div
                      className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                    <img
                        src={listing.image.url}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div
                      className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <HostInfo owner={listing.owner}/>

              {listing.tags && listing.tags.length > 0 && (
                  <div
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, index) => (
                          <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                        {tag}
                      </span>
                      ))}
                    </div>
                  </div>
              )}

              <div
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About
                  this
                  place</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {isClient && listing.coordinates && (
                  <div
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{`Where you'll be`}</h2>
                    <div className="h-80 rounded-xl overflow-hidden">
                      <MapContainer
                          center={[
                            listing.coordinates.lat,
                            listing.coordinates.lng,
                          ]}
                          zoom={13}
                          style={{height: '100%', width: '100%'}}
                      >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[
                          listing.coordinates.lat,
                          listing.coordinates.lng,
                        ]}>
                          <Popup>{listing.location}, {listing.country}</Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    <p className="mt-4 text-gray-600">{listing.location}, {listing.country}</p>
                  </div>
              )}

              <div
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <Review
                    listingId={id}
                    initialReviews={reviews}
                    onReviewUpdate={handleReviewUpdate}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BookingCard
                    listing={listing}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    setCheckInDate={setCheckInDate}
                    setCheckOutDate={setCheckOutDate}
                    adults={adults}
                    setAdults={setAdults}
                    setChildren={setChildren}
                    totalPrice={totalPrice}
                    handleBookNow={handleBookNow}
                    showGuestSelector={showGuestSelector}
                    setShowGuestSelector={setShowGuestSelector}
                    children={children}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ListingDetail;