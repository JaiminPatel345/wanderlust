import { get, post, del } from './api';

/**
 * Fetch user's bookmarks
 * @returns {Promise<Object>} - Promise that resolves to an object with bookmarks and success status
 */
export const fetchBookmarks = async () => {
  try {
    const response = await get('/bookmarks');
    return {
      success: response.success,
      bookmarks: response.bookmarks || [],
      message: response.message
    };
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return {
      success: false,
      bookmarks: [],
      message: error.message || 'Failed to fetch bookmarks'
    };
  }
};

/**
 * Check if a listing is bookmarked
 * @param {string} listingId - ID of the listing to check
 * @returns {Promise<boolean>} - Whether the listing is bookmarked
 */
export const isListingBookmarked = async (listingId) => {
  try {
    const response = await fetchBookmarks();
    if (!response.success) return false;
    
    return response.bookmarks.some(bookmark => bookmark._id === listingId);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

/**
 * Add a listing to bookmarks
 * @param {string} listingId - ID of the listing to bookmark
 * @returns {Promise<Object>} - Response with success status and message
 */
export const addBookmark = async (listingId) => {
  try {
    const response = await post(`/bookmarks/${listingId}`, {});
    return {
      success: response.success,
      message: response.message || 'Bookmark added successfully'
    };
  } catch (error) {
    const message = error.message || 'Failed to add bookmark';
    console.error('Error adding bookmark:', message);
    return {
      success: false,
      message: message
    };
  }
};

/**
 * Remove a listing from bookmarks
 * @param {string} listingId - ID of the listing to remove from bookmarks
 * @returns {Promise<Object>} - Response with success status and message
 */
export const removeBookmark = async (listingId) => {
  try {
    const response = await del(`/bookmarks/${listingId}`);
    return {
      success: response.success,
      message: response.message || 'Bookmark removed successfully'
    };
  } catch (error) {
    const message = error.message || 'Failed to remove bookmark';
    console.error('Error removing bookmark:', message);
    return {
      success: false,
      message: message
    };
  }
};

/**
 * Toggle bookmark status for a listing
 * @param {string} listingId - ID of the listing
 * @param {boolean} isCurrentlyBookmarked - Current bookmark status
 * @returns {Promise<Object>} - Response with success status, new bookmark state, and message
 */
export const toggleBookmark = async (listingId, isCurrentlyBookmarked) => {
  try {
    let response;
    
    if (isCurrentlyBookmarked) {
      response = await removeBookmark(listingId);
      return {
        success: response.success,
        isBookmarked: !response.success ? isCurrentlyBookmarked : false,
        message: response.message
      };
    } else {
      response = await addBookmark(listingId);
      return {
        success: response.success,
        isBookmarked: response.success ? true : isCurrentlyBookmarked,
        message: response.message
      };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return {
      success: false,
      isBookmarked: isCurrentlyBookmarked,
      message: error.message || 'Failed to update bookmark status'
    };
  }
}; 