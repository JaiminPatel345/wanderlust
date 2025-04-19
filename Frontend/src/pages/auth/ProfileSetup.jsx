import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import useUserStore from "../../../Store/userStore";
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
    const { showSuccessMessage, showErrorMessage, clearFlashMessage } = useContext(FlashMessageContext);
    
    useEffect(() => {
        // If the user already has a profile photo, redirect to home
        if (currUser?.profilePhoto) {
            navigate("/");
        }
        
        // If not logged in, redirect to login
        if (!currUser) {
            navigate("/login");
        }
    }, [currUser, navigate]);
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const validation = validateImageFile(file);
        if (!validation.valid) {
            showErrorMessage(validation.message);
            return;
        }
        
        setSelectedFile(file);
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
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
            const signatureData = await getCloudinarySignature();
            
            if (!signatureData || !signatureData.cloud_name || !signatureData.api_key) {
                console.error("Invalid signature data received:", signatureData);
                throw new Error("Failed to get proper upload credentials");
            }
            
            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(selectedFile, signatureData);
            
            if (!imageUrl) {
                throw new Error("No image URL returned from upload");
            }
            
            // Update user profile with the uploaded image URL using Zustand store
            const result = await updatePhoto(imageUrl);
            
            if (!result.success) {
                throw new Error(result.error || "Failed to update profile photo");
            }
            
            showSuccessMessage("Profile photo uploaded successfully!");
            
            // Redirect to home page
            setTimeout(() => {
                navigate("/");
            }, 1000);
            
        } catch (error) {
            console.error("Profile photo upload error:", error);
            // Provide a more specific error message based on where the failure occurred
            let errorMessage = "Failed to set profile photo";
            
            if (error.message?.includes("upload credentials")) {
                errorMessage = "Server configuration error. Please try again later.";
            } else if (error.message?.includes("parse")) {
                errorMessage = "Communication error with image server. Please try again.";
            } else if (error.message?.includes("404")) {
                errorMessage = "API endpoint not found. Backend service may be unavailable.";
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