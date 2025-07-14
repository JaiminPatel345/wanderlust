import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconBookmarkOff } from '@tabler/icons-react';
import useUserStore from '../store/userStore';
import ListingCard from '../components/ui/listing/ListingCard.jsx';
import { fetchBookmarks, removeBookmark } from '../utils/bookmarkUtils';
import { FlashMessageContext } from '../utils/flashMessageContext';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { currUser } = useUserStore();
  const { showSuccessMessage, showErrorMessage } = React.useContext(FlashMessageContext);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!currUser) {
      navigate('/login');
    }
  }, [currUser, navigate]);
  

  // Fetch bookmarks
  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await fetchBookmarks();
      setBookmarks(response.data.bookmarks);
      setFilteredBookmarks(response.data.bookmarks);
    } catch (error) {
      showErrorMessage('Failed to fetch bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currUser) {
      loadBookmarks();
    }
  }, [currUser]);

  // Filter bookmarks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookmarks(bookmarks);
      return;
    }

    const filtered = bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bookmark.country && bookmark.country.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredBookmarks(filtered);
  }, [searchQuery, bookmarks]);

  // Handle bookmark removal
  const handleRemoveBookmark = async (listingId) => {
    try {
      await removeBookmark(listingId);
      setBookmarks((prevBookmarks) => 
        prevBookmarks.filter((bookmark) => bookmark._id !== listingId)
      );
      setFilteredBookmarks((prevFiltered) => 
        prevFiltered.filter((bookmark) => bookmark._id !== listingId)
      );
      showSuccessMessage('Bookmark removed successfully');
    } catch (error) {
      showErrorMessage('Failed to remove bookmark');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Bookmarks</h1>
      
      {/* Search bar */}
      {/*<div className="mb-8 max-w-md">*/}
      {/*  <div className="relative">*/}
      {/*    <input*/}
      {/*      type="text"*/}
      {/*      placeholder="Search your bookmarks..."*/}
      {/*      value={searchQuery}*/}
      {/*      onChange={(e) => setSearchQuery(e.target.value)}*/}
      {/*      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"*/}
      {/*    />*/}
      {/*    <IconSearch*/}
      {/*      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"*/}
      {/*      size={20}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBookmarks.map((listing) => (
            <ListingCard 
              key={listing._id} 
              listing={listing} 
              isBookmarked={true}
              onToggleBookmark={() => handleRemoveBookmark(listing._id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <IconBookmarkOff size={64} className="text-gray-300 mb-4" />
          {bookmarks.length > 0 ? (
            <p className="text-gray-500 text-lg">No bookmarks match your search.</p>
          ) : (
            <>
              <p className="text-gray-500 text-lg">You haven&apos;t saved any bookmarks yet.</p>
              <p className="text-gray-400 mt-2">
                Browse listings and click the bookmark icon to save them here.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookmarks; 