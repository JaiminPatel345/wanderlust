import axiosInstance from '../api/axiosInstance';

/**
 * Fetch user's bookmarks
 * @returns {Promise<Object>} - Promise that resolves to an object with bookmarks and success status
 */
export const fetchBookmarks = async () => {
  try {
    const response = await axiosInstance.get('/bookmarks');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch bookmarks');
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

    return response.data.bookmarks.some(bookmark => bookmark._id === listingId);
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
    return await axiosInstance.post(`/bookmarks/${listingId}`);
  } catch (error) {
    console.log("Error adding bookmark", error);
    throw new Error('Failed to add bookmark');
  }
};

/**
 * Remove a listing from bookmarks
 * @param {string} listingId - ID of the listing to remove from bookmarks
 * @returns {Promise<Object>} - Response with success status and message
 */
export const removeBookmark = async (listingId) => {
  try {
    return await axiosInstance.delete(`/bookmarks/${listingId}`);
  } catch (error) {
    console.log("Error adding bookmark", error);
    throw new Error('Failed to remove bookmark');
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
        success: response.data.success,
        isBookmarked: !response.data.success ? isCurrentlyBookmarked : false,
        message: response.data.message,
      };
    } else {
      response = await addBookmark(listingId);
      return {
        success: response.data.success,
        isBookmarked: response.data.success ? true : isCurrentlyBookmarked,
        message: response.data.message,
        
      };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return {
      success: false,
      isBookmarked: isCurrentlyBookmarked,
      message: error.message || 'Failed to update bookmark status',
    };
  }
}; 