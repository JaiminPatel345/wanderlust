/* eslint-disable react/prop-types */
import React, {useEffect, useState, useCallback, useContext, useRef, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ScaleLoader} from 'react-spinners';
import PropTypes from 'prop-types';
import useUserStore from '../../store/userStore';
import { Skeleton } from '../../components/ui/skeleton';

// Skeleton loading component for listings
const ListingSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
      ))}
    </div>
);

// Error component with retry functionality
const ErrorMessage = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <IconAlertCircle size={48} className="text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
);

import useListingStore from '../../store/listing';
import {useListingApi} from '../../hooks/listingApi.js';
import useTagStore from '../../store/tagStore';
import {
  IconBed,
  IconBuildingCastle,
  IconBuildingSkyscraper,
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyDollar,
  IconCurrencyRupee,
  IconFlame,
  IconMountain,
  IconPool,
  IconSearch,
  IconSnowflake,
  IconTax,
  IconTent,
  IconTractor,
  IconAlertCircle,
  IconPackage,
} from '@tabler/icons-react';
import ListingCard from '../../components/ui/listing/ListingCard.jsx';
import {fetchBookmarks, toggleBookmark} from '../../utils/bookmarkUtils';
import {FlashMessageContext} from '../../utils/flashMessageContext';

const FILTER_TAGS = [
  {id: 'trending', label: 'Trending', icon: IconFlame},
  {id: 'rooms', label: 'Rooms', icon: IconBed},
  {
    id: 'iconic-cities', label: 'Iconic cities', icon: IconBuildingSkyscraper,
  },
  {id: 'mountains', label: 'Mountains', icon: IconMountain},
  {id: 'castles', label: 'Castles', icon: IconBuildingCastle},
  {id: 'amazing-pools', label: 'Amazing pools', icon: IconPool},
  {id: 'camping', label: 'Camping', icon: IconTent},
  {id: 'farms', label: 'Farms', icon: IconTractor},
  {id: 'arctic', label: 'Arctic', icon: IconSnowflake},
];

const LISTINGS_PER_PAGE = 9; // Maximum listings per page

const TagFilter = ({tag, isActive, onClick}) => {
  const Icon = tag.icon;

  return (<div
      className={`filter flex flex-col items-center cursor-pointer transition-colors
                flex-shrink-0 min-w-[60px] px-1
                ${isActive
          ? '!text-red-600'
          : 'text-gray-600'} hover:text-blue-500`}
      onClick={() => onClick(tag.label)}
  >
    <Icon size={20}/>
    <p className="text-xs mt-1 whitespace-nowrap">{tag.label}</p>
  </div>);
};

