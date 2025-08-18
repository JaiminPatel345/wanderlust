// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Save the authentication token to local storage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    console.warn('Attempted to save empty token');
  }
};

/**
 * Get the authentication token from local storage
 * @returns {string|null} The stored token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Save user data to local storage
 * @param {Object} userData - User data object
 */
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }
};

/**
 * Get user data from local storage
 * @returns {Object|null} The stored user data or null if not found
 */
export const getUserData = () => {
  let data = localStorage.getItem(USER_KEY);
  if (!data) {
    return null;
  }
  data = JSON.parse(data);
  if(data.expDate && new Date(data.expDate) < new Date()) {
    // If the user data has expired, remove it
    removeUserData();
    return null;
  }
  return data;
};

/**
 * Remove user data from local storage
 */
export const removeUserData = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is logged in
 * @returns {boolean} True if token exists
 */
export const isLoggedIn = () => {
  return !!getToken();
};

/**
 * Clear all auth related data
 */
export const clearAuthData = () => {
  removeToken();
  removeUserData();
}; 