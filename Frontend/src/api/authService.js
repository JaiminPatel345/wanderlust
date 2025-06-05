import axiosInstance from './axiosInstance';
import {
  getUserData,
  isLoggedIn,
  setToken,
  setUserData,
} from '../utils/tokenUtils.js';
import useNotificationStore from '../store/notificationStore';

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Response data
 */
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', {email, password});
    if (response.data.success) {
      setToken(response.data.data.token);
      setUserData(response.data.data.user);
      
      // Initialize notifications after successful login
      const initializeNotifications = useNotificationStore.getState().initializeNotifications;
      await initializeNotifications(true);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Register a new user
 * @param {Object} userData
 * @returns {Promise} Response data
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/signup', userData);
    if (response.data.success) {
      setToken(response.data.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Logout user
 * @returns {Promise} Response data
 */
export const logout = async () => {
  try {
    await axiosInstance.post('/logout');
    return {success: true};
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise} Response data
 */
export const checkAuth = async () => {
  if (isLoggedIn()) {
    return {
      success: true, data: {
        user: getUserData(),
      },
    };
  } else {
    return {success: false};
  }
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise} Response data
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/otp/verify', {email, otp});
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Network error'};
  }
};

/**
 * Forgot password request
 * @param {string} email
 * @returns {Promise} Response data
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/forgot-password', {email});
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Network error'};
  }
};

/**
 * Reset password with token
 * @param {string} token
 * @param {string} password
 * @returns {Promise} Response data
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post('/reset-password',
        {token, password},
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Network error'};
  }
};