// Pagination component
const Pagination = ({currentPage, totalPages, onPageChange}) => {
  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show first page
    pageNumbers.push(1);

    // Add current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <=
    Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    // Add ellipsis where needed
    const result = [];
    let prevPage = null;

    for (const page of pageNumbers) {
      if (prevPage && page - prevPage > 1) {
        result.push('...');
      }
      result.push(page);
      prevPage = page;
    }

    return result;
  };

  const pageNumbers = getPageNumbers();

  // Scroll to top function - will be called before changing pages
  const scrollToTop = () => {
    try {
      // Try multiple approaches for maximum compatibility
      document.documentElement.scrollTop = 0; // Modern browsers
      document.body.scrollTop = 0; // Older browsers
      window.scrollTo(0, 0); // Direct approach
    } catch (e) {
      console.error('Error scrolling to top:', e);
    }
  };

  // Handle click on any pagination button
  const handlePrevClick = () => {
    if (currentPage > 1) {
      scrollToTop();
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      scrollToTop();
      onPageChange(currentPage + 1);
    }
  };

  const handlePageNumberClick = (page) => {
    scrollToTop();
    onPageChange(page);
  };

  return (<div className="flex justify-center items-center space-x-2 my-8">
    {/* Previous button */}
    <button
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-full ${currentPage ===
        1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'}`}
        aria-label="Previous page"
    >
      <IconChevronLeft size={20}/>
    </button>

    {/* Page numbers */}
    {pageNumbers.map((page, index) => (page === '...' ? (
        <span key={`ellipsis-${index}`} className="px-2">...</span>) : (<button
        key={page}
        onClick={() => handlePageNumberClick(page)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentPage ===
        page
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
    >
      {page}
    </button>)))}

    {/* Next button */}
    <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-full ${currentPage ===
        totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'}`}
        aria-label="Next page"
    >
      <IconChevronRight size={20}/>
    </button>
  </div>);
};

const Listings = ({ initialPage = 1 }) => {
  // Get listings from store - FIXED: Removed unstable useCallback
  const allListings = useListingStore(state => state.allListings || []);
  const filterListings = useListingStore(state => state.filterListings || []);
  const filterListingsOnTag = useListingStore(state => state.filterListingsOnTag);
  const setListings = useListingStore(state => state.setListings);

  // Get the API functions
  const { getAllListings: fetchAllListings, getListingById } = useListingApi();

  // Component state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedListings, setBookmarkedListings] = useState([]);
  const [isSearchResults, setIsSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithTax, setShowWithTax] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedListings, setPaginatedListings] = useState([]);

  // Store references
  const { selectedTags, tagClick } = useTagStore();
  const { currUser, checkCurrUser } = useUserStore();
  const { showErrorMessage, showSuccessMessage } = useContext(FlashMessageContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Abort controller for cleanup
  const abortControllerRef = useRef(new AbortController());

  // FIXED: Stable fetchListingsWithRetry function
  const fetchListingsWithRetry = useCallback(async () => {
    if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }

    const signal = abortControllerRef.current.signal;

    try {
      setError(null);
      setLoading(true);

      // Fetch listings
      const listings = await fetchAllListings(setLoading);

      // If user is logged in, fetch their bookmarks
      if (currUser && !signal.aborted) {
        try {
          const response = await fetchBookmarks();
          if (response?.success && Array.isArray(response.data?.bookmarks)) {
            const newBookmarks = response.data.bookmarks
            .map(bookmark => bookmark._id)
            .filter(Boolean);
            setBookmarkedListings(newBookmarks);
          }
        } catch (error) {
          if (!signal.aborted) {
            console.error('Error fetching bookmarks:', error);
          }
        }
      }

      // Check if coming from search
      if (location.state?.fromSearch && !signal.aborted) {
        setIsSearchResults(true);
      }

      return listings;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch listings:', err);
        setError({
          message: 'Failed to load listings. Please check your connection and try again.',
          // retry: () => fetchListingsWithRetry(),
        });
        setLoading(false);
      }
      return [];
    } finally {
      if (!signal.aborted) {
        setIsInitialLoad(false);
      }
    }
  }, [currUser, location.state?.fromSearch, fetchAllListings]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchListingsWithRetry();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Filter out any invalid listings as an extra safety measure
  const validListings = useMemo(() => {
    if (!Array.isArray(allListings)) return [];
    return allListings.filter(listing =>
        listing?._id &&
        listing?.title &&
        typeof listing.pricePerDay === 'number'
    );
  }, [allListings]);

  // Filter listings based on selected tags and search query
  const filteredListings = useMemo(() => {
    if (!Array.isArray(validListings) || !validListings.length) return [];

    try {
      let result = [...validListings];

      // Apply search filter if active
      if (isSearchResults && searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        result = result.filter(listing => {
          return (
              (listing.title?.toLowerCase() || '').includes(searchLower) ||
              (listing.location?.toLowerCase() || '').includes(searchLower) ||
              (listing.country?.toLowerCase() || '').includes(searchLower) ||
              (Array.isArray(listing.tags) && listing.tags.some(tag =>
                  String(tag || '').toLowerCase().includes(searchLower)
              ))
          );
        });
      }

      // Apply tag filter if tags are selected
      if (Array.isArray(selectedTags) && selectedTags.length > 0) {
        result = result.filter(listing =>
            Array.isArray(listing.tags) &&
            listing.tags.some(tag => selectedTags.includes(tag))
        );
      }

      return result;
    } catch (err) {
      console.error('Error filtering listings:', err);
      return [];
    }
  }, [validListings, selectedTags, searchQuery, isSearchResults]);

  // FIXED: Update filtered listings in store only when actually different
  // useEffect(() => {
  //   // Only update if the array content has actually changed
  //   if (
  //       Array.isArray(filteredListings) &&
  //       filteredListings !== filterListings &&
  //       JSON.stringify(filteredListings.map(l => l._id)) !== JSON.stringify(filterListings.map(l => l._id))
  //   ) {
  //     setListings(filteredListings);
  //   }
  // }, [filteredListings, filterListings, setListings]);

  // Update pagination when listings or page changes
  useEffect(() => {
    if (Array.isArray(filterListings) && filterListings.length > 0) {
      try {
        // Calculate total pages
        const calculatedTotalPages = Math.max(1, Math.ceil(filterListings.length / LISTINGS_PER_PAGE));

        // Only update totalPages if it's different
        if (calculatedTotalPages !== totalPages) {
          setTotalPages(calculatedTotalPages);
        }

        // Reset to page 1 if current page is out of bounds after filter change
        const safeCurrentPage = Math.min(Math.max(1, currentPage), calculatedTotalPages);
        if (currentPage !== safeCurrentPage) {
          setCurrentPage(safeCurrentPage);
          return; // Let the effect run again with the corrected page number
        }

        // Get listings for current page
        const startIndex = (safeCurrentPage - 1) * LISTINGS_PER_PAGE;
        const endIndex = Math.min(startIndex + LISTINGS_PER_PAGE, filterListings.length);
        const newPaginatedListings = filterListings.slice(startIndex, endIndex);

        // Only update if the paginated listings have actually changed
        if (JSON.stringify(newPaginatedListings.map(l => l._id)) !== JSON.stringify(paginatedListings.map(l => l._id))) {
          setPaginatedListings(newPaginatedListings);
        }
      } catch (err) {
        console.error('Error updating pagination:', err);
        setPaginatedListings([]);
        setTotalPages(1);
      }
    } else {
      if (paginatedListings.length > 0) {
        setPaginatedListings([]);
      }
      if (totalPages !== 1) {
        setTotalPages(1);
      }
    }
  }, [filterListings, currentPage, totalPages, paginatedListings]);

  // Remove bookmarks when user logout
  useEffect(() => {
    if (!currUser) {
      setBookmarkedListings([]);
    }
  }, [currUser]);

  // FIXED: Stable handleTagClick function
  const handleTagClick = useCallback(async (tag) => {
    setIsSearchResults(false); // Reset search results state
    await tagClick(tag);
    filterListingsOnTag();
    setCurrentPage(1); // Reset to first page when filters change
  }, [tagClick, filterListingsOnTag]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle bookmark toggle with optimistic UI update
  const handleToggleBookmark = useCallback(async (listingId, newBookmarkStatus) => {
    if (!currUser) {
      showErrorMessage('Please log in to bookmark listings');
      navigate('/login');
      return;
    }

    // Validate listing ID
    if (!listingId) {
      console.error('Invalid listing ID');
      return;
    }

    // Optimistically update UI
    setBookmarkedListings(prev => {
      if (newBookmarkStatus) {
        return [...new Set([...prev, listingId])]; // Ensure no duplicates
      } else {
        return prev.filter(id => id !== listingId);
      }
    });

    // Make API call in the background
    try {
      const response = await toggleBookmark(listingId, !newBookmarkStatus);

      // If API call failed, revert the UI change
      if (!response?.success) {
        // Revert the optimistic update
        setBookmarkedListings(prev => {
          if (newBookmarkStatus) {
            return prev.filter(id => id !== listingId);
          } else {
            return [...new Set([...prev, listingId])];
          }
        });

        // Show error message only for actual error conditions, not for "already bookmarked" case
        if (response?.message && !response.message.includes('already bookmarked')) {
          showErrorMessage(response.message || 'Failed to update bookmark');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert the optimistic update
      setBookmarkedListings(prev => {
        if (newBookmarkStatus) {
          return prev.filter(id => id !== listingId);
        } else {
          return [...new Set([...prev, listingId])];
        }
      });
      showErrorMessage('Failed to update bookmark status');
    }
  }, [currUser, showErrorMessage, navigate]);

  // Show loading state
  if (isInitialLoad && loading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <ListingSkeleton count={6} />
        </div>
    );
  }

  // Show error state
  if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage
              message={error.message}
              onRetry={error.retry}
          />
        </div>
    );
  }

  // Show empty state
  if (!loading && (!allListings || allListings.length === 0)) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconPackage size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-6">We couldn't find any listings matching your criteria.</p>
          <button
              onClick={fetchListingsWithRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Listings
          </button>
        </div>
    );
  }

  return (<div className="container mx-auto px-4 py-4">
    {isSearchResults && (<div
        className="mb-4 bg-gray-50 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center">
        <IconSearch size={24} className="text-gray-500 mr-2"/>
        <span className="font-medium">Search Results</span>
        <span
            className="ml-2 text-gray-500">({filterListings.length} listings found)</span>
      </div>
      <button
          onClick={() => {
            setIsSearchResults(false);
            setSearchQuery('');
            filterListingsOnTag(); // Reset to tag-filtered listings
          }}
          className="text-sm text-rose-600 hover:text-rose-700"
      >
        Clear search results
      </button>
    </div>)}

    <div className="flex flex-col mb-4">
      {!isSearchResults && (<div className="w-full overflow-hidden mb-4">
        {/* Horizontally scrollable filter tags */}
        <div
            className="flex items-center overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 touch-pan-x">
          <div className="flex flex-nowrap gap-4 min-w-full md:min-w-0">
            {FILTER_TAGS.map((tag) => (<TagFilter
                key={tag.id}
                tag={tag}
                isActive={selectedTags.includes(tag.label)}
                onClick={handleTagClick}
            />))}
          </div>
        </div>
      </div>)}

      {/* Price display options in a compact toggle group */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1">
          <div className="flex border rounded-md overflow-hidden">
            <button
                onClick={() => setDisplayCurrency('INR')}
                className={`p-1.5 sm:px-2 sm:py-1 flex items-center gap-1 text-xs ${displayCurrency ===
                'INR' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                title="Show in Rupees"
            >
              <IconCurrencyRupee size={16}/>
              <span className="hidden sm:inline">INR</span>
            </button>
            <button
                onClick={() => setDisplayCurrency('USD')}
                className={`p-1.5 sm:px-2 sm:py-1 flex items-center gap-1 text-xs ${displayCurrency ===
                'USD' ? 'bg-gray-100 font-medium' : 'bg-white'}`}
                title="Show in Dollars"
            >
              <IconCurrencyDollar size={16}/>
              <span className="hidden sm:inline">USD</span>
            </button>
          </div>

          <button
              onClick={() => setShowWithTax(!showWithTax)}
              className={`p-1.5 rounded-md border flex items-center justify-center ${showWithTax
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white'}`}
              title={showWithTax ? 'Price includes tax' : 'Price excludes tax'}
          >
            <IconTax size={18} className={showWithTax
                ? 'text-blue-500'
                : 'text-gray-400'}/>
          </button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedListings.map((listing) => {
        if (!listing?._id) return null;

        return (
            <div key={listing._id} className="h-full">
              <ListingCard
                  listing={listing}
                  showWithTax={showWithTax}
                  displayCurrency={displayCurrency}
                  isBookmarked={bookmarkedListings.includes(listing._id)}
                  onToggleBookmark={handleToggleBookmark}
              >
                {listing.rating !== undefined && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-700">
                    {typeof listing.rating === 'number' ? listing.rating.toFixed(1) : 'New'}
                  </span>
                    </div>
                )}
              </ListingCard>
            </div>
        );
      })}
    </div>

    {/* Display number of listings and pagination */}
    {filterListings.length > 0 && (<div className="mt-8">
      {totalPages > 1 && (<Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      />)}
    </div>)}
  </div>);
};

// Prop types validation
Listings.propTypes = {
  initialPage: PropTypes.number,
};

// Default props
Listings.defaultProps = {
  initialPage: 1,
};

export default React.memo(Listings);