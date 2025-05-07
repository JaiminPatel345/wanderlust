import axiosInstance from './axiosInstance';

/**
 * Get user profile
 * @returns {Promise} Response data
 */
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} Response data
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Update user name
 * @param {string} name - New name
 * @returns {Promise} Response data
 */
export const updateUserName = async (name) => {
  try {
    const response = await axiosInstance.put('/profile/name', { name });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Response data
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axiosInstance.post('/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};
