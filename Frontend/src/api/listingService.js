import axiosInstance from './axiosInstance';

/**
 * Get all listings
 * @returns {Promise} Response data
 */
export const getAllListings = async () => {
  try {
    const response = await axiosInstance.get('/listings');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Get a specific listing by ID
 * @param {string} id - Listing ID
 * @returns {Promise} Response data
 */
export const getListingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Create a new listing
 * @param {Object} listingData - Listing data
 * @returns {Promise} Response data
 */
export const createListing = async (listingData) => {
  try {
    const response = await axiosInstance.post('/listings', listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unknown error' };
  }
};

/**
 * Update an existing listing
 * @param {string} id - Listing ID
 * @param {Object} listingData - Updated listing data
 * @returns {Promise} Response data
 */
export const updateListing = async (id, listingData) => {
  try {
    const response = await axiosInstance.put(`/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Delete a listing
 * @param {string} id - Listing ID
 * @returns {Promise} Response data
 */
export const deleteListing = async (id) => {
  try {
    const response = await axiosInstance.delete(`/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Search listings
 * @param {Object} params - Search parameters
 * @returns {Promise} Response data
 */
export const searchListings = async (params) => {
  try {
    const response = await axiosInstance.get('/listings/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 