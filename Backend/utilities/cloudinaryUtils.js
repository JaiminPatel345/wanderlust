const crypto = require('crypto');
require('dotenv').config();

/**
 * Generates a signature for Cloudinary upload based on params and API secret
 * @param {Object} params - Parameters to include in the signature
 * @returns {Object} - The generated signature data
 */
const generateSignature = (params = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Create the string to sign
  const paramsToSign = { timestamp, ...params };
  
  // Sort the parameters alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .reduce((acc, key) => {
      // Skip api_key and cloud_name as they are not used in signature
      if (key !== 'api_key' && key !== 'cloud_name') {
        acc[key] = paramsToSign[key];
      }
      return acc;
    }, {});
  
  // Create the string to sign in format 'key=value&key2=value2...'
  const stringToSign = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  console.log('String to sign:', stringToSign);
  
  // Generate the signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(stringToSign + process.env.CLOUD_API_SECRET)
    .digest('hex');
  
  console.log('Generated signature:', signature);
  
  // Return signature and related data
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUD_API_KEY,
    cloud_name: process.env.CLOUD_NAME,
    ...params
  };
};

module.exports = {
  generateSignature
}; 