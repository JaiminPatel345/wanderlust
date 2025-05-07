import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import useUserStore from "../../store/userStore";
import { FlashMessageContext } from "../../utils/flashMessageContext";
import { getCloudinarySignature, uploadToCloudinary, validateImageFile } from "../../utils/cloudinaryUtils";
import { IconCamera, IconUpload, IconCheck } from "@tabler/icons-react";

const ProfileSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    
    const { currUser, updatePhoto } = useUserStore();
    const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);
    
    useEffect(() => {
        if (currUser?.profilePhoto) {
            navigate("/");
        }
        
        if (!currUser) {
            navigate("/login");
        }
    }, [currUser, navigate]);
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            validateImageFile(file);
            setSelectedFile(file);
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showErrorMessage(error.message || "Invalid image file. Please select a valid image.");
        }
    };
    
    const handleSkip = () => {
        navigate("/");
    };
    
    const handleUpload = async () => {
        if (!selectedFile) {
            showErrorMessage("Please select an image first");
            return;
        }
        
        setUploadingImage(true);
        
        try {
            // Get upload signature from backend
            const signatureData = await getCloudinarySignature('profile');
            
            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(selectedFile, signatureData);
            
            // Update user profile with the uploaded image URL
            const result = await updatePhoto(imageUrl);
            
            if (!result.success) {
                throw new Error(result.error || "Failed to update profile photo");
            }
            
            showSuccessMessage("Profile photo uploaded successfully!");
            setTimeout(() => navigate("/"), 1000);
            
        } catch (error) {
            let errorMessage = "Failed to set profile photo. Please try again.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            showErrorMessage(errorMessage);
        } finally {
            setUploadingImage(false);
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                    Set Up Your Profile
                </h2>
                
                <p className="text-center text-gray-600 mb-8">
                    Add a profile photo so other users can recognize you
                </p>
                
                <div className="flex flex-col items-center">
                    <div 
                        className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center mb-6 overflow-hidden relative"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {imagePreview ? (
                            <img 
                                src={imagePreview} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <IconCamera size={48} className="text-gray-400" />
                        )}
                        
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
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
                        className="mb-4 py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out flex items-center"
                    >
                        <IconUpload size={20} className="mr-2" />
                        Select Photo
                    </button>
                    
                    <div className="flex gap-4 w-full mt-4">
                        <button
                            onClick={handleSkip}
                            className="w-1/2 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-300 ease-in-out"
                            disabled={uploadingImage}
                        >
                            Skip for Now
                        </button>
                        
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadingImage}
                            className="w-1/2 py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out flex items-center justify-center"
                        >
                            {uploadingImage ? (
                                <BeatLoader size={8} color="white" />
                            ) : (
                                <>
                                    <IconCheck size={20} className="mr-2" />
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

export default ProfileSetup; 