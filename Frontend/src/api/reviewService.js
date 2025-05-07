import axiosInstance from './axiosInstance';

/**
 * Create a review for a listing
 * @param {string} listingId - Listing ID
 * @param {Object} reviewData - Review data
 * @returns {Promise} Response data
 */
export const createReview = async (listingId, reviewData) => {
  try {
    const response = await axiosInstance.post(`/listings/${listingId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Delete a review
 * @param {string} listingId - Listing ID
 * @param {string} reviewId - Review ID
 * @returns {Promise} Response data
 */
export const deleteReview = async (listingId, reviewId) => {
  try {
    const response = await axiosInstance.delete(`/listings/${listingId}/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 