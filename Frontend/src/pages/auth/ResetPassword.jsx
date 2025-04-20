import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FlashMessageContext } from "../../utils/flashMessageContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import {useDebounce} from '../../hooks/useDebounce.js';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);
  const navigate = useNavigate();
  const debounceConfirmPassword = useDebounce(confirmPassword, 500);
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false
  });

  useEffect(() => {
    // Get token from URL parameters
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      showErrorMessage("Invalid or missing reset token");
      navigate("/login");
    }
  }, [searchParams, navigate, showErrorMessage]);

  // Check password requirements whenever password changes
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 6,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    });
  }, [password]);

  const validatePassword = (password) => {
    // Check if all requirements are met
    return passwordValidation.minLength && 
           passwordValidation.hasLetter && 
           passwordValidation.hasNumber;
  };

  // Animation class for validation items
  const getAnimationClass = (isValid) => {
    return isValid 
      ? "transform scale-100 opacity-100 transition-all duration-300" 
      : "transform scale-95 opacity-80 transition-all duration-300";
  };

  // Check if all password requirements are met
  const allRequirementsMet = 
    passwordValidation.minLength && 
    passwordValidation.hasLetter && 
    passwordValidation.hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password || !confirmPassword) {
      showErrorMessage("Please enter your new password");
      return;
    }
    
    if (password !== confirmPassword) {
      showErrorMessage("Passwords do not match");
      return;
    }
    
    if (!validatePassword(password)) {
      showErrorMessage("Password should be at least 6 characters and contain both letters and numbers");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simply pass the token as-is from the URL to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reset-password`,
        { token, password },
        { withCredentials: true }
      );
      
      setResetSuccess(true);
      showSuccessMessage("Your password has been reset successfully");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      showErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Reset Your Password</h1>
          {!resetSuccess ? (
            <p className="mt-2 text-gray-600">
              Create a new password for your account
            </p>
          ) : (
            <p className="mt-2 text-green-600">
              Password updated successfully! Redirecting to login...
            </p>
          )}
        </div>

        {!resetSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={isPasswordShow ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="Enter new password"
                  className={`w-full px-3 py-2 mt-1 text-gray-700 border pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    allRequirementsMet && password.length > 0
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                  onClick={() => setIsPasswordShow(prev => !prev)}
                >
                  {isPasswordShow ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              
              {/* Password requirements */}
              {(isPasswordFocused || password) && (
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={isPasswordShow ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full px-3 py-2 mt-1 text-gray-700 border pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    confirmPassword && password === confirmPassword
                      ? "border-green-500"
                      : confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                  }`}
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                  onClick={() => setIsPasswordShow(prev => !prev)}
                >
                  {isPasswordShow ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {debounceConfirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !allRequirementsMet || password !== confirmPassword}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Reset Password"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-red-500 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="mt-4 text-gray-600">
              Redirecting you to the login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 