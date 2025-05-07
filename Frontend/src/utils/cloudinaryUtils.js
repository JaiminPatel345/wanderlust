import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

/**
 * Get Cloudinary upload signature from backend
 * @returns {Promise<Object>} - The signature data
 */
export const getCloudinarySignature = async (type = 'profile') => {
    try {
        const response = await axiosInstance.get(`/cloudinary-signature?type=${type}`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get Cloudinary signature');
    }
};

/**
 * Upload an image to Cloudinary using pre-signed credentials
 * @param {File} file - The file to upload
 * @param {Object} signatureData - The signature data from backend
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadToCloudinary = async (file, signatureData) => {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.api_key);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);
        formData.append('public_id', signatureData.public_id);
        formData.append('folder', signatureData.folder);
        formData.append('overwrite', 'true');

        // Upload to Cloudinary
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.secure_url;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload image to Cloudinary');
    }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
export const validateImageFile = (file) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        throw new Error('Image size should be less than 5MB');
    }

    return true;
}; 