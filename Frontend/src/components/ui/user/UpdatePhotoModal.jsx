/* eslint-disable react/prop-types */
import React, { useState, useRef, useContext } from 'react';
import { FlashMessageContext } from '../../../utils/flashMessageContext.jsx';
import { getCloudinarySignature, uploadToCloudinary, validateImageFile } from '../../../utils/cloudinaryUtils.js';
import { BeatLoader } from 'react-spinners';
import { IconX, IconCamera, IconUpload, IconCheck } from '@tabler/icons-react';
import useUserStore from '../../../store/userStore.js';

const UpdatePhotoModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    
    const { currUser, updatePhoto } = useUserStore();
    const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            validateImageFile(file);
            setSelectedFile(file);
            
            // Reset previous preview
            setImagePreview(null);
            
            // Create new preview
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showErrorMessage(error.message || "Invalid image file. Please select a valid image.");
            // Reset file input and preview on error
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setImagePreview(null);
            setSelectedFile(null);
        }
    };
    
    const handleUpload = async () => {
        if (!selectedFile) {
            showErrorMessage("Please select an image first");
            return;
        }
        
        setLoading(true);
        
        try {
            // Get upload signature from backend
            const signatureData = await getCloudinarySignature('profile');
            if (!signatureData || !signatureData.cloud_name || !signatureData.api_key) {
                throw new Error('Failed to get upload credentials. Please try again.');
            }
            
            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(selectedFile, signatureData);
            if (!imageUrl) {
                throw new Error('Failed to upload image. Please try again.');
            }
            
            // Update user profile with the uploaded image URL using Zustand store
            const result = await updatePhoto(imageUrl);
            
            if (result.success) {
                showSuccessMessage("Profile photo updated successfully!");
                onClose();
            } else {
                throw new Error(result.error || "Failed to update profile photo. Please try again.");
            }
        } catch (error) {
            let errorMessage = "Failed to update profile photo. Please try again.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            showErrorMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium">Update Profile Photo</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <IconX size={20} />
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="flex flex-col items-center mb-4">
                        <div 
                            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden relative cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt="Profile preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : currUser?.profilePhoto ? (
                                <img 
                                    src={currUser.profilePhoto} 
                                    alt={currUser.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <IconCamera size={36} className="text-gray-400" />
                            )}
                            
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <IconCamera size={24} className="text-white" />
                            </div>
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out flex items-center"
                        >
                            <IconUpload size={18} className="mr-2" />
                            Select New Photo
                        </button>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                        >
                            {loading ? (
                                <BeatLoader size={8} color="white" />
                            ) : (
                                <>
                                    <IconCheck size={18} className="mr-2" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePhotoModal; 