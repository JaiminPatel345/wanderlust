import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCurrencyDollar,
  IconCurrencyRupee,
  IconHash,
  IconMapPin,
  IconWorld,
} from '@tabler/icons-react';
import {toggleBookmark} from '../../../utils/bookmarkUtils.js';
import {FlashMessageContext} from '../../../utils/flashMessageContext.jsx';
import useUserStore from '../../../store/userStore.js';

const TAX_RATE = 0.18; // 18% GST
const USD_TO_INR_RATE = 83.5; // 1 USD = 83.5 INR (approx)

const PriceDisplay = ({
  price,
  showWithTax = false,
  displayCurrency = 'USD',
}) => {
  // Handle null/undefined price
  if (price === null || price === undefined) {
    return <span className="text-gray-500">Price not available</span>;
  }

  // Calculate price with tax if needed
  const priceWithTax = showWithTax ? (price + price * TAX_RATE) : price;

  // All prices in DB are in USD, convert to INR if needed
  let displayPrice = priceWithTax;
  if (displayCurrency === 'INR') {
    displayPrice = priceWithTax * USD_TO_INR_RATE;
  }

  // Format the price based on currency
  const formattedPrice = displayCurrency === 'USD'
      ? displayPrice.toLocaleString('en-US', {maximumFractionDigits: 2})
      : Math.round(displayPrice).toLocaleString('en-IN');

  // Currency icon
  const CurrencyIcon = displayCurrency === 'USD'
      ? IconCurrencyDollar
      : IconCurrencyRupee;

  return (
      <div className="flex items-center gap-1">
        <CurrencyIcon size={18} className="text-gray-600 flex-shrink-0"/>
        <span className="font-medium">{formattedPrice}</span>
        {showWithTax && (
            <span className="text-xs text-gray-500 ml-1">(Incl. tax)</span>
        )}
      </div>
  );
};

PriceDisplay.propTypes = {
  price: PropTypes.number.isRequired,
  showWithTax: PropTypes.bool,
  displayCurrency: PropTypes.string,
};

const ListingCard = ({
  listing,
  showWithTax = false,
  displayCurrency = 'USD',
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const {showSuccessMessage, showErrorMessage} = React.useContext(
      FlashMessageContext);
  const navigate = useNavigate();
  const {currUser} = useUserStore();

  // Update bookmarked state when isBookmarked prop changes
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault(); // Prevent navigation to listing details
    e.stopPropagation(); // Prevent event bubbling

    // Check if user is logged in
    if (!currUser) {
      showErrorMessage('Please log in to bookmark listings');
      navigate('/login');
      return;
    }

    if (isBookmarkProcessing) return;

    // Optimistically update UI
    setBookmarked(!bookmarked);
    setIsBookmarkProcessing(true);

    try {
      // If a custom handler is provided, use it
      if (onToggleBookmark) {
        onToggleBookmark(listing._id, !bookmarked);
        setIsBookmarkProcessing(false);
        return;
      }

      // Otherwise use the default toggle functionality
      const response = await toggleBookmark(listing._id, bookmarked);

      if (!response.success) {
        // Only revert UI and show error for real errors (not "already bookmarked")
        if (!response.message.includes('already bookmarked')) {
          setBookmarked(bookmarked);
          showErrorMessage(response.message || 'Failed to update bookmark');
        }
      } else {
        showSuccessMessage(bookmarked
            ? 'Removed from bookmarks'
            : 'Added to bookmarks');
      }
    } catch (error) {
      // Revert UI state if operation fails
      console.error('Error toggling bookmark:', error);
      setBookmarked(bookmarked);
      showErrorMessage('Failed to update bookmark status');
    } finally {
      setIsBookmarkProcessing(false);
    }
  };

  return (
      <div
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
        {/* Bookmark button */}
        <button
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
            onClick={handleBookmarkClick}
            disabled={isBookmarkProcessing}
            aria-label={bookmarked
                ? 'Remove from bookmarks'
                : 'Save to bookmarks'}
        >
          {bookmarked ? (
              <IconBookmarkFilled size={22} className="text-rose-500"/>
          ) : (
              <IconBookmark size={22} className="text-gray-600"/>
          )}
        </button>

        <Link to={`/listings/${listing._id}`} className="block">
          <img
              src={listing.image.url}
              className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
              alt={listing.title}
              loading="lazy"
          />
          <div className="p-4">
            <h5 className="text-xl font-semibold mb-2">{listing.title}</h5>
            <div className="space-y-3">
              <PriceDisplay
                  price={listing.pricePerDay || 0}
                  showWithTax={showWithTax}
                  displayCurrency={displayCurrency}
              />

              <div className="flex items-center gap-2">
                <IconMapPin size={20} className="flex-shrink-0"/>
                <span className="truncate">{listing.location}</span>
              </div>

              {listing.country && (
                  <div className="flex items-center gap-2">
                    <IconWorld size={20} className="flex-shrink-0"/>
                    <span className="truncate">{listing.country}</span>
                  </div>
              )}

              {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {listing.tags.filter((tag) => tag !== 'null' && tag).
                        slice(0, 3) // Limit to first 3 tags
                        .map((tag) => (
                            <span
                                key={tag}
                                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                            >
                      <IconHash size={14}/>
                              {tag}
                    </span>
                        ))}
                    {listing.tags.filter(t => t !== 'null' && t).length > 3 && (
                        <span
                            className="text-sm text-gray-500">+{listing.tags.filter(
                            t => t !== 'null' && t).length - 3} more</span>
                    )}
                  </div>
              )}
            </div>
          </div>
        </Link>
      </div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    pricePerDay: PropTypes.number,
    location: PropTypes.string.isRequired,
    country: PropTypes.string,
    image: PropTypes.shape({
      url: PropTypes.string,
      filename: PropTypes.string,
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    childPricing: PropTypes.arrayOf(PropTypes.shape({
      ageRange: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      }),
      price: PropTypes.number
    })),
    coordinates: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    })
  }).isRequired,
  showWithTax: PropTypes.bool,
  displayCurrency: PropTypes.string,
  isBookmarked: PropTypes.bool,
  onToggleBookmark: PropTypes.func,
};

export default ListingCard; 