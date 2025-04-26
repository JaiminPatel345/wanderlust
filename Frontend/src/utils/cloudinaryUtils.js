import { get } from './api';

/**
 * Get Cloudinary upload signature from backend
 * @returns {Promise<Object>} - The signature data
 */
export const getCloudinarySignature = async (type) => {
    try {
        const response = await get(`/cloudinary-signature?type=${type}`);
        return response.data;
    } catch (error) {
        console.error('Error getting Cloudinary signature:', error);
        throw error;
    }
};

/**
 * Upload an image to Cloudinary using pre-signed credentials
 * @param {File} file - The file to upload
 * @param {Object} signatureData - The signature data from backend
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadToCloudinary = async (file, signatureData) => {
    if (!file || !signatureData) {
        throw new Error('File and signature data are required for upload');
    }
    
    console.log('Uploading to Cloudinary');
    
    const formData = new FormData();
    
    // Add file to be uploaded
    formData.append('file', file);
    
    // Add required parameters for signature verification
    formData.append('api_key', signatureData.api_key);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    
    // Add other parameters that were included in the signature
    if (signatureData.public_id) {
        formData.append('public_id', signatureData.public_id);
    }
    
    if (signatureData.folder) {
        formData.append('folder', signatureData.folder);
    }
    
    if (signatureData.overwrite !== undefined) {
        formData.append('overwrite', signatureData.overwrite);
    }
    
    try {
        const cloudName = signatureData.cloud_name;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        // Use fetch instead of XMLHttpRequest
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed with status:', response.status);
            console.error('Response:', errorText);
            throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Upload successful:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} - Validation result with status and message
 */
export const validateImageFile = (file, maxSizeInMB = 5) => {
    if (!file) {
        return { valid: false, message: 'No file selected' };
    }
    
    if (!file.type.match('image.*')) {
        return { valid: false, message: 'Please select an image file' };
    }
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        return { 
            valid: false, 
            message: `Image size should not exceed ${maxSizeInMB}MB` 
        };
    }
    
    return { valid: true };
}; 