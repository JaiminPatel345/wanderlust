/**
 * Fetches location details from coordinates using OpenStreetMap Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Location details including city and country
 */
export const getLocationDetails = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (!data.address) {
      throw new Error('No address found for the selected location');
    }

    const newAddress = {
      city: data.address.state_district || data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.hamlet || '',
      country: data.address.country || '',
      fullAddress: data.display_name
    };

    return newAddress;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw new Error('Failed to get location details');
  }
};

/**
 * Fetches location suggestions based on search query
 * @param {string} query - Search query string
 * @returns {Promise<Array>} Array of location suggestions
 */
export const getLocationSuggestions = async (query) => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
    );
    const data = await response.json();

    return data.map(item => ({
      ...item,
      formatted_address: `${item.display_name.split(',').slice(0, 3).join(', ')}`
    }));
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    throw new Error('Failed to fetch location suggestions');
  }
};

/**
 * Gets the current position of the user
 * @returns {Promise<{latitude: number, longitude: number}>} User's current position
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  });
};
