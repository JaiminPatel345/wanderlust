const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Handles an API response, checking for errors
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Promise that resolves to response data or rejects with error
 */
export const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Format of the error response: { success: false, message: string }
    const errorMessage = data.message || 'An unknown error occurred';
    throw new Error(errorMessage);
  }
  
  return data;
};

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Promise that resolves to response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default options with credentials included
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request payload
 * @returns {Promise<any>} - Promise that resolves to response data
 */
export const post = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Promise that resolves to response data
 */
export const get = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET'
  });
};

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request payload
 * @returns {Promise<any>} - Promise that resolves to response data
 */
export const put = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Promise that resolves to response data
 */
export const del = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE'
  });
}; 