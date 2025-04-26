import React, { useState, useEffect, useContext } from "react";
import { IconX } from "@tabler/icons-react";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { FlashMessageContext } from "../../../utils/flashMessageContext.jsx";
import useUserStore from "../../../store/userStore.js";
import { useDebounce } from "../../../hooks/useDebounce.js";
import PropTypes from "prop-types";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordShow, setIsPasswordShow] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);
  const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);
  const { changePassword } = useUserStore();
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSubmitting(false);
      setIsPasswordShow({ current: false, new: false, confirm: false });
    }
  }, [isOpen]);
  
  // Check password requirements whenever password changes
  useEffect(() => {
    setPasswordValidation({
      minLength: newPassword.length >= 6,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword)
    });
  }, [newPassword]);

  // Check if all password requirements are met
  const allRequirementsMet = 
    passwordValidation.minLength && 
    passwordValidation.hasLetter && 
    passwordValidation.hasNumber;
  
  // Animation class for validation items
  const getAnimationClass = (isValid) => {
    return isValid 
      ? "transform scale-100 opacity-100 transition-all duration-300" 
      : "transform scale-95 opacity-80 transition-all duration-300";
  };

  const togglePasswordVisibility = (field) => {
    setIsPasswordShow(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      showErrorMessage("Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      showErrorMessage("Please enter your new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showErrorMessage("Passwords do not match");
      return;
    }
    
    if (!allRequirementsMet) {
      showErrorMessage("New password doesn't meet the requirements");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        showSuccessMessage("Password changed successfully");
        onClose();
      } else {
        showErrorMessage(result.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <IconX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={isPasswordShow.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility("current")}
              >
                {isPasswordShow.current ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={isPasswordShow.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={() => setIsNewPasswordFocused(false)}
                className={`w-full px-3 py-2 border pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  allRequirementsMet && newPassword.length > 0
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility("new")}
              >
                {isPasswordShow.new ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            
            {/* Password requirements */}
            {(isNewPasswordFocused || newPassword) && (
              <div className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2 transition-all duration-300 ease-in-out">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Password requirements:</h3>
                <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.minLength)}`}>
                  {passwordValidation.minLength ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                  <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                    At least 6 characters
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.hasLetter)}`}>
                  {passwordValidation.hasLetter ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                  <span className={`text-sm ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-600'}`}>
                    At least one letter
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.hasNumber)}`}>
                  {passwordValidation.hasNumber ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                  <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                    At least one number
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={isPasswordShow.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  confirmPassword && newPassword === confirmPassword
                    ? "border-green-500"
                    : confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                }`}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {isPasswordShow.confirm ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {debouncedConfirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !allRequirementsMet || newPassword !== confirmPassword || !currentPassword}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving
                </span>
              ) : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ChangePasswordModal; 