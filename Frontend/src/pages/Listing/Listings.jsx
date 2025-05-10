/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ScaleLoader} from 'react-spinners';
import useUserStore from '../../store/userStore';
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

const Listings = () => {
  const {
    filterListings,
    allListings,
    filterListingsOnTag,
  } = useListingStore();
  const {selectedTags, tagClick} = useTagStore();
  const [showWithTax, setShowWithTax] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD'); // null = use original currency
  const [loading, setLoading] = useState(true);
  const {currUser, checkCurrUser} = useUserStore();
  const {getAllListings} = useListingApi();
  const [bookmarkedListings, setBookmarkedListings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const {showErrorMessage} = React.useContext(FlashMessageContext);

  // Track if we're showing search results
  const [isSearchResults, setIsSearchResults] = useState(false);
  // store the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedListings, setPaginatedListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const initializePage = async () => {
      if (!currUser) {
        await checkCurrUser();
      }
      await getAllListings(setLoading);
      if (currUser) {
        try {
          const response = await fetchBookmarks();
          if (response.success && response.data.bookmarks) {
            setBookmarkedListings(response.data.bookmarks.map(bookmark => bookmark._id));
          }
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
        }
      }

      // Check if coming from search
      if (location.state?.fromSearch) {
        setIsSearchResults(true);
        // Don't update navigation state to avoid infinite loops
      }
    };

    initializePage();
  }, [currUser, location.state]);

  // Update pagination when listings or page changes
  useEffect(() => {
    if (filterListings && filterListings.length > 0) {
      // Calculate total pages
      const calculatedTotalPages = Math.ceil(filterListings.length /
          LISTINGS_PER_PAGE);
      setTotalPages(calculatedTotalPages);

      // Reset to page 1 if current page is out of bounds after filter change
      if (currentPage > calculatedTotalPages) {
        setCurrentPage(1);
      }

      // Get listings for current page
      const startIndex = (currentPage - 1) * LISTINGS_PER_PAGE;
      const endIndex = startIndex + LISTINGS_PER_PAGE;
      setPaginatedListings(filterListings.slice(startIndex, endIndex));
    } else {
      setPaginatedListings([]);
      setTotalPages(1);
    }
  }, [filterListings, currentPage]);

  //remove bookmarks when user logout
  useEffect(() => {
    if (!currUser) {
      setBookmarkedListings([]);
    }
  }, [currUser]);

  const handleTagClick = async (tag) => {
    setIsSearchResults(false); // Reset search results state
    await tagClick(tag);
    filterListingsOnTag();
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle bookmark toggle with optimistic UI update
  const handleToggleBookmark = async (listingId, newBookmarkStatus) => {
    if (!currUser) {
      showErrorMessage('Please log in to bookmark listings');
      navigate('/login');
      return;
    }

    // Optimistically update UI
    if (newBookmarkStatus) {
      setBookmarkedListings(prev => [...prev, listingId]);
    } else {
      setBookmarkedListings(prev => prev.filter(id => id !== listingId));
    }

    // Make API call in the background
    try {
      const response = await toggleBookmark(listingId, !newBookmarkStatus);

      // If API call failed, revert the UI change
      if (!response.success) {
        // Revert the optimistic update
        if (newBookmarkStatus) {
          setBookmarkedListings(prev => prev.filter(id => id !== listingId));
        } else {
          setBookmarkedListings(prev => [...prev, listingId]);
        }

        // Show error message only for actual error conditions, not for "already bookmarked" case
        if (!response.message?.includes('already bookmarked')) {
          showErrorMessage(response.message || 'Failed to update bookmark');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert the optimistic update
      if (newBookmarkStatus) {
        setBookmarkedListings(prev => prev.filter(id => id !== listingId));
      } else {
        setBookmarkedListings(prev => [...prev, listingId]);
      }
      showErrorMessage('Failed to update bookmark status');
    }
  };

  if (loading) {
    return (<div className="flex justify-center items-center h-1/2">
      <ScaleLoader color="#000000" loading={loading} size={15}/>
    </div>);
  }

  if (!loading && allListings?.length === 0) {
    return (<div className="flex justify-center items-center h-1/2">
      <p>No listings found. Please try refreshing the page.</p>
    </div>);
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
      {paginatedListings.map((listing) => (<ListingCard
          key={listing._id}
          listing={listing}
          showWithTax={showWithTax}
          displayCurrency={displayCurrency}
          isBookmarked={bookmarkedListings.includes(listing._id)}
          onToggleBookmark={handleToggleBookmark}
      />))}
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

export default Listings;
